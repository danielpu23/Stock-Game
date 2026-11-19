@echo off
REM Stock Game - Start All Services
REM This script starts PostgreSQL, Backend, Frontend, and Cloudflare Tunnel in separate windows

echo ========================================
echo Stock Game - Starting All Services
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "..\..\backend" (
    echo ERROR: Please run this script from the local-deploy/scripts directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Go to project root
cd ..\..\

echo [1/4] Starting PostgreSQL database...
start "PostgreSQL" cmd /k "docker run --name stock-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=stock_game -p 5432:5432 postgres:15-alpine"
timeout /t 5 /nobreak > nul

echo [2/4] Starting Spring Boot backend...
start "Backend" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak > nul

echo [3/4] Starting React frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak > nul

echo [4/4] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cd ..\.. && cloudflared tunnel --config cloudflare-tunnel\config.local.yml run stock-game"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Services running in separate windows:
echo - PostgreSQL (port 5432)
echo - Backend (port 8080)
echo - Frontend (port 5173)
echo - Cloudflare Tunnel
echo.
echo Access your application at:
echo https://stock-game.dpstockgame.dpdns.org
echo.
echo To stop all services, run: stop-all.bat
echo.
pause
