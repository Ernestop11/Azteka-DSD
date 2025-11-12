#!/bin/bash

# Smoke Test Script - Check VPS and Current Setup
# Run this on your VPS: bash smoke-test.sh

echo "=== VPS Smoke Test ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1. Checking current directory and project structure..."
CURRENT_DIR=$(pwd)
echo "   Current directory: $CURRENT_DIR"
echo ""

# Check for project files
echo "2. Looking for project files..."
if [ -f "package.json" ]; then
    echo -e "   ${GREEN}✓${NC} Found package.json"
    PROJECT_DIR="$CURRENT_DIR"
else
    echo -e "   ${YELLOW}⚠${NC} package.json not found in current directory"
    echo "   Searching for project directories..."
    
    # Common locations
    SEARCH_DIRS=(
        "/var/www"
        "/home"
        "/opt"
        "/root"
        "$HOME"
    )
    
    for dir in "${SEARCH_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            FOUND=$(find "$dir" -name "package.json" -type f 2>/dev/null | grep -i "azteka\|dsd\|wholesale" | head -1)
            if [ ! -z "$FOUND" ]; then
                PROJECT_DIR=$(dirname "$FOUND")
                echo -e "   ${GREEN}✓${NC} Found project at: $PROJECT_DIR"
                break
            fi
        fi
    done
fi
echo ""

if [ -z "$PROJECT_DIR" ]; then
    echo -e "${RED}✗ Could not find project directory${NC}"
    echo "   Please navigate to your project directory and run this script again"
    exit 1
fi

cd "$PROJECT_DIR" 2>/dev/null || exit 1

echo "3. Checking project structure..."
echo "   Project directory: $PROJECT_DIR"
[ -d "src" ] && echo -e "   ${GREEN}✓${NC} src/ directory exists" || echo -e "   ${RED}✗${NC} src/ directory missing"
[ -f "package.json" ] && echo -e "   ${GREEN}✓${NC} package.json exists" || echo -e "   ${RED}✗${NC} package.json missing"
[ -f "vite.config.ts" ] && echo -e "   ${GREEN}✓${NC} vite.config.ts exists" || echo -e "   ${YELLOW}⚠${NC} vite.config.ts missing"
echo ""

echo "4. Checking build output..."
if [ -d "dist" ]; then
    echo -e "   ${GREEN}✓${NC} dist/ directory exists"
    [ -f "dist/index.html" ] && echo -e "   ${GREEN}✓${NC} dist/index.html exists" || echo -e "   ${RED}✗${NC} dist/index.html missing"
    [ -d "dist/assets" ] && echo -e "   ${GREEN}✓${NC} dist/assets/ exists ($(ls -1 dist/assets/ 2>/dev/null | wc -l) files)" || echo -e "   ${YELLOW}⚠${NC} dist/assets/ missing"
else
    echo -e "   ${RED}✗${NC} dist/ directory missing - app not built"
fi
echo ""

echo "5. Checking for multiple build locations..."
BUILD_LOCATIONS=(
    "$PROJECT_DIR/dist"
    "/var/www/html"
    "/var/www/dist"
    "/usr/share/nginx/html"
    "/var/www/azteka"
    "/var/www/dsd"
    "$HOME/dist"
    "$HOME/public_html"
)

FOUND_BUILDS=()
for loc in "${BUILD_LOCATIONS[@]}"; do
    if [ -d "$loc" ] && [ -f "$loc/index.html" ]; then
        FOUND_BUILDS+=("$loc")
        echo -e "   ${GREEN}✓${NC} Found build at: $loc"
    fi
done

