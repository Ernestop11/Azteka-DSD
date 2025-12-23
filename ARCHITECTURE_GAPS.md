# 🏗️ ARCHITECTURE GAPS - MVP vs Current

## 🔍 Root Cause Analysis

### **Problem**: Products not syncing across pages

**Symptoms**:
- Some pages show products, some don't
- Images load in console but don't render
- API endpoints return different results
- No consistent data flow

## 🎯 MVP Architecture (Expected)

### Single Source of Truth
```
Database (PostgreSQL)
    ↓
Prisma Client
    ↓
API Routes (Next.js App Router)
    ↓
Frontend Pages
```

### Expected Flow
1. **Database**: 666 products ✅
2. **API**: `/api/products`, `/api/admin/products`, `/api/employee/products`
3. **Frontend**: All pages use same API endpoints
4. **Images**: Served from `/public/uploads/products/`

## ❌ Current Architecture (Broken)

### Multiple Competing Systems
1. **Next.js App Router** (`app/api/*/route.ts`) ← Should be primary
2. **Express Server** (`server.mjs`) ← Legacy?
3. **Old Express** (`src/api/*/route.js`) ← Legacy?

### Issues Found

#### 1. **Missing Routes**
- ❌ `/api/employee/products` - **FIXED** ✅
- ❌ Some routes return 404

#### 2. **Prisma Relation Name Mismatch**
- ❌ Code used `brand` and `category` (lowercase)
- ✅ Schema uses `Brand` and `Category` (capitalized)
- **FIXED** ✅

#### 3. **Query Filtering**
- `/api/products` filters by `inStock: true` (line 141 in catalog.ts)
- This might exclude products that should be visible
- **NEEDS REVIEW**

#### 4. **Authentication Inconsistency**
- Some routes require auth, some don't
- Employee routes need proper auth setup
- **IN PROGRESS**

#### 5. **Image Path Resolution**
- Images load in console but don't render
- Path mismatch between database and filesystem
- **NEEDS FIX**

## 🔧 Fixes Applied

1. ✅ Created `/api/employee/products` route
2. ✅ Fixed Prisma relation names (`Brand`/`Category`)
3. 🔄 Testing authentication flow
4. 🔄 Investigating image path issues

## 📋 Next Steps

1. **Consolidate API Architecture**
   - Remove legacy Express routes
   - Use only Next.js App Router
   - Document all endpoints

2. **Fix Image Paths**
   - Verify database paths match filesystem
   - Check Next.js static file serving
   - Test image URLs

3. **Standardize Queries**
   - Review `inStock` filtering
   - Ensure consistent product visibility
   - Add proper error handling

4. **Authentication**
   - Standardize auth across all routes
   - Test employee/admin access
   - Fix session management

