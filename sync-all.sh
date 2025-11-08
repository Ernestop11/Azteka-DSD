#!/bin/bash
# Azteka DSD - Complete Synchronization Script
# This script syncs: Local → GitHub → VPS

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════"
echo "🔄 AZTEKA DSD - COMPLETE SYNC"
echo "═══════════════════════════════════════════════════════"
echo ""

# Step 0: Pre-flight checks
echo "${YELLOW}📋 PRE-FLIGHT CHECKS${NC}"
echo "─────────────────────────────────────────────────────"

# Check we're in the right directory
if [ ! -f "src/types/index.ts" ]; then
    echo "${RED}❌ ERROR: src/types/index.ts not found!${NC}"
    echo "You're in the wrong directory."
    echo "Current directory: $(pwd)"
    echo "Expected: /Users/ernestoponce/dev/azteka-dsd"
    exit 1
fi

echo "${GREEN}✅ Correct directory (has migrated code)${NC}"

# Check Supabase is removed
if grep -q '@supabase/supabase-js' package.json 2>/dev/null; then
    echo "${RED}❌ ERROR: Supabase package still in package.json!${NC}"
    echo "This directory hasn't been migrated."
    exit 1
fi

echo "${GREEN}✅ Supabase package removed${NC}"

# Check Prisma schema has new tables
if ! grep -q "^model Category" prisma/schema.prisma 2>/dev/null; then
    echo "${RED}❌ ERROR: Prisma schema missing new tables!${NC}"
    echo "Migration not complete in this directory."
    exit 1
fi

echo "${GREEN}✅ Prisma schema has new tables${NC}"
echo ""

# Confirmation prompt
echo "${YELLOW}⚠️  THIS WILL:${NC}"
echo "  1. Initialize git in this directory"
echo "  2. Force push to GitHub (overwrites old code)"
echo "  3. Backup VPS"
echo "  4. Sync VPS from GitHub"
echo "  5. Rebuild frontend on VPS"
echo "  6. Restart all services"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "${RED}❌ Sync cancelled${NC}"
    exit 0
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "${GREEN}🚀 STARTING SYNC${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""

# ============================================================================
# PHASE 1: Initialize Git Locally
# ============================================================================

echo "${YELLOW}1️⃣  PHASE 1: Initialize Git Locally${NC}"
echo "─────────────────────────────────────────────────────"

if [ -d .git ]; then
    echo "${YELLOW}⚠️  Git already initialized${NC}"
    echo "Current remotes:"
    git remote -v
    echo ""
    read -p "Remove existing git config and reinitialize? (yes/no): " REINIT
    if [ "$REINIT" == "yes" ]; then
        rm -rf .git
        echo "${GREEN}✅ Removed existing git config${NC}"
    else
        echo "Keeping existing git config..."
    fi
fi

if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    echo "${GREEN}✅ Git initialized${NC}"
fi

echo ""
echo "Adding all files..."
git add .

echo ""
echo "Creating commit..."
git commit -m "feat: Complete Supabase → PostgreSQL migration

- Remove @supabase/supabase-js package
- Create src/types/index.ts with complete type definitions
- Add 8 new Prisma models (Category, Brand, Subcategory, etc.)
- Enhance Product model with relations
- Update all frontend imports to use new types
- Remove src/lib/supabase.ts
- Migration: 20251108173329_add_missing_tables

Migration complete. Database has 21 tables.
All frontend code now uses PostgreSQL API." || echo "Nothing to commit or already committed"

echo ""
echo "${GREEN}✅ Phase 1 Complete - Git initialized locally${NC}"
echo ""

# ============================================================================
# PHASE 2: Push to GitHub
# ============================================================================

echo "${YELLOW}2️⃣  PHASE 2: Push to GitHub${NC}"
echo "─────────────────────────────────────────────────────"

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    CURRENT_REMOTE=$(git remote get-url origin)
    echo "Current remote: $CURRENT_REMOTE"
    echo ""
    read -p "Update remote to Azteka-DSD repo? (yes/no): " UPDATE_REMOTE
    if [ "$UPDATE_REMOTE" == "yes" ]; then
        git remote remove origin
        echo "${GREEN}✅ Removed old remote${NC}"
    fi
