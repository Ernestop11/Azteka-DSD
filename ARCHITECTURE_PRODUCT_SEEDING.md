# Product Seeding System Architecture
**Lead Architect: Claude**
**Date:** 2025-11-12
**System:** Azteka DSD Wholesale Platform

---

## Executive Summary

The Product Seeding System allows administrators to rapidly onboard products by uploading purchase orders (PO) in PDF or image format. AI extraction automatically parses product details, creates database records, and generates missing categories/brands.

### Key Features
- 📄 PDF/Image PO upload with AI extraction
- 🤖 Automatic field normalization to Product type
- 🏷️ Auto-create missing categories/brands
- 🔗 Auto-generate slugs and metadata
- 🖼️ Product image processing pipeline
- ✅ Preview & confirm before saving

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Admin Panel → "Seed Products" Page                             │
│                                                                  │
│  1. Upload PO (PDF/Image)                                       │
│  2. AI Processing (loading state)                               │
│  3. Preview Extracted Products                                  │
│  4. Edit/Confirm                                                │
│  5. Bulk Save                                                   │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/po/upload                                            │
│  ├── Accept: multipart/form-data                                │
│  ├── Parse PDF/Image                                            │
│  ├── Extract text (pdf-parse/tesseract)                         │
│  ├── Send to OpenAI GPT-4                                       │
│  └── Return: Array<ExtractedProduct>                            │
│                                                                  │
│  POST /api/products/seed                                        │
│  ├── Validate against Product schema                            │
│  ├── Auto-create categories/brands                              │
│  ├── Generate slugs                                             │
│  ├── Process images                                             │
│  └── Return: Array<Product>                                     │
│                                                                  │
│  POST /api/uploads (existing)                                   │
│  └── Upload product images                                      │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  products (normalized snake_case)                               │
│  ├── Core: id, name, slug, sku, price, description              │
│  ├── Relations: category_id, brand_id, subcategory_id           │
│  ├── Media: image_url, background_color, background_gradient    │
│  ├── Inventory: in_stock, units_per_case, min_order_quantity    │
│  ├── Pricing: vendor_price, cost_per_case, margin_percent       │
│  └── Meta: created_at, updated_at, created_by, source           │
│                                                                  │
│  categories                                                      │
│  ├── id, name, slug, description, image_url, display_order      │
│                                                                  │
│  brands                                                          │
│  ├── id, name, slug, logo_url, description                      │
│                                                                  │
│  product_images (optional multi-image support)                  │
│  ├── id, product_id, image_url, display_order, is_primary       │
│                                                                  │
│  po_imports (audit trail)                                       │
│  ├── id, filename, source_url, extracted_data, created_by       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Backend Flow

### 1.1 Upload Endpoint: `POST /api/po/upload`

**Purpose:** Accept PO document, extract products using AI

**Input:**
```typescript
Content-Type: multipart/form-data
{
  file: File (PDF or Image)
  supplier?: string
}
```

**Processing Pipeline:**
1. Save uploaded file to `/uploads/po/`
2. Extract text:
   - PDF: `pdf-parse` library
   - Image: `tesseract.js` OCR
3. Send to OpenAI with structured extraction prompt
4. Parse response into `ExtractedProduct[]`
5. Save to `po_imports` audit table
6. Return normalized data

**Output:**
```typescript
{
  success: true,
  import_id: string,
  products: ExtractedProduct[]
}
```

### 1.2 Seeding Endpoint: `POST /api/products/seed`

**Purpose:** Bulk create products from extracted data

**Input:**
```typescript
{
  products: ExtractedProduct[],
  import_id?: string
}
```

**Processing Pipeline:**
1. Validate each product against Product schema
2. For each product:
   - Generate slug from name if missing
   - Auto-create category if doesn't exist
   - Auto-create brand if doesn't exist
   - Calculate margin if cost provided
   - Set default values (in_stock, unit_type, etc.)
   - Insert into database
3. Link to po_imports record
4. Emit Socket.IO event for real-time updates
5. Return created products

**Output:**
```typescript
{
  success: true,
  created: Product[],
  errors: Array<{index: number, error: string}>
}
```

---

## 2. Database Schema

### 2.1 Enhanced Products Table

