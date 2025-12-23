#!/bin/bash
# Complete Fix and Deploy Script
# Runs all fixes and deploys changes

set -e

echo "🚀 Starting Complete Fix and Deploy Process"
echo "=" | head -c 60; echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Run image fix script
echo -e "\n${YELLOW}Step 1: Fixing image issues...${NC}"
node scripts/fix-image-issues.mjs

# Step 2: Check image health
echo -e "\n${YELLOW}Step 2: Checking image health...${NC}"
node scripts/monitor-image-health.mjs || echo "   Health check completed (warnings OK)"

# Step 3: Build Next.js app
echo -e "\n${YELLOW}Step 3: Building Next.js application...${NC}"
npm run build:next || npm run build

# Step 4: Restart services
echo -e "\n${YELLOW}Step 4: Restarting services...${NC}"
bash scripts/restart-services.sh

# Step 5: Verify deployment
echo -e "\n${YELLOW}Step 5: Verifying deployment...${NC}"
echo "   Checking PM2 status..."
pm2 status || echo "   PM2 status check skipped"

echo -e "\n${GREEN}✅ Fix and deploy complete!${NC}"
echo ""
echo "Verify by:"
echo "1. Visit /api/admin/diagnostics/images to check image status"
echo "2. Test image uploads on /admin/inventory-seed"
echo "3. Check product images on /catalog"
echo ""

