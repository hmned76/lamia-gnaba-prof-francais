#!/usr/bin/env python3
"""
Télécharge les fichiers .docx d'une conversation Messenger précise.
Utilise le profil Chrome existant (session Facebook déjà connectée).
"""

import os
import sys
import time
import re
import uuid
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# ===== Configuration =====
CONVERSATION_URL = "https://www.facebook.com/messages/e2ee/t/7687862431264458"
DEST_DIR = Path(r"D:\lamia_gnaba_prof_francais\Non classé")
PROFILE_CHROME = os.path.expandvars("%LOCALAPPDATA%\\Google\\Chrome\\User Data")
PROFILE_NAME = "Default"

# Créer le dossier destination
DEST_DIR.mkdir(parents=True, exist_ok=True)


def setup_chrome_existing_profile():
    """Configure Chrome pour utiliser le profil utilisateur existant (session déjà connectée)."""
    print(f"🔧 Utilisation du profil Chrome existant: {PROFILE_CHROME}\\{PROFILE_NAME}")
    
    options = Options()
    options.add_argument(f"--user-data-dir={PROFILE_CHROME}")
    options.add_argument(f"--profile-directory={PROFILE_NAME}")
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    
    # Éviter la détection automatisée
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    service = Service()
    driver = webdriver.Chrome(service=service, options=options)
    
    # Feinte : dire au JS que ce n'est pas un automate
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en'] });
        """
    })
    
    return driver


def safe_name(name):
    """Nom propre pour un dossier."""
    return re.sub(r'[<>:"/\\|?*]', '_', name)[:80]


def scroll_messages(driver, max_scrolls=50):
    """Scrolle la conversation pour charger tous les messages historiques."""
    print("📜 Scroll pour charger l'historique des messages...")
    
    last_height = driver.execute_script("return document.body.scrollHeight")
    scroll_count = 0
    
    while scroll_count < max_scrolls:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)  # Attendre le chargement par défilement
        
        new_height = driver.execute_script("return document.body.scrollHeight")
        
        if new_height == last_height:
            print(f"  → Fin du scroll (stable après {scroll_count} défilements)")
            break
        
        last_height = new_height
        scroll_count += 1
        print(f"  → Défilement #{scroll_count}, hauteur: {new_height}px")
    
    print(f"  ✓ Scroll terminé après {scroll_count} défilements")
    return True


def extract_docx_links(driver):
    """Extrait tous les liens de fichiers .docx dans la page."""
    print("📎 Extraction des liens .docx...")
    
    # Coder le XPath pour trouver les attachments de messages
    docx_links = []
    
    # Méthode 1 : Chercher tous les éléments avec des liens .docx
    try:
        # Trouver tous les éléments <a> avec href .docx
        anchors = driver.find_elements(By.XPATH, "//a[contains(@href, '.docx')]")
        print(f"  → {len(anchors)} liens .docx trouvés (balises <a>)")
        
        for anchor in anchors:
            href = anchor.get_attribute('href')
            if href and '.docx' in href.lower():
                docx_links.append(href)
    except Exception as e:
        print(f"  ⚠ Erreur méthode 1: {e}")
    
    # Méthode 2 : Chercher aussi dans les éléments de message
    if not docx_links:
        try:
            # Dans Messenger, les fichiers sont souvent dans des éléments avec data-testid="attachment"
            attachments = driver.find_elements(By.XPATH, 
                "//*[contains(@data-testid, 'attachment') or contains(@class, 'attachment')]")
            
            for att in attachments:
                # Chercher un lien .docx dans l'attachment
                links = att.find_elements(By.XPATH, ".//a[contains(@href, '.docx')]")
                for link in links:
                    href = link.get_attribute('href')
                    if href:
                        docx_links.append(href)
            
            if docx_links:
                print(f"  → {len(docx_links)} liens .docx trouvés (via attachments)")
        except Exception as e:
            print(f"  ⚠ Erreur méthode 2: {e}")
    
    # Méthode 3 : Chercher dans le DOM complet
    if not docx_links:
        try:
            page_source = driver.page_source
            # Regex pour trouver les URLs .docx
            urls = re.findall(r'https?://[^\s"\']+\.docx', page_source, re.IGNORECASE)
            docx_links = list(set(urls))
            print(f"  → {len(docx_links)} liens .docx trouvés (via regex dans le HTML)")
        except Exception as e:
            print(f"  ⚠ Erreur méthode 3: {e}")
    
    # Deduplication
    docx_links = list(dict.fromkeys(docx_links))
    
    if not docx_links:
        print("  ⚠ Aucun lien .docx trouvé — peut-être que la page n'a pas encore chargé tous les messages")
    
    return docx_links


def download_via_chrome(driver, url, dest_folder):
    """Télécharge un fichier .docx en utilisant le navigateur (plus fiable)."""
    try:
        filename_match = re.search(r'/([^/]+\.docx)$', url)
        if filename_match:
            filename = filename_match.group(1)
        else:
            filename = f"{uuid.uuid4().hex[:8]}.docx"
        
        # Nettoyer le nom
        filename = re.sub(r'[^\w\-_. ]', '_', filename)[:100]
        filepath = dest_folder / filename
        
        if filepath.exists():
            print(f"  ✓ Déjà téléchargé: {filename}")
            return True
        
        print(f"  ↓ {filename}")
        
        # Ouvrir le lien dans le navigateur pour déclencher le téléchargement
        driver.get(url)
        
        # Attendre que le téléchargement se Lance
        time.sleep(3)
        
        # Redonner la main à la page de conversation
        driver.get(CONVERSATION_URL)
        time.sleep(2)
        
        return True
        
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        return False


def main():
    print("=" * 60)
    print("Téléchargement .docx — Messenger")
    print(f"Conversation: {CONVERSATION_URL}")
    print(f"Dossier: {DEST_DIR}")
    print("=" * 60)
    
    driver = None
    try:
        # Setup Chrome avec profil existant
        driver = setup_chrome_existing_profile()
        
        # Aller directement à la conversation
        print(f"\n🌐 Navigation vers la conversation...")
        driver.get(CONVERSATION_URL)
        
        # Attendre le chargement de la conversation
        wait = WebDriverWait(driver, 20)
        
        try:
            # Attendre que la liste de messages soit présente
            wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 
                    '#messages, [data-testid="message-list"], .uiScrollableArea'))
            )
            print("  ✓ Conversation chargée")
        except TimeoutException:
            print("  ⚠ Délai d'attente dépassé pour le chargement")
            print(f"  URL actuelle: {driver.current_url}")
        
        # Attendre que les messages s'affichent
        time.sleep(5)
        
        # Scroll pour charger l'historique complet
        scroll_messages(driver)
        
        # Attendre un peu après le scroll
        time.sleep(3)
        
        # Extraire les liens .docx
        docx_links = extract_docx_links(driver)
        
        if not docx_links:
            print("\n⚠ Aucun fichier .docx trouvé.")
            print("   Suggestions:")
            print("   - Les fichiers .docx peuvent être dans des Messages non chargés (scroll insuffisant)")
            print("   - Certains fichiers peuvent être déjà supprimés")
            print("   - Les fichiers peuvent avoir une extension différente")
            return
        
        # Créer le dossier de destination
        person_folder = DEST_DIR / "Sameh_Ben_Amor" / "docx"
        person_folder.mkdir(parents=True, exist_ok=True)
        
        # Télécharger les fichiers
        print(f"\n📥 Téléchargement des {len(docx_links)} fichiers...")
        
        success_count = 0
        for i, url in enumerate(docx_links, 1):
            if download_via_chrome(driver, url, person_folder):
                success_count += 1
                print(f"  → {i}/{len(docx_links)} téléchargés")
        
        # Résultat
        print("\n" + "=" * 60)
        print("RÉSULTAT")
        print("=" * 60)
        print(f"✅ Fichiers téléchargés: {success_count}/{len(docx_links)}")
        print(f"📁 Dossier: {person_folder}")
        
        if person_folder.exists():
            files = sorted(person_folder.iterdir())
            if files:
                print("\nFichiers téléchargés:")
                for f in files:
                    kb = f.stat().st_size / 1024
                    print(f"  {f.name}  ({kb:.1f} Ko)")
            else:
                print("  (aucun fichier dans le dossier)")
        else:
            print("  (dossier inexistant)")
        
        print("\n✓ Terminé !")
        
    except Exception as e:
        print(f"\n✗ Erreur fatale: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()
            print("\n🚪 Navigateur fermé")


if __name__ == "__main__":
    main()
