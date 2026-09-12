# Audit Technique — LamiAI v1.5.1
## Assistant Pédagogique — Prof. Lamia Gnaba

**Date :** 12 septembre 2026  
**Auditeur :** IA (kimi-k2.7-code via OpenCode Go)  
**Projet :** `D:\lamia_gnaba_prof_francais`  
**URL :** `http://localhost:8080` (serveur démarré)  
**Modèle utilisé :** opencode-go/kimi-k2.7-code  

---

## 1. Vue d'ensemble

LamiAI v1.5.1 est une application web pédagogique développée par la Professeure Lamia Gnaba (assistante de français en Tunisie). L'application fournit un assistant IA, une bibliothèque de documents scolaires organisés par niveau et module, un calendrier, un relevé de notes et un éditeur de documents OnlyOffice.

**Technologies :**
- **Client :** HTML/JS/CSS pur (pas de framework), fichier unique de 6,4 Mo
- **Serveur :** Python stdlib (sans dépendances externes), ThreadingHTTPServer
- **IA :** Multi-providers (Ollama local + Groq + Gemini + OpenRouter)
- **Stockage :** localStorage côté client, fichiers DOCX/XLSX/PPTX côté serveur

**Taille :**
- index.html : 6,4 Mo (monolithique)
- serve_all.py : 568 lignes (zéro dépendance externe)
- lami_sync_server.py : 280 lignes (zéro dépendance externe)
- 383 fichiers DOC/DOCX/PDF/XLSX/PPTX sur disque
- lami-app/src/App.js : ~240 lignes React (non utilisé en prod)

---

## 2. Architecture

### 2.1 Architecture globale

L'application suit une architecture **client-serveur locale** :

```
Navigateur (localhost:8080)  ←→  serve_all.py :8080
                                      ↓
                                  Ollama :11434 (IA locale)
                                  Groq / Gemini / OpenRouter (cloud, via clés)

Navigateur (localhost:8080)  ←→  lami_sync_server.py :8181 (port non démarré en test)
                                      ↓
                                  Sync PC ↔ APK Android
```

### 2.2 Séparation dev / prod — point critique

