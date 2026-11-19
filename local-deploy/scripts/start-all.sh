#!/bin/bash

# Stock Game Complete Startup Script
# Starts backend, frontend, and Cloudflare tunnel

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

print_header "Starting Stock Game Application"

# Check if PostgreSQL is running
print_info "Checking PostgreSQL database..."
if ! pg_isready -q; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    print_info "Start PostgreSQL with: Docker Desktop or local PostgreSQL installation"
    exit 1
fi
print_success "PostgreSQL is running"

# Start backend in background
print_info "Starting Spring Boot backend in background..."
cd backend
./mvnw clean package -DskipTests
nohup java -jar target/stock-game-0.0.1-SNAPSHOT.jar > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
print_success "Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
print_info "Waiting for backend to start..."
sleep 10

# Check if backend is running
if ! curl -s http://localhost:8080/actuator/health > /dev/null; then
    print_error "Backend failed to start. Check backend.log for details."
    exit 1
fi
print_success "Backend is ready"

# Start frontend in background
print_info "Starting React frontend in background..."
cd frontend
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
fi
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
print_success "Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to start
print_info "Waiting for frontend to start..."
sleep 5

# Start Cloudflare tunnel
print_info "Starting Cloudflare tunnel..."
cd local-deploy/scripts
./start-tunnel.sh &
TUNNEL_PID=$!
cd ..

print_header "Application Started Successfully"
echo ""
echo "📊 Services Running:"
echo "  Backend:  http://localhost:8080 (PID: $BACKEND_PID)"
echo "  Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo "  Tunnel:   Cloudflare Tunnel (PID: $TUNNEL_PID)"
echo ""
echo "📋 Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "🛑 Stop all services: Ctrl+C or run ./stop-all.sh"
echo ""
echo "🌐 Check your Cloudflare dashboard for the public URL"

# Keep script running to maintain background processes
trap "kill $BACKEND_PID $FRONTEND_PID $TUNNEL_PID 2>/dev/null; print_info 'Stopping all services...'; exit" INT TERM

wait