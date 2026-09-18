#!/usr/bin/env python3
"""
Télécharge uniquement les fichiers .docx d'une personne précise sur Messenger.
"""

import sys
import json
import uuid
import time
from pathlib import Path
from fbchat import Client
from fbchat.models import Attachment

# ===== Configuration =====
EMAIL = "lamiagnaba@gmail.com"
PASSWORD = "Lmg050677@"
PERSON_NAME = "Sameh Ben Amor"
DEST_DIR = Path(r"D:\lamia_gnaba_prof_francais\Non classé")
SESSION_FILE = "fb_session.json"
DEST_DIR.mkdir(parents=True, exist_ok=True)


def login(client):
    """Se connecte à Facebook (avec session sauvegardée si disponible)."""
    if Path(SESSION_FILE).exists():
        try:
            data = json.loads(Path(SESSION_FILE).read_text())
            client.set_session(data["email"], data["password"], data.get("cookies", {}))
            try:
                client.get_users([client.uid])
                print("✓ Session réutilisable")
                return True
            except:
                pass
        except Exception as e:
            print(f"⚠ Session invalide: {e}")

    print("🔑 Connexion Facebook...")
    client.login(EMAIL, PASSWORD)
    try:
        Path(SESSION_FILE).write_text(json.dumps({
            "email": EMAIL,
            "password": PASSWORD,
            "cookies": client.session.cookies.get_dict()
        }))
        print("✓ Session sauvegardée")
    except:
        pass
    return True


def safe_name(name):
    """Nom propre pour un dossier."""
    import re
    return re.sub(r'[<>:"/\\|?*]', '_', name)[:80]


def download_file(client, attachment, dest_folder):
    """Télécharge un fichier depuis un Attachment."""
    try:
        # Vérifier que l'attachement a une URL
        url = None
        if hasattr(attachment, 'url'):
            url = attachment.url
        elif hasattr(attachment, 'file_url'):
            url = attachment.file_url
        elif hasattr(attachment, 'href'):
            url = attachment.href

        if not url:
            print(f"  ⚠ Pas d'URL pour l'attachement")
            return False

        ts = int(time.time() * 1000)
        uid = uuid.uuid4().hex[:6]
        # Essayer d'obtenir le nom original
        original_name = getattr(attachment, 'name', None) or getattr(attachment, 'filename', None) or "document"
        fname = f"{ts}_{uid}_{original_name}.docx"
        fpath = dest_folder / fname

        if fpath.exists():
            return True

        resp = client.session.request("GET", url)
        if resp.status_code == 200:
            fpath.write_bytes(resp.content)
            print(f"  ✓ {fpath.name} ({len(resp.content)/1024:.1f} Ko)")
            return True
        else:
            print(f"  ✗ Erreur HTTP {resp.status_code}")
        return False
    except Exception as e:
        print(f"  ✗ Erreur téléchargement: {e}")
        return False


def main():
    print("=" * 60)
    print("Téléchargeur .docx — Messenger")
    print(f"Contact: {PERSON_NAME}")
    print(f"Dossier: {DEST_DIR}")
    print("=" * 60)

    # Connexion
    client = Client(EMAIL, PASSWORD)
    login(client)

    # Trouver le contact
    print("\nRecherche de '{}'...".format(PERSON_NAME))
    try:
        users = client.search_for_users(PERSON_NAME)
        if not users:
            print(f"✗ Aucun résultat pour '{PERSON_NAME}'")
            print("   Essayez le nom exact Facebook ou l'ID.")
            sys.exit(1)

        target = users[0]
        print(f"✓ {target.name}")
        print(f"  ID: {target.uid}")

        # Dossier de destination
        person_folder = DEST_DIR / safe_name(target.name) / "docx"
        person_folder.mkdir(parents=True, exist_ok=True)
        print(f"📁 Dossier: {person_folder}")

    except Exception as e:
        print(f"✗ Erreur: {e}")
        sys.exit(1)

    # Récupérer tous les messages
    print("\nChargement des messages...")
    all_msgs = []
    before = 0
    limit = 200
    count = 0

    while True:
        try:
            msgs = client.fetch_thread_messages(target.uid, before=before, limit=limit)
            if not msgs:
                break
            all_msgs.extend(msgs)
            count_old = len(all_msgs)
            if len(msgs) < limit:
                break
            before = msgs[-1].timestamp
            if count_old % 500 == 0:
                print(f"  {len(all_msgs)} messages...")
        except Exception as e:
            print(f"  ⚠ Erreur: {e}")
            break

    print(f"✓ Total: {len(all_msgs)} messages")

    # Télécharger les .docx
    print("\nTéléchargement des fichiers .docx...")
    file_count = 0
    errors = 0

    for msg in reversed(all_msgs):
        try:
            if not msg.attachments:
                continue

            for att in msg.attachments:
                # Filtrer pour ne garder que les types de fichiers
                if not isinstance(att, Attachment):
                    continue

                # Tenter d'obtenir le nom et filtre .docx
                name = getattr(att, 'name', None) or getattr(att, 'filename', None) or ""
                if not name.lower().endswith('.docx'):
                    continue

                if download_file(client, att, person_folder):
                    file_count += 1
                else:
                    errors += 1
        except Exception as e:
            errors += 1

    # Résultat
    print("\n" + "=" * 60)
    print("RÉSULTAT")
    print("=" * 60)
    print(f"✅ Fichiers .docx téléchargés: {file_count}")
    print(f"❌ Erreurs: {errors}")
    print(f"📁 Dossier: {person_folder}")

    if person_folder.exists():
        files = sorted(person_folder.iterdir())
        if files:
            print("\nFichiers:")
            for f in files:
                kb = f.stat().st_size / 1024
                print(f"  {f.name}  ({kb:.1f} Ko)")
        else:
            print("  (aucun fichier trouvé)")
    else:
        print("  (dossier inexistant)")

    print("\n✓ Terminé !")


if __name__ == "__main__":
    main()
