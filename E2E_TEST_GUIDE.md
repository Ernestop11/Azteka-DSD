# End-to-End Test Guide - MVP Verification

## 🎯 Overview

This guide provides a complete test sequence to verify the MVP is ready for Carlos's business. All automated tests can be run with a single command, and manual tests have clear instructions.

---

## 🚀 Quick Start

### Run All Automated Tests
```bash
npm run test:e2e
```

This will automatically test:
- ✅ Database product count (642 products)
- ✅ Database bundle count (3+ bundles)
- ✅ Bundle consistency
- ✅ Products API endpoint
- ✅ Bundles API endpoint
- ✅ Health check endpoint

---

## 📋 Complete Test Sequence

### 1. DATABASE TEST

#### 1.1 Count Products
```bash
npm run db:count-products
```
**Expected:** `Total Products: 642`

#### 1.2 Count Bundles
```bash
npm run db:count-bundles
```
**Expected:** `Total Bundles: 3` (or more)

#### 1.3 Verify Bundle Consistency
```bash
npm run db:verify-bundle-consistency
```
**Expected:** All checks pass with 0 errors

---

### 2. BACKEND API TEST

#### 2.1 Products API
```bash
curl http://localhost:3000/api/products | jq length
```
**Expected:** `642`

#### 2.2 Bundles API
```bash
curl http://localhost:3000/api/admin/bundles | jq length
```
**Expected:** `3` (or more)

**Note:** If you get `401 Unauthorized`, that's expected - the endpoint exists but requires authentication. You can test with auth:
```bash
# Get auth token first (if auth is set up)
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/bundles | jq length
```

#### 2.3 Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

---

### 3. FRONTEND ADMIN TEST

#### 3.1 Access Admin Bundle Editor
1. Open browser: `http://localhost:3000/admin/bundles/edit`
2. Verify page loads without errors
3. Check browser console for errors (F12 → Console)

#### 3.2 Create New Bundle
1. Click "Create New Bundle" or "Add Bundle"
2. Fill in form:
   - **Name:** "Carlos Test Pack"
   - **Description:** "Test bundle for Carlos's business"
   - **Discount:** 10%
3. **Add Products:**
   - Select 3 products from the product picker
   - Set quantity for each (default: 1)
4. **Upload Image:**
   - Click "Upload Image"
   - Select an image file
   - Wait for upload to complete
5. **Save Bundle:**
   - Click "Save" or "Create Bundle"
   - Verify success message appears
   - Verify bundle appears in bundle list

#### 3.3 Verify Bundle Creation
```bash
npm run db:count-bundles
```
**Expected:** Bundle count increased by 1

---

### 4. FRONTEND CUSTOMER TEST

#### 4.1 Login as Sales Rep
1. Navigate to: `http://localhost:3000/login`
2. Enter credentials:
   - **Email:** `sales@aztekafoods.com`
   - **Password:** `sales123`
3. Click "Login"
4. Verify successful login and redirect

#### 4.2 Browse Catalog
1. Navigate to catalog page
2. Verify products are displayed
3. **Verify bundles appear:**
   - Look for bundle showcase section
   - Verify test bundles are visible
   - Check bundle cards show:
     - Bundle name
     - Discount percentage
     - Product count
     - Price

#### 4.3 Add Bundle to Cart
1. Click on a bundle card
2. Verify bundle details page loads
3. Click "Add to Cart" or "Add Bundle"
4. Verify:
   - Cart icon updates with count
   - Success message appears
   - Bundle items are added to cart

#### 4.4 View Cart
1. Click cart icon
2. Verify bundle appears in cart
3. Verify:
   - Bundle name
   - Individual products listed
   - Quantities correct
   - Total price includes discount

#### 4.5 Complete Checkout
1. Click "Checkout" or "Proceed to Checkout"
2. Fill in delivery information (if required)
3. Review order summary
4. Click "Place Order" or "Submit Order"
5. Verify:
   - Order confirmation page appears
   - Order number is displayed
   - Order details are correct

---

### 5. MOBILE TEST

#### 5.1 Open on Mobile Browser
1. On mobile device, navigate to: `http://YOUR_IP:3000`
   - Or use ngrok/tunneling service for local testing
2. Verify page loads correctly
3. Check responsive design:
   - Navigation is accessible
   - Products display in grid/list
   - Text is readable
   - Buttons are tappable

#### 5.2 Test Bundle Creation (Mobile)
1. Login as admin on mobile
2. Navigate to bundle editor
3. Create a new bundle:
   - Form is usable on mobile
   - Product picker works
   - Image upload works
   - Save button is accessible

