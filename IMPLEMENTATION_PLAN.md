# 🚀 Implementation Plan - Azteka DSD System

## 📋 Overview

This plan outlines the step-by-step implementation of the complete Azteka DSD system, preserving all beautiful Bolt-designed UI components and ensuring all features work together.

---

## 🎯 **PHASE 1: Core Catalog with Beautiful UI** (Priority 1)

### ✅ Goal
Build a working catalog app with ALL beautiful Bolt-designed components, including bundle ordering.

### ✅ Features
1. **Beautiful UI Components**
   - ProductCard
   - Hero
   - CategoryTabs
   - CatalogGrid
   - ProductBillboard
   - BundleShowcase
   - SpecialOffers
   - **BulkOrderSheet** (Bundle ordering - ESSENTIAL)

2. **Core Functionality**
   - Fetch products from API
   - Display in beautiful grid
   - Category navigation
   - Search functionality
   - Add to cart
   - **Bundle ordering tab** (BulkOrderSheet)

3. **Data Transformation**
   - camelCase → snake_case
   - Ensure price is number
   - Handle missing properties

### ✅ Deliverables
- Working App.tsx with all beautiful components
- Bundle ordering accessible via tab/button
- Products displayed beautifully
- No white page
- Works immediately

---

## 🎯 **PHASE 2: Admin Features** (Priority 2)

### ✅ Goal
Add admin functionality, especially PO invoice upload for seeding products.

### ✅ Features
1. **PO Invoice Upload** (ESSENTIAL)
   - Upload PDF/image invoices
   - AI OCR + Vision parsing
   - Auto-create products
   - Auto-update products
   - Invoice tracking

2. **Purchase Orders**
   - View POs
   - Create POs
   - Mark as received
   - PO status

3. **Admin Dashboard**
   - Orders management
   - Product management
   - Analytics
   - Reports

