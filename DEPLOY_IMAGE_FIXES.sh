#!/bin/bash

# =============================================================================
# Deploy Image Display & Upload Fixes to VPS
# =============================================================================
# This script deploys fixes for:
# 1. Placeholder squares overlapping images (z-index fix)
# 2. Image upload button not working in modal
# 3. HEIC format support
# =============================================================================

set -e

VPS_USER="root"
VPS_IP="77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo ""
echo "🚀 Deploying Image Display & Upload Fixes to VPS"
echo "=================================================="
echo ""

# Step 1: Sync fixed files to VPS
echo "📦 Step 1: Syncing fixed files..."
rsync -avz \
  app/employee/inventory/page.tsx \
  "${VPS_USER}@${VPS_IP}:${APP_PATH}/app/employee/inventory/"
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
echo "🌐 Visit: https://aztekafoods.com/employee/inventory"
echo "📊 Check Alpura Vaquita Chocolate"
echo ""
echo "💡 Next steps:"
echo "   1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "   2. Check that placeholder squares no longer overlap images"
echo "   3. Try uploading image - click on the image in modal header"
echo "   4. Try uploading HEIC format images"
echo ""
echo "🔧 To disable visual-tools page (if needed):"
echo "   ./scripts/disable-visual-tools.sh"
echo ""

