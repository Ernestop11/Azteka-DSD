# Admin Menu Editor Workflow

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Purpose**: Document the complete workflow for adding, editing, and managing products in the admin menu editor

---

## Overview

This document describes the step-by-step workflow admins follow when working with products in the menu editor, from initial creation to publishing live changes.

**Target Users**:
- SUPER_ADMIN: Full access to all workflow steps
- ADMIN: Product management and catalog curation
- SALES_REP: Limited to viewing and basic edits (price overrides only)

---

## 1. Workflow Steps

### Step 1: Begin → Navigate to Product Management

**Admin Action**: Log in and navigate to the admin dashboard

**UI Flow**:
```
Login Page
  ↓
Admin Dashboard
  ↓
Sidebar: Click "Products" or "Menu Editor"
  ↓
Product List Page
```

**What Admin Sees**:
- Table of all products with columns:
  - Thumbnail image
  - Product name
  - SKU
  - Category
  - Price (per case)
  - Status (Active/Inactive)
  - Last updated
  - Actions (Edit, Duplicate, Delete)

**Filters Available**:
- Search by name/SKU
- Filter by category
- Filter by brand
- Filter by status (Active/Inactive)
- Sort by: Name, Price, Date Added, Last Updated

---

### Step 2: Select → Choose Action

**Options**:

#### Option A: Add New Product
```
Click "Add New Product" button
  ↓
Empty editor drawer slides in from right
  ↓
Form fields ready for input
```

#### Option B: Edit Existing Product
```
Click "Edit" icon on product row
  ↓
Editor drawer slides in with pre-filled data
  ↓
All fields populated from database
```

#### Option C: Duplicate Product
```
Click "Duplicate" icon on product row
  ↓
Editor drawer slides in with copied data
  ↓
Name appended with " (Copy)"
  ↓
New SKU must be entered
```

---

### Step 3: Edit → Fill in Product Details

The editor is organized into collapsible sections for easy navigation.

#### Section 1: Core Information *(Always Expanded)*

**Fields**:
- **Product Name** (required)
  - Input: Text field, max 200 chars
  - Example: "Coca-Cola 12oz Cans - 24 Pack"
  - Validation: Must be unique within category

- **SKU** (required)
  - Input: Text field, uppercase auto-transform
  - Example: "COKE-12OZ-24"
  - Validation: Must be globally unique
  - System checks for duplicates on blur

- **Description** (optional)
  - Input: Rich text editor (basic formatting)
  - Max: 1000 characters
  - Example: "Classic Coca-Cola in convenient 12oz cans, perfect for individual serving."

- **Active Status** (required)
  - Input: Toggle switch
  - Default: Active
  - Note: Inactive products hidden from customer catalog

---

#### Section 2: Pricing & Commerce

**Fields**:
- **Price per Case** (required)
  - Input: Number field with $ prefix
  - Example: $24.99
  - Validation: Must be > 0, max 2 decimals

- **Units per Case** (required)
  - Input: Number field
  - Example: 24
  - Validation: Must be integer > 0
  - Display: Auto-calculates unit price below

- **Unit Type** (required)
  - Input: Dropdown
  - Options: "unit", "can", "bottle", "pack", "box", "bag", "piece"
  - Default: "unit"

- **Minimum Order Quantity** (optional)
  - Input: Number field
  - Example: 2 (means customer must buy at least 2 cases)
  - Default: 1

- **MSRP** (optional)
  - Input: Number field
  - Example: $29.99
  - Purpose: Show "savings" vs retail price

**Auto-Calculated Display**:
```
Price per unit: $24.99 ÷ 24 = $1.04 per can
Savings vs MSRP: $29.99 - $24.99 = $5.00 (17% off)
```

---

#### Section 3: Categorization

**Fields**:
- **Category** (required)
  - Input: Searchable dropdown
  - Options: All active categories from database
  - Example: "Beverages → Sodas"
  - Note: Selecting category auto-suggests relevant brands

