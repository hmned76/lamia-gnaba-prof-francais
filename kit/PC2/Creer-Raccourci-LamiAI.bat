@echo off
REM ============================================================
REM  LamiAI - Cree un raccourci sur le Bureau de CE PC
REM  Ce raccourci ouvre l'app connectee au serveur de la Prof
REM  (adresse : 192.168.100.29:8080 = meme wifi)
REM  Rien a installer. Double-clique puis verifie ton Bureau.
REM ============================================================
setlocal
echo Creation du raccourci...
echo    Bureau  ->  "LamiAI (PC de la Prof).lnk"
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desktop = [Environment]::GetFolderPath('Desktop');" ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$sc = $ws.CreateShortcut((Join-Path $desktop 'LamiAI (PC de la Prof).lnk'));" ^
  "$sc.TargetPath = 'http://192.168.100.29:8080';" ^
  "$sc.IconLocation = 'shell32.dll,13';" ^
  "$sc.Description = 'LamiAI - application de la Prof';" ^
  "$sc.Save()"
if exist "%userprofile%\Desktop\LamiAI (PC de la Prof).lnk" (
  echo.
  echo [OK] Raccourci cree sur ton Bureau !
  echo       Double-clique dessus pour ouvrir LamiAI.
) else (
  echo [ERREUR] Raccourci non trouve.
)
echo.
pause