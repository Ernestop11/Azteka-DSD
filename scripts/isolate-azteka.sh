#!/usr/bin/env bash
# Isolate Azteka DSD - Clean setup with exclusive PM2 configuration
# Run this on VPS to separate Azteka DSD from other applications

set -euo pipefail

echo "=========================================="
echo "Isolating Azteka DSD Application"
echo "=========================================="
echo ""

echo "🧹 Step 1: Backing up existing PM2 processes..."
# Save current PM2 list for reference
pm2 list > /root/pm2-backup-$(date +%Y%m%d_%H%M%S).txt || true

echo "💾 PM2 process list backed up to /root/"

echo "🛑 Step 1b: Stopping all PM2 processes..."
pm2 delete all || true
pm2 kill

echo "✅ All PM2 processes stopped"

echo "🗑️  Step 2: Removing backup files and conflicting imports..."
# Remove backup files
rm -f /srv/azteka-dsd/server.mjs.bak
rm -f /srv/azteka-dsd/server.mjs~

# Clean up any other apps in the azteka-dsd directory
if [ -d "/srv/azteka-dsd/apps/sales" ]; then
    echo "⚠️  Found apps/sales directory - backing up to /root/apps-backup/"
    mkdir -p /root/apps-backup
    mv /srv/azteka-dsd/apps /root/apps-backup/ || true
fi

echo "✅ Backup files removed"

echo "🔍 Step 3: Fixing server.mjs - removing rembg-node import..."
# Create a clean version without the problematic import
sed '/import.*rembg-node/d' /srv/azteka-dsd/server.mjs > /srv/azteka-dsd/server.mjs.tmp
mv /srv/azteka-dsd/server.mjs.tmp /srv/azteka-dsd/server.mjs

# Also comment out any removeBackground usage in the file
sed -i 's/removeBackground(/\/\/ removeBackground(/g' /srv/azteka-dsd/server.mjs || true

echo "✅ server.mjs cleaned"

echo "📝 Step 4: Creating PM2 ecosystem file..."
cat > /srv/azteka-dsd/ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'azteka-api',
    script: '/srv/azteka-dsd/server.mjs',
    cwd: '/srv/azteka-dsd',
    env_file: '/srv/azteka-dsd/.env.production',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/srv/azteka-dsd/logs/pm2-error.log',
    out_file: '/srv/azteka-dsd/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Remove old .js file if exists
rm -f /srv/azteka-dsd/ecosystem.config.js

echo "✅ Ecosystem file created (ecosystem.config.cjs)"

echo "📁 Step 5: Creating logs directory..."
mkdir -p /srv/azteka-dsd/logs

echo "✅ Logs directory created"

echo "🚀 Step 6: Starting Azteka DSD with isolated configuration..."
cd /srv/azteka-dsd
pm2 start ecosystem.config.cjs
pm2 save --force

echo "✅ Azteka DSD started"

echo "⏳ Waiting 5 seconds for server to initialize..."
sleep 5

echo ""
echo "=========================================="
echo "🧪 Testing Backend Health"
echo "=========================================="
echo ""

# Test health endpoint
if curl -f http://127.0.0.1:4000/health 2>/dev/null; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed"
    echo ""
    echo "📋 PM2 Status:"
    pm2 status
    echo ""
    echo "📋 Recent Logs:"
    pm2 logs azteka-api --lines 30 --nostream
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Isolation Complete!"
echo "=========================================="
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📋 Azteka DSD is now running exclusively"
echo "   - Process name: azteka-api"
echo "   - Script: /srv/azteka-dsd/server.mjs"
echo "   - Config: /srv/azteka-dsd/ecosystem.config.js"
echo "   - Logs: /srv/azteka-dsd/logs/"
echo ""
echo "🔍 Monitor with:"
echo "   pm2 logs azteka-api"
echo "   pm2 monit"
echo ""
echo "🌐 Test in browser:"
echo "   http://77.243.85.8"
echo "   http://aztekafoods.com"
echo ""
echo "=========================================="
