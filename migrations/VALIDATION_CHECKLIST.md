# ✅ POST-MIGRATION VALIDATION CHECKLIST

**Migration:** 003_product_seeding_enhancements  
**Date:** 2025-11-12  
**Validator:** ________________  
**Completion Time:** ________________

---

## 🔍 PHASE 1: STRUCTURE VERIFICATION

### **1.1 New Columns in Product Table**

Run this query to verify all new columns:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'Product' 
  AND table_schema = 'public'
  AND column_name IN (
    'vendorPrice', 
    'costPerCase', 
    'marginPercent', 
    'shortDescription', 
    'backgroundGradient', 
    'source', 
    'createdBy', 
    'importBatchId', 
    'slug'
)
ORDER BY column_name;
```

**Expected Results:**

| Column | Data Type | Nullable | Default |
|--------|-----------|----------|---------|
| `backgroundGradient` | text | YES | NULL |
| `costPerCase` | numeric(10,2) | YES | NULL |
| `createdBy` | text | YES | NULL |
| `importBatchId` | text | YES | NULL |
| `marginPercent` | numeric(5,2) | YES | NULL |
| `shortDescription` | text | YES | NULL |
| `slug` | text | NO | NULL |
| `source` | ProductSource | YES | 'manual' |
| `vendorPrice` | numeric(10,2) | YES | NULL |

- [ ] All 9 columns present
- [ ] Data types match expected
- [ ] Nullability correct
- [ ] Defaults set properly

---

### **1.2 Product Table Constraints**

```sql
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public."Product"'::regclass
  AND conname IN (
    'Product_slug_key',
    'Product_price_positive',
    'Product_stock_nonnegative',
    'Product_minStock_positive',
    'Product_unitsPerCase_positive'
)
ORDER BY conname;
```

**Expected Constraints:**

- [ ] `Product_slug_key` UNIQUE (slug)
- [ ] `Product_price_positive` CHECK (price > 0)
- [ ] `Product_stock_nonnegative` CHECK (stock >= 0)
- [ ] `Product_minStock_positive` CHECK (minStock > 0)
- [ ] `Product_unitsPerCase_positive` CHECK (unitsPerCase > 0)

---

### **1.3 Brand Table - Slug Column**

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Brand' 
  AND table_schema = 'public'
  AND column_name = 'slug';

-- Check unique constraint
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'public."Brand"'::regclass 
  AND conname = 'Brand_slug_key';
```

- [ ] `Brand.slug` column exists (TEXT, NOT NULL)
- [ ] `Brand_slug_key` UNIQUE constraint exists
- [ ] All existing brands have slugs populated

**Verify slug population:**
```sql
SELECT COUNT(*) as total, COUNT(slug) as with_slug 
FROM "Brand";
```
- [ ] total = with_slug (all brands have slugs)

---

### **1.4 POImport Table**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'POImport' 
  AND table_schema = 'public';

-- Count columns
SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'POImport' 
  AND table_schema = 'public';
```

- [ ] POImport table exists
- [ ] Has 13 columns (id, filename, uploadedBy, status, totalRows, successCount, errorCount, skippedCount, errors, metadata, createdAt, updatedAt, completedAt)

**Verify indexes:**
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'POImport' 
  AND schemaname = 'public';
```

- [ ] `POImport_status_idx` exists
- [ ] `POImport_createdAt_idx` exists

---

### **1.5 ProductImage Table**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'ProductImage' 
  AND table_schema = 'public';

SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'ProductImage' 
  AND table_schema = 'public';
```

- [ ] ProductImage table exists
- [ ] Has 8 columns

**Check foreign key:**
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public."ProductImage"'::regclass 
  AND contype = 'f';
```

- [ ] `ProductImage_productId_fkey` exists → References Product(id)

---

## 🔗 PHASE 2: RELATIONSHIPS & FOREIGN KEYS

### **2.1 Product Foreign Keys**

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public."Product"'::regclass
  AND contype = 'f'
  AND conname IN (
    'Product_createdBy_fkey',
    'Product_importBatchId_fkey'
)
ORDER BY conname;
```

- [ ] `Product_createdBy_fkey` → User(id)
- [ ] `Product_importBatchId_fkey` → POImport(id)

---

### **2.2 PurchaseOrder Foreign Key**

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'PurchaseOrder' 
  AND column_name = 'importId';

SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'public."PurchaseOrder"'::regclass 
  AND conname = 'PurchaseOrder_importId_fkey';
```

- [ ] `PurchaseOrder.importId` column exists
- [ ] `PurchaseOrder_importId_fkey` → POImport(id)

---

## 📊 PHASE 3: DATA INTEGRITY

### **3.1 Product Slugs Populated**

