# Azteka DSD - Cart Flow Documentation

## Overview

This document defines the complete cart experience for the Azteka DSD wholesale ordering system, including current implementation, behavioral specifications, and future smart DSD enhancements.

---

## 1. Cart UX Interaction Model

### Slide-Up Drawer Behavior

#### Desktop/Tablet Experience

**Trigger**: Click "Cart" button in header navigation

**Animation**:
```tsx
// Fixed overlay with backdrop blur
<div className="fixed inset-0 z-50 overflow-hidden">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

  {/* Drawer - slides in from right */}
  <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
    {/* Cart content */}
  </div>
</div>
```

**Behavior**:
- **Entry**: Slides in from right with backdrop fade-in
- **Width**: `max-w-md` (448px) on desktop, full width on mobile
- **Height**: Full viewport height (`h-full`)
- **Z-index**: `z-50` to overlay all content
- **Backdrop**: Semi-transparent black with blur effect
- **Close actions**:
  1. Click X button in header
  2. Click backdrop overlay
  3. Press ESC key (future enhancement)

**Structure**:
```
┌─────────────────────────────────┐
│  [Icon] Your Cart         [X]   │ ← Header (gradient)
│  3 items                        │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Img] Product Name        │  │
│  │       $25.50 per case     │  │
│  │       [-] 3 [+]  $76.50   │  │ ← Scrollable
│  └───────────────────────────┘  │   items area
│                                 │
│  ┌───────────────────────────┐  │
│  │ [Img] Another Product     │  │
│  │       ...                 │  │
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  Subtotal:           $106.50    │ ← Footer
│  Total:              $106.50    │   (sticky)
│                                 │
│  [ Proceed to Checkout ]        │
└─────────────────────────────────┘
```

---

#### Mobile Experience

**Width**: Full screen (`w-full`)
**Behavior**: Same slide-in animation, but takes full width

**Mobile-Specific Considerations**:
- Larger touch targets (minimum 44x44px)
- Swipe-down to close (future enhancement)
- Bottom sheet alternative (future consideration)

---

### Sticky Cart Bar Logic

#### Current Implementation
No sticky cart bar - cart badge in header shows item count.

#### Future Enhancement: Floating Cart Bar

**Desktop Sticky Bar**:
```tsx
<div className="fixed bottom-4 right-4 z-40">
  <button className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all">
    <ShoppingCart size={24} />
    <span>{totalItems} items</span>
    <span className="border-l border-white/30 pl-3">${subtotal.toFixed(2)}</span>
  </button>
</div>
```

**Behavior**:
- Appears when cart has items
- Floats in bottom-right corner
- Shows: Item count + Subtotal
- Click to open drawer
- Pulse animation when item added

---

#### Mobile Sticky Bar

**Bottom Fixed Bar**:
```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 p-4 shadow-2xl">
  <div className="flex items-center justify-between mb-2">
    <span className="font-semibold text-gray-700">{totalItems} items</span>
    <span className="text-xl font-black text-gray-900">${subtotal.toFixed(2)}</span>
  </div>
  <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl">
    View Cart
  </button>
</div>
```

**Behavior**:
- Sticks to bottom of screen
- Full width
- Always visible when cart has items
- Tap to open drawer

---

### Quantity Control Logic

#### Current Implementation

**Inline Stepper** in cart items:
```tsx
<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
  {/* Decrease button */}
  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
    <Minus size={16} />
  </button>

  {/* Current quantity */}
  <span className="w-12 text-center font-bold">{item.quantity}</span>

  {/* Increase button */}
  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
    <Plus size={16} />
  </button>
</div>
```

**Rules**:
1. **Minimum**: 1 case (decreasing below 1 removes item)
2. **Maximum**: No hard limit (future: check inventory)
3. **Step**: Always 1 case at a time
4. **Validation**: Quantity must be positive integer

---

#### Future: Smart Quantity Controls

**Case Pack Awareness**:
```tsx
// Suggest case-level ordering
{item.min_order_quantity && (
  <div className="text-xs text-gray-600 mt-1">
    Min order: {item.min_order_quantity} cases
  </div>
)}

// Highlight optimal quantities
{item.quantity % item.suggested_pack_size !== 0 && (
  <div className="text-xs text-orange-600 mt-1">
    ⚠️ Consider ordering in packs of {item.suggested_pack_size}
  </div>
)}
```

