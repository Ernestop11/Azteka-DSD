#!/bin/bash

# Debug White Page Issue
# Run this on VPS: bash debug-white-page.sh

echo "=== White Page Debugging ==="
echo ""

VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Checking frontend build...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    if [ ! -d dist ]; then
        echo -e '${RED}❌ No dist/ directory${NC}'
    else
        echo -e '${GREEN}✅ dist/ directory exists${NC}'
        
        if [ ! -f dist/index.html ]; then
            echo -e '${RED}❌ dist/index.html missing${NC}'
        else
            echo -e '${GREEN}✅ dist/index.html exists${NC}'
            echo '   File size:'
            ls -lh dist/index.html | awk '{print \"   \" \$5}'
        fi
        
        if [ ! -d dist/assets ]; then
            echo -e '${RED}❌ dist/assets/ missing${NC}'
        else
            echo -e '${GREEN}✅ dist/assets/ exists${NC}'
            echo '   Asset files:'
            ls -1 dist/assets/ | wc -l | xargs echo '   '
        fi
    fi
"
echo ""

echo -e "${BLUE}2. Checking if frontend code uses Supabase...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    # Check built JavaScript files for Supabase references
    if find dist/assets -name '*.js' -exec grep -l 'supabase\|VITE_SUPABASE' {} \; 2>/dev/null | head -1 | grep -q .; then
        echo -e '${RED}❌ Frontend build still contains Supabase references${NC}'
        echo '   Files with Supabase:'
        find dist/assets -name '*.js' -exec grep -l 'supabase\|VITE_SUPABASE' {} \; 2>/dev/null | head -3
    else
        echo -e '${GREEN}✅ No Supabase references in build${NC}'
    fi
    
    # Check source code
    if [ -f src/App.tsx ]; then
        if grep -q 'from.*supabase' src/App.tsx; then
            echo -e '${RED}❌ src/App.tsx still imports Supabase${NC}'
            echo '   Imports:'
            grep 'from.*supabase' src/App.tsx | head -3
        else
            echo -e '${GREEN}✅ src/App.tsx does not import Supabase${NC}'
        fi
    fi
"
echo ""

echo -e "${BLUE}3. Checking if frontend uses API...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    # Check if App.tsx uses fetch or API calls
    if grep -q 'fetch.*api\|/api/' src/App.tsx 2>/dev/null; then
        echo -e '${GREEN}✅ App.tsx uses API calls${NC}'
        echo '   API calls found:'
        grep -o 'fetch.*api\|/api/[^\"'\'']*' src/App.tsx | head -3
    else
        echo -e '${YELLOW}⚠ App.tsx might not be using API${NC}'
    fi
    
    # Check built files
    if find dist/assets -name '*.js' -exec grep -l '/api/' {} \; 2>/dev/null | head -1 | grep -q .; then
        echo -e '${GREEN}✅ Build contains API calls${NC}'
    else
        echo -e '${YELLOW}⚠ Build might not contain API calls${NC}'
    fi
"
echo ""

echo -e "${BLUE}4. Checking build timestamp...${NC}"
ssh "$VPS_HOST" "
    cd $VPS_DIR
    
    if [ -f dist/index.html ]; then
        echo '   Build timestamp:'
        stat -c '%y' dist/index.html 2>/dev/null || stat -f '%Sm' dist/index.html
        echo ''
        echo '   Current time:'
        date
        echo ''
        
        # Check if build is recent (within last hour)
        BUILD_TIME=$(stat -c '%Y' dist/index.html 2>/dev/null || stat -f '%m' dist/index.html)
        CURRENT_TIME=$(date +%s)
        AGE=$((CURRENT_TIME - BUILD_TIME))
        
        if [ $AGE -lt 3600 ]; then
            echo -e '${GREEN}✅ Build is recent (< 1 hour old)${NC}'
        else
            echo -e '${YELLOW}⚠ Build is old (> 1 hour)${NC}'
            echo \"   Age: $((AGE / 3600)) hours\"
        fi
    fi
"
echo ""

echo -e "${BLUE}5. Checking nginx configuration...${NC}"
ssh "$VPS_HOST" "
    # Check nginx root directory
    ROOT_DIR=\$(grep -E '^\s*root\s+' /etc/nginx/sites-enabled/* 2>/dev/null | head -1 | awk '{print \$2}' | tr -d ';')
    
    if [ -z \"\$ROOT_DIR\" ]; then
        echo -e '${YELLOW}⚠ Could not find nginx root${NC}'
    else
        echo \"   Nginx root: \$ROOT_DIR\"
        
        if [ \"\$ROOT_DIR\" = \"$VPS_DIR/dist\" ]; then
            echo -e '${GREEN}✅ Nginx pointing to correct directory${NC}'
        else
            echo -e '${YELLOW}⚠ Nginx might be pointing to wrong directory${NC}'
            echo \"   Expected: $VPS_DIR/dist\"
        fi
        
        if [ -f \"\$ROOT_DIR/index.html\" ]; then
            echo -e '${GREEN}✅ index.html exists in nginx root${NC}'
        else
            echo -e '${RED}❌ index.html missing in nginx root${NC}'
        fi
    fi
    
    # Check nginx error logs
    echo ''
    echo '   Recent nginx errors:'
    tail -5 /var/log/nginx/error.log 2>/dev/null | grep -v '^$' || echo '   No recent errors'
"
echo ""

echo -e "${BLUE}6. Testing API from frontend perspective...${NC}"
ssh "$VPS_HOST" "
    # Test API endpoint
    echo '   Testing /api/products:'
    curl -s http://localhost:3002/api/products | jq '. | length' 2>/dev/null || curl -s http://localhost:3002/api/products | head -c 100
    echo ''
    
    # Test CORS headers
    echo '   CORS headers:'
    curl -s -I http://localhost:3002/api/products | grep -i 'access-control' || echo '   No CORS headers'
"
echo ""

echo -e "${BLUE}7. Checking browser console errors (check manually)...${NC}"
echo "   Open browser DevTools (F12) and check:"
echo "   - Console tab for JavaScript errors"
echo "   - Network tab for failed requests"
echo "   - Look for 404s, CORS errors, or API failures"
echo ""

echo -e "${BLUE}8. Quick fix suggestions...${NC}"
echo ""
echo "If frontend still has Supabase:"
echo "  1. Rebuild frontend: cd $VPS_DIR && npm run build"
echo "  2. Clear nginx cache: systemctl reload nginx"
echo ""
echo "If build is old:"
echo "  1. Pull latest code: cd $VPS_DIR && git pull origin main"
echo "  2. Rebuild: npm run build"
echo ""
echo "If API calls are failing:"
echo "  1. Check CORS in server.mjs"
echo "  2. Verify API endpoint URLs in frontend"
echo "  3. Check browser console for errors"
echo ""

echo "=== Debug Complete ==="


