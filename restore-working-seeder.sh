#!/bin/bash
# Restore working inventory-seed version

set -e

echo "🔄 Restoring working inventory-seed version..."
echo ""

# Backup current
BACKUP_FILE="app/admin/inventory-seed/page.tsx.backup.$(date +%s)"
cp app/admin/inventory-seed/page.tsx "$BACKUP_FILE"
echo "✅ Current version backed up to: $BACKUP_FILE"

echo ""
echo "Choose restore method:"
echo "1. Download from VPS (may be working version from last night)"
echo "2. Use local backup"
echo "3. Cancel"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Downloading from VPS..."
    ssh root@72.62.162.163 "cat /srv/azteka-dsd/app/admin/inventory-seed/page.tsx" > app/admin/inventory-seed/page.tsx
    echo "✅ Restored from VPS"
    ;;
  2)
    echo "Available backups:"
    ls -lt app/admin/inventory-seed/page.tsx.backup.* 2>/dev/null | head -5
    read -p "Enter backup filename: " backup
    if [ -f "$backup" ]; then
      cp "$backup" app/admin/inventory-seed/page.tsx
      echo "✅ Restored from backup"
    else
      echo "❌ Backup file not found"
      exit 1
    fi
    ;;
  3)
    echo "Cancelled"
    exit 0
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "📦 Next steps:"
echo "  1. Review the restored file"
echo "  2. npm run build:next"
echo "  3. Deploy to VPS"
