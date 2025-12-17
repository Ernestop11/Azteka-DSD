# Patch 03: Button Consistency Fixes

## Overview
This patch establishes a consistent button design system across all components, ensuring visual hierarchy and interaction patterns are uniform.

## Button Design System

### Button Variants

#### Primary (Call-to-Action)
- Background: `bg-emerald-600 hover:bg-emerald-700`
- Text: `text-white`
- Size: `px-6 py-3`
- Border radius: `rounded-xl`
- Shadow: `shadow-lg hover:shadow-xl`
- Transform: `transform hover:scale-105`
- Transition: `transition-all duration-300`

#### Secondary (Alternative Action)
- Background: `bg-gray-100 hover:bg-gray-200`
- Text: `text-gray-900`
- Size: `px-6 py-3`
- Border radius: `rounded-xl`
- No shadow or transform

#### Destructive (Delete, Remove)
- Background: `bg-red-500 hover:bg-red-600`
- Text: `text-white`
- Size: `px-4 py-2`
- Border radius: `rounded-lg`

#### Ghost (Subtle Action)
- Background: `hover:bg-gray-100`
- Text: `text-gray-700`
- Size: `px-4 py-2`
- Border radius: `rounded-lg`

#### Disabled State
- Add: `disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50`

## Files to Modify

### 1. src/components/ProductCard.tsx

**Issue:** Multiple button styles not consistent

**Fix:**
```typescript
// Line 162-173: Standardize Add to Cart button
<button
  onClick={handleAddClick}
  disabled={!product.in_stock}
  aria-label={product.in_stock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
  className="group/btn relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-gray-400 disabled:to-gray-400 overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
  <div className="relative flex items-center justify-center gap-2">
    <ShoppingCart size={18} aria-hidden="true" />
    <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
  </div>
</button>

// Line 198-220: Standardize bundle buttons
<button
  key={bundle.id}
  onClick={(e) => {
    e.stopPropagation();
    if (onAddMultiple) {
      onAddMultiple(bundle.products.map(p => ({ product: p, quantity: 1 })));
    }
  }}
  aria-label={`Add bundle: ${bundle.name}`}
  className="w-full text-left px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition-all group/bundle focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
>
  <div className="flex items-center justify-between gap-3">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900 truncate">{bundle.name}</p>
      {bundle.discount_percentage > 0 && (
        <p className="text-xs text-amber-700 font-semibold mt-0.5">
          {bundle.discount_percentage}% OFF
        </p>
      )}
    </div>
    <ShoppingCart
      size={16}
      className="text-amber-600 group-hover/bundle:scale-110 transition-transform flex-shrink-0"
      aria-hidden="true"
    />
  </div>
</button>
```

**Reason:** Consistent primary button styling, proper disabled states, accessibility attributes

---

### 2. src/components/Cart.tsx

**Issue:** Inconsistent button sizing and hover states

**Fix:**
```typescript
// Line 27-32: Standardize close button
<button
  onClick={onClose}
  aria-label="Close cart"
  className="p-2.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
>
  <X size={24} aria-hidden="true" />
</button>

// Line 72-78: Standardize remove button
<button
  onClick={() => onRemoveItem(item.id)}
  aria-label={`Remove ${item.name} from cart`}
  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
>
  <Trash2 size={16} aria-hidden="true" />
</button>

// Line 86-100: Standardize quantity buttons
<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
  <button
    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
    disabled={item.quantity <= 1}
    aria-label="Decrease quantity"
    className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
  >
    <Minus size={16} aria-hidden="true" />
  </button>
  <span className="w-12 text-center font-bold text-gray-900" aria-live="polite">
    {item.quantity}
  </span>
  <button
    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
    aria-label="Increase quantity"
    className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
  >
    <Plus size={16} aria-hidden="true" />
  </button>
</div>

// Line 128-133: Standardize checkout button (PRIMARY)
<button
  onClick={onCheckout}
  aria-label="Proceed to checkout"
  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 active:scale-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
>
  Proceed to Checkout
</button>
```

**Reason:** Consistent sizing (square buttons = 9x9), proper focus states, disabled states

---

### 3. src/pages/customer/CustomerCatalog.tsx

**Issue:** Mix of button styles, inconsistent focus states

**Fix:**
```typescript
// Line 446-452: Standardize clear search button
{searchQuery && (
  <button
    onClick={() => setSearchQuery('')}
    aria-label="Clear search"
    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
  >
    <X size={20} aria-hidden="true" />
  </button>
)}

// Line 456-465: Standardize filter toggle button (SECONDARY)
<button
  onClick={() => setShowFilters(!showFilters)}
  aria-label={showFilters ? 'Hide filters' : 'Show filters'}
  aria-expanded={showFilters}
  className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
>
  <Filter size={20} aria-hidden="true" />
  <span className="hidden md:inline">Filters</span>
  {hasActiveFilters && (
    <span className="w-2 h-2 bg-emerald-500 rounded-full" aria-label="Active filters"></span>
  )}
</button>

// Line 480-491: Standardize cart button (PRIMARY)
<button
  onClick={() => navigate('/customer/cart')}
  aria-label={`View cart${totalCartItems > 0 ? ` (${totalCartItems} items)` : ''}`}
  className="relative px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center gap-2"
>
  <ShoppingCart size={20} aria-hidden="true" />
  <span className="hidden md:inline">Cart</span>
  {totalCartItems > 0 && (
    <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
      {totalCartItems}
    </span>
  )}
</button>

// Line 710-716: Standardize "Clear Filters" button (SECONDARY)
<button
  onClick={clearFilters}
  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
>
  Clear Filters
</button>

// Line 726-733: Standardize pagination buttons
<button
  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
  disabled={currentPage === 1}
  aria-label="Previous page"
  className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
>
  <ChevronLeft size={20} aria-hidden="true" />
  <span className="hidden sm:inline">Previous</span>
</button>

// Line 749-757: Standardize page number buttons
<button
  key={pageNum}
  onClick={() => setCurrentPage(pageNum)}
  aria-label={`Go to page ${pageNum}`}
  aria-current={currentPage === pageNum ? 'page' : undefined}
  className={`w-10 h-10 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
    currentPage === pageNum
      ? 'bg-emerald-600 text-white shadow-md'
      : 'border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100'
  }`}
>
  {pageNum}
</button>

// Line 939-946: Standardize ProductCard "Add to Cart" button (PRIMARY)
<button
  onClick={() => setShowQuantity(true)}
  disabled={!product.inStock}
  aria-label={`Add ${product.name} to cart`}
  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
>
  <ShoppingCart size={18} aria-hidden="true" />
  Add to Cart
</button>

// Line 970-978: Standardize quantity confirm button
<button
  onClick={() => {
    onAddToCart(product, quantity);
    setShowQuantity(false);
    setQuantity(1);
  }}
  aria-label="Confirm quantity and add to cart"
  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
>
  <Check size={20} aria-hidden="true" />
</button>
```

