# Catalog UI - Quick Reference

**Status**: ✅ Production Ready  
**Module**: `/modules/catalog-ui`

---

## 🚀 Quick Start

### 1. Basic Setup

```tsx
import { CartProvider, ErrorBoundary } from '@/modules/catalog-ui';

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        {/* Your app */}
      </CartProvider>
    </ErrorBoundary>
  );
}
```

### 2. Initialize Service Worker

```tsx
import { initializeServiceWorker } from '@/modules/catalog-ui';

// In main.tsx after React render
initializeServiceWorker();
```

---

## 📦 Available Components

### Pages
- `SalesRepCatalog` - Tablet-optimized catalog
- `CustomerCatalog` - Mobile catalog with multi-store
- `OrderConfirmation` - Order success screen

### Core Components
- `HeroBanner` - Hero section with CTA
- `ProductGrid` - Product listing
- `BrandRow` - Horizontal brand scroll
- `BundleSection` - Bundle deals
- `FloatingCartButton` - Cart indicator
- `CartDrawer` - Slide-up cart UI

### Skeleton Loaders
- `HeroSkeleton`, `ProductGridSkeleton`, `BrandRowSkeleton`
- `BundleSectionSkeleton`, `SearchBarSkeleton`, `CategoryTabsSkeleton`
- `SalesRepSkeleton`, `CustomerSkeleton`

### Error States
- `ErrorState` - Generic error with retry
- `EmptyState` - No results
- `SectionError` - Partial failures
- `NetworkError` - Connection issues
- `ErrorBoundary` - React crash protection
- `OfflineIndicator` - Network status

---

## 🎨 Common Patterns

### Loading State

```tsx
if (loading) return <ProductGridSkeleton columns={3} count={6} />;
if (error) return <ErrorState title="Error" message={error.message} onRetry={refetch} />;
return <ProductGrid products={products} />;
```

### Cart Management

```tsx
const cart = useCart();

// Add item
cart.addItem(product, quantity);

// Update quantity
cart.updateQuantity(productId, newQuantity);

// Remove item
cart.removeItem(productId);

// Get totals
const itemCount = cart.getTotalItems();
const total = cart.getTotalPrice();
```

### Cart Drawer

```tsx
const [cartOpen, setCartOpen] = useState(false);

<CartDrawer
  isOpen={cartOpen}
  onClose={() => setCartOpen(false)}
  onCheckout={handleCheckout}
/>
```

### Pricing

```tsx
import { formatPrice, getBundlePricing, getSavingsBadge } from '@/modules/catalog-ui';

const pricing = getBundlePricing(100, 75);
// { originalPrice: 100, bundlePrice: 75, savings: 25, savingsPercent: 25 }

const badge = getSavingsBadge(pricing.savingsPercent);
// { type: 'savings', label: '25% OFF', color: 'green', value: '25' }

const formatted = formatPrice(75.99); // "$75.99"
```

---

## 🔧 API Functions

```tsx
import { fetchProducts, fetchBrands, submitOrder } from '@/modules/catalog-ui';

// Fetch data
const products = await fetchProducts(categoryId?, brandId?);
const brands = await fetchBrands();
const categories = await fetchCategories();

// Submit order
const order = await submitOrder(storeId, items, customerId);
```

---

## 🛠️ Service Worker

```tsx
import {
  registerServiceWorker,
  getServiceWorkerStatus,
  clearServiceWorkerCache,
  isOffline,
} from '@/modules/catalog-ui';

// Check status
const status = await getServiceWorkerStatus();

// Clear cache
await clearServiceWorkerCache();

// Check network
if (isOffline()) {
  console.log('App is offline');
}
```

---

## 📁 File Structure

```
modules/catalog-ui/
├── pages/
│   ├── salesrep.tsx           # Tablet catalog
│   ├── customer.tsx           # Mobile catalog
│   └── order-confirmation.tsx # Order success
├── components/
│   ├── HeroBanner.tsx         # Hero section
│   ├── ProductGrid.tsx        # Product listing
│   ├── BrandRow.tsx           # Brand scroll
│   ├── BundleSection.tsx      # Bundle deals
│   ├── FloatingCartButton.tsx # Cart button
│   ├── CartDrawer.tsx         # Cart UI
│   ├── Skeletons.tsx          # Loading states
│   └── ErrorStates.tsx        # Error handling
├── context/
│   └── CartContext.tsx        # Cart state
├── lib/
│   ├── api.ts                 # API client
│   ├── pricing.ts             # Pricing utils
│   └── serviceWorkerHelper.ts # SW utilities
├── service-worker.js          # Offline caching
└── index.ts                   # Module exports
```

---

## 🎯 Key Features

- ✅ **Full API Integration** - Live backend connection
- ✅ **Cart Management** - Add, update, remove items
- ✅ **Order Flow** - Checkout to confirmation
- ✅ **Loading States** - Skeleton loaders
- ✅ **Error Handling** - Graceful degradation
- ✅ **Offline Mode** - Service worker caching
- ✅ **Bundle Pricing** - Discount calculations
- ✅ **Responsive** - Tablet + mobile optimized
- ✅ **Animations** - Framer Motion
- ✅ **TypeScript** - Full type safety
- ✅ **Accessibility** - ARIA labels, keyboard nav

---

## 📚 Documentation

- **CATALOG_FINALIZATION.md** - Complete production guide
- **PRODUCTION_COMPLETE.md** - Completion summary
- **CATALOG_UI_COMPLETE.md** - Phase 1 wiring docs
- **README.md** - Module overview

---

## 🚨 Important Notes

1. **CartProvider Required** - Wrap app with `<CartProvider>`
2. **Service Worker** - Copy `service-worker.js` to public root
3. **API Configuration** - Set `API_BASE_URL` environment variable
4. **HTTPS Required** - Service worker needs HTTPS (or localhost)
5. **localStorage** - Cart uses localStorage for persistence

---

## 💡 Quick Tips

### Debug Cart Issues
```tsx
const cart = useCart();
console.log('Cart items:', cart.items);
console.log('Total:', cart.getTotalPrice());
```

### Test Offline Mode
1. Open DevTools → Network tab
2. Set to "Offline"
3. Reload page
4. Navigate catalog (should work from cache)

### Clear Cache
```tsx
import { clearServiceWorkerCache } from '@/modules/catalog-ui';
await clearServiceWorkerCache();
window.location.reload();
```

### Check Service Worker
```tsx
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
});
```

---

**Status**: ✅ **PRODUCTION READY**  
**Last Updated**: January 2025

