#!/bin/bash

# Stock Game AWS EC2 Deployment Script
# This script automates the deployment of the stock game application on AWS EC2

set -e  # Exit on any error

echo "🚀 Starting Stock Game Deployment on AWS EC2..."

# Configuration
APP_DIR="/var/www/stock-game"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_CONF="/etc/nginx/sites-available/stock-game"
SYSTEMD_SERVICE="/etc/systemd/system/stock-game-backend.service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Update system packages
print_info "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install required packages
print_info "Installing required packages..."
sudo apt-get install -y \
    nginx \
    openjdk-21-jdk \
    maven \
    nodejs \
    npm \
    git \
    certbot \
    python3-certbot-nginx \
    ufw

# Create application directory
print_info "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R ubuntu:ubuntu $APP_DIR

# Clone repository (if not already present)
if [ ! -d "$APP_DIR/.git" ]; then
    print_info "Cloning repository..."
    cd /var/www
    sudo rm -rf stock-game
    sudo mkdir -p stock-game
    sudo chown -R ubuntu:ubuntu stock-game
    cd stock-game
    git clone https://github.com/YOUR_USERNAME/stock_game.git .
    git checkout production/deploy
else
    print_info "Pulling latest changes..."
    cd $APP_DIR
    git pull origin production/deploy
fi

# Build backend
print_info "Building Spring Boot backend..."
cd $BACKEND_DIR
./mvnw clean package -DskipTests

# Build frontend
print_info "Building React frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# Setup backend environment file
print_info "Setting up backend environment variables..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env
    print_info "Please edit $BACKEND_DIR/.env with your production values"
    print_info "Required variables: DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD, JWT_SECRET"
fi

# Configure Nginx
print_info "Configuring Nginx..."
sudo cp $APP_DIR/aws-deploy/nginx/stock-game.conf $NGINX_CONF
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/stock-game
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# Configure systemd service
print_info "Configuring systemd service..."
sudo cp $APP_DIR/aws-deploy/systemd/stock-game-backend.service $SYSTEMD_SERVICE
sudo systemctl daemon-reload
sudo systemctl enable stock-game-backend

# Setup firewall
print_info "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Restart services
print_info "Restarting services..."
sudo systemctl restart nginx
sudo systemctl restart stock-game-backend

# Print completion message
print_success "Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit $BACKEND_DIR/.env with your production values"
echo "2. Restart the backend service: sudo systemctl restart stock-game-backend"
echo "3. Check service status: sudo systemctl status stock-game-backend"
echo "4. Check Nginx status: sudo systemctl status nginx"
echo "5. View logs: sudo journalctl -u stock-game-backend -f"
echo ""
echo "🔒 For SSL setup, run: sudo ./setup-ssl.sh your-domain.com"
echo ""
echo "🌐 Your application should be available at:"
echo "   http://$(curl -s ifconfig.me)"