import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ShoppingCart, Sparkles, Users, Briefcase, ArrowRight, Play, Package, Star, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../lib/brandData';
import * as THREE from 'three';

function RotatingProduct({ position, product, index }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time + index) * 0.2;
      meshRef.current.rotation.y = time * 0.3 + index;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={product.backgroundColor || '#4F46E5'} />
    </mesh>
  );
}

function Scene3D() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 5);

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {featuredProducts.map((product, i) => (
        <RotatingProduct
          key={product.id}
          product={product}
          position={[
            Math.cos((i / featuredProducts.length) * Math.PI * 2) * 3,
            0,
            Math.sin((i / featuredProducts.length) * Math.PI * 2) * 3,
          ]}
          index={i}
        />
      ))}
    </>
  );
}

export default function CatalogPage() {
  const navigate = useNavigate();

  const catalogModes = [
    {
      id: 'online',
      title: 'Online Catalog',
      subtitle: 'Browse Without Prices',
      description: 'Explore our product catalog and request access to full pricing and ordering',
      icon: Sparkles,
      color: 'from-blue-500 via-blue-600 to-cyan-500',
      features: ['No Pricing Shown', 'Request Account', 'View Products'],
      path: '/catalog/online',
    },
    {
      id: 'customer',
      title: 'Customer Portal',
      subtitle: 'Smart Ordering',
      description: 'Easy reordering, bulk options, gamification, and exclusive bundles',
      icon: ShoppingCart,
      color: 'from-emerald-500 via-green-600 to-teal-500',
      features: ['Quick Reorder', 'Bulk Options', 'Loyalty Points', 'Smart Bundles'],
      path: '/catalog/customer',
    },
    {
      id: 'salesrep',
      title: 'Sales Rep Mode',
      subtitle: 'Business-Adaptive',
      description: 'Customizable catalog per business with handoff mode for tablet orders',
      icon: Briefcase,
      color: 'from-purple-500 via-purple-600 to-pink-500',
      features: ['Business Switcher', 'Handoff Mode', 'Custom Pricing', 'Rep Tools'],
      path: '/catalog/salesrep',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section with 3D Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <Scene3D />
          </Canvas>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AZTEKA DSD
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-gray-300 mb-4">
              Wholesale Distribution Reimagined
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              Choose your experience: Browse our catalog, manage orders with smart features, or use sales rep tools
            </p>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all"
            >
              <Play className="w-6 h-6" />
              Choose Your Mode
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
        </motion.div>
      </section>

      {/* Brand Banners */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* La Molienda Banner */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-64 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h3 className="text-4xl font-black text-white mb-2">LA MOLIENDA</h3>
                  <p className="text-white/90 font-semibold">Premium Mexican Products</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Marinela Banner */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-64 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Gift className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h3 className="text-4xl font-black text-white mb-2">MARINELA</h3>
                  <p className="text-white/90 font-semibold">Beloved Bakery Favorites</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Catalog Modes - Colorful Cards */}
      <section id="modes" className="py-24 bg-gradient-to-b from-gray-800/50 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-4">Choose Your Experience</h2>
            <p className="text-xl text-gray-400">Three powerful ways to interact with our catalog</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {catalogModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => navigate(mode.path)}
                  className="relative group cursor-pointer"
                >
                  {/* Card */}
                  <div className="relative h-full bg-white/5 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                    {/* Content */}
                    <div className="relative p-8 h-full flex flex-col">
                      {/* Icon */}
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${mode.color} mb-6 self-start`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-3xl font-black mb-2">{mode.title}</h3>
                      <p className={`text-sm font-bold bg-gradient-to-r ${mode.color} bg-clip-text text-transparent mb-4`}>
                        {mode.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-gray-300 mb-6 flex-grow">{mode.description}</p>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {mode.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <button className={`w-full py-4 rounded-xl font-bold bg-gradient-to-r ${mode.color} text-white shadow-lg group-hover:shadow-2xl transition-all flex items-center justify-center gap-2`}>
                        Open {mode.title}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${mode.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity -z-10`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Products', value: products.length, icon: Package },
              { label: 'Brands', value: '12+', icon: Star },
              { label: 'Categories', value: '8', icon: Zap },
              { label: 'Happy Customers', value: '500+', icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10"
                >
                  <Icon className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                  <div className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-semibold">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 Azteka DSD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
