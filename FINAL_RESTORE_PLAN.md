# Final Restore Plan: Catalog + Cart + Keep Inventory

## Summary
- ✅ **Cart functionality is already working** - uses `useCart()` hook
- ✅ **ProductCard has add to cart** - both in CatalogContent and components/catalog/ProductCard
- ✅ **Inventory page is fixed** - keep as-is with image fixes
- ⚠️ **Need to verify CartProvider wraps catalog**

## Current Status

### Cart System ✅
- `store/cart.ts` - Zustand store working
- `context/CartContext.tsx` - Context wrapper working
- `hooks/useCart.ts` - Hook working
- `app/catalog/CatalogContent.tsx` - Uses `useCart()` ✅

### ProductCard Components ✅
1. **CatalogContent ProductCard** (inline) - Has `onAddToCart` prop ✅
2. **components/catalog/ProductCard.tsx** - Uses `useCartStore().addItem()` ✅

### Inventory Page ✅
- Fixed with proper image handling
- Keep as-is

## Action Plan

### Step 1: Verify CartProvider Setup
Check if `components/Providers.tsx` includes `CartProvider`

### Step 2: Ensure Cart Works
The catalog already has:
```typescript
const { add, items, updateQty, remove, totals, getCartCount } = useCart()
const handleAddToCart = (product: CatalogProduct, quantity: number) => {
  add({
    id: product.id,
    name: product.name,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    imageUrl: product.imageUrl || '/placeholder-product.png',
    quantity,
  })
}
```

### Step 3: Keep Inventory As-Is
The inventory page (`app/employee/inventory/page.tsx`) is already fixed with:
- Image z-index fixes
- `getPublicImageUrl()` helper
- HEIC support
- Upload button fixes

## Conclusion
**No restore needed!** The current system already has:
1. ✅ Working cart functionality
2. ✅ ProductCard add to cart
3. ✅ Fixed inventory page

We just need to verify CartProvider is wrapping the app.


