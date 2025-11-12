# VS Code Claude Chat Prompts

Copy and paste these prompts into VS Code's Claude chat to get your app working!

---

## 🚀 PROMPT 1: Fresh Start with GUARANTEED Beautiful UI (RECOMMENDED)

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

## 🚀 PROMPT 2: Fix API Connection

```
My React app can't connect to the API. I have:

- API working at: https://aztekafoods.com/api/products
- Frontend at: https://aztekafoods.com
- fetchFromAPI function in src/lib/apiClient.ts

The problem:
- API returns data when I curl it
- But frontend shows white page
- Console shows errors about fetchFromAPI

Please:
1. Check src/lib/apiClient.ts - make sure fetchFromAPI works correctly
2. Check if API_BASE is set correctly (should be empty string for relative URLs)
3. Make sure buildUrl function handles empty API_BASE correctly
4. Test the connection and fix any issues

The API endpoint is: /api/products
It should return an array of products.

Fix the API connection so the frontend can fetch products!
```

---

## 🚀 PROMPT 3: Fix White Page Issue

```
I'm getting a white page on https://aztekafoods.com

I've tried:
- Fixing Service Worker (unregistered it)
- Rebuilding frontend
- Checking API (it works)
- Hard refresh

The browser console shows:
- Service Worker registered
- Some JavaScript errors

Please:
1. Check what's causing the white page
2. Look at src/main.tsx and src/App.tsx
3. Check if there are any JavaScript errors preventing render
4. Check if root div exists in index.html
5. Check if React is mounting correctly
6. Create a minimal working version if needed

The app structure:
- src/main.tsx - entry point
- src/App.tsx - main app component
- src/components/ - UI components
- dist/ - build output

Fix the white page so I can see my app!
```

---

## 🚀 PROMPT 4: Connect Beautiful Catalog to API (GUARANTEES Beautiful UI)

```
I have beautiful Bolt-designed UI components but they're not showing data from the API.

Beautiful Components I have (MUST USE THESE):
- ProductCard.tsx - Beautiful product cards with gradients, animations, hover effects
- Hero.tsx - Beautiful hero section with gradient backgrounds
- CategoryTabs.tsx - Beautiful category navigation with icons
- CatalogGrid.tsx - Beautiful grid layout with filters
- ProductBillboard.tsx - Beautiful featured products showcase
- BundleShowcase.tsx - Beautiful product bundles display
- SpecialOffers.tsx - Beautiful special offers section
- FilterSidebar.tsx (advanced filtering)

API I have:
- /api/products - returns array of products
- /api/categories - returns array of categories
- /api/brands - returns array of brands

Current App.tsx:
- Uses Supabase (old code)
- Doesn't use API
- Shows white page

I need you to:
1. Update App.tsx to use fetchFromAPI instead of Supabase
2. Connect ProductCard to real product data
3. Connect CatalogGrid to real products
4. Connect CategoryTabs to real categories
5. Make everything work with the API

The API base URL should be empty (relative URLs).
Use fetchFromAPI from src/lib/apiClient.ts.

Make my beautiful catalog show real data from the API!
```

---

## 🚀 PROMPT 5: Build Complete Working App

