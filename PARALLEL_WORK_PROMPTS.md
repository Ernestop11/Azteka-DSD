# 🤝 Parallel Work Prompts for Claude/Codex in VS Code

Use these prompts to work on different parts of the MVP in parallel with Auto.

## 🎨 Prompt 1: Enhance Product Editor UI/UX

**Goal**: Improve the product editor with better filters, search, and preview

**Context**: The product editor at `/app/admin/products/ProductEditor.tsx` needs:
- Better product search/filtering
- Real-time preview of visual effects
- Category/brand autocomplete
- Image cropping/resizing
- Better error messages

**Task**:
1. Add a searchable product selector with autocomplete
2. Add a live preview panel showing how the product card will look
3. Add image cropping tool (use a library like `react-image-crop`)
4. Improve form validation with inline error messages
5. Add keyboard shortcuts (Cmd+S to save, Esc to close)

**Files to modify**:
- `app/admin/products/ProductEditor.tsx`
- `app/admin/products/ProductImageUpload.tsx`
- Create: `components/admin/ProductPreview.tsx`
- Create: `components/admin/ImageCropper.tsx`

**API**: Use existing `/api/admin/products` endpoints

---

## 🎯 Prompt 2: Create Bundle Display Components

**Goal**: Create beautiful bundle display components for the catalog

**Context**: We have bundle data but need components to display them attractively in the catalog.

**Task**:
1. Create `BundleCard.tsx` - Card component for bundle grid
2. Create `BundleDetailModal.tsx` - Modal showing bundle contents
3. Create `BundleQuickAdd.tsx` - Quick add to cart button
4. Add bundle filtering to catalog page
5. Add bundle search functionality

**Files to create**:
- `components/catalog/BundleCard.tsx`
- `components/catalog/BundleDetailModal.tsx`
- `components/catalog/BundleQuickAdd.tsx`
- `components/catalog/BundleGrid.tsx`

**API**: Use `/api/admin/bundles` endpoints

**Design**: Match the style of `GlossyProductCard.tsx` but larger, with bundle badge, discount badge, and product count.

---

## 🔍 Prompt 3: Add Advanced Catalog Filters

**Goal**: Add comprehensive filtering to the catalog page

**Context**: The catalog needs filters for price, category, brand, tier, and more.

**Task**:
1. Create `CatalogFilters.tsx` component with:
   - Price range slider
   - Category checkboxes
   - Brand checkboxes
   - Tier selector (A/B/C)
   - Featured/Trending/Seasonal toggles
   - Search bar
2. Add filter state management
3. Add URL query params for filters (shareable links)
4. Add filter reset button
5. Show active filter count

**Files to create**:
- `components/catalog/CatalogFilters.tsx`
- `components/catalog/FilterPanel.tsx`
- `hooks/useCatalogFilters.ts`

**Integration**: Add to `app/catalog/CatalogContent.tsx`

---

## 📱 Prompt 4: Mobile/Tablet Optimization

**Goal**: Optimize all admin pages for mobile and tablet

**Context**: Admin pages need to work well on tablets and mobile devices.

**Task**:
1. Make product table responsive (stack on mobile)
2. Make bundle cards responsive (1 column on mobile, 2 on tablet)
3. Optimize drawer/modal for mobile (full screen on small devices)
4. Add touch-friendly buttons (larger tap targets)
5. Optimize image upload for mobile (camera access)
6. Add swipe gestures for mobile navigation

**Files to modify**:
- `app/admin/products/page.tsx`
- `app/admin/products/ProductTable.tsx`
- `app/admin/bundles/page.tsx`
- `components/ui/drawer.tsx`
- `components/ui/modal.tsx`

**Breakpoints**: Use Tailwind: `sm:`, `md:`, `lg:`, `xl:`

---

## 🎨 Prompt 5: Create Visual Preset Library

**Goal**: Create a library of visual presets for product cards

**Context**: Products can have gradient, glow, and splash presets. We need a library UI.

**Task**:
1. Create `VisualPresetLibrary.tsx` component showing all presets
2. Add preset categories (Gradients, Glows, Splashes)
3. Add preset preview cards
4. Add "Apply to All" functionality
5. Add preset search/filter
6. Add preset favorites

**Files to create**:
- `components/admin/VisualPresetLibrary.tsx`
- `components/admin/PresetCard.tsx`
- `components/admin/PresetCategory.tsx`

