# 🎨 All Design Prompts - Complete Set

## 📋 Overview

All prompts to restore Bolt design, build admin dashboard, and check bolt.new connection.

---

## ✅ PROMPT 1: Check Bolt.new Connection

```
I need to check if my app is connected to bolt.new and understand how changes are reflected.

What I need:
1. Check for bolt.new connection:
   - Look for bolt.new API calls in codebase
   - Look for bolt.new webhooks
   - Look for bolt.new configuration
   - Check environment variables for bolt.new
   - Check if changes sync to bolt.new

2. Understand the connection:
   - How does bolt.new sync work?
   - What changes are reflected in bolt.new?
   - Is it one-way or two-way sync?
   - Is it safe to make changes?

3. If connected:
   - Document the connection
   - Understand what syncs
   - Ensure changes don't break bolt.new
   - Ensure design consistency

4. If not connected:
   - Confirm it's safe to make changes
   - No bolt.new sync needed

The app is at: /Users/ernestoponce/dev/azteka-dsd

Check:
1. Search codebase for "bolt" or "bolt.new"
2. Check environment variables (.env files)
3. Check API calls (fetch, axios, etc.)
4. Check webhooks
5. Check configuration files

Report:
1. Is there a bolt.new connection?
2. How does it work?
3. Is it safe to make changes?
4. What should I be aware of?

Check for bolt.new connection and document findings!
```

---

## ✅ PROMPT 2: Restore Colors & Featured Products

```
URGENT: I need to restore the original Bolt design with vibrant colors and Featured Products section.

Current problems:
1. ❌ Product cards lost their vibrant gradient backgrounds (orange/peach, red/pink, green)
2. ❌ Cards are now white instead of colorful gradients
3. ❌ "Featured Products" section is missing or not displaying
4. ❌ Design lost the original Bolt color scheme

What I need:
1. Restore vibrant gradient backgrounds on product cards:
   - Orange/peach gradients (like Jarritos Tamarindo)
   - Red/pink gradients (like Coca-Cola Mexicana)
   - Green gradients (like Jarritos Lime)
   - Each product should have a unique, vibrant background_color

2. Restore "Featured Products" section:
   - Large featured product card on left (with gradient background)
   - Two smaller featured cards on right (stacked vertically)
   - Yellow "FEATURED" badge with trending up icon
   - Star icon in section header
   - "Hand-picked selections just for you" subtitle

3. Ensure ProductBillboard component displays:
   - Shows featured products (products with featured=true)
   - Large featured card with gradient background
   - Smaller cards with gradient backgrounds
   - All with vibrant colors

4. Ensure ProductCard component uses background_color:
   - Each product must have a vibrant background_color
   - Gradient backgrounds (linear-gradient with product.background_color)
   - Not white backgrounds
   - Colors should be vibrant (orange, red, green, blue, purple, etc.)

5. Check App.tsx:
   - Ensure ProductBillboard is displayed
   - Ensure it shows featured products
   - Ensure it's in the correct order (after Hero, before All Products)

6. Check database/products:
   - Ensure products have background_color set (not default gray)
   - Set vibrant colors for all products
   - Set featured=true for some products

The app is at: /Users/ernestoponce/dev/azteka-dsd
Components are at: src/components/
App.tsx is at: src/App.tsx

CRITICAL REQUIREMENTS:
1. MUST restore vibrant gradient backgrounds on all product cards
2. MUST restore "Featured Products" section (ProductBillboard)
3. MUST ensure products have background_color set (not default gray)
4. MUST ensure ProductBillboard displays featured products
5. MUST ensure colors are vibrant (orange, red, green, blue, purple, etc.)
6. MUST preserve all functionality

Check:
1. Are products getting background_color from API?
2. Is ProductBillboard component being rendered?
3. Are featured products being filtered correctly?
4. Are gradient backgrounds being applied correctly?
5. Are products in database missing background_color?

Fix:
1. Ensure products have vibrant background_color values
2. Ensure ProductBillboard displays correctly
3. Ensure ProductCard uses background_color for gradients
4. Ensure Featured Products section appears before "All Products"
5. Update products in database with vibrant colors if needed

Restore the original Bolt design with vibrant colors and Featured Products section!
```