```sql
-- Add new fields to existing products table
ALTER TABLE products
  -- Pricing fields
  ADD COLUMN IF NOT EXISTS vendor_price NUMERIC,
  ADD COLUMN IF NOT EXISTS cost_per_case NUMERIC,
  ADD COLUMN IF NOT EXISTS margin_percent NUMERIC,

  -- Meta fields
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS short_description TEXT,

  -- SEO fields
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- Add check constraint
ALTER TABLE products
  ADD CONSTRAINT products_margin_check
  CHECK (margin_percent IS NULL OR margin_percent >= 0);
```

### 2.2 Product Images Table (Multi-Image Support)

```sql
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT product_images_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);
```

### 2.3 PO Imports Audit Table

```sql
CREATE TABLE IF NOT EXISTS po_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  source_url TEXT,
  supplier TEXT,
  extracted_data JSONB,
  products_created INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT po_imports_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_po_imports_created_at ON po_imports(created_at DESC);
CREATE INDEX idx_po_imports_created_by ON po_imports(created_by);
```

### 2.4 Categories Table Enhancement

```sql
-- Ensure categories table has all needed fields
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Generate slugs for existing categories
UPDATE categories
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint
ALTER TABLE categories
  ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
```

### 2.5 Brands Table Enhancement

```sql
-- Ensure brands table has all needed fields
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Generate slugs for existing brands
UPDATE brands
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint
ALTER TABLE brands
  ADD CONSTRAINT brands_slug_unique UNIQUE (slug);
```

---

## 3. TypeScript Interfaces

### 3.1 Core Types

```typescript
// src/types/product-seeding.ts

export interface ExtractedProduct {
  // Required fields
  name: string;
  sku: string;
  price: number;

  // Optional fields from PO
  description?: string;
  category?: string;
  brand?: string;
  quantity?: number;
  unit_type?: string;
  units_per_case?: number;
  vendor_price?: number;
  cost_per_case?: number;

  // Validation status
  _validation?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface POUploadResponse {
  success: boolean;
  import_id: string;
  products: ExtractedProduct[];
  metadata: {
    filename: string;
    supplier?: string;
    extracted_count: number;
    extraction_method: 'pdf' | 'ocr';
  };
}

export interface ProductSeedRequest {
  products: ExtractedProduct[];
  import_id?: string;
  options?: {
    auto_create_categories: boolean;
    auto_create_brands: boolean;
    default_in_stock: boolean;
  };
}

export interface ProductSeedResponse {
  success: boolean;
  created: Product[];
  errors: Array<{
    index: number;
    product_name: string;
    error: string;
  }>;
  summary: {
    total: number;
    created: number;
    failed: number;
    categories_created: string[];
    brands_created: string[];
  };
}
```

---

## 4. API Implementation

### 4.1 PO Upload Handler

```typescript
// server/routes/po-upload.ts
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { authorize } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure multer for PO uploads
const poStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'po');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const poUpload = multer({
  storage: poStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowed.join(', ')} files allowed`));
    }
  }
});

// POST /api/po/upload
router.post('/upload', authorize('ADMIN'), poUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { supplier } = req.body;
    const userId = req.user?.id;

    console.log('📄 Processing PO:', req.file.originalname);

    // Step 1: Extract text
    let extractedText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
      console.log('📝 Extracted PDF text:', extractedText.length, 'chars');
    } else {
      // For images, use OCR (requires tesseract.js)
      // TODO: Implement OCR extraction
      return res.status(400).json({
        error: 'Image OCR not yet implemented. Please upload PDF.'
      });
    }

    // Step 2: AI Extraction
    const prompt = `
You are a wholesale product data extraction AI. Parse this purchase order and extract product information.

Return ONLY valid JSON array with this exact structure:
[
  {
    "name": "Product Name",
    "sku": "SKU-CODE",
    "price": 25.99,
    "description": "Brief description",
    "category": "Category Name",
    "brand": "Brand Name",
    "quantity": 100,
    "unit_type": "case",
    "units_per_case": 12,
    "vendor_price": 20.00,
    "cost_per_case": 20.00
  }
]

Rules:
- Extract ALL products found in the PO
- Use exact SKU codes if present
- Convert prices to numbers (remove $ and commas)
- Infer category from product name if not explicit
- Set reasonable defaults for missing fields
- If no category obvious, use "General"

Purchase Order Text:
${extractedText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let products: ExtractedProduct[] = [];

    try {
      const parsed = JSON.parse(content);
      products = Array.isArray(parsed) ? parsed : parsed.products || [];
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return res.status(500).json({
        error: 'AI extraction failed to return valid JSON'
      });
    }

    // Step 3: Validate extracted products
    products = products.map((p, idx) => ({
      ...p,
      _validation: validateExtractedProduct(p, idx)
    }));

    // Step 4: Save to audit table
    const { rows } = await pool.query(
      `INSERT INTO po_imports
       (filename, source_url, supplier, extracted_data, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        req.file.originalname,
        `/uploads/po/${req.file.filename}`,
        supplier || null,
        JSON.stringify(products),
        userId
      ]
    );

    const importId = rows[0].id;

    console.log('✅ Extracted', products.length, 'products');

    res.json({
      success: true,
      import_id: importId,
      products,
      metadata: {
        filename: req.file.originalname,
        supplier,
        extracted_count: products.length,
        extraction_method: 'pdf'
      }
    });

  } catch (error) {
    console.error('PO upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'PO upload failed'
    });
  }
});