```sql
SELECT 
    COUNT(*) as total_products,
    COUNT(slug) as products_with_slug,
    COUNT(*) - COUNT(slug) as missing_slugs
FROM "Product";
```

- [ ] `missing_slugs` = 0 (all products have slugs)

**Check for duplicate slugs:**
```sql
SELECT slug, COUNT(*) 
FROM "Product" 
GROUP BY slug 
HAVING COUNT(*) > 1;
```

- [ ] Returns 0 rows (no duplicates)

---

### **3.2 Brand Slugs Populated**

```sql
SELECT 
    COUNT(*) as total_brands,
    COUNT(slug) as brands_with_slug
FROM "Brand";
```

- [ ] All brands have slugs

**Check for duplicate brand slugs:**
```sql
SELECT slug, COUNT(*) 
FROM "Brand" 
GROUP BY slug 
HAVING COUNT(*) > 1;
```

- [ ] Returns 0 rows (no duplicates)

---

### **3.3 ProductImage Migration**

```sql
-- Count products with imageUrl
SELECT COUNT(*) as products_with_images
FROM "Product" 
WHERE "imageUrl" IS NOT NULL AND "imageUrl" != '';

-- Count migrated images
SELECT COUNT(*) as migrated_images
FROM "ProductImage";
```

- [ ] `migrated_images` ≥ `products_with_images` (images migrated successfully)

**Verify primary images:**
```sql
SELECT COUNT(*) 
FROM "ProductImage" 
WHERE "isPrimary" = true;
```

- [ ] Count matches products with images

---

## ⚙️ PHASE 4: FUNCTIONS & TRIGGERS

### **4.1 Margin Calculator Function**

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'calculate_margin_percent';
```

- [ ] Function exists

**Test function:**
```sql
SELECT calculate_margin_percent(100, 75); -- Should return 33.33
SELECT calculate_margin_percent(50, 40);  -- Should return 25.00
SELECT calculate_margin_percent(100, 0);  -- Should return NULL
```

- [ ] Returns correct values

---

### **4.2 Auto-Margin Trigger**

```sql
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'trigger_update_product_margin';
```

- [ ] Trigger exists

**Test trigger:**
```sql
-- Create test product
INSERT INTO "Product" (
    id, name, sku, price, cost, "inStock"
) VALUES (
    'test-margin-001', 'Test Product', 'TEST-001', 100, 75, true
);

-- Check margin was auto-calculated
SELECT "marginPercent" 
FROM "Product" 
WHERE id = 'test-margin-001';
-- Expected: 33.33

-- Update price
UPDATE "Product" 
SET price = 120 
WHERE id = 'test-margin-001';

-- Check margin recalculated
SELECT "marginPercent" 
FROM "Product" 
WHERE id = 'test-margin-001';
-- Expected: 60.00

-- Cleanup
DELETE FROM "Product" WHERE id = 'test-margin-001';
```

- [ ] Margin calculated on INSERT
- [ ] Margin recalculated on UPDATE

---

## 📈 PHASE 5: PERFORMANCE INDEXES

### **5.1 Product Indexes**

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'Product' 
  AND schemaname = 'public'
  AND indexname LIKE '%_idx'
ORDER BY indexname;
```

**Expected Indexes:**

- [ ] `Product_brandId_idx`
- [ ] `Product_categoryId_idx`
- [ ] `Product_createdBy_idx`
- [ ] `Product_featured_idx`
- [ ] `Product_importBatchId_idx`
- [ ] `Product_inStock_idx`
- [ ] `Product_source_idx`

---

### **5.2 Index Usage Verification**

```sql
-- Explain plan should use index
EXPLAIN SELECT * FROM "Product" WHERE source = 'manual';
EXPLAIN SELECT * FROM "Product" WHERE featured = true;
EXPLAIN SELECT * FROM "Product" WHERE "brandId" = 'some-brand-id';
```

- [ ] Query plans show index scans (not sequential scans)

---

## 🧪 PHASE 6: FUNCTIONAL TESTING

### **6.1 Insert New Product with All Fields**

```sql
INSERT INTO "Product" (
    id, name, sku, slug, price, cost, "costPerCase", "vendorPrice",
    description, "shortDescription", "backgroundColor", "backgroundGradient",
    "unitType", "unitsPerCase", "inStock", source, "createdBy"
) VALUES (
    'test-product-001',
    'Test Product Full',
    'TEST-FULL-001',
    'test-product-full',
    100.00,
    75.00,
    70.00,
    65.00,
    'Full description here',
    'Short summary',
    '#FF5733',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'case',
    12,
    true,
    'manual',
    'admin-user-id'
);

-- Verify insert
SELECT * FROM "Product" WHERE id = 'test-product-001';
```

- [ ] Insert succeeds
- [ ] All fields populated correctly
- [ ] `marginPercent` auto-calculated

