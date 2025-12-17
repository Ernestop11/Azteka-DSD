# Azteka DSD - Frontend Structure

## Overview

The frontend is a **React 18 + TypeScript** single-page application (SPA) built with **Vite**. It uses **React Router v7** for routing and **Tailwind CSS** for styling.

**Important**: There is NO `/app` folder using Next.js App Router. The project uses Vite + React Router instead.

---

## Project Structure

```
/Users/ernestoponce/dev/azteka-dsd/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   ├── types.ts                # TypeScript type definitions
│   │
│   ├── components/             # React components
│   │   ├── Hero.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── ProductCard.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── CatalogGrid.tsx
│   │   ├── BulkOrderSheet.tsx
│   │   ├── OrderHistory.tsx
│   │   ├── BundleShowcase.tsx
│   │   ├── ProductBillboard.tsx
│   │   ├── SpecialOffers.tsx
│   │   ├── RewardsPanel.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── AdminNavbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── customer/
│   │       ├── CartItem.tsx
│   │       └── BundleCard.tsx
│   │
│   ├── contexts/               # React Context providers
│   │   └── CartContext.tsx     # Cart state management
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── apiClient.ts        # API fetch wrapper
│   │   ├── orders.ts           # Order utilities
│   │   ├── print.ts            # Print utilities
│   │   └── socket.ts           # Socket.IO client
│   │
│   ├── pages/                  # Page components (future router migration)
│   │   └── (empty for now)
│   │
│   └── api/                    # Backend API routes (not frontend)
│       └── (server-side only)
│
├── public/                     # Static assets
│   ├── product-placeholder.svg
│   └── (other static files)
│
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── tsconfig.json               # TypeScript configuration
```

---

## Routing Structure

### Current Router Setup

**File**: `src/main.tsx`

```tsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);
```

### Routes Defined in App.tsx

```tsx
// Route handling in App.tsx
useEffect(() => {
  if (location.pathname === '/checkout') {
    setViewMode('checkout');
  } else if (location.pathname === '/catalog' || location.pathname === '/') {
    setViewMode('catalog');
  }
}, [location.pathname]);
```

### Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Catalog View | Main product catalog |
| `/catalog` | Catalog View | Same as home |
| `/checkout` | Checkout | Order checkout flow |
| `/admin` | Admin Dashboard | Admin panel (link only) |
| `/fulfillment` | Fulfillment | Warehouse view (link only) |
| `/salesrep` | Sales Rep | Sales rep dashboard (link only) |

**Note**: Admin, Fulfillment, and Sales Rep routes are navigation links but not yet implemented as full components.

---

## Component Architecture

### Main Application Component

**File**: `src/App.tsx`

**Responsibilities**:
- Route management
- Data fetching (products, categories, brands)
- Global state coordination
- View mode switching (catalog, checkout, confirmation)
- Real-time updates via Socket.IO

**Key State**:
```tsx
const [categories, setCategories] = useState<Category[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [brands, setBrands] = useState<Brand[]>([]);
const [cart, addToCart, removeFromCart, updateQuantity] = useCart();
const [viewMode, setViewMode] = useState<ViewMode>('catalog');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

---

## Catalog UI Structure

### 1. Hero Section

**Component**: `src/components/Hero.tsx`

**Purpose**: Large banner at top of catalog

**Features**:
- Eye-catching hero image
- Call-to-action buttons
- Featured messaging
- Responsive layout

**Example Usage**:
```tsx
<Hero />
```

---

### 2. Category Navigation

**Component**: `src/components/CategoryTabs.tsx`

**Purpose**: Filter products by category

**Props**:
```tsx
interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  productCounts: Record<string, number>;
}
```

**Features**:
- Horizontal scrolling tabs
- Product count per category
- "All" option to clear filter
- Active state styling

**Usage**:
```tsx
<CategoryTabs
  categories={categories}
  selectedCategory={selectedCategory}
  onSelectCategory={setSelectedCategory}
  productCounts={productCounts}
