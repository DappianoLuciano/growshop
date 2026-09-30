@echo off
title AgroGrow Admin - Launcher
color 0A

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║   AGROGROW ADMIN - APLICACION DESKTOP     ║
echo  ╚═══════════════════════════════════════════╝
echo.

REM Paso 1: Iniciar Next.js
echo [1/3] Iniciando servidor Next.js...
start "Next.js - AgroGrow" /MIN cmd /c "npm run dev"

REM Esperar a que Next.js inicie
echo [2/3] Esperando a Next.js (25 segundos)...
timeout /t 25 /nobreak >nul

REM Paso 2: Abrir Electron
echo [3/3] Abriendo aplicacion...
echo.

REM Ejecutar Electron directamente
node_modules\electron\dist\electron.exe .

REM Si Electron se cierra, preguntar si cerrar Next.js
echo.
echo.
echo La aplicacion se cerro.
echo.
choice /C SN /M "Cerrar el servidor Next.js tambien"
if errorlevel 2 goto END
if errorlevel 1 goto KILL

:KILL
echo Cerrando Next.js...
taskkill /F /FI "WINDOWTITLE eq Next.js - AgroGrow*" >nul 2>&1
echo.
echo ✓ Todo cerrado
pause
goto END

:END
