#!/bin/bash
# Azteka DSD Frontend Deployment Script
# This deploys the built frontend from local to VPS

set -e  # Exit on error

VPS_IP="157.173.113.239"
VPS_USER="root"
REMOTE_PATH="/srv/azteka-dsd/dist"
LOCAL_DIST="./dist"

echo "🚀 Azteka DSD Frontend Deployment"
echo "=================================="
echo ""

# 1️⃣ Check local build exists
if [ ! -d "$LOCAL_DIST" ]; then
  echo "❌ Error: ./dist directory not found"
  echo "Run 'npm run build' first"
  exit 1
fi

echo "✅ Local build found"
echo ""

# 2️⃣ Clean remote dist directory
echo "🧹 Cleaning remote dist directory..."
ssh ${VPS_USER}@${VPS_IP} "rm -rf ${REMOTE_PATH}/*"
echo "✅ Remote dist cleaned"
echo ""

# 3️⃣ Copy new build to VPS
echo "📦 Copying build to VPS..."
scp -r ${LOCAL_DIST}/* ${VPS_USER}@${VPS_IP}:${REMOTE_PATH}/
echo "✅ Build copied successfully"
echo ""

# 4️⃣ Restart nginx
echo "🔄 Restarting nginx..."
ssh ${VPS_USER}@${VPS_IP} "sudo nginx -t && sudo systemctl reload nginx"
echo "✅ Nginx reloaded"
echo ""

# 5️⃣ Restart backend API
echo "🔄 Restarting backend API..."
ssh ${VPS_USER}@${VPS_IP} "pm2 restart azteka-api"
echo "✅ Backend API restarted"
echo ""

# 6️⃣ Verify deployment
echo "🔍 Verifying deployment..."
ssh ${VPS_USER}@${VPS_IP} "ls -lh ${REMOTE_PATH}/assets/ | head -5"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit: https://aztekafoods.com"
echo "📊 API Health: https://aztekafoods.com/api/health"
echo "🛍️  Products API: https://aztekafoods.com/api/products"
echo ""
