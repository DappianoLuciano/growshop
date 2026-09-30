@echo off
echo ========================================
echo   AgroGrow Admin - Aplicacion Desktop
echo ========================================
echo.
echo PASO 1: Iniciando Next.js...
echo.

REM Iniciar Next.js en una ventana separada
start "Next.js Server" cmd /k "npm run dev"

echo Esperando 20 segundos a que Next.js inicie...
timeout /t 20 /nobreak

echo.
echo PASO 2: Abriendo Electron...
echo.

REM Crear archivo electron simple
echo const { app, BrowserWindow } = require('electron') > electron\launch.js
echo. >> electron\launch.js
echo app.whenReady().then(() =^> { >> electron\launch.js
echo   const win = new BrowserWindow({ >> electron\launch.js
echo     width: 1400, >> electron\launch.js
echo     height: 900, >> electron\launch.js
echo     title: 'AgroGrow Admin', >> electron\launch.js
echo     webPreferences: { devTools: true } >> electron\launch.js
echo   }) >> electron\launch.js
echo   win.loadURL('http://localhost:3000/admin/dashboard') >> electron\launch.js
echo   win.webContents.openDevTools() >> electron\launch.js
echo }) >> electron\launch.js
echo. >> electron\launch.js
echo app.on('window-all-closed', () =^> { >> electron\launch.js
echo   if (process.platform !== 'darwin') app.quit() >> electron\launch.js
echo }) >> electron\launch.js

REM Ejecutar electron
npx electron electron\launch.js

pause
