#!/bin/bash
# SAFE DEPLOY SCRIPT - Run this instead of manual deployment
# This script prevents broken builds from reaching production

set -e  # Exit on any error

echo "=========================================="
echo "  AZTEKA SAFE DEPLOY"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check for uncommitted changes
echo -e "${YELLOW}[1/6] Checking git status...${NC}"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}ERROR: You have uncommitted changes.${NC}"
    echo "Please commit or stash changes before deploying."
    git status --short
    exit 1
fi
echo -e "${GREEN}✓ Git is clean${NC}"
echo ""

# Step 2: TypeScript check
echo -e "${YELLOW}[2/6] Running TypeScript check...${NC}"
if ! npm run typecheck 2>&1; then
    echo -e "${RED}ERROR: TypeScript errors found. Fix them before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ TypeScript check passed${NC}"
echo ""

# Step 3: Local build test
echo -e "${YELLOW}[3/6] Testing local build...${NC}"
if ! npm run build:next 2>&1; then
    echo -e "${RED}ERROR: Build failed locally. Fix errors before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Local build successful${NC}"
echo ""

# Step 4: Push to git
echo -e "${YELLOW}[4/6] Pushing to git...${NC}"
git push origin bolt-visual-stable
echo -e "${GREEN}✓ Pushed to origin${NC}"
echo ""

# Step 5: Deploy to VPS
echo -e "${YELLOW}[5/6] Deploying to VPS...${NC}"
ssh root@72.62.162.163 "cd /srv/azteka-dsd && git pull origin bolt-visual-stable && npx prisma generate && npm run build:next && pm2 restart azteka-production"
echo -e "${GREEN}✓ VPS deployment complete${NC}"
echo ""

# Step 6: Verify
echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"
ssh root@72.62.162.163 "pm2 status azteka-production && echo '' && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo 'API check skipped'"
echo ""

echo "=========================================="
echo -e "${GREEN}  DEPLOY SUCCESSFUL${NC}"
echo "  URL: https://aztekafoods.com"
echo "=========================================="
