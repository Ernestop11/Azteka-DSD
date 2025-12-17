'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, Package, Zap } from 'lucide-react'
import { useState } from 'react'

interface BarcelBundleHeroProps {
  onBundleClick: () => void
}

export default function BarcelBundleHero({ onBundleClick }: BarcelBundleHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl mb-8 md:mb-12 shadow-2xl group cursor-pointer"
      onClick={onBundleClick}
    >
      {/* Background - Barcel Purple/Blue theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-700" />

      {/* Animated Wave Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,40 50,50 T100,50 L100,100 L0,100 Z" fill="white" opacity="0.5" />
          <path d="M0,60 Q25,50 50,60 T100,60 L100,100 L0,100 Z" fill="white" opacity="0.3" />
        </svg>
      </div>

      {/* Sparkles */}
      <div className="absolute top-10 right-20 opacity-30">
        <Zap className="w-16 h-16 text-yellow-200 animate-pulse" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-20">
        <Sparkles className="w-20 h-20 text-purple-100 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16 min-h-[500px]">

        {/* Left: Product Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          className="relative z-10 flex items-center justify-center order-2 md:order-1"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 via-blue-300/40 to-indigo-400/40 blur-3xl scale-110 animate-pulse" />

          {/* Product */}
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, -3, 0, 3, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full max-w-md aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-2xl" />
              <img
                src="/barcel-product.png"
                alt="Barcel Display"
                className={`
                  relative w-full h-full object-contain drop-shadow-2xl
                  transition-opacity duration-700
                  ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />

              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-32 h-32 text-white/50 animate-pulse" />
                </div>
              )}
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="absolute -top-8 -left-8 w-16 h-16 bg-purple-300 rounded-full blur-xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1
              }}
              className="absolute -bottom-8 -right-8 w-20 h-20 bg-blue-400 rounded-full blur-xl"
            />
          </div>
        </motion.div>

        {/* Right: Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-6 z-10 order-1 md:order-2"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-purple-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
          >
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-purple-100 font-bold text-sm uppercase tracking-wider">
              Premium Selection
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
            Barcel
            <span className="block text-purple-300">Elite Collection</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/95 leading-relaxed">
            Premium snacks with bold flavors! Featuring Takis, Hot Nuts, and more top-selling Barcel products.
          </p>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <Package className="w-6 h-6 text-purple-300" />
              <span className="text-lg font-semibold">Takis & hot snacks variety</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="w-6 h-6 text-purple-300" />
              <span className="text-lg font-semibold">Eye-catching display stand</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Zap className="w-6 h-6 text-purple-300" />
              <span className="text-lg font-semibold">High-margin products</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/40">
              <div className="text-purple-200 text-sm font-semibold uppercase">Starter Set</div>
              <div className="text-white text-3xl font-bold">$750</div>
              <div className="text-white/80 text-sm">48 bags assorted</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/40">
              <div className="text-purple-200 text-sm font-semibold uppercase">Complete Display</div>
              <div className="text-white text-3xl font-bold">$1,450</div>
              <div className="text-white/80 text-sm">96+ bags + stand</div>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center gap-3 px-8 py-5
              bg-white text-purple-700 rounded-2xl
              font-bold text-xl shadow-2xl
              hover:shadow-white/50
              transition-all duration-300
              group/btn
            "
          >
            <ShoppingCart className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
            Build Your Barcel Display
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl"
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Hover Shine */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.section>
  )
}
