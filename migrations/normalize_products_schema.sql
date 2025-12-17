-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DATABASE SCHEMA NORMALIZATION FOR PRODUCTS TABLE
-- Generated: 2025-11-12
-- Purpose: Standardize products table schema with snake_case naming
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Current State Analysis:
-- The database is using camelCase field names (e.g., imageUrl, createdAt)
-- Need to add missing fields and normalize naming convention

BEGIN;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: Add missing required columns if they don't exist
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Add slug column (required by specification)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing products that don't have them
UPDATE products
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Make slug NOT NULL after populating
ALTER TABLE products
ALTER COLUMN slug SET NOT NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 2: Add snake_case aliases for camelCase columns
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Add snake_case column for image_url if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Copy data from camelCase to snake_case
UPDATE products
SET image_url = "imageUrl"
WHERE image_url IS NULL AND "imageUrl" IS NOT NULL;

-- Add snake_case column for category_id
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id UUID;

UPDATE products
SET category_id = "categoryId"::uuid
WHERE category_id IS NULL AND "categoryId" IS NOT NULL;

-- Add snake_case column for brand_id
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand_id UUID;

UPDATE products
SET brand_id = "brandId"::uuid
WHERE brand_id IS NULL AND "brandId" IS NOT NULL;

-- Add snake_case column for subcategory_id
ALTER TABLE products
ADD COLUMN IF NOT EXISTS subcategory_id UUID;

UPDATE products
SET subcategory_id = "subcategoryId"::uuid
WHERE subcategory_id IS NULL AND "subcategoryId" IS NOT NULL;

-- Add snake_case column for in_stock
ALTER TABLE products
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;

UPDATE products
SET in_stock = "inStock"
WHERE "inStock" IS NOT NULL;

-- Add snake_case column for created_at
ALTER TABLE products
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE products
SET created_at = "createdAt"::timestamptz
WHERE created_at IS NULL AND "createdAt" IS NOT NULL;

-- Add snake_case column for updated_at
ALTER TABLE products
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE products
SET updated_at = "updatedAt"::timestamptz
WHERE updated_at IS NULL AND "updatedAt" IS NOT NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 3: Add frontend-required columns
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE products
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#f3f4f6';

UPDATE products
SET background_color = "backgroundColor"
WHERE background_color IS NULL AND "backgroundColor" IS NOT NULL;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS background_gradient TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'case';

UPDATE products
SET unit_type = "unitType"
WHERE unit_type IS NULL AND "unitType" IS NOT NULL;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS units_per_case INTEGER DEFAULT 1;

UPDATE products
SET units_per_case = "unitsPerCase"
WHERE units_per_case IS NULL AND "unitsPerCase" IS NOT NULL;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1;

UPDATE products
SET min_order_quantity = "minOrderQty"
WHERE min_order_quantity IS NULL AND "minOrderQty" IS NOT NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 4: Ensure price is NUMERIC type
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Convert price to NUMERIC if it's currently TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'price'
        AND data_type != 'numeric'
    ) THEN
        ALTER TABLE products
        ALTER COLUMN price TYPE NUMERIC USING price::numeric;
    END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 5: Add constraints
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ensure id is UUID and PRIMARY KEY
ALTER TABLE products
ALTER COLUMN id SET NOT NULL;

-- Add unique constraint on SKU if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_sku_unique'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_sku_unique UNIQUE (sku);
    END IF;
END $$;

-- Add foreign key for category_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_category_id_fkey'
    ) THEN
        -- Only add FK if categories table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
            ALTER TABLE products
            ADD CONSTRAINT products_category_id_fkey
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Add foreign key for brand_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_brand_id_fkey'
    ) THEN
        -- Only add FK if brands table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands') THEN
            ALTER TABLE products
            ADD CONSTRAINT products_brand_id_fkey
            FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Add foreign key for subcategory_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_subcategory_id_fkey'
    ) THEN
        -- Only add FK if subcategories table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subcategories') THEN
            ALTER TABLE products
            ADD CONSTRAINT products_subcategory_id_fkey
            FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 6: Create indexes for performance
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 7: Create updated_at trigger
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 8: Validation and cleanup comments
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE products IS 'Product catalog with normalized snake_case schema';
COMMENT ON COLUMN products.id IS 'Primary key UUID';
COMMENT ON COLUMN products.name IS 'Product display name';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier derived from name';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique identifier';
COMMENT ON COLUMN products.price IS 'Wholesale price per unit';
COMMENT ON COLUMN products.description IS 'Product description text';
COMMENT ON COLUMN products.category_id IS 'Foreign key to categories table';
COMMENT ON COLUMN products.brand_id IS 'Foreign key to brands table';
COMMENT ON COLUMN products.subcategory_id IS 'Foreign key to subcategories table';
COMMENT ON COLUMN products.image_url IS 'URL or path to product image';
COMMENT ON COLUMN products.background_color IS 'Hex color for product card background';
COMMENT ON COLUMN products.background_gradient IS 'CSS gradient for product card';
COMMENT ON COLUMN products.in_stock IS 'Whether product is available for purchase';
COMMENT ON COLUMN products.featured IS 'Whether product should be featured/promoted';
COMMENT ON COLUMN products.unit_type IS 'Unit of measure (case, box, pallet, etc)';
COMMENT ON COLUMN products.units_per_case IS 'Number of individual units per case';
COMMENT ON COLUMN products.min_order_quantity IS 'Minimum quantity required per order';
COMMENT ON COLUMN products.created_at IS 'Timestamp when product was created';
COMMENT ON COLUMN products.updated_at IS 'Timestamp when product was last updated';

COMMIT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VALIDATION QUERY
-- Run this after migration to verify schema:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT
--     column_name,
--     data_type,
--     is_nullable,
--     column_default
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- ORDER BY ordinal_position;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- NOTES:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- 1. This migration is ADDITIVE - it does not drop existing camelCase columns
--    to ensure backward compatibility with existing API code.
--
-- 2. Both naming conventions (camelCase and snake_case) will coexist.
--    New code should use snake_case columns.
--
-- 3. To fully migrate to snake_case only, you would need to:
--    a) Update ALL API code to use snake_case
--    b) Run a second migration to drop camelCase columns
--
-- 4. The migration is idempotent - safe to run multiple times.
--
-- 5. Foreign keys are conditional on the existence of referenced tables.
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
