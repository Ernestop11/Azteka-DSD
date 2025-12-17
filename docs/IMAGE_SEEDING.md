# Product Image Seeding

This document explains how to seed product images in the Azteka DSD application.

## Overview

Product images are stored in `/public/uploads/products/` and are referenced in the database via the `imageUrl` field on the `Product` model.

## Seeding Process

### Quick Start

To seed all products with colorful placeholder images:

```bash
npm run db:seed-images
```

Or directly:

```bash
node scripts/seed-images-improved.mjs
```

### What It Does

The seeding script:

1. **Fetches all products** from the database
2. **Generates placeholder images** using the `sharp` library
3. **Creates 400x400 PNG images** with:
   - Product name displayed on the image
   - Category-based color schemes
   - Circular decoration element
4. **Saves images** to `/public/uploads/products/{productId}.png`
5. **Updates database** to set the `imageUrl` field

### Color Categories

Images are automatically colored based on product category or name:

| Category/Keywords | Background Color | Usage |
|------------------|------------------|-------|
| Beverages        | Blue (#2563eb)   | Drinks, beverages |
| Snacks           | Red (#dc2626)    | Snacks, chips |
| Candy            | Purple (#7c3aed) | Candy, sweets |
| Cookies          | Orange (#ea580c) | Cookies, biscuits |
| Coffee           | Brown (#78350f)  | Coffee products |
| Chips            | Amber (#f59e0b)  | Chip products |
| Soda             | Cyan (#0ea5e9)   | Sodas |
| Water            | Teal (#06b6d4)   | Water products |
| Juice            | Violet (#8b5cf6) | Juices |
| Default          | Gray (#6b7280)   | Everything else |

## Image Specifications

- **Format**: PNG
- **Dimensions**: 400x400 pixels
- **Size**: ~8-10KB per image
- **Naming**: `{productId}.png` (UUID-based)
- **Location**: `/public/uploads/products/`

## Updating the Seed Script

The main seed script (`prisma/seed.mjs`) will remind you to run image seeding:

```bash
npm run prisma:seed
# Then follow the prompt to run:
npm run db:seed-images
```

## Replacing Placeholder Images

### Via Admin UI

1. Go to `/admin/products`
2. Click on a product to edit
3. Use the image upload feature to replace the placeholder

### Programmatically

Update the `imageUrl` field in the database and place your image file in `/public/uploads/products/`:

```javascript
await prisma.product.update({
  where: { id: productId },
  data: { imageUrl: '/uploads/products/my-image.png' }
})
```

## Troubleshooting

### Images Not Showing

1. **Check file permissions**:
   ```bash
   ls -la public/uploads/products/
   ```

2. **Verify database URLs**:
   ```sql
   SELECT id, name, imageUrl FROM "Product" LIMIT 5;
   ```

3. **Check Next.js static files**:
   - Images in `/public/` are served at the root path
   - URL `/uploads/products/abc.png` maps to `/public/uploads/products/abc.png`

### Re-seeding Images

To recreate all images (overwrites existing):

```bash
# The script will automatically recreate all images
npm run db:seed-images
```

To only create missing images, edit `scripts/seed-images-improved.mjs` and set:

```javascript
const forceRecreate = false; // Change from true to false
```

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `seed-images-improved.mjs` | Main image seeding script (creates proper placeholders) |
| `seed-product-images.mjs` | Legacy script (creates 1x1 pixel images) |
| `assign-placeholder-images.mjs` | Assigns external placeholder URLs (via.placeholder.com) |
| `image-processor.mjs` | Image processing utilities |
| `migrate-image-data.mjs` | Migration utilities |

## Dependencies

The image seeding requires:

- **sharp**: Image processing library
- **@prisma/client**: Database access
- **fs/promises**: File system operations

These are already included in the project's `package.json`.

## Future Improvements

- [ ] Support for multiple image sizes (thumbnail, medium, large)
- [ ] Image optimization and compression
- [ ] Batch image upload via CSV
- [ ] AI-generated product images
- [ ] Integration with external image APIs
- [ ] WebP format support
- [ ] Automatic image resizing on upload
