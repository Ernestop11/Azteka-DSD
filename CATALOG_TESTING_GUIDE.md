# Catalog Testing Guide

**Complete guide for testing AI-generated images, product ingestion, and catalog UI components**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Ingestion Page](#test-ingestion-page)
3. [Testing AI Image Generation](#testing-ai-image-generation)
4. [Testing Product Ingestion](#testing-product-ingestion)
5. [Viewing Canva/AI Assets](#viewing-canva-ai-assets)
6. [Confirming Draft Products](#confirming-draft-products)
7. [Developer Design Preview](#developer-design-preview)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Catalog UI now includes comprehensive testing tools to validate:
- ✅ AI-generated product images
- ✅ Canva hero banners
- ✅ Product ingestion from POs
- ✅ Draft product management
- ✅ Visual component quality

### Quick Access URLs

- **Test Ingestion**: `/catalog/test-ingestion`
- **Design Preview**: `/admin/dev-design-preview`
- **Sales Rep Catalog**: `/catalog/salesrep`
- **Customer Catalog**: `/catalog/customer`

---

## Test Ingestion Page

### Purpose
Visual testing interface to monitor ALL products, image status, and trigger bulk regeneration.

### Location
```
/catalog/test-ingestion
```

### Features

#### 1. Real-time Statistics Dashboard
Displays 5 key metrics:
- **Total Products**: Count of all products in database
- **Missing Images**: Products without image URLs
- **AI Generated**: Products with Canva/AI images
- **Drafts**: Products with `status: 'draft'`
- **Active**: Products with `status: 'active'`

#### 2. Product Grid Display
Shows all products with:
- Product image (or placeholder)
- Status badge (Missing, AI Generated, Draft, OK, Processing)
- Product name, description, SKU
- Current status (ACTIVE/DRAFT)
- Full image URL path

#### 3. Filter System
Three filter options (can be combined):
- **Missing Images Only**: Show products without images
- **AI Generated Only**: Show products with AI/Canva images
- **Drafts Only**: Show products in draft status

#### 4. Bulk Actions
- **Regenerate All Product Images**: POST to `/api/products/force-regenerate-all`
- **Refresh**: Reload all products from database

### Usage Example

```typescript
// 1. Navigate to test page
window.location.href = '/catalog/test-ingestion';

// 2. Filter by missing images
// Click "Missing Images" filter button

// 3. Regenerate all images
// Click "Regenerate All Product Images"
// Confirm dialog
// Wait for processing (shows loading overlay)

// 4. Refresh to see updated images
// Click "Refresh" button
```

### API Endpoints Used

```typescript
// Fetch all products
GET /api/products
Response: Product[]

// Force regenerate all images
POST /api/products/force-regenerate-all
Response: { message: string, processed: number }
```

---

## Testing AI Image Generation

### Step-by-Step Process

#### 1. Check Current Image Status
```bash
# Navigate to test ingestion page
http://localhost:5000/catalog/test-ingestion

# Look at statistics:
# - "Missing Images" shows count without images
# - "AI Generated" shows count with AI images
```

#### 2. Trigger Bulk Regeneration
```typescript
// Via UI:
// 1. Click "Regenerate All Product Images" button
// 2. Confirm dialog
// 3. Wait for processing (2-30 seconds per product)

// Via API:
const response = await fetch('/api/products/force-regenerate-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const result = await response.json();
console.log(result); // { message: '...', processed: 50 }
```

#### 3. Monitor Processing
```bash
# Products with status='draft' and no image show:
# - Animated spinning RefreshCw icon
# - "Processing" badge
# - Purple pulsing animation

# Check console logs:
tail -f logs/server.log | grep "AI_IMAGE"
```

#### 4. Verify Completed Images
```bash
# After processing, products should show:
# - "AI Generated" badge (cyan color)
# - Image from /canva-assets/products/{id}.webp
# - Glossy overlay effects
# - Category-specific glow on hover
```

### Image Status Indicators

| Status | Badge | Icon | Meaning |
|--------|-------|------|---------|
| Missing | Red | XCircle | No imageUrl in database |
| Processing | Purple | RefreshCw (spinning) | status='draft', no image |
| AI Generated | Cyan | Sparkles | URL contains /ai-generated/ or /canva-assets/ |
| Draft | Orange | AlertCircle | status='draft' |
| OK | Green | CheckCircle | Has image, status='active' |

---

## Testing Product Ingestion

### Auto-Ingestion from Purchase Orders

#### 1. Upload PO via Admin
```bash
# Navigate to Admin Dashboard
http://localhost:5000/admin

# Use PO upload feature
# - Select PO file (PDF/CSV)
# - Click "Auto-Ingest"
# - LoadingOverlay shows "Auto-ingesting Purchase Order..."
```

#### 2. Verify New Products
```bash
# Navigate to test ingestion
http://localhost:5000/catalog/test-ingestion

# Check statistics:
# - Total Products should increase
# - New products appear with status='draft'
# - Missing Images count includes new products
```

#### 3. Trigger Image Generation for New Products
```bash
# Click "Regenerate All Product Images"
# - Includes newly ingested products
# - AI generates images for all missing
# - Processing badges appear on cards
```

#### 4. Confirm Drafts to Active
```bash
# After images generated and verified:
# 1. Filter by "Drafts Only"
# 2. Manually review each product
# 3. Via Admin Dashboard, change status to 'active'
# 4. Products now appear in customer/salesrep catalogs
```

### Manual Product Creation

```typescript
// Via Admin Product Manager
// 1. Click "Add New Product"
// 2. Fill in details:
{
  name: "Test Product",
  sku: "TEST-001",
  price: 9.99,
  categoryId: "beverages",
  brandId: "coca-cola",
  status: "draft", // Always start as draft
  // imageUrl: leave empty for AI generation
}

// 3. Save product
// 4. Navigate to test-ingestion page
// 5. Click "Regenerate All Product Images"
// 6. Wait for AI to generate image
// 7. Verify in test-ingestion page
// 8. Change status to 'active' in Admin
```

---

## Viewing Canva/AI Assets

### Asset Categories

The system supports 5 categories of AI/Canva assets:

#### 1. Product Images
```typescript
// Location: /canva-assets/products/{productId}.webp
// Usage: ProductGrid component
// Fallback chain:
// 1. /canva-assets/products/{id}.webp
// 2. product.imageUrl (database)
// 3. /placeholder-product.png
```

#### 2. Hero Banners
```typescript
// Location: /canva-assets/heroes/{canvaImageId}.webp
// Usage: HeroBanner component
// Example:
<HeroBanner
  title="Welcome"
  canvaImageId="hero-beverages"
  useCanvaImage={true}
/>

// Fallback chain:
// 1. /canva-assets/heroes/hero-beverages.webp
// 2. props.imageUrl
// 3. Gradient background
```

#### 3. Bundle Graphics
```typescript
// Location: /canva-assets/bundles/{bundleId}.webp
// Usage: BundleSection component
// Fallback chain:
// 1. /canva-assets/bundles/{id}.webp
// 2. bundle.imageUrl
// 3. /placeholder-bundle.png
```

#### 4. Brand Logos
```typescript
// Location: /canva-assets/brands/{brandId}.webp
// Usage: BrandRow component
// Fallback chain:
// 1. /canva-assets/brands/{id}.webp
// 2. brand.logoUrl
// 3. /placeholder-logo.png
```

#### 5. Success Banners
```typescript
// Location: /canva-assets/banners/success-{categoryId}.webp
// Usage: OrderConfirmation page
// Example: success-beverages.webp
// Fallback chain:
// 1. /canva-assets/banners/success-{categoryId}.webp
// 2. Generic success banner
// 3. Gradient background
```

### Testing Asset Loading

```bash
# 1. Check if assets exist
ls -lah public/canva-assets/products/
ls -lah public/canva-assets/heroes/
ls -lah public/canva-assets/bundles/
ls -lah public/canva-assets/brands/
ls -lah public/canva-assets/banners/

# 2. Test direct URL access
curl -I http://localhost:5000/canva-assets/products/prod-001.webp
# Should return 200 OK if exists, 404 if not

# 3. Check browser network tab
# - Navigate to catalog page
# - Open DevTools > Network
# - Filter by "webp"
# - Verify canva-assets/* loads
# - Check for fallback to database URLs
```

### Verifying AI Asset Integration

```typescript
// 1. Open test-ingestion page
// 2. Look for "AI Generated" badges (cyan)
// 3. Check product card image URLs:
//    - Should include /canva-assets/ path
//    - Or /ai-generated/ path
// 4. Hover over product cards:
//    - Glossy overlay should appear
//    - Neon glow border
//    - Image should have drop shadow effect
```

---

## Confirming Draft Products

### Draft Status Workflow

```
1. New Product Created → status: 'draft'
2. AI Generates Image → still 'draft'
3. Manual Review → verify image quality
4. Confirmation → change to 'active'
5. Appears in Catalogs → visible to customers
```

### Step-by-Step Confirmation

#### 1. Filter Draft Products
```bash
# Navigate to test-ingestion
http://localhost:5000/catalog/test-ingestion

# Click "Drafts Only" filter
# Shows all products with status='draft'
```

#### 2. Review Each Draft
Check for:
- ✅ Product has valid image (not "Missing" badge)
- ✅ Image quality is acceptable
- ✅ Product name and description are correct
- ✅ Price and SKU are accurate
- ✅ Brand and category are assigned

#### 3. Confirm via Admin Dashboard
```bash
# Navigate to Admin Product Manager
http://localhost:5000/admin/products

# For each draft product:
# 1. Click "Edit" button
# 2. Review all details
# 3. Change "Status" dropdown from "Draft" to "Active"
# 4. Click "Save"
```

#### 4. Verify in Catalog
```bash
# Navigate to customer catalog
http://localhost:5000/catalog/customer

# Confirmed products should now appear:
# - In brand filter sections
# - In search results
# - In product grid
# - With "OK" badge (green) in test-ingestion
```

### Bulk Draft Confirmation

```typescript
// If you need to confirm many drafts at once:

// Option 1: Via Admin UI
// - Select multiple products
// - Click "Bulk Actions" > "Set Status to Active"

// Option 2: Via API (if implemented)
const draftIds = ['prod-001', 'prod-002', 'prod-003'];
const response = await fetch('/api/products/bulk-update-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productIds: draftIds,
    status: 'active'
  })
});

// Option 3: Direct database (development only)
// USE WITH CAUTION
UPDATE products 
SET status = 'active' 
WHERE status = 'draft' 
  AND imageUrl IS NOT NULL 
  AND imageUrl != '';
```

---

## Developer Design Preview

### Purpose
Internal tool for visual polish without touching business logic.

### Location
```
/admin/dev-design-preview
```

### Features

#### Section Filters
- **All Components**: Show everything
- **Hero Banners**: Hero templates only
- **Product Cards**: Product grid variations
- **Bundle Templates**: Bundle section designs
- **Brand Row**: Brand navigation designs
- **Loading States**: Loading overlay demos

#### Preview Content

##### Hero Banners
1. **Large Hero with Parallax**
   - Full-height banner
   - Parallax scroll effect
   - Left-aligned text
   - CTA button with shimmer

2. **Medium Hero - Center Aligned**
   - Medium height
   - No parallax
   - Center-aligned text
   - Custom gradient

3. **Small Hero - Right Aligned**
   - Compact banner
   - Right-aligned text
   - Minimal design

##### Product Cards
1. **Standard Glossy Cards (4 columns)**
   - Glossy overlays enabled
   - AI images enabled
   - Image status badges shown
   - Full interactivity

2. **Non-Glossy Cards (3 columns)**
   - Plain design
   - Database images only
   - No status badges

3. **Large 2-Column Layout**
   - Large card size
   - Glossy effects
   - AI images

##### Bundle Templates
1. **With AI Graphics & Animations**
   - AI bundle graphics
   - Neon badges
   - Blink animations
   - Dynamic savings colors

2. **Without AI Graphics**
   - Standard design
   - No animations
   - Static badges

##### Brand Row Templates
1. **Pill-Shaped with Canva Logos**
   - Rounded pill buttons
   - Canva logo integration
   - Glossy effects
   - Shimmer on hover

2. **Square Buttons**
   - Standard square shape
   - Database logos only
   - Minimal effects

##### Loading States
Three demo buttons:
1. **Regenerating Images**
   - Shows regenerating overlay
   - RefreshCw spinning icon
   - Purple theme

2. **Auto-Ingesting PO**
   - Shows ingesting overlay
   - Download icon
   - Cyan theme

3. **AI Processing**
   - Shows processing overlay
   - Sparkles icon
   - Pink theme

### Usage

```typescript
// 1. Navigate to preview page
window.location.href = '/admin/dev-design-preview';

// 2. Select component section
// Click any section button (Hero, Products, etc.)

// 3. Test loading overlays
// Click any loading state button
// Overlay auto-dismisses after 3 seconds

// 4. Interact with components
// - Click products to see alerts
// - Hover to see animations
// - Test all interactive elements

// 5. Use for visual polish
// - Compare different variations
// - Test color combinations
// - Verify animations
// - Check responsive layouts
```

---

## Troubleshooting

### Issue: Images Not Displaying

#### Symptoms
- Products show "Missing" badge
- Placeholder images appear
- Network tab shows 404 errors

#### Solutions

```bash
# 1. Check if Canva assets exist
ls -lah public/canva-assets/products/

# 2. Verify file permissions
chmod 644 public/canva-assets/products/*.webp

# 3. Check database imageUrl
SELECT id, name, imageUrl FROM products WHERE imageUrl IS NULL;

# 4. Regenerate missing images
# Click "Regenerate All Product Images" in test-ingestion

# 5. Check server logs
tail -f logs/server.log | grep "404"
```

### Issue: AI Generation Failing

#### Symptoms
- Products stuck in "Processing" state
- "Regenerate All" button times out
- No new images appear

#### Solutions

```bash
# 1. Check AI service status
# (Your AI image generation service should be running)

# 2. Check server logs
tail -f logs/server.log | grep "AI_IMAGE_ERROR"

# 3. Verify API key/credentials
# Check environment variables for AI service

# 4. Test individual product
# Try regenerating one product manually

# 5. Check database status
SELECT id, name, status, imageUrl 
FROM products 
WHERE status = 'draft' AND imageUrl IS NULL;
```

### Issue: Draft Products Not Appearing in Catalog

#### Symptoms
- Products visible in test-ingestion
- Not visible in customer/salesrep catalogs
- "Drafts" count is high

#### Solutions

```bash
# 1. Verify product status
# Drafts intentionally hidden from catalogs
# This is correct behavior

# 2. Confirm drafts to active
# Navigate to Admin Product Manager
# Change status from 'draft' to 'active'

# 3. Check filter logic
# customer.tsx and salesrep.tsx should filter:
products.filter(p => p.status === 'active')

# 4. Clear cache
# Browser: Ctrl+Shift+R (hard refresh)
# Server: Restart Node process
```

### Issue: Loading Overlay Stuck

#### Symptoms
- Loading overlay doesn't dismiss
- UI frozen
- Can't interact with page

#### Solutions

```bash
# 1. Force dismiss overlay
# Open browser console:
window.location.reload();

# 2. Check network requests
# Open DevTools > Network
# Look for failed API calls
# Retry the request

# 3. Check server logs
tail -f logs/server.log | grep "ERROR"

# 4. Restart server if needed
npm run dev
```

### Issue: Filters Not Working

#### Symptoms
- Clicking filter buttons does nothing
- Product count doesn't change
- All products still visible

#### Solutions

```bash
# 1. Check browser console for errors
# Open DevTools > Console
# Look for JavaScript errors

# 2. Verify filter state
# In React DevTools:
# - Find TestIngestionPage component
# - Check filters state object
# - Should toggle true/false

# 3. Clear filters and try again
# Click "Clear Filters" button
# Then reapply individual filters

# 4. Hard refresh page
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

### Issue: Glossy Effects Not Showing

#### Symptoms
- Product cards look flat
- No overlays or glows
- Animations not working

#### Solutions

```typescript
// 1. Check component props
<ProductGrid
  products={products}
  glossyCards={true} // Make sure this is true
  useAiImages={true}
/>

// 2. Verify browser support
// Glossy effects require:
// - backdrop-filter support
// - CSS gradients
// - CSS animations

// 3. Check CSS loading
// In DevTools > Elements:
// - Inspect product card
// - Look for inline styles
// - Verify glassmorphism styles applied

// 4. Disable browser extensions
// Some ad blockers interfere with animations
```

---

## Testing Checklist

### Before Release

- [ ] **Test Ingestion Page**
  - [ ] All statistics display correctly
  - [ ] Product grid loads all products
  - [ ] Filters work (missing/AI/drafts)
  - [ ] Regenerate button triggers API
  - [ ] Refresh button reloads data
  - [ ] Image status badges accurate

- [ ] **AI Image Generation**
  - [ ] Bulk regenerate completes
  - [ ] Individual product images generate
  - [ ] Fallback chain works
  - [ ] Processing states animate
  - [ ] Completed images display

- [ ] **Product Ingestion**
  - [ ] PO upload creates products
  - [ ] New products have status='draft'
  - [ ] Auto-ingestion triggers loading overlay
  - [ ] Products appear in test-ingestion

- [ ] **Draft Workflow**
  - [ ] Drafts filter shows only drafts
  - [ ] Drafts hidden from customer catalog
  - [ ] Status change to 'active' works
  - [ ] Active products appear in catalog

- [ ] **Canva Assets**
  - [ ] Product images load from /canva-assets/
  - [ ] Hero banners display correctly
  - [ ] Bundle graphics render
  - [ ] Brand logos show
  - [ ] Success banners appear on order

- [ ] **Visual Effects**
  - [ ] Glossy overlays apply
  - [ ] Neon glows on hover
  - [ ] Image drop shadows render
  - [ ] Animations smooth (60fps)
  - [ ] Loading skeletons show

- [ ] **Loading Overlay**
  - [ ] Displays during bulk operations
  - [ ] Shows correct message
  - [ ] Progress bar animates
  - [ ] Dismisses when complete
  - [ ] Doesn't block critical UI

- [ ] **Design Preview**
  - [ ] All sections accessible
  - [ ] Mock data displays
  - [ ] Interactive elements work
  - [ ] Loading demos trigger
  - [ ] No console errors

### Performance Tests

```bash
# 1. Load test with 100+ products
# - Navigate to test-ingestion
# - Check page load time < 3 seconds
# - Scroll performance smooth

# 2. Bulk regenerate stress test
# - Click "Regenerate All" with 50+ products
# - Monitor server load
# - Verify no timeouts

# 3. Image loading performance
# - Open catalog with 20+ products
# - Check Network tab
# - Verify parallel loading
# - Total load time < 5 seconds

# 4. Animation performance
# - Open design preview
# - Monitor FPS in DevTools Performance
# - Target 60fps for all animations
```

---

## API Reference

### Test Ingestion Endpoints

```typescript
// Get all products
GET /api/products
Response: Product[]

// Force regenerate all images
POST /api/products/force-regenerate-all
Response: { message: string, processed: number }

// Get product by ID
GET /api/products/:id
Response: Product

// Update product status
PATCH /api/products/:id
Body: { status: 'active' | 'draft' }
Response: Product
```

### Product Model

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  unitType: string;
  unitsPerCase: number;
  imageUrl: string | null;
  categoryId: string;
  brandId: string;
  status: 'active' | 'draft';
  inStock: boolean;
  isNew: boolean;
  backgroundColor?: string;
  backgroundGradient?: string;
}
```

---

## Best Practices

### Image Management
1. Always start products as `status: 'draft'`
2. Generate images before activating
3. Verify image quality manually
4. Use WebP format for smaller file size
5. Maintain fallback chain for resilience

### Draft Workflow
1. Create product → draft
2. Generate image → still draft
3. Review quality → manual check
4. Confirm → change to active
5. Appears in catalog → visible

### Performance
1. Batch image generation during off-peak hours
2. Use lazy loading for images
3. Compress Canva assets to WebP
4. Cache API responses
5. Parallelize network requests

### Testing Cadence
- **Daily**: Check test-ingestion for errors
- **After PO Upload**: Verify new products appear
- **After Regenerate**: Confirm image quality
- **Before Release**: Run full checklist

---

## Support

For issues or questions:
1. Check this guide first
2. Review server logs
3. Test in design preview
4. Document reproduction steps
5. Report to development team

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
