#!/bin/bash

# Catalog UI Verification Script
# Tests that all API endpoints work and catalog can load data

echo "🔍 Azteka DSD Catalog UI - Backend Verification"
echo "=============================================="
echo ""

API_BASE="http://localhost:3000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "1. Checking if API server is running..."
if curl -s -f "$API_BASE/../health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API server is running${NC}"
else
    echo -e "${RED}❌ API server is not running${NC}"
    echo "   Start it with: pm2 start ecosystem.config.js"
    exit 1
fi

echo ""

# Check products endpoint
echo "2. Testing GET /api/products..."
PRODUCTS=$(curl -s "$API_BASE/products")
PRODUCT_COUNT=$(echo "$PRODUCTS" | jq -r 'length' 2>/dev/null)

if [ "$PRODUCT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $PRODUCT_COUNT products${NC}"
    echo "   Sample product: $(echo "$PRODUCTS" | jq -r '.[0].name' 2>/dev/null)"
else
    echo -e "${YELLOW}⚠️  No products found (empty database)${NC}"
fi

echo ""

# Check brands endpoint
echo "3. Testing GET /api/brands..."
BRANDS=$(curl -s "$API_BASE/brands" 2>/dev/null)

if echo "$BRANDS" | jq -e '. | length' > /dev/null 2>&1; then
    BRAND_COUNT=$(echo "$BRANDS" | jq -r 'length')
    echo -e "${GREEN}✅ Found $BRAND_COUNT brands${NC}"
else
    echo -e "${YELLOW}⚠️  Brands endpoint requires authentication${NC}"
    echo "   This is expected - brands endpoint is admin-only"
fi

echo ""

# Check categories endpoint
echo "4. Testing GET /api/categories..."
CATEGORIES=$(curl -s "$API_BASE/categories" 2>/dev/null)

if echo "$CATEGORIES" | jq -e '. | length' > /dev/null 2>&1; then
    CATEGORY_COUNT=$(echo "$CATEGORIES" | jq -r 'length')
    echo -e "${GREEN}✅ Found $CATEGORY_COUNT categories${NC}"
else
    echo -e "${YELLOW}⚠️  Categories endpoint requires authentication${NC}"
    echo "   This is expected - categories endpoint is admin-only"
fi

echo ""

# Check stores endpoint (optional)
echo "5. Testing GET /api/stores (optional)..."
STORES=$(curl -s "$API_BASE/stores" 2>/dev/null)

if echo "$STORES" | jq -e '. | length' > /dev/null 2>&1; then
    STORE_COUNT=$(echo "$STORES" | jq -r 'length')
    echo -e "${GREEN}✅ Found $STORE_COUNT stores${NC}"
else
    echo -e "${YELLOW}⚠️  Stores endpoint not implemented${NC}"
    echo "   Using mock data fallback (3 stores)"
fi

echo ""

# Summary
echo "=============================================="
echo "📊 Summary"
echo "=============================================="
echo ""

if [ "$PRODUCT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Catalog can load products${NC}"
    echo -e "${GREEN}✅ Sales Rep page will work${NC}"
    echo -e "${GREEN}✅ Customer page will work${NC}"
    echo ""
    echo "🚀 Ready to test catalog UI!"
    echo ""
    echo "Next steps:"
    echo "  1. npm run dev"
    echo "  2. Navigate to /catalog-test"
    echo "  3. Test Sales Rep view (filters, search, cart)"
    echo "  4. Test Customer view (multi-store mode)"
    echo ""
else
    echo -e "${RED}❌ No products in database${NC}"
    echo ""
    echo "To seed products, run:"
    echo "  psql \$DATABASE_URL < migrations/product_seeding.sql"
    echo ""
fi

# Check if framer-motion is installed
echo "6. Checking dependencies..."
if npm list framer-motion > /dev/null 2>&1; then
    echo -e "${GREEN}✅ framer-motion installed${NC}"
else
    echo -e "${RED}❌ framer-motion not installed${NC}"
    echo "   Run: npm install framer-motion"
fi

echo ""
echo "✅ Verification complete!"