**Cleanup:**
```sql
DELETE FROM "Product" WHERE id = 'test-product-001';
```

---

### **6.2 Create POImport Record**

```sql
INSERT INTO "POImport" (
    id, filename, "uploadedBy", status, "totalRows", "successCount"
) VALUES (
    'test-import-001',
    'test_po.csv',
    'admin-user-id',
    'completed',
    10,
    10
);

-- Verify
SELECT * FROM "POImport" WHERE id = 'test-import-001';
```

- [ ] Insert succeeds
- [ ] Timestamps populated

**Cleanup:**
```sql
DELETE FROM "POImport" WHERE id = 'test-import-001';
```

---

### **6.3 Add ProductImage**

```sql
-- Find a product with an image
SELECT id FROM "Product" WHERE "imageUrl" IS NOT NULL LIMIT 1;

-- Add secondary image
INSERT INTO "ProductImage" (
    id, "productId", url, "altText", "isPrimary", "displayOrder"
) VALUES (
    'test-image-001',
    '<product-id-from-above>',
    'https://example.com/image2.jpg',
    'Secondary image',
    false,
    1
);

-- Verify
SELECT * FROM "ProductImage" WHERE id = 'test-image-001';
```

- [ ] Insert succeeds
- [ ] Foreign key validated

**Cleanup:**
```sql
DELETE FROM "ProductImage" WHERE id = 'test-image-001';
```

---

## 🔒 PHASE 7: CONSTRAINT VALIDATION

### **7.1 Test CHECK Constraints**

```sql
-- Should FAIL: negative price
INSERT INTO "Product" (id, name, sku, price, "inStock")
VALUES ('test-fail-1', 'Test', 'FAIL-1', -10, true);

-- Should FAIL: negative stock
INSERT INTO "Product" (id, name, sku, price, stock, "inStock")
VALUES ('test-fail-2', 'Test', 'FAIL-2', 10, -5, true);

-- Should FAIL: zero minStock
INSERT INTO "Product" (id, name, sku, price, "minStock", "inStock")
VALUES ('test-fail-3', 'Test', 'FAIL-3', 10, 0, true);

-- Should FAIL: zero unitsPerCase
INSERT INTO "Product" (id, name, sku, price, "unitsPerCase", "inStock")
VALUES ('test-fail-4', 'Test', 'FAIL-4', 10, 0, true);
```

- [ ] All 4 inserts fail with constraint violations

---

### **7.2 Test UNIQUE Constraints**

```sql
-- Get existing slug
SELECT slug FROM "Product" LIMIT 1;

-- Should FAIL: duplicate product slug
INSERT INTO "Product" (id, name, sku, slug, price, "inStock")
VALUES ('test-dup-1', 'Test', 'DUP-1', '<existing-slug>', 10, true);
```

- [ ] Insert fails with unique violation

---

## 📝 PHASE 8: DOCUMENTATION

- [ ] Migration notes documented in changelog
- [ ] Schema diagram updated (if applicable)
- [ ] API documentation updated for new fields
- [ ] Frontend team notified of new fields

---

## ✅ FINAL SIGN-OFF

### **Summary Statistics**

```sql
-- Product table stats
SELECT 
    'Product' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT "brandId") as unique_brands,
    COUNT(DISTINCT "categoryId") as unique_categories,
    COUNT(*) FILTER (WHERE source = 'manual') as manual_entries,
    COUNT(*) FILTER (WHERE source = 'po_import') as po_imports
FROM "Product";

-- POImport stats
SELECT 
    'POImport' as table_name,
    COUNT(*) as total_imports,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM "POImport";

-- ProductImage stats
SELECT 
    'ProductImage' as table_name,
    COUNT(*) as total_images,
    COUNT(DISTINCT "productId") as products_with_images,
    COUNT(*) FILTER (WHERE "isPrimary" = true) as primary_images
FROM "ProductImage";
```

---

### **Validation Complete**

- [ ] All structure checks passed
- [ ] All relationships verified
- [ ] All data migrated correctly
- [ ] All functions/triggers working
- [ ] All constraints enforced
- [ ] Performance indexes created
- [ ] Functional tests passed

**Validated By:** ________________  
**Date/Time:** ________________  
**Database:** azteka_dsd  
**PostgreSQL Version:** ________________

**Status:** ✅ READY FOR PRODUCTION

---

## 🚨 ISSUES FOUND (if any)

| Issue # | Description | Severity | Resolution | Status |
|---------|-------------|----------|------------|--------|
| | | | | |
| | | | | |

---

## 📞 ESCALATION

If validation fails, contact:
- **DBA Team:** [contact info]
- **DevOps:** [contact info]
- **Lead Developer:** [contact info]
