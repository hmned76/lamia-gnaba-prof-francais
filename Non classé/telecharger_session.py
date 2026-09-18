#!/usr/bin/env python3
"""
Ouvre la conversation Messenger pour récupérer les fichiers .docx.
Le profil Chrome de travail est CONSERVÉ : une seule connexion suffit.
"""

import re
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

# ===== Configuration =====
CONVERSATION_URL = "https://www.facebook.com/messages/e2ee/t/7687862431264458"
DEST_DIR = Path(r"D:\lamia_gnaba_prof_francais\Non classé\Sameh_Ben_Amor")
PROFIL = Path(r"C:\Users\Asus\AppData\Local\Temp\chrome_messenger_profil")
DELAI_CONNEXION_S = 30 * 60  # 30 minutes

DEST_DIR.mkdir(parents=True, exist_ok=True)
PROFIL.mkdir(parents=True, exist_ok=True)


def lancer_chrome():
    print("🌐 Lancement de Chrome...")
    o = Options()
    o.add_argument(f"--user-data-dir={PROFIL}")
    o.add_argument("--start-maximized")
    o.add_argument("--no-sandbox")
    o.add_argument("--disable-dev-shm-usage")
    o.add_argument("--no-first-run")
    o.add_argument("--no-default-browser-check")
    o.add_argument("--disable-blink-features=AutomationControlled")
    o.add_experimental_option("excludeSwitches", ["enable-automation"])
    o.add_experimental_option("useAutomationExtension", False)
    o.add_experimental_option("prefs", {
        "download.default_directory": str(DEST_DIR),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "profile.default_content_setting_values.automatic_downloads": 1,
    })
    d = webdriver.Chrome(service=Service(), options=o)
    d.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"},
    )
    return d


def est_connecte(d):
    try:
        return any(c.get("name") == "c_user" for c in d.get_cookies())
    except Exception:
        return False


def attendre_connexion(d):
    print("🔑 Vérification de la connexion Facebook...")
    d.get("https://www.facebook.com/")
    time.sleep(6)

    if est_connecte(d):
        print("   ✓ Déjà connecté (session conservée)")
        return True

    print()
    print("=" * 60)
    print("👉 CONNECTEZ-VOUS À FACEBOOK DANS LA FENÊTRE CHROME")
    print("=" * 60)
    print("   Vous ne le ferez qu'UNE SEULE FOIS :")
    print("   la session sera conservée pour les prochains lancements.")
    print(f"   Le script attendra jusqu'à {DELAI_CONNEXION_S // 60} minutes.")
    print()

    t0 = time.time()
    while time.time() - t0 < DELAI_CONNEXION_S:
        if est_connecte(d):
            print("   ✓ Connecté !")
            return True
        time.sleep(5)
        ecoule = int(time.time() - t0)
        if ecoule % 60 < 5:
            print(f"   ...attente {ecoule // 60} min")

    print("   ✗ Délai dépassé sans connexion")
    return False


def main():
    print("=" * 60)
    print("Messenger — récupération des fichiers .docx")
    print(f"Profil   : {PROFIL}")
    print(f"Dossier  : {DEST_DIR}")
    print("=" * 60)

    driver = None
    try:
        driver = lancer_chrome()

        if not attendre_connexion(driver):
            return

        print()
        print("💬 Ouverture de la conversation...")
        driver.get(CONVERSATION_URL)
        time.sleep(10)
        print(f"   URL: {driver.current_url}")

        print()
        print("📜 Chargement de l'historique (scroll vers le haut)...")
        for i in range(40):
            driver.execute_script(
                "const els=document.querySelectorAll('[role=\"main\"], .uiScrollableArea');"
                "for(const e of els){e.scrollTop = -e.scrollHeight;}"
            )
            time.sleep(2)
            if i % 10 == 0:
                n = len(driver.find_elements(By.CSS_SELECTOR, '[role="row"]'))
                print(f"   scroll {i} — {n} lignes")

        # Diagnostic
        html = driver.page_source
        diag = DEST_DIR / "_diagnostic.html"
        diag.write_text(html, encoding="utf-8")
        n_docx = len(re.findall(r"\.docx", html, re.I))
        n_rows = len(driver.find_elements(By.CSS_SELECTOR, '[role="row"]'))
        n_dl = len(driver.find_elements(By.CSS_SELECTOR, '[aria-label*="élécharg"]'))

        print()
        print("=" * 60)
        print("DIAGNOSTIC")
        print("=" * 60)
        print(f"  Messages chargés   : {n_rows}")
        print(f"  Mentions '.docx'   : {n_docx}")
        print(f"  Boutons 'Télécharger': {n_dl}")
        print(f"  HTML               : {diag}")
        print("=" * 60)

        # On garde la fenêtre ouverte quelques minutes pour inspection
        print()
        print("⏳ Fenêtre laissée ouverte 5 minutes pour analyse...")
        time.sleep(300)

    except Exception as e:
        print(f"\n✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()
            print("\n🚪 Fenêtre Chrome fermée")


if __name__ == "__main__":
    main()
