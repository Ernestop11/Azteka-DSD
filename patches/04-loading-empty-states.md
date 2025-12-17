# Patch 04: Loading & Empty States

## Overview
This patch adds proper loading states, skeleton screens, and informative empty states across all components to improve perceived performance and user experience.

## Loading State Patterns

### 1. Spinner (For quick actions < 2s)
```tsx
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
</div>
```

### 2. Skeleton Screen (For content loading > 2s)
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-full"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### 3. Inline Spinner (For button loading states)
```tsx
<button disabled className="...">
  <Loader2 className="animate-spin" size={18} />
  <span>Processing...</span>
</button>
```

## Files to Modify

### 1. src/pages/customer/CustomerCatalog.tsx

**Issue:** Generic "Loading..." text, no skeleton screen

**Fix:**
```typescript
// Line 416-425: Replace loading state
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Line 703-717: Enhance empty state
{filteredProducts.length === 0 && (
  <div className="text-center py-20">
    <div className="mb-6">
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="text-gray-400" size={48} />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {searchQuery
        ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
        : 'Try adjusting your filters to see more products.'
      }
    </p>
    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 inline-flex items-center gap-2"
      >
        <X size={18} />
        Clear All Filters
      </button>
    )}
  </div>
)}
```

**Reason:** Skeleton screens reduce perceived loading time, empty states guide users to action

---

### 2. src/components/Cart.tsx

**Issue:** No loading state when cart operations are processing, empty state lacks visual appeal

**Fix:**
```typescript
// Add loading state prop
interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
  isLoading?: boolean; // NEW
}

export default function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout, onClose, isLoading = false }: CartProps) {
  // ...

  // Line 39-48: Enhance empty state
  {items.length === 0 ? (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full flex items-center justify-center">
            <ShoppingBag size={64} className="text-emerald-300" />
          </div>
          <div className="absolute -bottom-2 -right-2 left-0 right-0 mx-auto w-fit">
            <div className="bg-white rounded-full px-4 py-1 shadow-lg border-2 border-gray-100">
              <span className="text-xs font-bold text-gray-500">Empty</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Start adding products to build your order. Wholesale deals await!
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Browse Catalog
        </button>
      </div>
    </div>
  ) : (
    <>
      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-200"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          items.map((item) => (
            // Existing cart item render
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 p-6 bg-gray-50 space-y-4">
        {/* ... */}
        <button
          onClick={onCheckout}
          disabled={isLoading}
          aria-label="Proceed to checkout"
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-emerald-300 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Processing...</span>
            </>
          ) : (
            'Proceed to Checkout'
          )}
        </button>
      </div>
    </>
  )}
}
```

**Reason:** Loading skeleton prevents layout shift, enhanced empty state encourages action

---

### 3. src/pages/admin/BundleEditor.tsx

**Issue:** Basic "Loading..." text, no save button loading state

**Fix:**
```typescript
// Add loading state
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false); // NEW

// Line 125-177: Add loading state to save handler
const handleSave = async () => {
  if (!formData.name || formData.items.length === 0) {
    setError('Bundle name and at least one product are required');
    return;
  }

  try {
    setSaving(true); // Start loading
    setError(null);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const bundlePrice = calculateBundlePrice();

    const payload = {
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId || null,
      discountPercent: formData.discountPercent,
      price: bundlePrice,
      items: formData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    const response = await fetch(`${apiBase}/admin/bundles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create bundle');
    }

    // Reset form on success
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      discountPercent: 0,
      price: 0,
      items: [],
    });

    // Show success toast (consider adding toast library)
    alert('✅ Bundle created successfully!');
  } catch (err: any) {
    setError(err.message || 'Failed to save bundle');
    console.error(err);
  } finally {
    setSaving(false); // Stop loading
  }
};

