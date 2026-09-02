#!/bin/bash

# SSL Certificate Setup Script for Stock Game
# Uses Let's Encrypt with Certbot for free SSL certificates

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 your-domain.com"
    echo "Example: $0 stockgame.example.com"
    exit 1
fi

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Ensure Nginx is running
print_info "Ensuring Nginx is running..."
sudo systemctl start nginx

# Obtain SSL certificate
print_info "Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com

# Update Nginx configuration to use SSL
print_info "Updating Nginx configuration for SSL..."
NGINX_CONF="/etc/nginx/sites-available/stock-game"

# Backup current config
sudo cp $NGINX_CONF ${NGINX_CONF}.backup

# Enable SSL in Nginx config
sudo sed -i "s|# server_name _;|server_name $DOMAIN;|" $NGINX_CONF
sudo sed -i "s|# return 301 https://|return 301 https://|" $NGINX_CONF
sudo sed -i "s|# server {|server {|" $NGINX_CONF
sudo sed -i "s|#     listen 443 ssl|    listen 443 ssl|" $NGINX_CONF
sudo sed -i "s|#     server_name your-domain.com|    server_name $DOMAIN|" $NGINX_CONF
sudo sed -i "s|#     ssl_certificate|    ssl_certificate|" $NGINX_CONF
sudo sed -i "s|#     ssl_certificate_key|    ssl_certificate_key|" $NGINX_CONF
sudo sed -i "s|#     ssl_protocols|    ssl_protocols|" $NGINX_CONF
sudo sed -i "s|#     ssl_ciphers|    ssl_ciphers|" $NGINX_CONF

# Test Nginx configuration
print_info "Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
print_info "Reloading Nginx..."
sudo systemctl reload nginx

# Setup auto-renewal
print_info "Setting up SSL auto-renewal..."
sudo certbot renew --dry-run

print_success "SSL certificate setup completed!"
echo ""
echo "🎉 Your application is now available at:"
echo "   https://$DOMAIN"
echo ""
echo "📋 SSL Certificate Details:"
echo "   Certificate will auto-renew before expiration"
echo "   Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "🔍 To check certificate status:"
echo "   sudo certbot certificates"