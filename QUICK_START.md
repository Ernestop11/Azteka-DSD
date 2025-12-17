# Product Seeding System - Quick Start

## 🚀 30-Second Overview

Upload a PO PDF → AI extracts products → Review → Create in bulk

---

## ⚡ Fast Track Installation

```bash
# 1. Install dependencies (2 min)
npm install pdf-parse openai

# 2. Set OpenAI key (1 min)
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# 3. Run migrations (2 min)
psql $DATABASE_URL -f migrations/normalize_products_schema.sql
psql $DATABASE_URL -f migrations/002_product_seeding_system.sql

# 4. Create uploads directory (30s)
mkdir -p uploads/po && chmod 755 uploads/po

# 5. Copy implementation files (10 min)
# - server/routes/po-upload.ts (from ARCHITECTURE doc)
# - server/routes/product-seed.ts (from ARCHITECTURE doc)
# - src/pages/admin/SeedProducts.tsx (from ARCHITECTURE doc)
# - src/types/product-seeding.ts (from ARCHITECTURE doc)

# 6. Register routes in server/index.ts (2 min)
# app.use('/api/po', poUploadRoutes);
# app.use('/api/products', productSeedRoutes);

# 7. Add route in src/main.tsx (1 min)
# <Route path="/admin/seed" element={<SeedProducts />} />

# 8. Restart server (1 min)
pm2 restart azteka-api

# 9. Test (5 min)
# Navigate to http://77.243.85.8:3000/admin/seed
# Upload a test PO PDF
```

**Total Time:** ~25 minutes

---

## 📋 Files Checklist

- [x] `migrations/normalize_products_schema.sql` ✅ Already created
- [x] `migrations/002_product_seeding_system.sql` ✅ Need to create from ARCHITECTURE doc
- [x] `ARCHITECTURE_PRODUCT_SEEDING.md` ✅ Already created
- [x] `migrations/SCHEMA_AUDIT_REPORT.md` ✅ Already created
- [x] `IMPLEMENTATION_GUIDE.md` ✅ Already created
- [ ] `server/routes/po-upload.ts` ⏳ Copy from ARCHITECTURE Section 4.1
- [ ] `server/routes/product-seed.ts` ⏳ Copy from ARCHITECTURE Section 4.2
- [ ] `src/types/product-seeding.ts` ⏳ Copy from ARCHITECTURE Section 3.1
- [ ] `src/pages/admin/SeedProducts.tsx` ⏳ Copy from ARCHITECTURE Section 5.1

---

## 🎯 Key API Endpoints

### Upload PO
```bash
POST /api/po/upload
Content-Type: multipart/form-data

Body:
- file: PDF file
- supplier: string (optional)

Response:
{
  "success": true,
  "import_id": "uuid",
  "products": [ ExtractedProduct... ]
}
```

### Seed Products
```bash
POST /api/products/seed
Content-Type: application/json

Body:
{
  "products": [ ExtractedProduct... ],
  "import_id": "uuid",
  "options": {
    "auto_create_categories": true,
    "auto_create_brands": true,
    "default_in_stock": true
  }
}

Response:
{
  "success": true,
  "created": [ Product... ],
  "errors": [],
  "summary": {
    "total": 10,
    "created": 9,
    "failed": 1,
    "categories_created": ["Snacks"],
    "brands_created": ["Takis", "Doritos"]
  }
}
```

---

## 🔍 Quick Tests

### Test 1: Schema Migration
```sql
-- Should return slug, image_url, category_id, in_stock (all snake_case)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('slug', 'image_url', 'category_id', 'in_stock');
```

### Test 2: PO Imports Table
```sql
-- Should return table definition
\d po_imports
```

### Test 3: Upload Endpoint
```bash
curl -X POST http://77.243.85.8:3000/api/po/upload \
  -F "file=@test-po.pdf" \
  -F "supplier=Test Supplier"
```

### Test 4: Seed Endpoint
```bash
curl -X POST http://77.243.85.8:3000/api/products/seed \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{
      "name": "Test Product",
      "sku": "TEST-001",
      "price": 25.99,
      "category": "Snacks"
    }]
  }'
```

---

## 🐛 Common Errors

| Error | Fix |
|-------|-----|
| `Cannot find module 'pdf-parse'` | `npm install pdf-parse openai` |
| `relation "po_imports" does not exist` | Run migration `002_product_seeding_system.sql` |
| `column "slug" does not exist` | Run migration `normalize_products_schema.sql` |
| `OPENAI_API_KEY not found` | Add to `.env` file |
| `ENOENT: no such file or directory` | `mkdir -p uploads/po` |

---

## 📚 Full Documentation

- **Complete Guide:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Architecture:** [ARCHITECTURE_PRODUCT_SEEDING.md](./ARCHITECTURE_PRODUCT_SEEDING.md)
- **Schema Audit:** [migrations/SCHEMA_AUDIT_REPORT.md](./migrations/SCHEMA_AUDIT_REPORT.md)

---

## ✅ Success Indicators

When everything is working, you should see:

1. ✅ `/admin/seed` page loads without errors
2. ✅ Can upload PDF and see "AI Processing..." message
3. ✅ AI extracts products with validation status
4. ✅ "Confirm & Create" saves products to database
5. ✅ Products appear in admin panel with `source = 'po_import'`
6. ✅ Categories and brands auto-created
7. ✅ `po_imports` table has audit records

---

**Ready to implement?** Start with [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) Phase 1.
