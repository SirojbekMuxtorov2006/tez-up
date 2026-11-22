@echo off
title Tez-Up POS - Ishga tushirish
color 0b

echo ========================================================
echo        TEZ-UP POS RESTAURANT SYSTEM v2.5 PRO
echo ========================================================
echo.

:: 1. Agar Node.js o'rnatilgan bo'lsa va Electron mavjud bo'lsa
where electron >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Electron orqali Desktop rejimida ishga tushirilmoqda...
    electron .
    goto end
)

:: 2. Agar npm mavjud bo'lsa
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if exist node_modules (
        echo [OK] Loyiha ishga tushirilmoqda...
        npm start
        goto end
    ) else (
        echo [*] Birinchi marta ishga tushirish: Kutubxonalar o'rnatilmoqda...
        call npm install
        call npm start
        goto end
    )
)

:: 3. Agar Node/Electron o'rnatilmagan bo'lsa, to'g'ridan-to'g'ri standart brauzerda Kiosk / App rejimida ochish
echo [*] Standart Windows brauzerida POS ilovasi ochilmoqda...
start msedge --app="%~dp0index.html" --start-fullscreen || start chrome --app="%~dp0index.html" || start "" "%~dp0index.html"

:end
exit