**Quick Quantity Buttons**:
```tsx
<div className="flex gap-2 mt-2">
  <button onClick={() => setQuantity(5)}>5</button>
  <button onClick={() => setQuantity(10)}>10</button>
  <button onClick={() => setQuantity(20)}>20</button>
  <button onClick={() => setQuantity(50)}>50</button>
</div>
```

---

## 2. Smart DSD Logic (Future Enhancements)

### Case-Level Suggestions

**Problem**: Customers often order incorrect quantities that don't align with case packs or truck capacity.

**Solution**: AI-powered suggestions based on order history and truck optimization.

#### Suggested Quantity Algorithm

```typescript
interface SmartSuggestion {
  productId: string;
  currentQuantity: number;
  suggestedQuantity: number;
  reason: 'case_pack' | 'truck_fit' | 'volume_discount' | 'order_history';
  savings?: number;
}

function calculateSmartSuggestions(
  cart: CartItem[],
  orderHistory: Order[],
  truckCapacity: number
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  cart.forEach(item => {
    // Case pack optimization
    if (item.quantity % item.case_pack_size !== 0) {
      const roundedUp = Math.ceil(item.quantity / item.case_pack_size) * item.case_pack_size;
      suggestions.push({
        productId: item.id,
        currentQuantity: item.quantity,
        suggestedQuantity: roundedUp,
        reason: 'case_pack'
      });
    }

    // Historical ordering pattern
    const avgQuantity = getAverageQuantity(orderHistory, item.id);
    if (Math.abs(item.quantity - avgQuantity) > avgQuantity * 0.3) {
      suggestions.push({
        productId: item.id,
        currentQuantity: item.quantity,
        suggestedQuantity: Math.round(avgQuantity),
        reason: 'order_history'
      });
    }

    // Volume discount threshold
    if (item.price_breaks && item.quantity < item.price_breaks[0].min_quantity) {
      const nextTier = item.price_breaks[0];
      const savings = (item.price - nextTier.price) * nextTier.min_quantity;
      suggestions.push({
        productId: item.id,
        currentQuantity: item.quantity,
        suggestedQuantity: nextTier.min_quantity,
        reason: 'volume_discount',
        savings
      });
    }
  });

  return suggestions;
}
```

**UI Display**:
```tsx
{suggestions.map(suggestion => (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <Lightbulb size={16} className="text-blue-600" />
      <span className="text-sm font-semibold text-blue-900">Smart Suggestion</span>
    </div>
    <p className="text-sm text-blue-800">
      {suggestion.reason === 'case_pack' && 'Order in full cases for better pricing'}
      {suggestion.reason === 'truck_fit' && 'Optimize for truck capacity'}
      {suggestion.reason === 'volume_discount' && `Save $${suggestion.savings?.toFixed(2)} with bulk pricing`}
      {suggestion.reason === 'order_history' && 'Based on your typical order'}
    </p>
    <button
      onClick={() => updateQuantity(suggestion.productId, suggestion.suggestedQuantity)}
      className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-800"
    >
      Change to {suggestion.suggestedQuantity} cases →
    </button>
  </div>
))}
```

---

### Bundle Upsells

**When**: Item added to cart or during checkout

**Logic**:
```typescript
function findBundleOpportunities(cart: CartItem[], bundles: Bundle[]): Bundle[] {
  return bundles.filter(bundle => {
    // Check if customer has some but not all bundle items
    const bundleProductIds = bundle.items.map(i => i.productId);
    const cartProductIds = cart.map(c => c.id);

    const hasAny = bundleProductIds.some(id => cartProductIds.includes(id));
    const hasAll = bundleProductIds.every(id => cartProductIds.includes(id));

    // Show bundle if they have some items but not all
    return hasAny && !hasAll;
  }).sort((a, b) => b.discount_percent - a.discount_percent); // Sort by discount
}
```

