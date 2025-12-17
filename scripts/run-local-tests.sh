#!/bin/bash
# Local Test Execution Script
# Runs all local tests in sequence

set -e

echo "=========================================="
echo "AZTEKA DSD - LOCAL TEST EXECUTION"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE="${API_BASE_URL:-http://localhost:3000}"
ADMIN_TOKEN="${ADMIN_TEST_TOKEN:-test-token-123}"

echo "Configuration:"
echo "  API Base: $API_BASE"
echo "  Admin Token: $ADMIN_TOKEN"
echo ""

# Check if server is running
echo "Checking if server is running..."
if curl -s "$API_BASE/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "Please start the server first:"
    echo "  node server.mjs"
    echo "  OR"
    echo "  npm run server"
    exit 1
fi

# Test 1: PO Ingestion
echo ""
echo "=========================================="
echo "TEST 1: PO Ingestion"
echo "=========================================="
echo "Testing CSV PO parsing..."

RESPONSE=$(curl -s -X POST "$API_BASE/api/auto/ingest-po" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@tests/po-samples/sabritas_po.csv" \
  -F "autoProcess=false")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PO ingestion test passed${NC}"
    PRODUCT_COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "  Products parsed: $PRODUCT_COUNT"
else
    echo -e "${RED}❌ PO ingestion test failed${NC}"
    echo "$RESPONSE" | head -20
    exit 1
fi

# Test 2: Image Search
echo ""
echo "=========================================="
echo "TEST 2: Image Search"
echo "=========================================="
echo "Testing AI image search..."

SEARCH_RESPONSE=$(curl -s -X POST "$API_BASE/api/auto/search-image" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productName":"Sabritas Chips 50g","brand":"Sabritas"}')

if echo "$SEARCH_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Image search test passed${NC}"
    IMAGE_URL=$(echo "$SEARCH_RESPONSE" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)
    echo "  Image URL: ${IMAGE_URL:0:60}..."
else
    echo -e "${YELLOW}⚠️  Image search test failed (may need API keys)${NC}"
    echo "$SEARCH_RESPONSE" | head -10
fi

# Test 3: Health Check
echo ""
echo "=========================================="
echo "TEST 3: Health Check"
echo "=========================================="
HEALTH=$(curl -s "$API_BASE/api/debug/health-check")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check warning${NC}"
    echo "$HEALTH" | head -10
fi

# Test 4: Full Pipeline Test
echo ""
echo "=========================================="
echo "TEST 4: Full Pipeline Test"
echo "=========================================="
echo "Running full ingestion test harness..."
echo ""

export ADMIN_TEST_TOKEN="$ADMIN_TOKEN"
export API_BASE_URL="$API_BASE"

if node scripts/run-full-ingestion-test.mjs; then
    echo -e "${GREEN}✅ Full pipeline test completed${NC}"
    echo ""
    echo "Check logs for details:"
    echo "  logs/testing/$(date +%Y-%m-%d).log"
    echo "  logs/testing/test-summary-*.json"
else
    echo -e "${RED}❌ Full pipeline test failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "ALL LOCAL TESTS COMPLETED"
echo "=========================================="
echo -e "${GREEN}✅ Test execution finished${NC}"
echo ""
echo "Next steps:"
echo "  1. Review logs in logs/testing/"
echo "  2. Check database for created/updated products"
echo "  3. Verify images in uploads/products/"
echo "  4. Run VPS tests (see TEST_EXECUTION_REPORT.md)"

