@echo off
echo ========================================
echo   GrowShop Admin - Aplicacion Desktop
echo ========================================
echo.
echo Iniciando aplicacion en modo desarrollo...
echo.
echo IMPORTANTE:
echo - Asegurate de tener PostgreSQL corriendo
echo - Verifica que el archivo .env este configurado
echo.
pause
echo.
echo Iniciando Next.js y Electron...
echo.
call npm run electron:dev
