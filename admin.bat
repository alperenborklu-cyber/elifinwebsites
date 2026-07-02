@echo off
CHCP 65001 > NUL
title Poppy Playroom - Yönetim Paneli Başlatıcı
echo ===================================================
echo   Poppy Playroom Yönetim Paneli Başlatılıyor...
echo ===================================================
echo.

:: Check node_modules folder
if not exist "node_modules\" (
    echo [BİLGİ] Bağımlılıklar eksik. npm install çalıştırılıyor...
    echo Lütfen bekleyin, bu işlem biraz zaman alabilir...
    call npm install
    if %errorlevel% neq 0 (
        echo [HATA] npm install sırasında bir hata oluştu! Lütfen Node.js'in kurulu olduğundan emin olun.
        pause
        exit /b %errorlevel%
    )
    echo [BAŞARILI] Tüm kütüphaneler yüklendi!
    echo.
)

:: Start node server in the background
echo [BİLGİ] Yönetim paneli sunucusu başlatılıyor (port 3000)...
start "Poppy Admin Server" cmd /k "node admin/server.js"

:: Wait for server to spin up
timeout /t 2 /nobreak > NUL

:: Open web page
echo [BİLGİ] Tarayıcı açılıyor...
start http://localhost:3000/admin

echo.
echo ===================================================
echo   Sunucu aktif! 
echo   Admin Panelini açmak için tarayıcınızda:
echo   http://localhost:3000/admin
echo.
echo   Kapatmak için açılan siyah sunucu penceresini
echo   kapatabilir ya da bu pencereye basıp çıkabilirsiniz.
echo ===================================================
echo.
pause
