#!/bin/bash

# Check Actual Errors on VPS
# This checks what's actually deployed and what might be causing the white page

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

echo -e "${BLUE}=== Checking Actual Errors ===${NC}"
echo ""

# Step 1: Check if the fix was actually deployed
echo -e "${BLUE}1. Checking if buildUrl fix is deployed...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    if [ -f src/lib/apiClient.ts ]; then
        echo '   Checking apiClient.ts:'
        
        if grep -q 'buildUrl' src/lib/apiClient.ts; then
            echo -e '${GREEN}✅ buildUrl function exists${NC}'
            echo '   Function:'
            grep -A 10 'buildUrl' src/lib/apiClient.ts | head -12
        else
            echo -e '${RED}❌ buildUrl function NOT found${NC}'
            echo '   Current code:'
            grep -A 5 'API_BASE' src/lib/apiClient.ts | head -6
        fi
    else
        echo -e '${RED}❌ apiClient.ts not found${NC}'
    fi
"
echo ""

# Step 2: Check if the build has the fix
echo -e "${BLUE}2. Checking if build has the fix...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    MAIN_JS=\$(ls \$ROOT_DIR/assets/*.js 2>/dev/null | head -1)
    
    if [ -n \"\$MAIN_JS\" ]; then
        echo \"   Checking: \$(basename \$MAIN_JS)\"
        
        if grep -q 'buildUrl' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${GREEN}✅ Build contains buildUrl${NC}'
        else
            echo -e '${RED}❌ Build does NOT contain buildUrl${NC}'
            echo '   This means the fix was NOT deployed!'
        fi
        
        # Check for the broken pattern
        if grep -q '\"//api/' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${RED}❌ Build still has broken URL pattern (//api/)${NC}'
        else
            echo -e '${GREEN}✅ No broken URL pattern found${NC}'
        fi
    else
        echo -e '${RED}❌ No JavaScript bundle found${NC}'
    fi
"
echo ""

# Step 3: Check build timestamp
echo -e "${BLUE}3. Checking build timestamp...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    
    if [ -f \"\$ROOT_DIR/index.html\" ]; then
        BUILD_TIME=\$(stat -c '%y' \"\$ROOT_DIR/index.html\" 2>/dev/null || stat -f '%Sm' \"\$ROOT_DIR/index.html\")
        echo \"   Build time: \$BUILD_TIME\"
        
        # Check if build is after 22:29 (when fix was supposedly deployed)
        CURRENT_TIME=\$(date +%s)
        BUILD_TIMESTAMP=\$(stat -c '%Y' \"\$ROOT_DIR/index.html\" 2>/dev/null || stat -f '%m' \"\$ROOT_DIR/index.html\")
        
        # 22:29 would be around 22*3600 + 29*60 = 80940 seconds from midnight
        # But we'll just check if it's recent (within last hour)
        AGE=\$((CURRENT_TIME - BUILD_TIMESTAMP))
        
        if [ \$AGE -lt 3600 ]; then
            echo -e '${GREEN}✅ Build is recent (< 1 hour old)${NC}'
        else
            echo -e '${YELLOW}⚠ Build is old (> 1 hour)${NC}'
            echo \"   Age: \$((AGE / 3600)) hours\"
        fi
    fi
"
echo ""

# Step 4: Check Service Worker
echo -e "${BLUE}4. Checking Service Worker...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    
    if [ -f \"\$ROOT_DIR/service-worker.js\" ] || [ -f \"\$ROOT_DIR/sw.js\" ]; then
        echo -e '${YELLOW}⚠ Service Worker found${NC}'
        echo '   Service Worker might be caching old code!'
        echo '   Solution: Unregister Service Worker in browser DevTools'
    else
        echo -e '${GREEN}✅ No Service Worker file${NC}'
    fi
    
    # Check if index.html registers a service worker
    if [ -f \"\$ROOT_DIR/index.html\" ]; then
        if grep -q 'serviceWorker\|navigator.serviceWorker' \"\$ROOT_DIR/index.html\" 2>/dev/null; then
            echo -e '${YELLOW}⚠ index.html registers Service Worker${NC}'
            echo '   Registration code:'
            grep -A 5 'serviceWorker' \"\$ROOT_DIR/index.html\" | head -6
        else
            echo -e '${GREEN}✅ No Service Worker registration${NC}'
        fi
    fi
"
echo ""

# Step 5: Check for JavaScript errors in the bundle
echo -e "${BLUE}5. Checking for JavaScript errors...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    MAIN_JS=\$(ls \$ROOT_DIR/assets/*.js 2>/dev/null | head -1)
    
    if [ -n \"\$MAIN_JS\" ]; then
        echo \"   Checking: \$(basename \$MAIN_JS)\"
        
        # Check for common error patterns
        if grep -q 'Cannot read property' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${YELLOW}⚠ Contains error patterns${NC}'
        fi
        
        # Check if bundle is valid (starts with !function or (function)
        if head -1 \"\$MAIN_JS\" | grep -qE '!function|\(function' 2>/dev/null; then
            echo -e '${GREEN}✅ Bundle appears valid${NC}'
        else
            echo -e '${RED}❌ Bundle might be corrupted${NC}'
            echo '   First line:'
            head -1 \"\$MAIN_JS\" | cut -c1-100
        fi
    fi
"
echo ""

# Step 6: Check actual API calls in the bundle
echo -e "${BLUE}6. Checking API calls in bundle...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    MAIN_JS=\$(ls \$ROOT_DIR/assets/*.js 2>/dev/null | head -1)
    
    if [ -n \"\$MAIN_JS\" ]; then
        # Check for fetch calls
        FETCH_COUNT=\$(grep -o 'fetch(' \"\$MAIN_JS\" 2>/dev/null | wc -l || echo 0)
        echo \"   Fetch calls found: \$FETCH_COUNT\"
        
        # Check for API endpoint patterns
        if grep -q '/api/' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${GREEN}✅ Contains /api/ calls${NC}'
            echo '   API calls:'
            grep -o '/api/[^\"'\'']*' \"\$MAIN_JS\" 2>/dev/null | sort -u | head -5
        else
            echo -e '${RED}❌ No /api/ calls found${NC}'
        fi
        
        # Check for broken pattern
        if grep -q '\"//api/' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${RED}❌ Still has broken //api/ pattern${NC}'
        fi
    fi
"
echo ""

# Step 7: Test actual HTTP response
echo -e "${BLUE}7. Testing actual HTTP response...${NC}"
ssh "$VPS_HOST" "
    echo '   Testing root URL:'
    HTTP_CODE=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost/ 2>/dev/null || echo '000')
    
    if [ \"\$HTTP_CODE\" = '200' ]; then
        echo -e \"${GREEN}✅ Root URL: OK (HTTP 200)${NC}\"
        
        # Check if HTML contains root div
        if curl -s http://localhost/ 2>/dev/null | grep -q 'id=\"root\"'; then
            echo -e '${GREEN}✅ HTML contains root div${NC}'
        else
            echo -e '${RED}❌ HTML missing root div${NC}'
        fi
        
        # Check if HTML contains script tags
        SCRIPT_COUNT=\$(curl -s http://localhost/ 2>/dev/null | grep -c '<script' || echo 0)
        echo \"   Script tags: \$SCRIPT_COUNT\"
        
        if [ \$SCRIPT_COUNT -eq 0 ]; then
            echo -e '${RED}❌ No script tags found!${NC}'
        fi
    else
        echo -e \"${RED}❌ Root URL: Failed (HTTP \$HTTP_CODE)${NC}\"
    fi
"
echo ""

# Step 8: Recommendations
echo -e "${BLUE}=== Recommendations ===${NC}"
echo ""
echo "Based on the image, I see:"
echo "1. ${YELLOW}Service Worker is active${NC} - This might be caching old code"
echo "2. ${YELLOW}Manifest icon error${NC} - Not critical but indicates issues"
echo "3. ${YELLOW}Stack trace in three-vendor bundle${NC} - JavaScript error"
echo ""
echo "Immediate actions:"
echo ""
echo "1. ${BLUE}Unregister Service Worker:${NC}"
echo "   - Open DevTools (F12)"
echo "   - Go to Application tab"
echo "   - Click 'Service Workers' in left sidebar"
echo "   - Click 'Unregister' for aztekafoods.com"
echo "   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo ""
echo "2. ${BLUE}Check Console for actual errors:${NC}"
echo "   - Open DevTools Console tab"
echo "   - Look for red error messages"
echo "   - Share the actual error messages"
echo ""
echo "3. ${BLUE}Check if fix was actually deployed:${NC}"
echo "   - Run this script to verify"
echo "   - Check if buildUrl exists in bundle"
echo ""
echo "4. ${BLUE}Clear browser cache:${NC}"
echo "   - Hard refresh (Ctrl+Shift+R)"
echo "   - Or clear site data in DevTools"
echo ""

echo "=== Check Complete ==="