#### 5.3 Test Bundle Ordering (Mobile)
1. Login as sales rep on mobile
2. Browse catalog
3. View bundle details
4. Add bundle to cart
5. Complete checkout flow
6. Verify all steps work smoothly

#### 5.4 Verify Carlos Can Use Efficiently
- ✅ Navigation is intuitive
- ✅ Bundle creation is fast (< 2 minutes)
- ✅ Ordering is simple (3 taps or less)
- ✅ No lag or performance issues
- ✅ Works offline (if PWA is configured)

---

## ✅ Success Criteria Checklist

### Database
- [ ] Database has exactly 642 products (no external products)
- [ ] Database has 3+ test bundles
- [ ] All bundles have valid product references
- [ ] Bundle consistency check passes

### Backend API
- [ ] `/api/products` returns 642 products
- [ ] `/api/admin/bundles` returns 3+ bundles
- [ ] `/api/health` returns OK status
- [ ] No API errors in server logs

### Frontend Admin
- [ ] Admin can access bundle editor
- [ ] Admin can create bundles with multiple products
- [ ] Admin can upload bundle images
- [ ] Admin can save bundles successfully
- [ ] Bundles appear in admin list

### Frontend Customer
- [ ] Sales rep can login
- [ ] Bundles appear in customer catalog
- [ ] Sales rep can view bundle details
- [ ] Sales rep can add bundles to cart
- [ ] Cart shows bundle items correctly
- [ ] Checkout flow works with bundles
- [ ] Order is created successfully

### Mobile
- [ ] Mobile interface is functional
- [ ] Bundle creation works on mobile
- [ ] Bundle ordering works on mobile
- [ ] No console errors during any flow
- [ ] Performance is acceptable

---

## 🔧 Troubleshooting

### Database Tests Fail
```bash
# Re-seed bundles
npm run db:seed-bundles

# Verify database connection
npm run db:count-products
```

### API Tests Fail
```bash
# Check if server is running
npm run server

# Check server logs for errors
tail -f server.log

# Verify API is accessible
curl http://localhost:3000/api/health
```

### Frontend Tests Fail
1. **Check browser console** (F12 → Console)
2. **Check network tab** for failed requests
3. **Verify API is running** (`npm run server`)
4. **Clear browser cache** and reload
5. **Check authentication** - may need to login first

### Mobile Tests Fail
1. **Verify mobile can access server:**
   - Use local IP: `http://192.168.x.x:3000`
   - Or use ngrok: `ngrok http 3000`
2. **Check responsive CSS** is loaded
3. **Test on multiple devices** (iOS, Android)
4. **Check mobile browser console** (if possible)

---

## 📊 Test Results Template

After running all tests, document results:

```
Date: ___________
Tester: ___________

Database Tests:
- Product Count: [ ] Pass [ ] Fail (642 products)
- Bundle Count: [ ] Pass [ ] Fail (3+ bundles)
- Consistency: [ ] Pass [ ] Fail

Backend API Tests:
- Products API: [ ] Pass [ ] Fail
- Bundles API: [ ] Pass [ ] Fail
- Health Check: [ ] Pass [ ] Fail

Frontend Admin Tests:
- Bundle Creation: [ ] Pass [ ] Fail
- Image Upload: [ ] Pass [ ] Fail
- Bundle List: [ ] Pass [ ] Fail

Frontend Customer Tests:
- Login: [ ] Pass [ ] Fail
- Catalog View: [ ] Pass [ ] Fail
- Add to Cart: [ ] Pass [ ] Fail
- Checkout: [ ] Pass [ ] Fail

Mobile Tests:
- Mobile Access: [ ] Pass [ ] Fail
- Bundle Creation: [ ] Pass [ ] Fail
- Ordering: [ ] Pass [ ] Fail

Issues Found:
_________________________________
_________________________________
_________________________________

Overall Status: [ ] READY [ ] NEEDS FIXES
```

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ **Deploy to production**
2. ✅ **Train Carlos on bundle creation**
3. ✅ **Monitor first few orders**
4. ✅ **Gather feedback**

If tests fail:
1. ❌ **Fix critical issues** (database, API)
2. ⚠️ **Address UI/UX issues**
3. 🔄 **Re-run tests**
4. ✅ **Deploy when ready**

---

## 📝 Notes

- **Automated tests** cover database and API only
- **Manual tests** are required for frontend and mobile
- **Test in production-like environment** before deploying
- **Document any issues** found during testing
- **Keep test results** for future reference

