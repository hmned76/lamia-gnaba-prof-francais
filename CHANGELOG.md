
## v1.6.8 - 2026-09-24
- Correctif OnlyOffice : CSP autorise le DocumentServer (port 80) quand l'app est ouverte via l'adresse LAN 192.168.100.29 (logiciel Windows PC2 + autres appareils WiFi).
# Historique des versions — LamiAI

## v1.6.7 / v1.6.6 — 19 Septembre 2026 (relevé de notes sync)
- **📊 Le relevé est synchronisé avec l'emploi** : les classes viennent automatiquement de l'emploi du temps (vérifié en direct : « 3e Sc 1, 3e Sc 2, Bac Let 2, Bac Sc 2 » issus du téléphone)
- **Élèves + notes + année ajoutés à l'état sync** (eleves/
otes/nnee) + hooks auto-push (notes ×2, élèves ×2)
- Protection « l'appareil le plus fourni gagne » + la sync n'importe que du JSON valide (donnée polluée bloquée)
- 🛠 v1.6.7 : parsing blindé du relevé (_elevesParse/_notesParse) — la page ne casse plus si une donnée est corrompue + nettoyage auto au chargement

## v1.6.5 — 19 Septembre 2026 (emploi + protections sync)
- _emploiParse() lecture pure (ne modifie plus le stockage) ; l'emploi s'écrit et reste ✓
- lamiPullState() ne surcharge plus un emploi local plus fourni (anti-écrasement)
- testé CDP : rows=9, 08h="3e Sc 5" ✓

## v1.6.4 — 19 Septembre 2026 (correctif emploi du temps)
- **🛠 Bug « Ajouter une classe » ne fait rien** : une donnée corrompue dans lami-emploi (test pollué) faisait planter JSON.parse AVANT l'ouverture du modal → ni « ➕ Ajouter une classe » ni le clic sur une case ne réagissait
- **Correctif** : helper **_emploiParse()** (parsing blindé + auto-réparation '[]' si corrompu) utilisé aux 10 lectures de l'emploi
- Testé en direct (CDP) : modal s'ouvre ✓, lami-emploi auto-nettoyée ✓

