@echo off
title LamiAI - Installation pour votre PC (Prof / Eleve)
chcp 65001 >nul
echo ============================================================
echo    LamiAI - Assistant Pedagogique Prof. Lamia Gnaba
echo    Installation sur votre ordinateur (bibliotheque personnelle)
echo ============================================================
echo.
echo Ce kit installe Votre PROPRE bibliothèque LamiAI sur ce PC :
echo  - le serveur local demarre automatiquement (invisible)
echo  - vos documents sont sauvegardes ICI, sur CE disque
echo  - l'interface = http://localhost:8080 (ou http://lamiai:8080)
echo.

REM ---- 1. Verifier Python ----
set PYOK=0
where python >nul 2>nul && set PYOK=1
if "%PYOK%"=="0" (
  echo [1/3] Python n'est pas installe — telechargement automatique...
  powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; Invoke-WebRequest 'https://www.python.org/ftp/python/3.12.4/python-3.12.4-amd64.exe' -OutFile $env:TEMP\python-setup.exe"
  if exist "%TEMP%\python-setup.exe" (
    start /wait "%TEMP%\python-setup.exe" /quiet InstallAllUsers=1 PrependPath=1
    set PYOK=1
  ) else (
    echo   ! Impossible de telecharger Python. Installez-le depuis python.org puis relancez.
    pause
    exit /b
  )
)
echo    Python OK

REM ---- 2. Copier le projet ici (depuis le dossier source du kit)
set SRC=%~dp0LamiAI
if not exist "%SRC%" (
  echo [!] Dossier "LamiAI" introuvable a cote de l'installateur. Placez le dossier du projet a cote de ce .bat.
  pause
  exit /b
)
set DST=%SystemDrive%\LamiAI
if exist "%DST%" (
  echo    Un LamiAI existe deja — mise a jour des fichiers (vos documents restent)...
) else (
  mkdir "%DST%"
  echo    Creation de %DST%
)
robocopy "%SRC%" "%DST%" /E /NFL /NDL /NJH /NJS >nul
echo    Bibliotheque + implicate copie OK

REM ---- 3. Demarrage automatique invisible (comme chez la prof)
powershell -NoProfile -Command "Copy-Item '%DST%\LamiAI-Demarrage-Invisible.vbs' ([Environment]::GetFolderPath('Startup')+'\LamiAI-Demarrage-Invisible.vbs') -Force" >nul
powershell -NoProfile -Command "Copy-Item '%DST%\LamiAI-Sync-Invisible.vbs' ([Environment]::GetFolderPath('Startup')+'\LamiAI-Sync-Invisible.vbs') -Force" >nul
echo    Demarrage automatique (invisible) installe

REM ---- 4. Raccourci bureau
powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\LamiAI.lnk')" >nul 2>nul
powershell -NoProfile -Command "$w=[Environment]::GetFolderPath('Desktop')+'\LamiAI.lnk'; $s=(New-Object -ComObject WScript.Shell).CreateShortcut($w); $s.TargetPath=$env:ComSpec; $s.Arguments='/c \"cd /d %SystemDrive%\LamiAI && start http://localhost:8080\"'; $s.Save()" >nul
echo    Raccourci bureau LamiAI cree

REM ---- 5. Premier demarrage direct
cd /d "%DST%"
wscript LamiAI-Demarrage-Invisible.vbs
timeout /t 5 >nul
start http://localhost:8080

echo.
echo ============================================================
echo   ✅ INSTALLATION TERMINEE — LamiAI tourne sur ce PC
echo   Vos travaux se sauvegardent sur CE disque.
echo   (OnlyOffice : lancer onlyoffice=~2 GB installateur si absent)
echo ============================================================
pause