/>
```

---

### 3. Product Display

#### ProductCard Component

**File**: `src/components/ProductCard.tsx`

**Purpose**: Individual product card in grid

**Props**:
```tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onAddMultiple?: (items: Array<{ product: Product; quantity: number }>) => void;
  promotion?: Promotion;
}
```

**Features**:
- Product image with fallback
- Product name and SKU
- Price display (per case)
- Add to cart button
- Quantity selector
- Promotion badge overlay
- Stock status indicator

**Visual Structure**:
```
┌─────────────────────┐
│   Product Image     │ ← Background color from product data
│     + Badge         │ ← Optional promotion badge
├─────────────────────┤
│ Product Name        │
│ SKU: ABC-123        │
│                     │
│ $25.50/case         │
│ 12 units per case   │
│                     │
│ [  -  ] [ 1 ] [ + ] │ ← Quantity selector
│                     │
│ [ Add to Cart ]     │
└─────────────────────┘
```

---

#### CatalogGrid Component

**File**: `src/components/CatalogGrid.tsx`

**Purpose**: Advanced grid layout with filtering and multi-select

**Props**:
```tsx
interface CatalogGridProps {
  products: Product[];
  brands: Brand[];
  categories: CategoryWithSubcategories[];
  onAddToCart: (product: Product, quantity: number) => void;
  onAddMultiple: (items: Array<{ product: Product; quantity: number }>) => void;
}
```

**Features**:
- Sidebar filtering (category, brand, subcategory)
- Search functionality
- Grid/list view toggle
- Bulk selection mode
- Multi-product add to cart
- Responsive columns (1-4 based on screen size)

**Layout**:
```
┌────────────┬────────────────────────────────────┐
│  Filters   │  Product Grid                      │
│            │                                    │
│ Categories │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ • All      │  │ P1 │ │ P2 │ │ P3 │ │ P4 │      │
│ • Snacks   │  └────┘ └────┘ └────┘ └────┘      │
│ • Drinks   │                                    │
│            │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ Brands     │  │ P5 │ │ P6 │ │ P7 │ │ P8 │      │
│ ☐ Herdez   │  └────┘ └────┘ └────┘ └────┘      │
│ ☐ Jumex    │                                    │
│            │  [Showing 24 of 156 products]      │
└────────────┴────────────────────────────────────┘
```

---

### 4. Product Bundles

**Component**: `src/components/BundleShowcase.tsx`

**Purpose**: Display pre-configured product bundles

**Props**:
```tsx
interface BundleShowcaseProps {
  bundles: Bundle[];
  onSelectBundle: (bundleId: string) => void;
}
```

**Features**:
- Horizontal scrolling carousel
- Bundle image, name, description
- Discount badge
- "View Bundle" action

**Bundle Structure**:
```tsx
interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  badge_text: string;      // e.g., "20% OFF"
  badge_color: string;     // e.g., "red"
  discount_percent: number;
}
```

---

### 5. Featured Products

**Component**: `src/components/ProductBillboard.tsx`

**Purpose**: Highlight featured/popular products

**Props**:
```tsx
interface ProductBillboardProps {
  products: Product[];
  title: string;
  subtitle: string;
  onAddToCart: (product: Product, quantity: number) => void;
}
```

**Features**:
- Large product images
- Attention-grabbing layout
- "Featured" or custom badges
- Direct add-to-cart

**Usage**:
```tsx
<ProductBillboard
  products={products.filter(p => p.featured).slice(0, 4)}
  title="Featured Products"
  subtitle="Our most popular wholesale items this month"
  onAddToCart={addToCart}
/>
```

---

### 6. Special Offers

**Component**: `src/components/SpecialOffers.tsx`

**Purpose**: Display time-sensitive promotions

**Props**:
```tsx
interface SpecialOffersProps {
  offers: SpecialOffer[];
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  badge_text: string;
  badge_color: string;
  icon_type: string;
  expires_at: string;
}
```

**Features**:
- Countdown timer
- Urgency indicators
- Click to view details

---

## Cart State Management

### CartContext

**File**: `src/contexts/CartContext.tsx`

**Pattern**: React Context API with localStorage persistence

**State Shape**:
```tsx
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addMultipleToCart: (items: Array<{ product: Product; quantity: number }>) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}
```

### Cart Item Structure
```tsx
interface CartItem extends Product {
  quantity: number;
}
```

### Persistence Strategy

**Storage Key**: `'azteka_cart'`

**Persistence Flow**:
```
Component Action
    ↓
