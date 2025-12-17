# 🧪 Complete Testing Guide - Azteka DSD

## 🎯 Overview

Complete guide for testing all features of the Azteka DSD system, including QuickBooks integration, image processing, and role-based access.

---

## 🚀 Quick Start

### Access Test Dashboard
**Path:** `/admin/test` or `/test`

**Steps:**
1. Login as admin
2. Navigate to `/admin/test`
3. Click "Run All Tests"
4. Review results

---

## 📋 Complete Testing Workflow

### Phase 1: Setup & Configuration

#### Step 1: Verify Environment Variables
Check `.env.production` has all required keys:

```bash
# QuickBooks
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=http://localhost:4000/api/quickbooks/callback

# Google Custom Search
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Remove.bg
REMOVE_BG_KEY=your_removebg_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

#### Step 2: Run Database Migrations
```bash
cd /Users/ernestoponce/dev/azteka-dsd
npx prisma migrate dev --name add_contract_workers
npx prisma generate
```

#### Step 3: Start Server
```bash
npm run server
```

---

### Phase 2: QuickBooks Integration

#### Test 1: Connect QuickBooks
1. Navigate to `/api/quickbooks/auth`
2. Complete OAuth flow
3. Verify connection in test dashboard

#### Test 2: Seed Inventory
1. Go to `/admin/test`
2. Click "Seed Inventory from QB"
3. Wait for sync
4. Verify inventory count increases

#### Test 3: Sync Customers
1. Click "Run All Tests"
2. Check "Customer Sync" test
3. Verify customers are synced

**Expected Results:**
- ✅ QuickBooks connected
- ✅ Inventory synced
- ✅ Customers synced

---

### Phase 3: Image Processing

#### Test 1: Process All Images
1. Go to `/admin/test`
2. Click "Process All Images"
3. Wait for processing
4. Verify products have images

#### Test 2: Manual Image Processing
1. Go to `/admin/images`
2. Select products without images
3. Click "Find & Process"
4. Verify images are found and backgrounds removed

#### Test 3: AI Splash Images
1. Mark a product as "special"
2. Go to `/admin/images`
3. Click "Generate Splash" for special product
4. Verify splash image is generated

**Expected Results:**
- ✅ Images found via Google search
- ✅ Backgrounds removed
- ✅ Splash images generated for special products
- ✅ "Needs Images" count = 0

---

### Phase 4: Role-Based Access

#### Test 1: General User View
1. Logout (if logged in)
2. Navigate to `/`
3. Verify:
   - No prices shown
   - Login prompt visible
   - Products visible without details

#### Test 2: Customer View
1. Login as customer
2. Navigate to `/`
3. Verify:
   - Prices shown
   - Order again feed visible
   - Full product details

#### Test 3: Sales Rep View
1. Login as sales rep
2. Navigate to `/`
3. Verify:
   - Mode selector visible
   - Can switch modes (Mexican Grocery, Convenience Store, etc.)
   - Full catalog access

#### Test 4: Carlos Bulk Order
1. Login as Carlos (`carlos@azteka.com`)
2. Navigate to `/`
3. Verify:
   - Bulk order button appears in bottom-right
   - Can open bulk order sheet
   - Can place multi-store orders

**Expected Results:**
- ✅ General users see limited view
- ✅ Customers see full view
- ✅ Sales reps see customizable view
- ✅ Carlos sees bulk order button

---

### Phase 5: Contract Workers

#### Test 1: Worker Dashboard
1. Login as worker (sales rep, driver, or warehouse)
2. Navigate to `/worker`
3. Verify:
   - Available jobs visible
   - My jobs visible
   - Earnings displayed

#### Test 2: Accept Job
1. Click "Accept Job" on available job
2. Verify job moves to "My Jobs"
3. Verify status changes to "accepted"

#### Test 3: Complete Job
1. Click "Complete Job" on accepted job
2. Verify job status changes to "completed"
3. Verify earnings increase

**Expected Results:**
- ✅ Jobs visible
- ✅ Can accept jobs
- ✅ Can complete jobs
- ✅ Earnings calculated correctly

---

## 🎯 Complete End-to-End Test

### Full Workflow: Seed → Process → View

1. **Seed Inventory from QuickBooks**
   - Go to `/admin/test`
   - Click "Seed Inventory from QB"
   - Wait for sync
   - Verify products appear

2. **Process All Images**
   - Click "Process All Images"
   - Wait for processing
   - Verify images are added
   - Verify backgrounds are removed

3. **View Catalog**
   - Navigate to `/`
   - Verify products are displayed
   - Verify images are visible
   - Verify backgrounds are transparent

4. **Test Role-Based Views**
   - Test as general user (no login)
   - Test as customer (login)
   - Test as sales rep (login)
   - Test as Carlos (login)

5. **Test Contract Workers**
   - Login as worker
   - Navigate to `/worker`
   - Accept and complete a job
   - Verify earnings update

---

## 📊 Test Dashboard Features

### Quick Stats
- **QuickBooks:** Connection status
- **Inventory:** Total product count
- **Needs Images:** Products without images
- **Test Status:** Overall test suite status

### Quick Actions
- **Seed Inventory from QB:** Sync products from QuickBooks
- **Process All Images:** Auto-search, remove backgrounds, generate splash images
- **Image Processing UI:** Manual image processing interface

### Test Suites
1. **QuickBooks Integration** (3 tests)
   - Connection
   - Inventory Sync
   - Customer Sync

2. **Image Processing** (4 tests)
   - Image Search API
   - Background Removal
   - AI Splash Image Generation
   - Bulk Image Processing

3. **Product Management** (3 tests)
   - Product API
   - Category API
   - Product Updates

4. **Contract Workers** (3 tests)
   - Worker API
   - Job Queue
   - Commission Calculation

5. **Role-Based Access** (4 tests)
   - General User View
   - Customer View
   - Sales Rep View
   - Carlos Bulk Order

**Total: 17 tests**

---

## ✅ Success Criteria

### All Tests Passing
- ✅ QuickBooks Integration: 3/3
- ✅ Image Processing: 4/4
- ✅ Product Management: 3/3
- ✅ Contract Workers: 3/3
- ✅ Role-Based Access: 4/4

### System Ready
- ✅ QuickBooks connected and syncing
- ✅ Images processing automatically
- ✅ Products visible in catalog
- ✅ Role-based views working
- ✅ Contract workers system functional

---

## 🔧 Troubleshooting

### QuickBooks Issues
- Check OAuth flow
- Verify API permissions
- Check environment variables

### Image Processing Issues
- Check API keys
- Verify API quotas
- Check image formats

### Database Issues
- Run migrations
- Regenerate Prisma client
- Check database connection

---

## 📝 Test Report

After testing, document results:

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
1. [Issue]
2. [Issue]

Fixes Applied:
1. [Fix]
2. [Fix]
```

---

## 🎯 Testing Path

**Test Dashboard:** `/admin/test` or `/test`

**Quick Actions:**
1. Seed Inventory: Click "Seed Inventory from QB"
2. Process Images: Click "Process All Images"
3. Run Tests: Click "Run All Tests"

**Ready to test!** 🚀

