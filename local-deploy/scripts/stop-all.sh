#!/bin/bash

# Stock Game Stop Script
# Stops backend, frontend, and Cloudflare tunnel

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

print_info "Stopping Stock Game services..."

# Stop backend
print_info "Stopping Spring Boot backend..."
pkill -f "stock-game-0.0.1-SNAPSHOT.jar" && print_success "Backend stopped" || print_info "Backend was not running"

# Stop frontend
print_info "Stopping React frontend..."
pkill -f "vite" && print_success "Frontend stopped" || print_info "Frontend was not running"

# Stop Cloudflare tunnel
print_info "Stopping Cloudflare tunnel..."
pkill -f "cloudflared" && print_success "Tunnel stopped" || print_info "Tunnel was not running"

print_success "All services stopped"