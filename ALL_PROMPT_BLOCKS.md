# 🚀 All Prompt Blocks - Copy-Paste Ready

## 📋 Overview

All prompts in order for building the complete Azteka DSD system. Copy-paste into VS Code Claude chat.

---

## ✅ PROMPT 1: Save Working Version to GitHub

```
I want to save my current working Azteka DSD app to GitHub.

Current state:
- ✅ Working app with all features functional
- ✅ White page fixed (Three.js removed from CustomerPortal)
- ✅ Bundle ordering working
- ✅ PO invoice upload working
- ✅ Beautiful UI components preserved
- ✅ All navigation working

What I need:
1. Check if git is initialized
2. If not, initialize git repo
3. Add all files to git
4. Commit with descriptive message
5. Push to GitHub (https://github.com/Ernestop11/Azteka-DSD.git)
6. Create tag v1.0.0-stable for this working version
7. Push tag to GitHub

The app is at: /Users/ernestoponce/dev/azteka-dsd
GitHub repo: https://github.com/Ernestop11/Azteka-DSD.git

CRITICAL REQUIREMENTS:
1. MUST preserve all working code
2. MUST create descriptive commit message
3. MUST tag as v1.0.0-stable
4. MUST push to GitHub

Create git commands or guide me through:
1. Initialize git (if needed)
2. Add remote (if needed)
3. Add all files
4. Commit with message: "feat: Working version - All features functional - White page fixed, Three.js removed from CustomerPortal, bundle ordering and PO invoice upload working"
5. Push to main branch
6. Create and push tag v1.0.0-stable

Make sure my working version is safely saved to GitHub!
```

---

## ✅ PROMPT 2: Polish UI to Match Bolt Design

```
I want to polish the UI to match Bolt's original design details. Some details were lost during the Three.js fix.

What I have:
- ✅ Working app with beautiful UI components
- ✅ All Bolt-designed components preserved
- ✅ Bundle ordering working
- ✅ PO invoice upload working

What I need:
1. Restore missing Bolt design details:
   - Gradient effects (emerald-500 to teal-600)
   - Hover animations (scale-105, shadow-2xl)
   - Backdrop blur effects
   - Smooth transitions (duration-300, duration-500)
   - Beautiful typography (font-black, text-4xl)
   - Shadow effects (shadow-lg, shadow-2xl)
   - Border radius (rounded-2xl, rounded-3xl)
   - Color gradients in backgrounds
   - Icon animations
   - Product card hover effects

2. Review all components and ensure:
   - ProductCard.tsx has all original gradients and animations
   - Hero.tsx has animated blobs
   - CategoryTabs.tsx has hover effects
   - CatalogGrid.tsx has filter sidebar
   - All buttons have gradient backgrounds
   - All cards have proper shadows and hover effects
   - All text has proper font weights and sizes
   - All spacing is consistent (p-6, gap-4, etc.)

3. Check these specific components:
   - ProductCard.tsx - Ensure gradients, animations, hover effects
   - Hero.tsx - Ensure animated blobs, gradient backgrounds
   - CategoryTabs.tsx - Ensure hover effects, active states
   - CatalogGrid.tsx - Ensure filter sidebar, grid layout
   - ProductBillboard.tsx - Ensure featured showcase styling
   - BundleShowcase.tsx - Ensure bundle cards styling
   - SpecialOffers.tsx - Ensure offer cards styling
   - BulkOrderSheet.tsx - Ensure bulk ordering styling
   - Cart.tsx - Ensure cart styling
   - Checkout.tsx - Ensure checkout styling

The app is at: /Users/ernestoponce/dev/azteka-dsd
Components are at: src/components/

CRITICAL REQUIREMENTS:
1. MUST preserve all functionality
2. MUST restore all Bolt design details
3. MUST use Tailwind CSS classes (not inline styles)
4. MUST ensure all gradients are correct (emerald-500 to teal-600, etc.)
5. MUST ensure all animations work (hover effects, transitions)
6. MUST ensure all shadows are correct (shadow-lg, shadow-2xl)
7. MUST ensure all typography is correct (font-black, text-4xl, etc.)

Review each component and restore any missing Bolt design details. Make sure the UI looks EXACTLY like the original Bolt design with all gradients, animations, and effects working perfectly.

Polish the UI to match Bolt's original design!
```

