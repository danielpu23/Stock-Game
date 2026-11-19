# Getting Started Guide

Detailed guide for setting up and hosting the Stock Game application.

## 📋 Table of Contents

- [Local Development Setup](#local-development-setup)
- [Starting the Application Locally](#starting-the-application-locally)
- [Hosting with Cloudflare Tunnel](#hosting-with-cloudflare-tunnel)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Java 21** - For the Spring Boot backend
- **Node.js 18+** - For the React frontend
- **Docker Desktop** - For PostgreSQL database
- **Maven** - Or use the included `mvnw` wrapper
- **Cloudflare Account** - For tunneling/hosting

### Required Accounts

- **Cloudflare Account** - Free account for Cloudflare Tunnel
- **Domain** - A domain connected to Cloudflare (e.g., `yourdomain.com`)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stock_game
```

### 2. Backend Setup

The backend uses a PostgreSQL database. You have two options:

**Option A: Use Docker (Recommended)**

```bash
docker run --name stock-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=stock_game `
  -p 5432:5432 `
  -d postgres:15-alpine
```

**Option B: Use Local PostgreSQL**

- Install PostgreSQL locally
- Create a database named `stock_game`
- Update `backend/src/main/resources/application.properties` with your credentials

### 3. Start the Backend

```bash
cd backend
# Using Maven wrapper (no Maven installation required)
./mvnw.cmd spring-boot:run    # Windows
./mvnw spring-boot:run       # Linux/Mac

# Or if you have Maven installed
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Start the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 6. Access the Application

Open your browser and go to:

```
http://localhost:5173
```

You'll be redirected to the login page since you're not authenticated.

## Starting the Application Locally

### Quick Start (All Services)

**Windows:**

```bash
cd local-deploy/scripts
.\start-all.bat
```

**Linux/Mac:**

```bash
cd local-deploy/scripts
chmod +x *.sh
./start-all.sh
```

This will start:

1. PostgreSQL database
2. Spring Boot backend
3. React frontend

### Individual Service Startup

**PostgreSQL:**

```bash
docker run --name stock-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=stock_game -p 5432:5432 -d postgres:15-alpine
```

**Backend:**

```bash
cd backend
./mvnw.cmd spring-boot:run
```

**Frontend:**

```bash
cd frontend
npm run dev
```

### Stopping Services

**Windows:**

```bash
cd local-deploy/scripts
.\stop-all.bat
```

**Linux/Mac:**

```bash
cd local-deploy/scripts
./stop-all.sh
```

## Hosting with Cloudflare Tunnel

Cloudflare Tunnel allows you to expose your local application to the internet without opening ports on your router.

### Overview

```
Your Local Computer
├── PostgreSQL Database (localhost:5432)
├── Spring Boot Backend (localhost:8080)
├── React Frontend (localhost:5173)
└── Cloudflare Tunnel → https://<your-subdomain>.<your-domain>.com

Public Access
└── Users access via Cloudflare Tunnel URL
```

### Step 1: Install Cloudflare Tunnel

Download `cloudflared` for your platform:

- **Windows**: https://github.com/cloudflare/cloudflared/releases/latest (download `cloudflared-windows-amd64.exe`)
- **Linux**: Use package manager or download from GitHub
- **macOS**: `brew install cloudflare/cloudflare/cloudflared`

Rename the executable to `cloudflared` and add it to your PATH, or place it in the project root.

Verify installation:

```bash
cloudflared --version
```

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will:

- Open a browser window
- Ask you to log in to Cloudflare
- Ask you to select your domain
- Generate a certificate file in `~/.cloudflared/` (Linux/Mac) or `C:\Users\<username>\.cloudflared\` (Windows)

### Step 3: Create a Named Tunnel

```bash
cloudflared tunnel create <tunnel-name>
```

Example:

```bash
cloudflared tunnel create stock-game
```

**Save the output!** It will show:

- **Tunnel ID**: A UUID (e.g., `abc123-def456-ghi789`)
- **Credentials file**: Path to the credentials JSON file

### Step 4: Configure DNS in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add Record**
5. Configure:
   - **Type**: CNAME
   - **Name**: `<subdomain>` (e.g., `stock-game`)
   - **Target**: `<tunnel-id>.cfargotunnel.com`
   - **Proxy status**: Proxied (orange cloud icon)
6. Click **Save**

Your public URL will be: `https://<subdomain>.<your-domain>.com`

### Step 5: Configure the Tunnel

We provide two configuration files:

1. **`cloudflare-tunnel/config.yml`** - Template with placeholders (safe to commit)
2. **`cloudflare-tunnel/config.local.yml`** - Your actual configuration (NOT to commit)

Copy the template and update it with your information:

```bash
cp cloudflare-tunnel/config.yml cloudflare-tunnel/config.local.yml
```

Then edit `cloudflare-tunnel/config.local.yml`:

```yaml
tunnel: <your-tunnel-id>
credentials-file: <path-to-credentials.json>

ingress:
  # Frontend (React development server)
  - hostname: <your-subdomain>.<your-domain>.com
    service: http://localhost:5173
  # Backend API (Spring Boot) - optional, for direct API access
  - hostname: api.<your-domain>.com
    service: http://localhost:8080
  # Catch-all rule
  - service: http_status:404
```

**Replace the placeholders:**

- `<your-tunnel-id>` - Your tunnel UUID from Step 3
- `<path-to-credentials.json>` - Full path to credentials file
- `<your-subdomain>.<your-domain>.com` - Your public URL
- `api.<your-domain>.com` - Your API URL (optional)

**Important:** `config.local.yml` is in `.gitignore` and will not be committed. Only the template `config.yml` is committed.

### Step 6: Configure Vite for Your Domain

Update `frontend/vite.config.ts` to allow your domain:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "localhost",
      "<your-subdomain>.<your-domain>.com",
      "api.<your-domain>.com",
    ],
  },
});
```

**Note:** The template has these values commented out. Uncomment and update them with your actual domain.

### Step 7: Start All Services with Tunnel

**Using scripts (Recommended):**

**Windows:**

```bash
cd local-deploy/scripts
.\start-backend.bat    # Terminal 1
.\start-frontend.bat   # Terminal 2
.\start-tunnel.bat    # Terminal 3
```

**Linux/Mac:**

```bash
cd local-deploy/scripts
./start-backend.sh
./start-frontend.sh
./start-tunnel.sh
```

**Manual startup:**

1. Start PostgreSQL (Docker)
2. Start backend: `cd backend && ./mvnw.cmd spring-boot:run`
3. Start frontend: `cd frontend && npm run dev`
4. Start tunnel: `cloudflared tunnel --config cloudflare-tunnel/config.local.yml run <tunnel-name>`

### Step 8: Access Your Public Application

Open your browser and go to:

```
https://<your-subdomain>.<your-domain>.com
```

Your application is now publicly accessible!

## Configuration

### Backend Configuration

Location: `backend/src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_game
spring.datasource.username=postgres
spring.datasource.password=postgres

