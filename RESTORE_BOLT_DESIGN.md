# 🎨 Restore Original Bolt Design - Colors & Featured Products

## 🚀 PROMPT: Restore Colors & Featured Products Section

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

Fix:
1. Ensure products have vibrant background_color values
2. Ensure ProductBillboard displays correctly
3. Ensure ProductCard uses background_color for gradients
4. Ensure Featured Products section appears before "All Products"

Restore the original Bolt design with vibrant colors and Featured Products section!
```

---

## 🚀 PROMPT: Admin Dashboard for Managing Products & Sections

```
I need a comprehensive admin dashboard UI to manage products, grids, sections, and keep design consistent.

What I need:
1. Admin Dashboard Page (/admin/design):
   - Manage product display settings
   - Manage section visibility (Hero, Featured Products, Special Offers, Bundles, All Products)
   - Manage grid layouts
   - Manage product colors (background_color)
   - Manage featured products
   - Preview changes in real-time

2. Product Management:
   - Edit product background_color (color picker)
   - Set featured status (toggle)
   - Set product display order
   - Set product visibility
   - Bulk edit products

3. Section Management:
   - Toggle sections on/off:
     - Hero section
     - Featured Products section
     - Special Offers section
     - Bundle Showcase section
     - All Products section
   - Reorder sections (drag and drop)
   - Edit section titles and subtitles

4. Grid Management:
   - Set grid columns (1, 2, 3, 4 columns)
   - Set product card size
   - Set spacing between cards
   - Preview grid layout

5. Design Consistency:
   - Color palette manager
   - Gradient presets
   - Typography settings
   - Shadow settings
   - Border radius settings
   - Apply to all products/sections

6. Real-time Preview:
   - Preview changes before saving
   - See how products look with new colors
   - See how sections look when reordered
   - See how grid looks with new settings

7. Save & Apply:
   - Save design settings to database
   - Apply to all products
   - Apply to all sections
   - Revert to defaults

The app is at: /Users/ernestoponce/dev/azteka-dsd
Admin pages are at: src/pages/
Backend API: /api/admin/design/*

Create:
1. Admin design dashboard page (/admin/design)
2. Product color editor
3. Section manager
4. Grid layout manager
5. Design consistency tools
6. Real-time preview
7. Save/apply functionality

Make it easy to manage products, sections, grids, and keep design consistent!
```

---

## 🚀 PROMPT: Check Bolt.new Connection

```
I need to check if my app is connected to bolt.new and understand how changes are reflected.

What I need:
1. Check for bolt.new connection:
   - Look for bolt.new API calls
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
2. Check environment variables
3. Check API calls
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

## 📋 Usage Order

1. **First:** Check bolt.new connection (PROMPT 3)
2. **Second:** Restore colors & Featured Products (PROMPT 1)
3. **Third:** Build admin dashboard (PROMPT 2)

---

**Copy these prompts into VS Code Claude chat in order!**

