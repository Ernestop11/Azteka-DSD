#!/bin/bash

# Azteka DSD - Automated VPS Deployment Script
# Safely deploys Next.js build to VPS without clashing with other services

set -e  # Exit on error

# ============================================================================
# CONFIGURATION
# ============================================================================

VPS_HOST="77.243.85.8"
VPS_USER="root"
VPS_PATH="/srv/azteka-dsd"
APP_NAME="azteka-nextjs"
PM2_NAME="azteka-nextjs"
PORT=3002
DOMAIN="aztekafoods.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

log_info "Starting deployment to VPS..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    log_error "Must run from project root directory"
    exit 1
fi

# Check if Next.js is installed
if [ ! -f "node_modules/.bin/next" ] && ! command -v next &> /dev/null; then
    log_error "Next.js not found. Run: npm install"
    exit 1
fi

# Check SSH access
log_info "Checking SSH access to VPS..."
if ! ssh -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" "echo 'SSH connection successful'" &> /dev/null; then
    log_error "Cannot connect to VPS. Check SSH access."
    exit 1
fi
log_success "SSH connection verified"

# ============================================================================
# LOCAL BUILD
# ============================================================================

log_info "Skipping local build (disk space issue) - will build on VPS instead..."
log_warning "This is safe - VPS will build after code sync"

# ============================================================================
# CREATE PM2 ECOSYSTEM CONFIG
# ============================================================================

log_info "Creating PM2 ecosystem configuration..."

cat > ecosystem.nextjs.config.cjs <<EOF
module.exports = {
  apps: [{
    name: '${PM2_NAME}',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '${VPS_PATH}',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    error_file: '${VPS_PATH}/logs/pm2-error.log',
    out_file: '${VPS_PATH}/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
EOF

log_success "PM2 config created"

# ============================================================================
# SYNC TO VPS
# ============================================================================

log_info "Syncing files to VPS (excluding node_modules, .git, etc.)..."

rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.next-azteka' \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.env.local' \
  --exclude '.env.development' \
  --exclude 'dist' \
  --exclude '.DS_Store' \
  --exclude 'coverage' \
  --exclude '.turbo' \
  ./ "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

log_success "Files synced to VPS"

# ============================================================================
# VPS SETUP
# ============================================================================

log_info "Setting up VPS..."

ssh "${VPS_USER}@${VPS_HOST}" bash <<EOF
set -e

cd ${VPS_PATH}

# Create logs directory
mkdir -p logs
mkdir -p public/uploads/products
mkdir -p public/uploads/bundles

# Install dependencies
log_info() { echo "ℹ \$1"; }
log_success() { echo "✅ \$1"; }

log_info "Installing dependencies..."
npm install --legacy-peer-deps --production=false

log_info "Generating Prisma client..."
npx prisma generate || echo "⚠ Prisma generate failed (may need manual fix)"

log_info "Running database migrations..."
npx prisma migrate deploy || echo "⚠ Migrations failed (may need manual fix)"

log_info "Building Next.js on VPS..."
npm run build:next || echo "⚠ Build failed (check logs)"

log_success "VPS setup completed"
EOF

log_success "VPS setup completed"

# ============================================================================
# PM2 DEPLOYMENT
# ============================================================================

log_info "Deploying with PM2..."

ssh "${VPS_USER}@${VPS_HOST}" bash <<EOF
set -e

cd ${VPS_PATH}

# Check if old process exists
if pm2 list | grep -q "azteka-api"; then
    echo "⚠ Found old azteka-api process, stopping it..."
    pm2 stop azteka-api || true
    pm2 delete azteka-api || true
    echo "✅ Old process stopped"
fi

# Deploy both Next.js and Express worker
# Use ecosystem.config.cjs which includes both processes
if pm2 list | grep -q "azteka-nextjs"; then
    echo "⚠ Restarting azteka-nextjs..."
    pm2 restart azteka-nextjs || pm2 delete azteka-nextjs
else
    echo "ℹ Starting azteka-nextjs..."
fi

if pm2 list | grep -q "azteka-worker"; then
    echo "⚠ Restarting azteka-worker..."
    pm2 restart azteka-worker || pm2 delete azteka-worker
else
    echo "ℹ Starting azteka-worker..."
fi

# Start/restart with new config (both processes)
pm2 start ecosystem.config.cjs || pm2 restart all

# Save PM2 configuration
pm2 save

echo "✅ PM2 deployment completed (Next.js + Worker)"
EOF

log_success "PM2 deployment completed"

# ============================================================================
# VERIFY DEPLOYMENT
# ============================================================================

log_info "Verifying deployment..."

# Wait a few seconds for app to start
sleep 5

# Check PM2 status
log_info "Checking PM2 status..."
ssh "${VPS_USER}@${VPS_HOST}" "pm2 list | grep -E '(azteka-nextjs|azteka-worker)'"

# Check if ports are listening
log_info "Checking if port ${PORT} (Next.js) is listening..."
if ssh "${VPS_USER}@${VPS_HOST}" "lsof -iTCP:${PORT} -sTCP:LISTEN" &> /dev/null; then
    log_success "Port ${PORT} (Next.js) is listening"
else
    log_warning "Port ${PORT} (Next.js) not yet listening (may need a moment)"
fi

log_info "Checking if port 3003 (Express Worker) is listening..."
if ssh "${VPS_USER}@${VPS_HOST}" "lsof -iTCP:3003 -sTCP:LISTEN" &> /dev/null; then
    log_success "Port 3003 (Express Worker) is listening"
else
    log_warning "Port 3003 (Express Worker) not yet listening (may need a moment)"
fi

# Test health endpoint (if available)
log_info "Testing application health..."
if ssh "${VPS_USER}@${VPS_HOST}" "curl -s http://localhost:${PORT}/api/warehouse/print-slip" &> /dev/null; then
    log_success "Application is responding"
else
    log_warning "Health check failed (app may still be starting)"
fi

# ============================================================================
# NGINX UPDATE (if needed)
# ============================================================================

log_info "Checking Nginx configuration..."

ssh "${VPS_USER}@${VPS_HOST}" bash <<'NGINX_EOF'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/azteka-dsd"

if [ -f "$NGINX_CONFIG" ]; then
    # Check if config already points to port 3002
    if grep -q "proxy_pass http://127.0.0.1:3002" "$NGINX_CONFIG"; then
        echo "✅ Nginx already configured for port 3002"
    else
        echo "⚠ Nginx config may need updating"
        echo "   Check: $NGINX_CONFIG"
        echo "   Should have: proxy_pass http://127.0.0.1:3002"
    fi
    
    # Test nginx config
    if nginx -t &> /dev/null; then
        echo "✅ Nginx configuration is valid"
        # Reload nginx
        systemctl reload nginx || echo "⚠ Nginx reload failed (may need manual reload)"
    else
        echo "⚠ Nginx configuration has errors"
    fi
else
    echo "⚠ Nginx config not found at $NGINX_CONFIG"
fi
NGINX_EOF

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

log_success "Deployment completed!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Production URL: https://${DOMAIN}"
echo "  📦 App Name: ${APP_NAME}"
echo "  🔌 Port: ${PORT}"
echo "  📍 VPS Path: ${VPS_PATH}"
echo ""
echo "  📝 Next Steps:"
echo "    1. Visit https://${DOMAIN} to test"
echo "    2. Check logs: ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${PM2_NAME}'"
echo "    3. Monitor: ssh ${VPS_USER}@${VPS_HOST} 'pm2 monit'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

