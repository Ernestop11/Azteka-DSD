import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowLeft, ShoppingCart, Star, Zap, Package, Sparkles, TrendingUp, Award, Crown, Truck, Box, Clock, Flame, Target, DollarSign, BarChart3, Check, Plus, Minus, X } from 'lucide-react';
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

export default function CatalogCustomer() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [flyingItems, setFlyingItems] = useState<any[]>([]);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const productImages = [
      product.imageUrl,
      product.imageUrl,
      product.imageUrl
    ].filter(Boolean);

    useEffect(() => {
      if (productImages.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [productImages.length]);

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
          className={`h-40 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br ${glassGradients[patternIndex]} cursor-pointer`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
              linear-gradient(135deg, ${product.backgroundColor || '#1e293b'} 0%, rgba(15, 23, 42, 0.8) 100%)
            `,
          }}
          onClick={() => {
            setSelectedProduct(product);
            setShowQuickAdd(true);
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60" />

          <div className="absolute top-2 left-2 flex gap-1 z-20">
            {product.featured && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black rounded-full shadow-lg animate-pulse">
                HOT
              </span>
            )}
            {index % 3 === 0 && (
              <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-black text-[10px] font-black rounded-full shadow-lg">
                -15%
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex items-center justify-center"
            >
              {productImages[currentImageIndex] ? (
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 group-hover:drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-500"
                />
              ) : (
                <Package className="w-16 h-16 text-cyan-400/30" />
              )}
            </motion.div>
          </AnimatePresence>

          {productImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {productImages.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-cyan-400 w-3' : 'bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        </div>

        <div className="p-3 space-y-2 bg-gradient-to-b from-slate-800/40 to-slate-900/60 backdrop-blur-sm">
          <h3 className="font-black text-white text-xs line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-blue-400 font-bold">Case: ${casePrice.toFixed(2)}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product, 1);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-black text-xs transition-all shadow-lg hover:shadow-cyan-500/50"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              ADD
            </button>
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
            <h1 className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              WHOLESALE
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-slate-300 mb-8">
              Direct Store Delivery • 600+ Products
            </p>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 px-6 py-3 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-black text-2xl text-yellow-400">{loyaltyPoints}</span>
                <span className="text-slate-400">points</span>
              </div>

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

      {/* Enhanced Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && selectedProduct && (() => {
          const caseCount = selectedProduct.unitsPerCase || 12;
          const relatedProducts = products.filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id).slice(0, 3);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
              onClick={() => {
                setShowQuickAdd(false);
                setOrderQuantity(1);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 max-w-2xl w-full border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 my-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-cyan-400">Quick Order</h3>
                  <button
                    onClick={() => {
                      setShowQuickAdd(false);
                      setOrderQuantity(1);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-full transition-all"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                      {selectedProduct.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Package className="w-12 h-12 text-cyan-400/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-white text-lg mb-1">{selectedProduct.name}</h4>
                      <p className="text-slate-400 text-sm line-clamp-2">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="bg-slate-800/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-bold">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </button>
                      <span className="text-2xl font-black text-cyan-400 w-16 text-center">{orderQuantity}</span>
                      <button
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setOrderQuantity(1)}
                      className={`py-2 rounded-lg font-bold transition-all ${orderQuantity === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      1 unit
                    </button>
                    <button
                      onClick={() => setOrderQuantity(caseCount)}
                      className={`py-2 rounded-lg font-bold transition-all ${orderQuantity === caseCount ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      1 Case
                    </button>
                    <button
                      onClick={() => setOrderQuantity(caseCount * 5)}
                      className={`py-2 rounded-lg font-bold transition-all ${orderQuantity === caseCount * 5 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      5 Cases
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-4 border border-cyan-500/20 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Unit Price:</span>
                    <span className="text-white font-bold">${selectedProduct.price.toFixed(2)}</span>
                  </div>
                  {orderQuantity >= caseCount && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 text-sm">Bulk Discount:</span>
                      <span className="text-green-400 font-bold text-sm">-{orderQuantity >= caseCount * 5 ? '25' : '15'}%</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        ${(selectedProduct.price * orderQuantity * (orderQuantity >= caseCount * 5 ? 0.75 : orderQuantity >= caseCount ? 0.85 : 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right text-xs text-green-400 font-semibold">
                      +{Math.floor(selectedProduct.price * orderQuantity)} loyalty pts
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct, orderQuantity);
                    setOrderQuantity(1);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 transition-all mb-4"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Add {orderQuantity} to Cart
                </button>

                {/* Bundle Deal */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <span className="font-black text-white">Bundle & Save</span>
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-black rounded-full">-30%</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">Get this product + 2 related items</p>
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, caseCount);
                      relatedProducts.slice(0, 2).forEach(p => handleAddToCart(p, 1));
                      setOrderQuantity(1);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all"
                  >
                    Add Bundle - Save 30%
                  </button>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <div className="border-t border-slate-700 pt-4">
                    <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      Customers also ordered
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      {relatedProducts.map((rp) => (
                        <button
                          key={rp.id}
                          onClick={() => {
                            handleAddToCart(rp, 1);
                          }}
                          className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-2 transition-all group border border-slate-700 hover:border-cyan-500"
                        >
                          <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-2 flex items-center justify-center">
                            {rp.imageUrl ? (
                              <img src={rp.imageUrl} alt={rp.name} className="w-full h-full object-contain p-2" />
                            ) : (
                              <Package className="w-8 h-8 text-slate-600" />
                            )}
                          </div>
                          <p className="text-xs text-white font-bold line-clamp-2 mb-1">{rp.name}</p>
                          <p className="text-xs text-cyan-400 font-black">${rp.price.toFixed(2)}</p>
                          <div className="mt-1 py-1 bg-cyan-600 rounded text-white text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                            +ADD
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
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