# JWT
jwt.secret=<your-jwt-secret>
jwt.expiration=86400000

# Stock API
stock.api.url=https://finnhub.io/api/v1
stock.api.key=<your-finnhub-api-key>

# CORS
cors.allowed-origins=http://localhost:5173,http://localhost:8080,<your-public-url>
```

### Frontend Configuration

Location: `frontend/.env` (local development)

```env
VITE_API_URL=http://localhost:8080
```

Location: `frontend/.env.production` (production/cloudflare tunnel)

```env
VITE_API_URL=https://<your-subdomain>.<your-domain>.com
```

### Environment Variable Templates

Use the provided templates as a starting point:

- `local-deploy/env/backend.env.example` - Backend environment variables
- `local-deploy/env/frontend.env.example` - Frontend environment variables

Copy these to `.env` files and fill in your values.

## Troubleshooting

### Port Already in Use

**Check what's using the port:**

```bash
netstat -ano | findstr :5432  # PostgreSQL
netstat -ano | findstr :8080  # Backend
netstat -ano | findstr :5173  # Frontend
```

**Kill the process:**

```bash
taskkill /PID <process-id> /F
```

### Docker Not Running

Start Docker Desktop from your applications menu.

### Cloudflare Tunnel Connection Issues

1. Verify tunnel ID in config.yml matches what you created
2. Verify credentials file path is correct
3. Check Cloudflare dashboard for tunnel status
4. Ensure DNS CNAME record is configured correctly
5. Make sure you're logged in: `cloudflared tunnel login`

### Vite Host Blocked Error

If you see "This host is not allowed", add your domain to `frontend/vite.config.ts`:

```typescript
server: {
  allowedHosts: ["<your-subdomain>.<your-domain>.com", "localhost"];
}
```

### Backend Won't Start

- Check if PostgreSQL is running: `docker ps`
- Verify database credentials in `application.properties`
- Check backend logs for error messages
- Ensure port 8080 is not in use

### Frontend Won't Start

- Check if Node.js is installed: `node --version`
- Run `npm install` to install dependencies
- Check if port 5173 is not in use
- Verify you're in the `frontend` directory

### Windows Firewall Prompts

When starting services, Windows Firewall may ask for permission. Click "Allow access" for:

- Java (backend)
- Node.js (frontend)
- cloudflared (tunnel)

## Quick Reference

| Service           | Port | Command                                |
| ----------------- | ---- | -------------------------------------- |
| PostgreSQL        | 5432 | `docker run -d postgres:15-alpine`     |
| Backend           | 8080 | `./mvnw.cmd spring-boot:run`           |
| Frontend          | 5173 | `npm run dev`                          |
| Cloudflare Tunnel | -    | `cloudflared tunnel run <tunnel-name>` |

## Further Reading

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
