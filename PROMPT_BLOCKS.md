# 🚀 Prompt Blocks - Ready to Use

## 📋 Overview

Copy-paste ready prompts for building the complete Azteka DSD system with beautiful UI, bundle ordering, and PO invoice upload.

---

## 🎯 **PROMPT 1: Core Catalog with Beautiful UI + Bundle Ordering** (START HERE)

```
I want to build a complete wholesale catalog app that GUARANTEES:
1. ALL beautiful Bolt-designed UI components are preserved and used
2. Bundle ordering (BulkOrderSheet) is accessible and working
3. All features work together seamlessly

What I have that works:
- ✅ PostgreSQL database with products (21 tables)
- ✅ API endpoints: /api/products, /api/categories, /api/brands, /api/orders
- ✅ Beautiful Bolt-designed UI components (MUST USE THESE):
  - ProductCard.tsx - Beautiful product cards with gradients, animations, hover effects
  - Hero.tsx - Beautiful hero section with gradient backgrounds and animations
  - CategoryTabs.tsx - Beautiful category navigation with icons
  - CatalogGrid.tsx - Beautiful grid layout with filters
  - ProductBillboard.tsx - Beautiful featured products showcase
  - BundleShowcase.tsx - Beautiful product bundles display
  - SpecialOffers.tsx - Beautiful special offers section
  - BulkOrderSheet.tsx - ⚡ ESSENTIAL - Beautiful bulk ordering (bundle ordering)
  - Cart.tsx - Beautiful shopping cart
  - Checkout.tsx - Beautiful checkout flow
- ✅ Express backend running on VPS
- ✅ Nginx serving static files
- ✅ Tailwind CSS with custom animations

What I need:
- Complete App.tsx that:
  1. Uses ALL beautiful Bolt-designed components
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
  8. ⚡ ESSENTIAL: Bundle ordering accessible via:
     - Tab/button in navigation (e.g., "Bulk Order" or "Bundle Order")
     - Opens BulkOrderSheet component in modal/overlay
     - Allows multi-store ordering
     - Submit all orders functionality
  9. Cart functionality (add to cart, view cart, checkout)
  10. Works immediately (no white page)
  11. No Service Worker
  12. Clean state management

The app is at: /Users/ernestoponce/dev/azteka-dsd
Components are at: src/components/
API returns: { id, name, sku, price, imageUrl, inStock, unitType, unitsPerCase, etc. }
Components expect: { id, name, image_url, background_color, in_stock, price (number!), etc. }

CRITICAL REQUIREMENTS:
1. MUST use ProductCard component (beautiful Bolt design) - DO NOT create plain cards
2. MUST use Hero component (beautiful hero section)
3. MUST use CategoryTabs component (beautiful navigation)
4. ⚡ MUST include BulkOrderSheet (bundle ordering) - accessible via tab/button in navigation
5. MUST preserve all animations and gradients
6. MUST use Tailwind CSS classes (not inline styles)
7. MUST transform data correctly (camelCase → snake_case, ensure price is number)
8. MUST ensure price is a number before passing to ProductCard

Create a complete, working App.tsx that:
- Imports and uses ALL beautiful components (ProductCard, Hero, CategoryTabs, ProductBillboard, BulkOrderSheet, Cart, Checkout, etc.)
- Uses fetch() directly (no complex apiClient)
- Transforms data properly (camelCase → snake_case, ensure price is number)
- Handles errors gracefully
- Shows loading state
- Displays FULL beautiful UI with all components
- ⚡ Includes bundle ordering (BulkOrderSheet) accessible via navigation tab/button
- Cart and checkout functionality
- Works immediately!

The UI must look EXACTLY like the Bolt design - beautiful gradients, animations, hover effects, etc.

Then update main.tsx to use this App.

Make it complete, beautiful, and WORKING with bundle ordering!
```

---

## 🎯 **PROMPT 2: Admin Features + PO Invoice Upload**

