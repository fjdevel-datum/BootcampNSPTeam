@echo off
echo ======================================
echo LIMPIANDO CACHE Y REINICIANDO VITE
echo ======================================
echo.

echo [1/4] Deteniendo servidor de desarrollo...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Limpiando cache de Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist

echo [3/4] Limpiando cache de npm...
call npm cache clean --force

echo [4/4] Iniciando servidor...
echo.
echo ======================================
echo SERVIDOR INICIANDO - ABRE:
echo http://localhost:5173
echo ======================================
echo.
echo CTRL+C para detener
echo.

call npm run dev
