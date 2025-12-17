# Patch 01: Responsive Layout Fixes

## Overview
This patch addresses responsive layout issues across the application, ensuring proper mobile, tablet, and desktop experiences.

## Files to Modify

### 1. src/components/ProductCard.tsx

**Issue:** Card layout doesn't adapt well on very small screens (< 375px)

**Fix:**
```typescript
// Line 83: Update container classes
className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer min-w-[280px]"
```

**Reason:** Prevents card crushing on very small screens

---

### 2. src/components/Cart.tsx

**Issue:** Cart drawer is full width on mobile, obscuring content

**Fix:**
```typescript
// Line 20: Update cart panel classes
<div className="absolute right-0 top-0 h-full w-full sm:max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col">
```

**Reason:** Provides progressive enhancement - full width on mobile, max-width on larger screens

---

### 3. src/pages/customer/CustomerCatalog.tsx

**Issue:** Filter sidebar overlaps content on tablets

**Fix:**
```typescript
// Line 534-537: Wrap sidebar in responsive container
{showFilters && (
  <div className="w-full md:w-72 flex-shrink-0">
    <div className="bg-white rounded-xl shadow-sm p-6 md:sticky top-24">
      {/* existing sidebar content */}
    </div>
  </div>
)}

// Line 720-774: Update pagination to stack on mobile
<div className="mt-8 flex flex-col items-center justify-between gap-4 p-4 bg-white rounded-xl border-2 border-gray-200">
  <div className="text-sm text-gray-600 text-center">
    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
  </div>
  <div className="flex flex-wrap items-center justify-center gap-2">
    {/* pagination buttons */}
  </div>
</div>
```

**Reason:** Prevents layout breaks on tablet viewports, ensures pagination is always centered and accessible

---

### 4. src/components/BundleShowcase.tsx

**Issue:** 3-column grid breaks poorly on tablet

**Fix:**
```typescript
// Line 33: Update grid classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Reason:** Progressive grid: 1 col mobile → 2 cols tablet → 3 cols desktop

---

### 5. src/pages/admin/BundleEditor.tsx

**Issue:** Form inputs too narrow on mobile

**Fix:**
```typescript
// Line 198: Update main container
<div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-6">

// Line 225: Update grid to stack on mobile
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// Line 259: Update product selector to stack on mobile
<div className="flex flex-col sm:flex-row gap-2">
  <select className="flex-1 p-2 border rounded" {/* ... */}>
  <input type="number" className="w-full sm:w-24 p-2 border rounded" {/* ... */}>
  <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
```

**Reason:** Ensures form is fully usable on mobile devices

---

### 6. src/pages/SalesRepDashboard.tsx

**Issue:** Header content wraps awkwardly on mobile

**Fix:**
```typescript
// Line 58: Update header layout
<div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div>
    <p className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Sales Rep</p>
    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Performance Center</h1>
    <p className="text-gray-500 text-sm">Track your points, badges, and upcoming incentives.</p>
  </div>
  <Link to="/" className="text-emerald-600 font-semibold text-sm sm:text-base self-start sm:self-auto">
    ← Back to Catalog
  </Link>
</div>

// Line 75: Update grid to stack properly
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Reason:** Prevents awkward wrapping and ensures touch targets are accessible

---

### 7. src/components/FilterSidebar.tsx

**Issue:** Sidebar doesn't work on mobile (should be overlay/modal)

**Fix:**
Add new mobile-friendly version:

```typescript
// Add to imports
import { Menu } from 'lucide-react';

// Update component to accept `isMobile` prop
interface FilterSidebarProps {
  // ... existing props
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// Wrap sidebar content conditionally
export default function FilterSidebar({ ..., isMobile, isOpen, onClose }: FilterSidebarProps) {
  const sidebarContent = (
    <div className={`${isMobile ? 'w-full' : 'w-72'} bg-white ${isMobile ? 'h-screen' : 'border-r border-gray-200 h-full'} overflow-y-auto`}>
      {/* existing sidebar content */}
    </div>
  );

  if (isMobile) {
    return isOpen ? (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-y-0 left-0 max-w-sm w-full">
          {sidebarContent}
        </div>
      </div>
    ) : null;
  }

  return sidebarContent;
}
```

**Reason:** Mobile requires overlay pattern for sidebars to prevent layout issues

---

## Testing Checklist

- [ ] Test on iPhone SE (375px)
- [ ] Test on iPad (768px)
- [ ] Test on iPad Pro (1024px)
- [ ] Test on Desktop (1440px+)
- [ ] Test landscape orientation on mobile/tablet
- [ ] Verify touch targets are minimum 44x44px on mobile
- [ ] Check horizontal scroll doesn't occur at any breakpoint

## Deployment

1. Apply patches in order
2. Run `npm run dev` to verify locally
3. Test on real devices using Ngrok/Cloudflare Tunnel
4. Run `npm run build` to verify production build
5. Deploy to staging environment first