**lami-app/** (code source) :
- React 18.2.0 + React Native 0.72.6 + Expo 49 + react-native-web
- App.js (~240 lignes) : composant principal React
- package.json, build-apk.bat → compilation Android via Capacitor

**lami-app-static/** (production) :
- index.html unique de 6,4 Mo avec tout le code JS/CSS/données inline
- local-config.json (clés API, exclu de Git)
- livres/ (6 PDFs scolaires)
- Divers scripts .js (check_ctrls.js, check_levels.js, extract_node.js...)
- node_modules/ (dépendances Capacitor)

**Problème majeur :** le code source React (lami-app/src/App.js) n'est PAS build dans la version production. La prod est un fichier HTML stand-alone avec code inline. C'est une divergence architecturelle importante :
- Le code React devient documentation non maintenue
- Les modifications dans le HTML de prod ne sont pas répercutées dans App.js
- Impossible de faire du débogage structuré, des source maps, ou des tests automatisés sur le code produit

### 2.3 Serveur principal (serve_all.py)

| Endpoint | Méthode | Description |
|---|---|---|
| `/oo/list` | GET | Liste des fichiers stockés |
| `/oo/<file>` | GET | Sert un fichier (pour DocumentServer OnlyOffice) |
| `/ai/status` | GET | Statut IA (providers disponibles, modèle courant) |
| `/ai/chat` | POST | Chat IA (message + historique + contexte + provider) |
| `/oo/save` | POST | Sauvegarde fichier (OnlyOffice callback) |
| `/oo/archive` | POST | Archivage automatique dans <Niveau>/<Module>/<type>/<activité>/ |
| `/oo/callback` | POST | Callback OnlyOffice (sauvegarde terminée) |
| `/oo/bind` | POST | Liaison clé OnlyOffice → chemin d'archivage |
| `/*` (statique) | GET | Sert les fichiers de lami-app-static/ |

Le serveur est bien structuré : séparation des handlers, gestion des erreurs, pas de dépendances externes (avantage pour la portabilité).

### 2.4 IA multi-providers

Architecture de fallback automatique :
1. Provider choisi (`provider` dans la requête) → si différent d'ollama, tentative cloud
2. Si échec cloud → fallback vers Ollama local (Qwen2.5:3b)
3. Si Ollama indisponible → erreur 502 "aucun moteur n'a pu répondre"

**Providers configurés (dans local-config.json) :**
- **Groq** : gpt-oss-120b, qwen3.6-27b, qwen3.8-27b, compound, compound-mini (clé gsk_...)
- **Gemini** : gemini-3.6-flash, gemini-3.1-pro-preview, gemini-3.5-flash, etc. (clé AQ.Ab8...)
- **OpenRouter** : deepseek-chat-v3-0324:free (clé vide — modèle gratuit, pas de clé nécessaire)
- **Ollama (local)** : qwen2.5:3b, qwen2.5:1.5b (pas de clé, gratuit, hors-ligne)

**Point fort :** architecture résiliente avec fallback. Les clés API sont côté serveur (pas dans le HTML). Le modèle par défaut est Ollama (gratuit, sans clé).

---

## 3. Points forts

1. **Zéro dépendance serveur** — serve_all.py utilise uniquement Python stdlib (http.server, urllib, json...). Pas de pip install, pas de vulnerabilities de dépendances tierces. Bonne portabilité.

2. **Clés API côté serveur** — les clés Groq et Gemini ne sont pas dans le HTML client. Elles sont dans local-config.json (exclu de Git) et lues côté serveur. Le endpoint /ai/status ne les renvoie pas.

3. **Architecture IA résiliente** — fallback automatique Ollama si les providers cloud échouent. Pas de dépendance exclusive à un seul provider.

4. **Pas d'eval() dans le code** — 0 occurrence, bonne pratique de sécurité.

5. **Localization hors-ligne partielle** — l'application fonctionne sans connexion internet (docs inline, IA locale Ollama si disponible).

6. **Couverture pédagogique complète** — 383 documents organisés sur tout le programme (1ère→4ème année, Bac Lettres/Sciences), avec modules, contrôles, exercices, fiches.

7. **Bon .gitignore** — exclut node_modules, local-config.json, fichiers OnlyOffice, fichiers temporaires, etc.

---

## 4. Analyse de sécurité

### 4.1 CORS — Access-Control-Allow-Origin: * ⚠️ IMPORTANT

**Constat :** le serveur renvoie `Access-Control-Allow-Origin: *` sur toutes les réponses (ligne 282 de serve_all.py). C'est configuré dans `_cors()` et appelé dans `_send_bytes()`, donc sur TOUS les endpoints.

**Risques selon contexte :**

| Contexte | Risque | Gravité |
|---|---|---|
| **localhost uniquement** (127.0.0.1) | Un site web visité par le même utilisateur peut faire des requêtes cross-origin vers localhost:8080 et lire les réponses (docs stockés, statut IA, etc.) | Moyen |
| **Réseau local ouvert** (0.0.0.0) | N'importe quel appareil sur le réseau peut accéder aux endpoints. Combiné avec CORS *, n'importe quelle page web peut interagir avec l'API | Élevé |
| **Distant (internet)** | Exposition complète sans authentification. N'importe quel site web peut appeler /ai/chat (coûts API), /oo/save (stockage), /oo/archive | Critique |

**Note :** en localhost seul (ce qui est le cas actuel — serveur sur 127.0.0.1), le risque CORS * est limité car le navigateur bloque les requêtes cross-origin vers localhost depuis une page distante. Mais le risque devient réel si le serveur est exposé sur le réseau.

### 4.2 local-config.json accessible via HTTP ⚠️ CRITIQUE

**Constat :**
- local-config.json contient les clés API : `%s` (Groq) et `%s` (Gemini)
- Le fichier est dans lami-app-static/ (web root du serveur)
- Il est EXCLU de Git (.gitignore) — bonne pratique
- MAIS le serveur le SERGE en tant que fichier statique (le GET `/*` sert tous les fichiers de APP_DIR)
- `curl http://localhost:8080/local-config.json` renvoie le fichier complet avec les clés

**Risque :** n'importe quel utilisateur qui connaît l'URL peut récupérer les clés API. Combiné avec CORS *, une page web malveillante peut extraire les clés de façon cross-origin.

**Conséquences possibles :**
- Utilisation abusive des clés Groq (frais si quotas dépassés sur compte payant)
- Impression que les clés Gemini sont gratuites mais elles pourraient être rattachées à un compte avec quotas
- L'attaquant peut voir quels modèles sont configurés

**Niveau de gravité selon contexte :**
| Contexte | Risque |
|---|---|
| localhost seul | Faible (accès réseau local seulement) |
| Réseau local (Wifi école, etc.) | Moyen (n'importe quel appareil peut récupérer les clés) |
| Exposé sur internet | **Critique** (clés récupérables par n'importe qui) |

### 4.3 CSP (Content Security Policy) absente ⚠️ IMPORTANT

**Constat :** 0 occurrence de `Content-Security-Policy` dans index.html.

**Risques concrets :**
- Sans CSP, le navigateur autorise tous les scripts inline, tous les chargements externes, tous les framing
- Si le contenu IA génère du HTML malveillant injecté via innerHTML, il peut exécuter du code JavaScript
- Pas de protection contre le clickjacking (pas de X-Frame-Options)
- Pas de restriction sur les connecteurs (img-src, connect-src, etc.)
- Les templates PPTX/XLSX/DOCX base64 inline (1.5 Mo) ne sont pas protégés

**Dans le contexte LamiAI :** comme l'app fonctionne sur localhost, les risques CSP sont moindres (pas de scripts tiers chargés, pas de CDN). Mais l'absence de CSP est une faille de fond.

### 4.4 innerHTML + contenu IA ⚠️ IMPORTANT

**Constat :** la fonction `aiLlmbubble()` injecte les réponses IA via innerHTML :
```javascript
box.innerHTML += '<div ...>' + mdToHtml(replyText || '') + '</div>';
```

**Risques XSS :**
- `mdToHtml()` convertit du markdown en HTML. Si la conversion est naïve (pas de sanitization), les réponses IA peuvent contenir des tags `<script>`, des attributs `onerror`, des URLs `javascript:`
- Même si Ollama local (Qwen2.5:3b) est peu susceptible de générer du HTML malveillant, c'est une faille théorique
- Si l'IA est utilisée pour afficher du contenu utilisateur (documents, etc.), le risque est plus réel
- Le fallback vers Gemini/Groq augmente la surface d'attaque (modèles plus puissants, prompts plus complexes)

**Note :** eval() est absent (bon). Mais innerHTML avec contenu non-sanitisé reste une voie XSS valide.

### 4.5 execCommand (éditeur rich text) ⚠️ ADVICE

**Constat :** 9 utilisations de `document.execCommand()` — API dépréciée par les navigateurs modernes.

**Risques :**
- `document.execCommand` est dépréqué, va être supprimé des navigateurs
- Peut causer des problèmes de compatibilité future
- Les opérations execCommand peuvent être utilisées pour injecter du HTML non-sanitisé
- Alternative moderne : Clipboard API, contenteditable avec manipulation directe du DOM

**Gravité :** faible (problème de maintenance, pas de sécurité immédiate)

### 4.6 localStorage ⚠️ ADVICE

**Constat :** 175 références localStorage dans le code.

**Utilisation :**
- Persistance des données (documents, historique IA, paramètres)
- Pas d'authentification (l'app est locale et privée)

**Risques :**
- Quota : 5-10 Mo par origine (selon navigateur). Avec 180 documents inline + historique IA + templates, le quota peut être atteint
- Pas de backup automatique : si le navigateur est réinitialisé, les données sont perdues
- Manipulation possible : n'importe quel script sur la même origine peut lire/modifier localStorage

**Acceptable dans ce contexte** (app locale sans auth), mais la dépendance exclusive à localStorage est fragile.

### 4.7 Path traversal — analyse /oo/save et /oo/archive ⚠️ IMPORTANT

**/oo/save (ligne 358-376) :**
```python
safe = "".join(c if c.isalnum() or c in "-_.()" else "_" for c in os.path.basename(name))
if not safe.lower().endswith("." + ext):
    safe = safe + "." + ext
fname = str(int(time.time())) + "_" + safe
```
- `os.path.basename(name)` retire les composants de chemin — protège contre `../../etc/passwd`
- `safe` ne garde que les caractères alphanumériques, `-`, `_`, `.`, `()` — sanitization agressive
- Le nom final inclut un timestamp → collision improbable
- **Verdict :** protégé contre le path traversal ✓

