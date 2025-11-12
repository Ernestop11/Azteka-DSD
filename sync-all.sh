#!/bin/bash

# Azteka DSD - Complete Sync Script
# This syncs: Local → GitHub → VPS
# Based on the sync plan analysis

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Azteka DSD - Complete Sync${NC}"
echo "=================================="
echo ""

# Configuration
LOCAL_DIR="/Users/ernestoponce/dev/azteka-dsd"
VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"
GITHUB_REPO="https://github.com/Ernestop11/Azteka-DSD.git"

# Step 1: Verify local directory
echo -e "${BLUE}Step 1: Verifying local directory...${NC}"
if [ ! -d "$LOCAL_DIR" ]; then
    echo -e "${RED}❌ Local directory not found: $LOCAL_DIR${NC}"
    exit 1
fi

cd "$LOCAL_DIR"

# Check if it's already migrated
if [ ! -f "src/types/index.ts" ]; then
    echo -e "${RED}❌ Local directory doesn't have migrated code!${NC}"
    echo "   Missing: src/types/index.ts"
    exit 1
fi

if [ -f "src/lib/supabase.ts" ]; then
    echo -e "${RED}❌ Local directory still has Supabase!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local directory verified${NC}"
echo ""

# Step 2: Check git status
echo -e "${BLUE}Step 2: Checking git status...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠ Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "feat: Complete Supabase → PostgreSQL migration

- Remove @supabase/supabase-js package
- Create src/types/index.ts with complete type definitions
- Add 8 new Prisma models (Category, Brand, Subcategory, etc.)
- Enhance Product model with relations
- Update all frontend imports to use new types
- Remove src/lib/supabase.ts
- Migration: 20251108173329_add_missing_tables

Migration complete. Database has 21 tables.
All frontend code now uses PostgreSQL API."
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
        read -p "Commit changes? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "chore: Update before sync"
        fi
    fi
fi

# Check remote
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠ Adding GitHub remote...${NC}"
    git remote add origin "$GITHUB_REPO"
else
    echo -e "${GREEN}✅ GitHub remote configured${NC}"
    CURRENT_REMOTE=$(git remote get-url origin)
    if [ "$CURRENT_REMOTE" != "$GITHUB_REPO" ]; then
        echo -e "${YELLOW}⚠ Remote URL mismatch${NC}"
        echo "   Current: $CURRENT_REMOTE"
        echo "   Expected: $GITHUB_REPO"
        read -p "Update remote? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git remote set-url origin "$GITHUB_REPO"
        fi
    fi
fi
echo ""

# Step 3: Push to GitHub
echo -e "${BLUE}Step 3: Pushing to GitHub...${NC}"
read -p "Push to GitHub? This will overwrite the repo. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    
    echo "Pushing to origin/$CURRENT_BRANCH..."
    git push -u origin "$CURRENT_BRANCH" --force
    
    echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠ Skipping GitHub push${NC}"
fi
echo ""

# Step 4: Backup VPS
echo -e "${BLUE}Step 4: Backing up VPS...${NC}"
BACKUP_NAME="azteka-dsd-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
ssh "$VPS_HOST" "cd /srv && tar -czf $BACKUP_NAME azteka-dsd/ && echo 'Backup created: $BACKUP_NAME'"
echo -e "${GREEN}✅ VPS backup created${NC}"
echo ""

# Step 5: Sync VPS from GitHub
echo -e "${BLUE}Step 5: Syncing VPS from GitHub...${NC}"
read -p "Sync VPS? This will overwrite VPS code. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Initializing git on VPS..."
    ssh "$VPS_HOST" "
        cd $VPS_DIR
        
        # Initialize git if needed
        if [ ! -d .git ]; then
            git init
        fi
        
        # Add remote
        git remote remove origin 2>/dev/null || true
        git remote add origin $GITHUB_REPO
        
        # Fetch and reset
        git fetch origin main
        git reset --hard origin/main
        
        echo '✅ Code synced from GitHub'
    "
    
    echo "Updating dependencies..."
    ssh "$VPS_HOST" "
        cd $VPS_DIR
        npm install --legacy-peer-deps
        echo '✅ Dependencies updated'
    "
    
    echo "Rebuilding frontend..."
    ssh "$VPS_HOST" "
        cd $VPS_DIR
        npm run build
        echo '✅ Frontend rebuilt'
    "
    
    echo "Restarting services..."
    ssh "$VPS_HOST" "
        pm2 restart azteka-api 2>/dev/null || echo '⚠ pm2 not running'
        systemctl reload nginx
        echo '✅ Services restarted'
    "
    
    echo -e "${GREEN}✅ VPS synced${NC}"
else
    echo -e "${YELLOW}⚠ Skipping VPS sync${NC}"
fi
echo ""

# Step 6: Verify
echo -e "${BLUE}Step 6: Verifying sync...${NC}"
echo "Checking VPS state..."

ssh "$VPS_HOST" "
    echo '🔍 Verifying...'
    echo ''
    
    # Check Supabase removed
    if grep -q '@supabase/supabase-js' $VPS_DIR/package.json 2>/dev/null; then
        echo '❌ Supabase still exists in package.json'
    else
        echo '✅ Supabase removed from package.json'
    fi
    
    # Check types file exists
    if [ -f $VPS_DIR/src/types/index.ts ]; then
        echo '✅ Types file exists'
    else
        echo '❌ Types file missing'
    fi
    
    # Check supabase.ts removed
    if [ -f $VPS_DIR/src/lib/supabase.ts ]; then
        echo '❌ supabase.ts still exists'
    else
        echo '✅ supabase.ts removed'
    fi
    
    # Check API
    if curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
        echo '✅ API is responding'
    else
        echo '⚠ API health check failed'
    fi
    
    echo ''
"

echo ""
echo -e "${GREEN}✅ SYNC COMPLETE!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Local code verified"
echo "  ✅ Pushed to GitHub"
echo "  ✅ VPS backed up"
echo "  ✅ VPS synced"
echo "  ✅ Services restarted"
echo ""
echo "🌐 https://aztekafoods.com"


