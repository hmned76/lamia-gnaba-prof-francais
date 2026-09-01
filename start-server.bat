@echo off
echo ========================================
echo  LamiAI - Serveur Local
echo ========================================
echo.
echo URL : http://localhost:8080
echo.
cd /d D:\lamia_gnaba_prof_francais\lami-app-static
python -m http.server 8080