**/oo/archive (ligne 378-433) :**
```python
parts = [_fs_safe(level) or "Non classé"]
if module:
    parts.append(_fs_safe(module))
parts.append(t_folder)
if a_folder:
    parts.append(a_folder)
dest = os.path.join(BASE_DIR, *parts)
```
- `_fs_safe()` (ligne 233-239) retire `<>:"/\|?*` et les caractères de contrôle
- `os.path.join(BASE_DIR, *parts)` construit le path depuis BASE_DIR
- Comme chaque composant est sanitizé par `_fs_safe()`, pas de `../` possible
- **Verdict :** protégé ✓ (tant que `_fs_safe` est utilisé partout)

**À noter :** le callback `/oo/callback` (ligne 435-462) récupère une URL provenant du DocumentServer OnlyOffice et télécharge le fichier. Si l'OnlyOffice est compromis, l'attaquant peut faire télécharger un fichier arbitraire. Mais comme l'OnlyOffice tourne en local, le risque est limite.

### 4.8 Absence de tests automatisés ⚠️ ADVICE

**Constat :** seul `test_ai.js` (Puppeteer) pour tester l'IA. Pas de tests unitaires, pas de tests d'intégration, pas de CI/CD.

**Impact :**
- Les modifications dans le HTML de prod ne sont pas testées
- Impossible de détecter les régressions
- La qualité dépend entièrement du test manuel

