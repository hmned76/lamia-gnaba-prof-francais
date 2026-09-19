@echo off
title LamiAI Serveur (garde-fou auto)
cd /d "D:\lamia_gnaba_prof_francais"
echo [%date% %time%] Guardien LamiAI demarre > lami-server.log
:loop
REM -----------------------------------------------
REM Garde le port 8080 UNIQUEMENT pour le serveur LamiAI :
REM tue tout serve_all.py lancee depuis UNE AUTRE installation (autre projet via .venv ou python D:\)
REM - essai 1 fois pour toutes a chaque relance
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | Where-Object { \"$($_.CommandLine)\" -match 'serve_all.py' -and (\"$($_.ExecutablePath)\" -notmatch 'C:\\\\Python') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; Write-Output ('killed foreign serve_all ' + $_.ProcessId) }" >> lami-server.log 2>&1
timeout /t 1 /nobreak >nul
"C:\Python\python.exe" serve_all.py --host 0.0.0.0 >> lami-server.log 2>&1
echo [%date% %time%] Serveur relance automatiquement >> lami-server.log
timeout /t 2 /nobreak >nul
goto loop
