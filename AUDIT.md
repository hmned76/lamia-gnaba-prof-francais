# 🔍 AUDIT FINAL — LamiAI (Prof. Lamia Gnaba)
**Date :** 18/09/2026 · **Périmètre :** conversation complète ↔ projet réel (disque `D:\lamia_gnaba_prof_francais` + code + app en ligne)
**Méthode :** scans réels du disque, comparaison avec `/api/library`, lecture du code (`index.html`, `serve_all.py`), tests en direct (pipeline de sauvegarde OnlyOffice), journaux et processus.

---

## 0. SYNTHÈSE

| Domaine | État |
|---|---|
| Serveur local (8080) | ✅ fonctionne, 1 seule instance |
| DocumentServer OnlyOffice | ✅ actif (port 80, healthcheck `true`) |
| Pipeline de sauvegarde OnlyOffice | ✅ **vérifié en direct** (bind → callback status=2 → fichier écrit) |
| Les 4 copies de `index.html` | ✅ synchronisées (md5 `0162B385`) |
| Unification « 3ème Année » | ⚠️ faite dans la bibliothèque, **pas partout** |
| **App = Disque** (ton exigence n°1) | ❌ **340 fichiers invisibles** dans l'app |
| Compteurs de documents | ❌ faux (bug de filtrage) |
| Documents officiels (Répartition / Planification) | ❌ doublons + 2 schémas de noms + invisibles |
| Nettoyage de l'ancienne structure | ❌ **non terminé** (beaucoup de restes) |
| Protection serveur (garde-fou, journal) | ❌ inactive aujourd'hui |
| GitHub | ✅ poussé (`f0ab7ba`), secrets + 1,6 Go d'installateurs exclus |

**Chiffres clés :** 829 fichiers éligibles sur le disque (6 niveaux) → **489 seulement visibles** dans l'app → **340 invisibles**.

---

## 1. ✅ CE QUI EST CONFIRMÉ BON (preuves à l'appui)

1. **Serveur unique** : `python serve_all.py` (PID 22248) écoute sur 8080 ; `/api/library` répond (137 Ko). Pas de doublon de serveur cette fois.
2. **Copies de l'app synchronisées** : `lami-app-static/index.html`, `www/`, `android/.../assets/public/`, `android/.../mergeDebugAssets/public/` → **même md5** `0162B385`, 6 738 754 octets.
3. **Sauvegarde OnlyOffice : le pipeline FONCTIONNE.** Test réel effectué :
   - `POST /oo/bind` (clé `audit-test-ascii-1`, archive `lamtrav/_audit_test_save.docx`) → `{"ok":true}`
   - `POST /oo/callback` `{status:2,url:...}` → `{"error":0}`
   - fichier écrit : **4 902 octets** ✅ (puis supprimé)
   → Le serveur sait donc bien télécharger depuis DocumentServer et écrire dans le bon dossier. Les pertes de fichiers passées venaient d'ailleurs (clés non liées / ancien code d'archivage).
4. **Niveaux unifiés côté serveur** : `LEVEL_FOLDER` + `UI_LEVELS` = 1ère, 2ème, **3ème Année**, 4ème Sc, 4ème L, Non classé (avec alias `3ème Année Sciences/Lettres/Scientifique` → `3ème Année`).
5. **`AI_MODULES`** utilise déjà `'3ème Année'` (pas de Sciences/Lettres).
6. **Bibliothèque** : plus aucune carte « 3ème Année Sciences/Lettres » (test navigateur : `sciences:false, lettres:false, trois:true`) ; **0 document fantôme** (tout document affiché correspond à un fichier réel).
7. **Trimestre automatique** : `getSchoolPeriod()` + Relevé de notes qui sélectionne le bon trimestre.
8. **Boutons demandés présents dans la page d'un module** (`showModuleCat`) : 📋 Répartition, 📝 Planification, ✏️ Nouveau document, 📥 Ajouter (upload), ❌ sur les documents listés.
9. **Documents officiels** : génération correcte (paysage A4 16838×11906, Comic Sans MS `sz=26` = 13 pt, tableaux), cible stable `Niveau/Module/documents/répartition|planification/<titre>.docx`, réutilisation via `/api/file` + registre `lami-mdoc-<niveau>|<module>|<type>`.
10. **GitHub** : `2373905..f0ab7ba master` poussé ; `.gitignore` exclut les installateurs OnlyOffice (1,6 Go) et `config/local-config.json` (clés Groq/Gemini).

