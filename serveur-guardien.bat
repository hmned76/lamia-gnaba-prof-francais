@echo off
title LamiAI Serveur (garde-fou auto)
cd /d "D:\lamia_gnaba_prof_francais"
echo [%date% %time%] Guardien LamiAI demarre > lami-server.log
:loop
"C:\Python\python.exe" serve_all.py --host 0.0.0.0 >> lami-server.log 2>&1
echo [%date% %time%] Serveur relance automatiquement >> lami-server.log
timeout /t 2 /nobreak >nul
goto loop
