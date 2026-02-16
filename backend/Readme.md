To run the backend:

1. Start up the postgres database via docker-compose: 'docker-compose up -d'
2. Start the Spring Boot application: './mvnw spring-boot:run'
3. Optional: View the database: 'docker exec -it stock_game_db psql -U postgres -d stock_game'