**Reason:** Establishes clear primary/secondary hierarchy, consistent focus rings, proper ARIA labels

---

### 4. src/components/BundleShowcase.tsx

**Issue:** Button missing hover states and focus management

**Fix:**
```typescript
// Line 77-80: Standardize "View Bundle" button
<button
  onClick={(e) => {
    e.stopPropagation();
    onSelectBundle(bundle);
  }}
  aria-label={`View details for ${bundle.name}`}
  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 active:bg-gray-100 transform hover:scale-105 active:scale-100 transition-all duration-300 group/btn focus:outline-none focus:ring-4 focus:ring-white/50"
>
  <span>View Bundle</span>
  <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
</button>
```

**Reason:** Adds missing active state, focus ring, proper ARIA

---

### 5. src/pages/admin/BundleEditor.tsx

**Issue:** Inconsistent admin button styles

**Fix:**
```typescript
// Line 282-290: Standardize "Add Product" button (SECONDARY)
<button
  type="button"
  onClick={addProductToBundle}
  disabled={!selectedProductId}
  aria-label="Add selected product to bundle"
  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
>
  <Plus size={18} aria-hidden="true" />
  Add
</button>

// Line 324-330: Standardize remove button (DESTRUCTIVE)
<button
  type="button"
  onClick={() => removeProductFromBundle(item.productId)}
  aria-label={`Remove ${product.name} from bundle`}
  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
>
  <X size={18} aria-hidden="true" />
</button>

// Line 358-367: Standardize "Create Bundle" button (PRIMARY)
<button
  type="button"
  onClick={handleSave}
  disabled={!formData.name || formData.items.length === 0}
  aria-label="Create bundle"
  className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-lg flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-300"
>
  <Save size={18} aria-hidden="true" />
  Create Bundle
</button>
```

**Reason:** Distinguishes primary action (create) from secondary (add), proper disabled/focus states

---

### 6. src/components/FilterSidebar.tsx

**Issue:** Buttons lack proper interaction states

**Fix:**
```typescript
// Line 58-64: Standardize "Clear All" button (DESTRUCTIVE)
<button
  onClick={onClearAll}
  aria-label={`Clear all ${activeFiltersCount} active filters`}
  className="text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
>
  <X size={16} aria-hidden="true" />
  <span className="hidden sm:inline">Clear All</span>
</button>

// Line 76-82: Standardize section toggle buttons (GHOST)
<button
  onClick={() => setShowBrands(!showBrands)}
  aria-label={showBrands ? 'Hide brands' : 'Show brands'}
  aria-expanded={showBrands}
  className="w-full flex items-center justify-between p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-400"
>
  <h3 className="text-lg font-black text-gray-900">Brands</h3>
  {showBrands ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
</button>

// Line 129-138: Standardize subcategory toggle (GHOST)
<button
  onClick={() => toggleCategory(category.id)}
  aria-label={expandedCategories.includes(category.id) ? `Collapse ${category.name}` : `Expand ${category.name}`}
  aria-expanded={expandedCategories.includes(category.id)}
  className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
>
  {expandedCategories.includes(category.id) ? (
    <ChevronUp size={16} aria-hidden="true" />
  ) : (
    <ChevronDown size={16} aria-hidden="true" />
  )}
</button>
```

**Reason:** Consistent ghost button pattern, proper ARIA for collapsible sections

---

## Button Component Library (Recommended)

Consider creating reusable button components:

### src/components/ui/Button.tsx

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none';

    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:ring-4 focus:ring-emerald-300',
      secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400',
      destructive: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
      ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-2 focus:ring-gray-400',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    };

    const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-gray-400';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

Usage:
```typescript
import Button from '@/components/ui/Button';
import { ShoppingCart } from 'lucide-react';

<Button variant="primary" icon={<ShoppingCart size={18} />} aria-label="Add to cart">
  Add to Cart
</Button>
```

---

## Testing Checklist

- [ ] All buttons have consistent sizing within variant
- [ ] All buttons have visible focus states (keyboard navigation)
- [ ] All buttons have proper hover/active states
- [ ] Disabled buttons don't respond to interaction
- [ ] Icon-only buttons have `aria-label`
- [ ] Buttons with icons have `aria-hidden="true"` on icons
- [ ] Primary actions use primary variant
- [ ] Destructive actions use red color scheme
- [ ] Loading states prevent multiple submissions

## Migration Guide

1. Start with high-traffic pages (CustomerCatalog, Cart)
2. Apply button system consistently
3. Test keyboard navigation thoroughly
4. Consider extracting Button component for future use
5. Update design documentation
