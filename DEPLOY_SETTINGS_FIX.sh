#!/bin/bash
# Deploy Settings Page Fixes to VPS
# Fixes the admin settings save functionality

set -e

VPS="root@77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo "🚀 Deploying Settings Fixes to VPS"
echo "==================================="
echo ""

# Step 1: Sync the fixed files
echo "📦 Step 1: Syncing fixed files..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --include 'app/api/admin/settings/route.ts' \
  --include 'app/admin/settings/page.tsx' \
  --include 'app/api/lib/auth.ts' \
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
echo "🌐 Visit: https://aztekafoods.com/admin/settings"
echo "💡 Try saving your settings now!"
echo ""
echo "📊 Check browser console for detailed logs if issues persist"
echo ""