```
I need a complete working wholesale catalog app. Here's what I have:

BACKEND (Working):
- PostgreSQL database with products, categories, brands
- API at /api/products, /api/categories, /api/brands
- Express server running on port 3002
- Database connection string: postgresql://azteka_user:8jzL7PwAKwvNHZyBydKPImCnj@localhost:5432/azteka_dsd

FRONTEND (Not Working):
- React + Vite app
- Beautiful Bolt-designed UI components (MUST USE THESE):
  - ProductCard.tsx - Beautiful product cards with gradients, animations, hover effects
  - Hero.tsx - Beautiful hero section with gradient backgrounds
  - CategoryTabs.tsx - Beautiful category navigation with icons
  - CatalogGrid.tsx - Beautiful grid layout with filters
  - ProductBillboard.tsx - Beautiful featured products showcase
  - BundleShowcase.tsx - Beautiful product bundles display
  - SpecialOffers.tsx - Beautiful special offers section
  - BulkOrderSheet.tsx - Beautiful bulk ordering interface
  - Cart.tsx - Beautiful shopping cart
  - Checkout.tsx - Beautiful checkout flow
- Currently shows white page
- Uses old Supabase code (needs to use API)

FEATURES NEEDED:
1. Product catalog - show all products in beautiful grid using ProductCard
2. Hero section - beautiful hero at top using Hero component
3. Category navigation - beautiful tabs using CategoryTabs component
4. Featured products - beautiful showcase using ProductBillboard component
5. Special offers - beautiful offers section using SpecialOffers component
6. Bundles - beautiful bundles using BundleShowcase component
7. Category filtering - filter by category
8. Brand filtering - filter by brand
9. Search - search products by name
10. Add to cart - add products to cart
11. Cart view - show cart items using Cart component
12. Bulk ordering - multi-store ordering using BulkOrderSheet component

CRITICAL REQUIREMENTS:
1. MUST use ProductCard component (beautiful Bolt design) - DO NOT create plain cards
2. MUST use Hero component (beautiful hero section)
3. MUST use CategoryTabs component (beautiful navigation)
4. MUST use ProductBillboard for featured products
5. MUST use SpecialOffers and BundleShowcase sections
6. MUST preserve all animations and gradients
7. MUST use Tailwind CSS classes (not inline styles)
8. MUST transform data correctly (camelCase → snake_case, ensure price is number)

Please:
1. Create a working App.tsx that uses the API
2. Connect ALL beautiful components to real data
3. Make it work immediately (no white page)
4. Use ALL my existing beautiful Bolt-designed components
5. Add cart functionality using Cart component
6. Make it PWA-ready for tablets
7. Display the FULL beautiful UI with all components

The app should:
- Fetch products from /api/products
- Display in beautiful grid using ProductCard (Bolt design)
- Show Hero section at top
- Show CategoryTabs for navigation
- Show ProductBillboard for featured products
- Show SpecialOffers and BundleShowcase sections
- Allow filtering and searching
- Allow adding to cart
- Work on tablets (PWA)
- Look EXACTLY like the Bolt design - beautiful gradients, animations, hover effects

Build me a complete working catalog app with the FULL beautiful UI!
```

---

## 🚀 PROMPT 6: Deploy and Test

```
I've built my app and need to deploy it to my VPS.

VPS Details:
- Host: root@77.243.85.8
- Project path: /srv/azteka-dsd
- Nginx serving: /srv/azteka-dsd/dist
- PM2 running: azteka-api on port 3002
- Domain: https://aztekafoods.com

Current Status:
- Local build works
- Need to deploy to VPS
- Need to verify it works

Please:
1. Create a deployment script that:
   - Builds the app locally
   - Syncs to VPS
   - Restarts services
   - Verifies deployment

2. Create a verification script that:
   - Checks if API is working
   - Checks if frontend loads
   - Checks for errors
   - Tests the catalog

3. Give me commands to:
   - Deploy the app
   - Test it works
   - Check logs if issues

Make it easy to deploy and test!
```

---

## 🚀 PROMPT 7: Add Missing Features

```
My catalog is working! Now I need to add features.

Current working features:
- Product catalog display
- API connection
- Beautiful UI

Features to add:
1. Cart functionality - make "Add to Cart" work
2. Cart view - show cart items, update quantities, remove items
3. Checkout - collect customer info, submit order
4. Bulk ordering - use my existing BulkOrderSheet component
5. Category filtering - use my existing CategoryTabs
6. Brand filtering - use my existing FilterSidebar
7. Search - search products by name

I have these components already:
- Cart.tsx
- Checkout.tsx
- BulkOrderSheet.tsx
- CategoryTabs.tsx
- FilterSidebar.tsx

Please:
1. Add cart state management
2. Connect Cart component
3. Connect Checkout component
4. Connect BulkOrderSheet
5. Add filtering and search
6. Make everything work together

Build these features incrementally so I can test each one!
```

---

## 🚀 PROMPT 8: Fix Specific Error

```
I'm getting this error: [PASTE ERROR HERE]

[PASTE FULL ERROR MESSAGE FROM BROWSER CONSOLE]

The error happens when:
- [DESCRIBE WHEN IT HAPPENS]

I've tried:
- [LIST WHAT YOU'VE TRIED]

Please:
1. Analyze the error
2. Find the root cause
3. Fix it
4. Explain what was wrong
5. Prevent it from happening again

Fix this error so my app works!
```

---

## 🎯 Quick Start: Use This First

**Start with PROMPT 1** - it will get your catalog working immediately!

Then use the other prompts as needed.

---

## 📝 How to Use

1. Open VS Code
2. Open Claude chat (Cmd+L or Ctrl+L)
3. Copy one of the prompts above
4. Paste into Claude chat
5. Let Claude fix it!

---

## 🔄 Workflow

1. **PROMPT 1** - Get catalog working
2. **PROMPT 4** - Connect all components
3. **PROMPT 7** - Add features
4. **PROMPT 6** - Deploy and test
5. **PROMPT 8** - Fix any errors

Start with PROMPT 1 and you'll see your beautiful catalog working!

