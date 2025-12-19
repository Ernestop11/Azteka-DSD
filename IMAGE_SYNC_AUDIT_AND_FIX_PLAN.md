# 🔍 Image Upload & Sync System Audit Report
## Critical Issues Found & Fix Plan

**Date:** Generated on request  
**Status:** 🔴 CRITICAL - Images not syncing across UIs, upload failures

---

## 📋 Executive Summary

After the visual-tools page update, multiple critical issues were introduced:
1. **Image upload failures** on inventory page
2. **Images not syncing** across different UIs (admin products, employee inventory, catalog pages)
3. **Inconsistent filename strategies** causing image loss
4. **Missing cache invalidation** leading to stale data
5. **Alpura Vaquita products** specifically affected (images uploaded but not visible)

---

## 🔴 Critical Issues Identified

### 1. **DUPLICATE UPLOAD ENDPOINTS** (High Priority)

**Problem:**
- Two different upload endpoints with different behaviors:
  - `/api/admin/products/uploadImage` - Uses timestamp-based filenames (`${timestamp}-${file.name}`)
  - `/api/employee/products/upload-image` - Uses product ID (`${productId}.png`)

**Impact:**
- Images uploaded from admin UI use different filenames than inventory UI
- Images can't be found when switching between UIs
- Alpura Vaquita images may have been saved with wrong filename

**Location:**
- `app/api/admin/products/uploadImage/route.ts` (timestamp-based)
- `app/api/employee/products/upload-image/route.ts` (productId-based)

---

### 2. **INCONSISTENT FILENAME STRATEGY** (High Priority)

**Problem:**
- Admin upload: `1234567890-image.jpg` (timestamp-based, unique per upload)
- Employee upload: `product-id.png` (productId-based, overwrites previous)
- Visual-tools test: Uses test ID `test-visual-tools` which doesn't match any product

**Impact:**
- Same product can have multiple image files
- Database points to one filename, but file might be different
- Images appear/disappear depending on which UI was used

**Current State:**
```typescript
// Admin endpoint (WRONG for sync)
const filename = `${timestamp}-${file.name}`

// Employee endpoint (CORRECT for sync)
const filename = `${productId}.png`
```

---

### 3. **MISSING DATABASE UPDATE IN ADMIN ENDPOINT** (Critical)

**Problem:**
- `/api/admin/products/uploadImage` returns imageUrl but **DOES NOT UPDATE THE DATABASE**
- Only saves file to disk, doesn't update `product.imageUrl` field

**Impact:**
- Images uploaded from admin UI are saved but product record not updated
- Images won't show in any UI until manual database update
- This explains why Alpura Vaquita images "disappeared"

**Code Issue:**
```typescript
// app/api/admin/products/uploadImage/route.ts
// ❌ MISSING: Database update
await writeFile(filepath, buffer)
return NextResponse.json({ imageUrl }) // Returns URL but DB not updated!
```

---

### 4. **CACHE INVALIDATION INCOMPLETE** (Medium Priority)

**Problem:**
- Employee endpoint invalidates cache: `revalidateTag('catalog')`, `revalidatePath('/employee/inventory')`
- Admin endpoint does NOT invalidate cache
- Next.js cache may serve stale images

**Impact:**
- Images uploaded but not visible until cache expires
- Different UIs show different states
- User confusion about whether upload succeeded

---

### 5. **VISUAL-TOOLS PAGE INTERFERENCE** (Medium Priority)

**Problem:**
- Visual-tools page uses employee upload endpoint with test ID
- Test uploads may have overwritten real product images
- Comment in code says "done with work on inventory page" but actually broke it

**Location:**
- `app/admin/visual-tools/page.tsx` line 48: `formData.append('id', 'test-visual-tools')`

**Impact:**
- Test uploads may have corrupted product image references
- Confusion about which endpoint to use

---

### 6. **IMAGE URL RESOLUTION INCONSISTENCIES** (Low Priority)

**Problem:**
- Multiple helper functions: `getPublicImageUrl()`, `normalizeProductImage()`
- Some components use direct `product.imageUrl`, others use helpers
- Inventory page uses Next.js `Image` component which may cache differently

**Impact:**
- Images may not resolve correctly in some contexts
- Caching differences between React and Next.js Image components

