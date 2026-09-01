@echo off
echo ========================================
echo  LamiAI - Synchronisation PC
echo ========================================
echo.

cd /d D:\lamia_gnaba_prof_francais

echo [1/3] Récupération depuis GitHub...
git pull origin main

echo.
echo [2/3] Vérification des données...
if exist "sync\data-phone.json" (
    echo    ✓ Données téléphone trouvées
    echo    Dernière modification :
    for %%A in (sync\data-phone.json) do echo    %%~tA
) else (
    echo    ✗ Aucune donnée téléphone
)

echo.
echo [3/3] Terminé !
echo.
echo Pour ouvrir l'app : http://localhost:8080
echo.
pause
