#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
serve_all.py — Serveur unique LamiAI + stockage OnlyOffice (v1.5.4)
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
import zlib

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
DOCS_JSON = os.path.join(BASE_DIR, "LamiAI-data", "lamiai_docs.json")

def _load_docs_json():
    try:
        with open(DOCS_JSON, 'r', encoding='utf-8') as f:
            d = json.load(f)
        return d if isinstance(d, list) else []
    except Exception:
        return []
def _save_docs_json(lst):
    os.makedirs(os.path.dirname(DOCS_JSON), exist_ok=True)
    with open(DOCS_JSON, 'w', encoding='utf-8') as f:
        json.dump(lst, f, ensure_ascii=False, indent=2)
def _fmt_size(n):
    if n < 1024: return str(n)+" o"
    if n < 1048576: return str(round(n/1024))+" KB"
    return str(round(n/1048576,1))+" MB"


def _fmt_date(ts):
    try:
        return time.strftime("%Y-%m-%d", time.localtime(ts))
    except Exception:
        return ""

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


def _norm_name(s):
    """Nom de dossier normalisé (lettres minuscules, accents retirés, espaces -> _)."""
    n = str(s or "").lower()
    for a, b in (("é","e"),("è","e"),("ê","e"),("ë","e"),("à","a"),("â","a"),
                 ("ô","o"),("î","i"),("ï","i"),("û","u"),("ù","u"),("ç","c")):
        n = n.replace(a, b)
    n = re.sub(r"[^a-z0-9]+", "_", n)
    return n.strip("_")


# Correspondance niveau affiché -> dossier réel de la bibliothèque sur disque
LEVEL_FOLDER = {
    "1ère Année": "1ère Année",
    "2ème Année": "2ème Année",
    "3ème Année": "3ème Année",
    "3ème Année Sciences": "3ème Année",
    "3ème Année Scientifique": "3ème Année",
    "3ème Année Lettres": "3ème Année",
    "Bac Scientifique": "4ème Année Sciences",
    "4ème Année Sciences": "4ème Année Sciences",
    "Bac Lettres": "4ème Année Lettres",
    "4ème Année Lettres": "4ème Année Lettres",
    "Non classé": "Non classé",
}

# Niveaux affichés dans l'app (ordre de la bibliothèque, dossiers réels scannés)
UI_LEVELS = ["1ère Année", "2ème Année", "3ème Année", "4ème Année Sciences", "4ème Année Lettres", "Non classé"]


def _real_level_dir(level):
    """Chemin du vrai dossier du niveau (là où la prof range ses documents).
    Retombe sur la bibliothèque interne (LamiAI-data) si aucun dossier réel ne matche."""
    name = LEVEL_FOLDER.get(level) or level
    p = os.path.join(BASE_DIR, name)
    if os.path.isdir(p):
        return p
    n = _norm_name(name)
    try:
        for d in os.listdir(BASE_DIR):
            full = os.path.join(BASE_DIR, d)
            if os.path.isdir(full) and _norm_name(d) == n:
                return full
    except Exception:
        pass
    return p


def _real_subdir(base, name):
    """Trouve le vrai sous-dossier (ex : 'controle' -> 'contrôle') s'il existe."""
    if not name:
        return None
    n = _norm_name(name)
    try:
        for d in os.listdir(base):
            full = os.path.join(base, d)
            if os.path.isdir(full) and _norm_name(d) == n:
                return d
    except Exception:
        pass
    return None


CAT_FOLDERS = {
    "cours": "cours", "cour": "cours", "lecons": "cours", "lecon": "cours", "lessons": "cours",
    "controle": "controle", "controle:": "controle", "control": "controle", "devoir": "controle", "evaluation": "evaluation",
    "evaluations": "evaluation", "devoirs": "controle",
    "exercice": "exercice", "exercices": "exercice", "exo": "exercice", "exos": "exercice",
    "fiche": "fiche", "fiches": "fiche",
    "synthese": "synthese", "synthèse": "synthese", "synthèses": "synthese", "resume": "synthese", "résumé": "synthese",
    "revision": "revision", "révision": "revision", "revisions": "revision", "révisions": "revision",
    "vocabulaire": "vocabulaire", "voc": "vocabulaire",
    "livre": "livre", "livres": "livre", "livre scolaire": "livre", "livres scolaires": "livre",
    "autre": "Autre", "divers": "Autre", "autres": "Autre",
}


