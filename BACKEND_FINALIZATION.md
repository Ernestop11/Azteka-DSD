# Backend Finalization & Deployment Guide

## ✅ Completed Tasks

### 1. API Route Validation & Enhancement

All backend API routes have been validated and enhanced with:

- ✅ **Full error handling** with proper HTTP status codes
- ✅ **Schema validation** for all inputs
- ✅ **Consistent error response format** (`{ error, message, field?, details? }`)
- ✅ **Optimized Prisma queries** with selective includes

#### Enhanced Routes:

**Products Management** (`/api/products/manage/*`)
- `GET /` - List products with pagination, filters, and optimized includes
- `GET /:id` - Get single product with full relations
- `POST /` - Create product with validation
- `PUT /:id` - Full update with validation
- `PATCH /:id` - Partial update with validation
- `DELETE /:id` - Delete with constraint checking

**Categories** (`/api/categories/*`)
- `GET /` - List categories with subcategories and counts
- `GET /:id` - Get single category
- `POST /` - Create category with slug validation
- `PUT /:id` - Update category
- `PATCH /:id` - Partial update
- `DELETE /:id` - Delete with product count check

**Brands** (`/api/brands/*`)
- `GET /` - List brands with filters and counts
- `GET /:id` - Get single brand
- `POST /` - Create brand with validation
- `PUT /:id` - Update brand
- `PATCH /:id` - Partial update
- `DELETE /:id` - Delete with product count check

**Catalog Layout** (`/api/catalog/layout`)
- `GET /` - Get front page layout with optimized nested queries
- `POST /` - Create or update layout

**Health Check** (`/api/debug/health-check`)
- `GET /` - Comprehensive system health check

### 2. Error Handling Standards

All routes now follow consistent error handling:

```javascript
// Standard error response format
{
  error: 'ERROR_CODE',        // e.g., 'VALIDATION_ERROR', 'NOT_FOUND', 'DATABASE_ERROR'
  message: 'Human readable message',
  field?: 'fieldName',         // For validation errors
  details?: 'Technical details' // Only in development mode
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (delete success)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entries, constraint violations)
- `500` - Internal Server Error
- `503` - Service Unavailable (database issues)

### 3. Query Optimizations

**Product List Query:**
- Selective includes (only needed fields)
- Single image per product (first image only)
- Category and brand with minimal fields
- Pagination support

**Layout Query:**
- Nested includes optimized
- Active filters applied at database level
- Ordered results for consistent display

**Bundle Lookups:**
- Includes products with images
- Filters hidden/out-of-stock products
- Selective field selection

### 4. Seed Verification Script

Created `scripts/verify-seed.mjs`:
- Verifies product count (min: 10)
- Verifies category count (min: 3)
- Verifies brand count (min: 3)
- Checks for orphaned records
- Checks for missing relationships
- Configurable via environment variables

**Usage:**
```bash
node scripts/verify-seed.mjs
```

**Environment Variables:**
- `MIN_PRODUCTS` - Minimum expected products (default: 10)
- `MIN_CATEGORIES` - Minimum expected categories (default: 3)
- `MIN_BRANDS` - Minimum expected brands (default: 3)

### 5. Production Build Scripts

**Build Script** (`scripts/build-production.mjs`):
- Generates Prisma Client
- Verifies seed data
- Checks syntax errors
- Sets up logs directory
- Verifies PM2 configuration

**Deployment Script** (`scripts/deploy.mjs`):
- Runs build script
- Applies database migrations
- Restarts PM2 process
- Runs health check

**Usage:**
```bash
# Build only
node scripts/build-production.mjs

# Full deployment
node scripts/deploy.mjs
```

### 6. PM2 Configuration

Updated `ecosystem.config.js`:
- Health check endpoint: `/api/debug/health-check`
- Proper logging configuration
- Environment variable management
- Auto-restart configuration

## 📁 File Structure

```
.
├── server.mjs                    # Main Express server (updated)
├── ecosystem.config.js           # PM2 configuration (updated)
├── src/
│   └── api/
│       ├── products/
│       │   └── manage.js         # Enhanced product management
│       ├── categories/
│       │   └── route.js          # Enhanced category routes
│       ├── brands/
│       │   └── route.js          # Enhanced brand routes
│       ├── catalog/
│       │   └── layout.js         # NEW: Layout routes
│       └── debug/
│           └── health-check.js   # NEW: Health check endpoint
└── scripts/
    ├── build-production.mjs      # NEW: Build script
    ├── deploy.mjs                # NEW: Deployment script
    └── verify-seed.mjs           # NEW: Seed verification
