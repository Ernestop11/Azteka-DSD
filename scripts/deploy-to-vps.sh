#!/bin/bash
# Deploy to VPS Script
# Handles complete deployment to VPS server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 VPS Deployment Script${NC}"
echo "=" | head -c 60; echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# VPS Configuration (from project docs)
VPS_HOST="${VPS_HOST:-${VPS_SSH_HOST:-77.243.85.8}}"
VPS_USER="${VPS_USER:-${VPS_SSH_USER:-root}}"
VPS_PATH="${VPS_PATH:-/srv/azteka-api-live}"
VPS_UPLOADS_PATH="${VPS_UPLOADS_PATH:-/srv/azteka-api-live/public/uploads/products}"

# Check if VPS_HOST is set
if [ -z "$VPS_HOST" ]; then
    echo -e "${RED}❌ VPS_HOST not set${NC}"
    echo ""
    echo "Please set VPS_HOST in your .env file:"
    echo "  VPS_HOST=your-vps-ip-or-hostname"
    echo "  VPS_USER=your-ssh-user (default: root)"
    echo "  VPS_PATH=/srv/azteka-dsd (default)"
    echo ""
    read -p "Enter VPS hostname/IP now (or press Ctrl+C to cancel): " VPS_HOST
    if [ -z "$VPS_HOST" ]; then
        echo -e "${RED}❌ VPS_HOST required. Exiting.${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}VPS Configuration:${NC}"
echo "  Host: $VPS_HOST"
echo "  User: $VPS_USER"
echo "  Path: $VPS_PATH"
echo "  Uploads: $VPS_UPLOADS_PATH"
echo ""

# Test SSH connection
echo -e "${YELLOW}1. Testing SSH connection...${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${GREEN}   ✅ SSH connection successful${NC}"
else
    echo -e "${RED}   ❌ SSH connection failed${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. SSH key is set up for passwordless login"
    echo "  2. VPS hostname/IP is correct"
    echo "  3. Test manually: ssh $VPS_USER@$VPS_HOST"
    exit 1
fi

# Check if git is clean
echo -e "\n${YELLOW}2. Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}   ⚠️  Uncommitted changes detected${NC}"
    read -p "   Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}   ✅ Git is clean${NC}"
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "   Current branch: ${BLUE}$CURRENT_BRANCH${NC}"

# Build locally first
echo -e "\n${YELLOW}3. Building Next.js application...${NC}"
npm run build:next || npm run build
echo -e "${GREEN}   ✅ Build complete${NC}"

# Deploy code to VPS
echo -e "\n${YELLOW}4. Deploying code to VPS...${NC}"
echo "   Pushing to VPS..."

# Option 1: Git pull on VPS (recommended)
echo "   Using git pull method..."
ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    cd $VPS_PATH || { echo "❌ Directory $VPS_PATH not found"; exit 1; }
    echo "   📥 Pulling latest code..."
    git fetch origin
    git checkout $CURRENT_BRANCH || git checkout main
    git pull origin $CURRENT_BRANCH || git pull origin main
    echo "   ✅ Code updated"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Code deployed${NC}"
else
    echo -e "${RED}   ❌ Code deployment failed${NC}"
    exit 1
fi

# Install dependencies on VPS
echo -e "\n${YELLOW}5. Installing dependencies on VPS...${NC}"
ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    cd $VPS_PATH
    echo "   📦 Installing npm packages..."
    npm install --production
    echo "   🔧 Generating Prisma client..."
    npx prisma generate
    echo "   ✅ Dependencies installed"
EOF

# Run image fix on VPS
echo -e "\n${YELLOW}6. Running image fix on VPS...${NC}"
ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    cd $VPS_PATH
    echo "   🔍 Checking images..."
    node scripts/fix-image-issues.mjs || echo "   ⚠️  Fix script completed with warnings"
    echo "   ✅ Image check complete"
EOF

# Sync images from local to VPS (if needed)
echo -e "\n${YELLOW}7. Syncing images to VPS...${NC}"
if [ -d "public/uploads/products" ] && [ "$(ls -A public/uploads/products 2>/dev/null)" ]; then
    echo "   📤 Syncing images..."
    rsync -avz --progress \
        --exclude='.DS_Store' \
        public/uploads/products/ \
        "$VPS_USER@$VPS_HOST:$VPS_UPLOADS_PATH/"
    echo -e "${GREEN}   ✅ Images synced${NC}"
else
    echo -e "${YELLOW}   ⚠️  No local images to sync${NC}"
fi

# Build on VPS
echo -e "\n${YELLOW}8. Building on VPS...${NC}"
ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    cd $VPS_PATH
    echo "   🔨 Building Next.js..."
    npm run build:next || npm run build
    echo "   ✅ Build complete"
EOF

# Restart services on VPS
echo -e "\n${YELLOW}9. Restarting services on VPS...${NC}"
ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    cd $VPS_PATH
    
    # Restart PM2
    echo "   🔄 Restarting PM2..."
    pm2 restart all || pm2 start ecosystem.config.cjs || echo "   ⚠️  PM2 restart skipped"
    
    # Reload Nginx
    echo "   🔄 Reloading Nginx..."
    sudo systemctl reload nginx || sudo service nginx reload || echo "   ⚠️  Nginx reload skipped"
    
    # Clear Next.js cache
    echo "   🧹 Clearing cache..."
    rm -rf .next-azteka .next || true
    
    echo "   ✅ Services restarted"
EOF

# Verify deployment
echo -e "\n${YELLOW}10. Verifying deployment...${NC}"
ssh "$VPS_USER@$VPS_HOST" << EOF
    cd $VPS_PATH
    echo "   📊 PM2 Status:"
    pm2 status || echo "   ⚠️  PM2 not running"
    echo ""
    echo "   📁 Checking uploads directory:"
    ls -la public/uploads/products/ 2>/dev/null | head -5 || echo "   ⚠️  Uploads directory not found"
EOF

# Summary
echo -e "\n" 
echo "=" | head -c 60; echo ""
echo -e "${GREEN}✅ VPS Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Check PM2: ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "  2. Check logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs'"
echo "  3. Test diagnostics: https://your-domain.com/api/admin/diagnostics/images"
echo "  4. Test image upload: https://your-domain.com/admin/inventory-seed"
echo ""