Cart Context State Update
    ↓
useEffect Hook Triggered
    ↓
localStorage.setItem('azteka_cart', JSON.stringify(cart))
```

**Load on Mount**:
```tsx
useEffect(() => {
  const savedCart = localStorage.getItem('azteka_cart');
  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }
}, []);
```

### Cart Operations

#### Add to Cart
```tsx
const addToCart = (product: Product, quantity: number = 1) => {
  setCart((prevCart) => {
    const existing = prevCart.find(item => item.id === product.id);

    if (existing) {
      // Update quantity
      return prevCart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item
      return [...prevCart, { ...product, quantity }];
    }
  });
};
```

#### Update Quantity
```tsx
const updateQuantity = (productId: string, quantity: number) => {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  setCart(prevCart =>
    prevCart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
  );
};
```

#### Calculate Totals
```tsx
const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
```

---

## Cart UI Components

### Cart Sidebar

**Component**: `src/components/Cart.tsx`

**Purpose**: Slide-out cart panel

**Props**:
```tsx
interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}
```

**Features**:
- Item list with thumbnails
- Quantity adjustment
- Remove item button
- Subtotal calculation
- "Proceed to Checkout" button
- Empty cart state

**Layout**:
```
┌─────────────────────────────────┐
│  Shopping Cart          [ X ]   │
├─────────────────────────────────┤
│                                 │
│  ┌─────┐  Product Name          │
│  │ IMG │  $25.50 × 3             │
│  └─────┘  [ - ] 3 [ + ]  [Del]  │
│                                 │
│  ┌─────┐  Another Product       │
│  │ IMG │  $15.00 × 2             │
│  └─────┘  [ - ] 2 [ + ]  [Del]  │
│                                 │
├─────────────────────────────────┤
│  Subtotal:           $106.50    │
│                                 │
│  [ Proceed to Checkout ]        │
└─────────────────────────────────┘
```

---

### Bulk Order Sheet

**Component**: `src/components/BulkOrderSheet.tsx`

**Purpose**: Multi-store ordering interface

**Props**:
```tsx
interface BulkOrderSheetProps {
  products: Product[];
  stores: Array<{ id: string; store_name: string }>;
  onSubmitOrders: (orders: Record<string, Record<string, number>>) => void;
  onClose: () => void;
}
```

**Features**:
- Grid layout: Products × Stores
- Quick quantity entry
- Row/column totals
- Batch add to cart

**Layout**:
```
┌──────────────┬────────┬────────┬────────┐
│ Product      │ Store1 │ Store2 │ Store3 │
├──────────────┼────────┼────────┼────────┤
│ Salsa Verde  │   5    │   3    │   2    │
│ Chips        │   10   │   8    │   12   │
│ Beans        │   6    │   4    │   5    │
├──────────────┼────────┼────────┼────────┤
│ Total Cases  │   21   │   15   │   19   │
└──────────────┴────────┴────────┴────────┘
```

---

## Navigation

### Header Navigation

**Location**: `App.tsx:462-581`

**Main Navigation Buttons**:

1. **Catalog Toggle** - Switch between hero and grid views
2. **Admin** - Navigate to `/admin`
3. **Bulk Order** - Open bulk order sheet modal
4. **Order History** - View past orders and reorder
5. **Rewards** - Show loyalty points and badges
6. **Cart** - Open cart sidebar with item count badge
7. **Fulfillment** - Navigate to `/fulfillment`
8. **Sales Rep** (conditional) - Navigate to `/salesrep`

**Sales Rep Mode**:
- Shows when `?rep=CODE` query parameter present
- Enables "Hand Off Mode" for assisted ordering
- Displays sales rep info in header

---

## Checkout Flow

### Checkout Component

**Component**: `src/components/Checkout.tsx`

**Props**:
```tsx
interface CheckoutProps {
  items: CartItem[];
  salesRepId?: string;
  upsellProducts: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
  onComplete: (customer: Customer, orderData: any) => void;
}
```

**Steps**:
1. Review order items
2. Enter customer information
3. Add delivery notes (optional)
4. Select delivery date (optional)
5. View upsell products
6. Submit order

**Customer Information Form**:
```tsx
interface Customer {
  store_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}
