# Full End-to-End Test Execution Guide

## 🎯 Overview

This guide provides step-by-step instructions for executing the complete end-to-end test suite for the Azteka DSD system.

**Status:** ✅ All test infrastructure is prepared and validated.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js v18+ or v22+ installed
- PostgreSQL database running
- API keys for: OpenAI, Bing Search, Remove.bg, ClipDrop, Canva (optional)
- Access to VPS (for production testing)

---

## 🔍 STEP 0: Pre-Flight Validation

Run the validation script to check your setup:

```bash
cd /Users/ernestoponce/Downloads/Azteka-DSD-main
node scripts/validate-test-setup.mjs
```

**Expected:** Most checks should pass. Warnings for missing API keys are OK if you're not testing those features.

---

## 🏠 STEP 1: LOCAL SETUP

### 1.1 Navigate to Project
```bash
cd /Users/ernestoponce/Downloads/Azteka-DSD-main
```

### 1.2 Install Dependencies

**If using root directory:**
```bash
npm install
```

**If using remote_azteka_dsd:**
```bash
cd remote_azteka_dsd
npm install
```

### 1.3 Configure Environment

Create or edit `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/azteka_dsd?schema=public"

# Server
PORT=3000
NODE_ENV=development

# API Keys (for AI features)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
BING_SEARCH_API_KEY=xxxxxxxxxxxxx
SERP_API_KEY=xxxxxxxxxxxxx
REMOVE_BG_API_KEY=xxxxxxxxxxxxx
CLIPDROP_API_KEY=xxxxxxxxxxxxx
CANVA_API_KEY=xxxxxxxxxxxxx

# Test Token
ADMIN_TEST_TOKEN=test-token-123
```

### 1.4 Setup Prisma Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Open Prisma Studio
npx prisma studio
```

### 1.5 Start Local Server

**Option A: Root server.mjs**
```bash
node server.mjs
```

**Option B: Using npm script**
```bash
npm run server
```

**Expected Output:**
```
API server listening on http://localhost:3000
```

**Keep this terminal open!**

---

## 🧪 STEP 2: LOCAL AI INGESTION TESTING

Open a **new terminal** (keep server running).

### 2.1 Test PO Ingestion

```bash
export ADMIN_TEST_TOKEN=test-token-123

curl -X POST http://localhost:3000/api/auto/ingest-po \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -F "file=@tests/po-samples/sabritas_po.csv" \
  -F "autoProcess=false"
```

**Expected Response:**
```json
{
  "success": true,
  "products": [
    {
      "product_name": "Sabritas Chips 50g",
      "sku": "SAB-50G",
      ...
    }
  ],
  "count": 5
}
```

### 2.2 Test AI Image Search

```bash
curl -X POST http://localhost:3000/api/auto/search-image \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Sabritas Chips 50g",
    "brand": "Sabritas"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://..."
}
```

**Note:** Requires `BING_SEARCH_API_KEY` or `SERP_API_KEY` in `.env`

### 2.3 Test Background Removal

**First, download an image:**
```bash
# Download a test image
curl -o test-image.jpg "IMAGE_URL_FROM_PREVIOUS_STEP"
```

**Then remove background:**
```bash
curl -X POST http://localhost:3000/api/auto/bg-remove \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -F "image=@test-image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "imageUrl": "https://aztekafoods.com/uploads/products/image_nobg.png"
}
```

**Note:** Requires `REMOVE_BG_API_KEY` or `CLIPDROP_API_KEY` in `.env`

### 2.4 Test Image Enhancement

```bash
curl -X POST http://localhost:3000/api/auto/enhance \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -F "image=@test-image.jpg" \
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

### 2.5 Test Canva Card Generation

**First, get a product ID from database or previous test:**
```bash
curl -X POST http://localhost:3000/api/design/render-product-card \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
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

**Note:** Requires `CANVA_API_KEY` in `.env`

---

## 🚀 STEP 3: LOCAL FULL PIPELINE TEST

### 3.1 Run Full Test Harness

```bash
export ADMIN_TEST_TOKEN=test-token-123
export API_BASE_URL=http://localhost:3000

node scripts/run-full-ingestion-test.mjs
```

**Expected Output:**
```
[TEST] === Testing PO Parsing: sabritas_po.csv ===
[TEST] Parsed 5 products from sabritas_po.csv
...
[TEST] ✅ Test completed successfully!
```

**Check Results:**
```bash
# View test log
cat logs/testing/$(date +%Y-%m-%d).log

