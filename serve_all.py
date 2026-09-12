#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
serve_all.py — Serveur unique LamiAI + stockage OnlyOffice (v1.5.0)
=======================================================================
- Sert l'application (lami-app-static) sur http://localhost:8080
- Stocke les fichiers générés par l'app pour l'éditeur OnlyOffice :
      POST /oo/save?ext=docx&name=...  -> sauvegarde, renvoie {"url": ...}
      GET  /oo/<nom-fichier>           -> sert le fichier (pour DocumentServer)
      GET  /oo/list                    -> liste des fichiers stockés
      POST /oo/archive?...             -> archivage automatique dans
          <Niveau>/<Module>/<type>/<activite>  (noms codes 1e_..._crs_lec)
      POST /oo/callback                -> retour de sauvegarde OnlyOffice
- Zéro dépendance externe (http.server)

Usage :
    python serve_all.py             # http://localhost:8080
    python serve_all.py --port 8090
    python serve_all.py --host 0.0.0.0
"""
import os
import re
import sys
import time
import json
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote, parse_qs, quote
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, "lami-app-static")
OO_DIR = os.path.join(APP_DIR, "oo_store")

# ===== Archivage automatique (travaux Lamia) =====
# Convention :  <Niveau>/<Module>/<type>/<activité>/  + fichier
#               <codeNiveau>_<Module>_<codeType>_<codeActivite>.<ext>
LVL_CODE = {
    "1ère Année": "1e", "2ème Année": "2e",
    "3ème Année Lettres": "3eL", "3ème Année Sciences": "3eS",
    "4ème Année Lettres": "4eL", "4ème Année Sciences": "4eS",
    "Non classé": "nc",
}
TYPE_MAP = {
    "Cours": ("crs", "cours"),
    "Contrôle": ("ctr", "controle"),
    "Synthèse": ("syn", "synthese"),
    "Exercice": ("ex", "exercice"),
    "Fiche": ("fch", "fiche"),
    "Production écrite": ("pdt", "production"),
    "Production Ecrite": ("pdt", "production"),
    "Production": ("pdt", "production"),
    "Travail": ("trv", "travail"),
}
ACT_MAP = {
    "Lecture": ("lec", "lecture"),
    "Écriture": ("ecr", "ecriture"),
    "Ecriture": ("ecr", "ecriture"),
    "Langue": ("lnq", "langue"),
    "Étude de texte": ("edt", "etude_texte"),
    "Etude de texte": ("edt", "etude_texte"),
    "Vocabulaire": ("voc", "vocabulaire"),
    "Poésie": ("poe", "poesie"),
    "Poesie": ("poe", "poesie"),
    "Autre": ("div", "autre"),
}
ALLOWED_EXT = ("docx", "xlsx", "pptx", "pdf")

# ===== Bind pour callback OnlyOffice =====
BIND_PATH = os.path.join(OO_DIR, ".bind.json")

# ===== IA locale (Ollama) — gratuit, sans clé =====
OLLAMA_HOST = os.environ.get("LAMIAI_OLLAMA", "http://127.0.0.1:11434")
# Backend alternatif compatible OpenAI (LM Studio, Jan, LocalAI, llama.cpp-server…)
OPENAI_BASE = os.environ.get("LAMIAI_OPENAI_BASE", "").rstrip("/")
OPENAI_KEY = os.environ.get("LAMIAI_OPENAI_KEY", "")
AI_DEFAULT_MODEL = "qwen2.5:3b"
AI_SYSTEM_PROMPT = (
    "Tu es LamiAI, l'assistant pédagogique de la Professeure Lamia Gnaba, "
    "professeure de français en Tunisie (programme officiel : 1ère, 2ème, 3ème "
    "et 4ème année). Tu réponds toujours en français, avec un ton chaleureux, "
    "clair et professionnel de professeur expérimenté, en adaptant la difficulté "
    "et le vocabulaire au niveau de la classe indiqué dans le contexte. Tu peux : "
    "expliquer la grammaire, la conjugaison, l'orthographe et le vocabulaire ; "
    "aider à préparer des cours, contrôles, sujets d'examen, fiches et exercices ; "
    "proposer et corriger des sujets de rédaction et de dissertation ; expliquer "
    "des textes et œuvres du programme. Structure tes réponses (titres courts, "
    "listes), reste synthétique et donne toujours un exemple concret quand c'est "
    "utile. Sois précis et n'invente pas de faits."
)


def _ai_model():
    try:
        if os.environ.get("LAMIAI_MODEL"):
            return os.environ["LAMIAI_MODEL"]
        cfg = os.path.join(APP_DIR, "local-config.json")
        if os.path.isfile(cfg):
            with open(cfg, "r", encoding="utf-8") as f:
                d = json.load(f)
            if d.get("ollama_model"):
                return str(d["ollama_model"])
    except Exception:
        pass
    return AI_DEFAULT_MODEL


def _ollama_models():
    try:
        req = urllib.request.Request(OLLAMA_HOST + "/api/tags")
        with urllib.request.urlopen(req, timeout=3) as r:
            tags = json.loads(r.read().decode("utf-8"))
        return [m.get("name", "") for m in tags.get("models", []) if m.get("name")]
    except Exception:
        return []


def _ollama_chat(messages, model):
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": 0.6},
    }
    req = urllib.request.Request(
        OLLAMA_HOST + "/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode("utf-8"))


CONFIG_PATH = os.path.join(BASE_DIR, "config", "local-config.json")
# Certains fournisseurs (Groq, OpenRouter…) sont derriere Cloudflare : un User-Agent navigateur est requis
BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def _load_config():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            d = json.load(f)
        return d if isinstance(d, dict) else {}
    except Exception:
        return {}


def _configured_providers():
    """Fournisseurs cloud configures (compatibles OpenAI), dans l'ordre voulu."""
    cfg = _load_config()
    provs = []
    pc = cfg.get("providers") or {}
    order = cfg.get("provider_order") or list(pc.keys())
    for pid in order:
        p = pc.get(pid) or {}
        base = (p.get("base") or "").rstrip("/")
        key = p.get("key") or ""
        if base and key:
            provs.append({
                "id": pid,
                "label": p.get("label") or pid,
                "base": base,
                "key": key,
                "model": p.get("model") or "",
            })
    if OPENAI_BASE and OPENAI_KEY:
        provs.append({"id": "custom", "label": "Moteur personnalise", "base": OPENAI_BASE, "key": OPENAI_KEY, "model": ""})
    return provs


