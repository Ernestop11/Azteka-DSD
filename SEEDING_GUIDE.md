# Database Seeding Guide

## Problem Identified

The admin product editor shows empty dropdowns for **Brand** and **Category** because:
1. The `Category` and `Brand` tables are empty
2. The default seed script (`prisma/seed.mjs`) only creates the admin user
3. CSV files exist (`data/brands.csv`, `data/categories.csv`) but aren't automatically seeded

## Solution

### Option 1: Use Updated Seed Script (Recommended)

The seed script has been updated to automatically seed brands and categories from CSV files:

```bash
npx prisma db seed
```

This will:
- ✅ Create/update admin user (`admin@azteka.com` / `password123`)
- ✅ Seed brands from `data/brands.csv`
- ✅ Seed categories from `data/categories.csv`

### Option 2: Use Sync Scripts (More Robust)

The sync scripts use proper normalization and slug generation:

```bash
# Sync both brands and categories
npx tsx scripts/db/sync-all.ts

# Or individually
npx tsx scripts/db/sync-brands.ts data/brands.csv
npx tsx scripts/db/sync-categories.ts data/categories.csv
```

### Option 3: Manual Seeding via API

You can also create brands/categories via the API endpoints:

```bash
# Create a brand
curl -X POST http://localhost:3000/api/admin/brands \
  -H "Content-Type: application/json" \
  -d '{"name": "Sabritas", "slug": "sabritas"}'

# Create a category
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Snacks", "slug": "snacks"}'
```

## Prerequisites

### 1. Start PostgreSQL

Make sure PostgreSQL is running:

```bash
# macOS (Homebrew)
brew services start postgresql

# Or using pg_ctl
pg_ctl -D /usr/local/var/postgres start

# Or Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

### 2. Verify Database Connection

```bash
# Test connection
psql $DATABASE_URL -c 'SELECT 1;'

# Or check counts
psql $DATABASE_URL -c 'SELECT COUNT(*) FROM "Category";'
psql $DATABASE_URL -c 'SELECT COUNT(*) FROM "Brand";'
```

### 3. Verify CSV Files Exist

```bash
ls -la data/brands.csv
ls -la data/categories.csv
```

## CSV File Format

### Brands CSV (`data/brands.csv`)
Expected columns:
- `Brand Name` or `name` or `Name` - The brand name

Example:
```csv
ID,Brand Name,Brand Logo,Importance,Products Identifier,Created,Updated
138,Otoki,,,,2025-09-06T03:03:37.223Z,2025-09-06T03:03:37.223Z
137,Ramen Noodle Soup,,,,2025-09-06T02:58:06.040Z,2025-09-06T02:58:06.040Z
```

### Categories CSV (`data/categories.csv`)
Expected columns:
- `Category Name` or `name` or `Name` - The category name

Example:
```csv
ID,Category Name,Master Category,Products Identifier,Category Image,Created,Updated
73,Tradicional Guayaba,Candy,,,2025-10-08T23:06:15.005Z,2025-10-08T23:06:15.005Z
72,Tradicional Coco,Candy,,,2025-10-08T23:00:49.690Z,2025-10-08T23:00:49.690Z
```

## After Seeding

### Verify Data

```bash
# Using Prisma Studio (visual)
npx prisma studio

# Or via API
curl http://localhost:3000/api/admin/brands
curl http://localhost:3000/api/admin/categories
```

### Link Products to Brands/Categories

If you have existing products that need to be linked:

1. **Re-import products** (if using CSV import):
   ```bash
   npx tsx scripts/db/import-vendor-po.ts data/products.csv
   ```

2. **Or manually update** via the admin UI at:
   - `http://localhost:3000/admin/products`
   - Edit each product and select brand/category from dropdowns

## Troubleshooting

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env` file
- Verify connection: `psql $DATABASE_URL -c 'SELECT 1;'`

### "CSV file not found"
- Ensure CSV files exist in `data/` directory
- Check file paths are correct

### "Empty dropdowns still"
- Verify brands/categories were seeded: `npx prisma studio`
- Check browser console for API errors
- Ensure `/api/admin/brands` and `/api/admin/categories` return data

### "Duplicate slug errors"
- The seed script handles duplicates by updating existing records
- If issues persist, check for invalid characters in brand/category names

## Next Steps

After seeding:
1. ✅ Brands and categories will appear in product editor dropdowns
2. ✅ You can create products with proper brand/category associations
3. ✅ Catalog will display products grouped by brand/category
4. ✅ Bundle builder can reference brands/categories

