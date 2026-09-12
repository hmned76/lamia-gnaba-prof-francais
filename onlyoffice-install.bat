@echo off
title Installation ONLYOFFICE Docs (open source) - LamiAI
echo ============================================================
echo   Installation du mode edition OnlyOffice (gratuit, open source)
echo   Version : ONLYOFFICE Docs Community Edition  /  AGPL v3
echo ============================================================
echo.
echo   Etape 1/2 : telechargement officiel...
echo   (votre navigateur va s'ouvrir sur la page de telechargement)
echo   - Cochez "Docs Community Edition"
echo   - Choisissez le fichier  onlyoffice-documentserver.exe
echo   - Enregistrez-le a cote de ce dossier de travail
echo.
start "" "https://www.onlyoffice.com/download-docs.aspx?from=api#docs-community"
echo   Etape 2/2 : lancement de l'installeur...
echo.
set "EXE=onlyoffice-documentserver.exe"
if not exist "%EXE%" set "EXE=%~dp0onlyoffice-documentserver.exe"
if exist "%EXE%" (
  echo   Installeur trouve : "%EXE%"
  start "" "%EXE%"
  echo.
  echo   Suivez l'assistant : Suivant - Suivant - Installer.
  echo   Le DocumentServer tournera en arriere-plan (port 80 par defaut).
  echo.
  echo   Puis dans l'application LamiAI :
  echo     - Onglet  OnlyOffice
  echo     - Reglages :  http://localhost   (bouton installateur Windows)
  echo     - Enregistrer, Recharger, puis  "Tester la connexion"
) else (
  echo   Installeur introuvable pour le moment.
  echo   Apres le telechargement, deplacez  onlyoffice-documentserver.exe
  echo   dans le dossier  D:\lamia_gnaba_prof_francais
  echo   puis relancez ce fichier (ou double-cliquez directement sur l'exe).
  echo.
  echo   Adresse a utiliser ensuite dans l'app :  http://localhost
)
echo.
pause