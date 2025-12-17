-- ============================================================================
-- MIGRATION: Product Seeding Enhancements
-- Version: 003
-- Date: 2025-11-12
-- Purpose: Add fields and tables to support comprehensive Product Seeding
-- ============================================================================

-- ============================================================================
-- PART 1: Add Missing Columns to Product Table
-- ============================================================================

-- Add vendor_price (wholesale cost from vendor/supplier)
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "vendorPrice" NUMERIC(10,2);

COMMENT ON COLUMN "Product"."vendorPrice" IS 'Wholesale cost from vendor/supplier';

-- Add cost_per_case (total cost per case/unit)
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "costPerCase" NUMERIC(10,2);

COMMENT ON COLUMN "Product"."costPerCase" IS 'Total cost per case/unit for inventory tracking';

-- Add margin_percent (calculated profit margin)
-- Note: margin already exists as numeric(5,2), renaming for clarity
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name = 'margin'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "Product" RENAME COLUMN "margin" TO "marginPercent";
    END IF;
END $$;

COMMENT ON COLUMN "Product"."marginPercent" IS 'Profit margin as percentage (e.g., 35.00 for 35%)';

-- units_per_case and unit_type already exist ✓
-- Verify they have proper defaults
ALTER TABLE "Product"
ALTER COLUMN "unitType" SET DEFAULT 'case';

ALTER TABLE "Product"
ALTER COLUMN "unitsPerCase" SET DEFAULT 1;

-- Add short_description (concise product summary)
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;

COMMENT ON COLUMN "Product"."shortDescription" IS 'Brief product summary for cards/listings';

-- background_color already exists ✓
-- Add background_gradient for enhanced visuals
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "backgroundGradient" TEXT;

COMMENT ON COLUMN "Product"."backgroundGradient" IS 'CSS gradient string for product cards (e.g., "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")';

-- Add source tracking (manual | po_import | api | quickbooks)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductSource') THEN
        CREATE TYPE "ProductSource" AS ENUM ('manual', 'po_import', 'api', 'quickbooks', 'ai_intake');
    END IF;
END $$;

ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "source" "ProductSource" DEFAULT 'manual';

COMMENT ON COLUMN "Product"."source" IS 'Origin of product data: manual entry, PO import, API sync, QuickBooks, or AI intake';

-- Add created_by (user who created the product)
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

COMMENT ON COLUMN "Product"."createdBy" IS 'User ID who created this product entry';

-- Add import tracking reference
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "importBatchId" TEXT;

COMMENT ON COLUMN "Product"."importBatchId" IS 'Reference to po_imports.id if product was imported from PO';

-- Add slug for URL-friendly identifiers
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Generate slugs for existing products
UPDATE "Product"
SET "slug" = LOWER(REGEXP_REPLACE("sku", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE "Product"
ALTER COLUMN "slug" SET NOT NULL;

-- Add unique constraint on slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Product_slug_key'
    ) THEN
        ALTER TABLE "Product" ADD CONSTRAINT "Product_slug_key" UNIQUE ("slug");
    END IF;
END $$;


-- ============================================================================
-- PART 2: Add Missing Slug Column and Constraint to Brand
-- ============================================================================

ALTER TABLE "Brand"
ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Generate slugs for existing brands
UPDATE "Brand"
SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE "Brand"
ALTER COLUMN "slug" SET NOT NULL;

-- Add unique constraint on Brand slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Brand_slug_key'
    ) THEN
        ALTER TABLE "Brand" ADD CONSTRAINT "Brand_slug_key" UNIQUE ("slug");
    END IF;
END $$;

COMMENT ON COLUMN "Brand"."slug" IS 'URL-friendly unique identifier for brand';


-- ============================================================================
-- PART 3: Category Already Has Slug with UNIQUE Constraint ✓
-- ============================================================================
-- Category.slug already exists with UNIQUE constraint - no action needed


-- ============================================================================
-- PART 4: Create PO Imports Tracking Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "POImport" (
    "id" TEXT PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalRows" INTEGER DEFAULT 0,
    "successCount" INTEGER DEFAULT 0,
    "errorCount" INTEGER DEFAULT 0,
    "skippedCount" INTEGER DEFAULT 0,
    "errors" JSONB DEFAULT '[]'::jsonb,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3)
);

COMMENT ON TABLE "POImport" IS 'Tracks purchase order imports and product seeding batches';
COMMENT ON COLUMN "POImport"."filename" IS 'Original filename of uploaded PO/CSV';
COMMENT ON COLUMN "POImport"."uploadedBy" IS 'User ID who initiated the import';
COMMENT ON COLUMN "POImport"."status" IS 'Import status: pending, processing, completed, failed, partial';
COMMENT ON COLUMN "POImport"."errors" IS 'Array of error objects with row numbers and messages';
COMMENT ON COLUMN "POImport"."metadata" IS 'Additional import metadata (supplier, PO number, etc.)';

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS "POImport_status_idx" ON "POImport"("status");

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS "POImport_createdAt_idx" ON "POImport"("createdAt" DESC);


