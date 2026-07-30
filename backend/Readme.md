# Backend

Spring Boot 3.5 on Java 21. See the [root README](../README.md) for the full
setup, configuration, and API reference.

## Run it

No database required — the `dev` profile uses in-memory H2 and seeds demo data:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Against Postgres instead:

```bash
docker-compose up -d          # from the repository root
./mvnw spring-boot:run
```

Inspect the Postgres data with
`docker exec -it stock_game_db psql -U postgres -d stock_game`, then
`\d <table name>` to describe a table. For the dev profile, use the H2 console
at http://localhost:8080/h2-console.

## Layout

```
controller/   HTTP endpoints
service/      Game rules, auth, pricing
repository/   Spring Data JPA
model/        JPA entities and enums
dto/          Request and response shapes — entities are never serialised directly
config/       Security, CORS, price provider selection, dev seed data
security/     JWT request filter
exception/    Domain exceptions and the global handler
```

## Stock prices

`StockPriceProvider` has two implementations, chosen at startup by
`StockPriceConfig` based on whether `STOCK_API_KEY` is set:

- `FinnhubClient` — live quotes
- `SimulatedPriceProvider` — offline stand-in, so the app runs without a key

`StockPriceService` sits in front of both and caches quotes, which is what keeps
portfolio valuation from exhausting Finnhub's free-tier rate limit.