```
I want to add admin features to my Azteka DSD app, especially PO invoice upload for seeding products via invoice pictures.

What I have:
- ✅ Working catalog app with beautiful UI and bundle ordering
- ✅ API endpoints: /api/invoices/upload, /api/po, /api/admin/*
- ✅ InvoiceUpload.tsx component (already exists at src/pages/InvoiceUpload.tsx)
- ✅ PurchaseOrders.tsx component (already exists at src/pages/PurchaseOrders.tsx)
- ✅ AdminOrders.tsx component (already exists at src/pages/AdminOrders.tsx)
- ✅ React Router setup

What I need:
1. Admin routes (/admin/*):
   - /admin - Admin dashboard (overview of orders, POs, analytics)
   - /admin/invoices - ⚡ ESSENTIAL - PO invoice upload page (for seeding products via invoice pictures)
   - /admin/po - Purchase orders management
   - /admin/orders - Orders management
   - /admin/analytics - Analytics dashboard
   - /admin/automation - Automation center

2. PO Invoice Upload (ESSENTIAL for seeding products):
   - Upload PDF/image invoices
   - AI OCR + Vision parsing
   - Auto-create new products from invoice
   - Auto-update existing products
   - Invoice tracking
   - Product seeding functionality

3. Admin Dashboard:
   - Quick access to all admin features
   - Orders overview
   - PO overview
   - Analytics overview
   - Invoice upload quick access

4. Navigation:
   - Admin menu/button (only visible to admin users)
   - Links to all admin pages
   - Back to catalog button
   - Clear navigation structure

The app is at: /Users/ernestoponce/dev/azteka-dsd
Admin pages are at: src/pages/
Admin components are at: src/components/

CRITICAL REQUIREMENTS:
1. ⚡ MUST make PO invoice upload accessible (InvoiceUpload page)
2. MUST preserve beautiful UI design
3. MUST use existing admin components
4. MUST add proper routing
5. MUST add navigation to admin features

Create:
1. Admin routes in App.tsx or separate router
2. Navigation to admin pages (especially invoice upload)
3. Ensure InvoiceUpload page is accessible at /admin/invoices
4. Ensure all admin features work
5. Add admin authentication check (if needed)
6. Preserve beautiful UI design

Make admin features accessible and working, especially PO invoice upload for seeding products!
```

---

## 🎯 **PROMPT 3: Complete System Integration**

```
I want to integrate all features into a complete Azteka DSD system with beautiful UI, bundle ordering, and admin features.

What I have:
- ✅ Working catalog with beautiful UI
- ✅ Bundle ordering (BulkOrderSheet) accessible
- ✅ Admin features (PO invoice upload, PO management, orders)
- ✅ Sales features (dashboards, routes)
- ✅ Inventory features (600+ products, stock management)
- ✅ Fulfillment features (printing, warehouse)

What I need:
1. Complete navigation system:
   - Home/Catalog (beautiful catalog with all products)
   - Bundle Ordering (BulkOrderSheet - accessible via tab/button)
   - Admin (with submenu: Dashboard, Invoice Upload, PO, Orders, Analytics)
   - Sales (with submenu: Dashboard, Routes, Catalog)
   - Inventory (product management)
   - Fulfillment (warehouse, printing)

2. Role-based access:
   - Admin sees admin features (invoice upload, PO, orders, analytics)
   - Sales rep sees sales features (dashboard, routes, catalog)
   - Customer sees catalog and bundle ordering
   - Warehouse sees fulfillment features

3. Feature integration:
   - All features work together
   - Data syncs across features
   - Orders flow from sales → fulfillment
   - Products flow from PO invoice upload → inventory → sales catalog
   - Bundle ordering creates orders
   - Admin can seed products via invoice upload

4. Beautiful UI preservation:
   - All Bolt-designed components preserved
   - Beautiful navigation
   - Consistent design
   - Animations and gradients

5. PWA features (optional):
   - Offline capability
   - Installation
   - Service worker

The app is at: /Users/ernestoponce/dev/azteka-dsd

CRITICAL REQUIREMENTS:
1. ⚡ MUST preserve bundle ordering (BulkOrderSheet) - accessible via navigation
2. ⚡ MUST preserve PO invoice upload - accessible via admin menu
3. MUST preserve all beautiful UI components
4. MUST integrate all features seamlessly
5. MUST have clear navigation structure

Create:
1. Complete navigation system with all features
2. Role-based routing
3. Feature integration
4. Beautiful UI preservation
5. Complete working system

Make it a complete, working, beautiful system with bundle ordering and PO invoice upload!
```

---

## ✅ **USAGE INSTRUCTIONS**

### Step 1: Start with PROMPT 1
- Copy PROMPT 1 into VS Code Claude chat
- This builds the core catalog with beautiful UI and bundle ordering
- Ensures all Bolt-designed components are used
- Makes bundle ordering accessible

### Step 2: Add Admin Features with PROMPT 2
- Copy PROMPT 2 into VS Code Claude chat
- This adds admin features, especially PO invoice upload
- Makes invoice upload accessible for seeding products
- Adds admin navigation

### Step 3: Integrate Everything with PROMPT 3
- Copy PROMPT 3 into VS Code Claude chat
- This integrates all features
- Creates complete navigation
- Ensures everything works together

---

## 🎯 **KEY FEATURES GUARANTEED**

### ✅ Beautiful UI
- All Bolt-designed components preserved
- Gradients, animations, hover effects
- Tailwind CSS classes
- Consistent design

### ✅ Bundle Ordering (ESSENTIAL)
- BulkOrderSheet component accessible
- Multi-store ordering
- Copy to all stores
- Express delivery
- Submit all orders

### ✅ PO Invoice Upload (ESSENTIAL)
- Upload PDF/image invoices
- AI OCR + Vision parsing
- Auto-create products
- Auto-update products
- Product seeding

### ✅ Complete System
- All features integrated
- Role-based access
- Clear navigation
- Working end-to-end

---

**Ready to use! Copy PROMPT 1 and start building!**

