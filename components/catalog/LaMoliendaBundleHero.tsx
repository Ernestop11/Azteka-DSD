'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, Package, Award } from 'lucide-react'
import { useState } from 'react'

interface LaMoliendaBundleHeroProps {
  onBundleClick: () => void
}

export default function LaMoliendaBundleHero({ onBundleClick }: LaMoliendaBundleHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl mb-8 md:mb-12 shadow-2xl group cursor-pointer"
      onClick={onBundleClick}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-red-600" />

      {/* Animated Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Sparkle Effects */}
      <div className="absolute top-10 right-20 opacity-30">
        <Sparkles className="w-16 h-16 text-yellow-200 animate-pulse" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-20">
        <Sparkles className="w-20 h-20 text-amber-100 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Content Container */}
      <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16 min-h-[500px] md:min-h-[600px]">

        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-6 z-10"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
          >
            <Award className="w-5 h-5 text-amber-900" />
            <span className="text-amber-900 font-bold text-sm uppercase tracking-wider">
              Premium Bundle
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
            La Molienda
            <span className="block text-yellow-200">Bundle Deal</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            Premium display racks filled with authentic La Molienda products.
            Perfect for your store's featured display.
          </p>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <Package className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Choose your rack style</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Fully stocked & branded</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <ShoppingCart className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Ready to earn revenue</span>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/40">
              <div className="text-yellow-200 text-sm font-semibold uppercase">Wire Rack</div>
              <div className="text-white text-3xl font-bold">$1,300</div>
              <div className="text-white/80 text-sm">2x2 Branded Display</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/40">
              <div className="text-yellow-200 text-sm font-semibold uppercase">Mega Rack</div>
              <div className="text-white text-3xl font-bold">$2,300</div>
              <div className="text-white/80 text-sm">Wooden Pyramid Display</div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center gap-3 px-8 py-5
              bg-white text-orange-600 rounded-2xl
              font-bold text-xl shadow-2xl
              hover:shadow-white/50
              transition-all duration-300
              group/btn
            "
          >
            <ShoppingCart className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
            Build Your Bundle
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl"
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Right: Product Image */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          className="relative z-10 flex items-center justify-center"
        >
          {/* Glow Effect Behind Product */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-orange-300/40 to-red-400/40 blur-3xl scale-110 animate-pulse" />

          {/* Product Container */}
          <div className="relative">
            {/* Floating Animation Container */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 2, 0, -2, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Product Image Placeholder */}
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-2xl" />
                <img
                  src="/la-molienda-product.png"
                  alt="La Molienda Bundle"
                  className={`
                    relative w-full h-full object-contain drop-shadow-2xl
                    transition-opacity duration-700
                    ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                  `}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    // Fallback if image doesn't exist
                    setImageLoaded(true)
                  }}
                />

                {/* Loading State */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-32 h-32 text-white/50 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Floating Sparkles */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-8 -right-8 w-16 h-16 bg-yellow-300 rounded-full blur-xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-8 -left-8 w-20 h-20 bg-orange-400 rounded-full blur-xl"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Shine Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Hover Shine Animation */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.section>
  )
}
