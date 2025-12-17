# Full End-to-End Test Execution Report

## Test Execution Summary

**Date:** $(date)
**Project:** Azteka DSD MVP
**Test Type:** Full End-to-End System Test

---

## STEP 1 — LOCAL SETUP

### 1.1 Project Navigation
- ✅ Project located at: `/Users/ernestoponce/Downloads/Azteka-DSD-main`
- ✅ Project structure verified

### 1.2 Dependencies Installation
**Status:** ⚠️ **MANUAL STEP REQUIRED**

```bash
cd /Users/ernestoponce/Downloads/Azteka-DSD-main
npm install
```

**Required Dependencies:**
- openai
- pdf-parse
- xlsx
- csv-parse
- sharp
- string-similarity
- form-data
- express
- prisma
- @prisma/client

### 1.3 Local Dev Server
**Status:** ⚠️ **MANUAL STEP REQUIRED**

```bash
# Option 1: If using root package.json (Vite frontend)
npm run dev

# Option 2: If using remote_azteka_dsd (Express backend)
cd remote_azteka_dsd
npm run server
# OR
node server.mjs
```

**Note:** Server should start on port 3000 (or PORT from .env)

### 1.4 Prisma Database Setup
**Status:** ⚠️ **MANUAL STEP REQUIRED**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (optional, for DB inspection)
npx prisma studio
```

**Prisma Schema Location:**
- Check: `prisma/schema.prisma` or `remote_azteka_dsd/prisma/schema.prisma`

### 1.5 Environment Variables
**Status:** ⚠️ **VERIFY REQUIRED**

Ensure `.env` or `.env.production` contains:
```env
# Database
DATABASE_URL="postgresql://..."

# API Keys
OPENAI_API_KEY=sk-...
BING_SEARCH_API_KEY=...
SERP_API_KEY=...
REMOVE_BG_API_KEY=...
CLIPDROP_API_KEY=...
CANVA_API_KEY=...

# Server
PORT=3000
NODE_ENV=development

# Auth Token (for testing)
ADMIN_TEST_TOKEN=your_test_token_here
```

---

## STEP 2 — LOCAL AI INGESTION TESTING

### 2.1 Test PO Ingestion
**Command:**
```bash
curl -X POST http://localhost:3000/api/auto/ingest-po \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -F "file=@tests/po-samples/sabritas_po.csv" \
  -F "autoProcess=false"
```

**Expected Response:**
```json
{
  "success": true,
  "products": [...],
  "count": 5
}
```

**Status:** ⏳ **PENDING EXECUTION**

### 2.2 Test AI Image Search
**Command:**
```bash
curl -X POST http://localhost:3000/api/auto/search-image \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productName":"Sabritas Original 50g","brand":"Sabritas"}'
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://..."
}
```

**Status:** ⏳ **PENDING EXECUTION**

### 2.3 Test Background Removal
**Note:** Requires image file upload, not URL
**Command:**
```bash
# First download an image, then:
curl -X POST http://localhost:3000/api/auto/bg-remove \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -F "image=@downloaded_image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://aztekafoods.com/uploads/products/image_nobg.png"
}
```

**Status:** ⏳ **PENDING EXECUTION**

### 2.4 Test Image Enhancement
**Command:**
```bash
curl -X POST http://localhost:3000/api/auto/enhance \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -F "image=@image.jpg" \
  -F "size=1024" \
  -F "createThumbnail=true"
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "thumbnailUrl": "https://..."
}
```

**Status:** ⏳ **PENDING EXECUTION**

### 2.5 Test Canva Card Generation
**Command:**
```bash
curl -X POST http://localhost:3000/api/design/render-product-card \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "name": "Sabritas Chips 50g",
    "price": 15.50,
    "imageUrl": "https://...",
    "brandName": "Sabritas"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://aztekafoods.com/uploads/products/design.png"
}
```

**Status:** ⏳ **PENDING EXECUTION**

---

## STEP 3 — LOCAL FULL PIPELINE TEST

### 3.1 Run Full Test Harness
**Command:**
```bash
export ADMIN_TEST_TOKEN=your_token
export API_BASE_URL=http://localhost:3000

