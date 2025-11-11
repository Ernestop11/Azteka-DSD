import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Zap, Package, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../lib/brandData';
import { CartItem } from '../types';

export default function CatalogCustomer() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);

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
    },
    {
      id: 'beverage-bundle',
      name: 'Beverage Assortment',
      products: products.filter(p => p.categoryId === 'beverages').slice(0, 4),
      originalPrice: 75.50,
      bundlePrice: 59.99,
      savings: 15.51,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Customer Portal
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                <Star className="w-5 h-5 text-white" />
                <span className="font-black text-white">{loyaltyPoints} pts</span>
              </div>
              <button
                onClick={() => alert('Cart view coming soon!')}
                className="relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleQuickOrder}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group"
          >
            <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">Quick Order</h3>
            <p className="text-gray-600">Add 1 of each popular item instantly</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleBulkOrder}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group"
          >
            <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">Bulk Order</h3>
            <p className="text-gray-600">Fill quantities in spreadsheet view</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 cursor-pointer group"
          >
            <div className="inline-flex p-4 rounded-xl bg-white/20 mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-white">Redeem Rewards</h3>
            <p className="text-white/90">Use your {loyaltyPoints} points</p>
          </motion.div>
        </div>

        {/* Smart Bundles */}
        <section>
          <h2 className="text-4xl font-black mb-6">Smart Bundles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bundles.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                  <h3 className="text-2xl font-black text-white mb-2">{bundle.name}</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-white">${bundle.bundlePrice}</span>
                    <span className="text-lg text-white/70 line-through">${bundle.originalPrice}</span>
                    <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-black">
                      Save ${bundle.savings}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-2 mb-4">
                    {bundle.products.map((product) => (
                      <div key={product.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        {product.name}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      bundle.products.forEach(p => handleAddToCart(p));
                      alert(`${bundle.name} added to cart!`);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Add Bundle to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Products */}
        <section>
          <h2 className="text-4xl font-black mb-6">All Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                <div
                  className="h-48 flex items-center justify-center"
                  style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-emerald-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">+{Math.floor(product.price)} pts</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
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
