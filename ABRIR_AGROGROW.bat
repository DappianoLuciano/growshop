@echo off
title AgroGrow Admin
color 0A
cls

echo ================================================
echo    AGROGROW ADMIN - APLICACION DESKTOP
echo ================================================
echo.

echo [Paso 1] Iniciando Next.js...
start "NextJS-AgroGrow" /MIN cmd /c "npm run dev"

echo [Paso 2] Esperando 25 segundos...
timeout /t 25 /nobreak >nul

echo [Paso 3] Abriendo Electron...
echo.
node_modules\electron\dist\electron.exe .

echo.
echo.
echo La aplicacion se cerro.
pause
