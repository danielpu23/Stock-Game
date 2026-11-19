@echo off
REM Cloudflare Tunnel Startup Script for Windows
REM Starts Cloudflare tunnel to expose local application to internet
REM
REM IMPORTANT: Update cloudflare-tunnel/config.yml with your tunnel ID and credentials path first
REM See GETTING_STARTED.md for detailed instructions

echo Checking if cloudflared is installed...
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: cloudflared is not installed.
    echo Install cloudflared from: https://github.com/cloudflare/cloudflared/releases
    echo Download the Windows AMD64 version and add to PATH
    pause
    exit /b 1
)

echo cloudflared is installed

echo Checking for existing tunnel...
cloudflared tunnel list | findstr "stock-game"
if %errorlevel% neq 0 (
    echo No existing tunnel found.
    echo Please create a tunnel first with: cloudflared tunnel create stock-game
    echo Then update cloudflare-tunnel/config.local.yml with your tunnel ID and credentials path
    echo See GETTING_STARTED.md for detailed instructions
    pause
    exit /b 1
)

echo Found existing tunnel
echo IMPORTANT: Make sure cloudflare-tunnel/config.local.yml is updated with your configuration
echo Starting Cloudflare tunnel with config file...
echo Your application will be accessible at your configured URL
echo Press Ctrl+C to stop the tunnel

cd ..\..
cloudflared tunnel --config cloudflare-tunnel\config.local.yml run stock-game

pause