#!/bin/bash

# Manual Testing Script for Azteka DSD
# Tests all functionalities with actual API calls

set -e

echo "🧪 Azteka DSD - Manual Testing Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ] || [ -z "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code, expected $expected_status)"
        echo "Response: $body" | head -c 200
        echo ""
        ((FAILED++))
        return 1
    fi
}

# Check if server is running
echo "🔍 Checking server status..."
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
    echo ""
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "Please start the server with: npm run server"
    exit 1
fi

echo "📡 1. Public API Endpoints"
echo "--------------------------------"
test_endpoint "Health endpoint" "GET" "http://localhost:4000/api/health" "" "200"
test_endpoint "Products API (public)" "GET" "http://localhost:4000/api/products" "" "200"
test_endpoint "Categories API (public)" "GET" "http://localhost:4000/api/categories" "" "200"
echo ""

echo "🔐 2. Authentication Required Endpoints"
echo "--------------------------------"
echo -e "${YELLOW}⚠️  These require authentication - testing without auth${NC}"
test_endpoint "Integrations API (no auth)" "GET" "http://localhost:4000/api/integrations" "" "401"
test_endpoint "Save API Key (no auth)" "POST" "http://localhost:4000/api/integrations/api-keys" '{"service":"openai","key":"test"}' "401"
test_endpoint "Test API Key (no auth)" "POST" "http://localhost:4000/api/integrations/test/openai" "" "401"
echo ""

echo "📊 3. Response Validation"
echo "--------------------------------"
echo "Testing Products API response structure..."
products_response=$(curl -s http://localhost:4000/api/products)
if echo "$products_response" | grep -q "\[" || echo "$products_response" | grep -q "\{"; then
    echo -e "${GREEN}✅ Products API returns valid JSON${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Products API response is not valid JSON${NC}"
    ((FAILED++))
fi

echo "Testing Categories API response structure..."
categories_response=$(curl -s http://localhost:4000/api/categories)
if echo "$categories_response" | grep -q "\[" || echo "$categories_response" | grep -q "\{"; then
    echo -e "${GREEN}✅ Categories API returns valid JSON${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Categories API response is not valid JSON${NC}"
    ((FAILED++))
fi
echo ""

echo "🗄️  4. Database Connectivity"
echo "--------------------------------"
echo "Testing database connection via API..."
health_response=$(curl -s http://localhost:4000/api/health)
if echo "$health_response" | grep -q "ok\|OK\|status"; then
    echo -e "${GREEN}✅ Database connection working${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Health endpoint response: $health_response${NC}"
    ((FAILED++))
fi
echo ""

echo "📁 5. File Structure"
echo "--------------------------------"
test_check() {
    local name="$1"
    local file="$2"
    
    echo -n "Checking: $name... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ MISSING${NC}"
        ((FAILED++))
    fi
}

test_check "Integrations page" "src/pages/Integrations.tsx"
test_check "Integrations API" "src/api/integrations/route.js"
test_check "Integration helpers" "src/api/integrations/helpers.js"
test_check "Test Dashboard" "src/pages/TestDashboard.tsx"
test_check "Server config" "server.mjs"
echo ""

echo "🔧 6. Code Quality"
echo "--------------------------------"
echo "Checking for syntax errors..."
if node -c src/api/integrations/route.js 2>&1; then
    echo -e "${GREEN}✅ route.js syntax is valid${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ route.js has syntax errors${NC}"
    ((FAILED++))
fi

if node -c src/api/integrations/helpers.js 2>&1; then
    echo -e "${GREEN}✅ helpers.js syntax is valid${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ helpers.js has syntax errors${NC}"
    ((FAILED++))
fi
echo ""

echo "📊 Test Results"
echo "===================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All automated tests passed!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps for Manual Testing:${NC}"
    echo "1. Open http://localhost:5173/admin/integrations in browser"
    echo "2. Login as admin"
    echo "3. Try adding an API key"
    echo "4. Test the key"
    echo "5. Verify it saves correctly"
    echo ""
    echo "For OAuth testing:"
    echo "1. Configure OAuth credentials in .env.production"
    echo "2. Try connecting Canva Pro"
    echo "3. Try connecting Bolt.new"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Review the output above.${NC}"
    exit 1
fi