---

## ✅ PROMPT 3: PO Uploader → Receiving Flows → Inventory

```
I want to build a complete PO uploader → receiving flows → inventory system.

Current state:
- ✅ PO invoice upload page exists (/admin/invoices)
- ✅ AI OCR + Vision parsing works
- ✅ Can create/update products from invoices

What I need:
1. Complete receiving flow:
   - Upload PO invoice → AI parses → Shows products
   - Admin reviews and approves products
   - Mark invoice as "Received"
   - Auto-update inventory quantities
   - Auto-update product costs
   - Auto-update stock levels

2. Inventory integration:
   - When PO is received, update inventory
   - Update product quantities
   - Update product costs
   - Update stock levels (in_stock flag)
   - Sync to catalog (out-of-stock products hidden from sales)

3. Receiving workflow UI:
   - Step 1: Upload invoice (already exists)
   - Step 2: AI parses products (already exists)
   - Step 3: Review and edit products (add this)
   - Step 4: Approve and receive button (add this)
   - Step 5: Auto-update inventory (add this)
   - Step 6: Show receiving confirmation (add this)

4. Database updates:
   - Update products table (quantity, cost, in_stock)
   - Create inventory_transactions record
   - Update purchase_orders table (status: received)
   - Create receiving_logs

5. Backend API endpoints:
   - POST /api/invoices/receive - Mark invoice as received
   - POST /api/inventory/update - Update inventory from PO
   - GET /api/inventory/transactions - Get inventory transactions
   - POST /api/receiving/logs - Create receiving log

The app is at: /Users/ernestoponce/dev/azteka-dsd
PO upload is at: src/pages/InvoiceUpload.tsx
Backend API: /api/invoices/upload, /api/inventory/*

Create:
1. Receiving workflow UI in InvoiceUpload.tsx
2. "Approve and Receive" button
3. Inventory update logic in backend
4. Database integration
5. Catalog sync logic

Make it a complete receiving → inventory → catalog flow!
```

---

## ✅ PROMPT 4: Auto Image Search + Background Remover

```
I want to add auto image search and background removal for products.

Current state:
- ✅ Products have image_url field
- ✅ Can upload images manually
- ✅ Remove.bg API available (already in dependencies)

What I need:
1. Auto image search:
   - When product is created/updated, search Google for product image
   - Use product name + brand to search
   - Find best matching image
   - Download and save image
   - Use as product image

2. Background remover:
   - When image is found/uploaded, remove background
   - Use Remove.bg API (already in dependencies)
   - Create transparent background PNG
   - Save transparent image
   - Use in product catalog

3. Image workflow:
   - Step 1: Product created/updated
   - Step 2: Auto-search Google for image (if no image_url)
   - Step 3: Download best image
   - Step 4: Remove background using Remove.bg
   - Step 5: Save transparent PNG
   - Step 6: Update product image_url

4. Backend API endpoints:
   - POST /api/images/search - Search Google for product image
   - POST /api/images/remove-background - Remove background from image
   - POST /api/images/process - Complete workflow (search + remove background)

5. Google Custom Search API:
   - Set up Google Custom Search API
   - Search for product images
   - Download best match
   - Save to /public/products/

6. Remove.bg API:
   - Already in dependencies (remove.bg package)
   - Remove background from image
   - Save transparent PNG
   - Update product image_url

The app is at: /Users/ernestoponce/dev/azteka-dsd
Backend API: /api/products/*, /api/images/*
Remove.bg: Already in package.json

Create:
1. Auto image search endpoint
2. Background removal endpoint
3. Image processing workflow
4. Product image update logic
5. UI for manual image processing (optional)

Make it automatic - when product is created, auto-find and process image!
```

---

