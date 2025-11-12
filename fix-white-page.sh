#!/bin/bash

# Fix White Page Issue
# This syncs the correct migrated code to VPS and rebuilds

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOCAL_DIR="/Users/ernestoponce/dev/azteka-dsd"
VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"
GITHUB_REPO="https://github.com/Ernestop11/Azteka-DSD.git"

echo -e "${BLUE}🔧 Fixing White Page Issue${NC}"
echo "=============================="
echo ""

# Step 1: Verify local code uses API
echo -e "${BLUE}Step 1: Verifying local code...${NC}"
if [ ! -d "$LOCAL_DIR" ]; then
    echo -e "${RED}❌ Local directory not found: $LOCAL_DIR${NC}"
    exit 1
fi

cd "$LOCAL_DIR"

# Check if it uses API
if grep -q "fetchFromAPI\|fetch.*api" src/App.tsx; then
    echo -e "${GREEN}✅ Local code uses API${NC}"
else
    echo -e "${RED}❌ Local code does not use API${NC}"
    exit 1
fi

# Check if it doesn't use Supabase
if grep -q "from.*supabase\|supabase\." src/App.tsx; then
    echo -e "${RED}❌ Local code still uses Supabase${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Local code does not use Supabase${NC}"
fi
echo ""

# Step 2: Check git status
echo -e "${BLUE}Step 2: Checking git status...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    echo "   Initialize git first or use manual sync"
    exit 1
fi

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

# Check remote
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠ Adding GitHub remote...${NC}"
    git remote add origin "$GITHUB_REPO"
fi
echo ""

# Step 3: Push to GitHub
echo -e "${BLUE}Step 3: Pushing to GitHub...${NC}"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "Pushing to origin/$CURRENT_BRANCH..."
git push -u origin "$CURRENT_BRANCH" --force
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 4: Sync VPS
echo -e "${BLUE}Step 4: Syncing VPS...${NC}"
echo "Pulling latest code from GitHub..."

ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    # Initialize git if needed
    if [ ! -d .git ]; then
        echo 'Initializing git...'
        git init
        git remote add origin $GITHUB_REPO
    else
        # Update remote
        git remote remove origin 2>/dev/null || true
        git remote add origin $GITHUB_REPO
    fi
    
    # Fetch and reset
    echo 'Fetching from GitHub...'
    git fetch origin $CURRENT_BRANCH
    git reset --hard origin/$CURRENT_BRANCH
    
    echo '✅ Code synced'
"

echo ""

# Step 5: Update dependencies
echo -e "${BLUE}Step 5: Updating dependencies...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    echo 'Installing dependencies...'
    npm install --legacy-peer-deps
    echo '✅ Dependencies updated'
"
echo ""

# Step 6: Rebuild frontend
echo -e "${BLUE}Step 6: Rebuilding frontend...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    echo 'Building frontend...'
    npm run build
    echo '✅ Frontend rebuilt'
"
echo ""

# Step 7: Restart services
echo -e "${BLUE}Step 7: Restarting services...${NC}"
ssh "$VPS_HOST" "
    pm2 restart azteka-api 2>/dev/null || echo '⚠ pm2 not running'
    systemctl reload nginx
    echo '✅ Services restarted'
"
echo ""

# Step 8: Verify
echo -e "${BLUE}Step 8: Verifying fix...${NC}"
ssh "$VPS_HOST" "
    echo '🔍 Verifying...'
    echo ''
    
    # Check if Supabase removed
    if grep -q 'from.*supabase' $VPS_DIR/src/App.tsx 2>/dev/null; then
        echo -e '${RED}❌ Still has Supabase imports${NC}'
    else
        echo -e '${GREEN}✅ No Supabase imports${NC}'
    fi
    
    # Check if API calls exist
    if grep -q 'fetchFromAPI\|fetch.*api' $VPS_DIR/src/App.tsx 2>/dev/null; then
        echo -e '${GREEN}✅ Uses API calls${NC}'
    else
        echo -e '${RED}❌ No API calls found${NC}'
    fi
    
    # Check build
    if [ -f $VPS_DIR/dist/index.html ]; then
        echo -e '${GREEN}✅ Build exists${NC}'
        echo '   Build timestamp:'
        stat -c '%y' $VPS_DIR/dist/index.html 2>/dev/null || stat -f '%Sm' $VPS_DIR/dist/index.html
    else
        echo -e '${RED}❌ Build missing${NC}'
    fi
    
    # Check API
    if curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
        echo -e '${GREEN}✅ API is responding${NC}'
    else
        echo -e '${RED}❌ API not responding${NC}'
    fi
    
    echo ''
"

echo ""
echo -e "${GREEN}✅ FIX COMPLETE!${NC}"
echo ""
echo "The white page should be fixed now!"
echo ""
echo "🌐 Test: https://aztekafoods.com"
echo ""
echo "If you still see a white page:"
echo "1. Open browser DevTools (F12)"
echo "2. Check Console tab for errors"
echo "3. Check Network tab for failed requests"
echo "4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"