```

---

### Order Confirmation

**Component**: `src/components/OrderConfirmation.tsx`

**Props**:
```tsx
interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryDate?: string;
  total: number;
  onNewOrder: () => void;
}
```

**Features**:
- Order number display
- Customer details summary
- Delivery information
- Total amount
- "Start New Order" button
- Print/email receipt options (future)

---

## Order History

**Component**: `src/components/OrderHistory.tsx`

**Props**:
```tsx
interface OrderHistoryProps {
  orders: Order[];
  onReorder: (items: CartItem[]) => void;
  onClose: () => void;
}
```

**Features**:
- List of previous orders
- Order details (items, date, total)
- Quick reorder button
- Order status display

**Reorder Functionality**:
```tsx
const handleReorder = (items: CartItem[]) => {
  items.forEach(item => addToCart(item));
  setShowOrderHistory(false);
  setShowCart(true);
};
```

---

## Rewards System

**Component**: `src/components/RewardsPanel.tsx`

**Props**:
```tsx
interface RewardsPanelProps {
  pointsBalance: number;
  tier: string;           // 'bronze', 'silver', 'gold', 'platinum'
  badges: Badge[];
  onClose: () => void;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  color: string;
  reward_description: string;
  earned: boolean;
}
```

**Features**:
- Points balance display
- Membership tier indicator
- Earned badges showcase
- Progress to next tier
- Rewards redemption (future)

---

## Utility Libraries

### API Client

**File**: `src/lib/apiClient.ts`

**Function**: `fetchFromAPI<T>(endpoint: string): Promise<T[]>`

**Purpose**: Centralized API calls with error handling

**Usage**:
```tsx
const products = await fetchFromAPI<Product>('products');
const categories = await fetchFromAPI<Category>('categories');
```

**Implementation**:
```tsx
export async function fetchFromAPI<T>(endpoint: string): Promise<T[]> {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const response = await fetch(`${apiBase}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

---

## Real-time Updates

### Socket.IO Integration

**Setup** in `App.tsx:177-200`:

```tsx
useEffect(() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const socketUrl = apiUrl.replace('/api', '');
  const socket = io(socketUrl);

  socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO server');
  });

  socket.on('products-updated', () => {
    console.log('📡 Products updated, refreshing catalog...');
    loadData();
  });

  return () => socket.disconnect();
}, []);
```

**Events Handled**:
- `products-updated` - Refresh product catalog
- Future: `order-status-changed`, `inventory-updated`

---

## Styling Approach

### Tailwind CSS

**Configuration**: `tailwind.config.js`

**Custom Theme**:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#10b981',    // Emerald
          secondary: '#14b8a6',  // Teal
        }
      }
    }
  }
}
```

### Component Styling Patterns

**Cards**:
```tsx
className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
```

**Buttons**:
```tsx
className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600
           text-white font-bold rounded-xl shadow-lg
           hover:shadow-xl transform hover:scale-105 transition-all"
```

**Badges**:
```tsx
className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white
           text-xs font-bold rounded-full"
```

---

## TypeScript Types

**File**: `src/types.ts`

**Core Types**:
```tsx
interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;           // price_case
  image_url?: string;
  category_id: string;
  brand_id?: string;
  units_per_case: number;
  in_stock: boolean;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  display_order: number;
}

interface CartItem extends Product {
  quantity: number;
}
```

---

## Future Frontend Improvements

1. **Migrate to React Router v7 Pages**
   - Move to file-based routing
   - Create dedicated page components
   - Improve code splitting

2. **State Management Upgrade**
   - Consider Zustand or Redux Toolkit
   - Centralize all app state
   - Add optimistic updates

3. **Performance Optimization**
   - Implement React.lazy() for code splitting
   - Add virtual scrolling for large product lists
   - Optimize image loading with progressive images

4. **Mobile Experience**
   - Bottom navigation for mobile
   - Swipe gestures
   - Mobile-specific layouts

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

6. **Testing**
   - Unit tests with Vitest
   - Component tests with React Testing Library
   - E2E tests with Playwright
