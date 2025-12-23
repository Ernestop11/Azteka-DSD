#!/bin/bash

# =============================================================================
# Deploy Product Sync & Background Removal Isolation Fixes
# =============================================================================
# This script deploys:
# 1. Background removal isolated to separate service
# 2. Product sync fixes across all pages
# 3. Image upload fixes
# =============================================================================

set -e

VPS_USER="root"
VPS_IP="77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo ""
echo "🚀 Deploying Product Sync & Background Removal Fixes"
echo "======================================================"
echo ""

# Step 1: Sync all fixed files
echo "📦 Step 1: Syncing fixed files..."
rsync -avz \
  app/api/employee/products/upload-image/route.ts \
  app/api/admin/products/uploadImage/route.ts \
  app/api/admin/products/route.ts \
  app/api/products/background-removal/route.ts \
  lib/services/backgroundRemoval.ts \
  "${VPS_USER}@${VPS_IP}:${APP_PATH}/"
echo "✅ Files synced"
echo ""

# Step 2: Rebuild and restart
echo "🔄 Step 2: Rebuilding and restarting on VPS..."
ssh "${VPS_USER}@${VPS_IP}" << EOF
set -e
cd "${APP_PATH}"

echo "   🏗️  Building Next.js app..."
npm run build:next

echo "   ♻️  Restarting services..."
pm2 restart azteka-nextjs azteka-worker

echo "   🧹 Clearing cache..."
rm -rf .next/cache/*

echo "   🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
EOF
echo ""

echo "✅ All fixes deployed!"
echo ""
echo "📋 Changes:"
echo "   1. ✅ Background removal isolated to /api/products/background-removal"
echo "   2. ✅ Product sync fixed across all pages (inventory, admin, catalog)"
echo "   3. ✅ Image upload simplified (no background removal in main flow)"
echo ""
echo "🌐 Test at: https://aztekafoods.com/employee/inventory"
echo "   - Upload image on product modal"
echo "   - Verify it syncs to all pages"
echo ""




