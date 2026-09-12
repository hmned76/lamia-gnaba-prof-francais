#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LamiAI Sync Server v1.0.20
Serveur local de synchronisation pour l'application LamiAI.
- Sert les documents LamiAI (CRUD) organisés par niveau/année
- Permet la synchronisation PC <-> APK (même Wi-Fi)
- Zéro dépendance externe (http.server + json)

Usage :
    python lami_sync_server.py            # écoute sur toutes les interfaces, port 8181
    python lami_sync_server.py --port 9000
"""
import os
import json
import time
import argparse
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

# Racine des données LamiAI (à côté de ce fichier)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "LamiAI-data")
DATA_FILE = os.path.join(DATA_DIR, "lamiai_docs.json")

DEFAULT_LEVELS = ["1ère Année", "2ème Année", "3ème Année Sciences", "3ème Année Lettres",
                  "4ème Année Sciences", "4ème Année Lettres", "Non classé"]


def ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    # Sous-dossiers par niveau
    for lvl in DEFAULT_LEVELS:
        os.makedirs(os.path.join(DATA_DIR, lvl), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        write_docs({"docs": [], "updatedAt": time.time()})


def read_docs():
    ensure_dirs()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"docs": [], "updatedAt": time.time()}


def write_docs(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_doc_file(level, doc_id, content_html, meta):
    """Sauvegarde aussi un fichier .html lisible dans LamiAI-data/<niveau>/"""
    safe_level = level
    folder = os.path.join(DATA_DIR, safe_level)
    os.makedirs(folder, exist_ok=True)
    safe_name = "".join(c if c.isalnum() or c in " -_()." else "_" for c in meta.get("name", "document"))
    path = os.path.join(folder, f"{doc_id}_{safe_name}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content_html)
    return path


def delete_doc_file(level, doc_id, name):
    safe_level = level
    folder = os.path.join(DATA_DIR, safe_level)
    safe_name = "".join(c if c.isalnum() or c in " -_()." else "_" for c in name)
    for suffix in [".html", ".json"]:
        p = os.path.join(folder, f"{doc_id}_{safe_name}{suffix}")
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass
    # nettoyage large : tout fichier commençant par doc_id_
    for fname in os.listdir(folder):
        if fname.startswith(doc_id + "_"):
            try:
                os.remove(os.path.join(folder, fname))
            except Exception:
                pass


class Handler(BaseHTTPRequestHandler):
    server_version = "LamiAI_Sync/1.0"

    def _send(self, status, data, ctype="application/json; charset=utf-8"):
        body = data.encode("utf-8") if isinstance(data, str) else json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return {}

    # ---------- Routes ----------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        if path == "" or path == "/":
            return self._send(200, {"status": "ok", "service": "LamiAI Sync", "version": "1.0.20"})
        if path == "/api/docs":
            data = read_docs()
            # compat: renvoyer aussi niveaux
            return self._send(200, data)
        if path == "/api/docs/levels":
            data = read_docs()
            return self._send(200, {"levels": DEFAULT_LEVELS, "docs": data.get("docs", [])})
        if path == "/api/ping":
            return self._send(200, {"status": "ok", "time": time.time()})
        self._send(404, {"error": "not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_body()
        if path == "/api/docs":
            doc = body.get("doc") or body
            if not doc.get("id"):
                doc["id"] = "lami-" + str(int(time.time() * 1000))
            if not doc.get("createdAt"):
                doc["createdAt"] = time.time()
            doc["updatedAt"] = time.time()
            data = read_docs()
            data["docs"].append(doc)
            data["updatedAt"] = time.time()
            write_docs(data)
            save_doc_file(doc.get("level", "Non classé"), doc["id"], doc.get("contentHtml", ""), doc)
            return self._send(200, {"status": "ok", "doc": doc})
        self._send(404, {"error": "not found"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        qs = parse_qs(parsed.query)
        body = self._read_body()
        if path.startswith("/api/docs/"):
            doc_id = unquote(path.split("/")[-1])
            data = read_docs()
            found = None
            for d in data["docs"]:
                if d.get("id") == doc_id:
                    found = d
                    break
            if found is None:
                return self._send(404, {"error": "doc not found"})
            for k, v in body.items():
                if k not in ("id", "createdAt"):
                    found[k] = v
            found["updatedAt"] = time.time()
            data["updatedAt"] = time.time()
            write_docs(data)
            old_level = found.get("_prevLevel", found.get("level", "Non classé"))
            save_doc_file(found.get("level", "Non classé"), doc_id, found.get("contentHtml", ""), found)
            delete_doc_file(old_level, doc_id, found.get("name", ""))
            return self._send(200, {"status": "ok", "doc": found})
        self._send(404, {"error": "not found"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        qs = parse_qs(parsed.query)
        if path.startswith("/api/docs/"):
            doc_id = unquote(path.split("/")[-1])
            data = read_docs()
            doc = None
            for d in data["docs"]:
                if str(d.get("id")) == str(doc_id) or d.get("name","").lower() == doc_id.lower():
                    doc = d
                    break
            if doc is not None:
                data["docs"] = [d for d in data["docs"] if str(d.get("id")) != str(doc_id)]
                data["updatedAt"] = time.time()
                write_docs(data)
                delete_doc_file(doc.get("level", "Non classé"), doc_id, doc.get("name", ""))
                return self._send(200, {"status": "ok", "deleted": doc_id})
            # Fallback: try to delete physical file from base (doc_gen / Non classé / etc.)
            # Search for file by id or name in known doc folders
            base_dirs = [os.path.join(BASE_DIR, d) for d in ["doc_gen", "Non classé", "1ère Année", "2ème Année", "3ème Année", "4ème Année", "LamiAI-data"]]
            deleted=False
            for root in base_dirs:
                if not os.path.exists(root):
                    continue
                for dirpath, _, files in os.walk(root):
                    for fname in files:
                        if fname.lower() == doc_id.lower() or doc_id.lower() in fname.lower():
                            try:
                                os.remove(os.path.join(dirpath, fname))
                                deleted=True
                            except Exception:
                                pass
            if deleted:
                return self._send(200, {"status": "ok", "deleted": doc_id, "physical": True})
            return self._send(404, {"error": "doc not found"})
        if path == "/api/file/delete":
            # ?name=... or ?id=...
            name = qs.get("name", [None])[0] or qs.get("id", [None])[0]
            if not name:
                body=self._read_body()
                name=body.get("name") or body.get("id")
            if not name:
                return self._send(400, {"error": "name required"})
            name=unquote(name)
            # Search and delete
            base_dirs = [os.path.join(BASE_DIR, d) for d in ["doc_gen", "Non classé", "1ère Année", "2ème Année", "3ème Année", "4ème Année", "LamiAI-data", "lami-app-static"]]
            deleted=False
            for root in base_dirs:
                if not os.path.exists(root):
                    continue
                for dirpath, _, files in os.walk(root):
                    for fname in files:
                        if fname.lower() == name.lower() or name.lower() in fname.lower():
                            try:
                                os.remove(os.path.join(dirpath, fname))
                                deleted=True
                            except Exception:
                                pass
            if deleted:
                return self._send(200, {"status": "ok", "deleted": name})
            return self._send(404, {"error": "file not found"})
        self._send(404, {"error": "not found"})

    def log_message(self, fmt, *args):
        sys.stderr.write("[LamiAI %s] %s\n" % (time.strftime("%H:%M:%S"), fmt % args))


def get_local_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def main():
    parser = argparse.ArgumentParser(description="LamiAI Sync Server")
    parser.add_argument("--port", type=int, default=8181)
    parser.add_argument("--host", default="0.0.0.0")
    args = parser.parse_args()
    ensure_dirs()
    print("=" * 50)
    print("LamiAI Sync Server v1.0.20 démarré")
    print("Dossier de données : %s" % DATA_DIR)
    print("IP locale (pour l'APK) : http://%s:%d" % (get_local_ip(), args.port))
    print("URL de test : http://127.0.0.1:%d/api/ping" % args.port)
    print("=" * 50)
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt.")
        server.server_close()


if __name__ == "__main__":
    main()
