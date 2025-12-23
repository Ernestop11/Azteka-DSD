#!/bin/bash
# Restore inventory-seed to v2.0 working version

set -e

echo "🔄 Restoring inventory-seed to v2.0 working version..."
echo ""

# Check if v2.0 tag exists
if ! git rev-parse v2.0 >/dev/null 2>&1; then
    echo "❌ v2.0 tag not found!"
    exit 1
fi

# Check if file exists in v2.0
if git show v2.0:app/admin/inventory-seed/page.tsx >/dev/null 2>&1; then
    echo "✅ Found inventory-seed in v2.0 tag"
    echo "Restoring file..."
    git show v2.0:app/admin/inventory-seed/page.tsx > app/admin/inventory-seed/page.tsx
    echo "✅ File restored!"
else
    echo "⚠️  inventory-seed doesn't exist in v2.0 tag"
    echo "This file was added after v2.0 milestone"
    echo ""
    echo "Looking for first working version after v2.0..."
    
    # Find first commit that added the file
    FIRST_COMMIT=$(git log --all --oneline --diff-filter=A -- app/admin/inventory-seed/page.tsx | tail -1 | cut -d' ' -f1)
    
    if [ -n "$FIRST_COMMIT" ]; then
        echo "Found first version at: $FIRST_COMMIT"
        echo "Restoring that version..."
        git show $FIRST_COMMIT:app/admin/inventory-seed/page.tsx > app/admin/inventory-seed/page.tsx
        echo "✅ File restored to first version!"
    else
        echo "❌ Could not find any version of this file"
        exit 1
    fi
fi

echo ""
echo "📦 Next steps:"
echo "  1. Review the restored file"
echo "  2. npm run build:next"
echo "  3. Deploy to VPS"
echo ""