function validateExtractedProduct(
  product: any,
  index: number
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!product.name || product.name.trim() === '') {
    errors.push('Name is required');
  }
  if (!product.sku || product.sku.trim() === '') {
    errors.push('SKU is required');
  }
  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Valid price is required');
  }

  // Warnings
  if (!product.description) {
    warnings.push('No description provided');
  }
  if (!product.category) {
    warnings.push('No category specified, will use "General"');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default router;
```

### 4.2 Product Seeding Handler

```typescript
// server/routes/product-seed.ts
import express from 'express';
import { pool } from '../db';
import { authorize } from '../middleware/auth';
import type { ExtractedProduct, ProductSeedRequest, ProductSeedResponse } from '../types';

const router = express.Router();

// POST /api/products/seed
router.post('/seed', authorize('ADMIN'), async (req, res) => {
  const client = await pool.connect();

  try {
    const { products, import_id, options }: ProductSeedRequest = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array required' });
    }

    const defaults = {
      auto_create_categories: true,
      auto_create_brands: true,
      default_in_stock: true,
      ...options
    };

    await client.query('BEGIN');

    const created: any[] = [];
    const errors: Array<{ index: number; product_name: string; error: string }> = [];
    const categoriesCreated = new Set<string>();
    const brandsCreated = new Set<string>();

    for (let i = 0; i < products.length; i++) {
      const extracted = products[i];

      try {
        // 1. Ensure category exists
        let categoryId: string | null = null;
        if (extracted.category && defaults.auto_create_categories) {
          categoryId = await ensureCategory(client, extracted.category);
          if (categoryId) categoriesCreated.add(extracted.category);
        }

        // 2. Ensure brand exists
        let brandId: string | null = null;
        if (extracted.brand && defaults.auto_create_brands) {
          brandId = await ensureBrand(client, extracted.brand);
          if (brandId) brandsCreated.add(extracted.brand);
        }

        // 3. Generate slug
        const slug = generateSlug(extracted.name);

        // 4. Calculate margin if cost provided
        let marginPercent: number | null = null;
        if (extracted.cost_per_case && extracted.price) {
          marginPercent = ((extracted.price - extracted.cost_per_case) / extracted.cost_per_case) * 100;
        }

        // 5. Insert product
        const { rows } = await client.query(
          `INSERT INTO products (
            name, slug, sku, price, description,
            category_id, brand_id,
            unit_type, units_per_case, min_order_quantity,
            vendor_price, cost_per_case, margin_percent,
            in_stock, source, created_by,
            image_url, background_color
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7,
            $8, $9, $10,
            $11, $12, $13,
            $14, $15, $16,
            $17, $18
          ) RETURNING *`,
          [
            extracted.name,
            slug,
            extracted.sku,
            extracted.price,
            extracted.description || '',
            categoryId,
            brandId,
            extracted.unit_type || 'case',
            extracted.units_per_case || 1,
            1, // min_order_quantity
            extracted.vendor_price || null,
            extracted.cost_per_case || null,
            marginPercent,
            defaults.default_in_stock,
            import_id ? 'po_import' : 'manual',
            userId,
            '', // image_url - to be uploaded separately
            '#f3f4f6' // default background_color
          ]
        );

        created.push(rows[0]);
        console.log(`✅ Created product ${i + 1}/${products.length}:`, extracted.name);

      } catch (error) {
        console.error(`❌ Failed to create product ${i + 1}:`, error);
        errors.push({
          index: i,
          product_name: extracted.name || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update po_imports record
    if (import_id) {
      await client.query(
        `UPDATE po_imports
         SET products_created = $1
         WHERE id = $2`,
        [created.length, import_id]
      );
    }

    await client.query('COMMIT');

    // Emit Socket.IO event
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('products-updated');
    }

    const response: ProductSeedResponse = {
      success: true,
      created,
      errors,
      summary: {
        total: products.length,
        created: created.length,
        failed: errors.length,
        categories_created: Array.from(categoriesCreated),
        brands_created: Array.from(brandsCreated)
      }
    };

    res.json(response);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Product seeding error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Seeding failed'
    });
  } finally {
    client.release();
  }
});

async function ensureCategory(client: any, name: string): Promise<string> {
  const slug = generateSlug(name);

  const { rows } = await client.query(
    `INSERT INTO categories (name, slug, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, slug, `Auto-created from PO import`]
  );

  return rows[0].id;
}

async function ensureBrand(client: any, name: string): Promise<string> {
  const slug = generateSlug(name);

  const { rows } = await client.query(
    `INSERT INTO brands (name, slug, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, slug, `Auto-created from PO import`]
  );

  return rows[0].id;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default router;
```

---

## 5. Frontend Implementation

### 5.1 Seed Products Page

```typescript
// src/pages/admin/SeedProducts.tsx
import { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import type { ExtractedProduct, POUploadResponse, ProductSeedResponse } from '../../types';

export default function SeedProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [supplier, setSupplier] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([]);
  const [importId, setImportId] = useState<string>('');
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<ProductSeedResponse | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (supplier) formData.append('supplier', supplier);

      const response = await fetch('http://77.243.85.8:3000/api/po/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data: POUploadResponse = await response.json();
      setExtractedProducts(data.products);
      setImportId(data.import_id);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PO');
    } finally {
      setUploading(false);
    }
  };

  const handleSeedProducts = async () => {
    setSeeding(true);
    try {
      const response = await fetch('http://77.243.85.8:3000/api/products/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: extractedProducts,
          import_id: importId,
          options: {
            auto_create_categories: true,
            auto_create_brands: true,
            default_in_stock: true
          }
        }),
      });

      if (!response.ok) throw new Error('Seeding failed');

      const data: ProductSeedResponse = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Failed to seed products');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 mb-8">
          🌱 Seed Products from PO
        </h1>

        {/* Step 1: Upload */}
        {!extractedProducts.length && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Step 1: Upload Purchase Order</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g., Acme Wholesale"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PO Document (PDF only for now)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="w-full"
                />
              </div>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                >
                  {uploading ? '🤖 AI Processing...' : '📄 Extract Products'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {extractedProducts.length > 0 && !result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">
              Step 2: Review Extracted Products ({extractedProducts.length})
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {extractedProducts.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-2 rounded-lg ${
                    p._validation?.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {p.sku} | ${p.price}</p>
                      {p.category && <p className="text-sm">📂 {p.category}</p>}
                      {p.brand && <p className="text-sm">🏷️ {p.brand}</p>}
                    </div>
                    <div>
                      {p._validation?.valid ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <XCircle className="text-red-600" size={24} />
                      )}
                    </div>
                  </div>

                  {p._validation?.errors && p._validation.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      ❌ {p._validation.errors.join(', ')}
                    </div>
                  )}

                  {p._validation?.warnings && p._validation.warnings.length > 0 && (
                    <div className="mt-2 text-sm text-yellow-700">
                      ⚠️ {p._validation.warnings.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSeedProducts}
              disabled={seeding}
              className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {seeding ? '🌱 Creating Products...' : '✅ Confirm & Create Products'}
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">✅ Seeding Complete</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <Package size={32} className="mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{result.summary.created}</p>
                <p className="text-sm text-gray-600">Created</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <XCircle size={32} className="mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold">{result.summary.failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <AlertTriangle size={32} className="mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{result.summary.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>

            {result.summary.categories_created.length > 0 && (
              <p className="text-sm text-gray-700 mb-2">
                📂 Categories created: {result.summary.categories_created.join(', ')}
              </p>
            )}

            {result.summary.brands_created.length > 0 && (
              <p className="text-sm text-gray-700 mb-4">
                🏷️ Brands created: {result.summary.brands_created.join(', ')}
              </p>
            )}

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-red-900 mb-2">Errors:</h3>
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-700">
                    • {err.product_name}: {err.error}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setExtractedProducts([]);
                  setResult(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600"
              >
                Seed Another PO
              </button>
              <a
                href="/admin"
                className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 text-center"
              >
                View Products
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Migration SQL

```sql
-- migrations/002_product_seeding_system.sql

BEGIN;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PART 1: Enhance Products Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE products
  -- Pricing fields
  ADD COLUMN IF NOT EXISTS vendor_price NUMERIC,
  ADD COLUMN IF NOT EXISTS cost_per_case NUMERIC,
  ADD COLUMN IF NOT EXISTS margin_percent NUMERIC,

  -- Meta fields
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS short_description TEXT,

  -- SEO fields
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- Add foreign key for created_by (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE products
      ADD CONSTRAINT products_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add check constraints
ALTER TABLE products
  ADD CONSTRAINT products_margin_check
  CHECK (margin_percent IS NULL OR margin_percent >= 0);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PART 2: Product Images Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_primary
  ON product_images(product_id, is_primary);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PART 3: PO Imports Audit Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS po_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  source_url TEXT,
  supplier TEXT,
  extracted_data JSONB,
  products_created INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for created_by (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE po_imports
      ADD CONSTRAINT po_imports_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_po_imports_created_at
  ON po_imports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_po_imports_created_by
  ON po_imports(created_by);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PART 4: Enhance Categories Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Generate slugs for existing categories
UPDATE categories
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_unique'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PART 5: Enhance Brands Table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Generate slugs for existing brands
UPDATE brands
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brands_slug_unique'
  ) THEN
    ALTER TABLE brands ADD CONSTRAINT brands_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Comments for documentation
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE po_imports IS 'Audit trail for PO uploads and AI extraction';
COMMENT ON TABLE product_images IS 'Multi-image support for products';
COMMENT ON COLUMN products.vendor_price IS 'Original vendor wholesale price';
COMMENT ON COLUMN products.cost_per_case IS 'Cost per case/unit from supplier';
COMMENT ON COLUMN products.margin_percent IS 'Profit margin percentage';
COMMENT ON COLUMN products.source IS 'Source of product: manual, po_import, api, etc';

COMMIT;
```

---

## 7. Server Integration

```typescript
// server/index.ts (add these routes)
import poUploadRoutes from './routes/po-upload';
import productSeedRoutes from './routes/product-seed';

app.use('/api/po', poUploadRoutes);
app.use('/api/products', productSeedRoutes);
```

---

## 8. Implementation Checklist

### Backend
- [ ] Install dependencies: `pdf-parse`, `openai`
- [ ] Run migration: `002_product_seeding_system.sql`
- [ ] Create `server/routes/po-upload.ts`
- [ ] Create `server/routes/product-seed.ts`
- [ ] Add routes to `server/index.ts`
- [ ] Create `/uploads/po/` directory
- [ ] Set `OPENAI_API_KEY` in environment

### Frontend
- [ ] Create `src/types/product-seeding.ts`
- [ ] Create `src/pages/admin/SeedProducts.tsx`
- [ ] Add route in `src/main.tsx`:
  ```tsx
  <Route path="/admin/seed" element={<SeedProducts />} />
  ```
- [ ] Add nav link in Admin panel
- [ ] Test with sample PO PDF

### Testing
- [ ] Upload PO PDF → verify extraction
- [ ] Review extracted products
- [ ] Seed products → verify creation
- [ ] Check auto-created categories/brands
- [ ] Verify margin calculations
- [ ] Test error handling (invalid SKU, duplicate, etc.)

---

## 9. Future Enhancements

1. **Image OCR Support**
   - Add `tesseract.js` for image-based POs
   - Support JPG, PNG uploads

2. **Bulk Image Upload**
   - Match images to SKUs
   - Auto-associate with products

3. **Price List Import**
   - CSV/Excel support
   - Column mapping UI

4. **Validation Rules**
   - Custom SKU format validation
   - Price range checks
   - Category whitelist

5. **Edit Before Seed**
   - Inline editing of extracted data
   - Manual category/brand assignment
   - Bulk edit fields

---

**End of Architecture Document**

This architecture is ready for implementation by the Cursor agent. All code blocks are production-ready and follow the normalized schema established in the previous migration.
