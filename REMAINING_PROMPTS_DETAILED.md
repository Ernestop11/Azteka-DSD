# 🚀 Remaining Prompts - Detailed & Complete

## 📋 Overview

Full detailed prompts for Claude after UI Polish and PO Receiving are complete. Copy-paste ready.

---

## ✅ PROMPT 4: Auto Image Search + Background Remover + AI Splash Images

```
I want to add auto image search, background removal, and AI splash image generation for products.

Current state:
- ✅ Products have image_url field
- ✅ Can upload images manually
- ✅ PO invoice upload can extract product images
- ✅ Remove.bg API available (already in dependencies)
- ✅ Products can be marked as "special" (triggers AI splash image)

What I need:
1. Auto Image Search:
   - When product is created/updated without image, search Google for product image
   - Use product name + brand to search
   - Find best matching image
   - Download and save image
   - Use as product image

2. Background Remover:
   - When image is found/uploaded, remove background automatically
   - Use Remove.bg API (already in dependencies)
   - Create transparent background PNG
   - Save transparent image
   - Update product image_url with transparent version

3. AI Splash Image Generation (NEW):
   - When product is marked as "special":
     - Auto-generate splash/showcase image using AI
     - Use product image (background removed) as base
     - Add cool effects, gradients, text overlays
     - Create branded showcase banner
     - Preview splash image before saving
   - AI splash image builder:
     - Select product
     - Choose style (modern, classic, bold, elegant)
     - Add text overlay (product name, tagline, price)
     - Add effects (gradients, shadows, animations)
     - Preview and generate
   - Save splash image to product (splash_image_url field)
   - Use splash image in Featured Products section or special showcases

4. Image Processing Workflow:
   - Step 1: Product created/updated
   - Step 2: Check if image_url exists
   - Step 3a: If no image → Auto-search Google for image
   - Step 3b: If image exists → Skip to step 4
   - Step 4: Download best image
   - Step 5: Remove background using Remove.bg
   - Step 6: Save transparent PNG
   - Step 7: Update product image_url
   - Step 8: Check if product is marked as "special"
   - Step 9a: If special → Generate AI splash image
   - Step 9b: If not special → Add to colorful card layout
   - Step 10: Save splash_image_url (if generated)

5. Backend API Endpoints:
   - POST /api/images/search - Search Google for product image
   - POST /api/images/remove-background - Remove background from image
   - POST /api/images/process - Complete workflow (search + remove background)
   - POST /api/images/ai/splash-image - Generate AI splash image (NEW)
   - GET /api/images/ai/splash-image/:productId - Get splash image (NEW)
   - POST /api/products/:id/process-image - Process product image (auto workflow)

6. Google Custom Search API:
   - Set up Google Custom Search API
   - Search for product images using product name + brand
   - Filter results by size and quality
   - Download best match
   - Save to /public/products/

7. Remove.bg API:
   - Already in dependencies (remove.bg package)
   - Remove background from image
   - Save transparent PNG
   - Update product image_url

8. AI Image Generation (OpenAI DALL-E or similar):
   - Generate splash image from product image
   - Add branded effects
   - Add promotional text
   - Add gradients and effects
   - Save as splash_image_url

9. UI for Image Processing:
   - Admin page for image processing (/admin/images)
   - List products without images
   - List products with images needing processing
   - "Process Image" button for each product
   - "Generate Splash Image" button for special products
   - Progress indicator during processing
   - Preview before/after images
   - Bulk process images

10. Automatic Processing:
    - When product created via PO invoice → Auto-process image
    - When product updated → Auto-process image if needed
    - When product marked as "special" → Auto-generate splash image
    - Background job for bulk processing

The app is at: /Users/ernestoponce/dev/azteka-dsd
Backend API: /api/products/*, /api/images/*
Remove.bg: Already in package.json
AI Services: OpenAI API (for image generation)

CRITICAL REQUIREMENTS:
1. MUST auto-search Google for images when product has no image
2. MUST remove background from all product images
3. MUST generate AI splash images for special products
4. MUST save transparent PNGs
5. MUST save splash images
6. MUST update product image_url and splash_image_url
7. MUST have admin UI for image processing
8. MUST have bulk processing capability
9. MUST preserve all existing functionality

Create:
1. Auto image search endpoint
2. Background removal endpoint
3. AI splash image generation endpoint
4. Image processing workflow
5. Product image update logic
6. Admin UI for image processing
7. Bulk processing functionality
8. Automatic processing triggers

Make it automatic - when product is created, auto-find, process, and generate splash images if special!
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
- ✅ Inventory tracking working (from receiving flow)

What I need:
1. AI Automated PO Suggestions:
   - Monitor inventory levels daily (cron job)
   - Detect low stock products
   - Analyze sales trends
   - Consider vendor advantages (pricing, delivery time, quality)
   - Generate PO suggestions automatically
   - Send notifications to admin

2. Inventory Monitoring:
   - Check stock levels daily (automated cron job)
   - Identify products below reorder point
   - Calculate reorder quantities based on:
     - Sales velocity (units sold per day/week)
     - Lead times (vendor delivery time)
     - Safety stock (buffer for demand spikes)
     - Minimum order quantities
   - Consider seasonal trends
   - Consider historical sales data

3. Vendor Analysis:
   - Compare vendor pricing for same products
   - Compare delivery times
   - Compare product quality
   - Consider vendor relationships
   - Consider payment terms
   - Recommend best vendor for each product

4. AI PO Generation:
   - Use OpenAI API for analysis
   - Generate PO suggestions with reasoning
   - Include vendor recommendations
   - Include quantity recommendations
   - Include cost estimates
   - Include delivery time estimates
   - Include total PO value

5. Automation:
   - Run daily at scheduled time (cron job)
   - Generate PO suggestions automatically
   - Send email/SMS to admin
   - Create PO drafts ready for approval
   - Track suggestion history

6. Backend API Endpoints:
   - POST /api/automation/po-suggestions - Generate PO suggestions
   - GET /api/automation/po-suggestions - Get pending suggestions
   - POST /api/automation/po-suggestions/:id/approve - Approve suggestion
   - POST /api/automation/po-suggestions/:id/reject - Reject suggestion
   - POST /api/automation/po-suggestions/generate - Manual trigger
   - GET /api/automation/po-suggestions/history - Get suggestion history

7. Database:
   - Create po_suggestions table:
     - id, product_id, vendor_id, suggested_quantity, suggested_cost
     - reasoning (AI-generated explanation)
     - status (pending, approved, rejected)
     - created_at, approved_at, rejected_at
   - Create vendor_comparison table:
     - product_id, vendor_id, price, delivery_time, quality_score
     - last_updated

8. AI Analysis Logic:
   - Analyze sales history for each product
   - Calculate sales velocity
   - Predict future demand
   - Compare vendor options
   - Generate reasoning for each suggestion
   - Prioritize suggestions by urgency

9. UI for PO Suggestions:
   - Admin page for PO suggestions (/admin/po-suggestions)
   - List all pending suggestions
   - Show AI reasoning for each suggestion
   - Show vendor comparison
   - Approve/Reject buttons
   - Bulk approve/reject
   - Create PO from suggestion
   - View suggestion history

10. Notifications:
    - Email admin when suggestions generated
    - SMS notification (optional)
    - In-app notification
    - Dashboard alert

The app is at: /Users/ernestoponce/dev/azteka-dsd
Backend API: /api/po/*, /api/ai/*, /api/automation/*
Automation: src/api/automation/route.js
OpenAI: Already configured

CRITICAL REQUIREMENTS:
1. MUST monitor inventory daily
2. MUST detect low stock products
3. MUST analyze sales trends
4. MUST compare vendors
5. MUST generate AI suggestions with reasoning
6. MUST send notifications
7. MUST create PO drafts
8. MUST have admin UI for managing suggestions
9. MUST track suggestion history
10. MUST preserve all existing functionality

Create:
1. Daily inventory monitoring (cron job)
2. AI PO suggestion generation
3. Vendor analysis logic
4. Automated notifications
5. PO draft creation
6. Admin UI for suggestions
7. Suggestion history tracking
8. Database tables (po_suggestions, vendor_comparison)

Make it fully automated - AI suggests POs daily based on inventory, sales trends, and vendor data!
```

