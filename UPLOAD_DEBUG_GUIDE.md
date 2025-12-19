# Image Upload Debug Guide
## Troubleshooting Alpura Vaquita Chocolate Upload Issue

## What I Fixed

### 1. ✅ Added Comprehensive Logging
- Console logs at every step of upload process
- Logs file info, product info, API response
- Logs state updates

### 2. ✅ Fixed Image Preview Refresh
- Added `key={selectedProduct.imageUrl}` to force re-render
- Added `unoptimized` prop to disable Next.js image caching
- Image should now update immediately after upload

### 3. ✅ Better Error Messages
- More detailed error messages
- Shows actual API error responses
- Error messages stay visible longer (5 seconds)

---

## How to Debug

### Step 1: Open Browser Console
1. Open `/employee/inventory` page
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to Console tab
4. Try uploading image

### Step 2: Check Console Logs
You should see logs like:
```
[Upload] Starting upload: { fileName: "...", fileSize: ..., productId: "..." }
[Upload] Sending request to /api/employee/products/upload-image
[Upload] Response status: 200 OK
[Upload] Success response: { success: true, imageUrl: "/uploads/products/..." }
[Upload] Updating state with imageUrl: /uploads/products/...
[Upload] Upload complete, state updated
```

### Step 3: Check for Errors
If upload fails, you'll see:
```
[Upload] Error response: { error: "..." }
[Upload] Upload failed: Error: ...
```

---

## Common Issues & Fixes

### Issue 1: "Product not found"
**Error:** `{ error: 'Product not found' }`

**Cause:** Product ID doesn't match database

**Fix:**
1. Check console log for `productId`
2. Verify product exists in database
3. Try refreshing the page and selecting product again

### Issue 2: "No image file provided"
**Error:** `{ error: 'No image file provided' }`

**Cause:** File not being sent correctly

**Fix:**
1. Check file size (should be < 10MB)
2. Check file type (should be PNG, JPG, or JPEG)
3. Try a different file

### Issue 3: Image uploads but preview doesn't update
**Symptom:** Upload succeeds but image doesn't show

**Fix Applied:**
- Added `key={selectedProduct.imageUrl}` to force re-render
- Added `unoptimized` prop to disable caching
- Image should now update immediately

**If still not working:**
1. Check console for `[Upload] Updating selectedProduct imageUrl`
2. Hard refresh page (Cmd+Shift+R)
3. Check if image file exists at path shown in console

### Issue 4: Network Error
**Error:** `Failed to fetch` or network timeout

**Cause:** Server not responding or network issue

**Fix:**
1. Check if server is running
2. Check network tab in browser DevTools
3. Verify API endpoint is accessible

---

## Testing Steps

### Test 1: Basic Upload
1. Go to `/employee/inventory`
2. Search for "Alpura Vaquita Chocolate"
3. Click on product
4. Go to Image tab
5. Click "Take Photo or Upload"
6. Select PNG file
7. **Check console** for logs
8. **Check preview** - should update immediately
9. **Check success message** - should appear

### Test 2: Verify Image Saved
1. After upload, check console for imageUrl
2. Copy the imageUrl (e.g., `/uploads/products/abc123.png`)
3. Open in new tab: `https://aztekafoods.com/uploads/products/abc123.png`
4. Image should load

### Test 3: Verify Database Update
1. After upload, refresh page
2. Product should still show image
3. If image disappears, database wasn't updated

---

## API Endpoint Details

**Endpoint:** `POST /api/employee/products/upload-image`

**Request:**
- `FormData` with:
  - `image`: File (PNG, JPG, JPEG)
  - `id`: Product ID (string)

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "/uploads/products/{productId}.png",
  "backgroundRemoved": false,
  "usedAI": false,
  "enhanced": false
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error message"
}
```

---

## Next Steps if Still Not Working

1. **Check Server Logs:**
   - Look for `[POST /api/employee/products/upload-image]` in server logs
   - Check for any errors or warnings

2. **Check File Permissions:**
   - Verify `public/uploads/products/` directory exists
   - Verify write permissions on directory

3. **Check Database:**
   - Verify product exists: `SELECT id, name FROM "Product" WHERE name LIKE '%Vaquita Chocolate%';`
   - Check if imageUrl was updated: `SELECT id, name, imageUrl FROM "Product" WHERE name LIKE '%Vaquita Chocolate%';`

4. **Try Direct API Test:**
   ```bash
   curl -X POST https://aztekafoods.com/api/employee/products/upload-image \
     -F "image=@/path/to/image.png" \
     -F "id=PRODUCT_ID_HERE"
   ```

---

## What Changed in Code

### File: `app/employee/inventory/page.tsx`

1. **Added logging** throughout upload process
2. **Added `key` prop** to Image components to force re-render
3. **Added `unoptimized` prop** to disable Next.js image caching
4. **Better error handling** with detailed messages
5. **Longer error visibility** (5 seconds instead of 2)

---

**Status:** ✅ Debugging improvements added. Check browser console for detailed logs.