```

## 🚀 Deployment Steps

### Pre-Deployment Checklist

- [ ] `.env.production` file exists with correct `DATABASE_URL`
- [ ] Database is accessible from deployment server
- [ ] Prisma schema is up to date
- [ ] All migrations are ready
- [ ] PM2 is installed globally (`npm install -g pm2`)

### Step 1: Build

```bash
cd /path/to/project
node scripts/build-production.mjs
```

This will:
1. Load environment variables
2. Generate Prisma Client
3. Verify seed data
4. Check syntax
5. Setup logs directory

### Step 2: Run Migrations

```bash
npx prisma migrate deploy
```

**Note:** This applies pending migrations. Make sure all migrations are tested in development first.

### Step 3: Deploy

**Option A: Use deployment script**
```bash
node scripts/deploy.mjs
```

**Option B: Manual deployment**
```bash
# Build
node scripts/build-production.mjs

# Migrate
npx prisma migrate deploy

# Restart PM2
pm2 restart azteka-api-live
# OR if first time
pm2 start ecosystem.config.js
pm2 save
```

### Step 4: Verify

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs azteka-api-live --lines 50

# Health check
curl http://localhost:3000/api/debug/health-check

# Verify seed data
node scripts/verify-seed.mjs
```

## 🔍 Health Check Endpoint

**Endpoint:** `GET /api/debug/health-check`

**Response:**
```json
{
  "status": "ok" | "warning" | "error",
  "timestamp": "2025-11-14T...",
  "checks": {
    "database": {
      "status": "ok",
      "latency": "5ms",
      "error": null
    },
    "prisma": {
      "status": "ok",
      "error": null
    },
    "layout": {
      "status": "ok",
      "exists": true,
      "count": 1,
      "error": null
    },
    "seed": {
      "status": "ok",
      "products": 25,
      "categories": 5,
      "brands": 8,
      "error": null
    }
  }
}
```

**Status Codes:**
- `200` - All checks passed (ok or warning)
- `503` - Critical errors detected

## 🎨 Design Automation Layer

### Canva Integration

The backend includes a Design Automation Layer powered by Canva API for automatic generation of:
- Hero banners
- Product cards
- Bundle graphics
- Brand row images
- Promotional banners

### Design API Routes (Admin Auth Required)

- `POST /api/design/render-hero` - Generate hero banner
- `POST /api/design/render-product-card` - Generate product card
- `POST /api/design/render-bundle` - Generate bundle graphic
- `POST /api/design/render-brand-row` - Generate brand row
- `POST /api/design/render-promo` - Generate promotional banner
- `GET /api/design/status/:id` - Check async render job status

### Canva Setup

1. **Get Canva API Credentials:**
   - Sign up for Canva API access
   - Create a Brand Kit in Canva
   - Get API key, Brand Kit ID, Team ID, and Project Folder ID

2. **Configure Templates:**
   - Edit `src/services/design/templates.json`
   - Add your Canva template IDs for each design type

3. **Set Environment Variables:**
   ```env
   CANVA_API_KEY=your_api_key
   CANVA_BRAND_KIT_ID=your_brand_kit_id
   CANVA_TEAM_ID=your_team_id
   CANVA_PROJECT_FOLDER_ID=your_folder_id
   ```

4. **Test Design Generation:**
   ```bash
   # Test hero banner generation
   curl -X POST http://localhost:3000/api/design/render-hero \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Welcome to Azteka",
       "subtitle": "Fresh Mexican Products",
       "backgroundColor": "#ff6b6b"
     }'
   ```

### Batch Generation

Generate designs for all products, categories, bundles, and brands:

