# Fresh Start - GUARANTEED Beautiful UI Prompt

## 🎨 This Prompt GUARANTEES Your Beautiful Bolt-Designed UI

Copy this into VS Code Claude chat:

---

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

## 🎨 What This Guarantees

### ✅ Beautiful Components Used:
1. **ProductCard** - Beautiful cards with gradients, animations, hover effects
2. **Hero** - Beautiful hero section with gradient backgrounds
3. **CategoryTabs** - Beautiful category navigation
4. **CatalogGrid** - Beautiful grid with filters
5. **ProductBillboard** - Beautiful featured products showcase
6. **BundleShowcase** - Beautiful bundles display
7. **SpecialOffers** - Beautiful offers section
8. **All animations preserved** - fadeInUp, hover effects, etc.
9. **All gradients preserved** - emerald-500 to teal-600, etc.
10. **All Tailwind CSS classes** - No inline styles

### ✅ Full Beautiful UI:
- Hero section at top
- Category navigation
- Featured products showcase
- Product grid with beautiful cards
- Special offers
- Bundles
- All with animations and gradients

## 🚫 What This Prevents

- ❌ Plain/basic cards
- ❌ Inline styles
- ❌ Missing animations
- ❌ Missing gradients
- ❌ Simplified UI
- ❌ Losing the beautiful design

## ✅ Result

After running this prompt:
- ✅ Full beautiful Bolt-designed UI
- ✅ All components working
- ✅ All animations preserved
- ✅ All gradients preserved
- ✅ Products displayed beautifully
- ✅ No white page
- ✅ Ready to add more features

**This guarantees your beautiful UI is preserved!**

