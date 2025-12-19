#!/bin/bash

# =============================================================================
# Remove Visual Tools and Restore Emergency Backup
# =============================================================================
# This script:
# 1. Removes visual-tools page completely
# 2. Removes LottieBadge component
# 3. Simplifies ProductCard (removes visual preset system)
# 4. Keeps inventory page as-is
# 5. Deploys to VPS
# =============================================================================

set -e

VPS_USER="root"
VPS_IP="77.243.85.8"
APP_PATH="/srv/azteka-api-live"

echo ""
echo "🗑️  Removing Visual Tools and Restoring Clean Version"
echo "========================================================"
echo ""

# Step 1: Remove visual-tools page completely
echo "🗑️  Step 1: Removing visual-tools page..."
rm -f app/admin/visual-tools/page.tsx.disabled
rm -rf app/admin/visual-tools
echo "✅ Visual-tools page removed"
echo ""

# Step 2: Remove LottieBadge component (if not used elsewhere)
echo "🗑️  Step 2: Checking LottieBadge usage..."
if ! grep -r "LottieBadge\|SparkleOverlay" app --exclude-dir=node_modules --exclude="*.disabled" 2>/dev/null | grep -v "visual-tools" | grep -v ".disabled"; then
  echo "   → LottieBadge only used in visual-tools (already disabled)"
else
  echo "   ⚠️  LottieBadge used elsewhere, keeping component"
fi
echo ""

# Step 3: Sync fixed files to VPS
echo "📦 Step 3: Syncing cleaned files to VPS..."
rsync -avz \
  components/catalog/ProductCard.tsx \
  app/catalog/CatalogContent.tsx \
  app/employee/inventory/page.tsx \
  "${VPS_USER}@${VPS_IP}:${APP_PATH}/"
echo "✅ Files synced"
echo ""

# Step 4: Remove visual-tools on VPS
echo "🗑️  Step 4: Removing visual-tools on VPS..."
ssh "${VPS_USER}@${VPS_IP}" << EOF
set -e
cd "${APP_PATH}"
rm -rf app/admin/visual-tools
echo "✅ Visual-tools removed on VPS"
EOF
echo ""

# Step 5: Rebuild and restart
echo "🔄 Step 5: Rebuilding and restarting on VPS..."
ssh "${VPS_USER}@${VPS_IP}" << EOF
set -e
cd "${APP_PATH}"

echo "   🏗️  Building Next.js app..."
npm run build:next

echo "   ♻️  Restarting services..."
pm2 restart azteka-nextjs azteka-worker

echo "   🧹 Clearing cache..."
rm -rf .next/cache/*

echo "   🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Cleanup complete!"
EOF
echo ""

echo "✅ All done!"
echo ""
echo "🌐 Test at: https://aztekafoods.com"
echo "   - Catalog: /catalog (simple cards, click to add to cart)"
echo "   - Inventory: /employee/inventory (working as-is)"
echo ""
echo "💡 Hard refresh required: Cmd+Shift+R or Ctrl+Shift+R"
echo ""


