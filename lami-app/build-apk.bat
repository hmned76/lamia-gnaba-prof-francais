@echo off
echo ============================================
echo  LamiAI - Build APK (PC + Android)
echo ============================================
echo.
echo [1/4] Installation Capacitor...
npm install -g @capacitor/core @capacitor/cli
echo.
echo [2/4] Ajout Android...
npx cap add android
echo.
echo [3/4] Copie des fichiers web...
cp -r public/* www/
necho.
echo [4/4] Synchronisation...
npx cap sync android
echo.
echo ============================================
echo  APK créé dans : android/app/build/outputs/apk/
echo ============================================
pause
