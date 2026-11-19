# Cloudflare Tunnel Setup Guide

Guide for hosting the Stock Game application locally with Cloudflare Tunnel for public internet access.

## 🚀 Architecture Overview

```
Local Machine
├── PostgreSQL Database (localhost:5432)
├── Spring Boot Backend (localhost:8080)
├── React Frontend (localhost:5173)
└── Cloudflare Tunnel → https://your-tunnel-url.pages.dev

Internet Access
└── Public users access via Cloudflare Tunnel URL
```

## 📋 Prerequisites

- Cloudflare account (free)
- PostgreSQL database running locally (Docker Desktop or local installation)
- Node.js and npm installed
- Java 21 and Maven installed
- Git repository access

## 🔧 Phase 1: Cloudflare Account Setup (10 minutes)

### 1.1 Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for free account
3. Verify your email address
4. Log in to Cloudflare dashboard

### 1.2 Get Your Account ID

1. In Cloudflare dashboard, note your **Account ID** (shown in the right sidebar)
2. You'll need this for tunnel configuration

## 🔧 Phase 2: Install Cloudflare Tunnel (10 minutes)

### 2.1 Install cloudflared

**macOS:**

```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux:**

```bash
# For Ubuntu/Debian
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# For other Linux distributions
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

**Windows:**

1. Download from https://github.com/cloudflare/cloudflared/releases
2. Download `cloudflared-windows-amd64.exe`
3. Rename to `cloudflared.exe`
4. Add to your PATH or place in a known location

### 2.2 Verify Installation

```bash
cloudflared --version
```

## 🔧 Phase 3: Create Cloudflare Tunnel (5 minutes)

### 3.1 Authenticate Cloudflare

```bash
cloudflared tunnel login
```

This will:

- Open a browser window
- Ask you to log in to Cloudflare
- Authorize cloudflared to access your account
- Create a certificate file

### 3.2 Create Tunnel

```bash
cloudflared tunnel create stock-game
```

This will:

- Create a tunnel named "stock-game"
- Generate a tunnel ID
- Generate a credentials file

**Save the output!** You'll get:

- Tunnel ID (something like `abc123-def456-ghi789`)
- Credentials file path

### 3.3 Configure Tunnel

**Option A: Quick Tunnel (Easiest)**

```bash
# This creates a temporary tunnel with random URL
cloudflared tunnel --url http://localhost:8080
```

**Option B: Named Tunnel (Recommended)**

```bash
# Use the configuration file
cloudflared tunnel run stock-game --config cloudflare-tunnel/config.yml
```

## 🔧 Phase 4: Local Application Setup (15 minutes)

### 4.1 Setup PostgreSQL Database

**Using Docker Desktop:**

```bash
# Start PostgreSQL container
docker run --name stock-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stock_game \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Using Local PostgreSQL:**

- Ensure PostgreSQL is running on port 5432
- Create database `stock_game`
- User: `postgres`, Password: `postgres`

### 4.2 Setup Backend Environment

```bash
# Copy environment template
cp local-deploy/env/backend.env.example backend/.env

# Edit with your values (optional - defaults work for local)
nano backend/.env
```

### 4.3 Setup Frontend Environment

```bash
# Copy environment template
cp local-deploy/env/frontend.env.example frontend/.env