---

## 🎯 Root Cause Analysis

### What Happened:

1. **Visual-tools page was created** with new AI background removal features
2. **Used employee upload endpoint** which saves as `${productId}.png`
3. **Admin upload endpoint was NOT updated** to match this strategy
4. **Admin endpoint doesn't update database** - images saved but not linked
5. **Cache not invalidated** - stale images shown
6. **Alpura Vaquita images** were likely uploaded via admin UI, saved with timestamp filename, but database never updated

### Why Images "Disappeared":

1. User uploaded Alpura Vaquita images via **admin products UI**
2. Images saved as `timestamp-vaquita.jpg` in `/public/uploads/products/`
3. **Database NOT updated** - `product.imageUrl` still null or old value
4. Image file exists but product record doesn't point to it
5. When viewing in inventory page, it shows placeholder because `imageUrl` is null
6. User tries to re-upload from inventory page, but upload may be failing silently

---

## ✅ Fix Plan

### Phase 1: Immediate Fixes (Critical)

#### Fix 1.1: Consolidate Upload Endpoints
**Action:** Make admin endpoint use same strategy as employee endpoint
- Use `${productId}.png` filename consistently
- Update database after upload
- Add cache invalidation

**Files to modify:**
- `app/api/admin/products/uploadImage/route.ts`

#### Fix 1.2: Fix Admin Upload Database Update
**Action:** Add database update to admin upload endpoint
- Update `product.imageUrl` after file save
- Use Prisma to update product record
- Add proper error handling

#### Fix 1.3: Fix Alpura Vaquita Images
**Action:** Find and fix the specific products
- Search for Alpura Vaquita products in database
- Check if image files exist but database not updated
- Manually sync or re-upload images

---

### Phase 2: Sync & Cache Improvements

#### Fix 2.1: Unified Upload Endpoint
**Action:** Create single upload endpoint used by all UIs
- Single source of truth: `/api/products/upload-image`
- Consistent filename strategy: `${productId}.png`
- Always updates database
- Always invalidates cache

#### Fix 2.2: Real-time Sync
**Action:** Add WebSocket or polling for image updates
- Broadcast image updates to all connected clients
- Force refresh of product lists when images change
- Use React Query invalidation

#### Fix 2.3: Cache Strategy
**Action:** Implement consistent cache invalidation
- Invalidate Next.js cache tags
- Invalidate React Query cache
- Add cache-busting query params for images

---

### Phase 3: Prevention & Monitoring

#### Fix 3.1: Remove Visual-Tools Test Endpoint
**Action:** Fix visual-tools to use real product IDs or separate test endpoint
- Don't use real upload endpoint for tests
- Create dedicated test upload endpoint
- Or require real product ID even in test mode

#### Fix 3.2: Add Upload Validation
**Action:** Validate uploads before saving
- Check product exists before upload
- Validate file type and size
- Return clear error messages

