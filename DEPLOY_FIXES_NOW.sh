#!/bin/bash
# Quick Deploy Script - Deploy Image Fixes to VPS
# This syncs the fixes we just made to the VPS

set -e

VPS_IP="77.243.85.8"
VPS_USER="root"
REMOTE_PATH="/srv/azteka-dsd"

echo "🚀 Deploying Image Fixes to VPS"
echo "================================"
echo ""
echo "VPS: ${VPS_USER}@${VPS_IP}"
echo "Path: ${REMOTE_PATH}"
echo ""

# Step 1: Sync fixed files to VPS
echo "📦 Step 1: Syncing fixed files to VPS..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env*' \
  --include 'app/employee/inventory/page.tsx' \
  --include 'app/employee/products/page.tsx' \
  --include 'app/api/employee/products/upload-image/route.ts' \
  --include 'app/api/admin/products/uploadImage/route.ts' \
  --include 'lib/imageUrl.ts' \
  ./ ${VPS_USER}@${VPS_IP}:${REMOTE_PATH}/

echo "✅ Files synced"
echo ""

# Step 2: Rebuild Next.js app on VPS
echo "🔨 Step 2: Rebuilding Next.js app on VPS..."
ssh ${VPS_USER}@${VPS_IP} "cd ${REMOTE_PATH} && npm run build"
echo "✅ Build complete"
echo ""

# Step 3: Restart Next.js server
echo "🔄 Step 3: Restarting Next.js server..."
ssh ${VPS_USER}@${VPS_IP} "cd ${REMOTE_PATH} && pm2 restart nextjs || pm2 restart azteka-api || systemctl restart nextjs"
echo "✅ Server restarted"
echo ""

# Step 4: Clear Next.js cache
echo "🧹 Step 4: Clearing Next.js cache..."
ssh ${VPS_USER}@${VPS_IP} "cd ${REMOTE_PATH} && rm -rf .next/cache/* 2>/dev/null || true"
echo "✅ Cache cleared"
echo ""

# Step 5: Reload Nginx
echo "🌐 Step 5: Reloading Nginx..."
ssh ${VPS_USER}@${VPS_IP} "nginx -t && systemctl reload nginx"
echo "✅ Nginx reloaded"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit: https://aztekafoods.com/employee/inventory"
echo "📊 Check Alpura Vaquita Chocolate image"
echo ""
echo "💡 If images still don't show:"
echo "   1. Hard refresh browser (Cmd+Shift+R)"
echo "   2. Check browser console for errors"
echo "   3. Verify image file exists on VPS"
echo ""

