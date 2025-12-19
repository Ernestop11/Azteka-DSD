#!/bin/bash

# =============================================================================
# Re-enable Visual Tools Page
# =============================================================================
# This script re-enables the visual-tools page
# Usage: ./scripts/enable-visual-tools.sh
# =============================================================================

set -e

VISUAL_TOOLS_PATH="app/admin/visual-tools/page.tsx"
BACKUP_PATH="app/admin/visual-tools/page.tsx.disabled"

if [ -f "$BACKUP_PATH" ]; then
  echo "🔓 Re-enabling visual-tools page..."
  mv "$BACKUP_PATH" "$VISUAL_TOOLS_PATH"
  echo "✅ Visual tools page re-enabled"
else
  echo "⚠️  No disabled backup found at $BACKUP_PATH"
  echo "   Visual tools page may already be enabled or was never disabled"
fi