def _cat_from_folder(name):
    """Catégorie d'app à partir d'un nom de sous-dossier réel (ex: 'Contrôle' -> 'controle')."""
    if not name:
        return None
    n = (_norm_name(name) or "").strip()
    if n in CAT_FOLDERS:
        return CAT_FOLDERS[n]
    # cas 'controles'/'contrôle' -> raccourcis tronqués
    for key, cat in CAT_FOLDERS.items():
        if n.startswith(key) and len(n) - len(key) <= 3:
            return cat
    return None


def _scan_signature():
    """Signature du contenu réel des fichiers (chemin, taille, mtime) pour savoir
    si un re-scan est nécessaire — récursive, donc un fichier ajouté n'importe où
    (ex : module/cours, module/documents/…) déclenche un re-scan."""
    parts = []
    for level in UI_LEVELS:
        base = _real_level_dir(level)
        try:
            if not os.path.isdir(base):
                continue
            for rdp, rdn, rfns in os.walk(base):
                rdn[:] = [d for d in rdn if not d.startswith("_")]
                for g in sorted(rfns):
                    if g.startswith("_"):
                        continue
                    gp = os.path.join(rdp, g)
                    try:
                        st = os.stat(gp)
                    except Exception:
                        continue
                    parts.append("%s:%d:%d" % (os.path.relpath(gp, BASE_DIR), st.st_size, int(st.st_mtime)))
        except Exception:
            pass
    return "||||".join(sorted(parts))


_SCAN_CACHE = {"sig": None, "docs": None, "ts": 0}
_LAST_SAVE = {"ts": 0, "key": "", "path": ""}