## v1.6.3 — 19 Septembre 2026
- **sync emploi/notes tel<->PC via /api/state** (hooks auto après 5 écritures d'emploi)
- **cache hors-ligne** : la liste reste visible PC éteint

## v1.6.2 — 19 Septembre 2026 (téléphone)
- **📄 OnlyOffice s'ouvre maintenant sur le téléphone** : l'app cherchait le DocumentServer sur « localhost » (= le téléphone lui-même → page vide). Corrigé dans `ooDsUrl()` : quand l'app est ouverte depuis le PC via Tailscale (`100.104.240.32`) ou tout autre hôte non local, OnlyOffice pointe **automatiquement sur l'hôte du PC** (port 80) — plus rien à configurer sur le téléphone
- **CSP étendu** : `script-src`/`frame-src` acceptent `http://100.104.240.32:*` et `lamiai:*` (l'iframe OnlyOffice pouvait être barrée par le filtre de sécurité)
- **Chaîne téléphone → PC vérifiée EN TEST RÉEL** : document créé sur le téléphone (4G, Tailscale) → sauvegardé **directement dans le dossier du module sur le PC** (`3ème Année/Le pouvoir de l'image/cours/…docx`) ✓ ; APK v1.6.2 reconstruit et redelivré sur le téléphone (transfert par câble USB/MTP)
- **Robustesse du démarrage** : le garde-fou et la colonne GitHub se lancent désormais **en fenêtre invisible** (`LamiAI-Demarrage-Invisible.vbs` / `LamiAI-Sync-Invisible.vbs` dans Startup) — plus aucune fenêtre noire à fermer par erreur (cause récurrente du serveur arrêté)
- Rappel infra : règle pare-feu 8080 (tous profils), serveur via `serveur-guardien.bat` + raccourcisses bureau `lamiai:8080` et Tailscale

## v1.6.1 — 18 Septembre 2026 (app + APK)
- **🛡Correctif critique du « bibliothèque vide »** : le filtre de sécurité (CSP) du PC n'acceptait que `localhost/127.0.0.1` — les pages ouvertes via le nouveau nom **`http://lamiai:8080`** ou l'IP Tailscale `100.104.240.32:8080` avaient toutes les/API bloquées → bibliothèque vide Bill. CSP mis à jour : `'self'` + `lamiai:8080` + IP Tailscale (connect + frame)
- **📱 APK v1.6.1 (versionCode 3)** reconstruit : le WebView ouvre désormais **directement le PC** (`http://192.168.100.29:8080` au lieu de `localhost` qui restait vide sur le téléphone) ; navigation autorisée pour `192.168.100.29`, `100.104.240.32` (Tailscale) et `lamiai` ; versionName 1.6.1 ; APK publié en téléchargement sur le serveur : `/apk/LamiAI-v1.6.1.apk` (installation possible directement sur le téléphone via WiFi, sans câble)
- **Versions unifiées** : serveur `1.6.1` / app `1.6.1` / APK `1.6.1`
- Testé en direct : depuis `http://lamiai:8080` la bibliothèque charge **812 documents** ✓ ; APK vérifié (zip : contient le bon `capacitor.config.json` + le code v1.6.1) ✓

## v1.6.0 — 18 Septembre 2026
- **📕 Les livres scolaires réels sont visible** : dans Bibliothèque › un niveau, une section **« 📕 Livre scolaire (N) »** liste TOUS les PDF du dossier `<Niveau>/livre scolaire/` — pour **3ème Année : les 2 livres (Sciences + Lettres)** — avec ouverture, ❌ supprimer et ⋯ menu
- **Bogue serveur corrigé** : le dossier `livre scolaire` n'était plus reconnu comme catégorie (différence d'accent/espaces dans le nommait normalisé) et ses fichiers passaient pour un « module » catégorisé cours ; `_cat_from_folder` compare désormais en normalisé (`livrescolaire` → catégorie `livre`), les livres apparaissent partout (aussi 4ème Sciences/Lettres)
- **Bogue d'affichage corrigé (introduit v1.5.x)** : une ligne orpheline dans `openLivreOrLevel` cassait tout le script au chargement (l'app vide) — syntaxe réparée, vérifiée `node --check`
- Les livres sont **exclus de la liste générique** du niveau (plus aucun doublon) ; la carte d'accueil ouvre le premier livre réel (`openLivreOrLevel`)
- Testé en direct (CDP) : section « Livre scolaire (2) » avec les deux PDF de 3ème Année ✓, aucun doublon ✓

## v1.5.9 — 18 Septembre 2026
- **🧭 Le « RETOUR » revient TOUJOURS à l'endroit d'où tu as ouvert le fichier** : en fermant l'éditeur OnlyOffice, l'app utilisait la fiche du document (niveau+module) et sautait vers la page du module — si tu ouvrais un fichier depuis la **Bibliothèque › 3ème Année**, tu retombais « à un autre emplacement ». Corrigé : la vue d'ouverture est **mémorisée** (`openOOModal` capture le `__lamiRefresh` courant) et restaurée à la fermeture (l'ancien routage ne sert que de filet si la vue n'est pas connue)
- Testé en direct (CDP) : ouverture d'un fichier à module depuis Bibliothèque › 3ème Année → fermeture → retour sur **3ème Année** ✓ (avant : page module)

## v1.5.8 — 18 Septembre 2026
- **📱 Le téléphone peut se connecter au PC en WiFi** : le serveur écoute désormais sur **tous les adaptateurs** (`--host 0.0.0.0` dans `serveur-guardien.bat`) au lieu de 127.0.0.1 seulement — l'APK pointe vers `http://192.168.100.29:8080` et travaille **directement sur les fichiers du PC** (continuité téléphone→PC immédiate). Règle pare-feu « LamiAI 8080 » ajoutée (réseau privé)
- **☁️ Colonne GitHub automatique** : `sync-pc.bat` (démarrage automatique Windows) fait `pull + push` GitHub **toutes les 60 s** → chaque PC (et le principal) reste synchronisé sans coupure ; le git-pull ajoute les fichiers partout et le scanner les voit aussitôt
- **La sync GitHub transporte tout le travail** : la sauvegarde `sync/data-phone.json` / `data-pc.json` inclut maintenant **les travaux IA** (registre + contenus), la **roulette** (niveau/module/cours-devoirs mémorisés) — reprise de travail complète entre téléphone et PC
- Testé : accès réseau WiFi `http://192.168.100.29:8080` → 200 OK ✓

