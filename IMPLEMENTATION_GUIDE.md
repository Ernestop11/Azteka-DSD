# Product Seeding System - Implementation Guide
**Date:** 2025-11-12
**Status:** Ready for Implementation
**Est. Time:** 4-6 hours

---

## Quick Start

This guide walks you through implementing the Product Seeding System step-by-step. Follow the checklist exactly as written.

---

## Prerequisites

✅ Node.js environment running
✅ PostgreSQL database accessible
✅ Admin authentication working
✅ OpenAI API account (for AI extraction)

---

## Phase 1: Database Schema (30 minutes)

### 1.1 Run Schema Normalization

**File:** `migrations/normalize_products_schema.sql`

```bash
# SSH into VPS
ssh user@77.243.85.8

# Run normalization migration
psql $DATABASE_URL -f migrations/normalize_products_schema.sql

# Verify schema
psql $DATABASE_URL -c "
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
"
```

**Expected Output:**
- `slug` column exists (TEXT, NOT NULL)
- `image_url` column exists (TEXT)
- `category_id` column exists (UUID)
- `in_stock` column exists (BOOLEAN)
- All snake_case columns present

### 1.2 Run Product Seeding Schema

**File:** `migrations/002_product_seeding_system.sql`

```bash
# Run seeding system migration
psql $DATABASE_URL -f migrations/002_product_seeding_system.sql

# Verify new tables
psql $DATABASE_URL -c "\dt po_imports"
psql $DATABASE_URL -c "\dt product_images"
```

**Expected Output:**
- `po_imports` table created
- `product_images` table created
- `products` table has new fields: `vendor_price`, `cost_per_case`, `margin_percent`, `source`, `created_by`
- `categories` table has `slug` column
- `brands` table has `slug` column

---

## Phase 2: Backend Setup (90 minutes)

### 2.1 Install Dependencies

```bash
cd ~/Downloads/Azteka-DSD-main
npm install pdf-parse openai
```

### 2.2 Set Environment Variables

```bash
# Add to .env file
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

### 2.3 Create Uploads Directory

```bash
mkdir -p uploads/po
chmod 755 uploads/po
```

### 2.4 Create Type Definitions

**File:** `src/types/product-seeding.ts`

Copy the TypeScript interfaces from [ARCHITECTURE_PRODUCT_SEEDING.md](./ARCHITECTURE_PRODUCT_SEEDING.md) Section 3.1.

```typescript
export interface ExtractedProduct { ... }
export interface POUploadResponse { ... }
export interface ProductSeedRequest { ... }
export interface ProductSeedResponse { ... }
```

### 2.5 Create PO Upload Route

**File:** `server/routes/po-upload.ts`

Copy the complete implementation from [ARCHITECTURE_PRODUCT_SEEDING.md](./ARCHITECTURE_PRODUCT_SEEDING.md) Section 4.1.

**Key Components:**
- Multer configuration for `/uploads/po/`
- PDF parsing with `pdf-parse`
- OpenAI GPT-4 extraction
- Validation logic
- Audit trail insertion

### 2.6 Create Product Seed Route

**File:** `server/routes/product-seed.ts`

Copy the complete implementation from [ARCHITECTURE_PRODUCT_SEEDING.md](./ARCHITECTURE_PRODUCT_SEEDING.md) Section 4.2.

**Key Components:**
- Bulk product creation
- Auto-create categories/brands
- Slug generation
- Margin calculation
- Transaction management
- Socket.IO real-time updates

### 2.7 Register Routes

**File:** `server/index.ts` (or `server.mjs`)

```typescript
// Import routes
import poUploadRoutes from './routes/po-upload.js';
import productSeedRoutes from './routes/product-seed.js';

// Register routes
app.use('/api/po', poUploadRoutes);
app.use('/api/products', productSeedRoutes);
```

---

## Phase 3: Frontend Setup (60 minutes)

### 3.1 Create Seed Products Page

**File:** `src/pages/admin/SeedProducts.tsx`

Copy the complete implementation from [ARCHITECTURE_PRODUCT_SEEDING.md](./ARCHITECTURE_PRODUCT_SEEDING.md) Section 5.1.

**Key Features:**
- File upload with drag-drop
- AI extraction progress indicator
- Product preview table with validation
- Bulk confirm and create
- Results summary

### 3.2 Add Route

**File:** `src/main.tsx`

```typescript
import SeedProducts from './pages/admin/SeedProducts';

// Add to routes
<Route path="/admin/seed" element={<SeedProducts />} />
```

### 3.3 Add Navigation Link

**File:** `src/components/AdminNav.tsx` (or equivalent)

```tsx
<Link to="/admin/seed" className="nav-link">
  🌱 Seed Products
</Link>
```

---

## Phase 4: Testing (45 minutes)

### 4.1 Prepare Test Data

Create a test PO document (PDF) with sample products:

```
PURCHASE ORDER #12345
Date: 2025-11-12
Supplier: Test Wholesale Inc.

