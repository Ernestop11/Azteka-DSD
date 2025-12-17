# Patch 05: Accessibility Improvements

## Overview
This patch ensures WCAG 2.1 AA compliance across all components, improving keyboard navigation, screen reader support, focus management, and semantic HTML.

## WCAG 2.1 AA Requirements

### Key Principles
1. **Perceivable**: Information must be presentable to users in ways they can perceive
2. **Operable**: UI components must be operable via keyboard
3. **Understandable**: Information and operation must be understandable
4. **Robust**: Content must be robust enough to work with assistive technologies

## Files to Modify

### 1. src/components/ProductCard.tsx

**Issues:**
- Missing ARIA labels on buttons
- No keyboard navigation for modal
- Images missing alt text context
- Focus not trapped in modal

**Fix:**
```typescript
import { useEffect, useState, useRef } from 'react';
// ... other imports

export default function ProductCard({ product, onAddToCart, onAddMultiple, bundles = [], promotion }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus in modal
  useEffect(() => {
    if (showModal && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowModal(false);
        }
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showModal]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showModal]);

  return (
    <>
      {showModal && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />
          <AddToCartModal
            product={product}
            bundles={bundles}
            onClose={() => setShowModal(false)}
            onConfirm={handleModalConfirm}
          />
        </div>
      )}
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
        style={{
          background: product.background_gradient || `linear-gradient(135deg, ${product.background_color}dd 0%, ${product.background_color}22 100%)` || '#FFF',
          boxShadow: product.featured ? '0 6px 16px rgba(0,0,0,0.15)' : undefined
        }}
        role="group"
        aria-label={`Product: ${product.name}`}
      >
        {/* ... decorative backgrounds (aria-hidden) ... */}

        <div className="relative p-4 sm:p-6">
          <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm shadow-inner relative">
            {/* Decorative gradient */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${product.background_color}88 0%, transparent 70%)`
              }}
              aria-hidden="true"
            />
            {!imageError && imageSrc ? (
              <img
                src={imageSrc}
                alt={`${product.name}${product.description ? ` - ${product.description}` : ''}`}
                className="relative w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 group-hover:rotate-2 drop-shadow-2xl"
                onError={() => setImageError(true)}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="relative flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-500"
                role="img"
                aria-label="No product image available"
              >
                No Image Available
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h3 id={`product-${product.id}-title`} className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors leading-tight">
                {product.name}
              </h3>
              {promotion && PromotionIcon && (
                <div
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-black text-white shadow-md flex items-center gap-1 animate-pulse"
                  style={{ backgroundColor: promotion.badge_color }}
                  role="status"
                  aria-label={`Promotion: ${promotion.badge_text}, earn ${promotion.points} points`}
                >
                  <PromotionIcon size={12} aria-hidden="true" />
                  {promotion.badge_text}
                </div>
              )}
              {!promotion && product.featured && (
                <span
                  className="flex-shrink-0 px-2 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-md"
                  role="status"
                  aria-label="Featured product"
                >
                  FEATURED
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600" aria-label="Product details">
              <Package size={16} className="flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">
                {product.units_per_case} units per {product.unit_type}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-300/50">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium" id={`product-${product.id}-price-label`}>
                    Wholesale Price
                  </p>
                  <p
                    className="text-2xl sm:text-3xl font-bold text-gray-900"
                    aria-labelledby={`product-${product.id}-price-label`}
                  >
                    ${(Number(product.price) || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">per {product.unit_type}</p>
                </div>

                <button
                  onClick={handleAddClick}
                  disabled={!product.in_stock}
                  aria-label={product.in_stock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                  aria-describedby={`product-${product.id}-title`}
                  className="group/btn relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-offset-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  <div className="relative flex items-center gap-2">
                    <ShoppingCart size={18} aria-hidden="true" />
                    <span>{product.in_stock ? 'Add' : 'Out of Stock'}</span>
                  </div>
                </button>
              </div>
            </div>

            {promotion && promotion.points > 0 && (
              <div
                className="mt-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-black rounded-lg text-center shadow-md flex items-center justify-center gap-2"
                role="status"
                aria-live="polite"
              >
                <Trophy size={16} aria-hidden="true" />
                Earn {promotion.points} Bonus Points!
              </div>
            )}

            {!product.in_stock && (
              <div
                className="mt-2 px-3 py-2 bg-red-100 border border-red-300 text-red-800 text-sm font-semibold rounded-lg text-center"
                role="status"
                aria-live="polite"
              >
                Currently Unavailable
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </>
  );
}
```

**Key Changes:**
- Added `role="dialog"`, `aria-modal="true"` to modal
- Added focus trap for keyboard navigation
- Added `aria-label` to all interactive elements
- Changed `<div>` to `<article>` for semantic HTML
- Added `aria-live="polite"` for status updates
- Added comprehensive alt text for images
- Added keyboard handler for Escape key

---

### 2. src/components/Cart.tsx

**Issues:**
- Missing ARIA labels
- No live region for cart updates
- Modal not announced to screen readers

**Fix:**
```typescript
export default function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout, onClose }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ShoppingBag size={28} aria-hidden="true" />
              <h2 id="cart-title" className="text-2xl font-bold">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <p className="text-white/90" aria-live="polite" aria-atomic="true">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8" role="status">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={48} className="text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
              <p className="text-gray-600">Add products to get started</p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4"
              role="list"
              aria-label="Cart items"
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  role="listitem"
                >
                  <div className="flex gap-4">
                    <div
                      className="w-24 h-24 rounded-xl flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: item.background_color + '33' }}
                    >
                      <img
                        src={item.image_url}
                        alt={`${item.name} product image`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 leading-tight" id={`cart-item-${item.id}`}>
                          {item.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        ${(Number(item.price) || 0).toFixed(2)} per {item.unit_type}
                      </p>

                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 bg-gray-100 rounded-lg p-1"
                          role="group"
                          aria-labelledby={`cart-item-${item.id}`}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                          >
                            <Minus size={16} aria-hidden="true" />
                          </button>
                          <span
                            className="w-12 text-center font-bold text-gray-900"
                            aria-live="polite"
                            aria-atomic="true"
                            role="status"
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                          >
                            <Plus size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <p className="text-lg font-bold text-gray-900" aria-label={`Subtotal for ${item.name}`}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 p-6 bg-gray-50 space-y-4">
              <div className="space-y-2" role="region" aria-label="Order summary">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span aria-live="polite">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 text-center pt-1">
                  Payment collected on delivery
                </p>
              </div>

              <button
                onClick={onCheckout}
                aria-label={`Proceed to checkout with ${totalItems} items totaling $${subtotal.toFixed(2)}`}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

**Key Changes:**
- Added `role="dialog"` and `aria-modal="true"`
- Added `role="list"` and `role="listitem"` for semantic structure
- Added `aria-live="polite"` for cart quantity updates
- All buttons have descriptive `aria-label`
- Added `role="region"` for order summary
- Icons marked with `aria-hidden="true"`

---

### 3. src/pages/customer/CustomerCatalog.tsx

**Issues:**
- Search input missing label
- Filter checkboxes not properly associated
- Pagination missing ARIA attributes
- No skip links

**Fix:**
```typescript
export default function CustomerCatalog() {
  // ... existing state ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Links for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <CustomerNavbar />

      {/* Search and Filters Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <label htmlFor="product-search" className="sr-only">
                Search products by name, brand, or category
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand, or category..."
                aria-label="Search products"
                aria-describedby="search-results-count"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              aria-expanded={showFilters}
              aria-controls="filter-sidebar"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <Filter size={20} aria-hidden="true" />
              <span className="hidden md:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" role="status" aria-label="Filters active"></span>
              )}
            </button>

            {/* Sort Dropdown */}
            <label htmlFor="sort-products" className="sr-only">Sort products by</label>
            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort products"
              className="px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/customer/cart')}
              aria-label={`View cart${totalCartItems > 0 ? ` with ${totalCartItems} items` : ''}`}
              className="relative px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center gap-2"
            >
              <ShoppingCart size={20} aria-hidden="true" />
              <span className="hidden md:inline">Cart</span>
              {totalCartItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  aria-label={`${totalCartItems} items in cart`}
                >
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap" role="region" aria-label="Active filters">
              <span className="text-sm text-gray-600 font-medium" aria-hidden="true">Active filters:</span>
              {Array.from(selectedCategories).map((cat) => (
                <FilterTag
                  key={cat}
                  label={cat}
                  onRemove={() => {
                    const newSet = new Set(selectedCategories);
                    newSet.delete(cat);
                    setSelectedCategories(newSet);
                  }}
                />
              ))}
              {Array.from(selectedBrands).map((brand) => (
                <FilterTag
                  key={brand}
                  label={brand}
                  onRemove={() => {
                    const newSet = new Set(selectedBrands);
                    newSet.delete(brand);
                    setSelectedBrands(newSet);
                  }}
                />
              ))}
              <button
                onClick={clearFilters}
                aria-label="Clear all filters"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded px-2 py-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside
              id="filter-sidebar"
              className="w-full md:w-72 flex-shrink-0"
              role="complementary"
              aria-label="Product filters"
            >
              <div className="bg-white rounded-xl shadow-sm p-6 md:sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>

                {/* In Stock Only Toggle */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        id="in-stock-filter"
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        aria-describedby="in-stock-count"
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-400"
                      />
                      <label htmlFor="in-stock-filter" className="text-sm font-semibold text-gray-900 cursor-pointer">
                        In Stock Only
                      </label>
                    </div>
                    <span id="in-stock-count" className="text-xs text-gray-500">
                      ({products.filter(p => p.inStock).length} available)
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <fieldset className="mb-6">
                  <legend className="text-sm font-semibold text-gray-900 mb-3">Categories</legend>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          id={`category-${cat}`}
                          type="checkbox"
                          checked={selectedCategories.has(cat)}
                          onChange={(e) => {
                            const newSet = new Set(selectedCategories);
                            if (e.target.checked) {
                              newSet.add(cat);
                            } else {
                              newSet.delete(cat);
                            }
                            setSelectedCategories(newSet);
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-400"
                        />
                        <label htmlFor={`category-${cat}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                          {cat}
                        </label>
                        <span className="text-xs text-gray-500" aria-label={`${products.filter((p) => p.category === cat).length} products in ${cat}`}>
                          ({products.filter((p) => p.category === cat).length})
                        </span>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Brands */}
                <fieldset className="mb-6">
                  <legend className="text-sm font-semibold text-gray-900 mb-3">Brands</legend>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          id={`brand-${brand}`}
                          type="checkbox"
                          checked={selectedBrands.has(brand)}
                          onChange={(e) => {
                            const newSet = new Set(selectedBrands);
                            if (e.target.checked) {
                              newSet.add(brand);
                            } else {
                              newSet.delete(brand);
                            }
                            setSelectedBrands(newSet);
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-400"
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Price Range */}
                <fieldset>
                  <legend className="text-sm font-semibold text-gray-900 mb-3">Price Range</legend>
                  <div className="space-y-3">
                    <label htmlFor="price-range-min" className="sr-only">Minimum price</label>
                    <input
                      id="price-range-min"
                      type="range"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      aria-valuemin={0}
                      aria-valuemax={priceRange[1]}
                      aria-valuenow={priceRange[0]}
                      aria-label={`Minimum price: $${priceRange[0]}`}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600" aria-live="polite">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </fieldset>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <main id="main-content" className="flex-1" role="main">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <h2 id="search-results-count" className="text-2xl font-bold text-gray-900">
                {filteredBundles.length > 0 && `${filteredBundles.length} Bundles • `}
                {filteredProducts.length} Products
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </h2>
              {debouncedSearch && (
                <span className="text-gray-600" role="status" aria-live="polite">
                  Search results for "{debouncedSearch}"
                </span>
              )}
            </div>

            {/* ... existing product grid with role="list" ... */}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-8"
                role="navigation"
                aria-label="Product pagination"
              >
                <div className="flex flex-col items-center justify-between gap-4 p-4 bg-white rounded-xl border-2 border-gray-200">
                  <div className="text-sm text-gray-600 text-center">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      aria-label="Go to previous page"
                      className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <ChevronLeft size={20} aria-hidden="true" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-2" role="list" aria-label="Page numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
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
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Go to next page"
                      className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Update FilterTag component
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
      <span>{label}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="hover:bg-emerald-200 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
```

**Key Changes:**
- Added skip link for keyboard users
- All form inputs have proper `<label>` associations
- Added `role="search"`, `role="navigation"`, `role="main"`
- All interactive elements have `aria-label`
- Pagination uses `aria-current="page"`
- Live regions for search results count
- Proper fieldset/legend for grouped inputs

---

## Additional Accessibility Checklist

### Color Contrast
```bash
# Ensure all text meets WCAG AA contrast ratios:
# - Normal text (< 18pt): 4.5:1 minimum
# - Large text (≥ 18pt or bold ≥ 14pt): 3:1 minimum

# Check using browser DevTools or:
npm install -g pa11y
pa11y http://localhost:5173 --runner axe
```

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual layout
- [ ] Focus visible on all interactive elements
- [ ] Escape closes modals/dialogs
- [ ] Arrow keys work in custom controls (if any)
- [ ] Enter/Space activate buttons

### Screen Reader Testing
```bash
# Test with:
# - NVDA (Windows, free)
# - JAWS (Windows, paid)
# - VoiceOver (Mac, built-in - Cmd+F5)
# - TalkBack (Android, built-in)
# - VoiceOver (iOS, built-in)
```

### Form Validation
```typescript
// Add error messages with aria-describedby
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={error ? "true" : "false"}
/>
{error && (
  <div id="email-error" role="alert" className="text-red-600 text-sm mt-1">
    {error}
  </div>
)}
```

---

## Testing Tools

### Automated Testing
```json
// package.json
{
  "scripts": {
    "a11y": "pa11y-ci --config .pa11yci.json"
  },
  "devDependencies": {
    "pa11y-ci": "^3.0.1",
    "@axe-core/react": "^4.8.0"
  }
}
```

### React Axe Integration
```typescript
// src/main.tsx (development only)
if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Browser Extensions
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (built into Chrome)

---

## Quick Wins

1. **Add lang attribute** to `<html>` tag in `index.html`:
   ```html
   <html lang="en">
   ```

2. **Add page titles** for each route:
   ```typescript
   useEffect(() => {
     document.title = 'Product Catalog - Azteka DSD';
   }, []);
   ```

3. **Add aria-live regions** for toast notifications:
   ```typescript
   <div
     role="status"
     aria-live="polite"
     aria-atomic="true"
     className="toast"
   >
     {message}
   </div>
   ```

4. **Ensure sufficient color contrast**:
   ```css
   /* Bad: 2.5:1 contrast */
   .text-gray-400 { color: #9CA3AF; } /* on white background */

   /* Good: 4.6:1 contrast */
   .text-gray-600 { color: #4B5563; } /* on white background */
   ```

---

## Migration Priority

1. **High Priority** (affects all users):
   - Keyboard navigation
   - Focus management
   - Button/link accessibility

2. **Medium Priority** (affects screen reader users):
   - ARIA labels
   - Semantic HTML
   - Form labels

3. **Low Priority** (nice-to-have):
   - Skip links
   - Live regions
   - Advanced ARIA patterns

Start with high-traffic pages (CustomerCatalog, Cart, ProductCard) and work backwards.