## ✅ PROMPT 5: AI Automation + PO Suggestions

```
I want to build AI automation for PO suggestions based on inventory levels and vendor advantages.

Current state:
- ✅ AI insights page exists (/admin/analytics)
- ✅ Can generate PO suggestions manually
- ✅ OpenAI API available
- ✅ Automation center exists (/admin/automation)

What I need:
1. AI automated PO suggestions:
   - Monitor inventory levels daily
   - Detect low stock products
   - Analyze sales trends
   - Consider vendor advantages (pricing, delivery time, quality)
   - Generate PO suggestions automatically
   - Send notifications to admin

2. Inventory monitoring:
   - Check stock levels daily (cron job)
   - Identify products below reorder point
   - Calculate reorder quantities
   - Consider sales velocity
   - Consider lead times

3. Vendor analysis:
   - Compare vendor pricing
   - Compare delivery times
   - Compare product quality
   - Consider vendor relationships
   - Recommend best vendor for each product

4. AI PO generation:
   - Use OpenAI API for analysis
   - Generate PO suggestions with reasoning
   - Include vendor recommendations
   - Include quantity recommendations
   - Include cost estimates

5. Automation:
   - Run daily at scheduled time (cron job)
   - Generate PO suggestions automatically
   - Send email/SMS to admin
   - Create PO drafts ready for approval

6. Backend API endpoints:
   - POST /api/automation/po-suggestions - Generate PO suggestions
   - GET /api/automation/po-suggestions - Get pending suggestions
   - POST /api/automation/po-suggestions/:id/approve - Approve suggestion
   - POST /api/automation/po-suggestions/:id/reject - Reject suggestion

7. Database:
   - Create po_suggestions table
   - Store suggestions with reasoning
   - Track approval status
   - Link to products and vendors

The app is at: /Users/ernestoponce/dev/azteka-dsd
Backend API: /api/po/*, /api/ai/*, /api/automation/*
Automation: src/api/automation/route.js
OpenAI: Already configured

Create:
1. Daily inventory monitoring (cron job)
2. AI PO suggestion generation
3. Vendor analysis logic
4. Automated notifications
5. PO draft creation
6. UI for viewing and approving suggestions

Make it fully automated - AI suggests POs daily based on inventory and vendor data!
```

---

## ✅ PROMPT 6: QuickBooks API Integration

```
I want to integrate QuickBooks API to upload inventory and customer lists.

Current state:
- ✅ PostgreSQL database with products and customers
- ✅ Manual product/customer entry
- ✅ Admin pages for managing products and customers

What I need:
1. QuickBooks API integration:
   - Connect to QuickBooks API
   - Authenticate with OAuth 2.0
   - Fetch inventory items
   - Fetch customer list
   - Sync to PostgreSQL database

2. Inventory sync:
   - Fetch items from QuickBooks
   - Map QuickBooks fields to our schema:
     - QuickBooks Item → Product (name, sku, price, description)
     - QuickBooks Quantity → Stock level
     - QuickBooks Cost → Product cost
   - Create/update products in database
   - Handle duplicates (match by SKU)
   - Preserve existing data

3. Customer sync:
   - Fetch customers from QuickBooks
   - Map QuickBooks fields to our schema:
     - QuickBooks Customer → Customer (business_name, contact_name, email, phone, address)
   - Create/update customers in database
   - Handle duplicates (match by email or business name)
   - Preserve existing data

4. Sync workflow:
   - Step 1: Connect to QuickBooks (OAuth)
   - Step 2: Fetch inventory items
   - Step 3: Map and transform data
   - Step 4: Create/update products
   - Step 5: Fetch customers
   - Step 6: Map and transform data
   - Step 7: Create/update customers
   - Step 8: Show sync results

5. UI for sync:
   - Admin page for QuickBooks sync (/admin/quickbooks)
   - Connect button (OAuth flow)
   - Sync Inventory button
   - Sync Customers button
   - Progress indicator
   - Results display (products synced, customers synced)

6. Backend API endpoints:
   - GET /api/qb/auth - Start OAuth flow
   - GET /api/qb/callback - OAuth callback
   - POST /api/qb/sync/inventory - Sync inventory
   - POST /api/qb/sync/customers - Sync customers
   - GET /api/qb/sync/status - Get sync status

7. QuickBooks API setup:
   - Register app with QuickBooks
   - Get Client ID and Client Secret
   - Set up OAuth redirect URI
   - Configure scopes (accounting, inventory, customers)

The app is at: /Users/ernestoponce/dev/azteka-dsd
Backend API: /api/qb/*
QuickBooks API: https://developer.intuit.com/

Create:
1. QuickBooks OAuth integration
2. Inventory sync endpoint
3. Customer sync endpoint
4. Sync UI page
5. Data mapping logic
6. Duplicate handling

Make it easy to sync inventory and customers from QuickBooks!
```