---

## 2. ❌ DÉFAUTS CRITIQUES (à corriger en priorité)

### C1 — 340 fichiers du disque sont INVISIBLES dans l'app
**Preuve :** disque 829 vs app 489.
| Niveau | Disque | App | Écart |
|---|---|---|---|
| 1ère Année | 25 | 14 | **-11** |
| 2ème Année | 109 | 101 | **-8** |
| 3ème Année | 78 | 73 | **-5** |
| 4ème Année Sciences | 26 | 23 | **-3** |
| 4ème Année Lettres | 26 | 26 | OK |
| Non classé | 565 | 252 | **-313** |

**Cause exacte :** `serve_all.py` lignes 450-489 — dans un module, si un sous-dossier n'est pas une catégorie connue (`cours`, `devoirs`, …), il n'y a **aucun `else`** : le dossier est **silencieusement ignoré**.
Conséquences :
- ❌ **`module/documents/` est ignoré → les 27 documents officiels (Répartition + Planification) n'apparaissent NULLE PART dans l'app** (`Vus par l'app : 0`).
- ❌ `Non classé/Sameh_Ben_Amor/{3e_sciences, 2e_sciences, 4e_sciences, 4e_lettres, 1ere_sciences, non_classifie, bac_sciences, bac_lettres, 2e_lettres, 3e_lettres}` → **313 fichiers invisibles**.
- ❌ Tout futur sous-dossier créé à la main sera invisible aussi.

**Correctif :** ajouter une branche `else` → `os.walk` du sous-dossier inconnu (catégorie = `_cat_from_folder(...)` sinon `cours`, `mod` = nom du module, chemin relatif conservé) + rendre récursif le scan des catégories de niveau (`niveau/cours`, `niveau/devoirs`, `niveau/livre scolaire`).

---

### C2 — Compteurs faux : `_docsForCat` a un repli « flou » dangereux
**Code (index.html) :**
```js
const modEq=x=>{ if(x.mod===module) return true;
  const mn=String(module||'').toLowerCase().split(' ')[0];          // ← 1er MOT du module
  return String(x.name||'').toLowerCase().includes(mn)              // ← matche le NOM du FICHIER
      || String(x.mod||'').toLowerCase().includes(mn); };
```
**Effet réel :**
- Module **« Le pouvoir de l'image »** → `mn = "le"` → **tous les fichiers dont le nom contient « le »** sont comptés dans ce module (c'est la vraie cause des « 24 documents » — pas les travaux IA comme conclu hier).
- Module **« A la lumière de la raison »** → `mn = "a"` → **pratiquement toute la bibliothèque** matche.
- Module **« Droit à la différence »** → `mn = "droit"`, etc.

**Correctif :** garder uniquement `x.mod === module` (comparaison exacte, éventuellement normalisée sans accents/casse). Supprimer le repli sur le nom de fichier.

---

### C3 — Documents officiels : doublons + deux schémas de noms/dossiers
**Preuve (contenu réel des dossiers `documents/`) :**
```
1ère Année/Rencontres/documents            → 8 fichiers
   plan-devoir/1e_Rencontres_cou_pla.docx                 ← ANCIEN schéma
   planification/Planification_du_devoir_—_Rencontres.docx ← schéma actuel
   répartition/1e_Rencontres_cou_rpa_2..6.docx  (5 copies!)
   répartition/Répartition_pédagogique_—_Rencontres.docx
2ème Année/Pages d'amour/documents         → 7 fichiers (rpa, rpa_2, rpa_3, pla, pla_2, Test-FX.docx)
1ère Année/Scènes de la vie en France      → 3 fichiers (plan-devoir + 2 répartition)
3ème Année/Récits de voyage                → 3 fichiers (plan-devoir + planification + répartition)
4ème Année Sciences/Souvenirs et nostalgie → 3 fichiers (plan-devoir + 2 répartition)
4ème_Année_Lettres/synthese/documents      → 1 fichier orphelin (dossier niveau avec underscore)
home/Poésie/documents                      → 1 orphelin
Non_classé/Conversations_IA/documents      → 1 orphelin
```
**Constat :** `plan-devoir` n'existe **plus du tout dans le code** (0 occurrence) → ces dossiers/fichiers sont des **orphelins** d'une ancienne version. Idem pour les noms codés `1e_..._cou_rpa_N.docx`, `nc_...`, `4eS_...`, `4eL_...`, et le fichier de test `Test-FX.docx`.
**Correctif :** migration/nettoyage → garder **1 seul** `Répartition pédagogique — <module>.docx` et **1 seul** `Planification du devoir — <module>.docx` par module, supprimer `plan-devoir/`, archiver les copies `_rpa_N` dans `_copies_anciennes/`.