**UI Display**:
```tsx
<div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-xl mb-4">
  <div className="flex items-center gap-2 mb-3">
    <Sparkles className="text-orange-500" />
    <h4 className="font-black text-gray-900">Complete the Bundle & Save!</h4>
  </div>

  <div className="bg-white rounded-lg p-3 mb-3">
    <p className="font-semibold text-gray-900 mb-2">{bundle.name}</p>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">You have: {ownedCount}/{totalCount} items</span>
      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
        {bundle.discount_percent}% OFF
      </span>
    </div>
    <div className="text-xs text-gray-600 mb-3">
      Still need: {missingItems.map(i => i.name).join(', ')}
    </div>
  </div>

  <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg">
    Add Missing Items - Save ${savings.toFixed(2)}
  </button>
</div>
```

---

### Seasonal Promotions

**Dynamic Promo Injection**: Based on date, customer segment, and cart contents.

```typescript
interface SeasonalPromo {
  id: string;
  name: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday';
  active_dates: { start: Date; end: Date };
  trigger: {
    min_cart_value?: number;
    required_categories?: string[];
    customer_segments?: string[];
  };
  offer: {
    type: 'percent_off' | 'free_shipping' | 'free_item' | 'bogo';
    value: number;
    free_product_id?: string;
  };
  message: string;
}

function getActivePromotions(
  cart: CartItem[],
  customer: Customer,
  today: Date
): SeasonalPromo[] {
  // Filter active promotions
  return promotions.filter(promo => {
    // Date check
    if (today < promo.active_dates.start || today > promo.active_dates.end) {
      return false;
    }

    // Cart value check
    if (promo.trigger.min_cart_value) {
      const cartValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (cartValue < promo.trigger.min_cart_value) return false;
    }

    // Category check
    if (promo.trigger.required_categories) {
      const hasRequiredCategory = cart.some(item =>
        promo.trigger.required_categories!.includes(item.category_id)
      );
      if (!hasRequiredCategory) return false;
    }

    // Customer segment check
    if (promo.trigger.customer_segments) {
      if (!promo.trigger.customer_segments.includes(customer.segment)) {
        return false;
      }
    }

    return true;
  });
}
```

**Cart Display**:
```tsx
{activePromotions.map(promo => (
  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Gift size={20} />
      <h4 className="font-bold">{promo.name}</h4>
    </div>
    <p className="text-sm text-white/90 mb-3">{promo.message}</p>

    {promo.offer.type === 'free_item' && (
      <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
        <img src={freeProduct.image_url} className="w-12 h-12 rounded" />
        <div className="flex-1">
          <p className="font-semibold text-sm">FREE {freeProduct.name}</p>
          <p className="text-xs text-white/80">Added to your order!</p>
        </div>
      </div>
    )}
  </div>
))}
```

---

### Competitor-Price Overrides

**Concept**: Dynamically match or beat competitor pricing for key customers.

```typescript
interface CompetitorPriceCheck {
  productId: string;
  ourPrice: number;
  competitorName: string;
  competitorPrice: number;
  matchPrice: boolean;
  override?: number; // Price to show customer
}

function checkCompetitorPricing(
  cart: CartItem[],
  customer: Customer
): CompetitorPriceCheck[] {
  // Only for high-value customers
  if (customer.tier !== 'platinum' && customer.tier !== 'gold') {
    return [];
  }

  return cart.map(item => {
    // Fetch competitor prices (from external service or database)
    const competitorPrice = getCompetitorPrice(item.sku, customer.region);

    if (competitorPrice && competitorPrice < item.price) {
      // Decision: Match or beat by 5%
      const matchPrice = competitorPrice;
      const beatPrice = competitorPrice * 0.95;

      return {
        productId: item.id,
        ourPrice: item.price,
        competitorName: competitorPrice.source,
        competitorPrice: competitorPrice.price,
        matchPrice: true,
        override: beatPrice
      };
    }

    return null;
  }).filter(Boolean);
}
```

**Cart Display**:
```tsx
{priceOverrides.map(override => (
  <div className="absolute top-2 right-2 z-10">
    <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
      PRICE MATCHED!
    </div>
  </div>
))}

{/* Show savings in cart total */}
<div className="flex justify-between text-sm text-green-600 font-semibold">
  <span>Price Match Savings</span>
  <span>-${totalSavings.toFixed(2)}</span>
</div>
```

---

### Order History Recommendations

**"Buy It Again"** feature with smart timing.

