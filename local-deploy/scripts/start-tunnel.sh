#!/bin/bash

# Cloudflare Tunnel Startup Script
# Starts Cloudflare tunnel to expose local application to internet

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

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    print_error "cloudflared is not installed."
    print_info "Install cloudflared first:"
    print_info "  macOS: brew install cloudflare/cloudflare/cloudflared"
    print_info "  Linux: wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 && sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared"
    print_info "  Windows: Download from https://github.com/cloudflare/cloudflared/releases"
    exit 1
fi

print_success "cloudflared is installed"

# Check if tunnel exists
print_info "Checking for existing tunnel..."
if cloudflared tunnel list | grep -q "stock-game"; then
    print_success "Found existing tunnel: stock-game"
    TUNNEL_NAME="stock-game"
else
    print_info "No existing tunnel found. Creating new tunnel..."
    print_info "Please create a tunnel first with: cloudflared tunnel create stock-game"
    exit 1
fi

# Start tunnel
print_info "Starting Cloudflare tunnel..."
print_info "Your application will be accessible at the tunnel URL"
print_info "Press Ctrl+C to stop the tunnel"

cloudflared tunnel run stock-game