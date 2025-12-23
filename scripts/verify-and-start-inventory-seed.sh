#!/bin/bash

# Script to verify inventory seed setup and start server on VPS
# Run this on the VPS or via SSH

set -e

VPS_HOST="77.243.85.8"
VPS_USER="root"
VPS_PATH="/srv/azteka-api-live"
PORT=3002

echo "🔍 Verifying Inventory Seed Setup..."
echo ""

# Check if running locally or on VPS
if [ "$HOSTNAME" != "localhost" ] && [ "$HOSTNAME" != "$(hostname)" ]; then
    echo "📡 Connecting to VPS..."
    ssh "${VPS_USER}@${VPS_HOST}" bash <<'EOF'
set -e

cd /srv/azteka-api-live

echo "✅ Checking database schema..."
npx prisma db pull > /dev/null 2>&1 || echo "⚠ Could not pull schema (may need manual check)"

echo "✅ Verifying Product table has imageUrl field..."
psql -U azteka_user -d azteka_dsd -c "\d Product" | grep -q "imageUrl" && echo "✅ imageUrl field exists" || echo "❌ imageUrl field missing!"

echo "✅ Creating uploads directory if needed..."
mkdir -p public/uploads/products
chmod 755 public/uploads/products
echo "✅ Uploads directory ready: $(pwd)/public/uploads/products"

echo "✅ Checking PM2 status..."
pm2 list | grep -E "(azteka-nextjs|azteka-api)" || echo "⚠ No PM2 process found"

echo ""
echo "🚀 Starting/restarting server..."
if pm2 list | grep -q "azteka-nextjs"; then
    pm2 restart azteka-nextjs
    echo "✅ Server restarted"
else
    echo "⚠ azteka-nextjs not found in PM2, checking ecosystem config..."
    if [ -f "ecosystem.config.cjs" ]; then
        pm2 start ecosystem.config.cjs
        pm2 save
        echo "✅ Server started from ecosystem.config.cjs"
    else
        echo "❌ No PM2 config found. Please deploy first."
        exit 1
    fi
fi

echo ""
echo "✅ Setup complete!"
echo "📋 Test URL: https://aztekafoods.com/admin/inventory-seed"
echo "📁 Uploads directory: $(pwd)/public/uploads/products"
EOF
else
    # Running locally
    echo "📁 Checking local setup..."
    cd "$(dirname "$0")/.."
    
    echo "✅ Verifying database schema..."
    npx prisma db pull > /dev/null 2>&1 || echo "⚠ Could not pull schema"
    
    echo "✅ Creating uploads directory..."
    mkdir -p public/uploads/products
    chmod 755 public/uploads/products
    echo "✅ Uploads directory: $(pwd)/public/uploads/products"
    
    echo ""
    echo "✅ Local setup complete!"
    echo "📋 Test URL: http://localhost:3000/admin/inventory-seed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Inventory Seed Setup Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Production URL: https://aztekafoods.com/admin/inventory-seed"
echo ""
echo "📝 How to use:"
echo "   1. Navigate to the URL above"
echo "   2. Log in as admin (admin@aztekafoods.com)"
echo "   3. Drag PNG files from Finder onto product cards"
echo "   4. Images will be saved to: /srv/azteka-api-live/public/uploads/products/"
echo ""
echo "🔍 To check server status:"
echo "   ssh root@77.243.85.8 'pm2 logs azteka-nextjs --lines 50'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

