import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Zap, Package, Gift, Sparkles, TrendingUp, Award, Heart, Flame, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../lib/brandData';
import { CartItem } from '../types';

export default function CatalogCustomer() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [heroCollapsed, setHeroCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHeroCollapsed(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setLoyaltyPoints(prev => prev + Math.floor(product.price));
  };

  const handleQuickOrder = () => {
    const quickOrderItems = products.slice(0, 8);
    quickOrderItems.forEach(product => handleAddToCart(product));
    alert('Added 1 of each popular item to cart!');
  };

  const handleBulkOrder = () => {
    alert('Bulk order sheet opened! (Feature coming soon)');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const bundles = [
    {
      id: 'snack-bundle',
      name: 'Snack Variety Pack',
      products: products.filter(p => p.categoryId === 'snacks').slice(0, 5),
      originalPrice: 89.99,
      bundlePrice: 69.99,
      savings: 20,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'beverage-bundle',
      name: 'Beverage Assortment',
      products: products.filter(p => p.categoryId === 'beverages').slice(0, 4),
      originalPrice: 75.50,
      bundlePrice: 59.99,
      savings: 15.51,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'bakery-bundle',
      name: 'Bakery Favorites',
      products: products.filter(p => p.categoryId === 'bakery').slice(0, 6),
      originalPrice: 95.00,
      bundlePrice: 74.99,
      savings: 20.01,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const popularProducts = products.slice(0, 12);
  const reorderProducts = products.slice(5, 11);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section - Collapsible */}
      <motion.section
        animate={{ height: heroCollapsed ? '120px' : '350px' }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNFY0ek0wIDM0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>

            <AnimatePresence mode="wait">
              {!heroCollapsed ? (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white"
                >
                  <h1 className="text-6xl font-black mb-2 drop-shadow-lg">Welcome Back!</h1>
                  <p className="text-xl text-white/90 font-semibold">Smart ordering made easy</p>
                </motion.div>
              ) : (
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-black text-white drop-shadow-lg"
                >
                  Customer Portal
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"
            >
              <Crown className="w-5 h-5 text-white" />
              <span className="font-black text-white text-lg">{loyaltyPoints}</span>
              <span className="text-white/90 text-sm font-semibold">pts</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('Cart view coming soon!')}
              className="relative px-8 py-4 bg-white text-emerald-600 rounded-full font-black shadow-2xl hover:shadow-emerald-500/50 transition-all"
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              ${cartTotal.toFixed(2)}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Quick Action Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={handleQuickOrder}
              className="group relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNFY0ek0wIDM0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
              <div className="relative p-8">
                <Zap className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black text-white mb-2">Quick Order</h3>
                <p className="text-white/90 font-semibold">Add popular items instantly</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={handleBulkOrder}
              className="group relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNFY0ek0wIDM0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
              <div className="relative p-8">
                <Package className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black text-white mb-2">Bulk Order</h3>
                <p className="text-white/90 font-semibold">Spreadsheet-style ordering</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNFY0ek0wIDM0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
              <div className="relative p-8">
                <Gift className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black text-white mb-2">Rewards</h3>
                <p className="text-white/90 font-semibold">{loyaltyPoints} points available</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Smart Bundles - Colorful Showcase */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h2 className="text-4xl font-black">Smart Bundles</h2>
            <span className="px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black rounded-full">
              SAVE BIG
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {bundles.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className={`h-48 bg-gradient-to-br ${bundle.color} p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNFY0ek0wIDM0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnptMC0zMGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTRWNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-8 h-8 text-white" />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-black rounded-full">
                        {bundle.products.length} Items
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3">{bundle.name}</h3>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-white">${bundle.bundlePrice}</span>
                      <span className="text-xl text-white/70 line-through">${bundle.originalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-600 font-black">Save ${bundle.savings.toFixed(2)}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">+{Math.floor(bundle.bundlePrice)} pts</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {bundle.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="line-clamp-1">{product.name}</span>
                      </div>
                    ))}
                    {bundle.products.length > 3 && (
                      <div className="text-sm text-gray-500 font-semibold">
                        +{bundle.products.length - 3} more items...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      bundle.products.forEach(p => handleAddToCart(p));
                      alert(`${bundle.name} added to cart!`);
                    }}
                    className={`w-full py-4 bg-gradient-to-r ${bundle.color} text-white rounded-2xl font-black shadow-lg group-hover:shadow-xl transition-all`}
                  >
                    Add Bundle to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Reorder */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-8 h-8 text-orange-600" />
            <h2 className="text-4xl font-black">Quick Reorder</h2>
            <span className="text-gray-600 font-semibold">Based on your history</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {reorderProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div
                  className="h-32 flex items-center justify-center p-3 relative overflow-hidden"
                  style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
                >
                  <div className="absolute top-2 right-2 p-1 bg-white/90 rounded-full">
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-emerald-600">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">+{Math.floor(product.price)} pts</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-xs hover:shadow-lg transition-all"
                  >
                    Reorder
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Products - Masonry Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-black">All Products</h2>
            <button className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
              <TrendingUp className="w-5 h-5" />
              Sort by Popular
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {popularProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
              >
                <div
                  className="h-40 flex items-center justify-center p-4 relative overflow-hidden"
                  style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-emerald-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">+{Math.floor(product.price)} pts</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-xs hover:shadow-lg transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
