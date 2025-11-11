import { useState, useEffect } from 'react';
import { ShoppingCart as ShoppingCartIcon, Package, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockProducts, mockCategories } from './lib/mockData';
import Hero from './components/Hero';
import CategoryTabs from './components/CategoryTabs';
import ProductCard from './components/ProductCard';
import ProductBillboard from './components/ProductBillboard';
import BundleShowcase from './components/BundleShowcase';
import SpecialOffers from './components/SpecialOffers';
import BulkOrderSheet from './components/BulkOrderSheet';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { Product, Category, CartItem } from './types';

// Transform API data (camelCase) to component format (snake_case for ProductCard)
function transformProduct(apiProduct: any): Product & {
  image_url?: string;
  background_color?: string;
  in_stock: boolean;
  units_per_case: number;
  unit_type: string;
} {
  return {
    // Original camelCase (for TypeScript Product type)
    id: apiProduct.id,
    name: apiProduct.name,
    sku: apiProduct.sku,
    description: apiProduct.description || '',
    price: typeof apiProduct.price === 'number' ? apiProduct.price : parseFloat(apiProduct.price) || 0,
    cost: apiProduct.cost,
    margin: apiProduct.margin,
    imageUrl: apiProduct.imageUrl || apiProduct.image_url || '',
    inStock: apiProduct.inStock !== undefined ? Boolean(apiProduct.inStock) : true,
    stock: typeof apiProduct.stock === 'number' ? apiProduct.stock : parseInt(apiProduct.stock) || 0,
    minStock: apiProduct.minStock || 0,
    supplier: apiProduct.supplier || '',
    featured: Boolean(apiProduct.featured),
    unitType: apiProduct.unitType || apiProduct.unit_type || 'case',
    unitsPerCase: typeof apiProduct.unitsPerCase === 'number' ? apiProduct.unitsPerCase : parseInt(apiProduct.unitsPerCase) || 1,
    minOrderQty: apiProduct.minOrderQty || 1,
    backgroundColor: apiProduct.backgroundColor || apiProduct.background_color || '#f3f4f6',
    categoryId: apiProduct.categoryId,
    brandId: apiProduct.brandId,
    subcategoryId: apiProduct.subcategoryId,

    // Add snake_case versions for ProductCard component
    image_url: apiProduct.imageUrl || apiProduct.image_url || '',
    background_color: apiProduct.backgroundColor || apiProduct.background_color || '#f3f4f6',
    in_stock: apiProduct.inStock !== undefined ? Boolean(apiProduct.inStock) : true,
    units_per_case: typeof apiProduct.unitsPerCase === 'number' ? apiProduct.unitsPerCase : parseInt(apiProduct.unitsPerCase) || 1,
    unit_type: apiProduct.unitType || apiProduct.unit_type || 'case',
  };
}

type ViewMode = 'catalog' | 'bulk-order' | 'cart' | 'checkout';

export default function App() {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 500));

      const transformedProducts = mockProducts.map(transformProduct);
      setProducts(transformedProducts);
      setCategories(mockCategories);

      console.log(`Successfully loaded ${transformedProducts.length} products`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Cart functions
  function handleAddToCart(product: Product) {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    console.log('Added to cart:', product.name);
  }

  function handleUpdateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }

  function handleRemoveFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  function handleClearCart() {
    setCart([]);
  }

  // Bulk order functions
  function handleSubmitBulkOrders(orders: Record<string, Record<string, number>>) {
    console.log('Bulk orders submitted:', orders);
    // TODO: Send to API
    alert('Bulk orders submitted! (Check console for details)');
    setViewMode('catalog');
  }

  // Checkout functions
  function handleCheckout() {
    setViewMode('checkout');
  }

  function handlePlaceOrder(orderData: any) {
    console.log('Order placed:', orderData);
    // TODO: Send to API
    alert('Order placed successfully!');
    setCart([]);
    setViewMode('catalog');
  }

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === selectedCategory);

  const featuredProducts = products.filter(p => p.featured);

  // Calculate product counts per category
  const productCounts = products.reduce((acc, product) => {
    if (product.categoryId) {
      acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Catalog...</h2>
          <p className="text-gray-600 mt-2">Fetching products from database</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6">The catalog is currently empty</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-lg"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Render Checkout view
  if (viewMode === 'checkout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Checkout
          items={cart}
          onComplete={(customer, orderData) => {
            handlePlaceOrder({ customer, orderData, items: cart });
          }}
          onAddToCart={handleAddToCart}
          onBack={() => setViewMode('cart')}
        />
      </div>
    );
  }

  // Render Bulk Order Sheet view
  if (viewMode === 'bulk-order') {
    return (
      <BulkOrderSheet
        products={products as any}
        stores={[
          { id: '1', store_name: 'Store 1' },
          { id: '2', store_name: 'Store 2' },
          { id: '3', store_name: 'Store 3' },
        ]}
        onSubmitOrders={handleSubmitBulkOrders}
        onClose={() => setViewMode('catalog')}
      />
    );
  }

  // Main catalog view
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header with Navigation */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                🏪 Azteka DSD Catalog
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Premium wholesale products • {products.length} items
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Admin Button */}
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-lg hover:from-gray-800 hover:to-black transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Settings className="w-5 h-5" />
                <span>Admin</span>
              </button>

              {/* Bulk Order Button */}
              <button
                onClick={() => setViewMode('bulk-order')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Package className="w-5 h-5" />
                <span>Bulk Order</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setViewMode('cart')}
                className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Modal */}
      {viewMode === 'cart' && (
        <Cart
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          onClose={() => setViewMode('catalog')}
        />
      )}

      {/* Hero Section */}
      <Hero />

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory === 'all' ? null : selectedCategory}
            onSelectCategory={(categoryId) => setSelectedCategory(categoryId || 'all')}
            productCounts={productCounts}
          />
        </div>
      )}

      {/* Featured Products Billboard */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductBillboard
            products={featuredProducts.slice(0, 3) as any}
            title="Featured Products"
            subtitle="Hand-picked selections just for you"
            onAddToCart={handleAddToCart}
          />
        </div>
      )}

      {/* Special Offers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SpecialOffers
          offers={[
            {
              id: '1',
              title: 'New Customer Discount',
              description: 'Get 10% off your first order!',
              badge_text: '10% OFF',
              badge_color: '#10b981',
              icon_type: 'sparkles',
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              title: 'Free Shipping',
              description: 'On orders over $500',
              badge_text: 'FREE',
              badge_color: '#3b82f6',
              icon_type: 'truck',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]}
        />
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
          </h2>
          <p className="text-gray-600 mt-1">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product as any}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>

      {/* Bundle Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BundleShowcase
          bundles={[
            {
              id: '1',
              name: 'Starter Bundle',
              description: 'Perfect for new customers',
              image_url: '',
              badge_text: 'Save 15%',
              badge_color: '#10b981',
              discount_percent: 15
            },
            {
              id: '2',
              name: 'Best Seller Bundle',
              description: 'Our most popular items',
              image_url: '',
              badge_text: 'Save 20%',
              badge_color: '#f59e0b',
              discount_percent: 20
            }
          ]}
          onSelectBundle={(bundle) => console.log('Selected bundle:', bundle)}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              ✅ Azteka DSD Catalog • {products.length} Products • Beautiful Bolt Design
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Cart: {cartItemCount} items • Total: ${cartTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
