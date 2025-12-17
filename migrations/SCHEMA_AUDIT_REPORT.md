# DATABASE SCHEMA AUDIT REPORT
**Generated:** 2025-11-12
**Database:** PostgreSQL (Azteka DSD)
**Table:** `products`

---

## Executive Summary

The database currently uses **camelCase** naming convention (e.g., `imageUrl`, `createdAt`), while the specification and backend code expect **snake_case** naming (e.g., `image_url`, `created_at`).

**Status:** ⚠️ Schema normalization required

---

## Current Schema (Actual Database)

Based on API response analysis, the following fields exist:

| Field Name | Type | Value Example |
|------------|------|---------------|
| `id` | UUID | `c6762c83-70c4-4b19-b79b-2c86b924f3ed` |
| `name` | TEXT | `Churrumaiz Regular` |
| `sku` | TEXT | `SKU-TAKIS-FUEGO3` |
| `price` | TEXT/NUMERIC | `32.99` |
| `description` | TEXT | `Spicy rolled tortilla chips` |
| `imageUrl` ⚠️ | TEXT | `http://77.243.85.8:3000/uploads/...` |
| `categoryId` ⚠️ | UUID | `null` |
| `brandId` ⚠️ | UUID | `null` |
| `subcategoryId` ⚠️ | UUID | `null` |
| `inStock` ⚠️ | BOOLEAN | `true` |
| `createdAt` ⚠️ | TIMESTAMPTZ | `2025-11-12T17:09:27.785Z` |
| `updatedAt` ⚠️ | TIMESTAMPTZ | `2025-11-12T20:16:08.113Z` |
| `featured` | BOOLEAN | `true` |
| `backgroundColor` ⚠️ | TEXT | `#DC2626` |
| `unitType` ⚠️ | TEXT | `case` |
| `unitsPerCase` ⚠️ | INTEGER | `11` |
| `minOrderQty` ⚠️ | INTEGER | `1` |
| `stock` | INTEGER | `75` |
| `minStock` | INTEGER | `10` |
| `margin` | TEXT | `100` |
| `cost` | NUMERIC | `null` |
| `supplier` | TEXT | `Default Supplier` |
| `isHidden` | BOOLEAN | `false` |
| `businessModes` | JSONB | `[]` |

⚠️ = **Naming convention mismatch (camelCase instead of snake_case)**

---

## Required Schema (Specification)

According to the specification and server.mjs code:

### Core Fields (Required)
```sql
id                    UUID PRIMARY KEY
name                  TEXT NOT NULL
slug                  TEXT NOT NULL              -- ❌ MISSING
sku                   TEXT NOT NULL UNIQUE
price                 NUMERIC NOT NULL
description           TEXT
category_id           UUID                       -- ⚠️ Exists as categoryId
image_url             TEXT                       -- ⚠️ Exists as imageUrl
in_stock              BOOLEAN DEFAULT TRUE       -- ⚠️ Exists as inStock
```

### Extended Fields (Frontend Requirements)
```sql
brand_id              UUID                       -- ⚠️ Exists as brandId
subcategory_id        UUID                       -- ⚠️ Exists as subcategoryId
background_color      TEXT DEFAULT '#f3f4f6'     -- ⚠️ Exists as backgroundColor
background_gradient   TEXT                       -- ❌ MISSING
unit_type             TEXT DEFAULT 'case'        -- ⚠️ Exists as unitType
units_per_case        INTEGER DEFAULT 1          -- ⚠️ Exists as unitsPerCase
min_order_quantity    INTEGER DEFAULT 1          -- ⚠️ Exists as minOrderQty
featured              BOOLEAN DEFAULT FALSE      -- ✅ EXISTS
created_at            TIMESTAMPTZ DEFAULT NOW()  -- ⚠️ Exists as createdAt
updated_at            TIMESTAMPTZ DEFAULT NOW()  -- ⚠️ Exists as updatedAt
```

---

## Issues Found

### 1. Naming Convention Mismatch
**Severity:** HIGH
**Impact:** Backend code expecting snake_case will fail to find columns

**Affected Columns:**
- `imageUrl` → should be `image_url`
- `categoryId` → should be `category_id`
- `brandId` → should be `brand_id`
- `subcategoryId` → should be `subcategory_id`
- `inStock` → should be `in_stock`
- `createdAt` → should be `created_at`
- `updatedAt` → should be `updated_at`
- `backgroundColor` → should be `background_color`
- `unitType` → should be `unit_type`
- `unitsPerCase` → should be `units_per_case`
- `minOrderQty` → should be `min_order_quantity`

### 2. Missing Required Fields
**Severity:** MEDIUM

- `slug` - Required by specification, used for URLs
- `background_gradient` - Used by frontend ProductCard component

### 3. Type Inconsistency
**Severity:** LOW

- `price` may be stored as TEXT instead of NUMERIC in some records

### 4. Missing Constraints
**Severity:** MEDIUM

