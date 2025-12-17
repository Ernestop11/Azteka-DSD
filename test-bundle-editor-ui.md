# Bundle Editor UI Test Results
**Test Date:** 2025-11-16  
**URL:** http://localhost:5173/admin/bundles/edit  
**Login:** admin@aztekafoods.com / admin123

## Pre-Test API Verification ✅

### Backend API Health
```bash
✅ Server Status: Running (PID: 61476)
✅ Health Check: {"status":"ok"}
✅ Products Available: 642
✅ Categories Available: 53
✅ Brands Available: 280
```

### Sample Product Data
```bash
curl -s "http://localhost:4000/api/products" | jq '.[0] | {id, name, sku, priceCase, inStock}'
```

Expected structure for bundle editor:
- id: Product UUID
- name: Product name for display
- sku: For search functionality
- priceCase: For price calculations
- inStock: For availability checks

## UI Test Checklist

### ☐ 1. Can you access bundle creation form?

**Steps:**
1. Open browser to http://localhost:5173
2. Login with admin@aztekafoods.com / admin123
3. Navigate to http://localhost:5173/admin/bundles/edit
4. Verify form loads without errors

**Expected Result:**
- Bundle Editor page loads
- Form shows fields: Name, SKU, Description
- Product search input visible
- Category and Brand dropdowns populated
- Image upload area visible
- Save button enabled

**Check Console For:**
- No React errors
- API calls to /api/categories succeeding
- API calls to /api/brands succeeding
- API calls to /api/products succeeding

---

### ☐ 2. Can you search and select products from 642?

**Steps:**
1. Click on "Search products" input field
2. Type "Marinela" or "Gamesa" or "La Molienda"
3. Observe filtered product list
4. Click on a product to add it
5. Verify product appears in bundle items list
6. Try adding multiple products (e.g., 3-5 different products)

**Expected Result:**
- Search filters products in real-time
- Product list shows: name, SKU, price
- Clicking product adds it to bundle
- Each product shows with quantity selector
- Can add multiple different products
- Products show unit price and subtotal

**Test Data:**
- Search "Marinela Gansito" 
- Search "Gamesa Arcoiris"
- Search "La Molienda Chicharrones"

**API Call to Verify:**
```bash
# Check product search works
curl -s "http://localhost:4000/api/products" | jq '[.[] | select(.name | test("Marinela"; "i"))] | .[0:3] | .[] | {name, priceCase}'
```

---

### ☐ 3. Can you set bundle pricing with discount?

**Steps:**
1. Add 2-3 products to bundle with quantities
2. Observe "Original Total" calculation
3. Enter discount percentage (e.g., 15%)
4. Observe "Bundle Price" recalculation
5. Verify savings amount shown
6. Try different discount percentages (10%, 20%, 25%)

**Expected Result:**
- Original Total = Sum of (product.priceCase × quantity)
- Discount % adjustable from 0-100
- Bundle Price = Original Total × (1 - discount/100)
- Savings shown = Original Total - Bundle Price
- All calculations update in real-time

**Example Calculation:**
```
Product 1: $18.99 × 6 = $113.94
Product 2: $17.99 × 4 = $71.96
Original Total: $185.90
Discount: 15%
Bundle Price: $158.02
Savings: $27.88
```

---

### ☐ 4. Can you upload bundle image?

**Steps:**
1. Click on image upload area
2. Select a JPG/PNG image (< 5MB)
3. Verify image preview appears
4. Try removing image
5. Try uploading different image
6. Try uploading unsupported file (should show error)

**Expected Result:**
- Drag & drop or click to upload works
- Image preview shows immediately
- File size limit enforced (5MB)
- Only image types accepted (JPEG, PNG, WebP, GIF)
- Remove button works
- Can replace image

**API Endpoint Used:**
```
POST http://localhost:4000/api/admin/bundles
Content-Type: multipart/form-data
```

---

### ☐ 5. Can you save bundle successfully?

**Steps:**
1. Fill in required fields:
   - Name: "Test Bundle - La Molienda Pack"
   - SKU: "TEST-LAM-001"
   - Description: "Test bundle for verification"
2. Add 2-3 products with quantities
3. Select category from dropdown
4. Select brand from dropdown
5. Set discount percentage (15%)
6. Set stock quantity (50)
7. Set minimum stock (10)
8. Upload image (optional)
9. Check "Active" toggle
10. Click "Save Bundle"
11. Wait for success message
12. Verify redirect or confirmation

**Expected Result:**
- Form validates required fields
- Save button shows loading state
- API call succeeds
- Success message shown
- Either:
  - Redirects to bundle list
  - Shows success message with bundle ID
  - Clears form for new bundle

**API Call Made:**
```bash
POST http://localhost:4000/api/admin/bundles
Headers: Authorization: Bearer <token>
Body: multipart/form-data with:
  - name
  - sku
  - description
  - categoryId
  - brandId
  - discountPercent
  - price (calculated)
  - stock
  - minStock
  - active
  - items[] (productId + quantity)
  - image (file)
```

