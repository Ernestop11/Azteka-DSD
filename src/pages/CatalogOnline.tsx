import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowLeft, Mail, Star, Zap, Package, Sparkles, TrendingUp, Award, Crown, Truck, Box, Clock, Flame, Target, DollarSign, BarChart3, Check, Plus, Minus, X } from 'lucide-react';
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

export default function CatalogOnline() {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const handleRequestAccess = () => {
    setShowRequestModal(true);
  };

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

          <div className="space-y-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold">Wholesale Pricing Available</span>
            </div>
            <p className="text-xs text-slate-400">
              Request access to view exclusive wholesale prices and volume discounts
            </p>
          </div>

          <button
            onClick={() => handleRequestAccess()}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 border border-cyan-400/20 hover:border-cyan-400/40"
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Request Pricing Access
          </button>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Fast delivery
            </span>
            <span className="text-slate-400 font-semibold">{product.stock} available</span>
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
              BROWSE CATALOG
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-slate-300 mb-8">
              600+ Premium Wholesale Products
            </p>

            <button
              onClick={() => handleRequestAccess()}
              className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 rounded-full font-black text-xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all border-2 border-cyan-400/30"
            >
              <Mail className="w-6 h-6" />
              Request Pricing Access
            </button>
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

      {/* Request Access Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full border-2 border-cyan-500/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Request Access</h3>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <p className="text-slate-300 mb-6">
                Get full access to wholesale pricing, case discounts, and exclusive deals
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all"
                />
                <textarea
                  placeholder="Tell us about your business..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Request submitted! We will contact you within 24 hours.');
                    setShowRequestModal(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-black shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 transition-all"
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
