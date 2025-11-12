import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowLeft, ShoppingCart, Star, Zap, Package, Sparkles, TrendingUp, Award, Crown, Truck, Box, Clock, Flame, Target, DollarSign, BarChart3, Check, Plus, Minus, X, Gift } from 'lucide-react';
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
  const [showAddedConfirmation, setShowAddedConfirmation] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalCases, setModalCases] = useState(1);
  const [upsellQuantities, setUpsellQuantities] = useState<{[key: string]: number}>({});
  const [flyingItems, setFlyingItems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'browse' | 'bulk'>('browse');
  const [bulkOrders, setBulkOrders] = useState<{[key: string]: number}>({});
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const handleAddToCart = (product: any, quantity: number = 1, showConfirmation: boolean = true) => {
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

    if (showConfirmation) {
      setLastAddedProduct({ ...product, addedQuantity: quantity });
      setShowAddedConfirmation(true);
      setModalQuantity(1);
      setModalCases(1);
      setUpsellQuantities({});
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const productSections = [
    {
      id: 'brand-jumex',
      title: 'Jumex',
      subtitle: 'Premium Juice & Nectars',
      products: products.filter(p => p.brand === 'Jumex' || p.name?.includes('Jumex')).slice(0, 12),
      layout: 'netflix-curtain',
      color: 'from-orange-600 to-red-600',
      brandLogo: '🧃',
      accentColor: 'orange',
    },
    {
      id: 'hot-deals',
      title: '🔥 Flash Deals',
      subtitle: 'Ends in 6 hours',
      products: products.slice(0, 6),
      layout: 'hero-grid',
      color: 'from-red-600 to-orange-600',
      accentColor: 'red',
    },
    {
      id: 'best-sellers',
      title: '⭐ Trending Now',
      subtitle: 'What others are buying',
      products: products.slice(8, 14),
      layout: 'carousel-snap',
      color: 'from-yellow-500 to-amber-600',
      accentColor: 'yellow',
    },
    {
      id: 'brand-coca-cola',
      title: 'Coca-Cola',
      subtitle: 'The World\'s Favorite',
      products: products.filter(p => p.brand === 'Coca-Cola' || p.name?.includes('Coke') || p.name?.includes('Sprite')).slice(0, 10),
      layout: 'brand-spotlight',
      color: 'from-red-700 to-red-900',
      brandLogo: '🥤',
      accentColor: 'red',
    },
    {
      id: 'bulk-savers',
      title: '📦 Case Deals',
      subtitle: 'Buy More, Save More',
      products: products.slice(14, 20),
      layout: 'pricing-cards',
      color: 'from-blue-600 to-cyan-600',
      accentColor: 'blue',
    },
    {
      id: 'new-arrivals',
      title: '✨ Just Arrived',
      subtitle: 'Fresh inventory',
      products: products.slice(22, 28),
      layout: 'staggered-grid',
      color: 'from-pink-600 to-purple-600',
      accentColor: 'purple',
    },
    {
      id: 'snacks',
      title: '🍿 Snacks & Chips',
      subtitle: 'Best sellers',
      products: products.filter(p => p.categoryId === 'snacks').slice(0, 8),
      layout: 'compact-tiles',
      color: 'from-amber-600 to-yellow-600',
      accentColor: 'amber',
    },
    {
      id: 'brand-pepsi',
      title: 'Pepsi Collection',
      subtitle: 'All your favorites',
      products: products.filter(p => p.brand === 'Pepsi' || p.name?.includes('Pepsi')).slice(0, 8),
      layout: 'brand-wall',
      color: 'from-blue-700 to-blue-900',
      brandLogo: '🥤',
      accentColor: 'blue',
    },
    {
      id: 'beverages',
      title: '🥤 Cold Beverages',
      subtitle: 'Refreshment station',
      products: products.filter(p => p.categoryId === 'beverages').slice(0, 12),
      layout: 'wide-cards',
      color: 'from-cyan-600 to-blue-600',
      accentColor: 'cyan',
    },
    {
      id: 'quick-reorder',
      title: '⚡ Quick Reorder',
      subtitle: 'From your history',
      products: products.slice(5, 17),
      layout: 'list-view',
      color: 'from-green-600 to-emerald-600',
      accentColor: 'green',
    },
    {
      id: 'candy',
      title: '🍬 Candy & Sweets',
      subtitle: 'Popular picks',
      products: products.filter(p => p.categoryId === 'candy').slice(0, 16),
      layout: 'dense-grid',
      color: 'from-pink-500 to-rose-600',
      accentColor: 'pink',
    },
    {
      id: 'wholesale-bundles',
      title: '💎 Bundle Deals',
      subtitle: 'Curated collections',
      products: products.slice(30, 36),
      layout: 'bundle-cards',
      color: 'from-purple-600 to-indigo-600',
      accentColor: 'purple',
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
      case 'netflix-curtain':
        return (
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItMnptMC00djJ6bTAtNHYyem0wLTR2MnptMC00djJ6bTAtNHYyem0wLTR2MnptMC00djJ6bTAtNHYyem0wLTJ2MnptLTIgMGgyem0tNCAwaDJ6bS00IDBoMnptLTQgMGgyem0tNCAwaDJ6bS00IDBoMnptLTQgMGgyem0tNCAwaDJ6bS00IDBoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
            <div className="relative z-10">
              <div className="text-6xl mb-4">{section.brandLogo}</div>
              <h3 className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {section.title}
              </h3>
              <p className="text-slate-400 mb-6">Complete {section.title} Collection</p>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {section.products.map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-48"
                  >
                    {renderProductCard(p, i, section.accentColor)}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'hero-grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            <div className="col-span-2 md:row-span-2">
              {section.products[0] && renderProductCard(section.products[0], 0, section.accentColor)}
            </div>
            {section.products.slice(1).map((p: any, i: number) => renderProductCard(p, i + 1, section.accentColor))}
          </div>
        );

      case 'carousel-snap':
        return (
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-2 px-2 md:mx-0">
            {section.products.map((p: any, i: number) => (
              <div key={p.id} className="flex-shrink-0 w-48 md:w-64 snap-start">
                {renderProductCard(p, i, section.accentColor)}
              </div>
            ))}
          </div>
        );

      case 'brand-spotlight':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-slate-700">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="text-3xl md:text-5xl">{section.brandLogo}</div>
              <div>
                <h4 className="text-lg md:text-2xl font-black text-white">{section.title}</h4>
                <p className="text-xs md:text-base text-slate-400">{section.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
              {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
            </div>
          </div>
        );

      case 'pricing-cards':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'staggered-grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {section.products.map((p: any, i: number) => (
              <div key={p.id} className={i % 3 === 0 ? 'col-span-2' : ''}>
                {renderProductCard(p, i, section.accentColor)}
              </div>
            ))}
          </div>
        );

      case 'compact-tiles':
        return (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 md:gap-2">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'brand-wall':
        return (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
              {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
            </div>
          </div>
        );

      case 'wide-cards':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'list-view':
        return (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-3">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'dense-grid':
        return (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 md:gap-2">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );

      case 'bundle-cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.products.map((p: any, i: number) => (
              <div key={p.id} className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 rounded-2xl p-4 border border-purple-500/30">
                {renderProductCard(p, i, section.accentColor)}
                <div className="mt-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-bold mb-2">Bundle with 2 more items</p>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-black">
                    Save 30% on Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.products.map((p: any, i: number) => renderProductCard(p, i, section.accentColor))}
          </div>
        );
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

      {/* Mode Switcher */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setViewMode('browse')}
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
                viewMode === 'browse'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Browse Catalog
            </button>
            <button
              onClick={() => setViewMode('bulk')}
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
                viewMode === 'bulk'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Bulk Order
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Stats Bar */}
      {viewMode === 'browse' && (
        <div className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
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
      )}

      {/* Browse Mode - Product Sections */}
      {viewMode === 'browse' && (
        <main className="max-w-7xl mx-auto px-2 md:px-4 py-8 md:py-12 space-y-12 md:space-y-20">
          {productSections.map((section, sectionIndex) => (
          <div key={section.id}>
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 px-2">
                <div className={`h-8 md:h-12 w-1.5 md:w-2 rounded-full bg-gradient-to-b ${section.color}`} />
                <div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black">{section.title}</h2>
                  <p className="text-xs md:text-base text-slate-400 font-semibold">{section.subtitle}</p>
                </div>
              </div>

              {renderSection(section)}
            </motion.section>

            {/* Commercial GIF Spots - Every 3rd section */}
            {(sectionIndex + 1) % 3 === 0 && sectionIndex < productSections.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="my-8 md:my-12 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 cursor-pointer group"
              >
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-16 flex items-center justify-center min-h-[200px] md:min-h-[300px]">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10" />
                  <div className="relative text-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-6xl md:text-8xl mb-4"
                    >
                      🎬
                    </motion.div>
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Featured Deal
                    </h3>
                    <p className="text-sm md:text-lg text-slate-400 mb-4">Exclusive promotional content</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full text-white font-bold text-sm md:text-base group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                      <span>See More</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
        </main>
      )}

      {/* Bulk Order Mode */}
      {viewMode === 'bulk' && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-white mb-2">Bulk Order Sheet</h2>
            <p className="text-slate-400">Quickly order multiple products at once</p>
          </div>

          {/* Bulk Order Table */}
          <div className="bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b-2 border-slate-800 p-4">
              <div className="grid grid-cols-12 gap-4 font-black text-white text-sm">
                <div className="col-span-1">Image</div>
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Subtotal</div>
                <div className="col-span-1">Action</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
              {products.map((product) => {
                const qty = bulkOrders[product.id] || 0;
                const caseCount = product.unitsPerCase || 12;
                return (
                  <div
                    key={product.id}
                    className={`grid grid-cols-12 gap-4 p-4 items-center transition-all ${
                      qty > 0 ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Image */}
                    <div className="col-span-1">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="col-span-4">
                      <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-slate-400">{product.brand} • {caseCount} units/case</p>
                    </div>

                    {/* Price */}
                    <div className="col-span-2">
                      <p className="text-lg font-black text-cyan-400">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">ea</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBulkOrders(prev => ({ ...prev, [product.id]: Math.max(0, (prev[product.id] || 0) - 1) }))}
                          className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-all"
                          disabled={qty === 0}
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) => setBulkOrders(prev => ({ ...prev, [product.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-black text-white focus:border-cyan-500 outline-none"
                        />
                        <button
                          onClick={() => setBulkOrders(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))}
                          className="w-8 h-8 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-all"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => setBulkOrders(prev => ({ ...prev, [product.id]: caseCount }))}
                          className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-slate-300"
                        >
                          1 Case
                        </button>
                        <button
                          onClick={() => setBulkOrders(prev => ({ ...prev, [product.id]: caseCount * 5 }))}
                          className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-slate-300"
                        >
                          5 Cases
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2">
                      <p className="text-xl font-black text-white">${(product.price * qty).toFixed(2)}</p>
                    </div>

                    {/* Action */}
                    <div className="col-span-1">
                      {qty > 0 && (
                        <button
                          onClick={() => setBulkOrders(prev => {
                            const newOrders = { ...prev };
                            delete newOrders[product.id];
                            return newOrders;
                          })}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bulk Order Summary */}
          <div className="mt-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border-2 border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Items Selected</p>
                <p className="text-3xl font-black text-white">{Object.keys(bulkOrders).filter(id => bulkOrders[id] > 0).length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Total Units</p>
                <p className="text-3xl font-black text-cyan-400">{Object.values(bulkOrders).reduce((a, b) => a + b, 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Order Total</p>
                <p className="text-3xl font-black text-green-400">
                  ${Object.entries(bulkOrders).reduce((sum, [id, qty]) => {
                    const product = products.find(p => p.id === id);
                    return sum + (product ? product.price * qty : 0);
                  }, 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    Object.entries(bulkOrders).forEach(([id, qty]) => {
                      if (qty > 0) {
                        const product = products.find(p => p.id === id);
                        if (product) handleAddToCart(product, qty, false);
                      }
                    });
                    setBulkOrders({});
                    setViewMode('browse');
                  }}
                  disabled={Object.values(bulkOrders).every(q => q === 0)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-black text-lg shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

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

      {/* Added to Cart Confirmation Modal */}
      <AnimatePresence>
        {showAddedConfirmation && lastAddedProduct && (() => {
          const caseCount = lastAddedProduct.unitsPerCase || 12;
          const currentQtyInCart = cart.find(item => item.id === lastAddedProduct.id)?.quantity || 0;
          const relatedProducts = products.filter(p => p.categoryId === lastAddedProduct.categoryId && p.id !== lastAddedProduct.id).slice(0, 3);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto"
              onClick={() => {
                setShowAddedConfirmation(false);
                setUpsellQuantities({});
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-4 md:p-6 max-w-2xl w-full border-2 border-green-500/30 shadow-2xl shadow-green-500/20 my-4"
              >
                {/* Success Header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-7 h-7 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-3xl font-black text-white mb-1">Added to Cart!</h3>
                    <p className="text-sm md:text-base text-green-400 font-bold">{lastAddedProduct.addedQuantity} units added</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddedConfirmation(false);
                      setUpsellQuantities({});
                    }}
                    className="p-2 hover:bg-slate-700 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                  </button>
                </div>

                {/* Product Info with Image */}
                <div className="bg-slate-800/50 rounded-2xl p-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/20">
                      {lastAddedProduct.imageUrl ? (
                        <img src={lastAddedProduct.imageUrl} alt={lastAddedProduct.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Package className="w-12 h-12 text-cyan-400/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white text-base md:text-lg mb-2 line-clamp-2">{lastAddedProduct.name}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          ${lastAddedProduct.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">/ unit</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <ShoppingCart className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-bold text-green-400">{currentQtyInCart} in cart</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Quantity Controls */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-4 md:p-6 border border-cyan-500/20 mb-6 space-y-4">
                  <h4 className="font-black text-white text-center text-base md:text-lg">Add More?</h4>

                  {/* Individual Units */}
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300">Individual Units</span>
                      <span className="text-xs text-cyan-400">${lastAddedProduct.price.toFixed(2)} ea</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-all"
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </button>
                      <div className="flex-1 bg-slate-700 rounded-xl py-3 text-center">
                        <span className="text-2xl font-black text-white">{modalQuantity}</span>
                        <span className="text-xs text-slate-400 block">units</span>
                      </div>
                      <button
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center justify-center transition-all"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          handleAddToCart(lastAddedProduct, modalQuantity, false);
                          setModalQuantity(1);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-black text-sm transition-all shadow-lg"
                      >
                        ADD
                      </button>
                    </div>
                  </div>

                  {/* Cases */}
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300">By Case</span>
                      <span className="text-xs text-blue-400">{caseCount} units/case • ${(lastAddedProduct.price * caseCount).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setModalCases(Math.max(1, modalCases - 1))}
                        className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-all"
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </button>
                      <div className="flex-1 bg-slate-700 rounded-xl py-3 text-center">
                        <span className="text-2xl font-black text-white">{modalCases}</span>
                        <span className="text-xs text-slate-400 block">{modalCases * caseCount} units</span>
                      </div>
                      <button
                        onClick={() => setModalCases(Math.min(10, modalCases + 1))}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center transition-all"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          handleAddToCart(lastAddedProduct, modalCases * caseCount, false);
                          setModalCases(1);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-black text-sm transition-all shadow-lg"
                      >
                        ADD
                      </button>
                    </div>

                    {/* Case Range Selector */}
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 5, 10].map(num => (
                        <button
                          key={num}
                          onClick={() => setModalCases(num)}
                          className={`py-2 rounded-lg font-bold text-xs transition-all ${
                            modalCases === num
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  <span className="text-slate-400 font-bold text-sm">BUNDLE & SAVE</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                </div>

                {/* Enhanced Upsell Bundle */}
                {relatedProducts.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 md:p-6 border border-purple-500/20 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h5 className="font-black text-white text-sm md:text-base">Frequently Bought Together</h5>
                      </div>
                      <span className="px-3 py-1 bg-purple-500 text-white text-xs font-black rounded-full">SAVE 30%</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      {relatedProducts.map((rp) => {
                        const qty = upsellQuantities[rp.id] || 0;
                        return (
                          <div
                            key={rp.id}
                            className={`bg-slate-800/50 rounded-xl p-3 border-2 transition-all ${
                              qty > 0 ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-slate-700'
                            }`}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                                {rp.imageUrl ? (
                                  <img src={rp.imageUrl} alt={rp.name} className="w-full h-full object-contain p-2" />
                                ) : (
                                  <Package className="w-12 h-12 text-slate-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-white font-bold line-clamp-2 mb-1">{rp.name}</p>
                                <p className="text-lg text-cyan-400 font-black">${rp.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setUpsellQuantities(prev => ({ ...prev, [rp.id]: Math.max(0, (prev[rp.id] || 0) - 1) }))}
                                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                  disabled={qty === 0}
                                >
                                  <Minus className="w-4 h-4 text-white" />
                                </button>
                                <div className="flex-1 py-2 bg-slate-700 rounded-lg text-center">
                                  <span className="font-black text-white text-lg">{qty}</span>
                                </div>
                                <button
                                  onClick={() => setUpsellQuantities(prev => ({ ...prev, [rp.id]: (prev[rp.id] || 0) + 1 }))}
                                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-all"
                                >
                                  <Plus className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bundle Summary */}
                    {Object.values(upsellQuantities).some(q => q > 0) && (
                      <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Bundle Total:</span>
                          <div className="text-right">
                            <div className="text-slate-400 line-through">
                              ${Object.entries(upsellQuantities).reduce((sum, [id, qty]) => {
                                const p = relatedProducts.find(rp => rp.id === id);
                                return sum + (p ? p.price * qty : 0);
                              }, 0).toFixed(2)}
                            </div>
                            <div className="text-purple-400 font-black text-lg">
                              ${(Object.entries(upsellQuantities).reduce((sum, [id, qty]) => {
                                const p = relatedProducts.find(rp => rp.id === id);
                                return sum + (p ? p.price * qty : 0);
                              }, 0) * 0.7).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        Object.entries(upsellQuantities).forEach(([id, qty]) => {
                          if (qty > 0) {
                            const product = relatedProducts.find(p => p.id === id);
                            if (product) handleAddToCart(product, qty, false);
                          }
                        });
                        setUpsellQuantities({});
                      }}
                      className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-black text-sm md:text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={Object.values(upsellQuantities).every(q => q === 0)}
                    >
                      <Gift className="w-5 h-5 inline mr-2" />
                      Add Bundle to Cart {Object.values(upsellQuantities).some(q => q > 0) && `(${Object.values(upsellQuantities).reduce((a, b) => a + b, 0)} items)`}
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowAddedConfirmation(false);
                      setUpsellQuantities({});
                    }}
                    className="flex-1 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                  >
                    Keep Shopping
                  </button>
                  <button
                    onClick={() => {
                      setShowAddedConfirmation(false);
                      setUpsellQuantities({});
                      alert('View cart coming soon!');
                    }}
                    className="flex-1 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-black shadow-lg shadow-cyan-500/30 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    View Cart ({cartCount})
                  </button>
                </div>
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
