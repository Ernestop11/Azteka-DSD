#!/bin/bash

# Deep Debug White Page Issue
# This checks everything that could cause a white page

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"
DOMAIN="https://aztekafoods.com"

echo -e "${BLUE}=== Deep White Page Debugging ===${NC}"
echo ""

# Step 1: Check what's actually being served
echo -e "${BLUE}1. Checking what nginx is serving...${NC}"
ssh "$VPS_HOST" "
    # Get nginx root directory
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    
    if [ -z \"\$ROOT_DIR\" ]; then
        echo -e '${RED}❌ Could not find nginx root${NC}'
    else
        echo \"   Nginx root: \$ROOT_DIR\"
        
        if [ -f \"\$ROOT_DIR/index.html\" ]; then
            echo -e '${GREEN}✅ index.html exists${NC}'
            echo \"   File size: \$(du -h \$ROOT_DIR/index.html | cut -f1)\"
            echo \"   Last modified: \$(stat -c '%y' \$ROOT_DIR/index.html 2>/dev/null || stat -f '%Sm' \$ROOT_DIR/index.html)\"
        else
            echo -e '${RED}❌ index.html missing${NC}'
        fi
        
        if [ -d \"\$ROOT_DIR/assets\" ]; then
            echo -e '${GREEN}✅ assets/ directory exists${NC}'
            echo \"   Files: \$(ls -1 \$ROOT_DIR/assets 2>/dev/null | wc -l)\"
            
            # Check main bundle
            MAIN_JS=\$(ls \$ROOT_DIR/assets/*.js 2>/dev/null | head -1)
            if [ -n \"\$MAIN_JS\" ]; then
                echo \"   Main JS: \$(basename \$MAIN_JS)\"
                echo \"   Size: \$(du -h \$MAIN_JS | cut -f1)\"
            fi
        else
            echo -e '${RED}❌ assets/ directory missing${NC}'
        fi
    fi
"
echo ""

# Step 2: Check index.html content
echo -e "${BLUE}2. Checking index.html content...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    
    if [ -f \"\$ROOT_DIR/index.html\" ]; then
        echo '   Checking for root div:'
        grep -q '<div id=\"root\">' \"\$ROOT_DIR/index.html\" && echo -e '${GREEN}✅ Root div exists${NC}' || echo -e '${RED}❌ Root div missing${NC}'
        
        echo '   Checking for script tags:'
        SCRIPT_COUNT=\$(grep -c '<script' \"\$ROOT_DIR/index.html\" || echo 0)
        echo \"   Script tags: \$SCRIPT_COUNT\"
        
        if [ \$SCRIPT_COUNT -eq 0 ]; then
            echo -e '${RED}❌ No script tags found!${NC}'
        else
            echo '   Script sources:'
            grep '<script' \"\$ROOT_DIR/index.html\" | head -3
        fi
        
        echo '   Checking for asset references:'
        if grep -q 'assets/' \"\$ROOT_DIR/index.html\"; then
            echo -e '${GREEN}✅ Asset references found${NC}'
        else
            echo -e '${YELLOW}⚠ No asset references${NC}'
        fi
    fi
"
echo ""

# Step 3: Check JavaScript bundle for errors
echo -e "${BLUE}3. Checking JavaScript bundle...${NC}"
ssh "$VPS_HOST" "
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    MAIN_JS=\$(ls \$ROOT_DIR/assets/*.js 2>/dev/null | head -1)
    
    if [ -n \"\$MAIN_JS\" ]; then
        echo \"   Checking: \$(basename \$MAIN_JS)\"
        
        # Check for common errors
        if grep -q 'Cannot read property' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${YELLOW}⚠ Contains error patterns${NC}'
        fi
        
        # Check for fetchFromAPI
        if grep -q 'fetchFromAPI\|fetch.*api' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${GREEN}✅ Contains API calls${NC}'
        else
            echo -e '${YELLOW}⚠ No API calls found in bundle${NC}'
        fi
        
        # Check for Supabase
        if grep -q 'supabase' \"\$MAIN_JS\" 2>/dev/null; then
            echo -e '${RED}❌ Still contains Supabase${NC}'
        else
            echo -e '${GREEN}✅ No Supabase references${NC}'
        fi
        
        # Check if bundle is valid JavaScript (basic check)
        if head -1 \"\$MAIN_JS\" | grep -q '!function\|(function' 2>/dev/null; then
            echo -e '${GREEN}✅ Bundle appears valid${NC}'
        else
            echo -e '${YELLOW}⚠ Bundle might be corrupted${NC}'
        fi
    else
        echo -e '${RED}❌ No JavaScript bundle found${NC}'
    fi
"
echo ""

# Step 4: Check API endpoints from browser perspective
echo -e "${BLUE}4. Testing API endpoints (browser perspective)...${NC}"
ssh "$VPS_HOST" "
    echo '   Testing /api/health:'
    HTTP_CODE=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/health 2>/dev/null || echo '000')
    if [ \"\$HTTP_CODE\" = '200' ]; then
        echo -e '${GREEN}✅ /api/health: OK (HTTP 200)${NC}'
    else
        echo -e \"${RED}❌ /api/health: Failed (HTTP \$HTTP_CODE)${NC}\"
    fi
    
    echo '   Testing /api/products:'
    HTTP_CODE=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/products 2>/dev/null || echo '000')
    if [ \"\$HTTP_CODE\" = '200' ]; then
        PRODUCT_COUNT=\$(curl -s http://localhost/api/products 2>/dev/null | jq '. | length' 2>/dev/null || echo '?')
        echo -e \"${GREEN}✅ /api/products: OK (HTTP 200, \$PRODUCT_COUNT products)${NC}\"
    else
        echo -e \"${RED}❌ /api/products: Failed (HTTP \$HTTP_CODE)${NC}\"
    fi
    
    echo '   Testing CORS headers:'
    CORS_HEADERS=\$(curl -s -I http://localhost/api/products 2>/dev/null | grep -i 'access-control' || echo 'None')
    if [ \"\$CORS_HEADERS\" != 'None' ]; then
        echo -e \"${GREEN}✅ CORS headers present${NC}\"
        echo \"   \$CORS_HEADERS\"
    else
        echo -e \"${YELLOW}⚠ No CORS headers${NC}\"
    fi
"
echo ""

# Step 5: Check source code for fetchFromAPI function
echo -e "${BLUE}5. Checking source code for fetchFromAPI...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    if [ -f src/lib/api.ts ] || [ -f src/lib/api.js ]; then
        echo -e '${GREEN}✅ API utility file exists${NC}'
        if grep -q 'fetchFromAPI' src/lib/api.* 2>/dev/null; then
            echo -e '${GREEN}✅ fetchFromAPI function exists${NC}'
            echo '   Function definition:'
            grep -A 5 'fetchFromAPI' src/lib/api.* 2>/dev/null | head -6
        else
            echo -e '${RED}❌ fetchFromAPI function missing${NC}'
        fi
    else
        echo -e '${YELLOW}⚠ No API utility file found${NC}'
        echo '   Checking if fetchFromAPI is defined inline:'
        if grep -r 'fetchFromAPI' src/ 2>/dev/null | head -3; then
            echo -e '${GREEN}✅ fetchFromAPI found in source${NC}'
        else
            echo -e '${RED}❌ fetchFromAPI not found${NC}'
        fi
    fi
    
    echo ''
    echo '   Checking App.tsx imports:'
    if grep -q 'fetchFromAPI\|from.*api' src/App.tsx 2>/dev/null; then
        echo -e '${GREEN}✅ App.tsx imports API function${NC}'
        grep 'fetchFromAPI\|from.*api' src/App.tsx | head -3
    else
        echo -e '${RED}❌ App.tsx does not import API function${NC}'
    fi
"
echo ""

# Step 6: Check nginx error logs
echo -e "${BLUE}6. Checking nginx error logs...${NC}"
ssh "$VPS_HOST" "
    echo '   Recent nginx errors (last 10 lines):'
    tail -10 /var/log/nginx/error.log 2>/dev/null | grep -v '^$' || echo '   No recent errors'
    
    echo ''
    echo '   Recent nginx access logs (last 5 requests):'
    tail -5 /var/log/nginx/access.log 2>/dev/null | grep -E 'GET|POST' | head -5 || echo '   No recent requests'
"
echo ""

# Step 7: Check PM2 logs
echo -e "${BLUE}7. Checking backend logs...${NC}"
ssh "$VPS_HOST" "
    if command -v pm2 &> /dev/null; then
        echo '   Recent backend errors:'
        pm2 logs azteka-api --lines 10 --nostream 2>/dev/null | grep -i error | tail -5 || echo '   No recent errors'
        
        echo ''
        echo '   Recent backend logs:'
        pm2 logs azteka-api --lines 5 --nostream 2>/dev/null | tail -5 || echo '   No recent logs'
    else
        echo -e '${YELLOW}⚠ PM2 not available${NC}'
    fi
"
echo ""

# Step 8: Test actual HTTP response
echo -e "${BLUE}8. Testing actual HTTP response...${NC}"
ssh "$VPS_HOST" "
    echo '   Testing root URL:'
    HTTP_CODE=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost/ 2>/dev/null || echo '000')
    CONTENT_TYPE=\$(curl -s -I http://localhost/ 2>/dev/null | grep -i 'content-type' || echo 'None')
    
    if [ \"\$HTTP_CODE\" = '200' ]; then
        echo -e \"${GREEN}✅ Root URL: OK (HTTP 200)${NC}\"
        echo \"   Content-Type: \$CONTENT_TYPE\"
        
        # Check if response contains HTML
        if curl -s http://localhost/ 2>/dev/null | grep -q '<html'; then
            echo -e '${GREEN}✅ Response contains HTML${NC}'
        else
            echo -e '${RED}❌ Response does not contain HTML${NC}'
        fi
        
        # Check if response contains root div
        if curl -s http://localhost/ 2>/dev/null | grep -q 'id=\"root\"'; then
            echo -e '${GREEN}✅ Response contains root div${NC}'
        else
            echo -e '${RED}❌ Response does not contain root div${NC}'
        fi
    else
        echo -e \"${RED}❌ Root URL: Failed (HTTP \$HTTP_CODE)${NC}\"
    fi
"
echo ""

# Step 9: Check browser console errors (manual check instructions)
echo -e "${BLUE}9. Browser Console Check (Manual)${NC}"
echo ""
echo "   Open browser DevTools (F12) and check:"
echo "   1. Console tab for JavaScript errors"
echo "   2. Network tab for failed requests"
echo "   3. Look for:"
echo "      - 404 errors (missing files)"
echo "      - CORS errors"
echo "      - JavaScript errors"
echo "      - Failed API calls"
echo ""
echo "   Common issues to check:"
echo "   - 'fetchFromAPI is not defined'"
echo "   - 'Cannot read property of undefined'"
echo "   - 'Failed to fetch' (API errors)"
echo "   - '404 Not Found' (missing assets)"
echo ""

# Step 10: Summary and recommendations
echo -e "${BLUE}=== Summary & Recommendations ===${NC}"
echo ""
echo "If you still see a white page, check:"
echo ""
echo "1. ${YELLOW}Browser Console${NC}:"
echo "   - Open DevTools (F12)"
echo "   - Check Console tab for errors"
echo "   - Check Network tab for failed requests"
echo ""
echo "2. ${YELLOW}Hard Refresh${NC}:"
echo "   - Press Ctrl+Shift+R (Windows/Linux)"
echo "   - Press Cmd+Shift+R (Mac)"
echo "   - Or clear browser cache"
echo ""
echo "3. ${YELLOW}Check API Calls${NC}:"
echo "   - Open Network tab in DevTools"
echo "   - Look for /api/products request"
echo "   - Check if it returns 200 OK"
echo ""
echo "4. ${YELLOW}Check JavaScript Errors${NC}:"
echo "   - Look for 'Uncaught Error' in console"
echo "   - Look for 'TypeError' in console"
echo "   - Look for 'ReferenceError' in console"
echo ""
echo "5. ${YELLOW}Check fetchFromAPI Function${NC}:"
echo "   - Make sure it's defined and imported correctly"
echo "   - Make sure it handles errors properly"
echo ""

echo "=== Debug Complete ==="

