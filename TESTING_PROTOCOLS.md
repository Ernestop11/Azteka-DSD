# 🧪 Testing Protocols - Azteka DSD

## 📋 Overview

Complete testing protocols for all features of the Azteka DSD system.

---

## 🚀 Quick Start

### Access Test Dashboard
1. Navigate to: `/admin/test` or `/test`
2. Click "Run All Tests" to execute full test suite
3. Review results and fix any failures

---

## 📝 Test Categories

### 1. QuickBooks Integration Tests

#### Test 1.1: QuickBooks Connection
**Purpose:** Verify QuickBooks API is configured and accessible

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "QuickBooks Connection" test result

**Expected Result:** ✅ Pass - "QuickBooks configured"

**If Failed:**
- Check `QUICKBOOKS_CLIENT_ID` and `QUICKBOOKS_CLIENT_SECRET` in `.env.production`
- Visit `/api/quickbooks/auth` to initiate OAuth flow
- Complete OAuth callback

**Fix Path:**
```bash
# Add to .env.production
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=http://localhost:4000/api/quickbooks/callback
QUICKBOOKS_BASE_URL=https://sandbox-quickbooks.api.intuit.com
```

---

#### Test 1.2: Inventory Sync
**Purpose:** Verify inventory can be synced from QuickBooks

**Steps:**
1. Ensure QuickBooks is connected
2. Click "Seed Inventory from QB" button
3. Wait for sync to complete
4. Check inventory count in stats

**Expected Result:** ✅ Pass - "Synced X items"

**If Failed:**
- Check QuickBooks connection status
- Verify OAuth tokens are valid
- Check QuickBooks API permissions

**Fix Path:**
1. Re-authenticate QuickBooks: `/api/quickbooks/auth`
2. Verify API permissions include "Accounting" scope
3. Check QuickBooks company has inventory items

---

#### Test 1.3: Customer Sync
**Purpose:** Verify customers can be synced from QuickBooks

**Steps:**
1. Ensure QuickBooks is connected
2. Click "Run All Tests"
3. Check "Customer Sync" test result

**Expected Result:** ✅ Pass - "Synced X customers"

**If Failed:**
- Check QuickBooks connection
- Verify customers exist in QuickBooks
- Check API permissions

---

### 2. Image Processing Tests

#### Test 2.1: Image Search API
**Purpose:** Verify Google image search works

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "Image Search API" test result

**Expected Result:** ✅ Pass - "Image found"

**If Failed:**
- Check `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` in `.env.production`
- Verify Google Custom Search API is enabled
- Check API quota limits

**Fix Path:**
```bash
# Add to .env.production
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

**Setup Google Custom Search:**
1. Go to https://console.cloud.google.com/
2. Enable Custom Search API
3. Create a Custom Search Engine at https://cse.google.com/
4. Get Search Engine ID
5. Get API key from Google Cloud Console

---

#### Test 2.2: Background Removal
**Purpose:** Verify Remove.bg API works

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "Background Removal" test result

**Expected Result:** ✅ Pass - "Background removed"

**If Failed:**
- Check `REMOVE_BG_KEY` in `.env.production`
- Verify Remove.bg API key is valid
- Check API quota limits

**Fix Path:**
```bash
# Add to .env.production
REMOVE_BG_KEY=your_removebg_api_key
```

**Get Remove.bg API Key:**
1. Go to https://www.remove.bg/api
2. Sign up for account
3. Get API key from dashboard
4. Add to `.env.production`

---

#### Test 2.3: AI Splash Image Generation
**Purpose:** Verify AI splash image generation works

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "AI Splash Image Generation" test result

**Expected Result:** ✅ Pass - "Splash image generated"

**If Failed:**
- Check `OPENAI_API_KEY` in `.env.production`
- Verify OpenAI API key is valid
- Check API quota limits

**Fix Path:**
```bash
# Add to .env.production
OPENAI_API_KEY=your_openai_api_key
```

---

#### Test 2.4: Bulk Image Processing
**Purpose:** Verify bulk image processing workflow

**Steps:**
1. Navigate to Test Dashboard
2. Click "Process All Images" button
3. Wait for processing to complete
4. Check "Bulk Image Processing" test result

**Expected Result:** ✅ Pass - "Bulk processing works"

**If Failed:**
- Check all API keys are configured
- Verify products exist in database
- Check API quota limits

**Manual Test:**
1. Go to `/admin/images`
2. Select products without images
3. Click "Find & Process" for each product
4. Verify images are found and backgrounds removed

---

### 3. Product Management Tests

#### Test 3.1: Product API
**Purpose:** Verify products API is accessible

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "Product API" test result

**Expected Result:** ✅ Pass - "Found X products"

**If Failed:**
- Check database connection
- Verify products exist in database
- Check API route is registered

**Fix Path:**
```bash
# Check database connection
npx prisma db pull