---

### C4 — L'ancienne structure n'a PAS été éliminée (demande explicite)
**Restes constatés sur le disque :**
- **Dossiers « underscore » à la racine** (niveaux fantômes) : `1ère_Année/` (avec `Contrôle`, `Général`, `Rencontres/cours/lecture`), `2ème_Année/` (`Figures_de_Style/exercice`, `Pages_d'amour/documents`), `4ème_Année_Lettres/synthese/documents` (**1 fichier dedans**), `Non_classé/` (**19 fichiers** : `Général` 9, `Contrôle` 3, `Conversations_IA` 1…).
- **Ancienne arborescence dans les modules** : `cours/langue`, `cours/lecture`, `cours/production`, `devoirs/contrôle`, `devoirs/synthèse` présents dans **tous les modules de 1ère Année** (et ailleurs) — la plupart vides, mais **avec fichiers** ici :
  - `1ère Année/Société de consommation/cours/langue` → 2 fichiers
  - `1ère Année/Sauvons la planète terre/cours/lecture` → 1 fichier
- **Module cassé** : `3ème Année/recit/` (seulement `cours`, 1 fichier) = doublon de `Récits de voyage`.
- **Poubelle à la racine du projet** : fichiers `0` et `SCROLL`, dossier `1ère anné 2026/` (1 fichier, créé par un bug d'archivage), `__pycache__/`.
- **Ancienne bibliothèque interne** : `LamiAI-data/1ère_Année/...` (11 fichiers, dont `Rencontres/cours/Lecture` 8).
- **Non classé malformé** : module vide `contrôle/`, imbrications `cours/cours`, `cours/devoirs`, `cours/documents` (vides) + **6 scripts Python/JS à la racine du niveau** (`download_discord_msg.py`, `nettoyer_doublons.py`, `script_messenger.js`…) qui ne sont pas des documents.
- **`Général`** : bien supprimé dans les 6 niveaux ✅ mais **encore présent** dans `Non_classé/Général` (9 fichiers) et dans les vieux documents statiques (`mod:'Général'`).

**Correctif :** script de nettoyage unique (fusion des fichiers utiles vers la structure cible, suppression des dossiers vides, déplacement des orphelins vers `_copies_anciennes/`).

---

### C5 — `askLevel()` propose encore les niveaux supprimés
```js
aiAsk('…quelle année ?', ['1ère Année','2ème Année','3ème Année Lettres','3ème Année Sciences','4ème Année Lettres','4ème Année Sciences']);
```
→ L'assistant IA demande une « 3ème Année Lettres/Sciences » qui n'existe plus, et la réponse ne correspondra à aucun niveau réel.
**Correctif :** `['1ère Année','2ème Année','3ème Année','4ème Année Sciences','4ème Année Lettres','Non classé']` + alias de reconnaissance à l'entrée.

---

### C6 — Modules codés en dur → un module ajouté sur disque n'apparaît pas
`index.html:1530-1536` : listes figées `niv1/niv2/niv3/bacs/bacl`. Conséquences :
- un nouveau module créé dans le dossier (ou par l'app) **n'est pas listé** dans la page du niveau ;
- `Non classé` n'a **aucune** page modules (565 fichiers inaccessibles par ce chemin) ;
- les noms doivent être maintenus à la main (risque de désynchronisation disque/app — exactement ce que tu veux éviter).

**Correctif :** construire la liste des modules depuis `getDocs()` (`[...new Set(docs.filter(d=>d.level===lvl).map(d=>d.mod))]`) fusionnée avec l'ordre officiel (`AI_MODULES`) ; ajouter une page `Non classé`.

---

### C7 — Protection serveur inactive + aucun journal
- Le serveur actuel a été lancé par **`start-server.bat`** à 15:55 (`cmd /c start-server.bat` → `python serve_all.py`), **sans redirection** → `lami-server.log` figé à **00:14:48** (termine par `^C`). On est **aveugle** sur les callbacks OnlyOffice d'aujourd'hui.
- **`serveur-guardien.bat` ne tourne pas** (aucun `cmd.exe` correspondant), alors qu'il est bien présent dans le dossier Startup.
- **Aucune protection anti-double-instance** : lancer `start-server.bat` pendant que le garde-fou tourne recrée le bug « 2 serveurs » déjà rencontré.
- **3 lanceurs contradictoires** : `start-server.bat` (v1.3.0), `ouvrir-lami.bat` (v1.0.62), `serveur-guardien.bat` — et le message d'erreur de l'app dit « lancez **start-server.bat** » alors que le recommandé est le garde-fou.
- `onlyoffice-start.bat` est **obsolète** (Docker, port 8083) alors que DocumentServer tourne en natif sur le port 80.

**Correctif :** un seul lanceur = `serveur-guardien.bat` (test du port 8080 avant de démarrer, `python -u` pour un journal immédiat, ouverture du navigateur) ; `start-server.bat` et `ouvrir-lami.bat` → simples raccourcis vers le garde-fou ; supprimer/archiver `onlyoffice-start.bat`.

---

### C8 — Code mort cassé dans la page « niveau »
`index.html:1552-1557` (branche `else` quand `mods.length===0`) :
```js
lamiDocs.forEach(w=>{ h+=`…${sousCours}…${scColors[sousCours]}…` });   // h, sousCours, scColors inexistants ici
```
→ **exception garantie** si cette branche s'exécute un jour (ex. niveau sans modules configurés). À supprimer/recoller proprement.

---

## 3. ⚠️ DÉFAUTS SECONDAIRES / RISQUES

| # | Constat | Risque | Correctif |
|---|---|---|---|
| S1 | `lami-app/public/index.html` = **copie périmée** (md5 `0A955B82`, 6 709 257 o) dans l'app Expo/React-Native legacy (12 173 fichiers) | Ouvrir une **vieille version** de l'app | Décider : supprimer `lami-app/` ou le resynchroniser |
| S2 | **243 noms de fichiers en double** (ex. `révision 2ème.docx` ×9 dont 3 dans 2ème Année ; `test dia 2ère.docx` ×6) | Doublons affichés, confusion, poids | Déduplication guidée (garder le plus récent, archiver les autres) |
| S3 | `/oo/bind` et `/oo/callback` font `json.loads(raw)` sans tolérance d'encodage → **500** `'utf-8' codec can't decode byte 0xe9` (reproduit en direct) | Échec silencieux de liaison → sauvegarde perdue | Décoder en UTF-8 avec repli `latin-1`/`errors='replace'` |
| S4 | `_scan_signature()` ne regarde que 2 niveaux de profondeur | Cache périmé jusqu'à 15 s après un ajout de fichier | Signature récursive ou TTL réduit |
| S5 | Scan **non récursif** pour `niveau/cours`, `niveau/devoirs`, `niveau/livre scolaire` | Sous-dossiers invisibles (ex. `livre scolaire/documents`) | `os.walk` |
| S6 | `oo_store` : **223 fichiers, 8,2 Mo**, jamais purgé | Poids, confusion, faux « doublons » | Purge des clés non liées + conservation 30 j |
| S7 | Noms d'affichage incohérents : page Documents = « Bac Scientifique / Bac Lettres », Bibliothèque = « 4ème Année Sciences / Lettres » | L'utilisatrice ne retrouve pas ses niveaux | Un seul référentiel de noms (affichage = dossier) |
| S8 | `CAT_FOLDERS` : `documents` absent ; `devoirs` → catégorie `controle` | C1 + terminologie app ≠ disque | Ajouter `documents` (+ `répartition`/`planification`) ; renommer la catégorie « Devoirs » |
| S9 | `_copies_anciennes/` (66 fichiers), `doc lamia/`, `trav lamia/`, `lamtrav/`, `doc_gen/`, `lamia 2024-2025/`, `doc pré requis/`, `pages d'amour lamia/` hors niveaux | Le résolveur global les trouve → résultats inattendus | Décider : intégrer, exclure du résolveur, ou archiver |
| S10 | Clés API Groq/Gemini en clair dans `config/local-config.json` (exclu de Git ✅ mais présent sur disque + dans les sauvegardes) | Fuite si le dossier est partagé | Fichier déjà ignoré ; ajouter un avertissement + option « clés dans le coffre Windows » |

---

## 4. 🔁 CROISEMENT : TES DEMANDES ↔ ÉTAT RÉEL

| # | Ta demande (conversation) | État | Preuve / reste à faire |
|---|---|:--:|---|
| 1 | Aucune copie automatique — ouvrir le fichier **original** | ✅ | 0 fantôme : chaque doc affiché = fichier réel |
| 2 | **Le site/l'app = le disque** | ❌ | C1 : 340 fichiers invisibles (dont les 27 documents officiels) |
| 3 | Supprimer `Général` partout | ⚠️ | OK dans les 6 niveaux ; **reste** `Non_classé/Général` (9 fichiers) + `mod:'Général'` dans les vieux docs |
| 4 | Structure `module → cours/ + devoirs/ + documents/` | ⚠️ | Tous les modules sont `MODULE-OK` **sauf** `3ème Année/recit` ; **restes** `langue/lecture/production`, `contrôle/synthèse` (C4) |
| 5 | Unifier « 3ème Année » (plus de Sciences/Lettres) | ⚠️ | Bibliothèque ✅, `LEVEL_FOLDER`/`AI_MODULES` ✅ ; **`askLevel` ❌ (C5)** ; dossiers `4ème_Année_Lettres`, `Non_classé` ❌ |
| 6 | Documents officiels : **1 seul fichier stable** réutilisé | ❌ | C3 : jusqu'à 6 copies/module, 2 schémas (`plan-devoir` vs `planification`), `Test-FX.docx` |
| 7 | ❌ (supprimer) sur **toutes** les listes | ⚠️ | Présent sur 3 listes seulement (`1789`, `1866`, `3003`) ; absent dans `showSousCours`, `showExLevel`, page niveau, travaux IA |
| 8 | Compteurs exacts (carte = contenu du dossier) | ❌ | C2 (repli flou) + C1 (fichiers invisibles) |
| 9 | « Failed to fetch » corrigé **définitivement** | ⚠️ | Patch `fetch` (3 tentatives) + message ✅ ; mais **garde-fou inactif + pas de journal** (C7) → le défaut peut revenir |
| 10 | Renommer = renommer le fichier original | ✅ (code) | Callback « rename » présent ; **non rejoué en direct aujourd'hui** |
| 11 | Trimestre automatique + relevé | ✅ | `getSchoolPeriod()` + sélection auto |
| 12 | Police/mise en page docs officiels (paysage, Comic Sans 13) | ✅ | `pgSz 16838×11906` landscape, `w:sz=26` |
| 13 | Boutons Ajouter / Nouveau document partout | ✅ | Vérifié dans `showModuleCat` (cours + devoirs) |
| 14 | Pas de doublons dans les listes | ⚠️ | Affichage corrigé, mais **243 doublons réels sur disque** (S2) |
| 15 | Pousser sur GitHub | ✅ | `f0ab7ba` ; installateurs 1,6 Go + clés API exclus |
| 16 | Page « Synchronisation GitHub » (token) | ⏳ | Décision en attente (garder / retirer) |
| 17 | Serveur relancé automatiquement au démarrage | ⚠️ | `serveur-guardien.bat` dans Startup ✅ mais **non lancé actuellement** (C7) |

---

## 5. 🛠️ PLAN DE CORRECTION PROPOSÉ (ordre rentable)

| Priorité | Action | Fichiers | Effet |
|---|---|---|---|
| **P1** | Scanner `documents/` + tout sous-dossier inconnu (récursif) | `serve_all.py` `_scan_library` | **+340 fichiers visibles** (C1) — 1 seule fonction |
| **P2** | `_docsForCat` strict (`mod` exact) | `index.html` | Compteurs justes, fin des faux doublons (C2) |
| **P3** | Nettoyage disque : restes ancienne structure, `plan-devoir`, copies `_rpa_N`, `recit`, `0`/`SCROLL`, `1ère anné 2026`, dossiers underscore | script + `_copies_anciennes/` | Disque = structure voulue (C3, C4) |
| **P4** | `askLevel` unifié · modules découverts du disque · page `Non classé` · ❌ partout · supprimer le code mort 1552-1557 | `index.html` | C5, C6, C8 + demande #7 |
| **P5** | Un seul lanceur (`serveur-guardien.bat` : test port, `python -u`, ouverture navigateur) + messages d'erreur cohérents | `.bat`, `index.html` | Plus de « Failed to fetch » silencieux (C7) |
| **P6** | Tolérance d'encodage `/oo/bind`+`/oo/callback` · signature de scan récursive · purge `oo_store` | `serve_all.py` | S3, S4, S6 |
| **P7** | Décisions à prendre avec toi : sort de `lami-app/` (S1), déduplication des 243 doublons (S2), page GitHub Sync (#16), dossiers hors niveaux (S9) | — | — |

**Règle de sécurité pour P3 :** rien n'est supprimé définitivement — tout est **déplacé** dans `_copies_anciennes/audit-2026-09-18/` (comme pour la récupération des 115 fichiers).

---

## 6. 💡 IDÉES DE NOUVEAUTÉS (classées par valeur / effort)

### 🥇 Fort impact, faible effort
1. **Tableau de bord de rentrée** — période/trimestre auto, progression par module (séances cochées), devoirs à venir, alerte « Répartition non remplie ».
2. **Corbeille intégrée** — les ❌ déplacent vers `_corbeille/` (restauration 30 jours) au lieu de supprimer : plus jamais de perte comme les 116 fichiers.
3. **Sauvegarde automatique quotidienne** — ZIP horodaté du projet (7 derniers conservés) + bouton « Restaurer ».
4. **Recherche globale instantanée** — un champ unique qui cherche dans tous les niveaux **et dans le contenu** des DOCX/PDF, avec filtres niveau/module/type.
5. **Statistiques d'usage** — documents les plus ouverts, modules en retard sur la répartition.

### 🥈 Fort impact, effort moyen
6. **Cahier de textes numérique** — séance par classe, export PDF/impression (exigence administrative tunisienne).
7. **Générateur de sujets** — à partir d'un texte du module : compréhension / langue / essai + barème, export DOCX dans **le même style** que tes documents officiels, corrigé séparé.
8. **Planification annuelle automatique** — calendrier scolaire officiel → répartit les 8 séances de chaque module sur l'année et **pré-remplit la Répartition pédagogique**.
9. **Correcteur de copies** — saisie des notes → moyennes, classement, relevé (Excel) et bulletins (PDF). `BULTIN DE NOTE.xlsx` existe déjà : à intégrer.
10. **Export « Dossier administratif »** — un ZIP par module : répartition + planification + sujets + relevés, prêt pour l'inspection.

### 🥉 Bonus
11. **IA locale hors-ligne** — Ollama est déjà installé (`qwen2.5:3b`) : bouton « Générer sans Internet » (zéro quota, zéro fuite).
12. **Mode « Classe » / vidéoprojecteur** — affiche un texte ou une consigne en grand écran.
13. **QR code par document** — collé sur la copie papier, ouvre le fichier depuis un téléphone.
14. **Synchronisation multi-poste** — commit Git automatique quotidien (le dossier `sync/` existe déjà) : historique + récupération en 1 clic.
15. **Historique des versions d'un document** — à chaque sauvegarde OnlyOffice, garder une copie horodatée (10 dernières) avec comparaison.

---

## 7. 📌 POINTS DE VIGILANCE (à ne jamais refaire)
- ❌ Ne **jamais** committer : `onlyoffice-documentserver*.exe` (1,6 Go), `config/local-config.json` (clés API) → déjà dans `.gitignore`.
- ❌ Ne **jamais** fusionner des dossiers qui ne diffèrent que par la casse/les accents (`Cours` vs `cours`) : Windows les confond → c'est ce qui a supprimé 116 fichiers. Toujours **déplacer**, jamais `Remove-Item` sur un dossier fusionné.
- ✅ Toujours lancer **`serveur-guardien.bat`** (journal + relance auto), et ouvrir **`http://127.0.0.1:8080`** avec **Ctrl+F5** après chaque correctif.
- ✅ Après chaque modification de `index.html` : recopier vers `www/`, `android/.../assets/public/`, `android/.../mergeDebugAssets/public/`.
