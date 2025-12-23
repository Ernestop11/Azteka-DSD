#!/bin/bash
# Find and restore working version of inventory-seed

echo "🔍 Finding working version of inventory-seed..."
echo ""

# Get all commits
COMMITS=$(git log --format="%h" -- app/admin/inventory-seed/page.tsx | head -10)

echo "Recent commits:"
for commit in $COMMITS; do
    DATE=$(git log -1 --format="%ai" $commit)
    MSG=$(git log -1 --format="%s" $commit)
    echo "  $commit - $DATE - $MSG"
done

echo ""
echo "To restore a specific version:"
echo "  git show <commit-hash>:app/admin/inventory-seed/page.tsx > app/admin/inventory-seed/page.tsx"
echo ""
echo "Or use the interactive restore:"
echo "  ./interactive-restore.sh"