### ✅ Deliverables
- Admin routes (/admin/*)
- Invoice upload page
- PO management page
- Admin dashboard
- Product seeding via invoice

---

## 🎯 **PHASE 3: Sales Features** (Priority 3)

### ✅ Goal
Add sales rep functionality and route management.

### ✅ Features
1. **Sales Rep Dashboard**
   - Personal performance
   - Customer list
   - Order history

2. **Route Builder**
   - Drag to organize
   - Map integration
   - Multi-stop optimization

3. **Tablet Catalog**
   - Beautiful catalog for tablets
   - Offline capability
   - Customer-specific pricing

### ✅ Deliverables
- Sales rep dashboard
- Route builder
- Tablet-optimized catalog
- Offline capability

---

## 🎯 **PHASE 4: Inventory & Fulfillment** (Priority 4)

### ✅ Goal
Complete inventory management and fulfillment features.

### ✅ Features
1. **Inventory Management**
   - Stock tracking
   - Out-of-stock handling
   - Case/piece management
   - Credit for damaged goods

2. **Fulfillment**
   - Automatic printing
   - Warehouse screens
   - Receiving system
   - QR code system
   - Warehouse PWA

### ✅ Deliverables
- Inventory management
- Fulfillment system
- Warehouse screens
- QR code system
- Warehouse PWA

---

## 🎯 **PHASE 5: Advanced Features** (Priority 5)

### ✅ Goal
Add advanced features like analytics, gamification, and PWA.

### ✅ Features
1. **Analytics & Reporting**
   - P&L statements
   - Sales analytics
   - Inventory analytics

2. **Gamification & Loyalty**
   - Loyalty points
   - Badges
   - Leaderboards

3. **PWA Features**
   - Offline capability
   - Installation
   - Service worker

### ✅ Deliverables
- Analytics dashboard
- Gamification system
- PWA functionality
- Complete system

---

## 📝 **PROMPT BLOCKS**

### 🚀 **PROMPT 1: Core Catalog with Beautiful UI + Bundle Ordering**

```
I want to build a complete wholesale catalog app that GUARANTEES:
1. ALL beautiful Bolt-designed UI components are preserved and used
2. Bundle ordering (BulkOrderSheet) is accessible and working
3. PO invoice upload is accessible for admin
4. All features work together seamlessly

What I have that works:
- ✅ PostgreSQL database with products (21 tables)
- ✅ API endpoints: /api/products, /api/categories, /api/brands, /api/orders, /api/po, /api/invoices
- ✅ Beautiful Bolt-designed UI components (MUST USE THESE):
  - ProductCard.tsx - Beautiful product cards
  - Hero.tsx - Beautiful hero section
  - CategoryTabs.tsx - Beautiful category navigation
  - CatalogGrid.tsx - Beautiful grid layout
  - ProductBillboard.tsx - Beautiful featured showcase
  - BundleShowcase.tsx - Beautiful bundles
  - SpecialOffers.tsx - Beautiful offers
  - BulkOrderSheet.tsx - ⚡ ESSENTIAL - Beautiful bulk ordering (bundle ordering)
  - Cart.tsx - Beautiful shopping cart
  - Checkout.tsx - Beautiful checkout
- ✅ Express backend running on VPS
- ✅ Nginx serving static files
- ✅ Tailwind CSS with custom animations

What I need:
- Complete App.tsx that:
  1. Uses ALL beautiful Bolt-designed components
  2. Fetches products, categories, brands from API
  3. Transforms API data (camelCase → snake_case, ensure price is number)
  4. Displays FULL beautiful UI:
     - Hero component at top
     - CategoryTabs for navigation
     - ProductBillboard for featured products
     - CatalogGrid OR ProductCard grid for all products
     - SpecialOffers section
     - BundleShowcase section
  5. ⚡ ESSENTIAL: Bundle ordering accessible via:
     - Tab/button in navigation
     - Opens BulkOrderSheet component
     - Allows multi-store ordering
     - Submit all orders
  6. Cart functionality
  7. Checkout functionality
  8. Works immediately (no white page)
  9. No Service Worker
  10. Clean state management

The app is at: /Users/ernestoponce/dev/azteka-dsd
Components are at: src/components/
API returns: { id, name, sku, price, imageUrl, inStock, unitType, unitsPerCase, etc. }
Components expect: { id, name, image_url, background_color, in_stock, price (number!), etc. }

CRITICAL REQUIREMENTS:
1. MUST use ProductCard component (beautiful Bolt design) - DO NOT create plain cards
2. MUST use Hero component (beautiful hero section)
3. MUST use CategoryTabs component (beautiful navigation)
4. ⚡ MUST include BulkOrderSheet (bundle ordering) - accessible via tab/button
5. MUST preserve all animations and gradients
6. MUST use Tailwind CSS classes (not inline styles)
7. MUST transform data correctly (camelCase → snake_case, ensure price is number)
8. MUST ensure price is a number before passing to ProductCard

Create a complete, working App.tsx that:
- Imports and uses ALL beautiful components (ProductCard, Hero, CategoryTabs, ProductBillboard, BulkOrderSheet, etc.)
- Uses fetch() directly (no complex apiClient)
- Transforms data properly (camelCase → snake_case, ensure price is number)
- Handles errors gracefully
- Shows loading state
- Displays FULL beautiful UI with all components
- ⚡ Includes bundle ordering (BulkOrderSheet) accessible via tab/button
- Works immediately!

The UI must look EXACTLY like the Bolt design - beautiful gradients, animations, hover effects, etc.

Then update main.tsx to use this App.

Make it complete, beautiful, and WORKING with bundle ordering!
```

---

### 🚀 **PROMPT 2: Admin Features + PO Invoice Upload**

```
I want to add admin features to my Azteka DSD app, especially PO invoice upload for seeding products.

What I have:
- ✅ Working catalog app with beautiful UI
- ✅ API endpoints: /api/invoices/upload, /api/po, /api/admin/*
- ✅ InvoiceUpload.tsx component (already exists)
- ✅ PurchaseOrders.tsx component (already exists)
- ✅ AdminOrders.tsx component (already exists)
- ✅ React Router setup

What I need:
1. Admin routes (/admin/*):
   - /admin - Admin dashboard
   - /admin/invoices - PO invoice upload (ESSENTIAL for seeding products)
   - /admin/po - Purchase orders
   - /admin/orders - Orders management
   - /admin/analytics - Analytics dashboard
   - /admin/automation - Automation center

2. PO Invoice Upload (ESSENTIAL):
   - Upload PDF/image invoices
   - AI OCR + Vision parsing
   - Auto-create products from invoice
   - Auto-update existing products
   - Invoice tracking
   - Product seeding

3. Admin Dashboard:
   - Quick access to all admin features
   - Orders overview
   - PO overview
   - Analytics overview

4. Navigation:
   - Admin menu/button (only visible to admin users)
   - Links to all admin pages
   - Back to catalog button

The app is at: /Users/ernestoponce/dev/azteka-dsd
Admin pages are at: src/pages/
Admin components are at: src/components/

Create:
1. Admin routes in App.tsx or separate router
2. Navigation to admin pages
3. Ensure InvoiceUpload page is accessible
4. Ensure all admin features work
5. Add admin authentication check

Make admin features accessible and working, especially PO invoice upload!
```

---

### 🚀 **PROMPT 3: Complete System Integration**

```
I want to integrate all features into a complete Azteka DSD system.

What I have:
- ✅ Working catalog with beautiful UI
- ✅ Bundle ordering (BulkOrderSheet)
- ✅ Admin features (PO invoice upload, PO management, orders)
- ✅ Sales features (dashboards, routes)
- ✅ Inventory features (600+ products, stock management)
- ✅ Fulfillment features (printing, warehouse)

What I need:
1. Complete navigation:
   - Home/Catalog
   - Bundle Ordering (BulkOrderSheet)
   - Admin (with submenu)
   - Sales (with submenu)
   - Inventory
   - Fulfillment

2. Role-based access:
   - Admin sees admin features
   - Sales rep sees sales features
   - Customer sees catalog
   - Warehouse sees fulfillment

3. Feature integration:
   - All features work together
   - Data syncs across features
   - Orders flow from sales → fulfillment
   - Products flow from PO → inventory → sales

4. PWA features:
   - Offline capability
   - Installation
   - Service worker

The app is at: /Users/ernestoponce/dev/azteka-dsd

Create:
1. Complete navigation system
2. Role-based routing
3. Feature integration
4. PWA setup
5. Complete system

Make it a complete, working, beautiful system!
```

---

## ✅ **SUMMARY**

### Phase 1: Core Catalog + Bundle Ordering (START HERE)
- Beautiful UI
- Bundle ordering accessible
- Works immediately

### Phase 2: Admin Features
- PO invoice upload
- PO management
- Admin dashboard

### Phase 3: Sales Features
- Sales dashboards
- Route builder
- Tablet catalog

### Phase 4: Inventory & Fulfillment
- Inventory management
- Fulfillment system
- Warehouse PWA

### Phase 5: Advanced Features
- Analytics
- Gamification
- Complete PWA

---

**Ready to proceed! Start with PROMPT 1!**

