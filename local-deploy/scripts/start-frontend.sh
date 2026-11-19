#!/bin/bash

# Stock Game Frontend Startup Script
# Starts the React frontend development server

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

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found. Run this from the project root."
    exit 1
fi

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
fi

# Start frontend
print_info "Starting React frontend on port 5173..."
npm run dev

# Note: This will keep running in the foreground
# Press Ctrl+C to stop