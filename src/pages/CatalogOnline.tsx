import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Package, Mail, Sparkles, Star, TrendingUp, ChevronRight, Zap, Gift, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../lib/brandData';

export default function CatalogOnline() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [heroCollapsed, setHeroCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHeroCollapsed(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { id: 'beverages', name: 'Beverages', icon: Sparkles, color: 'from-cyan-500 to-teal-500' },
    { id: 'snacks', name: 'Snacks', icon: Star, color: 'from-orange-500 to-red-500' },
    { id: 'bakery', name: 'Bakery', icon: Gift, color: 'from-pink-500 to-rose-500' },
    { id: 'pantry', name: 'Pantry', icon: Crown, color: 'from-amber-500 to-yellow-500' },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const trendingProducts = products.slice(10, 16);
  const newArrivals = products.slice(20, 26);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Section - Collapsible */}
      <motion.section
        animate={{ height: heroCollapsed ? '120px' : '400px' }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600"
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
                  <h1 className="text-6xl font-black mb-2 drop-shadow-lg">Browse Our Catalog</h1>
                  <p className="text-xl text-white/90 font-semibold">600+ Premium Wholesale Products</p>
                </motion.div>
              ) : (
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-black text-white drop-shadow-lg"
                >
                  Online Catalog
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-full font-black shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all"
          >
            <Mail className="w-5 h-5 inline mr-2" />
            Request Pricing Access
          </button>
        </div>
      </motion.section>

      {/* Search & Filters */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search 600+ products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Showcase - Large Hero Cards */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-black">Featured Products</h2>
            <button className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
              View All <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full z-10">
                  <span className="text-white font-black text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Featured
                  </span>
                </div>

                <div
                  className="h-64 flex items-center justify-center p-8 relative overflow-hidden"
                  style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-gray-400" />
                  )}
                </div>

                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-black text-gray-900 leading-tight flex-1">{product.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-semibold px-3 py-1 bg-gray-200 rounded-full">
                      {product.supplier}
                    </span>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold text-sm hover:shadow-lg transition-all"
                    >
                      Get Price
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending - Compact Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              >
                <div
                  className="h-32 flex items-center justify-center p-3"
                  style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-xs"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Arrivals - Horizontal Scroll Banner */}
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8 text-white" />
              <h2 className="text-4xl font-black text-white">New Arrivals</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {newArrivals.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-shrink-0 w-72 bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-pink-500/50 transition-all cursor-pointer"
                >
                  <div
                    className="h-48 flex items-center justify-center p-6"
                    style={{ backgroundColor: product.backgroundColor || '#f3f4f6' }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black rounded-full">
                        NEW
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">{product.name}</h3>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      Request Info
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* All Products - Masonry Style Grid */}
        <section>
          <h2 className="text-4xl font-black mb-6">All Products ({filteredProducts.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
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
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-3 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-xs hover:shadow-lg transition-all"
                  >
                    Request Pricing
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Request Access Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="inline-flex p-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 mb-4 shadow-lg">
                  <Mail className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-2">Request Account Access</h2>
                <p className="text-gray-600">
                  Get full access to pricing, ordering, and exclusive deals
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold"
                />
                <textarea
                  placeholder="Tell us about your business"
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Request submitted! We will contact you within 24 hours.');
                    setShowRequestModal(false);
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