- **Brand** (required)
  - Input: Searchable dropdown
  - Options: All active brands, filtered by category if relevant
  - Example: "Coca-Cola"
  - Add New: Quick-add button opens mini-modal for new brand

- **Tags** (optional)
  - Input: Multi-select chips
  - Options: Pre-defined tags + custom tags
  - Examples: "bestseller", "seasonal", "new-arrival", "on-sale"
  - Purpose: Used for smart search and filtering

---

#### Section 4: Inventory Settings

**Fields**:
- **Track Inventory** (toggle)
  - Default: ON
  - If OFF: Product always shows as "in stock"

- **Current Stock** (if tracking enabled)
  - Input: Number field
  - Example: 150 (cases)
  - Updates: Manual or via warehouse system integration

- **Low Stock Alert** (if tracking enabled)
  - Input: Number field
  - Example: 20
  - System sends alert when stock drops below this level

- **Supplier Info** (optional)
  - Input: Text field
  - Example: "Coca-Cola Bottling Co - Route 42"
  - Purpose: Internal reference for reordering

---

#### Section 5: Visual Design ⭐ *(Key Section)*

This section controls the product card appearance in the customer catalog.

**Sub-Section A: Preset Selection**

**Visual Preset Browser**:
```
[Fiesta] [Candy] [Beverage] [Premium] [Holiday]
  ↓ Selected: Beverage

Grid of preset thumbnails:
┌─────────┬─────────┬─────────┐
│ Cola    │ Orange  │ Electric│
│ Classic │ Crush   │ Blue    │
└─────────┴─────────┴─────────┘
```

**Interaction**:
1. Admin clicks preset thumbnail
2. Preview updates in real-time
3. Gradient colors auto-populate
4. Badge/theme auto-applied

**Sub-Section B: Custom Gradient** *(Advanced)*

If admin wants custom colors instead of preset:

**Fields**:
- **Gradient Start Color**
  - Input: Color picker + hex input
  - Example: #FF6B35
  - Preview: Live gradient swatch updates

- **Gradient End Color**
  - Input: Color picker + hex input
  - Example: #F7931E

- **Gradient Direction**
  - Input: Radio buttons
  - Options: "to-br" (bottom-right), "to-r" (right), "to-b" (bottom)
  - Default: "to-br"

**Sub-Section C: Card Theme**

**Card Theme Selector**:
- Input: Radio buttons with visual previews
- Options:
  - **Default**: Standard rounded card
  - **Elevated**: Shadow + hover scale
  - **Flat**: Minimal border
  - **Outlined**: Bold border
  - **Glass**: Backdrop blur effect
  - **Neon**: Glow effect

**Sub-Section D: Badge Configuration**

**Fields**:
- **Badge Text** (optional)
  - Input: Text field, max 20 chars
  - Examples: "NEW", "SALE", "HOT", "Best Value"

- **Badge Color**
  - Input: Color selector (predefined options)
  - Options: red, orange, yellow, green, blue, purple, pink

- **Badge Position**
  - Input: Radio buttons
  - Options: "top-left", "top-right", "bottom-left", "bottom-right"
  - Default: "top-right"

---

#### Section 6: Media & Images

**Primary Image** (required):

**Upload Flow**:
```
1. Admin clicks "Upload Image" or drags file
2. File validation:
   - Format: PNG, JPG, WEBP
   - Max size: 5MB
   - Recommended: 800x800px
3. Image preview appears
4. Crop/resize tool (if needed)
5. Auto-optimization on save
```

**Image Guidelines** (shown in helper text):
- ✅ Use transparent PNGs for best results
- ✅ Center product in frame
- ✅ High contrast against gradient background
- ✅ Square aspect ratio (1:1)
- ❌ Avoid busy backgrounds
- ❌ Don't include text overlays (use badge instead)

**Additional Images** (optional):
- Up to 4 additional images
- Same upload process
- Used in product detail view (future feature)
- Sortable by drag-and-drop

