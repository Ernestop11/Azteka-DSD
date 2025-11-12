# 🎨 Updated Admin Dashboard Prompt - With AI Splash Images & Family Specials

## 🚀 PROMPT 3: Build Admin Dashboard (UPDATED)

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

14. Image Processing Workflow (NEW):
    - When product image is found and background removed:
      - Check if product is marked as "special"
      - If special: Generate AI splash image
      - If not special: Add to colorful card layout
    - AI splash image generation:
      - Use product image (background removed) as base
      - Add branded effects
      - Add promotional text
      - Add gradients and effects
      - Save as splash_image_url
    - Use splash image in:
      - Featured Products section
      - Special showcases
      - Family special banners

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

## 🎨 New Features Added

### ✅ AI Splash Image Generation
- Auto-generate splash images for special products
- Use background-removed product image as base
- Add cool effects, gradients, text overlays
- Preview before saving
- Use in Featured Products section

### ✅ Family Specials / Branded Showcase Banners
- Create branded banners (like Molienda)
- Banner builder with tools
- AI automated banner generation
- Post to catalog page
- Manage banners (edit, toggle, delete, reorder)

### ✅ Image Processing Workflow
- When image found and background removed:
  - If special: Generate AI splash image
  - If not special: Add to colorful card layout

---

**Copy this updated PROMPT 3 into VS Code Claude chat!**

