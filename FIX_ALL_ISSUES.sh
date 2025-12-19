#!/bin/bash

# =============================================================================
# Fix All Issues: Images, Cart, Product Cards
# =============================================================================
# This script fixes:
# 1. Image upload and display issues
# 2. Product card quantity controls
# 3. Image overlapping problems
# 4. Cart functionality
# =============================================================================

set -e

VPS_USER="root"
VPS_IP="77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo ""
echo "🔧 Fixing All Issues on VPS"
echo "============================"
echo ""

# Step 1: Sync ALL fixed files
echo "📦 Step 1: Syncing all fixed files..."
rsync -avz \
  app/employee/inventory/page.tsx \
  app/catalog/CatalogContent.tsx \
  components/catalog/ProductCard.tsx \
  app/api/employee/products/upload-image/route.ts \
  app/api/admin/products/uploadImage/route.ts \
  lib/imageUrl.ts \
  "${VPS_USER}@${VPS_IP}:${APP_PATH}/"
echo "✅ All files synced."
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

echo "✅ All fixes deployed!"
EOF
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Test at: https://aztekafoods.com"
echo "   - Catalog: /catalog (click cards to see quantity controls)"
echo "   - Inventory: /employee/inventory (upload images)"
echo ""


