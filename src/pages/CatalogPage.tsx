import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BrandCarousel from '../components/BrandCarousel';
import CategoryGrid from '../components/CategoryGrid';
import EnhancedProductCard from '../components/EnhancedProductCard';
import { products, weeklySpecials } from '../lib/brandData';
import { Product, CartItem } from '../types';

export default function CatalogPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleAddBundle = (bundleId: string) => {
    alert(`Bundle ${bundleId} added to cart! (Implementation pending)`);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  const specialProductIds = weeklySpecials.map((s) => s.productId);
  const specialsProducts = selectedCategory === 'specials'
    ? products.filter((p) => specialProductIds.includes(p.id))
    : [];

  const displayProducts = selectedCategory === 'specials' ? specialsProducts : filteredProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                AZTEKA
              </motion.div>
              <div className="hidden md:block text-sm text-gray-600 font-medium">
                Wholesale Distribution
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {user && (
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cart')}
                className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 space-y-3 border-t border-gray-200"
            >
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl">
                <User className="w-5 h-5 text-gray-600" />
                <div className="text-sm">
                  <div className="font-bold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/cart')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-between"
              >
                <span>View Cart</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">{cartCount}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold"
              >
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BrandCarousel onAddBundle={handleAddBundle} />
        </motion.div>

        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Discover our complete selection of wholesale products
            </p>
          </motion.div>

          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              {selectedCategory === 'specials' ? 'Weekly Specials' : 'Products'}
            </h2>
            <p className="text-gray-600 text-lg">
              {displayProducts.length} items available
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => {
              const special = weeklySpecials.find((s) => s.productId === product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EnhancedProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    discount={special?.discount}
                    badge={special?.badge}
                  />
                </motion.div>
              );
            })}
          </div>

          {displayProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No products in this category
              </h3>
              <p className="text-gray-600">
                Try selecting a different category
              </p>
            </div>
          )}
        </section>
      </main>

      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Cart Summary</h3>
            <button
              onClick={() => navigate('/cart')}
              className="text-sm text-blue-600 font-bold hover:text-blue-700"
            >
              View Full Cart
            </button>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span className="text-gray-600">{cartCount} items</span>
            <span className="font-black text-gray-900 text-2xl">
              ${cartTotal.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
          >
            Checkout Now
          </button>
        </motion.div>
      )}
    </div>
  );
}