**Image Management**:
```
Primary Image: [thumbnail] [Replace] [Delete]
Additional Images:
  Image 2: [thumbnail] [Move Up] [Move Down] [Delete]
  Image 3: [thumbnail] [Move Up] [Move Down] [Delete]

[+ Add More Images]
```

---

#### Section 7: Advanced Options *(Collapsed by Default)*

**Fields**:

- **SEO Slug** (auto-generated, editable)
  - Auto-generated from product name
  - Example: "coca-cola-12oz-cans-24-pack"
  - Used in URL: `/products/coca-cola-12oz-cans-24-pack`

- **Meta Description** (optional)
  - For SEO/search
  - Max 160 characters

- **Featured Product** (toggle)
  - If ON: Product appears in featured sections
  - Limit: Max 12 featured products per category

- **Bundle Eligible** (toggle)
  - If ON: Can be included in bundle deals
  - Default: ON

- **Seasonal Override** (optional)
  - Input: Date range picker
  - Purpose: Auto-apply holiday overlay during specific dates
  - Example: Apply "Holiday-Winter" preset from Dec 1 - Feb 28

- **Customer Price Overrides** (ADMIN+ only)
  - Link to separate modal for setting custom pricing per customer
  - Shows count: "5 customers have custom pricing"

---

### Step 4: Preview → Real-Time Product Card Preview

**Preview Panel** *(Always Visible on Right Side)*

Shows exactly how product card will appear in customer catalog:

```
┌─────────────────────────┐
│  [NEW]            Badge │ ← badgeText, badgeColor
│                         │
│   ┌─────────────┐       │
│   │   Product   │       │ ← imageUrl, centered
│   │   Image     │       │
│   └─────────────┘       │
│                         │
│  Coca-Cola 12oz Cans    │ ← name
│  24 Pack                │
│                         │
│  $24.99                 │ ← priceCase
│  per case               │ ← unit type
│                         │
│  $1.04 per can          │ ← calculated
│                         │
│  [Add to Cart]          │
└─────────────────────────┘
    ↑
  Gradient background (gradientStart → gradientEnd)
  Card theme applied (elevated, glass, etc.)
```

**Preview Features**:
- Updates in real-time as admin types
- Shows hover states
- Toggle between desktop/mobile view
- View in context: "Preview in Category Grid" button shows card among other products

---

### Step 5: Save → Validation & Confirmation

**Admin clicks "Save Product" button**

**Validation Process**:

1. **Required Field Check**:
   ```
   ✓ Product Name: filled
   ✓ SKU: filled and unique
   ✓ Price per Case: valid number > 0
   ✓ Category: selected
   ✓ Brand: selected
   ✓ Primary Image: uploaded
   ```

2. **Business Logic Validation**:
   - SKU uniqueness check (database query)
   - Image file validation (format, size)
   - Price reasonableness (not negative, not absurdly high)
   - Inventory logic (if tracking enabled, stock must be set)

3. **Error Display** (if validation fails):
   ```
   ┌──────────────────────────────────┐
   │ ⚠️ Please fix the following:     │
   │                                  │
   │ • SKU "COKE-001" already exists  │
   │ • Primary image file too large   │
   │   (max 5MB)                      │
   │                                  │
   │ [Fix Issues]                     │
   └──────────────────────────────────┘
   ```

4. **Success Flow**:
   ```
   ✓ Validation passed
     ↓
   API call: POST /api/products/manage
     ↓
   Database: INSERT product record
     ↓
   Image upload to storage
     ↓
   Response: 201 Created
     ↓
   UI: Success toast notification
     ↓
   Editor drawer closes
     ↓
   Product list refreshes with new product
   ```

**Success Notification**:
```
┌────────────────────────────────┐
│ ✓ Product saved successfully!  │
│ "Coca-Cola 12oz Cans" is now   │
│ live in the catalog.            │
│                                 │
│ [View in Catalog] [Edit Again] │
└────────────────────────────────┘
```