#### Fix 3.3: Add Image Sync Verification
**Action:** Add health check endpoint
- Verify image files exist for products with imageUrl
- Report orphaned files (files without product reference)
- Report missing files (product.imageUrl but file doesn't exist)

---

## 🔧 Implementation Details

### Fix 1.1: Update Admin Upload Endpoint

```typescript
// app/api/admin/products/uploadImage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Validate file type
    const mimeType = (file.type || '').toLowerCase()
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json({ error: 'File must be a PNG or JPG image' }, { status: 400 })
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Use product ID as filename for consistency
    const filename = `${productId}.png`
    const filepath = join(uploadsDir, filename)

    // Convert and save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update database - THIS WAS MISSING!
    const imageUrl = `/uploads/products/${filename}`
    await prisma.product.update({
      where: { id: productId },
      data: { imageUrl }
    })

    // Invalidate caches
    revalidateTag('products')
    revalidateTag('catalog')
    revalidatePath('/admin/products')
    revalidatePath('/employee/inventory')
    revalidatePath('/catalog')

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
```

### Fix 1.2: Image Sync Verification Script

```typescript
// scripts/verify-image-sync.mjs
import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'
import { join } from 'path'
import { readdir } from 'fs/promises'

const prisma = new PrismaClient()

async function verifyImageSync() {
  console.log('🔍 Verifying image sync...\n')

  // Find products with imageUrl but file missing
  const products = await prisma.product.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, name: true, imageUrl: true }
  })

  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
  const files = await readdir(uploadsDir)

  let missingFiles = 0
  let orphanedFiles = 0
  let synced = 0

  // Check products
  for (const product of products) {
    if (!product.imageUrl) continue
    
    const filename = product.imageUrl.replace('/uploads/products/', '')
    if (!files.includes(filename)) {
      console.log(`❌ Missing file: ${product.name} (${product.imageUrl})`)
      missingFiles++
    } else {
      synced++
    }
  }

  // Check for orphaned files
  for (const file of files) {
    const productId = file.replace('.png', '').replace(/-\d+-.*$/, '') // Handle both formats
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    })
    
    if (!product) {
      console.log(`⚠️  Orphaned file: ${file}`)
      orphanedFiles++
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`   ✅ Synced: ${synced}`)
  console.log(`   ❌ Missing files: ${missingFiles}`)
  console.log(`   ⚠️  Orphaned files: ${orphanedFiles}`)
}

verifyImageSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 🧪 Testing Plan

### Test 1: Upload from Admin UI
1. Go to `/admin/products`
2. Edit a product
3. Upload image
4. Verify image shows in admin UI
5. Verify image shows in inventory UI (`/employee/inventory`)
6. Verify image shows in catalog UI

### Test 2: Upload from Inventory UI
1. Go to `/employee/inventory`
2. Click on a product
3. Go to Image tab
4. Upload image
5. Verify image shows immediately
6. Verify image shows in admin UI
7. Verify image shows in catalog UI

### Test 3: Alpura Vaquita Specific
1. Search for "Alpura Vaquita Chocolate" in database
2. Check if `imageUrl` is set
3. Check if file exists at that path
4. If file missing but URL set, re-upload
5. If URL missing but file exists, update database

### Test 4: Cache Invalidation
1. Upload image from one UI
2. Immediately check other UI (should show new image)
3. If not showing, check cache headers
4. Verify revalidateTag/revalidatePath working

---

## 📝 Migration Steps

### Step 1: Backup Current State
```bash
# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/
```

### Step 2: Fix Admin Upload Endpoint
- Update `app/api/admin/products/uploadImage/route.ts` with new code
- Test upload from admin UI
- Verify database update

### Step 3: Fix Orphaned Images
- Run verification script
- For products with imageUrl but missing file: re-upload
- For files without product reference: delete or assign

### Step 4: Fix Alpura Vaquita
- Find product IDs for all 3 Vaquita products
- Check current imageUrl values
- Re-upload images if needed
- Verify sync across all UIs

### Step 5: Test & Verify
- Run full test suite
- Check all UIs show consistent images
- Monitor for 24 hours

---

## 🚨 Immediate Actions Required

1. **STOP using admin upload endpoint** until fixed
2. **Use employee upload endpoint** for all uploads temporarily
3. **Check Alpura Vaquita products** in database
4. **Run verification script** to find all sync issues
5. **Fix admin endpoint** (Fix 1.1)
6. **Re-upload Alpura Vaquita images** if needed

---

## 📊 Success Metrics

- ✅ All upload endpoints use consistent filename strategy
- ✅ All uploads update database immediately
- ✅ Images sync across all UIs within 1 second
- ✅ Zero orphaned files
- ✅ Zero missing files
- ✅ Alpura Vaquita images visible in all UIs
- ✅ Upload success rate: 100%

---

## 🔗 Related Files

- `app/api/admin/products/uploadImage/route.ts` - Admin upload (NEEDS FIX)
- `app/api/employee/products/upload-image/route.ts` - Employee upload (WORKING)
- `app/admin/visual-tools/page.tsx` - Visual tools (NEEDS REVIEW)
- `app/employee/inventory/page.tsx` - Inventory page (USES EMPLOYEE ENDPOINT)
- `app/admin/products/ProductEditor.tsx` - Admin product editor (USES ADMIN ENDPOINT)
- `lib/imageUrl.ts` - Image URL helpers
- `prisma/schema.prisma` - Database schema

---

**Next Steps:** Implement Fix 1.1 immediately, then proceed with verification and Alpura Vaquita fix.

