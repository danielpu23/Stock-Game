#!/bin/bash

# Quick Redeploy Script for Stock Game
# Use this for fast updates without full setup

set -e

APP_DIR="/var/www/stock-game"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

echo "🔄 Starting quick redeploy..."

# Pull latest changes
print_info "Pulling latest changes..."
cd $APP_DIR
git pull origin production/deploy

# Rebuild backend
print_info "Rebuilding backend..."
cd $BACKEND_DIR
./mvnw clean package -DskipTests

# Rebuild frontend
print_info "Rebuilding frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# Restart services
print_info "Restarting services..."
sudo systemctl restart stock-game-backend
sudo systemctl reload nginx

print_success "Redeploy completed successfully!"
echo ""
echo "📊 Service Status:"
sudo systemctl status stock-game-backend --no-pager
sudo systemctl status nginx --no-pager