**API**: Use `/api/presets/visual` endpoint

**Integration**: Add to `app/admin/products/ProductEditor.tsx`

---

## 🛒 Prompt 6: Enhance Cart Functionality

**Goal**: Improve cart with bundle support and better UX

**Context**: Cart needs to handle bundles, show bundle contents, and have better item management.

**Task**:
1. Add bundle support to cart (show bundle items)
2. Add "Edit Bundle" option in cart
3. Add quantity suggestions (e.g., "Add 1 more for free shipping")
4. Add cart item notes/comments
5. Add save cart for later
6. Add cart sharing (generate shareable link)

**Files to modify**:
- `components/CartDrawer.tsx`
- `components/CartItemRow.tsx`
- `store/cart.ts` (Zustand store)
- Create: `components/cart/BundleCartItem.tsx`
- Create: `components/cart/CartNotes.tsx`

**API**: May need new endpoints for cart persistence

---

## 📊 Prompt 7: Add Analytics Dashboard

**Goal**: Create a simple analytics dashboard for admin

**Context**: Admin needs to see product views, popular items, bundle performance.

**Task**:
1. Create `AnalyticsDashboard.tsx` component
2. Show top products (by views/sales)
3. Show bundle performance
4. Show category performance
5. Add date range selector
6. Add export to CSV

**Files to create**:
- `app/admin/analytics/page.tsx`
- `components/admin/AnalyticsDashboard.tsx`
- `components/admin/ProductStats.tsx`
- `components/admin/BundleStats.tsx`

**API**: Create `/api/admin/analytics` endpoint

**Data**: Use existing product/bundle data, add view tracking if needed

---

## 🎁 Prompt 8: Create Bundle Templates

**Goal**: Allow admins to create bundle templates for quick creation

**Context**: Admins should be able to save bundle configurations as templates.

**Task**:
1. Create `BundleTemplate` model in Prisma schema
2. Add "Save as Template" button in bundle editor
3. Create template selector in bundle creation
4. Add template library page
5. Add template preview

**Files to create**:
- `app/admin/bundles/templates/page.tsx`
- `components/admin/BundleTemplateSelector.tsx`
- `components/admin/BundleTemplateCard.tsx`

**API**: Create `/api/admin/bundles/templates` endpoints

**Database**: May need migration for `BundleTemplate` model

---

## 🔧 Prompt 9: Fix Admin Save Error

**Goal**: Fix the "Failed to update product" error that appears even when save succeeds

**Context**: Product save works but shows error message. Need to fix response handling.

**Task**:
1. Check `/api/admin/products/route.ts` PUT handler
2. Ensure consistent response format
3. Fix error handling in `ProductEditor.tsx`
4. Add better success/error toasts
5. Add loading states
6. Test with network errors

**Files to modify**:
- `app/api/admin/products/route.ts`
- `app/admin/products/ProductEditor.tsx`
- `components/ui/toast.tsx` (if needed)

**Test**: Save product with image, without image, with errors

---

## 🎨 Prompt 10: Create Product Variants System

**Goal**: Allow products to have variants (sizes, flavors, etc.)

**Context**: Some products need variants (e.g., Coke 12oz vs 20oz).

**Task**:
1. Create `ProductVariant` model in Prisma
2. Add variant selector in product editor
3. Add variant display in catalog
4. Add variant pricing
5. Add variant images

**Files to create**:
- `components/admin/ProductVariantEditor.tsx`
- `components/catalog/ProductVariantSelector.tsx`

**Database**: Need migration for `ProductVariant` model

**API**: Extend `/api/admin/products` to handle variants

---

## 📝 How to Use These Prompts

1. **Copy a prompt** that interests you
2. **Paste into Claude/Codex** in VS Code
3. **Provide context** by opening relevant files
4. **Let it work** while Auto continues with other tasks
5. **Test and merge** when done

## 🎯 Priority Order

1. **Prompt 9** - Fix save error (blocking issue)
2. **Prompt 4** - Mobile optimization (UX critical)
3. **Prompt 3** - Catalog filters (feature completeness)
4. **Prompt 2** - Bundle display (feature completeness)
5. **Prompt 1** - Product editor enhancements (nice to have)

The rest can be done in any order based on needs.

