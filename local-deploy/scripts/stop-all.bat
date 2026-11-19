@echo off
REM Stock Game - Stop All Services
REM This script stops PostgreSQL, Backend, Frontend, and Cloudflare Tunnel

echo ========================================
echo Stock Game - Stopping All Services
echo ========================================
echo.

echo [1/4] Stopping Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe 2>nul
if %errorlevel% equ 0 (
    echo Cloudflare Tunnel stopped
) else (
    echo Cloudflare Tunnel was not running
)

echo [2/4] Stopping React frontend...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo Frontend stopped
) else (
    echo Frontend was not running
)

echo [3/4] Stopping Spring Boot backend...
taskkill /F /IM java.exe 2>nul
if %errorlevel% equ 0 (
    echo Backend stopped
) else (
    echo Backend was not running
)

echo [4/4] Stopping PostgreSQL database...
docker stop stock-postgres 2>nul
docker rm stock-postgres 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL stopped and removed
) else (
    echo PostgreSQL was not running
)

echo.
echo ========================================
echo All services stopped!
echo ========================================
echo.
pause
