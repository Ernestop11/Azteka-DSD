# Catalog Page MVP Template - Christmas 2025 v2

## Snapshot Date: December 24, 2025

This document captures the working state of the catalog page as the MVP template.

---

## Key Files

### Main Catalog Files
- `app/catalog/page.tsx` - Server component wrapper
- `app/catalog/CatalogContent.tsx` - Main client component (all UI logic)
- `app/catalog/[slug]/page.tsx` - Dynamic category pages

### Supporting Files
- `components/catalog/ProductCard.tsx` - Reusable product card
- `lib/imageUrl.ts` - Image URL helper with VPS base
- `modules/catalog-ui/components/ProductGrid.tsx` - Grid layout

---

## Catalog Block Types

The catalog supports these block types:
1. **HERO** - Full-width rotating hero with featured products
2. **PRODUCT_GRID** - Standard grid of products
3. **PRODUCT_CARDS** - Card-style product display
4. **BANNER** - Promotional banner
5. **CATEGORY_ROW** - Horizontal category scroller
6. **PROMO_SECTION** - Special promotions
7. **RACK_BUNDLE** - Bundled rack displays
8. **VENDOR_SPOTLIGHT** - Featured vendor
9. **CASE_DEAL** - Case quantity deals
10. **NEW_ARRIVALS** - Recently added products
11. **QUICK_REORDER** - Fast reorder section
12. **BULK_BUILDER** - Bulk order builder
13. **SEASONAL_THEME** - Holiday/seasonal content
14. **BRAND_SHOWCASE** - Brand-focused display

---

## Visual Settings (Current Working State)

### Hero Block
- Gradient: `linear-gradient(135deg, #1a472a 0%, #d97706 50%, #dc2626 100%)` (Mexican flag colors)
- Auto-rotation: 5 seconds per product
- Mobile responsive: Stacked layout on small screens

### Product Cards
- Border radius: `rounded-2xl` on desktop, `rounded-xl` on mobile
- Shadow: `shadow-xl` with hover `shadow-2xl`
- Image aspect: Square with object-cover
- Price display: Bold with unit price below

### Spacing
- Section gap: `gap-4` on mobile, `gap-8` on desktop
- Card padding: `p-3` on mobile, `p-4` on desktop
- Grid columns: 2 mobile, 3-4 tablet, 5-6 desktop

---

## API Endpoints

### Catalog Data
- `GET /api/catalog/products` - All products with filters
- `GET /api/catalog/brands` - All brands
- `GET /api/catalog/categories` - All categories
- `GET /api/catalog/blocks` - Layout blocks
- `GET /api/catalog/settings` - Display settings

### Admin Catalog Management
- `GET/POST /api/admin/catalog/layout` - Manage blocks
- `POST /api/admin/catalog/upload-image` - Upload images

---

## Image Handling

### VPS Direct Upload
Images are uploaded directly to VPS via `lib/services/vpsUpload.ts`:
```
VPS Path: /srv/azteka-dsd/public/uploads/
- products/   - Product images
- brands/     - Brand logos
- categories/ - Category images
- catalog/    - Hero/promo images
```

### Image URL Resolution
`lib/imageUrl.ts` handles URL generation:
- Production: `https://aztekafoods.com/uploads/...`
- Development: `/uploads/...`
- Cache busting: `?v=timestamp`

---

## Cart Integration

Uses `@/hooks/useCart` with:
- Add to cart with quantity
- Remove items
- Update quantities
- Persist to localStorage
- Sync with server for logged-in users

---

## Performance Optimizations

1. **React Query** for data fetching with caching
2. **Lazy loading** for off-screen images
3. **Framer Motion** for smooth animations (kept minimal)
4. **Code splitting** per page

---

## Mobile Responsiveness

Breakpoints used:
- `sm:` 640px - Small tablets
- `md:` 768px - Tablets
- `lg:` 1024px - Small desktops
- `xl:` 1280px - Large desktops

Key mobile adaptations:
- Hero: Vertical stack instead of side-by-side
- Grid: 2 columns instead of 4-6
- Text: Smaller font sizes
- Buttons: Full-width on mobile

---

## Deployment Info

```
VPS: /srv/azteka-dsd
PM2 Process: azteka-nextjs
Deploy Script: ./scripts/deploy-vps.sh
```

---

## Restore Instructions

If catalog breaks, restore from this backup:

1. **Git tag**: `christmas-v2-mvp-2025`
2. **VPS backup**: `/srv/azteka-dsd-backup-christmas-v2.tar.gz`
3. **Key**: Catalog relies on blocks in database - check `CatalogBlock` table

---

## Last Verified Working: December 24, 2025
