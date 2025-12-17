import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import CategoryTabs from '../components/CategoryTabs';
import ProductBillboard from '../components/ProductBillboard';
import BundleShowcase from '../components/BundleShowcase';
import SpecialOffers from '../components/SpecialOffers';
import LanguageToggle from '../components/LanguageToggle';
import ModeSelector from '../components/ModeSelector';
import CarlosBulkOrder from '../components/CarlosBulkOrder';
import { ShoppingCart, LogIn, User, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'general' | 'customer' | 'salesrep';

export default function CatalogLanding() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('general');
  const [salesRepMode, setSalesRepMode] = useState<string>('hybrid');

  useEffect(() => {
    // Determine view mode based on user role
    if (user) {
      if (user.role === 'SALES_REP') {
        setViewMode('salesrep');
      } else if (user.role === 'CUSTOMER') {
        setViewMode('customer');
      } else {
        setViewMode('general');
      }
    } else {
      setViewMode('general');
    }
    
    fetchData();
  }, [user]);

  async function fetchData() {
    try {
      setLoading(true);
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }

      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === selectedCategory);

  // General User View - No prices, watered down
  if (viewMode === 'general') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  🏪 Azteka DSD
                </h1>
                <p className="text-sm text-gray-600">{t('general.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <LogIn size={18} />
                  {t('nav.login')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <Hero />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{t('general.welcome')}</h2>
            <p className="text-gray-600 mb-4">{t('general.loginPrompt')}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {t('general.onboarding')}
            </button>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          {/* Products Grid - No Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard
                  product={product}
                  onAddToCart={() => navigate('/login')}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-600">
                  {t('general.noPrices')}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Customer View - Order again feed, social media style
  if (viewMode === 'customer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  🏪 Azteka DSD
                </h1>
                <p className="text-sm text-gray-600">{t('customer.welcome')}, {user?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <ShoppingCart size={20} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <User size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Order Again Feed */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">{t('customer.orderAgain')}</h2>
            {/* Social media style feed would go here */}
            <div className="space-y-4">
              {filteredProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <ProductCard
                    product={product}
                    onAddToCart={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Sales Rep View - Customizable modes
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                🏪 Azteka DSD
              </h1>
              <p className="text-sm text-gray-600">{t('salesrep.welcome')}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ModeSelector mode={salesRepMode} onModeChange={setSalesRepMode} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => {}}
            />
          ))}
        </div>
      </main>
      
      {/* Carlos Bulk Order Button */}
      <CarlosBulkOrder products={products} onClose={() => {}} />
    </div>
  );
}

