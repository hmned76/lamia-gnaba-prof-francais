@echo off
REM Lance les regles pare-feu LamiAI en Administrateur (a faire UNE fois)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','\"%~dp0regles-pare-feu.ps1\"'"
echo.
echo Si une fenetre bleue (UAC) apparait : clique OUI.
pause