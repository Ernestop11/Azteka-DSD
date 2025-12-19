#!/bin/bash

# =============================================================================
# Deploy ProductCard Fixes to VPS
# =============================================================================
# This script deploys fixes for ProductCard styling issues caused by
# visual preset system failures
# =============================================================================

set -e

VPS_USER="root"
VPS_IP="77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo ""
echo "🚀 Deploying ProductCard Fixes to VPS"
echo "======================================"
echo ""

# Step 1: Sync fixed files to VPS
echo "📦 Step 1: Syncing fixed files..."
rsync -avz \
  components/catalog/ProductCard.tsx \
  "${VPS_USER}@${VPS_IP}:${APP_PATH}/components/catalog/"
echo "✅ Files synced."
echo ""

# Step 2: SSH to VPS and rebuild Next.js app, restart services, clear cache
echo "🔄 Step 2: Rebuilding and restarting services on VPS..."
ssh "${VPS_USER}@${VPS_IP}" << EOF
set -e
cd "${APP_PATH}"

echo "   🏗️  Building Next.js app..."
npm run build:next

echo "   ♻️  Restarting Next.js app (azteka-nextjs)..."
pm2 restart azteka-nextjs

echo "   ♻️  Restarting worker (azteka-worker)..."
pm2 restart azteka-worker

echo "   🧹 Clearing Next.js cache..."
rm -rf .next/cache/*

echo "   🌐 Reloading Nginx..."
sudo systemctl reload nginx
echo "✅ Deployment complete on VPS!"
EOF
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit: https://aztekafoods.com/catalog"
echo "📊 Check product cards - they should display correctly now"
echo ""
echo "💡 Next steps:"
echo "   1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "   2. Check that product cards display properly"
echo "   3. If visual-tools page is still causing issues, run:"
echo "      ./scripts/disable-visual-tools.sh"
echo ""


