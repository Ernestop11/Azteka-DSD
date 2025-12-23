#!/bin/bash

# Deploy Price Management System to VPS
# This script:
# 1. Syncs files to VPS
# 2. Runs database migration
# 3. Generates Prisma client
# 4. Builds Next.js app
# 5. Restarts PM2 processes

set -e

VPS_HOST="root@77.243.85.8"
VPS_PATH="/srv/azteka-api-live"
LOCAL_PATH="/Users/ernestoponce/dev/azteka-dsd"

echo "🚀 Deploying Price Management System to VPS..."

# 1. Sync files (excluding node_modules, .next, etc.)
echo "📦 Syncing files to VPS..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude '*.log' \
  "${LOCAL_PATH}/" "${VPS_HOST}:${VPS_PATH}/"

# 2. SSH into VPS and run migration
echo "🗄️  Running database migration..."
ssh "${VPS_HOST}" << 'ENDSSH'
cd /srv/azteka-api-live

# Run manual migration if Prisma migrate fails
echo "Running CustomerPriceOverride migration..."
psql $DATABASE_URL -f prisma/migrations/manual_add_customer_price_override.sql 2>&1 | grep -v "already exists" || true

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Install dependencies (in case new packages were added)
echo "Installing dependencies..."
npm install

# Build Next.js app
echo "Building Next.js app..."
npm run build:next

# Restart PM2 processes
echo "Restarting PM2 processes..."
pm2 restart azteka-nextjs
pm2 restart azteka-worker || true

echo "✅ Deployment complete!"
pm2 list | grep azteka
ENDSSH

echo ""
echo "✅ Price Management System deployed successfully!"
echo ""
echo "📋 What was deployed:"
echo "  ✓ CustomerPriceOverride database model"
echo "  ✓ Price override API endpoints"
echo "  ✓ Price calculation utility"
echo "  ✓ Admin pricing management UI"
echo "  ✓ PO workflow visualization page"
echo ""
echo "🔗 Access the new features:"
echo "  - Price Management: https://aztekafoods.com/admin/pricing"
echo "  - PO Workflow: https://aztekafoods.com/admin/po/[po-id]/workflow"
echo ""