```typescript
interface ReorderRecommendation {
  product: Product;
  lastOrderDate: Date;
  averageDaysBetween: number;
  estimatedRunOutDate: Date;
  urgency: 'high' | 'medium' | 'low';
  suggestedQuantity: number;
}

function generateReorderRecommendations(
  orderHistory: Order[],
  customer: Customer,
  today: Date
): ReorderRecommendation[] {
  // Group orders by product
  const productOrders = groupOrdersByProduct(orderHistory);

  return Object.entries(productOrders).map(([productId, orders]) => {
    // Calculate average reorder frequency
    const daysBetween = orders.map((order, i) => {
      if (i === 0) return null;
      const prevOrder = orders[i - 1];
      return daysSince(prevOrder.created_at, order.created_at);
    }).filter(Boolean);

    const avgDaysBetween = average(daysBetween);
    const lastOrder = orders[orders.length - 1];
    const daysSinceLastOrder = daysSince(lastOrder.created_at, today);

    // Estimate when they'll run out
    const estimatedRunOutDate = addDays(lastOrder.created_at, avgDaysBetween);

    // Determine urgency
    let urgency: 'high' | 'medium' | 'low';
    if (today >= estimatedRunOutDate) {
      urgency = 'high';
    } else if (daysSinceLastOrder >= avgDaysBetween * 0.8) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    // Suggest average quantity
    const avgQuantity = average(orders.map(o => o.quantity));

    return {
      product: getProduct(productId),
      lastOrderDate: lastOrder.created_at,
      averageDaysBetween: avgDaysBetween,
      estimatedRunOutDate,
      urgency,
      suggestedQuantity: Math.round(avgQuantity)
    };
  }).filter(rec => rec.urgency !== 'low')
    .sort((a, b) => {
      // Sort by urgency
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
}
```

**UI Display**:
```tsx
<div className="mb-6 p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
    <Clock size={20} className="text-blue-600" />
    Time to Restock?
  </h3>

  {recommendations.map(rec => (
    <div key={rec.product.id} className="bg-white rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img src={rec.product.image_url} className="w-12 h-12 rounded" />
          <div>
            <p className="font-semibold text-sm">{rec.product.name}</p>
            <p className="text-xs text-gray-600">
              Last ordered {formatDate(rec.lastOrderDate)}
            </p>
          </div>
        </div>

        {rec.urgency === 'high' && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            Running Low!
          </span>
        )}
      </div>

      <button
        onClick={() => addToCart(rec.product, rec.suggestedQuantity)}
        className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg text-sm"
      >
        Add {rec.suggestedQuantity} Cases to Cart
      </button>
    </div>
  ))}
</div>
```

---

## 3. Behavioral Specs

### Mobile vs Tablet Differences

#### Mobile (< 768px)

**Cart Drawer**:
- Full screen width (`w-full`)
- Slide up from bottom (alternative to slide from right)
- Larger touch targets (48px minimum)
- Simplified quantity controls (larger buttons)

**Bottom Sticky Bar**:
- Always visible when cart has items
- Full width footer bar
- Shows item count + total
- Single tap to expand cart

**Checkout**:
- Single column form layout
- Autofocus on first field
- Keyboard-aware (form shifts up when keyboard appears)
- Larger input fields

---

#### Tablet (768px - 1024px)

**Cart Drawer**:
- Fixed width (`max-w-md`)
- Slide from right
- Standard touch targets (44px)
- Desktop-style quantity controls

**Floating Cart Button**:
- Bottom-right corner
- Shows count + subtotal
- Pulse animation on add

**Checkout**:
- Two-column form for wider fields
- Side-by-side inputs (name/email, city/state)

---

#### Desktop (> 1024px)

**Cart Drawer**:
- Fixed width (`max-w-md` = 448px)
- Right-aligned
- Hover states on all interactive elements
- Keyboard navigation support

**Floating Cart Widget**:
- Bottom-right corner
- Expandable on hover (show preview)
- Quick quantity adjust without opening full drawer

---

### Rep Workflow vs Customer Workflow

#### Customer Workflow

**Standard Flow**:
1. Browse catalog
2. Add items to cart (modal with bundle suggestions)
3. Review cart in drawer
4. Proceed to checkout
5. Enter delivery details
6. Place order
7. Receive confirmation

**Features**:
- Cart persists across sessions (localStorage)
- Reorder from history
- Bundle upsells
- Seasonal promotions auto-applied

