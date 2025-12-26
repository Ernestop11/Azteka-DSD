#!/bin/bash
# SAFE DEPLOY SCRIPT - VPS-ONLY BUILDS
# NO local builds - VPS is the single source of truth
# This script pushes code to VPS and builds THERE

set -e  # Exit on any error

echo "=========================================="
echo "  AZTEKA SAFE DEPLOY (VPS-ONLY BUILD)"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VPS_HOST="root@72.62.162.163"
VPS_PATH="/srv/azteka-dsd"

# Step 1: Check for uncommitted changes
echo -e "${YELLOW}[1/4] Checking git status...${NC}"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}ERROR: You have uncommitted changes.${NC}"
    echo "Please commit or stash changes before deploying."
    git status --short
    exit 1
fi
echo -e "${GREEN}✓ Git is clean${NC}"
echo ""

# Step 2: Push to git
echo -e "${YELLOW}[2/4] Pushing to git...${NC}"
git push origin bolt-visual-stable
echo -e "${GREEN}✓ Pushed to origin${NC}"
echo ""

# Step 3: Deploy and build on VPS (ALL builds happen here)
echo -e "${YELLOW}[3/4] Deploying to VPS (building on VPS)...${NC}"
ssh ${VPS_HOST} << 'EOF'
    set -e
    cd /srv/azteka-dsd

    echo "  → Pulling latest code..."
    git pull origin bolt-visual-stable

    echo "  → Installing dependencies..."
    npm install --legacy-peer-deps

    echo "  → Generating Prisma client..."
    npx prisma generate

    echo "  → Building Next.js on VPS..."
    npm run build:next

    echo "  → Restarting PM2..."
    pm2 restart azteka-production
    pm2 save

    echo "  ✓ VPS build and deploy complete"
EOF
echo -e "${GREEN}✓ VPS deployment complete${NC}"
echo ""

# Step 4: Verify
echo -e "${YELLOW}[4/4] Verifying deployment...${NC}"
ssh ${VPS_HOST} "pm2 status azteka-production"
echo ""

# Health check
HTTP_CODE=$(ssh ${VPS_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/products" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ API responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ API returned HTTP $HTTP_CODE (may need login)${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}  DEPLOY SUCCESSFUL${NC}"
echo "  URL: https://aztekafoods.com"
echo "=========================================="
