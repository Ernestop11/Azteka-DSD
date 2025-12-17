-- ============================================================
-- 003_product_seeding_master.sql
-- Consolidated migration for Product Seeding System
-- ============================================================

-- ============================
-- 1. ADD NEW PRODUCT COLUMNS
-- ============================

ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS vendor_price NUMERIC,
    ADD COLUMN IF NOT EXISTS cost_case NUMERIC,
    ADD COLUMN IF NOT EXISTS units_per_case INT,
    ADD COLUMN IF NOT EXISTS unit_type TEXT,
    ADD COLUMN IF NOT EXISTS margin_percent NUMERIC,
    ADD COLUMN IF NOT EXISTS short_description TEXT,
    ADD COLUMN IF NOT EXISTS background_color TEXT,
    ADD COLUMN IF NOT EXISTS background_gradient TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS created_by UUID;

-- ============================
-- 2. product_images TABLE
-- ============================

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON product_images(product_id);

-- ============================
-- 3. po_imports TABLE
-- ============================

CREATE TABLE IF NOT EXISTS po_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT,
    file_name TEXT,
    raw_text TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 4. UNIQUE SLUGS
-- ============================

-- Add slug columns if they don't exist
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add UNIQUE constraints (skip if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_unique') THEN
        ALTER TABLE "Product" ADD CONSTRAINT products_slug_unique UNIQUE(slug);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_unique') THEN
        ALTER TABLE "Category" ADD CONSTRAINT categories_slug_unique UNIQUE(slug);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brands_slug_unique') THEN
        ALTER TABLE "Brand" ADD CONSTRAINT brands_slug_unique UNIQUE(slug);
    END IF;
END $$;

-- ============================
-- 5. SLUG INDEXES
-- ============================

CREATE INDEX IF NOT EXISTS idx_products_slug
    ON "Product"(slug);

CREATE INDEX IF NOT EXISTS idx_brands_slug
    ON "Brand"(slug);

CREATE INDEX IF NOT EXISTS idx_categories_slug
    ON "Category"(slug);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
