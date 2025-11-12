# Smoke Test Results & Migration Plan

## Current State Analysis

### What We Found

1. **Database Schema**: Migration file exists but is incomplete
   - ✅ Has: categories, products, sales_reps, customers, orders, order_items
   - ❌ Missing: product_bundles, promotions, product_promotions, special_offers, rewards_badges, brands, subcategories

2. **Application Dependencies**:
   - Currently uses Supabase client (`@supabase/supabase-js`)
   - All database queries go through Supabase client
   - Needs to be replaced with direct PostgreSQL connection

3. **Build Status**: Unknown - need to check VPS

## Missing Tables in Migration

The app uses these tables that are NOT in the migration file:

1. **brands** - Product brands
2. **subcategories** - Subcategories within categories
3. **product_bundles** - Product bundle packages
4. **promotions** - Promotional offers
5. **product_promotions** - Junction table linking products to promotions
6. **special_offers** - Special offer campaigns
7. **rewards_badges** - Customer reward badges

## Next Steps

### Step 1: Run Smoke Test on VPS
```bash
ssh root@77.243.85.8
cd /path/to/project
bash smoke-test.sh
```

This will tell us:
- Where the project is located
- If there are multiple build locations
- Current web server configuration
- PostgreSQL status
- What's actually deployed

### Step 2: Complete Database Schema
- Add missing tables to migration file
- Create complete PostgreSQL schema

### Step 3: Replace Supabase with PostgreSQL
- Create API backend (Node.js/Express or similar)
- Replace Supabase client calls with API calls
- Or use direct PostgreSQL connection from frontend (less secure, not recommended)

### Step 4: Deploy and Test
- Build the app
- Set up PostgreSQL database
- Configure web server
- Test all functionality

## Recommended Architecture

Since you want everything in-house on your VPS:

**Option 1: Full Stack with API Backend (Recommended)**
```
Frontend (React/Vite) → API Backend (Node.js/Express) → PostgreSQL
```
- More secure (database credentials stay on server)
- Better for production
- Can add authentication, rate limiting, etc.

**Option 2: Direct PostgreSQL from Frontend (Not Recommended)**
```
Frontend (React/Vite) → PostgreSQL (direct connection)
```
- Less secure (exposes database connection)
- Requires CORS setup
- Not suitable for production

## Action Items

1. ✅ Run smoke test on VPS
2. ⏳ Complete database schema
3. ⏳ Create API backend
4. ⏳ Replace Supabase calls
5. ⏳ Test and deploy


