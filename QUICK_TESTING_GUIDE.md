# 🧪 Quick Testing Guide - Azteka DSD

## 🚀 Test Dashboard Path

**Direct Access:** `/admin/test` or `/test`

**Full URLs:**
- Local: `http://localhost:5173/admin/test`
- Production: `https://aztekafoods.com/admin/test`

---

## 📋 Quick Testing Workflow

### Step 1: Access Test Dashboard
1. Login as admin
2. Navigate to `/admin/test`
3. Or click "Test Dashboard" in admin menu

### Step 2: Seed Inventory from QuickBooks
1. Click "Seed Inventory from QB" button
2. Wait for sync to complete
3. Verify inventory count increases

### Step 3: Process All Images
1. Click "Process All Images" button
2. System will:
   - Search for missing product images
   - Remove backgrounds
   - Generate splash images for special products
3. Wait for processing to complete
4. Verify "Needs Images" count = 0

### Step 4: Run Full Test Suite
1. Click "Run All Tests" button
2. Wait for all tests to complete
3. Review results
4. Fix any failures

---

## ✅ Expected Results

### After Seeding Inventory
- ✅ Inventory count > 0
- ✅ Products visible in catalog
- ✅ Products have SKUs and names

### After Processing Images
- ✅ Products have images
- ✅ Backgrounds are removed (transparent)
- ✅ Special products have splash images
- ✅ "Needs Images" count = 0

### After Running Tests
- ✅ All 17 tests passing
- ✅ QuickBooks connected
- ✅ Image processing working
- ✅ Role-based access working

---

## 🔧 Quick Fixes

### QuickBooks Not Connecting
1. Go to `/api/quickbooks/auth`
2. Complete OAuth flow
3. Verify connection in test dashboard

### Images Not Processing
1. Check API keys in `.env.production`:
   - `GOOGLE_API_KEY`
   - `GOOGLE_SEARCH_ENGINE_ID`
   - `REMOVE_BG_KEY`
   - `OPENAI_API_KEY`
2. Verify APIs are enabled
3. Check quota limits

### Tests Failing
1. Check error messages in test dashboard
2. Review `TESTING_PROTOCOLS.md` for specific fixes
3. Check database migrations
4. Verify API routes are registered

---

## 📊 Test Dashboard Features

### Quick Stats
- QuickBooks connection status
- Total inventory count
- Products needing images
- Overall test status

### Quick Actions
- **Seed Inventory from QB** - Sync products from QuickBooks
- **Process All Images** - Auto-search, remove backgrounds, generate splash images
- **Image Processing UI** - Manual image processing interface

### Test Suites
1. **QuickBooks Integration** (3 tests)
2. **Image Processing** (4 tests)
3. **Product Management** (3 tests)
4. **Contract Workers** (3 tests)
5. **Role-Based Access** (4 tests)

**Total: 17 tests**

---

## 🎯 Success Path

1. ✅ Access test dashboard: `/admin/test`
2. ✅ Seed inventory: Click "Seed Inventory from QB"
3. ✅ Process images: Click "Process All Images"
4. ✅ Run tests: Click "Run All Tests"
5. ✅ Fix failures: Review error messages
6. ✅ Verify results: Check catalog at `/`
7. ✅ All tests passing: System ready!

---

**Test Dashboard Path:** `/admin/test` or `/test`

**Ready to test!** 🚀

