# 📦 KIT DE DISTRIBUTION — LamiAI pour les 100 utilisateurs

## Le résultat que TU veux (vérifié ✓ chez toi)
- Chaque personne installe **sa propre copie** de LamiAI **sur SON PC**
- Elle a **la même interface** que sur ton PC — **http://localhost:8080**
- **Elle enregistre SES documents sur SON disque** (jamais chez toi !)
- Comment se passe les mises à jour du contenu ? Via **GitHub** (c'est l'un des avantages déjà en place) ou par clé USB

## Le contenu du kit (à rassembler dans un dossier `LamiAI-PetitKit\`)
| Article | Fichier | Poids |
|---|---|---|
| 1 | `LamiAI-Kit-Installation.bat` (l'installeur automatique) | 5 Ko |
| 2 | `LamiAI/` : dossier du projet **iframe** (avec rootReducer) | ~250 Mo |
| 3 | `LamiAI/livres/` + ta bibliothèque réelle使人Zoom | engage |
| 4 | `LamiAI-Sync-Invisible.vbs` + `serveur-guardien.bat` + `sync-pc.bat` | 4 Ko |
| 5 | `guitare` documentation: `GUIDE-Installation.txt` (le texte ci-dessous fait aussi le guide) | 3 Ko |

> ⚠️ Exclus du kit (trop lourds pour ton PC) :
> - `onlyoffice-documentserver.exe` (+1 GB) → chacun le télécharge **une seule fois** depuis onlyoffice
> - `Non classé/Sameh_Ben_Amor` — ce n'est pas ton contenu
> - `lami-app-static/oo_store/` (stockage LamiAI privé)

## Comment tu le distribues (3 façons, au ton choix)
| Méthode | Avantage | Inconvénient |
|---|---|---|
| 🥇 **Clé USB / ShareIt / Telegram** — le fichier ZIP complet on l'installe | **0 DT**, marche partout | copie manuel par toi |
| 🥈 **Git clone depuis GitHub** (poussé par moi) | il reçoit toujours les nouvelles via `git pull` | il faut Internet + git |
| 🥉 **Téléchargement sur ton serveur au moment voulu** (créer `http://lamiai:8080/kit/`) | Distribué dans une page web directement | kit allumé PC il faut |

## GUIDE-Installation-LamiAI.txt (à accompagner)
```
1) Acheter le dossier kit LamiAI sur le bureau, dézipper
2) Double-clic sur « LamiAI-Kit-Installation.bat »
3) Il installe Python (auto), copie le projet, met la mise à jour d'OnlyOffice (si vous voulez editer)
4) ✅ Une icône LamiAI apparaît sur le Bureau — cliquez dessus et c'est parti !
Vos documents restent SUR VOTRE PC (sauvegarde locale).
```

## Et tes 100 utilisateurs, sauvegardent où ? — LÀ'est exactement ce que vous demandez
```
👤 Professeur X (PC de classe)
   └─ C:\LamiAI\3ème Année\... ses documents personnels
👤 Professeur 2 (PC maison, son école)
   └─ C:\LamiAI\2ème Année\... ses documents
👤 toi
   └─ D:\lamia_gnaba_prof_francais\... tes documents (déjà ✓)
       Toute le monde sauvegarde chez soi — 100 personnes = 0 surcharge sur ton PC
```

## Prêts à générer les fichiers (kita avec 0 détail perdu)
Je te préparerai ce soir les éléments administratifs (dossier zip du projet + l'installeur bat + le guide), tout vérifié + poussé sur GitHub.