# View summary
cat logs/testing/test-summary-*.json | jq
```

---

## 🔄 STEP 4: LOCAL IMAGE REGENERATION TEST

### 4.1 Regenerate Single Product

**Get a product ID first:**
```bash
# List products
curl http://localhost:3000/api/products/manage \
  -H "Authorization: Bearer $ADMIN_TEST_TOKEN" | jq '.products[0].id'
```

**Then regenerate:**
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

### 4.2 Regenerate All Products

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

**Monitor Progress:**
```bash
tail -f logs/regen/regen-*.log
```

---

## 🌐 STEP 5: VPS TESTING SETUP

### 5.1 SSH into Server

```bash
ssh root@YOUR_SERVER_IP
# Replace YOUR_SERVER_IP with actual IP (e.g., 77.243.85.8)
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
# Generate Prisma Client
npx prisma generate

# If there's a build script
npm run build
```

### 5.5 Restart PM2

```bash
pm2 restart all
pm2 logs
```

---

## 🌐 STEP 6: VPS FULL PIPELINE TEST

### 6.1 Run Ingestion Pipeline

```bash
export ADMIN_TEST_TOKEN=YOUR_PROD_TOKEN
export API_BASE_URL=https://aztekafoods.com

node scripts/run-full-ingestion-test.mjs
```

### 6.2 Regenerate Single Product (VPS)

```bash
curl -X POST https://aztekafoods.com/api/products/PRODUCT_ID/force-regenerate \
  -H "Authorization: Bearer YOUR_PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regenerateDesign": true}'
```

### 6.3 Regenerate All Products (VPS)

```bash
curl -X POST https://aztekafoods.com/api/products/force-regenerate-all \
  -H "Authorization: Bearer YOUR_PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize":20,"delay":2000}'
```

---

## 📊 STEP 7: LOG INSPECTION ON VPS

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

---

## ✅ SUCCESS CRITERIA

The system passes testing when:

- ✅ All PO files ingest successfully
- ✅ AI finds images for each product (if API keys configured)
- ✅ Backgrounds removed (if API keys configured)
- ✅ Images enhanced
- ✅ Canva cards generated (if API keys configured)
- ✅ Drafts appear in Admin UI
- ✅ Catalog UI displays updated images
- ✅ No critical errors in logs

---

## 🐛 Troubleshooting

### Server Won't Start
- Check `PORT` in `.env` (default: 3000)
- Check if port is already in use: `lsof -i :3000`
- Check database connection: `DATABASE_URL` in `.env`

### API Tests Fail
- Verify server is running: `curl http://localhost:3000/api/health`
- Check `ADMIN_TEST_TOKEN` matches server expectations
- Verify authentication middleware is working

### Image Search Fails
- Check `BING_SEARCH_API_KEY` or `SERP_API_KEY` in `.env`
- Verify API keys are valid
- Check API rate limits

### Background Removal Fails
- Check `REMOVE_BG_API_KEY` or `CLIPDROP_API_KEY` in `.env`
- Verify API keys are valid
- Check API quotas

### Database Errors
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Run migrations: `npx prisma migrate deploy`

---

## 📝 Quick Reference

### Test Files
- PO Samples: `tests/po-samples/`
- Test Script: `scripts/run-full-ingestion-test.mjs`
- Validation: `scripts/validate-test-setup.mjs`
- Local Tests: `scripts/run-local-tests.sh`

### Logs
- Test Logs: `logs/testing/YYYY-MM-DD.log`
- Regeneration Logs: `logs/regen/regen-{timestamp}.log`
- Test Summaries: `logs/testing/test-summary-{timestamp}.json`

### API Endpoints
- PO Ingestion: `POST /api/auto/ingest-po`
- Image Search: `POST /api/auto/search-image`
- BG Remove: `POST /api/auto/bg-remove`
- Enhance: `POST /api/auto/enhance`
- Match: `POST /api/auto/match-product`
- Batch: `POST /api/auto/ingest-batch`
- Regenerate: `POST /api/products/:id/force-regenerate`
- Regenerate All: `POST /api/products/force-regenerate-all`

---

## 🎯 Next Steps After Testing

1. Review test results in logs
2. Verify database changes
3. Check uploaded images
4. Test Admin UI for draft products
5. Test Catalog UI for updated images
6. Deploy to production if all tests pass

---

**Status:** ✅ **All test infrastructure ready. Execute steps manually.**