// Line 179-185: Enhance loading state
if (loading) {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>

            <div className="h-40 bg-gray-200 rounded"></div>

            <div className="h-12 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Line 358-367: Add loading state to save button
<button
  type="button"
  onClick={handleSave}
  disabled={!formData.name || formData.items.length === 0 || saving}
  aria-label={saving ? 'Creating bundle...' : 'Create bundle'}
  className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-lg flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-300"
>
  {saving ? (
    <>
      <Loader2 className="animate-spin" size={18} />
      <span>Creating...</span>
    </>
  ) : (
    <>
      <Save size={18} aria-hidden="true" />
      <span>Create Bundle</span>
    </>
  )}
</button>
```

**Reason:** Prevents double-submission, provides feedback during async operations

---

### 4. src/pages/SalesRepDashboard.tsx

**Issue:** No loading state, empty badges state could be more engaging

**Fix:**
```typescript
// Add loading state
const [stats, setStats] = useState<LeaderEntry | null>(null);
const [loading, setLoading] = useState(true); // NEW
const [toast, setToast] = useState<string | null>(null);

useEffect(() => {
  const load = async () => {
    try {
      setLoading(true); // Start loading
      const res = await fetch(`${API_BASE}/api/gamification/leaderboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = (await res.json()) as LeaderboardResponse;
        const current = data.sales.find((entry) => entry.userId === user?.id) || null;
        setStats(current);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  if (user) load();
}, [token, user]);

// Add loading skeleton
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </section>
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-24"></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// Line 92-105: Enhance empty badges state
<section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
  <h2 className="text-xl font-black text-gray-900 mb-4">Badges</h2>
  <div className="flex flex-wrap gap-3">
    {stats?.badges?.length ? (
      stats.badges.map((badge) => (
        <span
          key={badge.id}
          className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2"
        >
          <Award size={14} />
          {badge.name}
        </span>
      ))
    ) : (
      <div className="w-full text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Trophy className="text-gray-300" size={40} />
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">No badges yet</p>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Keep selling to unlock rewards and climb the leaderboard!
        </p>
      </div>
    )}
  </div>
</section>
```

**Reason:** Skeleton matches final layout, empty state motivates action

---

### 5. src/components/BundleShowcase.tsx

**Issue:** Component silently returns null if no bundles, no loading state

**Fix:**
```typescript
interface BundleShowcaseProps {
  bundles: Bundle[];
  onSelectBundle: (bundle: Bundle) => void;
  isLoading?: boolean; // NEW
}

export default function BundleShowcase({ bundles, onSelectBundle, isLoading = false }: BundleShowcaseProps) {
  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="mb-12 sm:mb-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state instead of returning null
  if (bundles.length === 0) {
    return (
      <div className="mb-12 sm:mb-16">
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No bundles available</h3>
          <p className="text-sm text-gray-600">
            Check back later for special bundle deals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 sm:mb-16">
      {/* Existing bundle showcase */}
    </div>
  );
}
```

**Reason:** Informs users when content is loading vs. when it's genuinely empty

---

## Create Reusable Loading Components

### src/components/ui/LoadingSpinner.tsx

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'gray';
}

export default function LoadingSpinner({ size = 'md', color = 'emerald' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const colors = {
    emerald: 'border-emerald-600 border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div className={`animate-spin rounded-full ${sizes[size]} ${colors[color]}`}
         role="status"
         aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

### src/components/ui/EmptyState.tsx

```typescript
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="text-gray-400" size={48} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

Usage:
```typescript
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

<EmptyState
  icon={ShoppingBag}
  title="Your cart is empty"
  description="Add products to get started with your wholesale order"
  action={{ label: 'Browse Catalog', onClick: () => navigate('/catalog') }}
/>
```

---

## Testing Checklist

- [ ] All data fetches show loading states
- [ ] Loading states match final content layout (skeleton screens)
- [ ] Empty states are informative and actionable
- [ ] Loading spinners have `role="status"` and `aria-label`
- [ ] Buttons show loading state during async operations
- [ ] Multiple rapid clicks don't trigger duplicate requests
- [ ] Error states are handled gracefully (not covered in this patch)

## Performance Notes

- Use skeleton screens for loads > 2 seconds
- Use spinners for quick actions < 2 seconds
- Debounce user input to reduce loading states
- Consider optimistic UI updates for better perceived performance
