# Multi-stage Dockerfile for Stock Game Application
# This Dockerfile builds both backend and frontend in a single image

# Stage 1: Build Backend
FROM maven:3.9-eclipse-temurin-21 AS backend-build

WORKDIR /app

# Copy backend files
COPY backend/pom.xml backend/
COPY backend/src backend/src

# Build backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

COPY frontend/ frontend/
RUN cd frontend && npm run build

# Stage 3: Runtime Image
FROM eclipse-temurin:21-jre-alpine

# Install Nginx
RUN apk add --no-cache nginx

# Create application directories
RUN mkdir -p /var/www/stock-game/frontend/dist \
             /var/www/stock-game/backend

# Copy backend JAR from build stage
COPY --from=backend-build /app/backend/target/stock-game-0.0.1-SNAPSHOT.jar /var/www/stock-game/backend/

# Copy frontend build from build stage
COPY --from=frontend-build /app/frontend/dist /var/www/stock-game/frontend/dist

# Copy Nginx configuration
COPY aws-deploy/nginx/stock-game.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443 8080

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'java -jar /var/www/stock-game/backend/stock-game-0.0.1-SNAPSHOT.jar &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Start both services
CMD ["/start.sh"]