---

#### Sales Rep Workflow

**Assisted Ordering** (Hand-off Mode):

1. Rep logs in with `?rep=CODE` URL
2. Browse catalog on behalf of customer
3. Add items to cart while discussing with customer
4. **Hand-off moment**: Give tablet/device to customer
5. Customer reviews cart
6. Customer enters their business details
7. Rep finalizes order
8. Order tied to both customer + rep

**Features**:
- Rep info displayed in header
- "Hand-off Mode" toggle
- Pre-fill customer info if returning customer
- Rep commission tracking (order.sales_rep_id)
- Bulk add capabilities

**Differences**:
```tsx
// Rep mode shows additional controls
{salesRepMode && (
  <div className="p-4 bg-cyan-100 border border-cyan-300 rounded-xl mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold text-cyan-900">Sales Rep: {rep.name}</span>
      <button onClick={toggleHandOff} className="text-sm font-bold text-cyan-700">
        {handOffMode ? 'Exit Hand-off' : 'Hand Off to Customer'}
      </button>
    </div>
  </div>
)}

// Bulk quantity controls for reps
<div className="flex gap-2 mt-2">
  <button onClick={() => setQuantity(10)}>10</button>
  <button onClick={() => setQuantity(25)}>25</button>
  <button onClick={() => setQuantity(50)}>50</button>
  <button onClick={() => setQuantity(100)}>100</button>
</div>
```

---

### How Cart Persists

#### Storage Strategy

**Primary**: `localStorage` with React Context

```typescript
const CART_STORAGE_KEY = 'azteka_cart';

// Save on every cart update
useEffect(() => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}, [cart]);

// Load on mount
useEffect(() => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}, []);
```

**Persistence Scope**:
- **Same browser, same device**: Cart persists across sessions
- **Different browser/device**: Cart does not sync (yet)
- **Cleared on**: Order completion (optional: keep for reference)

---

#### Future: Cloud-Synced Cart

```typescript
// Sync cart to user account
async function syncCartToCloud(cart: CartItem[], userId: string) {
  await fetch('/api/cart/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, cart })
  });
}

// Load cart from cloud on login
async function loadCartFromCloud(userId: string): Promise<CartItem[]> {
  const response = await fetch(`/api/cart/${userId}`);
  return response.json();
}

// Merge local and cloud cart
function mergeCart(localCart: CartItem[], cloudCart: CartItem[]): CartItem[] {
  const merged = [...cloudCart];

  localCart.forEach(localItem => {
    const existingIndex = merged.findIndex(item => item.id === localItem.id);

    if (existingIndex >= 0) {
      // Take max quantity
      merged[existingIndex].quantity = Math.max(
        merged[existingIndex].quantity,
        localItem.quantity
      );
    } else {
      merged.push(localItem);
    }
  });

  return merged;
}
```

---

### How Checkout Works

#### Flow Diagram

```
Cart (Review)
    ↓
Checkout Button Click
    ↓
Navigate to /checkout
    ↓
Render Checkout Component
    ↓
Show Order Summary (readonly cart items)
    ↓
Upsell Products Displayed (optional add to cart)
    ↓
Customer Info Form
  ├─ Business Name (required)
  ├─ Contact Name (required)
  ├─ Email (required)
  ├─ Phone (required)
  ├─ Address (required)
  ├─ City, State, ZIP (required)
  ├─ Delivery Date (optional)
  └─ Order Notes (optional)
    ↓
Form Validation
    ↓
Submit Button Click
    ↓
POST /api/orders
  ├─ Create Order record
  ├─ Create OrderItems
  ├─ Link to Customer
  └─ Link to Sales Rep (if present)
    ↓
Success Response
    ↓
Save Last Order (localStorage)
    ↓
Clear Cart
    ↓
Navigate to Order Confirmation
    ↓
Display: Order #, Customer Details, Delivery Info, Total
    ↓
"New Order" Button → Back to Catalog
```

---

#### Key Implementation Details

**Route Navigation**:
```tsx
// App.tsx routing
const handleCheckout = () => {
  setShowCart(false);
  navigate('/checkout'); // React Router
};
```

**Checkout Form State**:
```tsx
const [formData, setFormData] = useState<Customer>({
  business_name: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
});
```

