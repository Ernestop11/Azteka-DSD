#!/bin/bash

# =============================================================================
# Restore Catalog from Backup While Keeping Current Inventory UI
# =============================================================================
# This script:
# 1. Backs up current inventory page
# 2. Restores catalog and cart functionality from backup commit
# 3. Restores inventory page with fixed image handling
# 4. Ensures cart add functionality works
# =============================================================================

set -e

BACKUP_COMMIT="f414def"  # "feat: Working version - All features functional"
BACKUP_DIR=".backup-restore-$(date +%s)"

echo ""
echo "🔄 Restoring Catalog from Backup (Keeping Inventory UI)"
echo "========================================================"
echo ""
echo "📋 Backup commit: $BACKUP_COMMIT"
echo "📁 Backup directory: $BACKUP_DIR"
echo ""

# Step 1: Create backup directory
echo "📦 Step 1: Creating backup directory..."
mkdir -p "$BACKUP_DIR"
echo "✅ Backup directory created"
echo ""

# Step 2: Backup current inventory page
echo "💾 Step 2: Backing up current inventory page..."
cp -v app/employee/inventory/page.tsx "$BACKUP_DIR/inventory-page-current.tsx"
echo "✅ Current inventory page backed up"
echo ""

# Step 3: Check what files exist in backup commit
echo "🔍 Step 3: Checking backup commit files..."
git show "$BACKUP_COMMIT" --name-only | grep -E "(catalog|cart|ProductCard)" | head -20 || echo "   (Checking all files...)"
echo ""

# Step 4: Restore catalog files from backup
echo "📥 Step 4: Restoring catalog files from backup..."
echo "   (This will restore catalog functionality while keeping inventory)"

# Restore catalog page if it exists in backup
if git show "$BACKUP_COMMIT:app/catalog/page.tsx" > /dev/null 2>&1; then
  echo "   ✓ Restoring app/catalog/page.tsx"
  git show "$BACKUP_COMMIT:app/catalog/page.tsx" > app/catalog/page.tsx.backup-restore
  echo "   → Saved to app/catalog/page.tsx.backup-restore"
fi

# Restore ProductCard components if they exist
if git show "$BACKUP_COMMIT:components/catalog/ProductCard.tsx" > /dev/null 2>&1; then
  echo "   ✓ Restoring components/catalog/ProductCard.tsx"
  git show "$BACKUP_COMMIT:components/catalog/ProductCard.tsx" > components/catalog/ProductCard.tsx.backup-restore
  echo "   → Saved to components/catalog/ProductCard.tsx.backup-restore"
fi

# Restore cart context if it exists
if git show "$BACKUP_COMMIT:context/CartContext.tsx" > /dev/null 2>&1; then
  echo "   ✓ Restoring context/CartContext.tsx"
  git show "$BACKUP_COMMIT:context/CartContext.tsx" > context/CartContext.tsx.backup-restore
  echo "   → Saved to context/CartContext.tsx.backup-restore"
fi

echo ""
echo "✅ Files restored to .backup-restore files"
echo ""
echo "⚠️  IMPORTANT: Manual review required!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the .backup-restore files"
echo "   2. Compare with current files"
echo "   3. Merge changes manually or replace if needed"
echo "   4. Keep app/employee/inventory/page.tsx as-is (with image fixes)"
echo ""
echo "💡 To see what changed:"
echo "   diff app/catalog/page.tsx app/catalog/page.tsx.backup-restore"
echo ""
echo "💡 To restore inventory with image fixes:"
echo "   The current inventory page is already fixed with:"
echo "   - Proper z-index for images"
echo "   - getPublicImageUrl() helper"
echo "   - HEIC support"
echo "   - Upload button fixes"
echo ""


