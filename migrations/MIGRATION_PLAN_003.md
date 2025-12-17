# 📋 PRODUCT SEEDING DATABASE MIGRATION PLAN

**Migration ID:** 003  
**Date:** November 12, 2025  
**Status:** Ready for Execution  
**Database:** azteka_dsd (PostgreSQL)

---

## 🎯 OBJECTIVES

Enable comprehensive Product Seeding functionality with:
- ✅ PO/CSV import tracking
- ✅ Multi-source product origins (manual, import, API, QuickBooks)
- ✅ Enhanced pricing fields (vendor price, cost per case, margins)
- ✅ Multi-image support per product
- ✅ User attribution tracking
- ✅ Data quality constraints

---

## 📊 CURRENT SCHEMA ANALYSIS

### ✅ **Tables Present**
| Table | Status | Notes |
|-------|--------|-------|
| Product | ✅ Exists | 24 columns, needs enhancements |
| Brand | ✅ Exists | Missing slug column |
| Category | ✅ Exists | ✅ Already has unique slug |
| PurchaseOrder | ✅ Exists | Basic structure present |
| PurchaseOrderItem | ✅ Exists | Links PO to products |
| User | ✅ Exists | For createdBy references |

### ❌ **Tables Missing**
| Table | Purpose | Priority |
|-------|---------|----------|
| POImport | Track import batches | 🔴 HIGH |
| ProductImage | Multi-image support | 🟡 MEDIUM |

---

## 🔧 REQUIRED FIELD ADDITIONS

### **Product Table - Missing Fields**

| Field | Type | Default | Purpose | Status |
|-------|------|---------|---------|--------|
| `vendorPrice` | NUMERIC(10,2) | NULL | Wholesale cost from vendor | ❌ Missing |
| `costPerCase` | NUMERIC(10,2) | NULL | Total cost per case/unit | ❌ Missing |
| `marginPercent` | NUMERIC(5,2) | NULL | Profit margin % (rename from margin) | ⚠️ Rename |
| `shortDescription` | TEXT | NULL | Brief summary for cards | ❌ Missing |
| `backgroundGradient` | TEXT | NULL | CSS gradient for cards | ❌ Missing |
| `source` | ENUM | 'manual' | Origin: manual/po_import/api/quickbooks | ❌ Missing |
| `createdBy` | TEXT | NULL | User ID who created product | ❌ Missing |
| `importBatchId` | TEXT | NULL | Reference to POImport.id | ❌ Missing |
| `slug` | TEXT | NULL → NOT NULL | URL-friendly identifier | ❌ Missing |

### **Product Table - Already Present** ✅
- `unitType` (default: 'case')
- `unitsPerCase` (default: 1)
- `backgroundColor` (default: '#f3f4f6')
- `cost` (NUMERIC(10,2))
- `margin` (NUMERIC(5,2)) → will rename to `marginPercent`

### **Brand Table - Missing Fields**

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `slug` | TEXT UNIQUE | URL-friendly brand identifier | ❌ Missing |

### **Category Table** ✅
- Already has `slug` with UNIQUE constraint - **No action needed**

---

## 🆕 NEW TABLES TO CREATE

### **1. POImport Table**
Tracks all product import batches from POs, CSVs, or API syncs.

**Columns:**
- `id` (TEXT, PK)
- `filename` (TEXT, NOT NULL)
- `uploadedBy` (TEXT) → FK to User.id
- `status` (TEXT) → 'pending', 'processing', 'completed', 'failed', 'partial'
- `totalRows` (INTEGER)
- `successCount` (INTEGER)
- `errorCount` (INTEGER)
- `skippedCount` (INTEGER)
- `errors` (JSONB) → Array of error details
- `metadata` (JSONB) → Supplier, PO#, notes
- `createdAt`, `updatedAt`, `completedAt`

**Indexes:**
- `status` (for filtering)
- `createdAt DESC` (for sorting)

---

### **2. ProductImage Table**
Supports multiple images per product with ordering.

**Columns:**
- `id` (TEXT, PK)
- `productId` (TEXT, NOT NULL, FK) → Product.id
- `url` (TEXT, NOT NULL)
- `altText` (TEXT)
- `isPrimary` (BOOLEAN, default: false)
- `displayOrder` (INTEGER, default: 0)
- `createdAt`, `updatedAt`

**Indexes:**
- `productId` (for lookups)

**Migration:**
- Migrate existing `Product.imageUrl` to ProductImage with `isPrimary=true`

---

## 🔗 CONSTRAINTS & RELATIONSHIPS