## v1.5.7 — 18 Septembre 2026
- **🧠 Le bouton 🔍 respecte le mode choisi** : en « Conversation IA locale », il lance la **conversation** avec la cible de la roulette (invite « Fais-moi un cours sur Niveau › Module… ») au lieu de basculer en « Recherche documents ». En « Recherche documents » : recherche directe dans la bibliothèque (comme avant)
- **La conversation IA est contextualisée par la roulette** : `aiContext()` envoie niveau + module + cours/devoir de la cible à l'IA (prioritaire sur `LAST_CLASS`) → les réponses sont adaptées au module et au niveau choisis sans rien reformuler
- Testé en direct (CDP) : contexte roulette ✓, reste en mode conversation ✓, message cible affiché ✓

## v1.5.6 — 18 Septembre 2026
- **🛠 L'enregistrement IA respecte la roulette** : « 💾 Enregistrer la réponse dans OnlyOffice » rangeait le document dans « Non classé » (il passait par `LAST_CLASS` et ignorait la roulette). Corrigé : la cible (niveau + module + Cours/Devoir) est prioritaire et le fichier atterrit dans `<Niveau>/<Module>/cours|devoirs/<nom>.docx`
- **🔍 Bouton « Rechercher » direct dans la roulette** : pas besoin de taper une question — la recherche part immédiatement avec la cible choisie (niveau + module + cours/devoir)
- **🌍 Nouveau sélecteur « Programme »** dans la roulette : **🇹🇳 Tunisien** (recherche dans TA bibliothèque, programme tunisien) ou **🌍 International** (recherche sur internet avec la cible choisie) — mémorisé, affiché dans le badge
- Testé en direct (CDP) : bouton ✓, sélecteur programme ✓, recherche directe `3ème Année / cours / Récits de voyage` ✓

## v1.5.5 — 18 Septembre 2026
- **🎡 Roulette dans l'Assistant IA** : une barre « Cible » à 3 étages en cascade
  1. **Niveau scolaire** (les 6 niveaux réels)
  2. **Module** → la liste affiche UNIQUEMENT les modules du niveau choisi (issues des dossiers du disque + modules officiels, hors entrées parasites comme « livre scolaire », « Contrôle », « Général »)
  3. **Cours / Devoir** (2 choix) + bouton ↺ pour effacer + badge 🎓 › 📚 › 📘 rappelant la sélection
- La sélection est **mémorisée** (localStorage) et automatiquement ré-appliquée
- **Elle guide la recherche** de l'assistant : la roulette est PRIORAIRE (niveau, module et Cours/Devoir choisis). **Quand niveau + Cours/Devoir sont choisis → l'assistant ne pose PLUS AUCUNE question** : recherche immédiate (le module de la roulette prime sur les mots de la question). Si un info manque quand même, les questions proposent les bons niveaux (plus de « 3ème Année Lettres/Sciences »)
- **Elle fixe la destination de l'enregistrement automatique** : un travail IA enregistré via OnlyOffice atterrit physiquement dans `<Niveau>/<Module>/cours|devoirs/<nom>.<ext>` (visible aussitôt dans la bibliothèque, avec le registre du travail mis à jour)
- Serveur : `TYPE_MAP` ajoute **« Devoir » → dossier `devoirs`** ; `LVL_CODE` ajoute **« 3ème Année »**
- Testé en direct (CDP) : cascade des modules par niveau ✓, recherche dirigée par la roulette (`2ème Année / controle / Femme et société`) ✓, chemin de destination correct (`1ère Année/Rencontres/cours/…`) ✓

