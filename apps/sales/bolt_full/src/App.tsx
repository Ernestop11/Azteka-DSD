import { useEffect, useState } from 'react';
import { ShoppingCart, Store, Award, History, Grid3x3, LayoutDashboard } from 'lucide-react';
import { supabase, Category, Product, CartItem, Customer, SalesRep, Brand, Subcategory } from './lib/supabase';
import Hero from './components/Hero';
import CategoryTabs from './components/CategoryTabs';
import ProductCard from './components/ProductCard';
import CatalogGrid from './components/CatalogGrid';
import BundleShowcase from './components/BundleShowcase';
import ProductBillboard from './components/ProductBillboard';
import SpecialOffers from './components/SpecialOffers';
import RewardsPanel from './components/RewardsPanel';
import OrderHistory from './components/OrderHistory';
import BulkOrderSheet from './components/BulkOrderSheet';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';

type ViewMode = 'catalog' | 'checkout' | 'confirmation';

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  badge_text: string;
  badge_color: string;
  discount_percent: number;
}

interface Promotion {
  id: string;
  badge_text: string;
  badge_color: string;
  icon_type: string;
  points: number;
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

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  color: string;
  reward_description: string;
  earned?: boolean;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showCatalogMode, setShowCatalogMode] = useState(false);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [productPromotions, setProductPromotions] = useState<Record<string, Promotion>>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showBulkOrder, setShowBulkOrder] = useState(false);
  const [showAdminDash, setShowAdminDash] = useState(false);
  const [stores, setStores] = useState([
    { id: '1', store_name: 'Downtown Location' },
    { id: '2', store_name: 'North Plaza' },
    { id: '3', store_name: 'West Side Market' },
    { id: '4', store_name: 'East End Store' },
    { id: '5', store_name: 'South Branch' },
    { id: '6', store_name: 'Central Hub' },
    { id: '7', store_name: 'Lakeside' },
    { id: '8', store_name: 'Mountain View' },
    { id: '9', store_name: 'Riverside' },
    { id: '10', store_name: 'Sunset Boulevard' },
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber: string;
    customer: Customer;
    total: number;
    deliveryDate?: string;
  } | null>(null);
  const [salesRep, setSalesRep] = useState<SalesRep | null>(null);
  const [rewardsPoints, setRewardsPoints] = useState(1250);
  const [memberTier, setMemberTier] = useState('bronze');
  const [previousOrders, setPreviousOrders] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    checkSalesRepLink();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory]);

  const checkSalesRepLink = async () => {
    const params = new URLSearchParams(window.location.search);
    const repCode = params.get('rep');

    if (repCode) {
      const { data } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('unique_link_code', repCode)
        .eq('active', true)
        .maybeSingle();

      if (data) {
        setSalesRep(data);
      }
    }
  };

  const loadData = async () => {
    const [categoriesRes, productsRes, bundlesRes, promotionsRes, offersRes, badgesRes, brandsRes, subcategoriesRes] =
      await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('products').select('*').eq('in_stock', true),
        supabase.from('product_bundles').select('*'),
        supabase.from('promotions').select('*').eq('active', true),
        supabase.from('special_offers').select('*').eq('active', true),
        supabase.from('rewards_badges').select('*').eq('active', true),
        supabase.from('brands').select('*').order('display_order'),
        supabase.from('subcategories').select('*').order('display_order'),
      ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    if (bundlesRes.data) setBundles(bundlesRes.data);
    if (offersRes.data) setSpecialOffers(offersRes.data);
    if (brandsRes.data) setBrands(brandsRes.data);
    if (subcategoriesRes.data) setSubcategories(subcategoriesRes.data);
    if (badgesRes.data) {
      const badgesWithEarned = badgesRes.data.map((badge, idx) => ({
        ...badge,
        earned: idx < 2,
      }));
      setBadges(badgesWithEarned);
    }
    if (promotionsRes.data) {
      setPromotions(promotionsRes.data);
      loadProductPromotions(promotionsRes.data);
    }
  };

  const loadProductPromotions = async (promos: Promotion[]) => {
    const { data } = await supabase
      .from('product_promotions')
      .select('product_id, promotion_id');

    if (data) {
      const mapping: Record<string, Promotion> = {};
      data.forEach((pp) => {
        const promo = promos.find((p) => p.id === pp.promotion_id);
        if (promo) {
          mapping[pp.product_id] = promo;
        }
      });
      setProductPromotions(mapping);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    setShowCart(false);
    setViewMode('checkout');
  };

  const handleReorder = (items: CartItem[]) => {
    items.forEach((item) => addToCart(item));
    setShowOrderHistory(false);
  };

  const handleBulkOrderSubmit = (orders: Record<string, Record<string, number>>) => {
    let totalItems = 0;
    Object.values(orders).forEach(storeQtys => {
      Object.entries(storeQtys).forEach(([productId, qty]) => {
        if (qty > 0) {
          const product = products.find(p => p.id === productId);
          if (product) {
            addToCart(product);
            totalItems += qty;
          }
        }
      });
    });
    setShowBulkOrder(false);
    setShowCart(true);
  };

  const handleCompleteOrder = async (
    customer: Customer,
    orderData: { notes?: string; delivery_date?: string }
  ) => {
    const orderNumber = `ORD-${Date.now()}`;
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: customerData } = await supabase
      .from('customers')
      .insert({
        ...customer,
        sales_rep_id: salesRep?.id || null,
      })
      .select()
      .single();

    if (customerData) {
      const { data: orderData_ } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customerData.id,
          sales_rep_id: salesRep?.id || null,
          status: 'pending',
          subtotal,
          total: subtotal,
          notes: orderData.notes,
          delivery_date: orderData.delivery_date,
        })
        .select()
        .single();

      if (orderData_) {
        const orderItems = cart.map((item) => ({
          order_id: orderData_.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        }));

        await supabase.from('order_items').insert(orderItems);

        const earnedPoints = Math.floor(subtotal);
        setRewardsPoints(rewardsPoints + earnedPoints);

        setOrderDetails({
          orderNumber,
          customer,
          total: subtotal,
          deliveryDate: orderData.delivery_date,
        });

        setCart([]);
        setViewMode('confirmation');
      }
    }
  };

  const handleNewOrder = () => {
    setOrderDetails(null);
    setViewMode('catalog');
    setSelectedCategory(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getProductCountByCategory = (categoryId: string) => {
    return products.filter((p) => p.category_id === categoryId).length;
  };

  const productCounts = categories.reduce((acc, cat) => {
    acc[cat.id] = getProductCountByCategory(cat.id);
    return acc;
  }, {} as Record<string, number>);

  const upsellProducts = products.filter((p) => p.featured && !cart.find((item) => item.id === p.id)).slice(0, 3);

  if (viewMode === 'confirmation' && orderDetails) {
    return (
      <OrderConfirmation
        orderNumber={orderDetails.orderNumber}
        customerName={orderDetails.customer.contact_name}
        customerEmail={orderDetails.customer.email}
        customerPhone={orderDetails.customer.phone}
        deliveryAddress={`${orderDetails.customer.address}, ${orderDetails.customer.city}, ${orderDetails.customer.state} ${orderDetails.customer.zip_code}`}
        deliveryDate={orderDetails.deliveryDate}
        total={orderDetails.total}
        onNewOrder={handleNewOrder}
      />
    );
  }

  if (viewMode === 'checkout') {
    return (
      <Checkout
        items={cart}
        salesRepId={salesRep?.id}
        upsellProducts={upsellProducts}
        onAddToCart={addToCart}
        onBack={() => {
          setViewMode('catalog');
          setShowCart(true);
        }}
        onComplete={handleCompleteOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mexican Wholesale</h1>
                <p className="text-sm text-gray-600">Premium B2B Products</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {salesRep && (
                <div className="hidden md:block px-4 py-2 bg-emerald-100 border-2 border-emerald-300 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600">Your Sales Rep</p>
                  <p className="text-sm font-bold text-gray-900">{salesRep.name}</p>
                </div>
              )}

              <button
                onClick={() => setShowCatalogMode(!showCatalogMode)}
                className={`px-4 py-2 font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
                  showCatalogMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Store size={20} />
                <span className="hidden sm:inline">Catalog</span>
              </button>

              <button
                onClick={() => setShowAdminDash(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Admin</span>
              </button>

              <button
                onClick={() => setShowBulkOrder(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 animate-pulse"
              >
                <Grid3x3 size={20} />
                <span className="hidden sm:inline">Bulk Order</span>
              </button>

              <button
                onClick={() => setShowOrderHistory(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <History size={20} />
                <span className="hidden sm:inline">Orders</span>
              </button>

              <button
                onClick={() => setShowRewards(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Award size={20} />
                <span className="hidden sm:inline">{rewardsPoints} pts</span>
              </button>

              <button
                onClick={() => setShowCart(true)}
                className="relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  <span className="hidden sm:inline">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {!showCatalogMode && <Hero />}

      {!showCatalogMode && (
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          productCounts={productCounts}
        />
      )}

      {showCatalogMode ? (
        <div className="h-[calc(100vh-80px)]">
          <CatalogGrid
            products={products}
            brands={brands}
            categories={categories.map(cat => ({
              ...cat,
              subcategories: subcategories.filter(sub => sub.category_id === cat.id)
            }))}
            onAddToCart={addToCart}
            onQuickView={(product) => addToCart(product)}
          />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-12">
        {!selectedCategory && (
          <>
            <SpecialOffers offers={specialOffers} />

            <BundleShowcase bundles={bundles} onSelectBundle={() => {}} />

            <ProductBillboard
              products={products.filter((p) => p.featured).slice(0, 4)}
              title="Featured Products"
              subtitle="Our most popular wholesale items this month"
              onAddToCart={addToCart}
            />

            <div className="mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-2">All Products</h2>
              <p className="text-gray-600 text-lg mb-8">Browse our complete catalog</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    promotion={productPromotions[product.id]}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {selectedCategory && (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-black text-gray-900 mb-2">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600 text-lg">
                {filteredProducts.length} products available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  promotion={productPromotions[product.id]}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No products found in this category</p>
              </div>
            )}
          </>
        )}
        </main>
      )}

      {showCart && (
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          onClose={() => setShowCart(false)}
        />
      )}

      {showRewards && (
        <RewardsPanel
          pointsBalance={rewardsPoints}
          tier={memberTier}
          badges={badges}
          onClose={() => setShowRewards(false)}
        />
      )}

      {showOrderHistory && (
        <OrderHistory
          orders={previousOrders}
          onReorder={handleReorder}
          onClose={() => setShowOrderHistory(false)}
        />
      )}

      {showBulkOrder && (
        <BulkOrderSheet
          products={products}
          stores={stores}
          onSubmitOrders={handleBulkOrderSubmit}
          onClose={() => setShowBulkOrder(false)}
        />
      )}
    </div>
  );
}
