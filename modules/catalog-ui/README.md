# Catalog UI Module

Professional catalog interface for Azteka DSD sales representatives and customers.

## 📁 Structure

```
modules/catalog-ui/
├── components/          # Reusable UI components
│   ├── HeroBanner.tsx      # Hero banners with gradients, CTAs, animated GIFs
│   ├── ProductGrid.tsx     # Responsive product grid (1-4 columns) with animations
│   ├── BrandRow.tsx        # Horizontal scrollable brand selector
│   ├── BundleSection.tsx   # Bundle deals with savings display
│   └── FloatingCartButton.tsx  # Sticky cart button with item count
├── pages/              # Full page implementations
│   ├── salesrep.tsx        # Galaxy Tab S9 FE fullscreen catalog
│   └── customer.tsx        # Mobile catalog + multi-store ordering
├── context/            # State management
│   └── CartContext.tsx     # Cart state with localStorage persistence
├── lib/               # API client utilities
│   └── api.ts             # Fetch wrappers for products, brands, categories, orders
└── index.ts           # Module exports
```

## 🚀 Features

### Sales Rep Catalog (`salesrep.tsx`)
- **Optimized for Galaxy Tab S9 FE** (fullscreen, 2-column grid)
- Hero banner with promotional content
- Search bar with real-time filtering
- Category tabs for quick navigation
- Brand row with logo display and product counts
- Product grid with quantity selectors
- Add to cart functionality
- Floating cart button with item count and total

### Customer Mobile Catalog (`customer.tsx`)
- **Lightweight mobile-first design** (1-column grid)
- Search and filter products
- Regular ordering mode (single-store)
- **Multi-store ordering mode** (Carlos mode):
  - Matrix view: products as rows, stores as columns
  - Quantity input cells for each product × store combination
  - Row totals and order summary
  - Submit separate orders for each store

### Shared Components
- **ProductGrid**: Responsive grid with Framer Motion animations, quantity controls
- **BrandRow**: Horizontal scroll with snap, brand logos, selection state
- **BundleSection**: Display bundle deals with savings calculations
- **FloatingCartButton**: Sticky cart UI with mini preview on hover
- **HeroBanner**: Hero sections with images, gradients, CTAs, animated GIF support

## 🔗 API Integration

### Endpoints Used
- `GET /api/products` - Fetch products (with optional filters: segment, category, brand, search)
- `GET /api/brands` - Fetch all brands
- `GET /api/categories` - Fetch all categories
- `GET /api/stores` - Fetch stores for multi-store mode
- `POST /api/orders` - Submit orders

### Data Flow
1. Pages fetch data via `lib/api.ts` wrappers
2. Products enhanced with brandName from brand lookup
3. Cart state managed via CartContext (localStorage persistence)
4. Orders submitted with items, totalAmount, optional notes

## 📦 Installation

### 1. Install Dependencies
```bash
npm install framer-motion
# Already have: react, react-dom, tailwindcss
```

### 2. Wrap App with CartProvider
```tsx
import { CartProvider } from './modules/catalog-ui';

function App() {
  return (
    <CartProvider>
      {/* Your app */}
    </CartProvider>
  );
}
```

### 3. Import Pages
```tsx
import { SalesRepCatalog, CustomerCatalog } from './modules/catalog-ui';

// Sales Rep page
<Route path="/catalog/salesrep" element={<SalesRepCatalog />} />

// Customer page
<Route path="/catalog/customer" element={<CustomerCatalog />} />
```

### 4. Set API Base URL
Create `.env` or `.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
# Production:
# VITE_API_BASE_URL=https://aztekafoods.com/api
```

## 🎨 Styling

Uses Tailwind CSS with custom classes:
- Gradients: `from-orange-500 to-red-500`, `from-purple-600 to-pink-600`
- Shadows: `shadow-lg`, `shadow-2xl`
- Animations: Framer Motion with staggered entrance (0.05s delay per item)
- Responsive: `md:grid-cols-2`, `lg:grid-cols-3`
- Scroll: `overflow-x-auto scrollbar-hide`, `scroll-snap-type: x mandatory`

## 🛠 Development

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Test catalog endpoints
```bash
# Check products
curl http://localhost:3000/api/products | jq

# Check brands
curl http://localhost:3000/api/brands | jq

# Check categories
curl http://localhost:3000/api/categories | jq
```

## 📱 Device Optimization

### Sales Rep (Galaxy Tab S9 FE)
- **Screen**: 10.9" (2304x1440)
- **Layout**: 2-column grid, fullscreen hero
- **Features**: Advanced filters, bundle deals, search
- **Use Case**: In-store selling, customer presentations

### Customer Mobile
- **Screen**: Standard mobile phones
- **Layout**: Single column, compact header
- **Features**: Quick search, multi-store ordering
- **Use Case**: Remote ordering, bulk orders for multiple locations

## 🔐 Authentication

Cart and orders work with or without authentication:
- **Logged in**: Orders associated with customer ID
- **Guest**: Anonymous orders (requires customer info at checkout)

Pass JWT token to order submission:
```ts
await submitOrder(orderData, authToken);
```

## 🚧 TODO

- [ ] Add bundle endpoint (`GET /api/catalog/bundles`)
- [ ] Implement cart page/modal for detailed cart management
- [ ] Add product detail modal/page
- [ ] Implement order history view
- [ ] Add image lazy loading with intersection observer
- [ ] Implement virtual scrolling for large product lists
- [ ] Add service worker for offline catalog browsing
- [ ] Create skeleton loading states
- [ ] Add unit tests for components and API wrappers

## 📄 License

Part of Azteka DSD MVP project.