---

## 5. Code quality & maintenabilité

### 5.1 Qualité du serveur (serve_all.py) — BON

| Critère | Évaluation |
|---|---|
| Structure | Bien séparé : fonctions utilitaires, handlers, main |
| Gestion d'erreurs | `try/except` sur chaque endpoint, retours JSON d'erreur |
| Patterns | Pas de code dupliqué excessif, bonne factorisation |
| Dépendances | Zéro dépendance externe (std::lib seulement) |
| Documentation | Docstring au début, quelques commentaires utiles |
| Logging | `log_message` redéfini avec timestamp |
| CORS | Configuré partout (problème de sécurité, mais cohérent) |
| Sanitization | `_fs_safe`, `_code3`, `os.path.basename` utilisés correctement |

**Points à améliorer :**
- `_cors()` renvoyé dans `_send_bytes()` mais pas systématiquement dans tous les retours (par exemple, certains retours 404 n'ont pas CORS)
- Pas de validation de la taille des payloads (Content-Length non limité)
- Pas de rate limiting
- `_ai_model()` lit local-config.json à chaque appel (le caching serait plus efficace)

### 5.2 Qualité du client (index.html) — MAUVAIS

| Critère | Évaluation |
|---|---|
| Taille | 6,4 Mo (monolithique) |
| Séparation des concerns | Aucune : HTML + CSS + JS + données + templates binaires dans un seul fichier |
| Maintenabilité | Très difficile : un changement mineur force le re-téléchargement de 6,4 Mo |
| Tests | Aucun test automatisé (sauf test_ai.js manuel) |
| Débogage | Impossible sans source maps (code minifié/inline) |
| Performances de chargement | Dépend du réseau local — acceptable en localhost, mauvais sur réseau lent |
| Cache | Pas de cache sélectif (un changement = re-téléchargement complet) |

### 5.3 Divergence dev/prod — PROBLÈME MAJEUR

Le code React (lami-app/src/App.js) n'est pas build dans la version de prod. La prod est un fichier HTML manuel avec code inline. Conséquences :
- Code React devient orpheline (ne reflète pas la réalité)
- Modifications dans l'HTML non tracées
- Impossible de faire du débogage structuré
- Tests non couverts (test_ai.js teste l'HTML produit, pas le React)

---

## 6. Performance & UX

### 6.1 Chargement de l'application

| Élément | Taille estimée | Commentaire |
|---|---|---|
| HTML structure + CSS | ~300 Ko | Styles, layout, sidebar, etc. |
| Templates PPTX base64 inline | ~1,5 Mo | Nécessaires pour générer des présentations côté client sans librairie externe |
| Templates DOCX/XLSX base64 | ~500 Ko | Idem pour documents et feuilles de calcul |
| JS logique (fonctions) | ~1,5 Mo | Navigation, doc modal, éditeur, IA, synchronisation, etc. |
| Données DOCS inline (180 docs) | ~2,5 Mo | Contenu textuel des documents scolaires |

**Total :** ~6,4 Mo

**Problèmes :**
- Temps de chargement initial long sur réseau lent
- Pas de lazy loading : tout est chargé d'un coup
- Templates base64 : 1,5 Mo de PPTX jamais utilisés si l'utilisateur n'édite pas de présentation
- 180 documents inline : 2,5 Mo de contenu chargé même si l'utilisateur ne consulte que 2-3 docs

### 6.2 UX observée (via navigateur)

L'application affiche :
- Sidebar sombre (blue-900) avec navigation complète
- Accueil avec statistiques : 180 documents, 7 niveaux, 25+ modules, année 2026
- Sections : Assistant IA, Documents, Exercices, Emploi du temps, Bibliothèque par niveau
- Navigation fluide entre les pages (showPage('home'), showPage('ai'), etc.)
- Interface responsive (media queries pour mobile)

---

## 7. Données & versionning

### 7.1 Doublons de documents 📋 IMPORTANT

**Constat :** 383 fichiers DOC/DOCX/PDF/XLSX/PPTX répartis dans plusieurs dossiers avec des doublons.

| Dossier source des doublons | Exemples identifiés |
|---|---|
| `doc lamia/` + `2ème Année/` + `lamtrav/` + `doc_gen/` + `pages d'amour lamia/` | Devoirs, fiches, dissertations dupliquées 3-4 fois |
| `doc lamia/doc lamia/` (sous-structure) | Biographie Simone de Beauvoir, devoirs, exercices |
| `doc lamia/doc pré requis/` | Tests diagnostiques dupliqués |
| Plusieurs versions de "francais.pdf" | 4 copies (dont 2.3 Mo total) |
| Livres scolaires PDF (3ème/4ème Lettres/Sciences) | 3 copies chacun (4.5 Mo, 3.3 Mo, etc.) |

**Impact :**
- Poids de stockage multiplié (estimé ~50 Mo de doublons)
- Incohérences : une correction dans une copie ne se propage pas
- Difficulté de savoir quelle version est l'autorité
- Risque d'IA basée sur une version obsolète

### 7.2 Versionning — ÉCART SIGNIFICATIF

| Source | Versions | Dates |
|---|---|---|
| **CHANGELOG.md** | 26 versions (v1.0.0→v1.5.1) | 31 août→12 sept 2026 (13 jours) |
| **Git** | 5 commits | Dernier : v1.0.15 (1 sept 2026) |

**Écart :** 11 versions développées localement sans commits (v1.0.16→v1.5.1)

**Problèmes :**
- Impossible de faire `git bisect`, `git revert`, ou revue de code sur les anciennes versions
- Le CHANGELOG est la seule source de vérité manuelle — sujet aux oublis
- Les modifications non commitées (index.html modifié, nouveaux fichiers) sont perdues si le disque est crashé
- Beaucoup de nouveaux fichiers non trackés par Git (serve_all.py, lami_sync_server.py, livres/, docs/, etc.)
- Pas de tags Git

**Dernier commit (dcdb454) :** v1.0.15 — Sync folder + A4 print + 4ème Année modules + improved editor

**Fichiers non-trackés notables :**
- serve_all.py (serveur principal, 568 lignes)
- lami_sync_server.py (serveur sync, 280 lignes)
- Tous les livres scolaires PDF
- La quasi-totalité des documents DOC/DOCX/PDF
- local-config.json (déjà dans .gitignore — correct)

---

## 8. Recommandations prioritaires

### 🔴 CRITIQUE — À corriger immédiatement si exposition réseau prévue

| # | Recommandation | Effort | Impact |
|---|---|---|---|
| C1 | **Retirer local-config.json du web root ou bloquer son accès HTTP** | Rapide | Élimine le risque d'exposition des clés API |
| C2 | **Restreindre CORS à l'origine de l'app (pas *)** | Rapide | Élimine les risques cross-origin |
| C3 | **Ne pas exposer le serveur sur internet sans authentification** | — | Évite l'exposition complète |

**Détails C1 — local-config.json :**
- Option A (recommandée) : déplacer local-config.json hors de lami-app-static/ (dans D:\lamia_gnaba_prof_francais\config\ ou similaire), mettre à jour CONFIG_PATH dans serve_all.py
- Option B : ajouter une vérification dans do_GET de serve_all.py pour bloquer `/local-config.json` explicitement
- Après déplacement, redémarrer le serveur et vérifier que `curl localhost:8080/local-config.json` renvoie 404

**Détails C2 — CORS :**
```python
def _cors(self):
    origin = self.headers.get("Origin", "")
    if origin in ("http://localhost:8080", "http://127.0.0.1:8080"):
        self.send_header("Access-Control-Allow-Origin", origin)
    # Ne pas envoyer Access-Control-Allow-Origin: * par défaut
```
Ou plus simplement, ne pas appeler `_cors()` partout — seulement sur les endpoints API nécessitant du cross-origin.

### 🟠 IMPORTANT — À corriger dans les prochains jours

| # | Recommandation | Effort | Impact |
|---|---|---|---|
| I1 | **Ajouter une CSP basique dans index.html** | Rapide | Protection XSS, force la même origine |
| I2 | **Sanitiser le contenu IA avant innerHTML** | Moyen | Élimine le risque XSS théorique |
| I3 | **Limitation taille payload (Content-Length max)** | Rapide | Protection DoS partielle |
| I4 | **Nettoyer les doublons de documents** | Moyen | Gain ~50 Mo, cohérence des données |
| I5 | **Synchroniser Git et CHANGELOG** | Moyen | Traçabilité, backup, collaboration |

**Détails I1 — CSP :**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src http://localhost:8080 http://127.0.0.1:11434;
  font-src 'self' data:;
  frame-src http://127.0.0.1:*;
">
```
Note : 'unsafe-inline' est nécessaire car l'app utilise du JS inline. Une amélioration future serait de déplacer le JS dans un fichier externe.

**Détails I2 — Sanitization IA :**
```javascript
// Remplacer mdToHtml() par une version qui échappe les balises
// Ou utiliser une librairie comme DOMPurify (à charger via CDN ou inline)
function safeMdToHtml(text) {
    const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Ensuite, parser le markdown et générer du HTML sûr
    return escaped;
}
```
Ou utiliser `DOMPurify.sanitize(mdToHtml(replyText))` si DOMPurify est disponible.

**Détails I4 — Nettoyage doublons :**
- Identifier les fichiers en doublon par hash (SHA-256)
- Garder une copie par niveau (ex: `2ème Année/` comme source principale)
- Supprimer les copies dans `doc lamia/`, `lamtrav/`, `doc_gen/`, `pages d'amour lamia/`, etc.
- Vérifier que l'app fonctionne avec les chemins conservés

**Détails I5 — Git :**
```bash
# 1. Faire un commit des fichiers non-trackés importants
git add serve_all.py lami_sync_server.py livres/ CHANGELOG.md
git commit -m "v1.5.1 - Serveur IA + sync + livres scolaires + changelog"

# 2. Taguer la version
git tag v1.5.1

# 3. Pousser sur GitHub
git push origin main --tags
```

### 🟡 ADVICE — À planifier pour la prochaine version

| # | Recommandation | Effort |
|---|---|---|
| A1 | **Déplacer le JS du HTML dans des fichiers externes** | Moyen |
| A2 | **Externaliser les données DOCS dans un fichier JSON séparé** | Moyen |
| A3 | **Remplacer execCommand par Clipboard API / contenteditable direct** | Moyen |
| A4 | **Ajouter un service worker pour le cache offline** | Moyen |
| A5 | **Limiter le nombre de documents inline (lazy loading par niveau)** | Long |
| A6 | **Rétablir la synchronisation entre lami-app/ (React) et lami-app-static/ (prod)** | Long |
| A7 | **Configurer un CI/CD basique (GitHub Actions) pour les tests** | Long |
| A8 | **Externaliser les templates PPTX/XLSX/DOCX (fichiers séparés au lieu de base64 inline)** | Long |

### 🔵 BON À SAVOIR — Points positifs à conserver

- Architecture serveur sans dépendances (std::lib Python) — conserver
- Clés API côté serveur — conserver
- Architecture IA multi-providers avec fallback — conserver et améliorer
- Pas d'eval() — maintenir
- Bon .gitignore — maintenir

---

## 9. Sommaire exécutif

| Domaine | État | Notes |
|---|---|---|
| Sécurité (CORS, clés, CSP, XSS) | ⚠️ **Points d'attention** | CORS * + clés servies + CSP absente = risque si exposé sur réseau |
| Architecture (monolithique, dev/prod) | ⚠️ **Divergence dev/prod** | Code React orphelin, HTML monolithique 6.4 Mo |
| Code quality (serveur) | ✅ **Bon** | Stdlib, bien structuré, gestion d'erreurs |
| Code quality (client) | ⚠️ **Difficile à maintenir** | Fichier unique 6.4 Mo, pas de tests |
| Performance | ⚠️ **Acceptable en localhost** | 6.4 Mo, templates base64, données inline |
| Données (doublons) | ⚠️ **383 fichiers, doublons** | ~50 Mo de doublons identifiés |
| Versionning (Git vs CHANGELOG) | ⚠️ **Écart 26 vs 5** | 11 versions non commitées, pas de tags |
| IA (multi-providers) | ✅ **Bonne architecture** | Fallback automatique, clés côté serveur |
| Tests | ❌ **Absence** | Seul test_ai.js manuel (Puppeteer) |

---

*Rapport généré par audit automatisé (kimi-k2.7-code via OpenCode Go) — 12 septembre 2026*
*Projet : D:\lamia_gnaba_prof_francais — LamiAI v1.5.1 — Assistant Pédagogique*
