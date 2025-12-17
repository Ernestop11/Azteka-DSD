# Schema Refactor Summary

## Changes Applied

### 1. Product Model: `priceCase` → `price`
- **API Routes**: Updated `app/api/admin/products/route.ts`
  - POST: Changed `priceCase` to `price` with validation
  - PUT: Changed `priceCase` to `price` with validation
  - Added runtime guards for missing category/brand (now optional)
  
- **Admin UI Components**:
  - `app/admin/products/ProductEditor.tsx`: Updated interface and form fields
  - `app/admin/products/ProductTable.tsx`: Updated interface and display logic
  - Added null-safe guards for category/brand display

- **Cart System**:
  - `store/cart.ts`: Changed `CartItem.priceCase` to `CartItem.price`
  - `components/CartItemRow.tsx`: Updated price display
  - `components/ProductCard.tsx`: Updated add to cart logic
  - `lib/calculateOrderTotal.ts`: Updated calculation functions

### 2. Category & Brand Relations
- Made `categoryId` and `brandId` optional in Product model (nullable)
- Updated all components to handle null category/brand gracefully
- Added runtime guards: `product.category?.name || '—'`
- Updated ProductEditor to allow "No category" and "No brand" options

### 3. Runtime Guards Added
- **ProductTable**: Safe access to `product.category?.name` and `product.brand?.name`
- **ProductEditor**: Handles both `categoryId` and `category.id` for backward compatibility
- **Price calculations**: All use `(item.price || 0)` for null safety
- **Type safety**: Updated interfaces to reflect nullable relations

### 4. Schema Notes
- **OrderItem.priceCase**: Kept as-is (historical pricing at order time)
- **CustomerPriceOverride.priceCase**: Kept as-is (override pricing)
- **Product.price**: New field (current pricing)

## Files Modified

### Core API
- `app/api/admin/products/route.ts` - Full refactor to use `price`

### Admin UI
- `app/admin/products/ProductEditor.tsx` - Form fields and validation
- `app/admin/products/ProductTable.tsx` - Display and sorting

### Cart System
- `store/cart.ts` - Cart store interface
- `components/CartItemRow.tsx` - Cart item display
- `components/ProductCard.tsx` - Add to cart logic
- `lib/calculateOrderTotal.ts` - Price calculations

## Breaking Changes
- **Cart localStorage**: Existing carts with `priceCase` will need migration or will default to 0
- **API contracts**: POST/PUT `/api/admin/products` now expects `price` instead of `priceCase`

## Migration Notes
- Products without categories/brands are now supported (nullable relations)
- Price validation ensures positive numbers only
- All price displays use `.toFixed(2)` for consistency

## Testing Checklist
- [ ] Admin product creation with price
- [ ] Admin product editing
- [ ] Product table display with null category/brand
- [ ] Add to cart functionality
- [ ] Cart calculations
- [ ] Cart persistence (localStorage)