---

## ✅ PROMPT 6: QuickBooks API Integration

```
I want to integrate QuickBooks API to upload inventory and customer lists.

Current state:
- ✅ PostgreSQL database with products and customers
- ✅ Manual product/customer entry
- ✅ Admin pages for managing products and customers
- ✅ Products can be created via PO invoice upload

What I need:
1. QuickBooks API Integration:
   - Connect to QuickBooks API
   - Authenticate with OAuth 2.0
   - Fetch inventory items
   - Fetch customer list
   - Sync to PostgreSQL database

2. OAuth 2.0 Flow:
   - Register app with QuickBooks
   - Get Client ID and Client Secret
   - Set up OAuth redirect URI
   - Configure scopes (accounting, inventory, customers)
   - Handle OAuth callback
   - Store access token and refresh token
   - Refresh token when expired

3. Inventory Sync:
   - Fetch items from QuickBooks
   - Map QuickBooks fields to our schema:
     - QuickBooks Item → Product (name, sku, price, description)
     - QuickBooks Quantity → Stock level
     - QuickBooks Cost → Product cost
     - QuickBooks Category → Category
   - Create/update products in database
   - Handle duplicates (match by SKU)
   - Preserve existing data
   - Skip products already in database (optional)

4. Customer Sync:
   - Fetch customers from QuickBooks
   - Map QuickBooks fields to our schema:
     - QuickBooks Customer → Customer (business_name, contact_name, email, phone, address)
     - QuickBooks Billing Address → Address fields
     - QuickBooks Shipping Address → Address fields
   - Create/update customers in database
   - Handle duplicates (match by email or business name)
   - Preserve existing data
   - Skip customers already in database (optional)

5. Sync Workflow:
   - Step 1: Connect to QuickBooks (OAuth)
   - Step 2: Fetch inventory items
   - Step 3: Map and transform data
   - Step 4: Create/update products
   - Step 5: Fetch customers
   - Step 6: Map and transform data
   - Step 7: Create/update customers
   - Step 8: Show sync results

6. UI for Sync:
   - Admin page for QuickBooks sync (/admin/quickbooks)
   - Connect button (OAuth flow)
   - Sync Inventory button
   - Sync Customers button
   - Sync All button
   - Progress indicator during sync
   - Results display:
     - Products synced (new, updated, skipped)
     - Customers synced (new, updated, skipped)
     - Errors (if any)
   - Sync history
   - Last sync timestamp

7. Backend API Endpoints:
   - GET /api/qb/auth - Start OAuth flow
   - GET /api/qb/callback - OAuth callback
   - POST /api/qb/sync/inventory - Sync inventory
   - POST /api/qb/sync/customers - Sync customers
   - POST /api/qb/sync/all - Sync both
   - GET /api/qb/sync/status - Get sync status
   - GET /api/qb/sync/history - Get sync history
   - POST /api/qb/disconnect - Disconnect QuickBooks

8. Data Mapping:
   - QuickBooks Item fields:
     - Name → product.name
     - SKU → product.sku
     - SalesPrice → product.price
     - PurchaseCost → product.cost
     - QtyOnHand → product.stock
     - Description → product.description
     - Category → product.category_id
   - QuickBooks Customer fields:
     - DisplayName → customer.business_name
     - PrimaryEmailAddr → customer.email
     - PrimaryPhone → customer.phone
     - BillAddr → customer.address, city, state, zip_code
     - ShipAddr → customer.shipping_address

9. Error Handling:
   - Handle OAuth errors
   - Handle API rate limits
   - Handle network errors
   - Handle data mapping errors
   - Log errors for debugging
   - Show user-friendly error messages

10. Security:
    - Store OAuth tokens securely (encrypted)
    - Refresh tokens automatically
    - Validate OAuth state parameter
    - Secure API endpoints
    - Audit log sync operations

The app is at: /Users/ernestoponce/dev/azteka-dsd
Backend API: /api/qb/*
QuickBooks API: https://developer.intuit.com/

CRITICAL REQUIREMENTS:
1. MUST connect to QuickBooks via OAuth 2.0
2. MUST sync inventory items
3. MUST sync customers
4. MUST handle duplicates correctly
5. MUST preserve existing data
6. MUST have admin UI for sync
7. MUST show sync results
8. MUST handle errors gracefully
9. MUST secure OAuth tokens
10. MUST preserve all existing functionality

Create:
1. QuickBooks OAuth integration
2. Inventory sync endpoint
3. Customer sync endpoint
4. Sync UI page
5. Data mapping logic
6. Duplicate handling
7. Error handling
8. Security measures

Make it easy to sync inventory and customers from QuickBooks!
```