**Order Submission**:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const orderPayload = {
    customer: {
      ...formData,
      sales_rep_id: salesRep?.id || null,
    },
    order: {
      order_number: `ORD-${Date.now()}`,
      sales_rep_id: salesRep?.id || null,
      status: 'pending',
      total: subtotal,
      notes: orderNotes,
      delivery_date: deliveryDate,
    },
    items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    })),
  };

  const response = await fetch('http://77.243.85.8:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });

  if (response.ok) {
    saveLastOrder({ items: cart, total: subtotal, orderNumber });
    clearCart();
    setViewMode('confirmation');
  }
};
```

**Payment Collection**:
- **Current**: "Payment collected on delivery"
- **Future**: Stripe integration, credit terms, invoicing

---

## 4. Integration Points

### ProductCard Integration

**Add to Cart Flow**:

1. User clicks "Add to Cart" button on ProductCard
2. ProductCard opens AddToCartModal
3. Modal shows:
   - Product details
   - Quantity selector
   - Bundle suggestions (if available)
4. User confirms quantity/bundle
5. Modal calls `onConfirm(items: Array<{ product, quantity }>)`
6. ProductCard calls `onAddToCart()` or `onAddMultiple()`
7. Cart context updates
8. Badge in header updates with item count
9. Toast/feedback animation (future)

**Code**:
```tsx
// ProductCard.tsx
const handleModalConfirm = (items: Array<{ product: Product; quantity: number }>) => {
  if (onAddMultiple && items.length > 1) {
    // Add bundle items
    onAddMultiple(items);
  } else if (items.length === 1) {
    // Add single item with quantity
    const item = items[0];
    for (let i = 0; i < item.quantity; i++) {
      onAddToCart(item.product);
    }
  }
};

// App.tsx
const addToCart = (product: Product, quantity: number = 1) => {
  addToCartContext(product, quantity);
  // Future: Show toast notification
};
```

---

### BundleCard Integration

**Bundle Add Flow**:

1. User clicks "Add Bundle" on BundleCard
2. All bundle items added to cart simultaneously
3. Bundle discount applied (via price override or promo code)
4. Cart opens automatically to show added items
5. Bundle badge shows in cart

**Code**:
```tsx
// BundleCard.tsx
const handleAddBundle = () => {
  const bundleItems = bundle.items.map(item => ({
    product: item.product,
    quantity: item.quantity,
  }));

  onAddMultiple(bundleItems);

  // Apply bundle discount
  applyBundleDiscount(bundle.id, bundle.discount_percent);

  // Open cart
  setShowCart(true);
};
```

**Future**: Bundle tracking in order
```typescript
interface OrderBundle {
  id: string;
  bundleId: string;
  orderId: string;
  discount_applied: number;
  items: OrderItem[];
}
```

---

### Checkout Page Integration

**Data Flow**:

```
Cart Context (CartProvider)
    ↓
Cart Items → Checkout Component
    ↓
Form Data Collection
    ↓
Order Payload Creation
    ↓
API POST /api/orders
    ↓
Order Confirmation
```

**Props Passed to Checkout**:
```tsx
<Checkout
  items={cart}                    // From CartContext
  salesRepId={salesRep?.id}       // From App state
  upsellProducts={upsellProducts} // Calculated in App
  onAddToCart={addToCart}         // Add upsell to cart
  onBack={() => navigate('/')}    // Back to catalog
  onComplete={handleCompleteOrder}// Submit order
/>
```

---

## 5. Future Enhancements

### Order Templates

**Concept**: Save frequently ordered item sets for one-click reordering.

```typescript
interface OrderTemplate {
  id: string;
  name: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  createdAt: Date;
  lastUsed?: Date;
}

// Save current cart as template
function saveAsTemplate(name: string, cart: CartItem[]) {
  const template: OrderTemplate = {
    id: uuid(),
    name,
    customerId: currentUser.customerId,
    items: cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
    })),
    createdAt: new Date(),
  };

  await saveTemplate(template);
}

