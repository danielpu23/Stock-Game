# Bad Bets

A multiplayer stock trading game built with Spring Boot (backend) and React (frontend).

## 🎮 Features

- **Multiplayer Support**: Create games and invite friends with invite codes
- **Real-time Trading**: Buy and sell stocks with simulated market data
- **Authentication**: User registration via email and JWT-based login
- **Game Management**: Game creation and lobbies
- **Portfolio Tracking**: View holdings, cash balance, and transaction history
- **Leaderboards**: Compare performance with other players in the lobby
- **Market Hours**: Enforced trading hours with NYSE schedule, including extended hours

<details>
<summary><strong>🏗️ Architecture & Tech Stack</strong></summary>

### Backend

- Java 21
- Spring Boot 3.5
- Spring Security (JWT authentication)
- Spring Data JPA (Hibernate)
- PostgreSQL (database)
- Maven (build tool)

### Frontend

- React 19
- TypeScript
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)

### Testing

- JUnit 5 + Mockito (backend unit tests)
- Cypress (frontend E2E tests)

</details>

## 🚀 Quick Start

<details>
<summary><strong>Prerequisites</strong></summary>

- Java 21
- Node.js 18+
- Docker Desktop (for PostgreSQL)
- Maven (or use included `mvnw` wrapper)

</details>

<details>
<summary><strong>Local Development</strong></summary>

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stock_game
   ```

2. **Start PostgreSQL**

   ```bash
   docker run --name stock-postgres `
     -e POSTGRES_PASSWORD=postgres `
     -e POSTGRES_DB=stock_game `
     -p 5432:5432 `
     -d postgres:15-alpine
   ```

3. **Start the backend**

   ```bash
   cd backend
   ./mvnw.cmd spring-boot:run    # Windows
   ./mvnw spring-boot:run       # Linux/Mac
   ```

4. **Start the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:5173
   ```

</details>

## 🌐 Hosting Options

<details>
<summary><strong>Option 1: Cloudflare Tunnel (Recommended)</strong></summary>

**Cost:** Free  
**Setup Time:** ~30 minutes  
**Infrastructure:** Your local computer

Expose your local application to the internet securely using Cloudflare Tunnel.

**Documentation:** See [GETTING_STARTED.md](GETTING_STARTED.md#hosting-with-cloudflare-tunnel)

</details>

<details>
<summary><strong>Option 2: Cloud Hosting (ie. AWS)</strong></summary>

**Documentation:** Work in progress...

</details>

## 📚 Documentation

<details>
<summary><strong>Setup & Development</strong></summary>

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Complete guide for local development and Cloudflare Tunnel hosting

</details>

<details>
<summary><strong>Deployment</strong></summary>

- **[CLOUDFLARE_TUNNEL_SETUP.md](CLOUDFLARE_TUNNEL_SETUP.md)** - Detailed Cloudflare Tunnel configuration

</details>

<details>
<summary><strong>Component Documentation</strong></summary>

- **[backend/Readme.md](backend/Readme.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend UI documentation
- **[frontend/cypress/README.md](frontend/cypress/README.md)** - Cypress testing documentation

</details>

## 🧪 Testing

<details>
<summary><strong>Backend Tests</strong></summary>

```bash
cd backend
./mvnw.cmd test
```

**Results:** 44 tests passing (16 GameSessionService, 8 GameSimulation, 19 JwtService, 1 Application)

</details>

<details>
<summary><strong>Frontend Tests</strong></summary>

```bash
cd frontend
npm run cypress:run
```

**Test Coverage:**

- Authentication flow (login/register)
- Protected route redirects
- Navigation and routing
- UI component styling
- Form validation

</details>

## 🔧 Configuration

<details>
<summary><strong>Backend Configuration</strong></summary>

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
cors.allowed-origins=http://localhost:5173,http://localhost:8080
```

</details>

<details>
<summary><strong>Frontend Configuration</strong></summary>

Location: `frontend/.env` (local development)

```env
VITE_API_URL=http://localhost:8080
```

</details>

## 🛠️ Troubleshooting

<details>
<summary><strong>Common Issues</strong></summary>

**Port already in use:**

```bash
netstat -ano | findstr :5432  # PostgreSQL
netstat -ano | findstr :8080  # Backend
netstat -ano | findstr :5173  # Frontend
```

**Docker not running:**

- Start Docker Desktop from your applications menu

**Backend won't start:**

- Check if PostgreSQL is running
- Verify database credentials in `application.properties`
- Check backend logs for error messages

**Frontend won't start:**

- Run `npm install` to install dependencies
- Check if port 5173 is not in use

</details>

## 📊 Deployment Branches

<details>
<summary><strong>Branch Overview</strong></summary>

| Branch                     | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `main`                     | Development and stable commits              |
| `deploy/cloudflare-tunnel` | Cloudflare Tunnel documentation and scripts |
| `production/deploy`        | AWS/cloud deployment configuration          |

</details>
