#!/bin/bash

# =============================================================================
# Disable Visual Tools Page (Temporary)
# =============================================================================
# This script temporarily disables the visual-tools page by renaming it
# Usage: ./scripts/disable-visual-tools.sh
# To re-enable: ./scripts/enable-visual-tools.sh
# =============================================================================

set -e

VISUAL_TOOLS_PATH="app/admin/visual-tools/page.tsx"
BACKUP_PATH="app/admin/visual-tools/page.tsx.disabled"

if [ -f "$VISUAL_TOOLS_PATH" ]; then
  echo "🔒 Disabling visual-tools page..."
  mv "$VISUAL_TOOLS_PATH" "$BACKUP_PATH"
  echo "✅ Visual tools page disabled (backed up to $BACKUP_PATH)"
  echo ""
  echo "💡 To re-enable, run: ./scripts/enable-visual-tools.sh"
else
  echo "⚠️  Visual tools page not found at $VISUAL_TOOLS_PATH"
  if [ -f "$BACKUP_PATH" ]; then
    echo "   (It appears to already be disabled)"
  fi
fi

