# Task Execution Guide - Database Cleanup & Bundle Testing

## ✅ Completed Setup

All scripts and npm commands have been created and are ready to use.

## 📋 Task 1: Clean Database to 642 Products Only

### Step 1: Backup Current State
```bash
npm run db:backup-full
```
This creates a full backup in `backups/backup-full-[timestamp].json`

### Step 2: Clean External Products
```bash
# Option 1: Use default CSV location (will search common paths)
npm run db:clean-external

# Option 2: Specify CSV path explicitly
node scripts/clean-external-products.mjs [path-to-your-csv-file]
```

The script will:
- Read CSV file to identify CSV products
- Keep products with `source='csv'`, `source='CSV'`, or `source='seed-script'`
- Delete all other external products (QuickBooks, etc.)
- Clean up related product images and bundle items

### Step 3: Verify Product Count
```bash
npm run db:count-products
```
Expected output: **642 products**

### Step 4: Test API Consistency
```bash
curl http://localhost:3000/api/products | jq length
```
Should return: **642**

---

## 📋 Task 2: Test Bundle Database Schema

### Step 1: Verify Bundle Tables Exist
The Prisma schema already includes:
- ✅ `ProductBundle` model (lines 263-288)
- ✅ `BundleItem` model (lines 290-298)
- ✅ Proper relations configured

### Step 2: Apply Migrations
```bash
# Deploy pending migrations
npm run prisma:migrate:deploy

# Generate Prisma Client
npm run prisma:generate
```

### Step 3: Open Prisma Studio (Optional)
```bash
npm run prisma:studio
```
This opens a GUI at `http://localhost:5555` where you can:
- Browse `ProductBundle` table
- Browse `BundleItem` table
- Verify relations are working

---

## 📋 Task 3: Seed Sample Bundles for Testing

### Run Bundle Seeding Script
```bash
npm run db:seed-bundles
```

This creates 3 test bundles:

1. **"La Molienda Starter Pack"** (5 products)
   - 10% discount
   - Featured bundle

2. **"Marinela Sweet Bundle"** (8 products)
   - 15% discount
   - Featured bundle

3. **"Gamesa Cookie Mix"** (6 products)
   - 12% discount
   - Featured bundle

The script automatically:
- Selects products from your database
- Calculates bundle prices with discounts
- Creates bundle items linking products to bundles

---

## 📋 Task 4: Full Backend Integration Test

### Test Bundle API Endpoints

#### 1. List All Bundles
```bash
curl -X GET http://localhost:3000/api/admin/bundles
```

#### 2. Get Specific Bundle
```bash
curl -X GET http://localhost:3000/api/admin/bundles/1
```
(Replace `1` with actual bundle ID from the list)

#### 3. Create New Bundle
```bash
curl -X POST http://localhost:3000/api/admin/bundles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Bundle",
    "productIds": [1, 2, 3],
    "price": 25.99,
    "discountPercent": 10
  }'
```

**Note:** The bundle API requires authentication. You may need to:
- Get an auth token first
- Or modify the API route to allow testing without auth (temporary)

### Database Verification
```bash
npm run db:verify-bundle-consistency
```

This checks:
- ✅ All bundles have items
- ✅ All bundle items reference valid products
- ✅ Bundle prices are consistent with product prices
- ✅ Foreign key relationships are valid

---

## 🔧 Troubleshooting

### Issue: Prisma Client Not Found
**Solution:**
```bash
# Generate Prisma client from the correct schema location
npm run prisma:generate

# Or manually:
cd remote_azteka_dsd
npx prisma generate
```

**Note:** The scripts use Prisma Client from `@prisma/client`. Make sure the Prisma client is generated before running scripts. The Prisma schema is located at `remote_azteka_dsd/prisma/schema.prisma`.

### Issue: Database Connection Error
**Solution:**
- Check `.env.production` or `.env` file
- Verify `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running

### Issue: CSV File Not Found
**Solution:**
- Provide explicit path: `node scripts/clean-external-products.mjs /path/to/your/products.csv`
- Or place CSV in one of these locations:
  - `data/products-master.csv`
  - `tests/products-master.csv`
  - `remote_azteka_dsd/data/products-master.csv`

### Issue: Bundle API Returns 401 Unauthorized
**Solution:**
The bundle API routes require authentication. For testing, you can:
1. Get a valid JWT token from `/api/auth/login`
2. Or temporarily disable auth in `server.mjs` (for testing only)

---

## 📊 Expected Results

After completing all tasks:

1. **Database:**
   - Exactly 642 products (CSV imports only)
   - 3 test bundles created
   - All bundle relationships valid

2. **API:**
   - `/api/products` returns 642 products
   - `/api/admin/bundles` returns 3 bundles
   - Bundle endpoints work correctly

3. **Verification:**
   - `db:verify-bundle-consistency` passes with 0 errors

---

## 🚀 Quick Start Commands

```bash
# 1. Backup
npm run db:backup-full

# 2. Clean external products
npm run db:clean-external

# 3. Verify count
npm run db:count-products

# 4. Apply migrations
npm run prisma:migrate:deploy
npm run prisma:generate

# 5. Seed bundles
npm run db:seed-bundles

# 6. Verify bundles
npm run db:verify-bundle-consistency

# 7. Test API
curl http://localhost:3000/api/products | jq length
curl http://localhost:3000/api/admin/bundles
```

---

## 📝 Notes

- All scripts use Prisma Client from `@prisma/client`
- Prisma schema is located at `remote_azteka_dsd/prisma/schema.prisma`
- Scripts work from the root directory
- Backups are saved in `backups/` directory
- CSV products are identified by slug matching and source field

