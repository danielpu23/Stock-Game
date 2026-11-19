#!/bin/bash

# Stock Game Backend Startup Script
# Starts the Spring Boot backend with local PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found. Run this from the project root."
    exit 1
fi

cd backend

# Check if PostgreSQL is running
print_info "Checking PostgreSQL database..."
if ! pg_isready -q; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    print_info "Start PostgreSQL with: Docker Desktop or local PostgreSQL installation"
    exit 1
fi

print_success "PostgreSQL is running"

# Build backend if needed
print_info "Building Spring Boot backend..."
./mvnw clean package -DskipTests

# Start backend
print_info "Starting Spring Boot backend on port 8080..."
java -jar target/stock-game-0.0.1-SNAPSHOT.jar

# Note: This will keep running in the foreground
# Press Ctrl+C to stop