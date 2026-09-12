@echo off
title OnlyOffice DocumentServer - LamiAI v1.0.62
echo ========================================
echo  OnlyOffice Document Server (open source)
echo  Version gratuite, hebergee sur votre PC
echo  Port : 8083  -  http://localhost:8083
echo ========================================
echo.
where docker >nul 2>nul
if errorlevel 1 (
  echo [!] Docker n'est pas installe.
  echo     Telechargez et installez Docker Desktop :
  echo     https://www.docker.com/products/docker-desktop/
  echo     Puis relancez ce fichier.
  echo.
  start "" "https://www.docker.com/products/docker-desktop/"
  pause
  exit /b 1
)
echo [1/2] Verification du moteur Docker...
docker info >nul 2>nul
if errorlevel 1 (
  echo [!] Docker Desktop n'est pas demarre.
  echo     Ouvrez Docker Desktop, attendez qu'il soit pret, puis relancez.
  echo.
  start "" "Docker Desktop"
  pause
  exit /b 1
)
echo.
echo [2/2] Lancement du conteneur onlyoffice/documentserver...
docker rm -f onlyoffice >nul 2>nul
docker run -i -t -d --name onlyoffice --restart=always -p 8083:80 ^
  -e ALLOW_PRIVATE_IP_ADDRESS=true onlyoffice/documentserver:latest
echo.
echo Attente du demarrage (la 1ere fois : telechargement ~2 Go)...
timeout /t 10 /nobreak >nul
echo.
echo ========================================
echo  OK - OnlyOffice DocumentServer :
echo  http://localhost:8083
echo  Dans LamiAI : onglet OnlyOffice -^> copier 8083 :
echo  (onglet OnlyOffice -^> Recharger -^> Tester la connexion)
echo ========================================
echo.
pause