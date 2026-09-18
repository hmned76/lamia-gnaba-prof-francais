@echo off
title LamiAI - Colonne GitHub (pull+push auto)
cd /d D:\lamia_gnaba_prof_francais
echo [%date% %time%] Colonne GitHub demarree >> lami-server.log
:loop
git pull --rebase --quiet >> lami-server.log 2>&1
git add -A --quiet
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "sync auto %date% %time%" --quiet >> lami-server.log 2>&1
  git push origin --quiet >> lami-server.log 2>&1
)
timeout /t 60 /nobreak >nul
goto loop