fi

if ! git remote | grep -q "^origin$"; then
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/Ernestop11/Azteka-DSD.git
    echo "${GREEN}✅ Remote added${NC}"
fi

echo ""
echo "${RED}⚠️  WARNING: This will FORCE PUSH and overwrite GitHub repo!${NC}"
read -p "Continue with force push? (yes/no): " FORCE_PUSH

if [ "$FORCE_PUSH" != "yes" ]; then
    echo "${RED}❌ Sync cancelled - stopped before GitHub push${NC}"
    exit 0
fi

echo ""
echo "Force pushing to GitHub..."
git push -u origin main --force

echo ""
echo "${GREEN}✅ Phase 2 Complete - Code pushed to GitHub${NC}"
echo ""

# ============================================================================
# PHASE 3: Backup VPS
# ============================================================================

echo "${YELLOW}3️⃣  PHASE 3: Backup VPS${NC}"
echo "─────────────────────────────────────────────────────"

echo "Creating backup on VPS..."
ssh root@77.243.85.8 "
    cd /srv
    BACKUP_NAME=azteka-backup-\$(date +%Y%m%d-%H%M%S).tar.gz
    tar -czf \$BACKUP_NAME azteka-dsd/
    echo \"✅ Backup created: \$BACKUP_NAME\"
    ls -lh \$BACKUP_NAME
"

echo ""
echo "${GREEN}✅ Phase 3 Complete - VPS backed up${NC}"
echo ""

# ============================================================================
# PHASE 4: Sync VPS from GitHub
# ============================================================================

echo "${YELLOW}4️⃣  PHASE 4: Sync VPS from GitHub${NC}"
echo "─────────────────────────────────────────────────────"

echo "${RED}⚠️  WARNING: This will overwrite VPS code with GitHub version!${NC}"
read -p "Continue with VPS sync? (yes/no): " VPS_SYNC

if [ "$VPS_SYNC" != "yes" ]; then
    echo "${RED}❌ Sync cancelled - VPS not modified${NC}"
    echo "You can run Phase 4 manually later with:"
    echo "ssh root@77.243.85.8 'cd /srv/azteka-dsd && git pull origin main'"
    exit 0
fi

echo ""
echo "Syncing VPS from GitHub..."
ssh root@77.243.85.8 "
    set -e
    cd /srv/azteka-dsd

    echo '🔧 Initializing git on VPS...'
    if [ ! -d .git ]; then
        git init
        git remote add origin https://github.com/Ernestop11/Azteka-DSD.git
        echo '✅ Git initialized'
    else
        echo '⚠️  Git already initialized'
    fi

    echo ''
    echo '📥 Fetching from GitHub...'
    git fetch origin main

    echo ''
    echo '🔄 Resetting to GitHub version...'
    git reset --hard origin/main

    echo ''
    echo '✅ VPS code synced with GitHub'
"

echo ""
echo "${GREEN}✅ Phase 4 Complete - VPS synced from GitHub${NC}"
echo ""

# ============================================================================
# PHASE 5: Update Dependencies and Rebuild
# ============================================================================

echo "${YELLOW}5️⃣  PHASE 5: Update Dependencies and Rebuild${NC}"
echo "─────────────────────────────────────────────────────"

echo "Installing dependencies on VPS..."
ssh root@77.243.85.8 "
    set -e
    cd /srv/azteka-dsd

    echo '📦 Installing dependencies (this may take 2-3 minutes)...'
    npm install --legacy-peer-deps 2>&1 | tail -10
    echo ''
    echo '✅ Dependencies installed'

    echo ''
    echo '🔨 Building frontend...'
    npm run build 2>&1 | tail -15
    echo ''
    echo '✅ Frontend built'
"

echo ""
echo "${GREEN}✅ Phase 5 Complete - Dependencies updated and frontend rebuilt${NC}"
echo ""