# For local development, keep as http://localhost:8080
# For Cloudflare Tunnel, update to your tunnel URL when tunnel is running
```

## 🔧 Phase 5: Start Application (5 minutes)

### 5.1 Option A: Start All Services (Recommended)

**Linux/macOS:**

```bash
# Make scripts executable
chmod +x local-deploy/scripts/*.sh

# Start everything
./local-deploy/scripts/start-all.sh
```

**Windows:**

```bash
# Start backend in one terminal
local-deploy\scripts\start-backend.bat

# Start frontend in another terminal
local-deploy\scripts\start-frontend.bat

# Start tunnel in another terminal
local-deploy\scripts\start-tunnel.bat
```

### 5.2 Option B: Start Services Individually

**Start Backend:**

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/stock-game-0.0.1-SNAPSHOT.jar
```

**Start Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Start Cloudflare Tunnel:**

```bash
cloudflared tunnel run stock-game
```

## 🔧 Phase 6: Access Your Application (5 minutes)

### 6.1 Get Your Tunnel URL

1. Go to Cloudflare dashboard
2. Navigate to Zero Trust → Networks → Tunnels
3. Find your "stock-game" tunnel
4. Copy the **Public URL** (something like `https://abc123.trycloudflare.com`)

### 6.2 Update Frontend for Tunnel Access

**Option A: Use Tunnel URL for frontend**

```bash
# Update frontend/.env
VITE_API_URL=https://your-tunnel-url.trycloudflare.com
```

**Option B: Keep Frontend Local, Backend via Tunnel**

```bash
# Keep frontend/.env as http://localhost:8080
# Share backend tunnel URL with others
```

### 6.3 Test the Application

1. **Local Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080

2. **Public Access (via Tunnel):**
   - Backend: https://your-tunnel-url.trycloudflare.com
   - If you configured frontend in tunnel: https://your-tunnel-url.trycloudflare.com

## 🔧 Phase 7: Configuration Management

### 7.1 Cloudflare Tunnel Configuration

**For persistent tunnel configuration:**

```yaml
# cloudflare-tunnel/config.yml
tunnel: <your-tunnel-id>
credentials-file: <path-to-credentials.json>

ingress:
  - hostname: your-custom-domain.pages.dev
    service: http://localhost:8080
  - service: http_status:404
```

### 7.2 Update Tunnel Configuration

```bash
# Create custom subdomain (optional)
cloudflared tunnel route dns stock-game your-custom-domain.pages.dev
```

## 🔄 Phase 8: Daily Usage

### 8.1 Start Your Application

```bash
# Quick start
./local-deploy/scripts/start-all.sh

# Or individual components
./local-deploy/scripts/start-backend.sh
./local-deploy/scripts/start-frontend.sh
./local-deploy/scripts/start-tunnel.sh
```

### 8.2 Stop Your Application

```bash
# Stop all services
./local-deploy/scripts/stop-all.sh

# Or stop individually
pkill -f "stock-game-0.0.1-SNAPSHOT.jar"
pkill -f "vite"
pkill -f "cloudflared"
```

### 8.3 Check Logs

```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log

# Tunnel logs
# Cloudflared logs to stdout/stderr
```

## 🔒 Phase 9: Security Considerations

### 9.1 Security Best Practices

- ✅ Use strong passwords for PostgreSQL
- ✅ Keep your JWT secret secure
- ✅ Don't commit sensitive data to git
- ✅ Use Cloudflare's SSL (automatic)
- ✅ Monitor tunnel access logs
- ✅ Keep your computer updated

### 9.2 Limit Exposure

- Only run tunnel when needed
- Use Cloudflare Access for additional security (optional)
- Monitor Cloudflare dashboard for suspicious activity

## 📊 Phase 10: Monitoring and Troubleshooting

### 10.1 Check Service Status

```bash
# Check if PostgreSQL is running
pg_isready

# Check if backend is running
curl http://localhost:8080/actuator/health

# Check if frontend is running
curl http://localhost:5173

# Check tunnel status
cloudflared tunnel info stock-game
```

### 10.2 Common Issues

**Backend won't start:**

- Check PostgreSQL is running
- Check port 8080 is not in use
- Check backend.log for errors

**Frontend won't start:**

- Check Node.js is installed
- Check port 5173 is not in use
- Check frontend.log for errors

**Tunnel won't start:**

- Check cloudflared is installed
- Check you're authenticated
- Check tunnel exists: `cloudflared tunnel list`

**CORS errors:**

- Update CORS_ALLOWED_ORIGINS in backend/.env
- Include your tunnel URL
- Restart backend after changes
