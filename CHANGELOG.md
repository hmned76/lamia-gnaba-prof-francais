# Historique des versions — LamiAI

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
