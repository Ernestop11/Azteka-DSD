'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, Package, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface SabritasBundleHeroProps {
  onBundleClick: () => void
}

export default function SabritasBundleHero({ onBundleClick }: SabritasBundleHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl mb-8 md:mb-12 shadow-2xl group cursor-pointer"
      onClick={onBundleClick}
    >
      {/* Background - Sabritas Red/Yellow theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-yellow-500 to-orange-600" />

      {/* Animated Chip Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0), radial-gradient(circle at 75px 75px, white 2px, transparent 0)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Sparkles */}
      <div className="absolute top-10 left-20 opacity-30">
        <Sparkles className="w-16 h-16 text-yellow-200 animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20">
        <Sparkles className="w-20 h-20 text-red-100 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16 min-h-[500px]">

        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-6 z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-red-700/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
          >
            <TrendingUp className="w-5 h-5 text-yellow-300" />
            <span className="text-yellow-100 font-bold text-sm uppercase tracking-wider">
              #1 Best Seller
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
            Sabritas
            <span className="block text-yellow-300">Mega Display</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/95 leading-relaxed">
            Mexico's favorite chip brand! Complete display with our best-selling Sabritas varieties.
          </p>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <Package className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">12+ Classic flavors included</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Premium floor stand display</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <ShoppingCart className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Proven high-volume seller</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/40">
              <div className="text-yellow-200 text-sm font-semibold uppercase">Starter Pack</div>
              <div className="text-white text-3xl font-bold">$850</div>
              <div className="text-white/80 text-sm">60 bags assorted</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-white/40">
              <div className="text-yellow-200 text-sm font-semibold uppercase">Full Display</div>
              <div className="text-white text-3xl font-bold">$1,650</div>
              <div className="text-white/80 text-sm">120+ bags + rack</div>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center gap-3 px-8 py-5
              bg-yellow-400 text-red-700 rounded-2xl
              font-bold text-xl shadow-2xl
              hover:shadow-yellow-400/50
              transition-all duration-300
              group/btn
            "
          >
            <ShoppingCart className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
            Build Your Sabritas Display
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl"
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Right: Product Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          className="relative z-10 flex items-center justify-center"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-red-300/40 to-orange-400/40 blur-3xl scale-110 animate-pulse" />

          {/* Product */}
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 3, 0, -3, 0]
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
                src="/sabritas-product.png"
                alt="Sabritas Display"
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
                delay: 1
              }}
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-red-400 rounded-full blur-xl"
            />
          </div>
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
