# Revised VS Code Prompts - GUARANTEED Beautiful UI

## 🎨 PROMPT 1: Fresh Start with Beautiful UI (REVISED)

```
I want to build a fresh, clean wholesale catalog app that GUARANTEES the beautiful Bolt-designed UI is preserved and working.

What I have that works:
- ✅ PostgreSQL database with products (21 tables)
- ✅ API endpoint: /api/products (returns 5 products, works!)
- ✅ Beautiful Bolt-designed UI components (MUST USE THESE):
  - ProductCard.tsx - Beautiful product cards with gradients, animations, hover effects
  - Hero.tsx - Beautiful hero section with gradient backgrounds and animations
  - CategoryTabs.tsx - Beautiful category navigation with icons
  - CatalogGrid.tsx - Beautiful grid layout with filters
  - ProductBillboard.tsx - Beautiful featured products showcase
  - BundleShowcase.tsx - Beautiful product bundles display
  - SpecialOffers.tsx - Beautiful special offers section
  - BulkOrderSheet.tsx - Beautiful bulk ordering interface
  - Cart.tsx - Beautiful shopping cart
  - Checkout.tsx - Beautiful checkout flow
- ✅ Express backend running on VPS
- ✅ Nginx serving static files
- ✅ Tailwind CSS with custom animations

What I need:
- Simple, clean App.tsx that:
  1. Uses ALL the beautiful Bolt-designed components
  2. Fetches products from /api/products
  3. Fetches categories from /api/categories (if available)
  4. Fetches brands from /api/brands (if available)
  5. Transforms API data (camelCase → snake_case for components)
  6. Ensures price is a number (not string)
  7. Displays the FULL beautiful UI:
     - Hero component at top
     - CategoryTabs for navigation
     - ProductBillboard for featured products
     - CatalogGrid OR ProductCard grid for all products
     - SpecialOffers section
     - BundleShowcase section
  8. Works immediately (no white page)
  9. No Service Worker
  10. No complex state management
  11. Just: fetch → transform → display with beautiful components

The app is at: /Users/ernestoponce/dev/azteka-dsd
Components are at: src/components/
API returns: { id, name, sku, price, imageUrl, inStock, unitType, unitsPerCase, etc. }
Components expect: { id, name, image_url, background_color, in_stock, price (number!), etc. }

CRITICAL REQUIREMENTS:
1. MUST use ProductCard component (beautiful Bolt design) - DO NOT create plain cards
2. MUST use Hero component (beautiful hero section)
3. MUST use CategoryTabs component (beautiful navigation)
4. MUST preserve all animations and gradients
5. MUST use Tailwind CSS classes (not inline styles)
6. MUST transform data correctly so ProductCard gets all properties it needs
7. MUST ensure price is a number before passing to ProductCard

Create a clean, working App.tsx that:
- Imports and uses ProductCard, Hero, CategoryTabs, ProductBillboard, etc.
- Uses fetch() directly (no complex apiClient)
- Transforms data properly (camelCase → snake_case, ensure price is number)
- Handles errors gracefully
- Shows loading state
- Displays the FULL beautiful UI with all components
- Works immediately!

The UI must look EXACTLY like the Bolt design - beautiful gradients, animations, hover effects, etc.

Then update main.tsx to use this App.

Make it simple, clean, and WORKING with the FULL beautiful UI!
```

---

## 🎨 PROMPT 2: Fix Current App to Use Beautiful UI

```
My AppSimple.tsx works but uses plain HTML cards instead of the beautiful ProductCard component.

I have:
- ✅ AppSimple.tsx working (shows products)
- ✅ Beautiful ProductCard.tsx component (Bolt design with gradients, animations)
- ✅ Beautiful Hero.tsx component
- ✅ Beautiful CategoryTabs.tsx component
- ✅ Beautiful CatalogGrid.tsx component
- ✅ All other beautiful components

I need:
- Replace plain HTML cards in AppSimple with ProductCard component
- Add Hero component at top
- Add CategoryTabs component for navigation
- Use CatalogGrid for the product grid
- Preserve all animations and gradients
- Transform data correctly (camelCase → snake_case, ensure price is number)

The app is at: /Users/ernestoponce/dev/azteka-dsd
ProductCard is at: src/components/ProductCard.tsx

Update AppSimple.tsx to:
1. Import ProductCard, Hero, CategoryTabs, CatalogGrid
2. Replace plain cards with ProductCard
3. Add Hero at top
4. Add CategoryTabs for navigation
5. Use CatalogGrid for product grid
6. Transform data correctly for ProductCard
7. Ensure price is number
8. Preserve all beautiful styling

Make it use the beautiful Bolt-designed components!
```

---

## 🎨 PROMPT 3: Complete Beautiful Catalog App

```
I want a complete beautiful wholesale catalog app using ALL the Bolt-designed components.

What I have:
- ✅ PostgreSQL database with products, categories, brands
- ✅ API endpoints: /api/products, /api/categories, /api/brands
- ✅ Beautiful Bolt-designed components:
  - ProductCard.tsx - Beautiful product cards
  - Hero.tsx - Beautiful hero section
  - CategoryTabs.tsx - Beautiful category navigation
  - CatalogGrid.tsx - Beautiful grid with filters
  - ProductBillboard.tsx - Beautiful featured showcase
  - BundleShowcase.tsx - Beautiful bundles
  - SpecialOffers.tsx - Beautiful offers
  - BulkOrderSheet.tsx - Beautiful bulk ordering
  - Cart.tsx - Beautiful cart
  - Checkout.tsx - Beautiful checkout
- ✅ Tailwind CSS with animations

What I need:
- Complete App.tsx that uses ALL beautiful components:
  1. Hero component at top
  2. CategoryTabs for navigation
  3. SpecialOffers section
  4. BundleShowcase section
  5. ProductBillboard for featured products
  6. CatalogGrid for full catalog view
  7. All with beautiful styling, animations, gradients

The app is at: /Users/ernestoponce/dev/azteka-dsd
Components are at: src/components/

Create App.tsx that:
- Fetches products, categories, brands from API
- Transforms data correctly (camelCase → snake_case, ensure price is number)
- Uses ALL beautiful components
- Preserves all animations and gradients
- Works immediately
- Shows the FULL beautiful UI

Make it complete and beautiful!
```

---

## ✅ What These Prompts Guarantee

1. **ProductCard is used** - Beautiful Bolt design, not plain cards
2. **Hero is used** - Beautiful hero section
3. **CategoryTabs is used** - Beautiful navigation
4. **All components used** - Full beautiful UI
5. **Animations preserved** - fadeInUp, hover effects, etc.
6. **Gradients preserved** - emerald-500 to teal-600, etc.
7. **Tailwind CSS** - No inline styles
8. **Full beautiful UI** - Not simplified

## 🎯 Use Prompt 1

**Start with PROMPT 1** - it guarantees the full beautiful UI!

