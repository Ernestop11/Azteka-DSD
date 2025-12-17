# Catalog UI Setup Guide

## ✅ What's Fixed

1. **Image Normalization** - All product images are now normalized to `/uploads/products/<productId>.png`
2. **TrendingRow** - Now uses layout data from Catalog Builder Engine
3. **Product Cards** - Now display `backgroundColor` and `backgroundGradient` from product data
4. **Image Seeding** - 637 placeholder images created and linked to products

## 🎨 How to See Colorful Backgrounds

Product cards will show colorful backgrounds when products have:
- `backgroundColor` field set (e.g., `#FF6B6B`)
- `backgroundGradient` field set (e.g., `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)

### To Set Backgrounds via Product Editor:

1. Go to `/admin/products`
2. Edit a product
3. Set `backgroundColor` or `backgroundGradient` field
4. Save - the catalog will update immediately (cache revalidation)

### Example Background Values:

```json
{
  "backgroundColor": "#FF6B6B",  // Solid red
  "backgroundGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"  // Purple gradient
}
```

## 📸 How to Upload Real Product Images

### Option 1: Via Product Editor (Recommended)

1. Go to `/admin/products`
2. Click on a product to edit
3. Use the image upload field
4. Select a PNG or JPG file
5. Save - image will be saved as `/uploads/products/<productId>.png`
6. Catalog updates automatically

### Option 2: Via API

```bash
curl -X POST http://localhost:3000/api/admin/products/uploadImage \
  -F "image=@/path/to/image.png" \
  -F "productId=<product-id>"
```

### Option 3: Manual File Upload

1. Place PNG files in `/public/uploads/products/`
2. Name them as `<productId>.png`
3. Update product in DB:
   ```sql
   UPDATE "Product" SET "imageUrl" = '/uploads/products/<productId>.png' WHERE id = '<productId>';
   ```

## 🔍 Verify Images Are Working

1. Check browser console - should see:
   ```
   [CatalogContent] Mapped showcase products: 20
   [TrendingRow] Mapped products: 20
   ```

2. Check network tab - images should load from `/uploads/products/`

3. Check product cards - should show:
   - Product images (or `/coming-soon.png` fallback)
   - Colorful backgrounds (if `backgroundColor`/`backgroundGradient` set)
   - Tier badges, badges, sparkle effects

## 🐛 Troubleshooting

### Images Not Showing?
- Check `/public/uploads/products/` directory exists
- Verify imageUrl in database: `SELECT id, name, imageUrl FROM "Product" LIMIT 5;`
- Check browser console for 404 errors

### Backgrounds Not Showing?
- Verify product has `backgroundColor` or `backgroundGradient` in database
- Check browser DevTools - inspect card element for `style` attribute
- Ensure product data is passed to `GlossyProductCard` with these fields

### TrendingRow Shows 0 Products?
- Check layout API: `curl http://localhost:3000/api/admin/catalog/layout | jq '.trending | length'`
- Should return 20 if products exist
- Verify `TrendingRow` receives `trending` prop from `CatalogContent`

## 📊 Current Status

- ✅ 637 products have imageUrl set
- ✅ Layout endpoint returns normalized data
- ✅ Product cards support backgrounds
- ✅ Image seeding complete
- ✅ Cache revalidation working

## 🚀 Next Steps

1. **Upload Real Images**: Use product editor to replace placeholder PNGs
2. **Set Backgrounds**: Add `backgroundColor`/`backgroundGradient` to products
3. **Test Catalog**: Visit `/catalog` and verify all sections load
4. **Check Console**: Ensure no errors in browser console