// Load template into cart
function loadTemplate(templateId: string) {
  const template = getTemplate(templateId);
  const items = template.items.map(item => ({
    product: getProduct(item.productId),
    quantity: item.quantity,
  }));

  addMultipleToCart(items);
}
```

**UI**:
```tsx
<div className="mb-6">
  <h3 className="font-bold text-gray-900 mb-3">Your Templates</h3>
  <div className="grid gap-3">
    {templates.map(template => (
      <div key={template.id} className="border-2 border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{template.name}</h4>
          <span className="text-sm text-gray-600">
            {template.items.length} items
          </span>
        </div>
        <button
          onClick={() => loadTemplate(template.id)}
          className="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg"
        >
          Add to Cart
        </button>
      </div>
    ))}
  </div>
</div>
```

---

### Shelf/Reorder AI

**Concept**: Computer vision + AI to scan customer's shelf and suggest reorder.

```typescript
interface ShelfScanResult {
  productId: string;
  detectedQuantity: number;
  shelfCapacity: number;
  fillPercentage: number; // 0-100
  reorderSuggested: boolean;
  suggestedQuantity: number;
}

async function scanShelf(imageFile: File): Promise<ShelfScanResult[]> {
  // 1. Upload image
  const formData = new FormData();
  formData.append('image', imageFile);

  // 2. AI vision analysis
  const response = await fetch('/api/shelf/scan', {
    method: 'POST',
    body: formData,
  });

  const results: ShelfScanResult[] = await response.json();

  // 3. Calculate reorder suggestions
  return results.map(result => ({
    ...result,
    reorderSuggested: result.fillPercentage < 30,
    suggestedQuantity: Math.ceil(
      (result.shelfCapacity - result.detectedQuantity) / result.unitsPerCase
    ),
  }));
}
```

**UI Flow**:
1. Customer opens "Shelf Scan" feature
2. Takes photo of product shelf with phone/tablet camera
3. AI detects products and estimates quantity
4. Shows reorder suggestions
5. One-tap add to cart

---

### "Fill the Truck" Logic

**Concept**: Optimize order to maximize truck capacity and minimize delivery cost.

```typescript
interface TruckCapacity {
  maxWeight: number;      // lbs
  maxVolume: number;      // cubic feet
  maxPallets: number;
}

interface LoadOptimization {
  currentWeight: number;
  currentVolume: number;
  currentPallets: number;
  utilization: number;    // 0-100%
  remainingCapacity: {
    weight: number;
    volume: number;
    pallets: number;
  };
  suggestions: Array<{
    product: Product;
    quantity: number;
    reason: string;
  }>;
}