ITEM LIST:
1. Takis Fuego (SKU-TAKIS-001) - $24.99 per case - 12 units/case
2. Doritos Nacho (SKU-DOR-NACHO) - $28.50 per case - 10 units/case
3. Cheetos Flamin Hot (SKU-CHET-FH) - $26.00 per case - 8 units/case
```

### 4.2 Test Upload Flow

1. Navigate to `/admin/seed`
2. Upload test PO PDF
3. Click "Extract Products"
4. **Verify:** AI extracts 3 products
5. **Verify:** Validation shows all products valid

### 4.3 Test Seeding Flow

1. Review extracted products
2. Click "Confirm & Create Products"
3. **Verify:** 3 products created successfully
4. **Verify:** Categories auto-created (e.g., "Snacks")
5. **Verify:** Brands auto-created (e.g., "Takis", "Doritos", "Cheetos")

### 4.4 Verify Database

```sql
-- Check created products
SELECT name, sku, price, source FROM products
WHERE source = 'po_import'
ORDER BY created_at DESC LIMIT 10;

-- Check PO import audit
SELECT filename, products_created, created_at FROM po_imports
ORDER BY created_at DESC LIMIT 5;

-- Check auto-created categories
SELECT name, slug FROM categories
WHERE description LIKE '%Auto-created%';

-- Check auto-created brands
SELECT name, slug FROM brands
WHERE description LIKE '%Auto-created%';
```

### 4.5 Test Error Handling

**Invalid SKU Test:**
- Upload PO with duplicate SKU
- **Verify:** Error shows in results

**Missing Required Fields:**
- Upload PO with missing product name
- **Verify:** Validation shows error

**Large File Test:**
- Upload 10MB+ PDF
- **Verify:** Upload completes or shows size error

---

## Phase 5: Production Deployment (30 minutes)

### 5.1 Environment Check

```bash
# Verify environment variables
echo $OPENAI_API_KEY
echo $DATABASE_URL

# Verify uploads directory
ls -la uploads/po/
```

### 5.2 Restart Server

```bash
# Stop server
pm2 stop azteka-api

# Run migrations (if not done)
psql $DATABASE_URL -f migrations/normalize_products_schema.sql
psql $DATABASE_URL -f migrations/002_product_seeding_system.sql

# Start server
pm2 start azteka-api
pm2 logs azteka-api
```

### 5.3 Verify Logs

```bash
# Check for errors
pm2 logs azteka-api --lines 100 | grep -i error

# Monitor real-time
pm2 logs azteka-api --lines 0
```

---

## Troubleshooting

### Issue: "OpenAI API key not found"

**Fix:**
```bash
# Add to .env
OPENAI_API_KEY=sk-proj-...

# Restart server
pm2 restart azteka-api
```

### Issue: "Cannot find module 'pdf-parse'"

**Fix:**
```bash
npm install pdf-parse openai
pm2 restart azteka-api
```

### Issue: "ENOENT: no such file or directory, open '/uploads/po/...'"

**Fix:**
```bash
mkdir -p uploads/po
chmod 755 uploads/po
```

### Issue: "relation 'po_imports' does not exist"

**Fix:**
```bash
psql $DATABASE_URL -f migrations/002_product_seeding_system.sql
```

### Issue: "column 'slug' does not exist"

**Fix:**
```bash
psql $DATABASE_URL -f migrations/normalize_products_schema.sql
```

### Issue: "AI extraction returns empty array"

**Debug:**
```typescript
// Add logging to server/routes/po-upload.ts
console.log('Extracted PDF text:', extractedText);
console.log('AI response:', content);
```

---

## Success Criteria

✅ **Schema Normalized:** All snake_case columns exist
✅ **PO Upload Works:** Can upload PDF and extract products
✅ **AI Extraction Works:** OpenAI returns valid product JSON
✅ **Product Creation Works:** Products saved to database
✅ **Auto-Creation Works:** Categories and brands created automatically
✅ **Audit Trail Works:** PO imports logged to `po_imports` table
✅ **Real-time Updates:** Socket.IO emits `products-updated` event
✅ **Error Handling:** Invalid data shows errors, doesn't crash

---

## Next Steps After Implementation

1. **Upload Real Product Images**
   - Use Admin panel `/admin` to upload images for seeded products
   - Update `image_url` field manually or via bulk upload

2. **Fine-tune AI Extraction**
   - Adjust OpenAI prompt based on PO formats
   - Add custom validation rules
   - Map supplier-specific SKU formats

3. **Add OCR Support** (Future)
   - Install `tesseract.js`
   - Support image-based PO documents

4. **Add Bulk Image Upload** (Future)
   - Match images to SKUs
   - Auto-associate with products

5. **Add CSV Import** (Future)
   - Support Excel/CSV price lists
   - Column mapping UI

---

## Support

- **Architecture:** See [ARCHITECTURE_PRODUCT_SEEDING.md](./ARCHITECTURE_PRODUCT_SEEDING.md)
- **Schema Audit:** See [migrations/SCHEMA_AUDIT_REPORT.md](./migrations/SCHEMA_AUDIT_REPORT.md)
- **API Endpoints:** POST `/api/po/upload`, POST `/api/products/seed`
- **Database:** PostgreSQL at `77.243.85.8`

---

**End of Implementation Guide**

Last Updated: 2025-11-12