---

## ✅ PROMPT 7: End-to-End Testing

```
I want to set up comprehensive end-to-end testing for the complete Azteka DSD system.

Current state:
- ✅ Complete app with all features
- ✅ UI polished with Bolt design
- ✅ PO receiving flow working
- ✅ Image processing ready
- ✅ AI automation ready
- ✅ QuickBooks integration ready

What I need:
1. Test All Features:
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

2. Test All Workflows:
   - Complete order flow (catalog → cart → checkout → order)
   - Complete PO flow (upload → parse → receive → inventory)
   - Complete receiving flow (PO → receive → inventory → catalog)
   - Complete image processing flow (product → search → remove background → splash image)
   - Complete sync flow (QuickBooks → database → catalog)
   - Complete AI PO suggestion flow (monitor → analyze → suggest → approve)

3. Test All Integrations:
   - API endpoints
   - Database operations
   - External APIs (QuickBooks, Remove.bg, Google Search)
   - AI services (OpenAI)
   - Image processing (Remove.bg, AI generation)

4. Test All UI Components:
   - All pages load correctly
   - All components render
   - All animations work
   - All forms submit
   - All navigation works
   - All buttons work
   - All modals work
   - All dropdowns work

5. Test Data Flow:
   - Products flow from PO → inventory → catalog
   - Orders flow from sales → fulfillment
   - Inventory updates sync across system
   - Images process correctly
   - AI suggestions generate correctly

6. Testing Framework:
   - Use Playwright (recommended) or Cypress
   - Set up test suite
   - Create test files for each feature
   - Create test files for each workflow
   - Run tests automatically
   - Generate test reports

7. Test Scenarios:
   - Happy path scenarios
   - Error scenarios
   - Edge cases
   - Performance tests
   - Load tests
   - Security tests

8. Test Coverage:
   - Unit tests for components
   - Integration tests for APIs
   - E2E tests for workflows
   - Visual regression tests
   - Accessibility tests

9. CI/CD Integration:
   - Run tests on every commit
   - Run tests before deployment
   - Generate test reports
   - Block deployment on test failures

10. Test Documentation:
    - Document test scenarios
    - Document test data
    - Document test environment
    - Document test results

The app is at: /Users/ernestoponce/dev/azteka-dsd
Testing: Use Playwright (recommended) or Cypress

CRITICAL REQUIREMENTS:
1. MUST test all features
2. MUST test all workflows
3. MUST test all integrations
4. MUST test all UI components
5. MUST test data flow
6. MUST have automated tests
7. MUST generate test reports
8. MUST integrate with CI/CD
9. MUST preserve all existing functionality

Create:
1. Test suite setup (Playwright or Cypress)
2. Test all features
3. Test all workflows
4. Test all integrations
5. Test all UI components
6. Test data flow
7. CI/CD integration
8. Test documentation

Make comprehensive end-to-end tests that verify everything works!
```

---

## 📋 Usage Order

1. **PROMPT 4:** Auto Image Search + Background Remover + AI Splash Images (2-3 hours)
2. **PROMPT 5:** AI Automation + PO Suggestions (3-4 hours)
3. **PROMPT 6:** QuickBooks API Integration (4-5 hours)
4. **PROMPT 7:** End-to-End Testing (4-6 hours)

---

## ✅ What Each Prompt Does

### PROMPT 4: Image Processing
- Auto-search Google for product images
- Remove background from images
- Generate AI splash images for special products
- Complete image processing workflow
- Admin UI for image management

### PROMPT 5: AI Automation
- Daily inventory monitoring
- AI PO suggestion generation
- Vendor analysis
- Automated notifications
- PO draft creation

### PROMPT 6: QuickBooks Integration
- OAuth connection
- Inventory sync
- Customer sync
- Data mapping
- Sync UI

### PROMPT 7: Testing
- Test all features
- Test all workflows
- Test all integrations
- Automated test suite
- CI/CD integration

---

**All prompts are ready to copy-paste! Continue with PROMPT 4!**

