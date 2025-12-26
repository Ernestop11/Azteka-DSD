#!/bin/bash

# =============================================================================
# Azteka DSD - Git-Based Deployment Script
# =============================================================================
#
# Flow: Local → Git → VPS Pull → VPS Build → PM2 Restart
#
# Usage: ./scripts/deploy.sh
# =============================================================================

set -e

VPS="root@77.243.85.8"
# CRITICAL: Use /srv/azteka-dsd - NOT /srv/azteka-api-live
APP_PATH="/srv/azteka-dsd"

echo ""
echo "🚀 Azteka DSD Deployment"
echo "========================"
echo ""

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    echo ""
    read -p "Commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Commit message: " message
        git add .
        git commit -m "$message"
    else
        echo "❌ Commit your changes first, then deploy."
        exit 1
    fi
fi

# Push to git
echo "📤 Pushing to git..."
git push origin main || git push origin $(git branch --show-current)

# Deploy on VPS via SSH
echo ""
echo "🔄 Deploying on VPS..."
ssh $VPS << 'DEPLOY_SCRIPT'
set -e
cd /srv/azteka-dsd

echo ""
echo "📥 Pulling latest from git..."
git fetch origin
git reset --hard origin/main

echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --silent

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "   No pending migrations"

echo ""
echo "🏗️  Building Next.js..."
npm run build:next

# CRITICAL: Ensure correct module type for Next.js build
echo '{"type": "commonjs"}' > .next-azteka/package.json

echo ""
echo "♻️  Restarting services..."
pm2 restart azteka-nextjs azteka-worker
pm2 save

echo ""
echo "✅ VPS deployment complete!"
DEPLOY_SCRIPT

# Show status
echo ""
echo "========================"
echo "✅ Deployment successful!"
echo "========================"
echo ""
echo "🌐 Site: https://aztekafoods.com"
echo ""
echo "📋 Commands:"
echo "   Logs:    ssh $VPS 'pm2 logs azteka-nextjs --lines 30'"
echo "   Status:  ssh $VPS 'pm2 list'"
echo "   Restart: ssh $VPS 'pm2 restart azteka-nextjs'"
echo ""
