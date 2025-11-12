import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowLeft, ShoppingCart, Star, Zap, Package, Sparkles, TrendingUp, Award, Crown, Truck, Box, Clock, Flame, Target, DollarSign, BarChart3, Check, Plus, Minus, X, HandMetal, Building2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../lib/brandData';
import { CartItem } from '../types';
import * as THREE from 'three';

function RotatingProductCard({ product, position, index }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = time * 0.5 + index;
      meshRef.current.position.y = Math.sin(time + index) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color={product.backgroundColor || '#4F46E5'}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function Hero3DCarousel() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
      <pointLight position={[0, 0, 10]} intensity={0.5} />
      {featuredProducts.map((product, i) => (
        <RotatingProductCard
          key={product.id}
          product={product}
          position={[
            Math.cos((i / featuredProducts.length) * Math.PI * 2) * 4,
            0,
            Math.sin((i / featuredProducts.length) * Math.PI * 2) * 4,
          ]}
          index={i}
        />
      ))}
    </>
  );
}

export default function CatalogSalesRep() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [flyingItems, setFlyingItems] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('bodega-1');
  const [handoffMode, setHandoffMode] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const businesses = [
    { id: 'bodega-1', name: 'La Tiendita', address: '123 Main St' },
    { id: 'bodega-2', name: 'Super Mercado', address: '456 Oak Ave' },
    { id: 'bodega-3', name: 'Mini Market Express', address: '789 Pine Rd' },
  ];

  const currentBusiness = businesses.find(b => b.id === selectedBusiness);

  const handleAddToCart = (product: any, quantity: number = 1) => {
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      const flyingItem = {
        id: Date.now(),
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        targetX: rect.left,
        targetY: rect.top,
        product
      };
      setFlyingItems(prev => [...prev, flyingItem]);
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(item => item.id !== flyingItem.id));
      }, 800);
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setLoyaltyPoints(prev => prev + Math.floor(product.price * quantity));
    setShowQuickAdd(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const productSections = [
    {
      id: 'hot-deals',
      title: '🔥 Hot Deals',
      subtitle: 'Limited Time Only',
      products: products.slice(0, 8),
      layout: 'grid-4',
      color: 'from-red-600 to-orange-600',
      accentColor: 'red',
    },
    {
      id: 'best-sellers',
      title: '⭐ Best Sellers',
      subtitle: 'Most Popular This Week',
      products: products.slice(8, 14),
      layout: 'carousel',
      color: 'from-yellow-500 to-amber-600',
      accentColor: 'yellow',
    },
    {
      id: 'bulk-savers',
      title: '📦 Bulk Savers',
      subtitle: 'Save More, Buy More',
      products: products.slice(14, 22),
      layout: 'grid-2-big',
      color: 'from-blue-600 to-cyan-600',
      accentColor: 'blue',
    },
    {
      id: 'new-arrivals',
      title: '✨ New Arrivals',
      subtitle: 'Just Added',
      products: products.slice(22, 30),
      layout: 'masonry',
      color: 'from-pink-600 to-purple-600',
      accentColor: 'purple',
    },
    {
      id: 'quick-reorder',
      title: '⚡ Quick Reorder',
      subtitle: 'Your Favorites',
      products: products.slice(5, 17),
      layout: 'compact-grid',
      color: 'from-green-600 to-emerald-600',
      accentColor: 'green',
    },
    {
      id: 'wholesale-specials',
      title: '💎 Wholesale Specials',
      subtitle: 'Case Pricing Available',
      products: products.slice(30, 42),
      layout: 'feature-cards',
      color: 'from-indigo-600 to-violet-600',
      accentColor: 'indigo',
    },
  ];

  const renderProductCard = (product: any, index: number, accentColor: string) => {
    const caseCount = product.unitsPerCase || 12;
    const casePrice = product.price * caseCount * 0.85;
    const deliveryDate = new Date(Date.now() + (3 + index % 3) * 24 * 60 * 60 * 1000);

    const glassGradients = [
      'from-cyan-500/20 via-blue-500/10 to-purple-500/20',
      'from-pink-500/20 via-rose-500/10 to-orange-500/20',
      'from-green-500/20 via-emerald-500/10 to-teal-500/20',
      'from-yellow-500/20 via-amber-500/10 to-orange-500/20',
      'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
      'from-red-500/20 via-pink-500/10 to-rose-500/20',
    ];

    const neonBorders = [
      'hover:shadow-[0_0_30px_rgba(6,182,212,0.6),0_0_60px_rgba(6,182,212,0.3),inset_0_0_20px_rgba(6,182,212,0.1)]',
      'hover:shadow-[0_0_30px_rgba(236,72,153,0.6),0_0_60px_rgba(236,72,153,0.3),inset_0_0_20px_rgba(236,72,153,0.1)]',
      'hover:shadow-[0_0_30px_rgba(16,185,129,0.6),0_0_60px_rgba(16,185,129,0.3),inset_0_0_20px_rgba(16,185,129,0.1)]',
      'hover:shadow-[0_0_30px_rgba(251,191,36,0.6),0_0_60px_rgba(251,191,36,0.3),inset_0_0_20px_rgba(251,191,36,0.1)]',
      'hover:shadow-[0_0_30px_rgba(139,92,246,0.6),0_0_60px_rgba(139,92,246,0.3),inset_0_0_20px_rgba(139,92,246,0.1)]',
      'hover:shadow-[0_0_30px_rgba(239,68,68,0.6),0_0_60px_rgba(239,68,68,0.3),inset_0_0_20px_rgba(239,68,68,0.1)]',
    ];

    const patternIndex = index % glassGradients.length;

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className={`group relative rounded-2xl overflow-hidden border-2 border-slate-700/50 hover:border-cyan-400 transition-all duration-500 ${neonBorders[patternIndex]}`}
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
        }}
        id={`card-${product.id}`}
      >
        <div
          className={`h-48 flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br ${glassGradients[patternIndex]}`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
              linear-gradient(135deg, ${product.backgroundColor || '#1e293b'} 0%, rgba(15, 23, 42, 0.8) 100%)
            `,
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80" />

          <div className="absolute top-3 left-3 flex gap-2 z-20">
            {product.featured && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black text-xs font-black rounded-full shadow-lg shadow-yellow-500/50 animate-pulse">
                🔥 HOT
              </span>
            )}
            {index % 3 === 0 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-black text-xs font-black rounded-full shadow-lg shadow-green-500/50">
                -15% OFF
              </span>
            )}
          </div>

          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 group-hover:drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-500"
            />
          ) : (
            <Package className="w-24 h-24 text-cyan-400/30" />
          )}

          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
        </div>

        <div className="p-4 space-y-3 bg-gradient-to-b from-slate-800/40 to-slate-900/60 backdrop-blur-sm">
          <h3 className="font-black text-white text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors drop-shadow-lg">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/50 px-2 py-1.5 rounded-lg">
            <Truck className="w-3 h-3 text-green-400" />
            <span>Delivers: {deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="space-y-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">/ unit</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
              <Box className="w-3 h-3 text-blue-400" />
              <span className="text-slate-200">
                Case ({caseCount}): <span className="font-black text-blue-400">${casePrice.toFixed(2)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Target className="w-3 h-3 text-purple-400" />
              <span>MOQ: <span className="font-bold text-purple-400">{product.minOrderQty || 1}</span> units</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleAddToCart(product, 1)}
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 border border-cyan-400/20 hover:border-cyan-400/40"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add to Cart
            </button>
            <button
              onClick={() => {
                setSelectedProduct(product);
                setShowQuickAdd(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-cyan-400 rounded-xl font-black text-sm transition-all border-2 border-cyan-500/30 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/40"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
            <span className="text-green-400 font-black flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg">
              <Award className="w-3 h-3" />
              +{Math.floor(product.price)} pts
            </span>
            <span className="text-slate-400 font-semibold">{product.stock} in stock</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSection = (section: any) => {
    switch (section.layout) {
      case 'grid-4':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'carousel':
        return (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {section.products.map((p: any, i: number) => (
              <div key={p.id} className="flex-shrink-0 w-80 snap-center">
                {renderProductCard(p, i, section.accentColor)}
              </div>
            ))}
          </div>
        );

      case 'grid-2-big':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'masonry':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'compact-grid':
        return (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'feature-cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Flying Cart Items Animation */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ x: item.x, y: item.y, scale: 1, opacity: 1 }}
            animate={{ x: item.targetX, y: item.targetY, scale: 0.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed z-[100] pointer-events-none"
          >
            <ShoppingCart className="w-8 h-8 text-cyan-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hero Section with 3D Carousel */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-[60vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950" />
        <div className="absolute inset-0 opacity-40">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <Hero3DCarousel />
          </Canvas>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

        <div className="relative z-10 text-center px-4">
          <button
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm rounded-full transition-all border border-slate-700"
          >
            <ArrowLeft className="w-6 h-6 text-cyan-400" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
              SALES REP
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-slate-300 mb-8">
              Ordering for {currentBusiness?.name}
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowBusinessMenu(!showBusinessMenu)}
                  className="flex items-center gap-3 px-6 py-3 bg-slate-800/80 backdrop-blur-sm rounded-full border-2 border-slate-700 hover:border-cyan-500 transition-all"
                >
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white">{currentBusiness?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showBusinessMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                    {businesses.map((business) => (
                      <button
                        key={business.id}
                        onClick={() => {
                          setSelectedBusiness(business.id);
                          setShowBusinessMenu(false);
                        }}
                        className={`w-full px-6 py-3 text-left hover:bg-slate-700 transition-all ${
                          business.id === selectedBusiness ? 'bg-slate-700' : ''
                        }`}
                      >
                        <div className="font-bold text-white">{business.name}</div>
                        <div className="text-sm text-slate-400">{business.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setHandoffMode(!handoffMode)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black shadow-lg transition-all ${
                  handoffMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400'
                    : 'bg-slate-800/80 text-slate-300 border-2 border-slate-700 hover:border-purple-500'
                }`}
              >
                <HandMetal className="w-5 h-5" />
                {handoffMode ? 'Tablet Active' : 'Handoff Mode'}
              </button>

              <button
                id="cart-icon"
                onClick={() => alert('Cart coming soon!')}
                className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full font-black text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>${cartTotal.toFixed(2)}</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Sticky Stats Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="font-bold text-red-400">{productSections[0].products.length} Hot Deals</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-yellow-400">Best Sellers</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Box className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-blue-400">Case Pricing</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Truck className="w-4 h-4 text-green-500" />
              <span className="font-bold text-green-400">Next-Day Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="font-bold text-purple-400">Analytics Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sections */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {productSections.map((section, sectionIndex) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={`h-12 w-2 rounded-full bg-gradient-to-b ${section.color}`} />
              <div>
                <h2 className="text-4xl md:text-5xl font-black">{section.title}</h2>
                <p className="text-slate-400 font-semibold">{section.subtitle}</p>
              </div>
            </div>

            {renderSection(section)}
          </motion.section>
        ))}
      </main>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuickAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-cyan-400">Quick Add</h3>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2">{selectedProduct.name}</h4>
                  <p className="text-slate-400 text-sm">{selectedProduct.description}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleAddToCart(selectedProduct, 1)}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left px-6 transition-all border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">1 Unit</span>
                      <span className="text-cyan-400 font-black">${selectedProduct.price.toFixed(2)}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddToCart(selectedProduct, selectedProduct.unitsPerCase || 12)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-left px-6 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">1 Case ({selectedProduct.unitsPerCase || 12} units)</span>
                      <span className="text-white font-black">
                        ${(selectedProduct.price * (selectedProduct.unitsPerCase || 12) * 0.85).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-white/70">Save 15%</div>
                  </button>

                  <button
                    onClick={() => handleAddToCart(selectedProduct, (selectedProduct.unitsPerCase || 12) * 5)}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-left px-6 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">5 Cases ({(selectedProduct.unitsPerCase || 12) * 5} units)</span>
                      <span className="text-white font-black">
                        ${(selectedProduct.price * (selectedProduct.unitsPerCase || 12) * 5 * 0.75).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-white/70 flex items-center gap-2">
                      <Star className="w-3 h-3 fill-current" />
                      Save 25% • Best Value
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => alert('Bulk order sheet coming soon!')}
        className="fixed bottom-8 right-8 p-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl z-40 hover:shadow-purple-500/50 transition-all"
      >
        <Sparkles className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
}
