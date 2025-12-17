# Patch 02: Z-Index & Spacing Fixes

## Overview
This patch establishes a consistent z-index system and fixes spacing inconsistencies across components.

## Z-Index System

Create a centralized z-index scale to prevent layering conflicts:

### src/index.css (Add to top of file)

```css
:root {
  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-header: 30;
  --z-overlay: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;
}
```

## Files to Modify

### 1. src/components/Cart.tsx

**Issue:** Cart z-index (50) conflicts with modals

**Fix:**
```typescript
// Line 17: Update z-index
<div className="fixed inset-0 z-[--z-modal] overflow-hidden">
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

  <div className="absolute right-0 top-0 h-full w-full sm:max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col">
```

Or if using Tailwind (recommended):
```typescript
<div className="fixed inset-0 z-50 overflow-hidden">
```

**Reason:** Ensures cart is always on top of content but below toasts/tooltips

---

### 2. src/pages/customer/CustomerCatalog.tsx

**Issue:** Search bar z-index (30) can be obscured by sticky elements

**Fix:**
```typescript
// Line 432: Update search header z-index
<div className="bg-white border-b border-gray-200 sticky top-0 z-40">

// Line 536: Update sidebar sticky positioning
<div className="bg-white rounded-xl shadow-sm p-6 md:sticky top-24 z-10">

// Line 1019: Update QuickViewModal z-index
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
```

**Reason:** Proper layering: modals (50) > sticky header (40) > sidebar (10)

---

### 3. src/components/ProductCard.tsx

**Issue:** Inconsistent spacing between elements

**Fix:**
```typescript
// Line 96: Standardize padding
<div className="relative p-4 sm:p-6">

  // Line 120: Standardize spacing between sections
  <div className="space-y-4">
    <div className="flex items-start justify-between gap-2">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors leading-tight">
        {product.name}
      </h3>
      {/* badges */}
    </div>

    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
      {product.description}
    </p>

    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Package size={16} className="flex-shrink-0" />
      <span className="font-medium">
        {product.units_per_case} units per {product.unit_type}
      </span>
    </div>

    <div className="pt-4 border-t border-gray-300/50">
      {/* pricing */}
    </div>
  </div>
</div>
```

**Reason:** Uses consistent `space-y-4` pattern, adds responsive padding

---

### 4. src/components/BundleShowcase.tsx

**Issue:** Inconsistent spacing, no z-index for overlay badges

**Fix:**
```typescript
// Line 22: Standardize section spacing
<div className="mb-12 sm:mb-16">

  // Line 23: Add consistent header spacing
  <div className="flex items-center justify-between mb-6 sm:mb-8">

  // Line 51-58: Fix badge z-index
  <div className="absolute top-4 right-4 z-10">
    <div
      className="px-4 py-2 rounded-full font-black text-white shadow-lg flex items-center gap-2"
      style={{ backgroundColor: bundle.badge_color }}
    >
      <Sparkles size={16} />
      {bundle.badge_text}
    </div>
  </div>

  // Line 61-68: Fix discount badge z-index
  {bundle.discount_percent > 0 && (
    <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300 z-10">
```

**Reason:** Ensures badges always appear above image, consistent spacing rhythm

---

### 5. src/pages/admin/BundleEditor.tsx

**Issue:** Inconsistent form spacing

**Fix:**
```typescript
// Line 188: Standardize container spacing
<div className="p-4 sm:p-6 space-y-6">
  <h1 className="text-2xl font-bold mb-6">Bundle Editor</h1>

  // Line 191-196: Fix error message spacing
  {error && (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
      <span className="text-red-800 text-sm">{error}</span>
    </div>
  )}

  // Line 198: Standardize card spacing
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-8">

    // Line 200-253: Standardize section spacing
    <div className="space-y-5">
      <h2 className="text-lg font-semibold mb-4">Bundle Information</h2>

      <div className="space-y-4">
        {/* form fields with consistent gap */}
      </div>
    </div>

    // Line 256: Add visual separator
    <div className="border-t-2 border-gray-100 pt-8 space-y-5">
      <h2 className="text-lg font-semibold mb-4">Add Products</h2>
      {/* ... */}
    </div>
```

**Reason:** Creates visual hierarchy with consistent spacing scale (4, 5, 6, 8)

---

### 6. src/components/FilterSidebar.tsx

**Issue:** Inconsistent padding and spacing

**Fix:**
```typescript
// Line 53: Update container
<div className="w-72 bg-white border-r border-gray-200 h-full overflow-y-auto">

  // Line 54-72: Standardize header spacing
  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-20">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-black text-gray-900">Filters</h2>
      {activeFiltersCount > 0 && (
        <button className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5">
          <X size={16} />
          <span className="hidden sm:inline">Clear All</span>
        </button>
      )}
    </div>
    {activeFiltersCount > 0 && (
      <p className="text-sm text-gray-600">
        {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
      </p>
    )}
  </div>

  // Line 74: Standardize content spacing
  <div className="p-4 sm:p-6 space-y-8">

    // Line 84-101: Standardize checkbox spacing
    {showBrands && (
      <div className="space-y-2.5">
        {brands.map(brand => (
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2.5 rounded-lg transition-colors">
```

**Reason:** Uses Tailwind spacing scale consistently (2.5, 3, 4, 6, 8)

---

### 7. src/pages/SalesRepDashboard.tsx

**Issue:** Inconsistent card spacing

**Fix:**
```typescript
// Line 69: Standardize main spacing
<main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

  // Line 70-74: Fix toast z-index
  {toast && (
    <div className="bg-white border-l-4 border-emerald-500 rounded-xl p-4 shadow-lg text-emerald-700 z-50 relative">
      {toast}
    </div>
  )}

  // Line 75-90: Standardize stat card spacing
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Points</p>
      <p className="text-3xl sm:text-4xl font-black text-gray-900">{stats?.points ?? 0}</p>
    </div>
```

**Reason:** Progressive spacing, proper toast z-index

---

## Spacing Scale Reference

Use this consistent scale across all components:

| Space | Pixels | Use Case |
|-------|--------|----------|
| `gap-1.5` | 6px | Tight icon + text |
| `gap-2` | 8px | Icon + label |
| `gap-2.5` | 10px | Checkbox + label |
| `gap-3` | 12px | Related elements |
| `gap-4` | 16px | Section elements |
| `gap-5` | 20px | Form fields |
| `gap-6` | 24px | Section headers |
| `gap-8` | 32px | Major sections |

## Testing Checklist

- [ ] Verify all modals appear above all other content
- [ ] Verify sticky headers stay below modals
- [ ] Check tooltips appear above modals
- [ ] Verify no content overlaps unexpectedly
- [ ] Check spacing is visually consistent across pages
- [ ] Verify responsive spacing works on mobile

## Notes

- Use CSS custom properties for z-index in new components
- Always use Tailwind spacing utilities (no arbitrary values like `p-[13px]`)
- When in doubt, use `space-y-4` for vertical spacing
