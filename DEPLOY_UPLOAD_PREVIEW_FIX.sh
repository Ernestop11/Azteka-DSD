#!/bin/bash

# =============================================================================
# Deploy Upload Preview Fix
# =============================================================================
# This script deploys fixes for:
# 1. Image preview not updating after upload
# 2. Glitchy state updates
# 3. Cache-busting for immediate image display
# =============================================================================

set -e

VPS_USER="root"
VPS_IP="77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo ""
echo "🚀 Deploying Upload Preview Fix"
echo "================================"
echo ""

# Step 1: Sync fixed file
echo "📦 Step 1: Syncing fixed file..."
rsync -avz \
  app/employee/inventory/page.tsx \
  "${VPS_USER}@${VPS_IP}:${APP_PATH}/app/employee/inventory/"
echo "✅ File synced"
echo ""

# Step 2: Rebuild and restart
echo "🔄 Step 2: Rebuilding and restarting on VPS..."
ssh "${VPS_USER}@${VPS_IP}" << EOF
set -e
cd "${APP_PATH}"

echo "   🏗️  Building Next.js app..."
npm run build:next

echo "   ♻️  Restarting services..."
pm2 restart azteka-nextjs

echo "   🧹 Clearing cache..."
rm -rf .next/cache/*

echo "   🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
EOF
echo ""

echo "✅ Upload preview fix deployed!"
echo ""
echo "📋 Changes:"
echo "   1. ✅ Added cache-busting query parameters to image URLs"
echo "   2. ✅ Enhanced state updates with timestamp tracking"
echo "   3. ✅ Improved key props for forced re-renders"
echo "   4. ✅ Added image load callbacks for debugging"
echo ""
echo "🌐 Test at: https://aztekafoods.com/employee/inventory"
echo "   - Upload image on product modal"
echo "   - Preview should update immediately"
echo ""