---

## 2. Best Practices for Admins

### Product Naming Conventions

**Good**:
- ✅ "Coca-Cola Classic 12oz Cans - 24 Pack"
- ✅ "Lay's Classic Potato Chips - 1oz - 50 Count"
- ✅ "Gatorade Lemon-Lime 20oz Bottles - 24 Pack"

**Avoid**:
- ❌ "COCA COLA" (all caps, no details)
- ❌ "Chips" (too vague)
- ❌ "Product 123" (not descriptive)

**Pattern**: `[Brand] [Product Name] [Size] [Unit Type] - [Quantity]`

---

### SKU Best Practices

**Format**: `[BRAND]-[PRODUCT]-[SIZE]-[QTY]`

**Examples**:
- `COKE-CLASSIC-12OZ-24`
- `LAYS-CLASSIC-1OZ-50`
- `GATORADE-LEMON-20OZ-24`

**Rules**:
- Use UPPERCASE
- Use hyphens as separators
- Keep under 30 characters
- Make it human-readable
- No special characters except hyphen

---

### Image Upload Guidelines

#### Ideal Image Specifications

**Format**: PNG with transparency (preferred) or JPG
**Dimensions**: 800x800 pixels (1:1 aspect ratio)
**File Size**: Under 2MB (system compresses to <500KB)
**Background**: Transparent or solid color that complements gradient
**Product Position**: Centered, taking up 60-80% of frame
**Lighting**: Even, soft shadows
**Angle**: Straight-on or slight 3/4 view

#### Image Preparation Checklist

Before uploading, admins should:
1. ✅ Remove any existing background (use transparency)
2. ✅ Ensure product is in focus and well-lit
3. ✅ Crop to square (1:1 ratio)
4. ✅ Resize to 800x800px if larger
5. ✅ Save as PNG for transparency or high-quality JPG
6. ✅ Check that product contrasts well with gradient backgrounds

#### Common Image Mistakes to Avoid

❌ **Cluttered backgrounds**: Product gets lost
❌ **Low resolution**: Appears pixelated
❌ **Off-center**: Awkward composition
❌ **Text in image**: Use badge system instead
❌ **Excessive shadows**: Looks unprofessional
❌ **Wrong aspect ratio**: Gets cropped awkwardly

---

### Visual Design Decision Guide

**Question**: What preset should I use?

**Decision Tree**:
```
Is it a beverage?
  Yes → Use "Splash" presets (Splash-01 to Splash-05)

Is it candy or sweet?
  Yes → Use "Candy" presets (Candy-01 to Candy-06)

Is it a premium/luxury item?
  Yes → Use "Premium" presets (Premium-01 to Premium-05)

Is it for a holiday/season?
  Yes → Use "Holiday" overlay (Holiday-Winter, etc.)

Is it a bold/festive product?
  Yes → Use "Fiesta" presets (Fiesta-01 to Fiesta-08)

Default → Use category-based preset or custom gradient
```

**Question**: What card theme should I use?

**Guide**:
- **Default**: Standard products, everyday items
- **Elevated**: Featured products, best sellers, premium items
- **Flat**: Budget items, bulk products
- **Glass**: Modern tech products, premium beverages
- **Neon**: Energy drinks, bold products, party items
- **Outlined**: High-contrast branding, statement products

---

### Pricing Strategy Tips

**Case Pricing**:
- Round to .99 endings for retail psychology ($24.99, not $25.00)
- Ensure profit margin covers costs + shipping
- Check competitor pricing (future AI feature)

**Unit Pricing**:
- System auto-calculates from case price
- Example: $24.99 case ÷ 24 units = $1.04/unit
- Shows value to customers

**MSRP Usage**:
- Only add if you can show genuine savings
- Example: MSRP $29.99, Your Price $24.99 = 17% savings
- Builds trust and urgency

---

### Inventory Management Tips