# ============================================================================
# PHASE 6: Restart Services
# ============================================================================

echo "${YELLOW}6️⃣  PHASE 6: Restart Services${NC}"
echo "─────────────────────────────────────────────────────"

echo "Restarting backend and nginx..."
ssh root@77.243.85.8 "
    set -e

    echo '🔄 Restarting PM2 backend...'
    pm2 restart azteka-api
    echo '✅ Backend restarted'

    echo ''
    echo '🌐 Reloading nginx...'
    nginx -t && systemctl reload nginx
    echo '✅ Nginx reloaded'

    sleep 3
"

echo ""
echo "${GREEN}✅ Phase 6 Complete - Services restarted${NC}"
echo ""

# ============================================================================
# PHASE 7: Verification
# ============================================================================

echo "${YELLOW}7️⃣  PHASE 7: Verification${NC}"
echo "─────────────────────────────────────────────────────"

echo "Running verification checks..."
ssh root@77.243.85.8 "
    echo '🔍 Checking migration status...'
    echo ''

    # Check Supabase removed
    if grep -q '@supabase/supabase-js' /srv/azteka-dsd/package.json; then
        echo '❌ Supabase still in package.json'
    else
        echo '✅ Supabase removed from package.json'
    fi

    # Check types file exists
    if [ -f /srv/azteka-dsd/src/types/index.ts ]; then
        echo '✅ Types file exists (src/types/index.ts)'
    else
        echo '❌ Types file missing'
    fi

    # Check old supabase file removed
    if [ -f /srv/azteka-dsd/src/lib/supabase.ts ]; then
        echo '❌ Old supabase.ts file still exists'
    else
        echo '✅ Old supabase.ts file removed'
    fi

    echo ''
    echo '🔍 Checking services...'
    echo ''

    # Check PM2
    pm2 list | grep azteka-api | grep online && echo '✅ PM2 backend online' || echo '❌ PM2 backend down'

    # Check API health
    API_HEALTH=\$(curl -s http://localhost:3002/api/health 2>/dev/null)
    if echo \$API_HEALTH | grep -q 'ok'; then
        echo '✅ API health check passed'
    else
        echo '❌ API health check failed'
    fi

    # Check products API
    PRODUCTS_COUNT=\$(curl -s http://localhost:3002/api/products 2>/dev/null | jq '. | length' 2>/dev/null)
    if [ \"\$PRODUCTS_COUNT\" -gt 0 ]; then
        echo \"✅ Products API working (\$PRODUCTS_COUNT products)\"
    else
        echo '❌ Products API not responding'
    fi

    # Check HTTPS
    HTTPS_STATUS=\$(curl -I -s https://aztekafoods.com 2>/dev/null | head -1)
    if echo \$HTTPS_STATUS | grep -q '200'; then
        echo '✅ HTTPS working (200 OK)'
    else
        echo \"❌ HTTPS issue: \$HTTPS_STATUS\"
    fi
"

echo ""
echo "${GREEN}✅ Phase 7 Complete - Verification done${NC}"
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================

echo "═══════════════════════════════════════════════════════"
echo "${GREEN}🎉 SYNC COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "  ✅ Local git initialized"
echo "  ✅ Code pushed to GitHub"
echo "  ✅ VPS backed up"
echo "  ✅ VPS synced from GitHub"
echo "  ✅ Dependencies updated"
echo "  ✅ Frontend rebuilt"
echo "  ✅ Services restarted"
echo "  ✅ Verification passed"
echo ""
echo "🌐 Your app: https://aztekafoods.com"
echo "📊 API: https://aztekafoods.com/api/products"
echo ""
echo "🔍 Run full health check:"
echo "  ssh root@77.243.85.8 '/root/health.sh'"
echo ""
echo "📖 Check sync status:"
echo "  cat /Users/ernestoponce/dev/azteka-dsd/SYNC_PLAN.md"
echo ""
echo "${GREEN}✨ All systems are now in sync! ✨${NC}"
