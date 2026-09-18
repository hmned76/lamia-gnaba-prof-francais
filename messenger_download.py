#!/usr/bin/env python3
"""
Telechargeur de fichiers Messenger (Edge, profil neuf + connexion par QR).
Usage: python messenger_download.py
"""
import os, sys, re, time, requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options as EdgeOptions

DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "Downloads", "Messenger")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.isfile(EDGE):
    EDGE = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

def setup_driver():
    opts = EdgeOptions()
    if os.path.isfile(EDGE):
        opts.binary_location = EDGE
    opts.add_argument("--start-maximized")
    opts.add_experimental_option("prefs", {
        "download.default_directory": DOWNLOAD_DIR,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "profile.default_content_setting_values.automatic_downloads": 1,
    })
    return webdriver.Edge(options=opts)

def get_filename(resp, idx):
    cd = resp.headers.get("Content-Disposition", "")
    m = re.findall(r'filename\*?="?([^";\n]+)"?', cd)
    if m:
        name = m[0].strip()
        if name.startswith("UTF-8''"):
            name = name[7:]
        from urllib.parse import unquote
        return unquote(name)
    ct = resp.headers.get("Content-Type", "")
    ext = ".bin"
    if "pdf" in ct: ext = ".pdf"
    elif "docx" in ct or "wordprocessing" in ct: ext = ".docx"
    elif "xlsx" in ct: ext = ".xlsx"
    elif "png" in ct: ext = ".png"
    elif "jpeg" in ct or "jpg" in ct: ext = ".jpg"
    elif "zip" in ct: ext = ".zip"
    elif "text" in ct: ext = ".txt"
    return f"messenger_{idx}{ext}"

def main():
    print("=" * 52)
    print("  TELECHARGEUR DE FICHIERS MESSENGER (Edge)")
    print("=" * 52)
    print(f"Dossier des fichiers : {DOWNLOAD_DIR}\n")
    print("NOTE : ton Chrome reste ouvert tel quel, tout se passe dans Edge.\n")

    driver = setup_driver()
    driver.get("https://www.messenger.com")
    time.sleep(2)

    print("1/3 - CONNECTE-TOI :")
    print("    Scan le code QR avec ton telephone (ou email/mot de passe).")
    print("    ATTENTION : fais le directement dans la fenêtre Edge qui vient de s'ouvrir.")
    input("    >>> Appuie sur ENTRÉE quand tu es connecté...")

    print("\n2/3 - Ouvre la conversation qui contient les fichiers.")
    print("    Clique sur 'i' (Infos) en haut de la conversation, puis 'Fichiers'.")
    print("    Fais défiler jusqu'en bas pour que TOUS les fichiers s'affichent.")
    input("    >>> Appuie sur ENTRÉE quand tous les fichiers sont visibles...")

    print("\n3/3 - Récupération des fichiers...")
    cookies = driver.get_cookies()
    session = requests.Session()
    for c in cookies:
        session.cookies.set(c["name"], c["value"], domain=c.get("domain", ""))

    # 1) Liens "<a>" de fichiers
    hrefs = []
    try:
        hrefs = driver.execute_script("""
            var out = [];
            document.querySelectorAll('a[href]').forEach(function(a){
                var h = a.href || '';
                if (h.indexOf('messenger_media') !== -1 || h.indexOf('attachment_id') !== -1
                    || h.indexOf('/download') !== -1 || /fbcdn\\.net/.test(h)) out.push(h);
            });
            return out;
        """)
    except Exception:
        pass
    hrefs = list(dict.fromkeys(hrefs))

    # 2) Boutons de téléchargement -> clic direct (Edge télécharge tout seul dans le dossier)
    buttons = []
    try:
        buttons = driver.find_elements(By.CSS_SELECTOR,
            '[aria-label*="Download" i], [aria-label*="élécharger" i], '
            '[aria-label*="download" i], [aria-label*="télécharger" i], '
            '[title*="Download" i], [title*="Télécharger" i]')
    except Exception:
        pass

    print(f"  {len(hrefs)} lien(s) fichier + {len(buttons)} bouton(s) trouvé(s).")

    ok = 0
    done = set()
    # Téléchargement via liens
    for i, url in enumerate(hrefs, 1):
        if url in done:
            continue
        done.add(url)
        try:
            r = session.get(url, allow_redirects=True, timeout=60)
            if r.status_code == 200 and len(r.content) > 200:
                fname = get_filename(r, i)
                fpath = os.path.join(DOWNLOAD_DIR, fname)
                with open(fpath, "wb") as f:
                    f.write(r.content)
                print(f"  OK  {fname} ({os.path.getsize(fpath)//1024} Ko)")
                ok += 1
            else:
                print(f"  --  HTTP {r.status_code} (lien ignoré)")
        except Exception as e:
            print(f"  --  Erreur: {e}")

    # Téléchargement via clics
    for b in buttons:
        try:
            driver.execute_script("arguments[0].click();", b)
            time.sleep(1.5)
        except Exception:
            pass

    # Compter les fichiers effectivement présents
    n = 0
    for f in os.listdir(DOWNLOAD_DIR):
        if os.path.isfile(os.path.join(DOWNLOAD_DIR, f)) and not f.lower().endswith(".crdownload"):
            n += 1
    print(f"\n{f'Résumé : {n} fichier(s) dans {DOWNLOAD_DIR}' if n else 'Aucun fichier téléchargé automatiquement.'}")

    if n == 0:
        print("\nOption manuelle : sur chaque fichier dans la fenêtre Edge,")
        print("clique sur la flèche de téléchargement (ou clic droit > Enregistrer sous).")
        print("Les fichiers iront dans le dossier Téléchargements.")

    driver.quit()
    print("\nFermeture d'Edge. Bonne journée !")

if __name__ == "__main__":
    main()