-- ============================================================================
-- PART 5: Create Product Images Table (for multiple images per product)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ProductImage_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") 
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE "ProductImage" IS 'Multiple images per product with ordering and primary flag';
COMMENT ON COLUMN "ProductImage"."isPrimary" IS 'Marks the main product image';
COMMENT ON COLUMN "ProductImage"."displayOrder" IS 'Sort order for image galleries';

-- Create index on productId for efficient lookups
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");

-- Migrate existing imageUrl to ProductImage table
INSERT INTO "ProductImage" ("id", "productId", "url", "isPrimary", "displayOrder")
SELECT 
    gen_random_uuid()::text,
    "id",
    "imageUrl",
    true,
    0
FROM "Product"
WHERE "imageUrl" IS NOT NULL 
  AND "imageUrl" != ''
  AND NOT EXISTS (
      SELECT 1 FROM "ProductImage" WHERE "productId" = "Product"."id"
  );


-- ============================================================================
-- PART 6: Add Foreign Key from Product to User (createdBy)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'Product_createdBy_fkey'
        ) THEN
            ALTER TABLE "Product" 
            ADD CONSTRAINT "Product_createdBy_fkey" 
                FOREIGN KEY ("createdBy") REFERENCES "User"("id") 
                ON UPDATE CASCADE ON DELETE SET NULL;
        END IF;
    END IF;
END $$;


-- ============================================================================
-- PART 7: Add Foreign Key from Product to POImport (importBatchId)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Product_importBatchId_fkey'
    ) THEN
        ALTER TABLE "Product" 
        ADD CONSTRAINT "Product_importBatchId_fkey" 
            FOREIGN KEY ("importBatchId") REFERENCES "POImport"("id") 
            ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- PART 8: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS "Product_source_idx" ON "Product"("source");
CREATE INDEX IF NOT EXISTS "Product_createdBy_idx" ON "Product"("createdBy");
CREATE INDEX IF NOT EXISTS "Product_importBatchId_idx" ON "Product"("importBatchId");
CREATE INDEX IF NOT EXISTS "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product"("featured");
CREATE INDEX IF NOT EXISTS "Product_inStock_idx" ON "Product"("inStock");


-- ============================================================================
-- PART 9: Update Existing Purchase Order Structure
-- ============================================================================

-- Add source file reference to PurchaseOrder
ALTER TABLE "PurchaseOrder"
ADD COLUMN IF NOT EXISTS "importId" TEXT;

COMMENT ON COLUMN "PurchaseOrder"."importId" IS 'Reference to POImport.id if PO was imported from file';

-- Add foreign key to POImport
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PurchaseOrder_importId_fkey'
    ) THEN
        ALTER TABLE "PurchaseOrder" 
        ADD CONSTRAINT "PurchaseOrder_importId_fkey" 
            FOREIGN KEY ("importId") REFERENCES "POImport"("id") 
            ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================================
-- PART 10: Create Helper Functions
-- ============================================================================

-- Function to calculate margin percentage
CREATE OR REPLACE FUNCTION calculate_margin_percent(
    price NUMERIC,
    cost NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    IF cost IS NULL OR cost = 0 THEN
        RETURN NULL;
    END IF;
    RETURN ROUND(((price - cost) / cost * 100)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_margin_percent IS 'Calculate profit margin percentage from price and cost';


-- Function to auto-update marginPercent when price or cost changes
CREATE OR REPLACE FUNCTION update_product_margin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price IS NOT NULL AND (NEW.cost IS NOT NULL OR NEW.costPerCase IS NOT NULL) THEN
        NEW."marginPercent" := calculate_margin_percent(
            NEW.price, 
            COALESCE(NEW.cost, NEW."costPerCase", NEW."vendorPrice")
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate margin
DROP TRIGGER IF EXISTS "trigger_update_product_margin" ON "Product";
CREATE TRIGGER "trigger_update_product_margin"
    BEFORE INSERT OR UPDATE ON "Product"
    FOR EACH ROW
    EXECUTE FUNCTION update_product_margin();


-- ============================================================================
-- PART 11: Validation and Data Quality Constraints
-- ============================================================================

-- Ensure price is positive
ALTER TABLE "Product"
ADD CONSTRAINT "Product_price_positive" 
CHECK (price > 0);

-- Ensure stock is non-negative
ALTER TABLE "Product"
ADD CONSTRAINT "Product_stock_nonnegative" 
CHECK (stock >= 0);

-- Ensure minStock is positive
ALTER TABLE "Product"
ADD CONSTRAINT "Product_minStock_positive" 
CHECK ("minStock" > 0);

-- Ensure unitsPerCase is positive
ALTER TABLE "Product"
ADD CONSTRAINT "Product_unitsPerCase_positive" 
CHECK ("unitsPerCase" > 0);


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 003_product_seeding_enhancements.sql completed successfully';
    RAISE NOTICE '📊 New columns added to Product table';
    RAISE NOTICE '🏷️  Slug constraints added to Product and Brand';
    RAISE NOTICE '📁 POImport tracking table created';
    RAISE NOTICE '🖼️  ProductImage table created for multi-image support';
    RAISE NOTICE '🔍 Performance indexes created';
    RAISE NOTICE '⚡ Auto-margin calculation trigger installed';
END $$;