def _openai_models_base(base, key):
    try:
        req = urllib.request.Request(base + "/models")
        req.add_header("User-Agent", BROWSER_UA)
        if key:
            req.add_header("Authorization", "Bearer " + key)
        with urllib.request.urlopen(req, timeout=6) as r:
            data = json.loads(r.read().decode("utf-8"))
        return [m.get("id", "") for m in data.get("data", []) if m.get("id")]
    except Exception:
        return []


def _openai_chat_base(base, key, messages, model):
    payload = {"model": model, "messages": messages, "temperature": 0.6, "stream": False}
    req = urllib.request.Request(
        base + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": BROWSER_UA},
    )
    if key:
        req.add_header("Authorization", "Bearer " + key)
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read().decode("utf-8"))
    try:
        return ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    except Exception:
        return ""


def _provider_catalog():
    """Liste des moteurs disponibles : {id,label,models,online} (cloud configures + Ollama)."""
    catalog = []
    om = _ollama_models()
    catalog.append({"id": "ollama", "label": "Ollama (local, hors-ligne)", "models": om, "online": bool(om)})
    bad = ("whisper", "tts", "orpheus", "prompt-guard", "embed", "moderation", "rerank",
           "safeguard", "image", "veo", "lyria", "audio", "transcribe", "robotics",
           "computer-use", "deep-research", "nano-banana", "aqa", "antigravity", "-live")
    for p in _configured_providers():
        api_models = _openai_models_base(p["base"], p["key"])
        chat = [m for m in api_models if not any(b in m.lower() for b in bad)]
        pref = p.get("model")
        if pref:
            chat = [pref] + [m for m in chat if m != pref]
        catalog.append({"id": p["id"], "label": p["label"], "models": chat, "online": bool(api_models)})
    return catalog


