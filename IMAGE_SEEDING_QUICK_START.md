# Image Seeding Quick Start ✨

## ✅ Current Status

All **637 products** now have colorful placeholder images!

- 📊 **100%** coverage
- 🎨 Category-based colors
- 📏 400x400 pixels
- 💾 ~9KB per image
- 📦 Total size: 5.75 MB

## 🚀 Quick Commands

### Seed Images (Create/Update)
```bash
npm run db:seed-images
```

### Verify Images
```bash
npm run db:verify-images
```

### Full Database Seed (includes reminder to seed images)
```bash
npm run prisma:seed
```

## 📁 Where Are Images Stored?

- **Filesystem**: `/public/uploads/products/{productId}.png`
- **Database**: `Product.imageUrl` field
- **URL Format**: `/uploads/products/{productId}.png`

## 🎨 Color Categories

Images automatically use category-based colors:

| Category | Color | Hex |
|----------|-------|-----|
| 🥤 Beverages | Blue | #2563eb |
| 🍿 Snacks | Red | #dc2626 |
| 🍬 Candy | Purple | #7c3aed |
| 🍪 Cookies | Orange | #ea580c |
| ☕ Coffee | Brown | #78350f |
| 🥔 Chips | Amber | #f59e0b |
| 🥤 Soda | Cyan | #0ea5e9 |
| 💧 Water | Teal | #06b6d4 |
| 🧃 Juice | Violet | #8b5cf6 |
| 📦 Default | Gray | #6b7280 |

## 🔄 Re-seeding

To regenerate all images (overwrites existing):

```bash
npm run db:seed-images
```

The script automatically recreates all images by default. To change this behavior, edit `scripts/seed-images-improved.mjs` and set `forceRecreate = false`.

## 📸 Replacing Images

### Via Admin UI
1. Navigate to `/admin/products`
2. Click on a product
3. Upload a new image using the image upload component

### Programmatically
```javascript
// Update database
await prisma.product.update({
  where: { id: 'product-uuid' },
  data: { imageUrl: '/uploads/products/my-new-image.png' }
})

// Place your image file in:
// public/uploads/products/my-new-image.png
```

## 🔍 Troubleshooting

### Images not showing in the UI?

1. **Check the dev server is running**:
   ```bash
   npm run dev
   ```

2. **Verify images exist**:
   ```bash
   npm run db:verify-images
   ```

3. **Check browser console** for any 404 errors

4. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Need to regenerate images?

```bash
npm run db:seed-images
```

### Database out of sync?

```bash
# Re-run the seed script
npm run prisma:seed
# Then seed images
npm run db:seed-images
```

## 📚 Documentation

For detailed documentation, see:
- [docs/IMAGE_SEEDING.md](docs/IMAGE_SEEDING.md) - Full documentation
- [scripts/seed-images-improved.mjs](scripts/seed-images-improved.mjs) - Source code
- [scripts/verify-images.mjs](scripts/verify-images.mjs) - Verification tool

## ✨ What's Next?

- [ ] Upload real product images via admin UI
- [ ] Integrate with external image APIs
- [ ] Add image optimization
- [ ] Support multiple image sizes
- [ ] Add image validation on upload

---

**Last Updated**: November 22, 2025
**Status**: ✅ All images seeded successfully
