#!/bin/bash
#
# VPS Deploy Script for Azteka DSD
# This script syncs code to VPS and rebuilds there (not locally)
# to ensure the build uses VPS environment variables
#
# Usage: ./scripts/deploy-vps.sh
#

set -e

VPS_HOST="root@72.62.162.163"
VPS_PATH="/srv/azteka-dsd"

echo "🚀 Azteka DSD - VPS Deployment"
echo "================================"

# Step 1: Sync source files (exclude build artifacts and env files)
echo ""
echo "📦 Step 1: Syncing source files to VPS..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.next' \
  --exclude='.next-azteka' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='public/uploads' \
  --exclude='pm2.config.cjs' \
  --exclude='logs' \
  /Users/ernestoponce/dev/azteka-dsd/ \
  ${VPS_HOST}:${VPS_PATH}/

echo "✅ Source files synced"

# Step 2: Build on VPS (uses VPS environment variables)
echo ""
echo "🔨 Step 2: Building on VPS (this uses VPS DATABASE_URL)..."
ssh ${VPS_HOST} "cd ${VPS_PATH} && npm run build"

echo "✅ Build complete"

# Step 3: Restart PM2
echo ""
echo "🔄 Step 3: Restarting PM2..."
ssh ${VPS_HOST} "cd ${VPS_PATH} && pm2 restart azteka-production && pm2 save"

echo "✅ PM2 restarted"

# Step 4: Verify
echo ""
echo "📋 Step 4: Verifying deployment..."
ssh ${VPS_HOST} "pm2 list | grep azteka-production"

echo ""
echo "================================"
echo "✅ Deployment complete!"
echo ""
echo "Check logs with: ssh ${VPS_HOST} 'pm2 logs azteka-production --lines 50'"