def _load_binds():
    try:
        with open(BIND_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def _save_binds(binds):
    os.makedirs(OO_DIR, exist_ok=True)
    with open(BIND_PATH, 'w', encoding='utf-8') as f:
        json.dump(binds, f, ensure_ascii=False, indent=2)


def _fs_safe(s):
    s = str(s or "").strip()
    for ch in '<>:"/\\|?*':
        s = s.replace(ch, "_")
    s = re.sub(r"[\x00-\x1f]", "", s)
    s = re.sub(r"\s+", "_", s).strip("._ ")
    return s[:80]


def _code3(s):
    n = re.sub(r"[\s_']+", "", str(s or "").lower())
    n = re.sub(r"[^a-z0-9]", "", n)
    return n[:3] or "docs"

MIME = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".xls": "application/vnd.ms-excel",
    ".ppt": "application/vnd.ms-powerpoint",
    ".txt": "text/plain; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
}


class Handler(BaseHTTPRequestHandler):
    server_version = "LamiAI_serve/1.5.0"

    # ---------- Utilitaires ----------
    def _cors(self):
        # Autoriser uniquement l'origine de l'application (localhost)
        origin = self.headers.get("Origin", "")
        if origin in ("http://localhost:8080", "http://127.0.0.1:8080", ""):
            self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_bytes(self, status, body, ctype="application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        try:
            self.wfile.write(body)
        except Exception:
            pass

    def _send_json(self, status, obj):
        self._send_bytes(status, json.dumps(obj, ensure_ascii=False).encode("utf-8"))

    # ---------- OPTIONS ----------
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    # ---------- GET ----------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path.startswith("/oo/list"):
            files = []
            try:
                for f in sorted(os.listdir(OO_DIR)):
                    full = os.path.join(OO_DIR, f)
                    if os.path.isfile(full):
                        files.append({"name": f, "size": os.path.getsize(full), "url": "/oo/" + f})
            except Exception:
                pass
            return self._send_json(200, {"files": files})

        if path.startswith("/oo/"):
            name = os.path.basename(path[len("/oo/"):])
            full = os.path.join(OO_DIR, name)
            if name and os.path.isfile(full):
                ext = os.path.splitext(name)[1].lower()
                with open(full, "rb") as f:
                    data = f.read()
                return self._send_bytes(200, data, MIME.get(ext, "application/octet-stream"))
            return self._send_json(404, {"error": "fichier introuvable"})

        if path.startswith("/oo"):
            return self._send_json(200, {"ok": True, "service": "stockage OnlyOffice"})

        if path.startswith("/ai/status"):
            catalog = _provider_catalog()
            available = any(c["online"] and c["models"] for c in catalog)
            return self._send_json(200, {"available": available, "backend": "ollama", "model": _ai_model(), "providers": catalog})

        # Application statique
        rel = path.lstrip("/")
        if rel == "" or rel.endswith("/"):
            rel = rel + "index.html"
        full = os.path.join(APP_DIR, rel.replace("/", os.sep))
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if os.path.isfile(full):
            ext = os.path.splitext(full)[1].lower()
            with open(full, "rb") as f:
                data = f.read()
            return self._send_bytes(200, data, MIME.get(ext, "application/octet-stream"))
        return self._send_bytes(404, "404 not found".encode("utf-8"), "text/plain; charset=utf-8")

    # ---------- POST ----------
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/oo/save"):
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                body = self.rfile.read(length) if length else b""
                qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
                ext = (qs.get("ext") or "docx").lower().lstrip(".")
                name = (qs.get("name") or ("document." + ext)).strip()
                safe = "".join(c if c.isalnum() or c in "-_()." else "_" for c in os.path.basename(name))
                if not safe.lower().endswith("." + ext):
                    safe = safe + "." + ext
                fname = str(int(time.time())) + "_" + safe
                os.makedirs(OO_DIR, exist_ok=True)
                with open(os.path.join(OO_DIR, fname), "wb") as f:
                    f.write(body)
                # 127.0.0.1 (IPv4) : le DocumentServer peut mal résoudre "localhost" en IPv6 (::1)
                url = "http://127.0.0.1:%d/oo/%s" % (self.server.server_port, fname)
                return self._send_json(200, {"ok": True, "url": url, "name": fname})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        if path.startswith("/oo/archive"):
            # Archivage automatique : range le fichier dans <Niveau>/<Module>/<type>/<activité>/
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                body = self.rfile.read(length) if length else b""
                if not body:
                    return self._send_json(400, {"error": "corps vide"})
                qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
                level = qs.get("level") or "Non classé"
                module = qs.get("module") or ""
                tp = qs.get("type") or "Travail"
                act = qs.get("activity") or ""
                ext = (qs.get("ext") or "docx").lower().lstrip(".")
                if ext not in ALLOWED_EXT:
                    ext = "docx"

                lvl_code = LVL_CODE.get(level, "nc")
                by_type = TYPE_MAP.get(tp)
                t_code = by_type[0] if by_type else _code3(tp)
                t_folder = by_type[1] if by_type else "documents"
                a_code, a_folder = None, None
                if act:
                    by_act = ACT_MAP.get(act)
                    if by_act:
                        a_code, a_folder = by_act
                    else:
                        a_code = _code3(act)
                        a_folder = _fs_safe(act).lower() or None

                parts = [_fs_safe(level) or "Non classé"]
                if module:
                    parts.append(_fs_safe(module))
                parts.append(t_folder)
                if a_folder:
                    parts.append(a_folder)
                dest = os.path.join(BASE_DIR, *parts)
                os.makedirs(dest, exist_ok=True)

                name_parts = [lvl_code]
                if module:
                    name_parts.append(_fs_safe(module))
                name_parts.append(t_code)
                if a_code:
                    name_parts.append(a_code)
                base = "_".join(p for p in name_parts if p) or ("document_" + str(int(time.time())))
                full = os.path.join(dest, base + "." + ext)
                i = 2
                while os.path.exists(full):
                    full = os.path.join(dest, "%s_%d.%s" % (base, i, ext))
                    i += 1
                with open(full, "wb") as f:
                    f.write(body)
                rel = os.path.relpath(full, BASE_DIR).replace(os.sep, "/")
                return self._send_json(200, {"ok": True, "path": rel, "file": os.path.basename(full)})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        if path.startswith("/oo/callback"):
            # Retour de sauvegarde du DocumentServer OnlyOffice
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                raw = self.rfile.read(length) if length else b"{}"
                body = json.loads(raw or b"{}")
                status = body.get("status", 0)
                key = body.get("key", "")
                url = body.get("url", "")
                # status 2 = sauvegarde par l'utilisateur, 6 = sauvegarde + fermeture
                if status in (2, 6) and key and url:
                    binds = _load_binds()
                    b = binds.get(key, {})
                    archive = b.get("archive")
                    if archive:
                        try:
                            # L'URL peut contenir des caractères accentués (nom du fichier archivé)
                            data = urllib.request.urlopen(quote(url, safe=":/?&=#-_.~%"), timeout=30).read()
                            full = os.path.join(BASE_DIR, archive)
                            os.makedirs(os.path.dirname(full), exist_ok=True)
                            with open(full, "wb") as f:
                                f.write(data)
                            sys.stderr.write("[LamiAI %s] Callback save OK → %s (%d octets)\n" % (time.strftime("%H:%M:%S"), archive, len(data)))
                        except Exception as exc:
                            sys.stderr.write("[LamiAI %s] Callback save error: %s\n" % (time.strftime("%H:%M:%S"), exc))
            except Exception:
                pass
            return self._send_json(200, {"error": 0})

        if path.startswith("/oo/bind"):
            # Lier une clé OnlyOffice à un chemin d'archivage (pour callback)
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                raw = self.rfile.read(length) if length else b"{}"
                body = json.loads(raw or b"{}")
                key = body.get("key", "")
                if not key:
                    return self._send_json(400, {"error": "missing key"})
                binds = _load_binds()
                binds[key] = {
                    "store": body.get("store", ""),
                    "archive": body.get("archive", ""),
                }
                _save_binds(binds)
                return self._send_json(200, {"ok": True})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})
        if path.startswith("/ai/chat"):
            # Assistant pédagogique : choisit le moteur (Groq/Gemini/OpenRouter...) puis Ollama en secours
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                raw = self.rfile.read(length) if length else b"{}"
                body = json.loads(raw or b"{}")
                msg = (body.get("message") or "").strip()
                if not msg:
                    return self._send_json(400, {"ok": False, "error": "message vide"})
                provider = (body.get("provider") or "").strip()
                req_model = (body.get("model") or "").strip()
                context = (body.get("context") or "").strip()
                user_msg = msg
                if context:
                    user_msg = "[Contexte : %s]\n%s" % (context, msg)
                messages = [{"role": "system", "content": AI_SYSTEM_PROMPT}]
                for h in (body.get("history") or [])[-8:]:
                    if isinstance(h, dict) and h.get("content"):
                        messages.append({
                            "role": "user" if h.get("role") in (None, "user") else "assistant",
                            "content": str(h["content"])[:2000],
                        })
                messages.append({"role": "user", "content": user_msg[:4000]})
                reply = ""
                used_model = req_model
                used_provider = provider
                if provider and provider != "ollama":
                    pcfg = None
                    for p in _configured_providers():
                        if p["id"] == provider:
                            pcfg = p
                            break
                    if pcfg:
                        mdl = req_model or pcfg.get("model") or ""
                        try:
                            reply = _openai_chat_base(pcfg["base"], pcfg["key"], messages, mdl)
                            used_model = mdl
                        except Exception as exc:
                            sys.stderr.write("[LamiAI %s] provider %s error: %s\n" % (time.strftime("%H:%M:%S"), provider, exc))
                            reply = ""
                if not reply:
                    om = _ollama_models()
                    if om:
                        mdl = req_model if req_model in om else _ai_model()
                        if mdl not in om:
                            b = mdl.split(":")[0]
                            cand = [x for x in om if x.startswith(b + ":")]
                            mdl = cand[0] if cand else om[0]
                        out = _ollama_chat(messages, mdl)
                        reply = (out.get("message") or {}).get("content") or ""
                        used_provider = "ollama"
                        used_model = mdl
                if not reply:
                    return self._send_json(502, {"ok": False, "error": "aucun moteur n'a pu répondre"})
                return self._send_json(200, {"ok": True, "reply": reply, "model": used_model, "provider": used_provider})
            except Exception as e:
                return self._send_json(500, {"ok": False, "error": str(e)})

        return self._send_json(404, {"error": "not found"})

    def log_message(self, fmt, *args):
        sys.stderr.write("[LamiAI %s] %s\n" % (time.strftime("%H:%M:%S"), fmt % args))


def main():
    ap = argparse.ArgumentParser(description="LamiAI : application + stockage OnlyOffice")
    ap.add_argument("--port", type=int, default=8080)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    os.makedirs(OO_DIR, exist_ok=True)
    print("=" * 56)
    print(" LamiAI v1.5.0 — serveur local + stockage OnlyOffice")
    print(" Application : http://localhost:%d" % args.port)
    print(" Stockage OO : http://localhost:%d/oo/list" % args.port)
    print(" Archive     : http://localhost:%d/oo/archive" % args.port)
    print(" IA locale   : %s/api/tags (Ollama)" % OLLAMA_HOST)
    print("=" * 56)
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt.")
        server.server_close()


if __name__ == "__main__":
    main()