**Track Inventory = ON** (recommended):
- Prevents overselling
- Triggers low-stock alerts
- Integrates with warehouse system

**Track Inventory = OFF**:
- Use for made-to-order products
- Use for unlimited stock items
- Use during testing phase

**Low Stock Alert**:
- Set to 20-30% of typical order volume
- Example: If you sell 100 cases/week, set alert to 30 cases
- Gives time to reorder before stockout

---

## 3. Workflow Variations

### Bulk Import Workflow *(Future Feature)*

For adding many products at once:

```
Admin uploads CSV file
  ↓
System validates all rows
  ↓
Preview import with error highlights
  ↓
Admin fixes errors or removes problem rows
  ↓
Confirm import
  ↓
System processes batch (shows progress bar)
  ↓
Success summary: "45 products added, 3 skipped"
```

**CSV Format**:
```csv
name,sku,price_case,units_per_case,category,brand,image_url,active
"Coca-Cola 12oz - 24pk","COKE-12OZ-24",24.99,24,"Beverages","Coca-Cola","https://...",true
```

---

### Quick Edit Workflow

For minor changes without opening full editor:

```
Admin hovers over product row
  ↓
"Quick Edit" button appears
  ↓
Inline editor opens for common fields:
  - Active status toggle
  - Price adjustment
  - Stock update
  ↓
Admin makes change
  ↓
Auto-saves on blur
  ↓
Success indicator (green checkmark)
```

---

### Clone & Modify Workflow

For creating product variations:

```
Admin clicks "Duplicate" on existing product
  ↓
Editor opens with all data copied
  ↓
Admin modifies:
  - Name: "Coca-Cola 12oz - 24pk" → "Coca-Cola 20oz - 12pk"
  - SKU: "COKE-12OZ-24" → "COKE-20OZ-12"
  - Price, image, etc.
  ↓
Save as new product
  ↓
Both products now in catalog
```

**Use Case**: Creating size variations, flavor variants, seasonal versions

---

## 4. Error Handling & Recovery

### Common Errors & Solutions