if [ ${#FOUND_BUILDS[@]} -eq 0 ]; then
    echo -e "   ${YELLOW}⚠${NC} No build directories found"
elif [ ${#FOUND_BUILDS[@]} -gt 1 ]; then
    echo -e "   ${YELLOW}⚠${NC} Multiple build locations found - might be messy!"
fi
echo ""

echo "6. Checking web server configuration..."
if systemctl is-active --quiet nginx; then
    echo -e "   ${GREEN}✓${NC} Nginx is running"
    NGINX_CONF=$(nginx -t 2>&1 | grep "configuration file" | awk '{print $NF}' | tr -d ':')
    if [ ! -z "$NGINX_CONF" ]; then
        echo "   Config file: $NGINX_CONF"
        ROOT_DIR=$(grep -E "^\s*root\s+" /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print $2}' | tr -d ';')
        if [ ! -z "$ROOT_DIR" ]; then
            echo "   Web root: $ROOT_DIR"
            if [ -f "$ROOT_DIR/index.html" ]; then
                echo -e "   ${GREEN}✓${NC} index.html exists in web root"
            else
                echo -e "   ${RED}✗${NC} index.html missing in web root"
            fi
        fi
    fi
elif systemctl is-active --quiet apache2; then
    echo -e "   ${GREEN}✓${NC} Apache is running"
    ROOT_DIR=$(apache2ctl -S 2>/dev/null | grep "Main DocumentRoot" | awk '{print $NF}')
    if [ ! -z "$ROOT_DIR" ]; then
        echo "   Document root: $ROOT_DIR"
    fi
else
    echo -e "   ${RED}✗${NC} No web server detected (nginx/apache2)"
fi
echo ""

echo "7. Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} PostgreSQL client installed"
    if systemctl is-active --quiet postgresql || systemctl is-active --quiet postgresql@*; then
        echo -e "   ${GREEN}✓${NC} PostgreSQL service is running"
        
        # Try to connect
        if sudo -u postgres psql -l &>/dev/null; then
            echo -e "   ${GREEN}✓${NC} Can connect to PostgreSQL"
            DB_COUNT=$(sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -v template | grep -v postgres | wc -l)
            echo "   Databases found: $DB_COUNT"
        else
            echo -e "   ${YELLOW}⚠${NC} Cannot connect to PostgreSQL (might need password)"
        fi
    else
        echo -e "   ${RED}✗${NC} PostgreSQL service is NOT running"
    fi
else
    echo -e "   ${RED}✗${NC} PostgreSQL client not installed"
fi
echo ""

echo "8. Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "   ${RED}✗${NC} Node.js not installed"
fi

if command -v npm &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} npm installed: $(npm --version)"
else
    echo -e "   ${RED}✗${NC} npm not installed"
fi
echo ""

echo "9. Checking environment variables..."
if [ -f ".env" ]; then
    echo -e "   ${GREEN}✓${NC} .env file exists"
    if grep -q "VITE_SUPABASE" .env; then
        echo -e "   ${YELLOW}⚠${NC} Supabase env vars found (will need to change to PostgreSQL)"
    fi
    if grep -q "DATABASE_URL\|POSTGRES" .env; then
        echo -e "   ${GREEN}✓${NC} PostgreSQL env vars found"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} .env file not found"
fi
echo ""

echo "10. Checking database schema..."
if [ -f "supabase/migrations/20251106081608_create_wholesale_platform_schema.sql" ]; then
    echo -e "   ${GREEN}✓${NC} Database migration file found"
    echo "   This can be used to set up PostgreSQL schema"
else
    echo -e "   ${YELLOW}⚠${NC} Migration file not found"
fi
echo ""

echo "11. Testing web server response..."
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "   ${GREEN}✓${NC} Web server responding (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "   ${RED}✗${NC} Web server responding but file not found (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "   ${RED}✗${NC} Cannot connect to web server"
    else
        echo -e "   ${YELLOW}⚠${NC} Web server returned HTTP $HTTP_CODE"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} curl not available for testing"
fi
echo ""

echo "=== Summary ==="
echo "Project location: $PROJECT_DIR"
if [ ${#FOUND_BUILDS[@]} -gt 0 ]; then
    echo "Build locations found: ${#FOUND_BUILDS[@]}"
    for build in "${FOUND_BUILDS[@]}"; do
        echo "  - $build"
    done
fi
echo ""
echo "Next steps:"
echo "1. Review the findings above"
echo "2. Identify which build location is being served"
echo "3. Set up PostgreSQL database"
echo "4. Replace Supabase with direct PostgreSQL connection"