**Verify Bundle Created:**
```bash
# Get fresh auth token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}' \
  | jq -r '.token')

# List all bundles
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/admin/bundles" | jq '.bundles | .[] | {name, sku, price, active}'

# Search for test bundle
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/admin/bundles?search=Test" | jq '.bundles'
```

---

## Advanced Features to Test

### Business Modes Multi-Select
- [ ] Can select multiple business modes (Mexican Store, Convenience Store, Gas Station)
- [ ] Business modes save correctly

### Badge Customization
- [ ] Can set badge text (e.g., "15% OFF", "BEST VALUE")
- [ ] Can set badge color with color picker
- [ ] Badge preview updates in real-time

### Featured Toggle
- [ ] Can mark bundle as featured
- [ ] Featured status saves correctly

### Inventory Management
- [ ] Stock quantity accepts positive integers
- [ ] Min stock threshold configurable
- [ ] In Stock toggle works

### Edit Existing Bundle
1. Navigate to `/admin/bundles/edit/:id` with existing bundle ID
2. Verify form pre-populates with bundle data
3. Modify fields
4. Save changes
5. Verify updates persist

---

## Common Issues & Troubleshooting

### Issue: Form not loading
**Check:**
- Browser console for React errors
- Network tab for failed API calls
- Server logs: `tail -f /tmp/azteka-server-new.log`

### Issue: Products not appearing in search
**Check:**
```bash
# Verify products API works
curl -s "http://localhost:4000/api/products" | jq 'length'
# Should return 642
```

### Issue: Categories/Brands dropdown empty
**Check:**
```bash
# Verify categories
curl -s "http://localhost:4000/api/categories" | jq 'length'
# Should return 53

# Verify brands  
curl -s "http://localhost:4000/api/brands" | jq 'length'
# Should return 280
```

### Issue: Image upload fails
**Check:**
- File size < 5MB
- File type is JPEG, PNG, WebP, or GIF
- Upload directory has write permissions
- Check: `ls -la /Users/ernestoponce/Downloads/Azteka-DSD-main/remote_azteka_dsd/uploads/bundles/`

### Issue: Save fails with 401 Unauthorized
**Check:**
- User is logged in
- JWT token is valid (not expired)
- User has ADMIN role
- Check localStorage: `localStorage.getItem('token')`

### Issue: Save fails with validation error
**Check:**
- Name is provided (required)
- At least 1 product added to bundle
- SKU is unique (not used by another bundle)
- All product quantities > 0

---

## API Test Commands

### Get Auth Token
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}' \
  | jq -r '.token')
echo $TOKEN
```

### Test Bundle Creation via API
```bash
# Create test bundle with Marinela products
curl -X POST "http://localhost:4000/api/admin/bundles" \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=API Test Bundle - Marinela Pack" \
  -F "sku=API-MAR-001" \
  -F "description=Test bundle created via API" \
  -F "price=199.99" \
  -F "discountPercent=15" \
  -F "stock=50" \
  -F "minStock=10" \
  -F "active=true" \
  -F "items[0][productId]=PRODUCT_UUID_1" \
  -F "items[0][quantity]=6" \
  -F "items[1][productId]=PRODUCT_UUID_2" \
  -F "items[1][quantity]=4"
```

### List All Bundles
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/admin/bundles" | jq '.bundles | length'
```

### Search for Specific Bundle
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/admin/bundles?search=Marinela" | jq '.bundles'
```

---

## Success Criteria

✅ **PASS** - All 5 test checklist items working  
⚠️ **PARTIAL** - 3-4 items working, minor issues  
❌ **FAIL** - < 3 items working, critical bugs  

### Current Status: 🟢 READY FOR TESTING

**Backend APIs:** ✅ All operational  
**Data Available:** ✅ 642 products, 53 categories, 280 brands  
**Server Status:** ✅ Running and responsive  
**Frontend:** ✅ Dev server running on port 5173  
**Authentication:** ✅ Admin credentials configured  

**Next Step:** Access http://localhost:5173/admin/bundles/edit and complete checklist

---

## Test Results (Fill in after testing)

### 1. Access Bundle Creation Form
- [ ] PASS
- [ ] FAIL
- **Notes:**

### 2. Search and Select Products
- [ ] PASS
- [ ] FAIL
- **Notes:**

### 3. Set Bundle Pricing with Discount
- [ ] PASS
- [ ] FAIL
- **Notes:**

### 4. Upload Bundle Image
- [ ] PASS
- [ ] FAIL
- **Notes:**

### 5. Save Bundle Successfully
- [ ] PASS
- [ ] FAIL
- **Notes:**

### Overall Result
- [ ] ✅ ALL TESTS PASSED
- [ ] ⚠️ PARTIAL SUCCESS
- [ ] ❌ CRITICAL ISSUES

**Tested By:**  
**Date:**  
**Browser:**  
**Additional Comments:**