- No UNIQUE constraint on `sku`
- No foreign key constraints on `category_id`, `brand_id`, `subcategory_id`
- No NOT NULL constraints on required fields

### 5. Extra Fields Not in Specification
**Severity:** LOW (Information only)

These fields exist but aren't in the specification:
- `stock` - Current inventory count
- `minStock` - Minimum stock threshold
- `margin` - Profit margin percentage
- `cost` - Product cost price
- `supplier` - Supplier name
- `isHidden` - Hide from catalog flag
- `businessModes` - Business mode associations

---

## Migration Strategy

### Phase 1: Add snake_case Columns (Non-Breaking)
**Status:** ✅ Migration script ready

This phase adds snake_case columns alongside existing camelCase columns:
- Adds missing `slug` column
- Adds snake_case aliases for all camelCase columns
- Copies data from camelCase to snake_case columns
- Adds constraints and indexes
- Sets up `updated_at` trigger

**File:** `migrations/normalize_products_schema.sql`

**Impact:**
- ✅ Zero downtime
- ✅ Backward compatible
- ✅ Both naming conventions work simultaneously

### Phase 2: Update API Code (Required)
**Status:** ⚠️ Pending

Update server.mjs and all API endpoints to use snake_case:
- Line 95: `SELECT` queries
- Line 348: `INSERT` queries
- Line 409: `UPDATE` queries
- All other product-related queries

### Phase 3: Drop camelCase Columns (Breaking)
**Status:** 🔴 Not included (optional)

Only after Phase 2 is complete and tested:
```sql
-- DO NOT RUN until all code uses snake_case
ALTER TABLE products DROP COLUMN "imageUrl";
ALTER TABLE products DROP COLUMN "categoryId";
-- ... etc
```

---

## How to Apply Migration

### Option 1: Via psql (Recommended)
```bash
# On the VPS server
psql $DATABASE_URL -f migrations/normalize_products_schema.sql
```

### Option 2: Via SQL client
```bash
# Copy the SQL file to the server
scp migrations/normalize_products_schema.sql user@77.243.85.8:/tmp/

# SSH into server
ssh user@77.243.85.8

# Run migration
psql $DATABASE_URL -f /tmp/normalize_products_schema.sql
```

### Option 3: Via Node.js
```javascript
import { pool } from './db.js';
import fs from 'fs';

const sql = fs.readFileSync('./migrations/normalize_products_schema.sql', 'utf8');
await pool.query(sql);
console.log('✅ Migration complete');
```

---

## Validation

After running the migration, verify the schema:

```sql
-- Check all columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'products'::regclass;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products';

-- Verify data migration
SELECT
    COUNT(*) as total_products,
    COUNT(slug) as with_slug,
    COUNT(image_url) as with_image_url,
    COUNT(category_id) as with_category_id
FROM products;
```

---

## Rollback Plan

The migration is **additive only** - it doesn't drop any columns. To rollback:

```sql
-- Remove snake_case columns (keeps camelCase originals)
BEGIN;

ALTER TABLE products DROP COLUMN IF EXISTS slug;
ALTER TABLE products DROP COLUMN IF EXISTS image_url;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
ALTER TABLE products DROP COLUMN IF EXISTS brand_id;
ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;
ALTER TABLE products DROP COLUMN IF EXISTS in_stock;
ALTER TABLE products DROP COLUMN IF EXISTS created_at;
ALTER TABLE products DROP COLUMN IF EXISTS updated_at;
ALTER TABLE products DROP COLUMN IF EXISTS background_color;
ALTER TABLE products DROP COLUMN IF EXISTS background_gradient;
ALTER TABLE products DROP COLUMN IF EXISTS unit_type;
ALTER TABLE products DROP COLUMN IF EXISTS units_per_case;
ALTER TABLE products DROP COLUMN IF EXISTS min_order_quantity;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP FUNCTION IF EXISTS update_updated_at_column();

COMMIT;
```

---

## Next Steps

1. ✅ **Review migration SQL** - `migrations/normalize_products_schema.sql`
2. ⏳ **Backup database** - Create snapshot before migration
3. ⏳ **Run migration** - Execute SQL on database
4. ⏳ **Validate** - Check schema and data integrity
5. ⏳ **Update API code** - Modify server.mjs to use snake_case
6. ⏳ **Test thoroughly** - Verify all endpoints work
7. ⏳ **Deploy** - Restart API server
8. ⏳ **Monitor** - Check logs for errors

---

## Impact Assessment

### ✅ Safe to Run
- Migration is idempotent (can run multiple times)
- No data loss
- No downtime
- Backward compatible

### ⚠️ Post-Migration Required
- API code must be updated to use snake_case columns
- Frontend already uses correct names via type mapping

### 🔴 Breaking Changes (None)
- This migration introduces no breaking changes
- Both naming conventions will work until Phase 3

---

## Contact

For questions or issues with this migration:
- Review server.mjs lines 95, 348, 409 for query patterns
- Check frontend types in `src/lib/supabase.ts`
- Test with: `curl http://77.243.85.8:3000/api/products`
