import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Package, ChevronDown, HandMetal, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../lib/brandData';
import { CartItem } from '../types';

export default function CatalogSalesRep() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('bodega-1');
  const [handoffMode, setHandoffMode] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);

  const businesses = [
    { id: 'bodega-1', name: 'La Tiendita', address: '123 Main St' },
    { id: 'bodega-2', name: 'Super Mercado', address: '456 Oak Ave' },
    { id: 'bodega-3', name: 'Mini Market Express', address: '789 Pine Rd' },
  ];

  const currentBusiness = businesses.find(b => b.id === selectedBusiness);

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sales Rep Mode
            </h1>
            <button
              onClick={() => alert('Cart view coming soon!')}
              className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
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

          {/* Business Selector & Handoff Mode */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <button
                onClick={() => setShowBusinessMenu(!showBusinessMenu)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-gray-900">{currentBusiness?.name}</div>
                    <div className="text-sm text-gray-600">{currentBusiness?.address}</div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </button>

              {showBusinessMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => {
                        setSelectedBusiness(business.id);
                        setShowBusinessMenu(false);
                      }}
                      className={`w-full px-6 py-4 text-left hover:bg-purple-50 transition-colors ${
                        business.id === selectedBusiness ? 'bg-purple-100' : ''
                      }`}
                    >
                      <div className="font-bold text-gray-900">{business.name}</div>
                      <div className="text-sm text-gray-600">{business.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setHandoffMode(!handoffMode)}
              className={`px-8 py-4 rounded-2xl font-black shadow-lg transition-all ${
                handoffMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <HandMetal className="w-5 h-5 inline mr-2" />
              {handoffMode ? 'Tablet Mode Active' : 'Handoff to Customer'}
            </button>
          </div>

          {handoffMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl"
            >
              <p className="text-center font-bold text-gray-900">
                🎯 Tablet handed to customer at <span className="text-green-600">{currentBusiness?.name}</span>
              </p>
            </motion.div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Business-Specific Pricing Info */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-black mb-2">Custom Pricing Active</h2>
          <p className="text-gray-600">
            Showing prices and products configured for{' '}
            <span className="font-bold text-purple-600">{currentBusiness?.name}</span>
          </p>
        </div>

        {/* Products Grid */}
        <section>
          <h2 className="text-4xl font-black mb-6">
            {handoffMode ? 'Customer Self-Selection' : 'Sales Rep Catalog'}
          </h2>
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
                    <span className="text-2xl font-black text-purple-600">
                      ${(product.price * 0.95).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${
                      handoffMode
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {handoffMode ? 'Customer Add' : 'Add to Cart'}
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