#### Error: "SKU already exists"
**Cause**: Another product has the same SKU
**Solution**:
1. Check if duplicate is intentional (maybe you're editing wrong product)
2. If creating new variant, modify SKU (e.g., add -V2, -LG, -SM)
3. Use SKU checker tool to find available SKU

#### Error: "Image upload failed"
**Cause**: File too large, wrong format, or network issue
**Solution**:
1. Check file size (must be <5MB)
2. Convert to PNG or JPG if using different format
3. Try again with stable internet connection
4. Use image compression tool before upload

#### Error: "Price must be greater than 0"
**Cause**: Invalid price entry
**Solution**:
1. Enter valid dollar amount (e.g., 24.99, not -5 or 0)
2. Check for typos (comma instead of period)
3. Don't include $ symbol (system adds it)

#### Error: "Category not found"
**Cause**: Selected category was deleted by another admin
**Solution**:
1. Refresh page to get latest categories
2. Select different active category
3. Contact super admin if category was deleted in error

---

### Auto-Save & Draft Mode *(Future Feature)*

**Problem**: Admin loses work if browser crashes or accidentally closes tab

**Solution**: Auto-save drafts every 30 seconds

```
Admin fills in product details
  ↓ (30 seconds pass)
Auto-save to drafts (background save)
  ↓
If browser crashes:
  Admin returns → sees "Resume draft?" prompt
  ↓
Click "Resume" → all data restored
```

---

## 5. Keyboard Shortcuts & Power User Tips

### Keyboard Shortcuts

**Navigation**:
- `Ctrl/Cmd + K`: Open quick search
- `Ctrl/Cmd + N`: New product
- `Ctrl/Cmd + S`: Save product
- `Esc`: Close editor drawer
- `Tab`: Navigate between fields
- `Shift + Tab`: Navigate backwards

**Editing**:
- `Ctrl/Cmd + D`: Duplicate current product
- `Ctrl/Cmd + Z`: Undo last change (in text fields)
- `Ctrl/Cmd + /`: Toggle active status

---

### Power User Tips

**Tip 1: Use Browser Extensions for Image Prep**
- Install "remove.bg" browser extension
- Right-click product image → "Remove background"
- Download PNG → upload directly to editor

**Tip 2: Keep a SKU Naming Spreadsheet**
- Track SKU patterns for consistency
- Prevents duplicate SKUs
- Makes inventory management easier

**Tip 3: Create Preset Templates**
- Save frequently-used visual preset combinations
- Example: "Standard Soda" = Splash-01 + Elevated theme + "NEW" badge
- Reduces repetitive configuration

**Tip 4: Batch Process with Multiple Tabs**
- Open multiple products in separate browser tabs
- Copy/paste common values between tabs
- Faster than editing one-by-one

---

## 6. Integration Points

### Connection to Other Systems

**Warehouse Integration**:
```
Admin updates stock in editor
  ↓
API call to warehouse system
  ↓
Warehouse system updates inventory count
  ↓
Stock level synced back to admin panel
```

**QuickBooks Sync** *(Future)*:
```
Admin saves product
  ↓
System checks if product exists in QuickBooks
  ↓
If new: Create item in QuickBooks
If existing: Update price and description
  ↓
SKU maps to QuickBooks item number
```

**Customer Catalog Auto-Update**:
```
Admin saves product
  ↓
Database updated
  ↓
Customer catalog auto-refreshes (WebSocket notification)
  ↓
Customers see new product immediately
```

---

## 7. Workflow Summary Diagram

```
┌─────────────────┐
│  Admin Login    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Product List    │ ← [Search, Filter, Sort]
│ Page            │
└────────┬────────┘
         │
         ↓
    [Decision]
    /    |    \
   /     |     \
  ↓      ↓      ↓
New   Edit   Duplicate
  \     |     /
   \    |    /
    ↓   ↓   ↓
┌──────────────────┐
│  Editor Drawer   │
│                  │
│ 1. Core Info     │ ← Required fields
│ 2. Pricing       │ ← Calculate unit price
│ 3. Category      │ ← Dropdown selection
│ 4. Inventory     │ ← Track stock
│ 5. Visual Design │ ← Presets + custom
│ 6. Media         │ ← Image upload
│ 7. Advanced      │ ← SEO, bundles
│                  │
│ [Live Preview]   │ ← Real-time card preview
│                  │
└────────┬─────────┘
         │
         ↓
   [Save Product]
         │
         ↓
   ┌─────────────┐
   │ Validation  │
   └─────┬───────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
  Error    Success
    │         │
    ↓         ↓
 Fix &    Database
 Retry      Save
    ↓         │
    └────┬────┘
         │
         ↓
┌──────────────────┐
│ Success Toast    │
│ Product Live!    │
└──────────────────┘
         │
         ↓
┌──────────────────┐
│ Return to List   │
│ (refreshed)      │
└──────────────────┘
```

---

## 8. Timing Benchmarks

**Average time to complete each workflow**:

- **Add new product** (with all details): 3-5 minutes
- **Quick edit** (price/stock only): 30 seconds
- **Duplicate & modify**: 2-3 minutes
- **Image upload & crop**: 1-2 minutes
- **Apply visual preset**: 10-20 seconds
- **Bulk import 50 products**: 10-15 minutes (including CSV prep)

---

## Summary

This workflow documentation provides:
- Complete step-by-step process for product management
- Best practices for naming, SKUs, images, and pricing
- Real-time preview and validation flow
- Error handling and recovery strategies
- Power user tips and keyboard shortcuts
- Integration with other systems
- Timing benchmarks for workflow planning

Admins following this workflow will efficiently create consistent, professional product listings that look great in the customer catalog.

---

**Related Documentation**:
- [Product Fields Reference](./product-fields.md)
- [Visual Presets Library](./visual-presets.md)
- [API Contract](./api-contract.md)
