@echo off
REM ============================================
REM  LamiAI - Connexion du 2eme PC a la meme base
REM  (le serveur principal tourne sur le PC de la Prof : 100.104.240.32:8080)
REM ============================================
setlocal
echo Verification du serveur LamiAI...
ping -n 1 100.104.240.32 >nul 2>&1
if errorlevel 1 (
  echo.
  echo [X] Le PC principal est INJOIGNABLE via Tailscale.
  echo     Verifie que : 1) Tailscale est lance et connecte sur CE PC
  echo                   2) le PC principal est allume et Tailscale aussi
  echo     Puis relance ce fichier.
  echo.
  pause
  exit /b 1
)
echo [OK] PC principal joignable. Ouverture de l'application...
start "" "http://100.104.240.32:8080"
exit /b 0