---

## ✅ PROMPT 7: End-to-End Testing

```
I want to set up end-to-end testing for the complete Azteka DSD system.

What I need:
1. Test all features:
   - Catalog browsing
   - Product search and filtering
   - Bundle ordering (BulkOrderSheet)
   - Cart and checkout
   - PO invoice upload
   - Receiving flows
   - Inventory updates
   - Admin features
   - Sales features
   - Customer portal
   - Driver dashboard

2. Test workflows:
   - Complete order flow (catalog → cart → checkout → order)
   - Complete PO flow (upload → parse → receive → inventory)
   - Complete receiving flow (PO → receive → inventory → catalog)
   - Complete sync flow (QuickBooks → database → catalog)
   - Complete image processing flow (product → search → remove background → catalog)

3. Test automation:
   - AI PO suggestions
   - Auto image search
   - Background removal
   - Inventory monitoring

4. Test integrations:
   - API endpoints
   - Database operations
   - External APIs (QuickBooks, Remove.bg, Google Search)
   - AI services (OpenAI)

5. Test UI:
   - All pages load correctly
   - All components render
   - All animations work
   - All forms submit
   - All navigation works
   - All buttons work
   - All modals work

6. Test data flow:
   - Products flow from PO → inventory → catalog
   - Orders flow from sales → fulfillment
   - Inventory updates sync across system
   - Images process correctly

7. Testing framework:
   - Use Playwright or Cypress
   - Set up test suite
   - Create test files for each feature
   - Run tests automatically

The app is at: /Users/ernestoponce/dev/azteka-dsd
Testing: Use Playwright (recommended) or Cypress

Create:
1. Test suite setup (Playwright or Cypress)
2. Test all features
3. Test all workflows
4. Test all integrations
5. Test all UI components
6. Test data flow
7. CI/CD integration (optional)

Make comprehensive end-to-end tests that verify everything works!
```

---

## 📋 Usage Instructions

### Step 1: Save to GitHub
- Copy **PROMPT 1** into VS Code Claude chat
- Follow the instructions to save your working version

### Step 2: Polish UI
- Copy **PROMPT 2** into VS Code Claude chat
- Review and approve changes to restore Bolt design details

### Step 3: Build Features (in order)
- Copy **PROMPT 3** - PO Uploader → Receiving → Inventory
- Copy **PROMPT 4** - Auto Image Search + Background Remover
- Copy **PROMPT 5** - AI Automation + PO Suggestions
- Copy **PROMPT 6** - QuickBooks Integration
- Copy **PROMPT 7** - End-to-End Testing

### Step 4: Test Everything
- Run all tests
- Verify all features work
- Fix any issues

---

## ✅ Checklist

- [ ] PROMPT 1: Save to GitHub
- [ ] PROMPT 2: Polish UI
- [ ] PROMPT 3: PO → Receiving → Inventory
- [ ] PROMPT 4: Auto Image Search + Background Remover
- [ ] PROMPT 5: AI Automation + PO Suggestions
- [ ] PROMPT 6: QuickBooks Integration
- [ ] PROMPT 7: End-to-End Testing

---

**All prompts are ready to copy-paste! Start with PROMPT 1!**