### **New Foreign Keys**
1. `Product.createdBy` → `User.id` (SET NULL on delete)
2. `Product.importBatchId` → `POImport.id` (SET NULL on delete)
3. `PurchaseOrder.importId` → `POImport.id` (SET NULL on delete)
4. `ProductImage.productId` → `Product.id` (CASCADE on delete)

### **New Unique Constraints**
1. `Product.slug` → UNIQUE
2. `Brand.slug` → UNIQUE
3. `Category.slug` → UNIQUE ✅ (already exists)

### **Check Constraints**
1. `Product.price > 0`
2. `Product.stock >= 0`
3. `Product.minStock > 0`
4. `Product.unitsPerCase > 0`

---

## 🔄 DATA MIGRATIONS

### **Auto-Generate Slugs**
```sql
-- Product slugs from SKU
UPDATE Product SET slug = LOWER(REGEXP_REPLACE(sku, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Brand slugs from name
UPDATE Brand SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
```

### **Migrate Existing Images**
```sql
-- Move Product.imageUrl to ProductImage table
INSERT INTO ProductImage (id, productId, url, isPrimary, displayOrder)
SELECT gen_random_uuid()::text, id, imageUrl, true, 0
FROM Product
WHERE imageUrl IS NOT NULL AND imageUrl != '';
```

### **Rename Column**
```sql
-- Rename margin to marginPercent for clarity
ALTER TABLE Product RENAME COLUMN margin TO marginPercent;
```

---

## ⚡ HELPER FUNCTIONS & TRIGGERS

### **1. Margin Calculator Function**
```sql
CREATE FUNCTION calculate_margin_percent(price NUMERIC, cost NUMERIC) 
RETURNS NUMERIC
```
Calculates `((price - cost) / cost * 100)` rounded to 2 decimals.

### **2. Auto-Update Margin Trigger**
```sql
CREATE TRIGGER trigger_update_product_margin
BEFORE INSERT OR UPDATE ON Product
FOR EACH ROW EXECUTE FUNCTION update_product_margin();
```
Automatically recalculates `marginPercent` when price or cost changes.

---

## 📍 PERFORMANCE INDEXES

New indexes to optimize common queries:

```sql
Product.source
Product.createdBy
Product.importBatchId
Product.brandId
Product.categoryId
Product.featured
Product.inStock
POImport.status
POImport.createdAt DESC
ProductImage.productId
```

---

## 🚀 EXECUTION PLAN

### **Pre-Migration Checks**
- [ ] Backup database: `pg_dump azteka_dsd > backup_$(date +%Y%m%d).sql`
- [ ] Verify current schema version
- [ ] Check for active transactions
- [ ] Estimate migration time (~2-5 minutes)

### **Execution Steps**
1. Connect to database as postgres user
2. Run migration: `psql azteka_dsd < 003_product_seeding_enhancements.sql`
3. Verify completion messages
4. Run validation checks (see checklist below)

### **Rollback Plan**
If migration fails:
```sql
-- Drop new tables
DROP TABLE IF EXISTS POImport CASCADE;
DROP TABLE IF EXISTS ProductImage CASCADE;

-- Drop new columns
ALTER TABLE Product DROP COLUMN IF EXISTS vendorPrice;
ALTER TABLE Product DROP COLUMN IF EXISTS costPerCase;
ALTER TABLE Product DROP COLUMN IF EXISTS shortDescription;
-- ... (continue for all new columns)

-- Restore from backup
psql azteka_dsd < backup_YYYYMMDD.sql
```

---

## ✅ POST-MIGRATION VALIDATION CHECKLIST

See: `VALIDATION_CHECKLIST.md`

---

## 📌 NOTES

1. **Backward Compatibility:** All new columns are nullable initially
2. **Zero Downtime:** Migration uses `IF NOT EXISTS` checks
3. **Idempotent:** Can be run multiple times safely
4. **Index Creation:** Uses `IF NOT EXISTS` to avoid conflicts
5. **Constraint Naming:** Follows Prisma naming conventions

---

## 🔗 RELATED FILES

- Migration SQL: `migrations/003_product_seeding_enhancements.sql`
- Validation: `migrations/VALIDATION_CHECKLIST.md`
- Rollback: `migrations/rollback_003.sql` (optional)

---

## 📞 SUPPORT

**DBA Contact:** DevOps Team  
**Estimated Duration:** 2-5 minutes  
**Risk Level:** 🟢 LOW (additive changes only)  
**Tested On:** PostgreSQL 14+
