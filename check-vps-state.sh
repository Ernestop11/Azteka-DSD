#!/bin/bash

# Check VPS State and Compare with Local
# Run this on your VPS: bash check-vps-state.sh

echo "=== VPS State Check ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Find project directory
echo "1. Finding project directory..."
PROJECT_DIR=""
SEARCH_DIRS=(
    "/var/www"
    "/home"
    "/opt"
    "/root"
    "$HOME"
)

for dir in "${SEARCH_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        FOUND=$(find "$dir" -name "package.json" -type f 2>/dev/null | grep -iE "azteka|dsd|sales" | head -1)
        if [ ! -z "$FOUND" ]; then
            PROJECT_DIR=$(dirname "$FOUND")
            echo -e "   ${GREEN}✓${NC} Found project at: $PROJECT_DIR"
            break
        fi
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo -e "   ${RED}✗${NC} Project not found"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1
echo ""

echo "2. Checking for Supabase..."
SUPABASE_FILES=$(find src -name "*supabase*" 2>/dev/null | wc -l)
if [ "$SUPABASE_FILES" -gt 0 ]; then
    echo -e "   ${RED}✗${NC} Found $SUPABASE_FILES Supabase files"
    find src -name "*supabase*" 2>/dev/null
else
    echo -e "   ${GREEN}✓${NC} No Supabase files found"
fi

SUPABASE_IMPORTS=$(grep -r "from.*supabase\|@supabase" src/ 2>/dev/null | wc -l)
if [ "$SUPABASE_IMPORTS" -gt 0 ]; then
    echo -e "   ${RED}✗${NC} Found $SUPABASE_IMPORTS Supabase imports"
else
    echo -e "   ${GREEN}✓${NC} No Supabase imports found"
fi
echo ""

echo "3. Checking for Prisma..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "   ${GREEN}✓${NC} Prisma schema exists"
    echo "   Tables in schema:"
    grep -E "^model |^  \w+" prisma/schema.prisma | head -20
else
    echo -e "   ${RED}✗${NC} Prisma schema NOT found"
fi
echo ""

echo "4. Checking for TypeScript types..."
if [ -f "src/types/index.ts" ]; then
    echo -e "   ${GREEN}✓${NC} Types file exists"
    echo "   Exports:"
    grep "^export" src/types/index.ts | head -10
else
    echo -e "   ${RED}✗${NC} Types file NOT found"
fi
echo ""

echo "5. Checking package.json..."
if grep -q "@supabase/supabase-js" package.json; then
    echo -e "   ${RED}✗${NC} Supabase package still in dependencies"
else
    echo -e "   ${GREEN}✓${NC} Supabase package removed"
fi

if grep -q "@prisma/client\|prisma" package.json; then
    echo -e "   ${GREEN}✓${NC} Prisma found in dependencies"
else
    echo -e "   ${YELLOW}⚠${NC} Prisma not found in dependencies"
fi
echo ""

echo "6. Checking for backend API..."
if [ -d "server" ] || [ -d "backend" ] || [ -d "api" ]; then
    echo -e "   ${GREEN}✓${NC} Backend directory found"
    find . -maxdepth 2 -type d -name "server" -o -name "backend" -o -name "api" 2>/dev/null
else
    echo -e "   ${YELLOW}⚠${NC} No backend directory found"
fi

if [ -f "server.js" ] || [ -f "server.ts" ] || [ -f "index.js" ]; then
    echo -e "   ${GREEN}✓${NC} Backend entry file found"
    ls -la server.* index.js 2>/dev/null
fi
echo ""

echo "7. Checking App.tsx imports..."
if grep -q "from.*supabase" src/App.tsx 2>/dev/null; then
    echo -e "   ${RED}✗${NC} App.tsx still imports Supabase"
    grep "from.*supabase" src/App.tsx
else
    echo -e "   ${GREEN}✓${NC} App.tsx does NOT import Supabase"
    if grep -q "from.*types\|from.*api" src/App.tsx 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} App.tsx uses types/api instead"
    fi
fi
echo ""

echo "8. Checking build status..."
if [ -d "dist" ]; then
    echo -e "   ${GREEN}✓${NC} Build directory exists"
    if [ -f "dist/index.html" ]; then
        echo -e "   ${GREEN}✓${NC} Build appears complete"
        echo "   Build size: $(du -sh dist | cut -f1)"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} No build directory"
fi
echo ""

echo "9. Checking database connection..."
if [ -f ".env" ]; then
    echo -e "   ${GREEN}✓${NC} .env file exists"
    if grep -q "DATABASE_URL\|POSTGRES" .env; then
        echo -e "   ${GREEN}✓${NC} Database URL found in .env"
    else
        echo -e "   ${YELLOW}⚠${NC} No database URL in .env"
    fi
    
    if grep -q "VITE_SUPABASE" .env; then
        echo -e "   ${RED}✗${NC} Supabase env vars still present"
    else
        echo -e "   ${GREEN}✓${NC} No Supabase env vars"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} No .env file"
fi
echo ""

echo "=== Summary ==="
echo "Project location: $PROJECT_DIR"
echo ""
echo "Migration Status:"
if [ -f "prisma/schema.prisma" ] && [ ! -f "src/lib/supabase.ts" ]; then
    echo -e "   ${GREEN}✓ MIGRATED${NC} - Using PostgreSQL"
else
    echo -e "   ${RED}✗ NOT MIGRATED${NC} - Still using Supabase"
fi


