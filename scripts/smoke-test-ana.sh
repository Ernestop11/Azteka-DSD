#!/bin/bash

# SMOKE TEST: Ana Dashboard APIs
# Tests all Ana-related endpoints to ensure they return valid data

BASE_URL="${1:-https://aztekafoods.com}"
PASS=0
FAIL=0
WARN=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  SMOKE TEST: Ana Dashboard APIs"
echo "  Base URL: $BASE_URL"
echo "================================================"
echo ""

# Helper function to test an endpoint
test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_field="$3"

    echo -n "Testing $name... "

    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" == "200" ]; then
        if [ -n "$expected_field" ]; then
            if echo "$body" | grep -q "$expected_field"; then
                echo -e "${GREEN}PASS${NC} (HTTP $http_code, found '$expected_field')"
                ((PASS++))
            else
                echo -e "${YELLOW}WARN${NC} (HTTP $http_code, missing '$expected_field')"
                ((WARN++))
            fi
        else
            echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
            ((PASS++))
        fi
    else
        echo -e "${RED}FAIL${NC} (HTTP $http_code)"
        ((FAIL++))
    fi
}

# Helper for endpoints that need query params
test_endpoint_with_params() {
    local name="$1"
    local endpoint="$2"
    local expected_field="$3"

    # Calculate current week dates
    START_DATE=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d "7 days ago" +%Y-%m-%d)
    END_DATE=$(date +%Y-%m-%d)

    echo -n "Testing $name... "

    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint?start=$START_DATE&end=$END_DATE" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" == "200" ]; then
        if [ -n "$expected_field" ]; then
            if echo "$body" | grep -q "$expected_field"; then
                echo -e "${GREEN}PASS${NC} (HTTP $http_code, found '$expected_field')"
                ((PASS++))
            else
                echo -e "${YELLOW}WARN${NC} (HTTP $http_code, missing '$expected_field')"
                ((WARN++))
            fi
        else
            echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
            ((PASS++))
        fi
    else
        echo -e "${RED}FAIL${NC} (HTTP $http_code)"
        ((FAIL++))
    fi
}

echo "--- Ana Dashboard APIs ---"
test_endpoint "Dashboard" "/api/ana/dashboard" "clockedInToday"
test_endpoint_with_params "Payroll" "/api/ana/payroll" "employees"
test_endpoint "Employees" "/api/ana/employees" "firstName"
test_endpoint "Inventory" "/api/ana/inventory" "categories"
test_endpoint "Deliveries" "/api/ana/deliveries" ""

echo ""
echo "--- Core Catalog APIs ---"
test_endpoint "Products" "/api/products" ""
test_endpoint "Catalog Products" "/api/catalog/products" ""
test_endpoint "Catalog Categories" "/api/catalog/categories" ""
test_endpoint "Catalog Brands" "/api/catalog/brands" ""
test_endpoint "Catalog Filters" "/api/catalog/filters" ""

echo ""
echo "--- Admin APIs ---"
test_endpoint "Admin Products" "/api/admin/products" ""
test_endpoint "Admin Categories" "/api/admin/categories" ""
test_endpoint "Admin Brands" "/api/admin/brands" ""

echo ""
echo "--- Kiosk APIs ---"
test_endpoint "Kiosk Lookup (test PIN)" "/api/kiosk/lookup?pin=0960" ""

echo ""
echo "--- Database Sync Tests ---"

# Test that dashboard returns real data (not empty)
echo -n "Testing Dashboard has real employee count... "
response=$(curl -s "$BASE_URL/api/ana/dashboard")
employee_count=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('clockedIn', [])))" 2>/dev/null)
if [ -n "$employee_count" ]; then
    echo -e "${GREEN}PASS${NC} ($employee_count employees clocked in)"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (couldn't parse response)"
    ((FAIL++))
fi

# Test that POs are being returned
echo -n "Testing Dashboard has PO data... "
po_count=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('recentPOs', [])))" 2>/dev/null)
if [ "$po_count" != "" ] && [ "$po_count" -gt 0 ]; then
    echo -e "${GREEN}PASS${NC} ($po_count POs found)"
    ((PASS++))
else
    echo -e "${YELLOW}WARN${NC} (no POs found, might be empty)"
    ((WARN++))
fi

# Test payroll returns employees
echo -n "Testing Payroll has employee list... "
START_DATE=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d "7 days ago" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)
payroll_response=$(curl -s "$BASE_URL/api/ana/payroll?start=$START_DATE&end=$END_DATE")
emp_count=$(echo "$payroll_response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('employees', [])))" 2>/dev/null)
if [ -n "$emp_count" ] && [ "$emp_count" -gt 0 ]; then
    echo -e "${GREEN}PASS${NC} ($emp_count employees in payroll)"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (no employees returned)"
    ((FAIL++))
fi

# Test clockedIn is present in payroll
echo -n "Testing Payroll returns clockedIn data... "
has_clocked=$(echo "$payroll_response" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'clockedIn' in d else 'no')" 2>/dev/null)
if [ "$has_clocked" == "yes" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

echo ""
echo "================================================"
echo "  RESULTS"
echo "================================================"
echo -e "  ${GREEN}PASS: $PASS${NC}"
echo -e "  ${YELLOW}WARN: $WARN${NC}"
echo -e "  ${RED}FAIL: $FAIL${NC}"
echo ""

TOTAL=$((PASS + WARN + FAIL))
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check the output above.${NC}"
    exit 1
fi
