#!/bin/bash
# Script to move build artifacts to external drive
# Usage: ./scripts/move-builds-to-external.sh [drive-name]

set -e

EXTERNAL_DRIVE="${1:-/Volumes/Personal}"
BUILD_DIR="$EXTERNAL_DRIVE/azteka-builds"
PROJECT_DIR="/Users/ernestoponce/dev/azteka-dsd"

echo "📦 Moving build artifacts to external drive..."
echo "External drive: $EXTERNAL_DRIVE"
echo "Build directory: $BUILD_DIR"
echo "Project directory: $PROJECT_DIR"
echo ""

# Check if external drive is mounted
if [ ! -d "$EXTERNAL_DRIVE" ]; then
    echo "❌ External drive not found at $EXTERNAL_DRIVE"
    echo "Available drives:"
    ls -1 /Volumes/ | grep -v "Macintosh HD" | grep -v "com.apple"
    exit 1
fi

# Create build directory on external drive
mkdir -p "$BUILD_DIR"
echo "✅ Created build directory"

cd "$PROJECT_DIR"

# Move node_modules
if [ -d "node_modules" ] && [ ! -L "node_modules" ]; then
    echo "📦 Moving node_modules (this may take a while)..."
    mv node_modules "$BUILD_DIR/node_modules"
    ln -s "$BUILD_DIR/node_modules" node_modules
    echo "✅ node_modules moved and symlinked"
elif [ -L "node_modules" ]; then
    echo "ℹ️  node_modules already symlinked"
else
    echo "ℹ️  No node_modules to move"
fi

# Move .next directory
if [ -d ".next" ] && [ ! -L ".next" ]; then
    echo "📦 Moving .next..."
    mv .next "$BUILD_DIR/.next"
    ln -s "$BUILD_DIR/.next" .next
    echo "✅ .next moved and symlinked"
elif [ -L ".next" ]; then
    echo "ℹ️  .next already symlinked"
else
    echo "ℹ️  No .next directory to move"
fi

# Move .next-azteka if exists
if [ -d ".next-azteka" ] && [ ! -L ".next-azteka" ]; then
    echo "📦 Moving .next-azteka..."
    mv .next-azteka "$BUILD_DIR/.next-azteka"
    ln -s "$BUILD_DIR/.next-azteka" .next-azteka
    echo "✅ .next-azteka moved and symlinked"
fi

# Move .turbo cache
if [ -d ".turbo" ] && [ ! -L ".turbo" ]; then
    echo "📦 Moving .turbo cache..."
    mv .turbo "$BUILD_DIR/.turbo"
    ln -s "$BUILD_DIR/.turbo" .turbo
    echo "✅ .turbo moved and symlinked"
fi

echo ""
echo "✅ Done! Build artifacts moved to external drive"
echo "Space freed on local drive:"
df -h "$PROJECT_DIR" | tail -1