---

## ✅ PROMPT 3: Build Admin Dashboard (UPDATED - With AI Splash Images & Family Specials)

```
I need a comprehensive admin dashboard UI to manage products, grids, sections, colors, AI splash images, family specials, and keep design consistent throughout the app.

What I need:
1. Admin Design Dashboard Page (/admin/design):
   - Beautiful UI matching Bolt design
   - Manage product display settings
   - Manage section visibility and order
   - Manage grid layouts
   - Manage product colors (background_color)
   - Manage featured products
   - Manage AI splash images for special products
   - Manage family specials / branded showcase banners
   - Preview changes in real-time

2. Product Management Section:
   - List all products with preview cards
   - Edit product background_color (color picker with presets: orange, red, green, blue, purple, etc.)
   - Set featured status (toggle switch)
   - Set special status (toggle switch - triggers AI splash image generation)
   - Set product display order (drag and drop)
   - Set product visibility (show/hide)
   - Bulk edit products (select multiple, apply changes)
   - Search and filter products

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
   - Save splash image to product
   - Use splash image in Featured Products section or special showcases
   - Image processing workflow:
     - When image found and background removed:
       - If special: Generate AI splash image
       - If not special: Add to colorful card layout

4. Family Specials / Branded Showcase Banners (NEW):
   - Create branded showcase banners (like Molienda brand)
   - Banner builder with tools:
     - Select brand/family (e.g., Molienda)
     - Choose banner style (horizontal, vertical, full-width)
     - Add brand logo
     - Add brand colors
     - Add promotional text
     - Add product images
     - Add call-to-action button
     - Preview banner
   - AI automated banner generation:
     - Select brand/family
     - AI suggests banner design based on brand
     - AI adds products from brand
     - AI generates promotional text
     - Preview and approve
   - Post banner to catalog page:
     - Choose placement (top, middle, bottom)
     - Choose section (Hero, Featured, Special Offers, etc.)
     - Schedule banner (show dates, auto-hide)
     - Preview on catalog page
   - Manage banners:
     - List all banners
     - Edit banners
     - Toggle banners on/off
     - Delete banners
     - Reorder banners

5. Section Management Section:
   - Toggle sections on/off:
     - Hero section (on/off toggle)
     - Featured Products section (on/off toggle)
     - Special Offers section (on/off toggle)
     - Family Specials / Branded Banners section (NEW - on/off toggle)
     - Bundle Showcase section (on/off toggle)
     - All Products section (on/off toggle)
   - Reorder sections (drag and drop)
   - Edit section titles and subtitles
   - Edit section settings (colors, spacing, etc.)

6. Grid Management Section:
   - Set grid columns (1, 2, 3, 4 columns) with preview
   - Set product card size (small, medium, large)
   - Set spacing between cards (tight, normal, loose)
   - Preview grid layout in real-time
   - Apply to all products or specific categories

7. Color Management Section:
   - Color palette manager (preset colors: orange, red, green, blue, purple, etc.)
   - Gradient presets (orange/peach, red/pink, green, blue, purple, etc.)
   - Apply color to product (individual or bulk)
   - Apply gradient to product
   - Preview color on product card
   - Save color presets

8. Featured Products Management:
   - List all products
   - Toggle featured status
   - Set featured order (which product shows first)
   - Preview featured products section
   - Set how many featured products to show

9. Special Products Management (NEW):
   - List all products
   - Toggle special status
   - When marked as special:
     - Auto-trigger AI splash image generation
     - Show in special showcases
     - Use splash image instead of regular product card
   - Preview special products section
   - Set how many special products to show

10. Design Consistency Tools:
    - Typography settings (font sizes, weights)
    - Shadow settings (shadow-lg, shadow-2xl, etc.)
    - Border radius settings (rounded-2xl, rounded-3xl, etc.)
    - Spacing settings (p-6, gap-4, etc.)
    - Apply to all products/sections
    - Reset to defaults

11. Real-time Preview:
    - Preview changes before saving
    - See how products look with new colors
    - See how sections look when reordered
    - See how grid looks with new settings
    - See how splash images look
    - See how family special banners look
    - Side-by-side comparison (before/after)

12. Save & Apply:
    - Save design settings to database
    - Apply to all products
    - Apply to all sections
    - Revert to defaults
    - Export/import design settings

13. Backend API Endpoints:
    - GET /api/admin/design/settings - Get design settings
    - POST /api/admin/design/settings - Save design settings
    - GET /api/admin/design/products - Get products for editing
    - PUT /api/admin/design/products/:id - Update product design
    - POST /api/admin/design/products/bulk - Bulk update products
    - GET /api/admin/design/sections - Get section settings
    - PUT /api/admin/design/sections - Update section settings
    - GET /api/admin/design/preview - Get preview data
    - POST /api/admin/design/ai/splash-image - Generate AI splash image (NEW)
    - GET /api/admin/design/banners - Get all banners (NEW)
    - POST /api/admin/design/banners - Create banner (NEW)
    - PUT /api/admin/design/banners/:id - Update banner (NEW)
    - DELETE /api/admin/design/banners/:id - Delete banner (NEW)
    - POST /api/admin/design/banners/:id/ai-generate - AI generate banner (NEW)
    - POST /api/admin/design/banners/:id/post-to-catalog - Post banner to catalog (NEW)

The app is at: /Users/ernestoponce/dev/azteka-dsd
Admin pages are at: src/pages/
Backend API: /api/admin/design/*
AI Services: OpenAI API (for image generation)

CRITICAL REQUIREMENTS:
1. MUST match Bolt design (beautiful UI, gradients, animations)
2. MUST be easy to use (intuitive interface)
3. MUST have real-time preview
4. MUST save to database
5. MUST preserve all functionality
6. MUST allow bulk operations
7. MUST have color picker with presets
8. MUST have drag and drop for ordering
9. MUST have AI splash image generation for special products
10. MUST have family specials / branded showcase banners
11. MUST have banner builder with tools
12. MUST have AI automated banner generation
13. MUST allow posting banners to catalog page

Create:
1. Admin design dashboard page (/admin/design)
2. Product management UI
3. Section management UI
4. Grid layout manager
5. Color management UI
6. Featured products manager
7. Special products manager (NEW)
8. AI splash image generator (NEW)
9. Family specials / branded banner builder (NEW)
10. AI automated banner generator (NEW)
11. Banner management UI (NEW)
12. Post to catalog functionality (NEW)
13. Design consistency tools
14. Real-time preview component
15. Save/apply functionality
16. Backend API endpoints

Make it a comprehensive, beautiful admin dashboard for managing the entire app design with AI splash images and family specials!
```

---

## 📋 Usage Order

1. **PROMPT 1:** Check bolt.new connection (5 minutes)
2. **PROMPT 2:** Restore colors & Featured Products (30 minutes)
3. **PROMPT 3:** Build admin dashboard (2-3 hours)

---

## ✅ What Each Prompt Does

### PROMPT 1: Check Bolt.new
- Searches for bolt.new connection
- Documents findings
- Confirms if safe to make changes

### PROMPT 2: Restore Design
- Restores vibrant colors on product cards
- Restores Featured Products section
- Ensures ProductBillboard displays correctly
- Updates products with vibrant colors

### PROMPT 3: Admin Dashboard
- Builds comprehensive admin UI
- Manages products, sections, grids, colors
- Real-time preview
- Saves to database

---

**Copy these prompts into VS Code Claude chat in order!**

