# Stock Game

A multiplayer stock-trading game. Create a game, share the invite code, and
everyone trades the same starting cash — best portfolio at the end wins.

- **Backend** — Spring Boot 3.5 (Java 21), JPA, JWT auth
- **Frontend** — React 19 + TypeScript, Vite, React Router
- **Database** — Postgres in production, embedded H2 for local development

## Requirements

- **Java 21** (`java -version` should report 21.x)
- **Node 20+**
- Docker — only if you want to run against real Postgres

## Quick start

The fastest path needs no database and no API key. In two terminals:

```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

```bash
cd frontend && npm install && npm run dev
```

Then open http://localhost:5173.

The `dev` profile uses an in-memory H2 database and seeds two demo players, so
you can sign in immediately:

| User    | Password      |
| ------- | ------------- |
| `alice` | `password123` |
| `bob`   | `password123` |

It also creates a game that is already in progress, with holdings for both
players. Data is discarded when the backend stops.

Browse the dev database at http://localhost:8080/h2-console
(JDBC URL `jdbc:h2:mem:stock_game`, user `sa`, no password).

## Running against Postgres

Drop the `-Dspring-boot.run.profiles=dev` flag to use the default configuration,
which expects Postgres on `localhost:5432`:

```bash
docker-compose up -d
cd backend && ./mvnw spring-boot:run
```

Hibernate creates the schema on startup (`ddl-auto=update`). The files in
`backend/database/` document that schema for reference; they are not executed.

Inspect the database with:

```bash
docker exec -it stock_game_db psql -U postgres -d stock_game
```

## Stock prices

Prices come from [Finnhub](https://finnhub.io) when an API key is configured,
and from a built-in simulated market otherwise. The simulation gives every
ticker a stable base price and moves it along a smooth curve, so the game is
fully playable offline.

To use live quotes, export a key before starting the backend:

```bash
export STOCK_API_KEY=your-finnhub-key
```

Quotes are cached server-side for 15 seconds (`stock.price.cache-ttl-seconds`).
Without that cache, valuing every holding for every player on the game page's
5-second poll would exceed Finnhub's free-tier limit of 60 calls per minute.

## Configuration

All of these are read from the environment, with defaults in
`backend/src/main/resources/application.properties`:

| Variable               | Default                 | Purpose                            |
| ---------------------- | ----------------------- | ---------------------------------- |
| `STOCK_API_KEY`        | _(empty)_               | Finnhub key; empty = simulated     |
| `JWT_SECRET`           | dev-only value          | HS256 signing key, min 32 bytes    |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Browser origins allowed to call it |

The frontend reads `VITE_API_URL` (default `http://localhost:8080`).

> The committed `JWT_SECRET` default exists so the app runs out of the box.
> Set a real one in any deployment — tokens signed with a public key are
> forgeable by anyone who has read this repository.

## API

All routes except `/auth/**` require an `Authorization: Bearer <token>` header.

| Method | Route                     | Purpose                          |
| ------ | ------------------------- | -------------------------------- |
| POST   | `/auth/register`          | Create an account                |
| POST   | `/auth/login`             | Exchange credentials for a token |
| GET    | `/games/mine`             | Games the caller has joined      |
| POST   | `/games`                  | Create a game                    |
| POST   | `/games/join`             | Join by invite code              |
| GET    | `/games/{id}`             | Game and its players             |
| GET    | `/games/{id}/state`       | Live cash, holdings, valuations  |
| POST   | `/games/{id}/start`       | Start it (creator only)          |
| POST   | `/games/{id}/buy`         | Buy shares                       |
| POST   | `/games/{id}/sell`        | Sell shares                      |
| GET    | `/games/{id}/transactions`| The caller's own trades          |
| GET    | `/games/{id}/leaderboard` | Ranked standings                 |
| POST   | `/games/{id}/finish`      | End it (creator only)            |
| GET    | `/games/{id}/results`     | Final standings and winner       |

Errors come back as `{"status": 400, "message": "...", "timestamp": "..."}`.

## Tests

```bash
cd backend && ./mvnw test
cd frontend && npm run lint && npm run build
```