```bash
# Generate all design types
node scripts/batch-generate-designs.mjs

# Generate specific types only
node scripts/batch-generate-designs.mjs heroes products
node scripts/batch-generate-designs.mjs bundles brands
```

### Auto-Generation

When Admin saves a layout section:
- Hero sections automatically generate hero banners
- Bundle sections automatically generate bundle graphics
- Brand row sections automatically generate brand images

This happens asynchronously and doesn't block the API response.

### Error Handling

Design routes return structured errors:
- `TIMEOUT` - Canva API request timed out
- `INVALID_TEMPLATE` - Template not configured or not found
- `API_RATE_LIMIT` - Canva API rate limit exceeded
- `MISSING_FIELDS` - Required fields missing
- `STORAGE_FAILURE` - Failed to save generated image

## 📊 API Route Summary

### Public Routes (No Auth)
- `GET /api/products` - List products (optimized)
- `GET /api/catalog/layout` - Get layout
- `GET /api/debug/health-check` - Health check

### Admin Routes (Auth Required)
- `GET /api/products/manage` - List all products
- `GET /api/products/manage/:id` - Get product
- `POST /api/products/manage` - Create product
- `PUT /api/products/manage/:id` - Update product
- `PATCH /api/products/manage/:id` - Partial update
- `DELETE /api/products/manage/:id` - Delete product

- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `PATCH /api/categories/:id` - Partial update
- `DELETE /api/categories/:id` - Delete category

- `GET /api/brands` - List brands
- `GET /api/brands/:id` - Get brand
- `POST /api/brands` - Create brand
- `PUT /api/brands/:id` - Update brand
- `PATCH /api/brands/:id` - Partial update
- `DELETE /api/brands/:id` - Delete brand

- `POST /api/catalog/layout` - Create/update layout

## 🔧 Environment Variables

Required in `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/shadow_db"

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://aztekafoods.com

# Uploads
UPLOAD_DIR=/srv/azteka-dsd/uploads
UPLOAD_BASE_URL=https://aztekafoods.com/uploads

# Canva Design Automation (optional but recommended)
CANVA_API_KEY=your_canva_api_key_here
CANVA_BRAND_KIT_ID=your_brand_kit_id_here
CANVA_TEAM_ID=your_team_id_here
CANVA_PROJECT_FOLDER_ID=your_project_folder_id_here
CANVA_UPLOAD_BASE_URL=https://aztekafoods.com/uploads

# Seed Verification (optional)
MIN_PRODUCTS=10
MIN_CATEGORIES=3
MIN_BRANDS=3
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check Prisma Client
npx prisma generate

# Verify DATABASE_URL
echo $DATABASE_URL
```

### PM2 Issues

```bash
# Check status
pm2 status

# View logs
pm2 logs azteka-api-live

# Restart
pm2 restart azteka-api-live

# Stop
pm2 stop azteka-api-live

# Delete
pm2 delete azteka-api-live
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset (DANGER - only in dev)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name
```

### Health Check Failures

```bash
# Manual health check
curl http://localhost:3000/api/debug/health-check | jq

# Check specific component
curl http://localhost:3000/api/debug/health-check | jq '.checks.database'
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Health check returns `200 OK`
- [ ] Database connection is working
- [ ] Prisma Client is generated
- [ ] Seed data is present (if applicable)
- [ ] PM2 process is running
- [ ] Logs are being written
- [ ] API routes respond correctly
- [ ] Error handling works as expected
- [ ] Validation works on invalid inputs

## 📝 Notes

- **No Frontend Changes**: All changes are backend-only as requested
- **Backward Compatible**: Existing API routes maintain compatibility
- **Production Ready**: All routes include proper error handling and validation
- **Optimized**: Queries are optimized for performance
- **Tested**: Health check endpoint validates all components

## 🎯 Next Steps

1. **Run Build**: `node scripts/build-production.mjs`
2. **Deploy Migrations**: `npx prisma migrate deploy`
3. **Start Server**: `pm2 start ecosystem.config.js`
4. **Verify Health**: `curl http://localhost:3000/api/debug/health-check`
5. **Verify Seed**: `node scripts/verify-seed.mjs`

Backend is now hardened, optimized, and ready for production deployment! 🚀