node scripts/run-full-ingestion-test.mjs
```

**Expected Output:**
- Test logs in `logs/testing/YYYY-MM-DD.log`
- Summary JSON in `logs/testing/test-summary-{timestamp}.json`

**Summary Should Include:**
- Products parsed
- Products processed
- Products updated
- Products created
- Images generated
- Design assets generated
- Errors (if any)

**Status:** ⏳ **PENDING EXECUTION**

---

## STEP 4 — LOCAL IMAGE REGENERATION TEST

### 4.1 Regenerate Single Product
**Command:**
```bash
curl -X POST http://localhost:3000/api/products/PRODUCT_ID/force-regenerate \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regenerateDesign": true}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product image regenerated successfully",
  "result": {
    "imageUrl": "...",
    "designAssetUrl": "..."
  }
}
```

**Status:** ⏳ **PENDING EXECUTION**

### 4.2 Regenerate All Products
**Command:**
```bash
curl -X POST http://localhost:3000/api/products/force-regenerate-all \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize":20,"delay":2000}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Batch regeneration started",
  "job": {
    "totalProducts": 150,
    "batches": 8,
    "logFile": "logs/regen/regen-{timestamp}.log",
    "summaryFile": "logs/regen/regen-summary-{timestamp}.json"
  }
}
```

**Status:** ⏳ **PENDING EXECUTION**

---

## STEP 5 — VPS TESTING SETUP

### 5.1 SSH into Server
**Status:** ⚠️ **MANUAL STEP REQUIRED**

```bash
ssh root@YOUR_SERVER_IP
```

### 5.2 Navigate to Project
```bash
cd /srv/azteka-dsd
# OR
cd /srv/azteka-api-live
```

### 5.3 Install Production Dependencies
```bash
npm install --production
```

### 5.4 Build for Production
```bash
npm run build
# OR if no build script:
npx prisma generate
```

### 5.5 Restart PM2
```bash
pm2 restart all
pm2 logs
```

**Status:** ⏳ **PENDING EXECUTION**

---

## STEP 6 — VPS FULL PIPELINE TEST

### 6.1 Run Ingestion Pipeline
**Command:**
```bash
export ADMIN_TEST_TOKEN=YOUR_PROD_TOKEN
export API_BASE_URL=https://aztekafoods.com

node scripts/run-full-ingestion-test.mjs
```

**Status:** ⏳ **PENDING EXECUTION**

### 6.2 Regenerate Single Product (VPS)
**Command:**
```bash
curl -X POST https://aztekafoods.com/api/products/PRODUCT_ID/force-regenerate \
  -H "Authorization: Bearer YOUR_PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regenerateDesign": true}'
```

**Status:** ⏳ **PENDING EXECUTION**

### 6.3 Regenerate All Products (VPS)
**Command:**
```bash
curl -X POST https://aztekafoods.com/api/products/force-regenerate-all \
  -H "Authorization: Bearer YOUR_PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize":20,"delay":2000}'
```

**Status:** ⏳ **PENDING EXECUTION**

---

## STEP 7 — LOG INSPECTION ON VPS

### 7.1 Check Ingestion Logs
```bash
tail -f logs/testing/*.log
```

### 7.2 Check Regeneration Logs
```bash
tail -f logs/regen/*.log
```

### 7.3 Check PM2 Logs
```bash
pm2 logs
```

**Status:** ⏳ **PENDING EXECUTION**

---

## VERIFICATION CHECKLIST

### Code Compilation
- ✅ `server.mjs` syntax check passed
- ✅ Test script syntax check passed
- ✅ All API routes compile successfully

### File Structure
- ✅ Test PO samples exist (`tests/po-samples/`)
- ✅ Test harness script exists (`scripts/run-full-ingestion-test.mjs`)
- ✅ Force regenerate endpoints exist
- ✅ Log directories created

### Manual Steps Required
- ⏳ Install dependencies (`npm install`)
- ⏳ Configure environment variables (`.env`)
- ⏳ Start local dev server
- ⏳ Run Prisma migrations
- ⏳ Execute test commands
- ⏳ SSH to VPS and run production tests

---

## NEXT STEPS

1. **Complete Local Setup:**
   ```bash
   cd /Users/ernestoponce/Downloads/Azteka-DSD-main
   npm install
   # Configure .env with API keys
   npm run server  # or node server.mjs
   ```

2. **Run Local Tests:**
   - Execute Step 2 commands (AI ingestion testing)
   - Execute Step 3 (full pipeline test)
   - Execute Step 4 (image regeneration)

3. **Verify Results:**
   - Check `logs/testing/` for test logs
   - Check database for created/updated products
   - Verify images in `/uploads/products/`

4. **Production Testing:**
   - SSH to VPS
   - Execute Step 5-7 commands
   - Monitor logs and verify results

---

## NOTES

- All backend code compiles successfully
- Test infrastructure is in place
- Manual execution required for:
  - Server startup
  - API key configuration
  - Database connection
  - VPS access

---

**Report Generated:** $(date)
**Status:** Ready for manual test execution

