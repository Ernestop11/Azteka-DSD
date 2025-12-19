#!/bin/bash
# Quick Deploy - Image Fixes to VPS
# Syncs the fixes directly to VPS and rebuilds

set -e

VPS="root@77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo "🚀 Deploying Image Fixes to VPS"
echo "================================"
echo ""

# Step 1: Sync the fixed files
echo "📦 Step 1: Syncing fixed files..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --include 'app/employee/inventory/page.tsx' \
  --include 'app/employee/products/page.tsx' \
  --include 'app/api/employee/products/upload-image/route.ts' \
  --include 'app/api/admin/products/uploadImage/route.ts' \
  --include 'lib/imageUrl.ts' \
  ./ ${VPS}:${APP_PATH}/

echo "✅ Files synced"
echo ""

# Step 2: Rebuild and restart on VPS
echo "🔨 Step 2: Rebuilding Next.js on VPS..."
ssh ${VPS} << 'DEPLOY_SCRIPT'
set -e
cd /srv/azteka-api-live

echo "📦 Installing dependencies (if needed)..."
npm install --legacy-peer-deps --silent

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️  Building Next.js..."
npm run build:next

echo "♻️  Restarting services..."
pm2 restart azteka-nextjs azteka-worker || pm2 restart all
pm2 save

echo "🧹 Clearing Next.js cache..."
rm -rf .next/cache/* 2>/dev/null || true

echo "🌐 Reloading Nginx..."
nginx -t && systemctl reload nginx || true

echo "✅ Deployment complete on VPS!"
DEPLOY_SCRIPT

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit: https://aztekafoods.com/employee/inventory"
echo "📊 Check Alpura Vaquita Chocolate"
echo ""
echo "💡 Next steps:"
echo "   1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "   2. Check browser console for any errors"
echo "   3. Try uploading image again"
echo ""