# Seed products if needed
npx prisma db seed
```

---

#### Test 3.2: Category API
**Purpose:** Verify categories API is accessible

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "Category API" test result

**Expected Result:** ✅ Pass - "Found X categories"

**If Failed:**
- Check database connection
- Verify categories exist in database
- Check API route is registered

---

#### Test 3.3: Product Updates
**Purpose:** Verify products can be updated

**Steps:**
1. Navigate to Test Dashboard
2. Click "Run All Tests"
3. Check "Product Updates" test result

**Expected Result:** ✅ Pass - "Product updates working"

**If Failed:**
- Check database permissions
- Verify Prisma client is generated
- Check API route permissions

---

### 4. Contract Workers Tests

#### Test 4.1: Worker API
**Purpose:** Verify contract worker API is accessible

**Steps:**
1. Login as a worker (sales rep, driver, or warehouse)
2. Navigate to Test Dashboard
3. Click "Run All Tests"
4. Check "Worker API" test result

**Expected Result:** ✅ Pass - "Worker API working"

**If Failed:**
- Check authentication token
- Verify user role is correct
- Check API route is registered

---

#### Test 4.2: Job Queue
**Purpose:** Verify job queue system works

**Steps:**
1. Login as a worker
2. Navigate to Test Dashboard
3. Click "Run All Tests"
4. Check "Job Queue" test result

**Expected Result:** ✅ Pass - "Found X available jobs"

**If Failed:**
- Check database migration for Job model
- Verify jobs exist in database
- Check API route is registered

**Fix Path:**
```bash
# Run database migration
npx prisma migrate dev --name add_contract_workers
npx prisma generate
```

---

#### Test 4.3: Commission Calculation
**Purpose:** Verify commission calculation works

**Steps:**
1. Login as a worker
2. Accept and complete a job
3. Navigate to Test Dashboard
4. Click "Run All Tests"
5. Check "Commission Calculation" test result

**Expected Result:** ✅ Pass - "Earnings: $X.XX"

**If Failed:**
- Check ContractWorker model in database
- Verify earnings field is updated
- Check commission calculation logic

---

### 5. Role-Based Access Tests

#### Test 5.1: General User View
**Purpose:** Verify general user view (no login) works

**Steps:**
1. Logout (if logged in)
2. Navigate to `/`
3. Verify no prices are shown
4. Check "General User View" test result

**Expected Result:** ✅ Pass - "General user view accessible"

**If Failed:**
- Check CatalogLanding component
- Verify products API is public
- Check routing configuration

---

#### Test 5.2: Customer View
**Purpose:** Verify customer view works

**Steps:**
1. Login as customer
2. Navigate to `/`
3. Verify prices are shown
4. Check "Customer View" test result

**Expected Result:** ✅ Pass - "Customer view accessible"

**If Failed:**
- Check user role is "CUSTOMER"
- Verify CatalogLanding component
- Check authentication context

---

#### Test 5.3: Sales Rep View
**Purpose:** Verify sales rep view works

**Steps:**
1. Login as sales rep
2. Navigate to `/`
3. Verify mode selector is visible
4. Check "Sales Rep View" test result

**Expected Result:** ✅ Pass - "Sales rep view accessible"

**If Failed:**
- Check user role is "SALES_REP"
- Verify ModeSelector component
- Check authentication context

---

#### Test 5.4: Carlos Bulk Order
**Purpose:** Verify Carlos bulk order button appears

**Steps:**
1. Login as Carlos (`carlos@azteka.com` or `carlos@example.com`)
2. Navigate to `/`
3. Verify bulk order button appears in bottom-right
4. Check "Carlos Bulk Order" test result

**Expected Result:** ✅ Pass - "Carlos bulk order available"

**If Failed:**
- Check email matches Carlos emails
- Verify CarlosBulkOrder component
- Check authentication context

---

## 🔧 Complete Workflow Test

### End-to-End Test: Seed Inventory → Process Images → View Catalog

**Step 1: Seed Inventory from QuickBooks**
1. Navigate to Test Dashboard
2. Click "Seed Inventory from QB"
3. Wait for sync to complete
4. Verify inventory count increases

**Step 2: Process All Images**
1. Click "Process All Images" button
2. Wait for processing to complete
3. Verify products have images
4. Verify backgrounds are removed

**Step 3: View Catalog**
1. Navigate to `/`
2. Verify products are displayed
3. Verify images are visible
4. Verify backgrounds are transparent

**Step 4: Test Role-Based Views**
1. Test as general user (no login)
2. Test as customer (login)
3. Test as sales rep (login)
4. Test as Carlos (login)

---

## 📊 Test Dashboard Features

### Quick Stats
- **QuickBooks Status:** Shows connection status
- **Inventory Count:** Total products in database
- **Needs Images:** Products without images or background removal
- **Test Status:** Overall test suite status

### Quick Actions
- **Seed Inventory from QB:** Sync products from QuickBooks
- **Process All Images:** Auto-search, remove backgrounds, generate splash images
- **Image Processing UI:** Manual image processing interface

### Test Suites
- **QuickBooks Integration:** Connection, inventory sync, customer sync
- **Image Processing:** Search, background removal, splash generation, bulk processing
- **Product Management:** Product API, category API, product updates
- **Contract Workers:** Worker API, job queue, commission calculation
- **Role-Based Access:** General user, customer, sales rep, Carlos bulk order

---

## 🐛 Troubleshooting

### Common Issues

#### Issue 1: QuickBooks Not Connecting
**Symptoms:** QuickBooks connection test fails

**Solutions:**
1. Check environment variables
2. Re-authenticate QuickBooks
3. Verify API permissions
4. Check OAuth callback URL

#### Issue 2: Image Search Failing
**Symptoms:** Image search test fails

**Solutions:**
1. Check Google API key
2. Verify Custom Search Engine is set up
3. Check API quota limits
4. Verify search engine ID

#### Issue 3: Background Removal Failing
**Symptoms:** Background removal test fails

**Solutions:**
1. Check Remove.bg API key
2. Verify API quota limits
3. Check image format (PNG/JPG)
4. Verify API endpoint is accessible

#### Issue 4: Database Errors
**Symptoms:** Product/Category API tests fail

**Solutions:**
1. Run database migrations
2. Regenerate Prisma client
3. Check database connection
4. Verify schema is up to date

---

## ✅ Success Criteria

### All Tests Passing
- ✅ QuickBooks Integration: 3/3 tests passing
- ✅ Image Processing: 4/4 tests passing
- ✅ Product Management: 3/3 tests passing
- ✅ Contract Workers: 3/3 tests passing
- ✅ Role-Based Access: 4/4 tests passing

### System Ready
- ✅ QuickBooks connected and syncing
- ✅ Images processing automatically
- ✅ Products visible in catalog
- ✅ Role-based views working
- ✅ Contract workers system functional

---

## 📝 Test Report Template

After running tests, document results:

```
Test Date: [Date]
Tester: [Name]
Environment: [Production/Staging/Development]

Results:
- QuickBooks Integration: [X/3] passing
- Image Processing: [X/4] passing
- Product Management: [X/3] passing
- Contract Workers: [X/3] passing
- Role-Based Access: [X/4] passing

Overall: [X/17] tests passing

Issues Found:
1. [Issue description]
2. [Issue description]

Fixes Applied:
1. [Fix description]
2. [Fix description]
```

---

**Test Dashboard Path:** `/admin/test` or `/test`

**Ready to test!** 🚀

