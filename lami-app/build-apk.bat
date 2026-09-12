@echo off
setlocal
set "ROOT=%~dp0.."
set "APP=%ROOT%\lami-app-static"

echo ============================================
echo  LamiAI - Build APK depuis la version web
echo ============================================
echo.
if not exist "%APP%\package.json" (
  echo ERREUR : projet Capacitor introuvable : %APP%
  exit /b 1
)
if not exist "%APP%\www" mkdir "%APP%\www"

echo [1/4] Copie de la version web validee...
copy /Y "%APP%\index.html" "%APP%\www\index.html" >nul
if exist "%APP%\livres" robocopy "%APP%\livres" "%APP%\www\livres" /E /NFL /NDL /NJH /NJS /NP >nul

echo [2/4] Installation des dependances Capacitor...
pushd "%APP%"
if not exist "node_modules\@capacitor\cli" call npm install
if errorlevel 1 (popd & exit /b 1)

echo [3/4] Synchronisation Android...
call npx cap sync android
if errorlevel 1 (popd & exit /b 1)

echo [4/4] Compilation APK debug...
call android\gradlew.bat :app:assembleDebug
set "RESULT=%ERRORLEVEL%"
popd
if not "%RESULT%"=="0" exit /b %RESULT%

echo.
echo APK cree : %APP%\android\app\build\outputs\apk\debug\app-debug.apk
exit /b 0