## v1.5.4 — 18 Septembre 2026
- **Nettoyage du disque (audit P3)** — rien supprimé, tout déplacé vers `_copies_anciennes/audit-2026-09-18/` :
  - dossiers niveaux fantômes `1ère_Année`, `2ème_Année`, `4ème_Année_Lettres`, `Non_classé`, `LamiAI-data/1ère_Année`, `home/Poésie`
  - ancienne structure `cours/langue|lecture|production` + `devoirs/contrôle|synthèse` supprimée des modules (les 3 fichiers qu'elles contenaient remontés dans `cours/`)
  - module cassé `3ème Année/recit` fusionné dans `Récits de voyage`
  - documents officiels : schéma abandonné `plan-devoir` + copies codées `1e_…_cou_rpa_2..6.docx`, `Test-FX.docx` → refuge ; **1 seul fichier stable par module** (`Répartition_pédagogique_—_<module>.docx` / `Planification_du_devoir_—_<module>.docx`)
  - poubelles de la racine : fichiers `0`, `SCROLL`, dossier `1ère anné 2026`, `__pycache__`
  - `Non classé` : 6 scripts de téléchargement déplacés hors du niveau, module vide `contrôle` trié dans `devoirs/`
- Résultat vérifié : **812/812 fichiers = disque ↔ app, 0 invisible, 0 fantôme** ; docs officiels 10/10 propres

## v1.5.3 — 18 Septembre 2026
- **App = disque (audit C1 corrigé)** : le scanner de `serve_all.py` n'ignore plus les sous-dossiers inconnus — `<module>/documents/` (Répartition + Planification) et `Non classé/Sameh_Ben_Amor/<sous-dossiers>` sont scannés (récursif) : **+340 fichiers visibles** (829/829 à l'époque du test, 0 invisible, 0 fantôme)
- **Scan récursif** des catégories de niveau (`cours`, `devoirs`, `livre scolaire` y compris leurs sous-dossiers)
- **Signature de cache basée sur le contenu réel des fichiers** (chemin+taille+mtime) : plus de cache périmé quand on ajoute un fichier dans un module
- **Compteurs exacts (audit C2 corrigé)** : `_docsForCat` compare le module strictement (normalisé sans accents) — le repli flou qui matchait le 1er mot du module sur le nom des fichiers (« Le pouvoir de l'image » → « le ») est supprimé
- Nouvelle catégorie visible : **« 📐 Documents officiels »** (violet) dans les listes de niveaux/modules

## v1.5.2 — 15 Septembre 2026
- **Ajout de documents** : bouton « 📥 Ajouter des documents » dans chaque niveau / module / cours / lecture (et devoirs) de l'onglet Documents ; choisit un fichier → il est copié dans `LamiAI-data/<Niveau>/<Module>/<cat>/<sub>/` et enregistré dans la bibliothèque (visible partout : liste, recherche IA, navigation)
- **Endpoint d'upload** `POST /api/upload` dans `serve_all.py` (multipart, zero dépendance) : sauvegarde le fichier physique + inscrit l'entrée dans `LamiAI-data/lamiai_docs.json`
- `getDocs()` étendu : fusionne les documents embarqués + les documents ajoutés (stockés dans `localStorage`)

## v1.5.1 — 12 Septembre 2026
- **Réponses affichées proprement** : le Markdown de l'IA (`#`, `**`, `*`, `-`) est transformé en vraie mise en forme (titres, gras, listes à puces) au lieu d'afficher les symboles
- **Lecture vocale propre** : 🔊 ne lit plus les symboles (`#`, `*`, `-`) — le texte est nettoyé avant d'être prononcé
- **Lecture vocale arrêtable** : appuyer sur 🔊 (ou le bouton de lecture) pendant la lecture **arrête** la voix ; lancer la dictée 🎤 arrête aussi la lecture en cours
- **Dictée vocale fiabilisée** : ne coupe plus les phrases (mode continu + reprise automatique), accumulation correcte du texte
- **Documents Word de l'IA bien mis en page** : la réponse enregistrée dans OnlyOffice est convertie en titres, paragraphes, **listes à puces** et citations (fini le texte brut), grâce à `mdToBlocks()`

## v1.5.0 — 11 Septembre 2026
- **Plusieurs moteurs d'IA gratuits en même temps** : Groq **et** Google Gemini **et** OpenRouter **et** Ollama peuvent coexister
  - Nouveau menu **🧩 Moteur** dans l'Assistant IA (à côté du menu Modèle) ; le menu **Modèle** s'adapte au moteur choisi
  - **Repli automatique** : si le moteur cloud échoue (internet coupé, quota), l'app bascule sur Ollama sans erreur
  - Réglages dans `lami-app-static/local-config.json` (exclu de Git — les clés restent privées) : `providers` + `provider_order`
  - `serve_all.py` : `/ai/status` liste tous les moteurs (`{id,label,models,online}`) ; `/ai/chat` accepte l'option `provider` et dispatche (compatible OpenAI)
  - Correction Cloudflare (Groq/OpenRouter) : envoi d'un **User-Agent navigateur** (sans lui : erreur 403 « 1010 ») ; modèles cloud filtrés (audio/image/embeddings retirés) et **modèle conseillé en tête de liste**
  - Modèles vérifiés en conditions réelles : **Groq `openai/gpt-oss-120b`** (~1 s) et **Google `gemini-3.6-flash`** (~3-7 s), réponses détaillées en français
- **Conseil performance** : sur ce PC (i7-7500U, 2 cœurs, GPU 920M), l'IA locale reste lente ; les moteurs cloud gratuits (Groq ~1-2 s) donnent des réponses bien plus rapides et détaillées

## v1.4.0 — 11 Septembre 2026
- **Bouton de parler 🎤 dans l'Assistant IA** : dictée vocale en français (Web Speech API) — on parle, le texte s'écrit dans la barre de recherche
  - Bouton **🔊** pour écouter la dernière réponse à voix haute, et bouton **🔊 Écouter** sous chaque réponse de l'IA locale (voix française)
- **Prise en charge d'autres moteurs d'IA locaux gratuits** (en plus d'Ollama) : tout moteur **compatible OpenAI** peut être branché sans changer l'app
  - LM Studio, Jan, LocalAI, llama.cpp-server… via les variables `LAMIAI_OPENAI_BASE` (ex. `http://127.0.0.1:1234/v1`) et `LAMIAI_OPENAI_KEY`
  - `/ai/status` indique le moteur et ses modèles ; `/ai/chat` s'y connecte automatiquement (Ollama par défaut)

## v1.3.0 — 11 Septembre 2026
- **Choix du modèle d'IA locale** : un menu déroulant « 🤖 Modèle » dans la page 🤖 Assistant IA permet de choisir entre les modèles installés
  - `qwen2.5:3b` (par défaut, recommandé — meilleures réponses) ou `qwen2.5:1.5b` (plus rapide, plus léger)
  - Le choix est mémorisé (PC) et appliqué à toutes les réponses ; repli automatique si le modèle choisi n'est pas présent sur la machine
  - `serve_all.py` : `POST /ai/chat` accepte désormais le modèle dans le corps de la requête (option `model`)
- **Stabilité web et préparation APK** : correction de l'indentation serveur, persistance de l'historique IA entre changements de page, et script Windows de build APK basé sur le projet Capacitor réel (`lami-app-static`)

## v1.2.0 — 11 Septembre 2026
- **Enregistrer les réponses de l'assistant IA en document** : chaque réponse de la « 🧠 Conversation IA locale » a maintenant un bouton **« 💾 Enregistrer la réponse dans OnlyOffice »**
  - Un clic → la question + la réponse deviennent un document Word (DOCX) créé dans OnlyOffice puis archivé automatiquement dans `<Niveau>/<Module>/cours|travail|.../` selon le contexte en cours (niveau/module/notion), liaison de sauvegarde activée (Ctrl+S)
  - Le document est aussi ajouté aux travaux : on le retrouve dans la bibliothèque et dans l'historique
- **Historique de recherche enrichi** : l'onglet « 📚 Mes recherches » de l'Assistant IA liste désormais **les recherches internet (🌐) ET les conversations IA enregistrées (🧠)**, avec bouton 🗑️ pour supprimer une trace

## v1.1.0 — 11 Septembre 2026
- **Assistant IA intelligent ET gratuit sur n'importe quel PC** : intégration d'Ollama (IA locale) — aucune clé API, aucun compte, aucune dépense
  - La question est envoyée à l'IA installée sur la machine (`http://127.0.0.1:11434`) : réponses pédagogiques en français, adaptées au niveau (1ère à 4ème année) et au contexte (niveau/module/notion actuellement sélectionné)
  - L'app garde la mémoire de la conversation (historique des derniers messages)
  - **Modèles disponibles sur ce PC** : `qwen2.5:1.5b` et `qwen2.5:3b` (défaut) — modifiables via `local-config.json` (`ollama_model`) ou variable d'environnement `LAMIAI_MODEL`
  - Barre de mode dans l'onglet 🤖 Assistant IA : bascule « 🔍 Recherche documents » / « 🧠 Conversation IA locale (gratuite) » + pastille de statut (IA active ou absente)
- **Sécurité du budget** : sans clé OpenRouter, aucune dépense possible — l'assistant IA locale tourne 100 % sur le PC. Le mode « recherche documentaire » (documents + internet) reste le mode par défaut et le repli automatique si Ollama est indisponible
- `serve_all.py` : nouveaux `GET /ai/status` (présence d'Ollama + modèles) et `POST /ai/chat` (dialogue avec l'IA locale, prompt pédagogique de la Prof. Lamia en français, timeout 180 s)

## v1.0.66 — 11 Septembre 2026
- **L'ancien « traitement de texte » intégré est remplacé par OnlyOffice** : ouvrir un document de la bibliothèque (📚), un travail (🤖) **ou un modèle (« 📝 Créer un document » — Fiche de lecture, Sujet de contrôle, Grille, etc.)** lance maintenant le vrai éditeur OnlyOffice (Word / Excel / PowerPoint / PDF) — demandé par le Prof. Lamia
  - `Ouvrir un document` → génère le fichier (formats détectés : DOCX, XLSX, PPTX, PDF) et l'ouvre directement dans OnlyOffice
  - `Ouvrir un travail` / recherche internet / nouvelles créations → choix du format puis ouverture OnlyOffice (mémorisation du format et de l'activité)
  - **Modèles « Fiche de lecture » / « Sujet de contrôle » etc.** (vues Cours/Lecture et Devoirs d'un module) → ouverture directe du modèle dans OnlyOffice, renseigné puis enregistré dans `<Niveau>/<Module>/cours/<activité>/` (ou `controle/`)
  - L'ancien éditeur interne reste dans le code (fonctions intactes) mais n'est plus utilisé pour ouvrir quoi que ce soit
- **Sauvegarde bidirectionnelle** : quand vous enregistrez dans OnlyOffice (Ctrl+S), la version modifiée est réécrite automatiquement dans le dossier du PC (`<Niveau>/<Module>/<type>/<activité>/`) via le callback du serveur
  - `serve_all.py` : nouveau `POST /oo/bind` (liaison clé OnlyOffice → chemin d'archivage) et vrai traitement du `POST /oo/callback` (statuts 2/6 → téléchargement + écriture du fichier modifié)

## v1.0.65 — 11 Septembre 2026
- **Correction du « Échec du téléchargement » (erreur -4) dans OnlyOffice** : le DocumentServer bloquait toute adresse privée (`localhost` / `127.0.0.1`) par sécurité anti-SSRF
  - Activé `services.CoAuthoring.request-filtering-agent.allowPrivateIPAddress` (et `allowMetaIPAddress`) dans `C:\Program Files\ONLYOFFICE\DocumentServer\config\local.json` → usage 100 % local autorisé (sauvegardes faites avant chaque modification : `.bak`, `.bak_before_fix`)
- **Jeton de sécurité (JWT) désactivé** : serveur local accessible sans token (`token.enable.* = false`) ; un PC local n'a pas besoin de signature
- **Correctif IPv4** : toutes les adresses serveur renvoyées à OnlyOffice passent par `127.0.0.1` (l'"localhost" du moteur se résolvait en `::1` et échouait)
- **Diagnostic dans l'app** : statut « ✅ Document ouvert dans OnlyOffice » et messages d'erreur OnlyOffice affichés en direct ; correction du double lancement de l'éditeur
- Vérification automatisée : les 4 formats (DOCX / XLSX / PPTX / PDF) s'ouvrent réellement, aucun retour `onError`

## v1.0.64 — 11 Septembre 2026
- **Enregistrement automatique des travaux dans l'arborescence du PC** :
  - À l'ouverture d'un travail dans OnlyOffice, le document est automatiquement rangé dans `D:\lamia_gnaba_prof_francais\<Niveau>\<Module>\<type>\<activité>\`
  - Nom de fichier codé : `1e_La_reine_de_beaute_crs_lec.docx` (niveau + module + type + activité)
  - Codes : niveaux `1e/2e/3eL/3eS/4eL/4eS` · types `crs/ctr/syn/ex/fch/pdt/trv` · activités `lec/ecr/lnq/edt/voc/poe/div`
  - Nouveau champ « 📂 Activité » (Lecture, Écriture, Langue, Étude de texte, Vocabulaire, Poésie, Autre) choisi à l'ouverture et mémorisé par travail
- `serve_all.py` : nouveau `POST /oo/archive` (stocke + crée les sous-dossiers manquants, anti-écrasement automatique)

## v1.0.63 — 11 Septembre 2026
- **OnlyOffice Docs installé sur le PC (version Windows officielle, open source)** : DocumentServer actif sur `http://localhost` (port 80), services `ds-docservice`/`ds-converter`
- Installateurs pré-téléchargés dans le projet : `onlyoffice-documentserver.exe` (995 Mo) + `onlyoffice-documentserver-prerequisites.exe` (595 Mo) → installation en 1 clic sur un autre PC
- **Ouvrir un travail = toute la page devient l'éditeur OnlyOffice** :
  - Liste des travaux : « ✏️ Ouvrir → OnlyOffice » (mémorise le format choisi : Word / Excel / PowerPoint / PDF)
  - Nouveaux boutons « ➕ Nouveau travail » (nom → niveau → format → ouverture directe dans OnlyOffice)
  - Onglet 🅾️ OnlyOffice : interface simplifiée, zone « Mes travaux » avec ouverture directe
  - Éditeur OnlyOffice plein écran (le vrai ruban Word/Excel/PPT/PDF), bouton flottant « ✖ Retour LamiAI », fermeture propre de l'éditeur
- Serveur `serve_all.py` : ajout de `POST /oo/callback` (retour de sauvegarde OnlyOffice)

## v1.0.62 — 10 Septembre 2026 (suite)
- **Installer le vrai OnlyOffice SANS Docker** : nouvelle option A recommandée — `onlyoffice-install.bat` télécharge l'installeur Windows officiel d'ONLYOFFICE Docs Community (open source, gratuit)
- Onglet 🅾️ OnlyOffice : boutons rapides d'adresse 🏠 `http://localhost` (installateur Windows) / 🐳 `http://localhost:8083` (Docker), consignes de préparation mises à jour
- Recherche internet avec vraie API **Google Custom Search** (bouton ⚙️ dans l'Assistant IA : clé API + ID moteur, moteur FR). Sans clé : retour automatique aux 5 sources Wiki
- Éditeur enrichi + **export Excel (XLSX)** — bouton 📗 XLSX (version DOCX/PPTX/PDF existantes conservées)
- Intégration **OnlyOffice** (open source, GitHub) : nouvel onglet 🅾️ OnlyOffice
  - Ouvre chaque travail dans le vrai éditeur : Word · Excel · PowerPoint · PDF
  - Nouveau serveur local `serve_all.py` (port 8080) : application + stockage `/oo/save` pour OnlyOffice
  - `onlyoffice-start.bat` : démarrage du DocumentServer OnlyOffice via Docker (port 8083, autorisation adresses privées)
  - Bouton 🅾️ OnlyOffice dans la barre de l'éditeur : conversion + édition du document courant

## v1.0.14 — 1 Septembre 2026
- Synchronisation GitHub : sauvegarde/récupération entre téléphone et PC
- Page "☁️ Synchronisation" dans le menu
- Boutons : Sauvegarder sur GitHub, Récupérer de GitHub, Sync complète
- Auto-save toutes les 5 minutes
- Historique des syncs
- Scripts PC : sync-pc.bat et start-server.bat

## v1.0.13 — 1 Septembre 2026
- 2ème Année : 6 modules (Pages d'amour, Toi mon semblable, Femme et société, Travail et bien être, Images d'ici images d'ailleurs, La reine de beauté)
- 3ème Année : fusionnée en une seule section (plus Science/Lettre séparées)
  - Modules : Récits de voyage, Droit à la différence, Mythes d'hier Mythes d'aujourd'hui, Portraits comiques, Le pouvoir de l'image, Écrits autobiographiques
- Menu simplifié : 1ère, 2ème, 3ème, Bac Science, Bac Lettre

## v1.0.12 — 1 Septembre 2026
- Icône APK personnalisée (photo de profil)
- Correction icône adaptive Android

## v1.0.11 — 1 Septembre 2026
- Emploi du temps : Lunedi au Samedi (sans Dimanche), grille vierge par défaut
- Page Devoirs restructurée par catégorie :
  - Contrôle 1, Contrôle 2, Contrôle 3, Synthèse
  - Navigation par sous-sections au lieu de par niveaux
  - Extraction du numéro de contrôle depuis les noms de fichiers

## v1.0.10 — 31 Août 2026
- Contenu complet des documents : suppression de la troncature à 500 caractères
  - 136 documents avec texte intégral (DOCX/DOC extraits)
- Éditeur de documents enrichi type Microsoft Word :
  - Gras (Ctrl+B), Italique (Ctrl+I), Souligné (Ctrl+U), Barré
  - Titres (H2, H3), Paragraphe
  - Listes à puces et numérotées
  - Alignement gauche, centre, droite
  - Indentation / retrait
  - Couleur de texte et surlignage
  - Taille de police
  - Annuler / Rétablir (Ctrl+Z / Ctrl+Y)
  - Effacer le formatage

## v1.0.9 — 31 Août 2026
- Injection du contenu réel des documents dans l'éditeur :
  - 136 documents avec vrai contenu extrait (DOCX + DOC)
  - 21 documents restés avec placeholder (PDF, XLSX, ou extraction non possible)
  - Extraction via parsing XML des fichiers DOCX (ZIP) et extraction texte binaire des .doc
  - Contenu tronqué à 500 caractères pour l'affichage dans l'éditeur
- L'éditeur de document affiche maintenant le vrai texte du cours/document

## v1.0.8 — 31 Août 2026
- Documents en mode arborescence (explorateur de dossiers) :
  - Niveau → Catégorie → Documents
  - Fil d'Ariane pour navigation
  - Icônes par niveau et catégorie
  - Clic sur un document → éditeur
- Navigation intuitive comme un explorateur de fichiers

## v1.0.7 — 31 Août 2026
- Création de la structure de dossiers sur le PC :
  - 1ère Année (9 docs)
  - 2ème Année (67 docs)
  - 3ème Année Lettres (56 docs)
  - 3ème Année Sciences (3 docs)
  - 4ème Année Lettres (19 docs)
  - 4ème Année Sciences (5 docs)
  - Non classé (20 docs)
- Chaque dossier contient des sous-dossiers par catégorie (contrôle, cours, exercice, fiche, etc.)
- 179 documents copiés dans les bons dossiers
- LamiAI APK et PC web synchronisés

## v1.0.6 — 31 Août 2026
- Correction des défauts dans les documents :
  - Apostrophes échappées corrigées
  - Double espaces supprimés
  - Fichier 0 KB corrigé
  - Noms avec caractères cassés réparés
- 180 documents sans erreur

## v1.0.5 — 31 Août 2026
- Classification complète des 180 documents par niveau :
  - 1ère Année: 9 documents
  - 2ème Année: 72 documents
  - 3ème Année Lettres: 55 documents
  - 3ème Année Sciences: 3 documents
  - 4ème Année Lettres: 19 documents
  - 4ème Année Sciences: 5 documents
  - Non classé: 17 documents (fichiers non pédagogiques)
- Filtre de niveau dans la section Documents
- Stats Home : 180 documents

## v1.0.4 — 31 Août 2026
- 180 documents réels de Lamia Gnaba ajoutés (scan complet du dossier)
- Catégorisation automatique : niveau + module + type
- Home stats : 180 documents, 7 niveaux, 25+ modules
- Correction bugs apostrophes dans noms de fichiers

## v1.0.3 — 31 Août 2026
- Éditeur de documents : clic sur un document → popup avec contenu éditable
- 11 documents avec contenu pédagogique réel
- Sauvegarde dans localStorage (modifications persistantes)
- Badge "Modifié" sur documents modifiés
- Téléchargement en .txt
- Support tout type (PDF, DOCX, DOC)
- Navigation tactile améliorée

## v1.0.2 — 31 Août 2026
- Fix menu mobile : overlay semi-transparent, fermeture auto après clic nav
- Fix menu qui bloque l'écran sur APK
- Ajout backdrop pour fermer le menu en cliquant à l'extérieur

## v1.0.1 — 31 Août 2026
- Corrigé bug JavaScript (`l\'emploi` → `l'emploi`)
- Corrigé accolade en trop cassant toute la page
- Config Capacitor `androidScheme: "file"` pour chargement local APK
- Emploi du temps professeur (tableau jours × heures × classes)
- Ajout/Suptression/Modification cellules emploi du temps
- Export CSV emploi du temps
- Stats emploi du temps (cours/semaine, créneaux, contrôles)

## v1.0.0 — 31 Août 2026
- Création initiale de LamiAI
- Sidebar navigation (Accueil, Documents, IA, Emploi du Temps, Cours, Niveaux, Exercices, Paramètres)
- 100 documents de Lamia Gnaba indexés
- Assistant IA (chatbot pédagogique)
- Générateur dynamique Word/Excel/PDF
- Calendrier événementiel
- PWA + APK Android (Capacitor)