function optimizeTruckLoad(
  cart: CartItem[],
  truckCapacity: TruckCapacity
): LoadOptimization {
  // Calculate current load
  const currentWeight = cart.reduce(
    (sum, item) => sum + item.weight_per_case * item.quantity,
    0
  );
  const currentVolume = cart.reduce(
    (sum, item) => sum + item.volume_per_case * item.quantity,
    0
  );
  const currentPallets = cart.reduce(
    (sum, item) => sum + Math.ceil(item.quantity / item.cases_per_pallet),
    0
  );

  // Calculate utilization
  const utilization = Math.max(
    (currentWeight / truckCapacity.maxWeight) * 100,
    (currentVolume / truckCapacity.maxVolume) * 100,
    (currentPallets / truckCapacity.maxPallets) * 100
  );

  // Suggest products to fill remaining space
  const remainingWeight = truckCapacity.maxWeight - currentWeight;
  const remainingVolume = truckCapacity.maxVolume - currentVolume;

  const suggestions = findProductsToFillSpace(
    remainingWeight,
    remainingVolume,
    cart
  );

  return {
    currentWeight,
    currentVolume,
    currentPallets,
    utilization,
    remainingCapacity: {
      weight: remainingWeight,
      volume: remainingVolume,
      pallets: truckCapacity.maxPallets - currentPallets,
    },
    suggestions,
  };
}
```

**UI Display**:
```tsx
<div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl mb-4">
  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
    <Truck size={20} className="text-blue-600" />
    Truck Capacity
  </h3>

  {/* Progress bar */}
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-700">Space Used</span>
      <span className="font-bold text-blue-600">{utilization.toFixed(0)}%</span>
    </div>
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
        style={{ width: `${utilization}%` }}
      />
    </div>
  </div>

  {utilization < 85 && (
    <div>
      <p className="text-sm text-gray-700 mb-2">
        You have room for {remainingCapacity.weight.toFixed(0)} lbs more!
      </p>
      <p className="text-xs text-gray-600 mb-3">
        Consider adding these to maximize your delivery value:
      </p>

      <div className="space-y-2">
        {suggestions.slice(0, 3).map(suggestion => (
          <button
            key={suggestion.product.id}
            onClick={() => addToCart(suggestion.product, suggestion.quantity)}
            className="w-full flex items-center justify-between bg-white rounded-lg p-2 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <img src={suggestion.product.image_url} className="w-10 h-10 rounded" />
              <span className="text-sm font-semibold">{suggestion.product.name}</span>
            </div>
            <span className="text-xs text-blue-600 font-bold">
              +{suggestion.quantity} cases
            </span>
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

---

### "Running Low" Alerts

**Concept**: Proactive notifications when customers are likely running low on products.

```typescript
interface RunningLowAlert {
  product: Product;
  lastOrderDate: Date;
  estimatedDaysRemaining: number;
  alertLevel: 'critical' | 'warning' | 'info';
  suggestedReorderDate: Date;
}

function detectRunningLowProducts(
  orderHistory: Order[],
  today: Date
): RunningLowAlert[] {
  // Group by product
  const productOrders = groupOrdersByProduct(orderHistory);

  return Object.entries(productOrders).map(([productId, orders]) => {
    // Calculate consumption rate
    const avgDaysBetween = calculateAverageDaysBetweenOrders(orders);
    const lastOrder = orders[orders.length - 1];
    const daysSinceLastOrder = daysSince(lastOrder.created_at, today);

    // Estimate days remaining
    const estimatedDaysRemaining = avgDaysBetween - daysSinceLastOrder;

    // Determine alert level
    let alertLevel: 'critical' | 'warning' | 'info';
    if (estimatedDaysRemaining <= 0) {
      alertLevel = 'critical';
    } else if (estimatedDaysRemaining <= 7) {
      alertLevel = 'warning';
    } else {
      alertLevel = 'info';
    }

    return {
      product: getProduct(productId),
      lastOrderDate: lastOrder.created_at,
      estimatedDaysRemaining,
      alertLevel,
      suggestedReorderDate: addDays(lastOrder.created_at, avgDaysBetween - 7),
    };
  }).filter(alert => alert.alertLevel !== 'info');
}
```

**UI Display**:
```tsx
{runningLowAlerts.length > 0 && (
  <div className="mb-6 p-4 border-2 border-red-200 rounded-xl bg-red-50">
    <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
      <AlertTriangle size={20} className="text-red-600" />
      Running Low Alert
    </h3>

    {runningLowAlerts.map(alert => (
      <div
        key={alert.product.id}
        className={`bg-white rounded-lg p-3 mb-2 border-l-4 ${
          alert.alertLevel === 'critical'
            ? 'border-red-500'
            : 'border-orange-500'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img src={alert.product.image_url} className="w-12 h-12 rounded" />
            <div>
              <p className="font-semibold text-sm">{alert.product.name}</p>
              <p className="text-xs text-gray-600">
                {alert.alertLevel === 'critical'
                  ? 'Should have ordered already!'
                  : `Estimated ${alert.estimatedDaysRemaining} days remaining`}
              </p>
            </div>
          </div>

          {alert.alertLevel === 'critical' && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              URGENT
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(alert.product, getAverageQuantity(alert.product.id))}
          className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg text-sm"
        >
          Reorder Now
        </button>
      </div>
    ))}
  </div>
)}
```

---

## Summary

This document provides a comprehensive specification for the cart flow in Azteka DSD, including:

✅ **Current Implementation**: Drawer behavior, quantity controls, persistence
✅ **Smart DSD Features**: AI-powered suggestions, bundle upsells, seasonal promos
✅ **Platform Differences**: Mobile, tablet, desktop optimizations
✅ **User Workflows**: Customer vs Sales Rep experiences
✅ **Integration Points**: ProductCard, BundleCard, Checkout
✅ **Future Enhancements**: Templates, shelf scan, truck optimization, alerts

**Next Steps**:
1. Implement sticky cart bar (mobile + desktop)
2. Add toast notifications for cart actions
3. Build order template system
4. Integrate AI reorder suggestions
5. Implement truck capacity optimizer
