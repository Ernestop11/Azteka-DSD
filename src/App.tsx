import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart, Store, Award, History, Grid3x3, LayoutDashboard } from 'lucide-react';
import { Category, Product, CartItem, Customer, SalesRep, Brand, Subcategory } from './types';
import OrdersService, { CreateOrderPayload, OrderResponse } from './lib/orders';
import { fetchFromAPI } from './lib/apiClient';
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
import AdminOrders from './pages/AdminOrders';
import PurchaseOrders from './pages/PurchaseOrders';
import InvoiceUpload from './pages/InvoiceUpload';
import AiInsights from './pages/AiInsights';
import AutomationCenter from './pages/AutomationCenter';
import Leaderboard from './pages/Leaderboard';
import IncentivesPage from './pages/Incentives';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import CustomerPortal from './pages/CustomerPortal';
import RewardsPage from './pages/Rewards';
import Login from './pages/Login';
import SalesRepDashboard from './pages/SalesRepDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

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

function CatalogExperience() {
  const { user, logout, token } = useAuth();
  const canManageOrders = useMemo(() => {
    if (!user) return false;
    return ['ADMIN', 'SALES_REP'].includes(user.role);
  }, [user]);
  const isAdmin = user?.role === 'ADMIN';
  const isSalesRep = user?.role === 'SALES_REP';
  const isDriver = user?.role === 'DRIVER';
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
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderToast, setOrderToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [apiOrders, setApiOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [loyaltySummary, setLoyaltySummary] = useState<{ points: number; tier: string } | null>(null);

  useEffect(() => {
    loadData();
    checkSalesRepLink();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory]);

  useEffect(() => {
    if (canManageOrders) {
      loadApiOrders();
    } else {
      setApiOrders([]);
      setPreviousOrders([]);
    }
  }, [loadApiOrders, canManageOrders]);

  const checkSalesRepLink = async () => {
    // Sales rep tracking disabled - table doesn't exist in PostgreSQL
    // const params = new URLSearchParams(window.location.search);
    // const repCode = params.get('rep');
    // TODO: Implement sales rep API endpoint when needed
  };

  const loadData = async () => {
    try {
      // Fetch products from internal PostgreSQL API
      const productsData = await fetchFromAPI<Product>('api/products');
      setProducts(productsData.filter((p: any) => p.inStock));

      // Categories, brands, promotions etc. don't exist in PostgreSQL yet
      // Setting empty arrays to prevent errors
      setCategories([]);
      setBundles([]);
      setSpecialOffers([]);
      setBrands([]);
      setSubcategories([]);
      setBadges([]);
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setCategories([]);
      setBundles([]);
      setSpecialOffers([]);
      setBrands([]);
      setSubcategories([]);
      setBadges([]);
    }

    // Promotions also not in PostgreSQL yet
    setPromotions([]);
  };

  // loadProductPromotions removed - no longer using Supabase

  const formatCurrency = (value: string | number | undefined) => {
    const amount = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    const safeAmount = Number.isNaN(amount) ? 0 : amount;
    return `$${safeAmount.toFixed(2)}`;
  };

  const mapApiOrdersToHistory = (orders: OrderResponse[]) =>
    orders.map((order) => ({
      id: order.id,
      order_number: order.id,
      created_at: order.createdAt,
      total: Number(order.total ?? 0),
      status: order.status || 'pending',
      items: order.items.map((item) => ({
        product_id: item.product?.id || item.id,
        product_name: item.product?.name || 'Product',
        quantity: item.quantity,
        unit_price: Number(item.price ?? 0),
      })),
    }));

  const loadApiOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const orders = await OrdersService.fetchOrders();
      setApiOrders(orders);
      setPreviousOrders(mapApiOrdersToHistory(orders));
      setOrdersError(null);
    } catch (error) {
      console.error('Failed to load orders', error);
      setOrdersError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

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

  const handleSubmitOrderToApi = async () => {
    if (cart.length === 0) {
      setOrderToast({ type: 'error', message: 'Add at least one product to your cart before submitting.' });
      return;
    }

    if (!customerNameInput.trim()) {
      setOrderToast({ type: 'error', message: 'Customer name is required.' });
      return;
    }

    if (!canManageOrders) {
      setOrderToast({ type: 'error', message: 'You do not have permission to submit orders.' });
      return;
    }

    setIsSubmittingOrder(true);
    setOrderToast(null);

    try {
      const payload: CreateOrderPayload = {
        customerName: customerNameInput.trim(),
        status: 'pending',
        userId: user?.id || salesRep?.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: Number(item.price).toFixed(2),
        })),
      };

      const response = await OrdersService.createOrder(payload);
      setOrderToast({
        type: 'success',
        message: `Order created successfully for ${response.customerName}.`,
      });
      setCart([]);
      setCustomerNameInput('');
      await loadApiOrders();
    } catch (error) {
      setOrderToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit order.',
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCompleteOrder = async (
    customer: Customer,
    orderData: { notes?: string; delivery_date?: string }
  ) => {
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Use OrdersService to create order via API
      const payload: CreateOrderPayload = {
        customerName: customer.business_name || customer.contact_name || 'Guest',
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        status: 'pending',
      };

      const response = await OrdersService.createOrder(payload);

      const earnedPoints = Math.floor(subtotal);
      setRewardsPoints(rewardsPoints + earnedPoints);

      setOrderDetails({
        orderNumber: response.id,
        customer,
        total: subtotal,
        deliveryDate: orderData.delivery_date,
      });

      setCart([]);
      setViewMode('confirmation');
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('Failed to complete order. Please try again.');
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
      <div className="min-h-screen bg-gray-50">
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

        <div className="max-w-3xl mx-auto px-4 pb-16 space-y-8">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900">Submit Order to Operations</h2>
            <p className="text-gray-600 mt-1">
              Send the current cart to the new Express + Prisma API so finance and warehouse teams can act on it.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Customer / Store Name
                </label>
                <input
                  type="text"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  placeholder="e.g. Riverside Market"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <button
                onClick={handleSubmitOrderToApi}
                disabled={isSubmittingOrder || cart.length === 0 || !canManageOrders}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition ${
                  isSubmittingOrder || cart.length === 0 || !canManageOrders
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmittingOrder && (
                  <svg
                    className="w-5 h-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {isSubmittingOrder ? 'Submitting Order...' : 'Submit Order'}
              </button>

              {!canManageOrders && (
                <p className="text-sm text-gray-500">
                  Only Sales Reps or Admins can submit orders to the backend.
                </p>
              )}

              {orderToast && (
                <div
                  className={`p-4 rounded-2xl border-2 ${
                    orderToast.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {orderToast.message}
                </div>
              )}
            </div>
          </div>

          {canManageOrders && (
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Recent API Orders</h3>
                  <p className="text-gray-600 text-sm">Last 5 submissions synced to the backend.</p>
                </div>
                <button
                  onClick={loadApiOrders}
                  disabled={ordersLoading}
                  className="px-4 py-2 text-sm font-semibold border-2 border-gray-200 rounded-2xl hover:border-emerald-500 transition disabled:opacity-60"
                >
                  {ordersLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {ordersError && (
                <div className="p-3 mb-3 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl">
                  {ordersError}
                </div>
              )}

              {ordersLoading && apiOrders.length === 0 ? (
                <p className="text-gray-500">Loading orders...</p>
              ) : apiOrders.length === 0 ? (
                <p className="text-gray-500">No orders recorded yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {apiOrders.slice(0, 5).map((order) => (
                    <li key={order.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()} • {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {order.status}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
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

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <LayoutDashboard size={20} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                  <Link
                    to="/admin/po"
                    className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Grid3x3 size={20} />
                    <span className="hidden sm:inline">POs</span>
                  </Link>
                  <Link
                    to="/admin/invoices"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <History size={20} />
                    <span className="hidden sm:inline">Invoices</span>
                  </Link>
                  <Link
                    to="/admin/insights"
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <LayoutDashboard size={20} />
                    <span className="hidden sm:inline">AI Insights</span>
                  </Link>
                  <Link
                    to="/admin/automation"
                    className="px-4 py-2 bg-gradient-to-r from-slate-700 to-gray-900 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Grid3x3 size={20} />
                    <span className="hidden sm:inline">Automation</span>
                  </Link>
                </>
              )}

              {isSalesRep && (
                <Link
                  to="/salesrep"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <History size={20} />
                  <span className="hidden sm:inline">Rep</span>
                </Link>
              )}

              {isDriver && (
                <Link
                  to="/driver"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Grid3x3 size={20} />
                  <span className="hidden sm:inline">Driver</span>
                </Link>
              )}

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

              {user?.role === 'CUSTOMER' && loyaltySummary && (
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                  <Link to="/customer" className="text-emerald-700 font-semibold">
                    Catalog
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link to="/customer/rewards" className="text-emerald-700 font-semibold">
                    Rewards
                  </Link>
                  <span className="text-gray-700 font-black">
                    Points: {loyaltySummary.points} ({loyaltySummary.tier})
                  </span>
                </div>
              )}
              {user && (
                <>
                  <Link
                    to="/leaderboard"
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-emerald-500 transition"
                  >
                    Leaderboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-rose-500 hover:text-rose-600 transition"
                  >
                    Logout
                  </button>
                </>
              )}
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute roles={['CUSTOMER', 'SALES_REP', 'ADMIN']}>
                <CatalogExperience />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/incentives"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <IncentivesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/po"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <PurchaseOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <InvoiceUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/insights"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AiInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/automation"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AutomationCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute roles={['ADMIN', 'SALES_REP', 'DRIVER', 'CUSTOMER']}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <CustomerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/rewards"
            element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <RewardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesrep"
            element={
              <ProtectedRoute roles={['SALES_REP']}>
                <SalesRepDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute roles={['DRIVER']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
  useEffect(() => {
    const fetchLoyalty = async () => {
      if (!token || !user) {
        setLoyaltySummary(null);
        return;
      }
      if (!['CUSTOMER', 'SALES_REP'].includes(user.role)) {
        setLoyaltySummary(null);
        return;
      }
      try {
        const res = await fetch('/api/loyalty/points', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          setLoyaltySummary({ points: json.points, tier: json.tier });
        }
      } catch (error) {
        console.warn('Failed to fetch loyalty points', error);
      }
    };
    fetchLoyalty();
  }, [token, user]);