_DOC_EXTS = (".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".txt", ".csv", ".jpg", ".jpeg", ".png")


def _add_doc(docs, seen, full, level, mod, cat, sous=""):
    """Ajoute UN fichier réel à la bibliothèque (récursif, avec infos module/catégorie/sous-catégorie)."""
    try:
        f = os.path.basename(full)
        ext = os.path.splitext(f)[1].lower()
        if ext not in _DOC_EXTS or f.startswith("_"):
            return
        rel = os.path.relpath(full, BASE_DIR).replace(os.sep, "/")
        if rel in seen:
            return
        seen.add(rel)
        d = {
            "id": int("7" + str(zlib.crc32(rel.encode("utf-8")) % 99999999)) if rel else 0,
            "name": f, "type": ext[1:].upper(), "level": level, "mod": mod,
            "cat": cat, "date": _fmt_date(os.path.getmtime(full)),
            "size": _fmt_size(os.path.getsize(full)),
            "path": rel, "custom": False, "content": "",
        }
        if sous:
            d["sub"] = sous
        docs.append(d)
    except Exception:
        pass


def _scan_module_subfolder(docs, seen, full, level, mod, cat, sous_first=False):
    """Scan récursif d'un sous-dossier de module (catégorie connue, documents officiels
    ou dossier inconnu) — RIEN n'est ignoré : app = disque."""
    for rdp, rdn, rfns in os.walk(full):
        rdn[:] = [d for d in rdn if not d.startswith("_")]
        subrel = os.path.relpath(rdp, full)
        segs = [] if subrel == "." else re.split(r"[\\/]+", subrel)
        c, sous = cat, ""
        if cat == "cours":
            for s2 in segs:
                ns2 = _norm_name(s2) or s2.lower()
                if ns2 in ("lecture", "langue", "production"):
                    sous = ns2
                    break
        elif cat == "controle":
            if any("synthes" in (_norm_name(s2) or s2.lower()) for s2 in segs):
                c = "synthese"
        if sous_first and not sous:
            for s2 in segs:
                sous = _norm_name(s2) or s2.lower()
                break
        for g in sorted(rfns):
            _add_doc(docs, seen, os.path.join(rdp, g), level, mod, c, sous)


def _scan_library():
    """Scanne les VRAIS dossiers de la bibliothèque et produit la liste complète
    des documents (niveau, module, catégorie, nom fichier, chemin relatif)."""
    now = time.time()
    sig = _scan_signature()
    if _SCAN_CACHE["docs"] is not None and _SCAN_CACHE["sig"] == sig and now - _SCAN_CACHE["ts"] < 15:
        return _SCAN_CACHE["docs"]

    docs = []
    seen = set()
    seen_levels = set()
    # Niveaux affichés dans l'app (ordre de la bibliothèque) — chaque dossier réel n'est scanné qu'une fois
    for level in UI_LEVELS:
        real = LEVEL_FOLDER.get(level) or level
        key = _norm_name(os.path.basename(real)) or real
        if key in seen_levels:
            continue
        seen_levels.add(key)
        base = _real_level_dir(level)
        if not os.path.isdir(base):
            continue
        subdirs = []
        try:
            subdirs = [d for d in sorted(os.listdir(base)) if os.path.isdir(os.path.join(base, d))]
        except Exception:
            pass
        for sub in subdirs:
            sub_path = os.path.join(base, sub)
            cat = _cat_from_folder(sub)
            if cat:
                # <niveau>/<categorie>/... — scan RÉCURSIF (sous-dossiers inclus)
                for rdp, rdn, rfns in os.walk(sub_path):
                    rdn[:] = [d for d in rdn if not d.startswith("_")]
                    subrel = os.path.relpath(rdp, sub_path)
                    segs = [] if subrel == "." else re.split(r"[\\/]+", subrel)
                    c, sous = cat, ""
                    if cat == "cours":
                        for s2 in segs:
                            ns2 = _norm_name(s2) or s2.lower()
                            if ns2 in ("lecture", "langue", "production"):
                                sous = ns2
                                break
                    elif cat == "controle":
                        if any("synthes" in (_norm_name(s2) or s2.lower()) for s2 in segs):
                            c = "synthese"
                    for g in sorted(rfns):
                        _add_doc(docs, seen, os.path.join(rdp, g), level, "", c, sous)
            else:
                # <niveau>/<module>/... (module réel = sous-dossier non catégoriel)
                for f in sorted(os.listdir(sub_path)):
                    full = os.path.join(sub_path, f)
                    if os.path.isfile(full):
                        _add_doc(docs, seen, full, level, sub, "cours")
                        continue
                    c2 = _cat_from_folder(f)
                    if c2:
                        # sous-catégorie connue du module (cours/, devoirs/, …)
                        _scan_module_subfolder(docs, seen, full, level, sub, c2)
                    elif (_norm_name(f) or "").lower() in ("documents", "document"):
                        # documents officiels (répartition / planification) — étaient invisibles
                        for rdp, rdn, rfns in os.walk(full):
                            rdn[:] = [d for d in rdn if not d.startswith("_")]
                            subrel = os.path.relpath(rdp, full)
                            segs = [] if subrel == "." else re.split(r"[\\/]+", subrel)
                            kind = ""
                            for s2 in segs:
                                ns2 = _norm_name(s2) or s2.lower()
                                if "repartition" in ns2:
                                    kind = "repartition"; break
                                if "planification" in ns2 or "plandevoir" in ns2 or "plan" in ns2:
                                    kind = "planification"; break
                            for g in sorted(rfns):
                                _add_doc(docs, seen, os.path.join(rdp, g), level, sub, "documents", kind)
                    else:
                        # sous-dossier inconnu (ex : 3e_sciences, TRAVAIL ET BIEN ÊTRE…)
                        # → scanné quand même (app = disque) — c'était le défaut C1
                        _scan_module_subfolder(docs, seen, full, level, sub, "cours", sous_first=True)
        # fichiers directement à la racine du niveau
        for f in sorted(os.listdir(base)):
            full = os.path.join(base, f)
            if not os.path.isfile(full):
                continue
            _add_doc(docs, seen, full, level, "", "cours")
    _SCAN_CACHE["sig"] = sig
    _SCAN_CACHE["docs"] = docs
    _SCAN_CACHE["ts"] = now
    return docs


def _nz(s):
    """Normalisation pour comparaison : minuscule, seul l'alpha-numérique reste."""
    return re.sub(r"[^a-z0-9]", "", str(s or "").lower())


def _resolve_doc_file(level, cat, name):
    """Cherche sur le disque le VRAI fichier correspondant à un vieux document sans chemin.
    Parcourt TOUS les dossiers de la racine (pas seulement le dossier du niveau).
    Règle : correspondance EXACTE (insensible espaces/_/majuscules) d'abord, sinon préfixe (>= 8).
    Retourne le chemin relatif ('/'), ou "" si introuvable."""
    skip = {"lami-app-static", "__pycache__", "node_modules", ".git", "sync", "home", "config"}
    roots = []
    ldata = os.path.join(BASE_DIR, "LamiAI-data")
    try:
        for d in sorted(os.listdir(BASE_DIR)):
            full = os.path.join(BASE_DIR, d)
            if os.path.isdir(full) and d not in skip and full != ldata:
                roots.append(full)
    except Exception:
        pass
    try:
        base = _real_level_dir(level)
        if base and os.path.isdir(base) and base not in roots:
            roots.append(base)
    except Exception:
        pass
    if os.path.isdir(ldata):
        roots.append(ldata)
    if not roots:
        return ""
    target = _nz(os.path.splitext(name)[0])
    if len(target) < 4:
        return ""
    ext_doc = os.path.splitext(str(name or ""))[1].lower()
    ok_ext = (".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".pdf", ".txt", ".csv", ".jpg", ".jpeg", ".png")
    exact = []
    pref = []
    cat_nz = _nz(cat)
    for root in roots:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in ("oo_store",)]
            for f in filenames:
                stem, ext = os.path.splitext(f)
                if ext.lower() not in ok_ext:
                    continue
                cur = _nz(stem)
                if not cur:
                    continue
                rel = os.path.relpath(os.path.join(dirpath, f), BASE_DIR).replace(os.sep, "/")
                in_ldata = os.path.normpath(root) == os.path.normpath(ldata)
                if cur == target:
                    exact.append((rel, in_ldata))
                elif len(target) >= 8 and min(len(cur), len(target)) >= 8 and (cur.startswith(target) or target.startswith(cur)):
                    score = min(len(cur), len(target))
                    pref.append((score, rel, in_ldata, ext, dirpath, root))
    if exact:
        real = [r for r, inl in exact if not inl]
        if real:
            return real[0]
        return exact[0][0]
    if ext_doc:
        m = [x for x in pref if x[3].lower() == ext_doc]
        if m:
            pref = m
    pref.sort(key=lambda x: (-x[0], x[2]))
    best = ""
    for score, rel, inl, extp, dp, rt in pref:
        if cat_nz and cat_nz not in _nz(os.path.relpath(dp, rt)):
            continue
        best = rel
        if not inl:
            break
    if not best and pref:
        best = pref[0][1]
    return best if best else ""


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
    server_version = "LamiAI_serve/1.5.4"

    # ---------- Utilitaires ----------
    def _cors(self):
        origin = self.headers.get("Origin", "")
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
        else:
            self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_bytes(self, status, body, ctype="application/json; charset=utf-8", no_cache=False):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if no_cache:
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
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

    # ---------- DELETE ----------
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/file/delete"):
            try:
                qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
                relp = (qs.get("path") or "").lstrip("/")
                if not relp:
                    return self._send_json(400, {"error": "parametre path manquant"})
                base = os.path.realpath(BASE_DIR)
                full = os.path.realpath(os.path.join(base, relp.replace("/", os.sep)))
                if not full.startswith(base + os.sep) and full != base:
                    return self._send_json(403, {"error": "chemin refuse"})
                if os.path.isfile(full):
                    os.remove(full)
                    _SCAN_CACHE["docs"] = None
                    # retire l'entrée du registre si elle y est
                    docs_json = _load_docs_json()
                    n = len(docs_json)
                    docs_json = [d for d in docs_json if d.get("path") != relp]
                    if len(docs_json) != n:
                        _save_docs_json(docs_json)
                    return self._send_json(200, {"ok": True, "deleted": os.path.basename(full)})
                return self._send_json(404, {"error": "fichier introuvable"})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})
        return self._send_json(404, {"error": "inconnu"})

    # ---------- GET ----------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path.startswith("/oo/last-saved"):
            return self._send_json(200, {"ts": _LAST_SAVE.get("ts", 0), "path": _LAST_SAVE.get("path", "")})

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

        if path.startswith("/api/library"):
            # Liste complète des documents scannés depuis les VRAIS dossiers de la bibliothèque
            try:
                docs = _scan_library()
                return self._send_json(200, {"docs": docs})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        if path.startswith("/api/file"):
            # Sert le VRAI fichier depuis la bibliothèque (path relatif à BASE_DIR)
            qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
            relp = (qs.get("path") or "").lstrip("/")
            if not relp:
                return self._send_json(400, {"error": "parametre path manquant"})
            base = os.path.realpath(BASE_DIR)
            full = os.path.realpath(os.path.join(base, relp.replace("/", os.sep)))
            if not full.startswith(base + os.sep) and full != base:
                return self._send_json(403, {"error": "chemin refuse"})
            if os.path.isfile(full):
                ext = os.path.splitext(full)[1].lower()
                with open(full, "rb") as f:
                    data = f.read()
                return self._send_bytes(200, data, MIME.get(ext, "application/octet-stream"))
            return self._send_json(404, {"error": "fichier introuvable"})

        if path.startswith("/api/resolve"):
            # Retrouve le VRAI fichier sur le disque pour un vieux doc sans chemin (aucune copie)
            try:
                qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
                name = (qs.get("name") or "").strip()
                if not name:
                    return self._send_json(400, {"error": "parametre name manquant"})
                found = _resolve_doc_file(qs.get("level") or "", qs.get("cat") or "", name)
                return self._send_json(200, {"path": found, "name": os.path.basename(found) if found else ""})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

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
            is_html = ext in (".html", ".htm")
            return self._send_bytes(200, data, MIME.get(ext, "application/octet-stream"), no_cache=is_html)
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

                # Dossiers RÉELS : <dossier niveau>/<Nom module exact>/<type>/<activité>/
                to_rel = (qs.get("to") or "").strip()
                if to_rel:
                    base = os.path.realpath(BASE_DIR)
                    full = os.path.realpath(os.path.join(base, to_rel.lstrip("/")))
                    if not full.startswith(base + os.sep):
                        return self._send_json(400, {"error": "chemin invalide"})
                    os.makedirs(os.path.dirname(full) or base, exist_ok=True)
                    with open(full, "wb") as f:
                        f.write(body)
                    rel = os.path.relpath(full, BASE_DIR).replace(os.sep, "/")
                    _SCAN_CACHE["docs"] = None
                    return self._send_json(200, {"ok": True, "path": rel, "file": os.path.basename(full)})
                try:
                    lvl_folder = os.path.basename(_real_level_dir(level)) or (_fs_safe(level) or "Non classé")
                except Exception:
                    lvl_folder = _fs_safe(level) or "Non classé"
                parts = [lvl_folder]
                if module:
                    parts.append(module.replace("/", "-").strip() or "Module")
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

        if path.startswith("/oo/rename") and not path.startswith("/oo/rename_old"):
            # Renommer un fichier du projet immédiatement (doc/path ou travail archivé)
            try:
                qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
                old_rel = qs.get("from") or ""
                new_rel = qs.get("to") or ""
                if not old_rel or not new_rel:
                    return self._send_json(400, {"error": "from/to requis"})
                base = os.path.realpath(BASE_DIR)
                old_full = os.path.realpath(os.path.join(BASE_DIR, old_rel))
                new_full = os.path.realpath(os.path.join(BASE_DIR, new_rel))
                if not old_full.startswith(base + os.sep) or not new_full.startswith(base + os.sep):
                    return self._send_json(400, {"error": "chemin invalide"})
                if old_full == new_full:
                    return self._send_json(200, {"ok": True, "path": new_rel})
                if not os.path.isfile(old_full):
                    return self._send_json(404, {"error": "fichier source introuvable"})
                os.makedirs(os.path.dirname(new_full), exist_ok=True)
                if os.path.exists(new_full):
                    os.remove(new_full)
                os.rename(old_full, new_full)
                _SCAN_CACHE["docs"] = None
                sys.stderr.write("[LamiAI %s] Rename OK → %s\n" % (time.strftime("%H:%M:%S"), new_rel))
                return self._send_json(200, {"ok": True, "path": new_rel})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        if path.startswith("/oo/callback"):
            # Retour de sauvegarde du DocumentServer OnlyOffice
            cb_error = 0
            try:
                length = int(self.headers.get("Content-Length", 0) or 0)
                raw = self.rfile.read(length) if length else b"{}"
                body = json.loads(raw or b"{}")
                status = body.get("status", 0)
                key = body.get("key", "")
                url = body.get("url", "")
                sys.stderr.write("[LamiAI %s] Callback OO: status=%s key=%s url=%s\n" % (
                    time.strftime("%H:%M:%S"), status, key[:40], (url or "")[:80]))
                # status 2 = sauvegarde par l'utilisateur, 6 = sauvegarde + fermeture
                if status in (2, 6) and key and url:
                    binds = _load_binds()
                    b = binds.get(key, {})
                    archive = b.get("archive")
                    store = b.get("store")
                    old = b.get("old") or ""
                    target = archive or store
                    if target:
                        try:
                            # Télécharger le fichier édité depuis le DocumentServer
                            req = urllib.request.Request(url)
                            req.add_header("User-Agent", "LamiAI/1.5")
                            with urllib.request.urlopen(req, timeout=30) as resp:
                                data = resp.read()
                            if archive:
                                full = os.path.join(BASE_DIR, archive)
                                real = os.path.realpath(full)
                                if not real.startswith(os.path.realpath(BASE_DIR) + os.sep):
                                    full = os.path.join(OO_DIR, os.path.basename(store))
                            else:
                                # Pas d'archive : on met à jour le fichier du stockage /oo/<fname>
                                full = os.path.join(OO_DIR, os.path.basename(store))
                            os.makedirs(os.path.dirname(full), exist_ok=True)
                            with open(full, "wb") as f:
                                f.write(data)
                            # Renommage : si le fichier modifié a reçu un nouveau nom,
                            # l'ancien fichier est retiré pour éviter le doublon.
                            if old and old != (archive or ""):
                                old_full = os.path.realpath(os.path.join(BASE_DIR, old))
                                base_real = os.path.realpath(BASE_DIR)
                                if old_full.startswith(base_real + os.sep) and os.path.isfile(old_full):
                                    try:
                                        os.remove(old_full)
                                        sys.stderr.write("[LamiAI %s] Callback rename: ancien fichier supprimé → %s\n" % (time.strftime("%H:%M:%S"), old))
                                    except Exception as rexc:
                                        sys.stderr.write("[LamiAI %s] Callback rename: suppression ancien échouée (%s)\n" % (time.strftime("%H:%M:%S"), rexc))
                            _SCAN_CACHE["docs"] = None
                            _LAST_SAVE["ts"] = time.time()
                            _LAST_SAVE["key"] = key
                            _LAST_SAVE["path"] = os.path.relpath(full, BASE_DIR)
                            sys.stderr.write("[LamiAI %s] Callback save OK → %s (%d octets)\n" % (time.strftime("%H:%M:%S"), os.path.relpath(full, BASE_DIR), len(data)))
                        except Exception as exc:
                            sys.stderr.write("[LamiAI %s] Callback save FAILED (url=%s): %s\n" % (time.strftime("%H:%M:%S"), url[:80], exc))
                            cb_error = 1
                    else:
                        sys.stderr.write("[LamiAI %s] Callback: no archive/store bind for key=%s\n" % (time.strftime("%H:%M:%S"), key[:40]))
                        cb_error = 1
            except Exception as exc:
                sys.stderr.write("[LamiAI %s] Callback error: %s\n" % (time.strftime("%H:%M:%S"), exc))
                cb_error = 1
            return self._send_json(200, {"error": cb_error})

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
                    "old": body.get("old", ""),
                }
                _save_binds(binds)
                return self._send_json(200, {"ok": True})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})
        if path.startswith("/api/upload"):
            try:
                ct = self.headers.get("Content-Type", "")
                length = int(self.headers.get("Content-Length", 0) or 0)
                body = self.rfile.read(length) if length else b""
                qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
                level = qs.get("level") or "Non classé"
                module = qs.get("module") or ""
                cat = qs.get("cat") or "cours"
                sub = qs.get("sub") or ""
                bm = re.search(r'boundary=(.+?)(?:;|$)', ct)
                if not bm:
                    return self._send_json(400, {"error": "multipart boundary manquante"})
                boundary = bm.group(1).encode()
                field_file = None
                filename = ""
                for part in body.split(b"--" + boundary):
                    if b'Content-Disposition' not in part or b'filename="' not in part:
                        continue
                    he = part.find(b"\r\n\r\n")
                    if he < 0:
                        continue
                    m = re.search(r'filename="([^"]*)"', part[:he].decode("utf-8", errors="replace"))
                    if not m:
                        continue
                    filename = m.group(1)
                    data = part[he+4:]
                    if data.endswith(b"\r\n"): data = data[:-2]
                    if data.endswith(b"--"): data = data[:-2]
                    if data.endswith(b"\r\n"): data = data[:-2]
                    field_file = data
                if field_file is None or not filename:
                    return self._send_json(400, {"error": "fichier manquant"})
                ext = os.path.splitext(filename)[1].lower().lstrip(".") or "docx"
                chosen = (qs.get("name") or "").strip()
                base_src = os.path.splitext(filename)[0] or "document"
                displayed = chosen or base_src
                safe_name = _fs_safe(displayed) or "document"
                dest = _real_level_dir(level)
                if module:
                    dest = os.path.join(dest, _real_subdir(dest, module) or _fs_safe(module))
                if cat:
                    dest = os.path.join(dest, _real_subdir(dest, cat) or _fs_safe(cat))
                if sub:
                    dest = os.path.join(dest, _real_subdir(dest, sub) or _fs_safe(sub))
                os.makedirs(dest, exist_ok=True)
                full = os.path.join(dest, safe_name + "." + ext)
                i = 2
                while os.path.exists(full):
                    full = os.path.join(dest, "%s_%d.%s" % (safe_name, i, ext))
                    i += 1
                with open(full, "wb") as f: f.write(field_file)
                _SCAN_CACHE["docs"] = None
                doc_entry = {"id": int(time.time()*1000)%1000000000, "name": safe_name+"."+ext, "level": level, "mod": module, "cat": cat, "type": sub or cat, "size": _fmt_size(len(field_file)), "date": time.strftime("%Y-%m-%d"), "custom": True, "path": os.path.relpath(full, BASE_DIR).replace(os.sep, "/"), "content": ""}
                docs_json = _load_docs_json()
                docs_json.append(doc_entry)
                _save_docs_json(docs_json)
                return self._send_json(200, {"ok": True, "doc": doc_entry, "path": doc_entry["path"]})
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
    print(" LamiAI v1.5.4 — serveur local + stockage OnlyOffice")
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

