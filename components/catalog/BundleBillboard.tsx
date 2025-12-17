'use client'

import { motion } from 'framer-motion'
import { Package, Gift, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import type { CatalogBundle } from '@/lib/bundleBuilder'

interface BundleBillboardProps {
  bundle: CatalogBundle
  onBundleClick?: (bundle: CatalogBundle) => void
  variant?: 'default' | 'featured' | 'large'
}

export default function BundleBillboard({
  bundle,
  onBundleClick,
  variant = 'default',
}: BundleBillboardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleClick = () => {
    onBundleClick?.(bundle)
  }

  // Generate vibrant gradient based on bundle
  const getGradient = () => {
    if (bundle.brand?.name?.toLowerCase().includes('molienda')) {
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
    }
    if (bundle.discountPercent > 15) {
      return 'linear-gradient(135deg, #fa709a 0%, #fee140 25%, #30cfd0 50%, #330867 75%, #ff6b6b 100%)'
    }
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  }

  const isLarge = variant === 'large' || bundle.featured

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl shadow-2xl mb-12 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: getGradient(),
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-10 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Bundle Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white"
            >
              {/* Badge */}
              {bundle.badgeText && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
                  style={{ backgroundColor: bundle.badgeColor || '#10b981' }}
                >
                  {bundle.badgeText}
                </motion.div>
              )}

              {/* Bundle Name */}
              <h2 className={`${isLarge ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-5xl'} font-black mb-4 drop-shadow-2xl`}>
                {bundle.name}
              </h2>

              {/* Description */}
              {bundle.description && (
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                  {bundle.description}
                </p>
              )}

              {/* Rack Offer */}
              {bundle.rackOffer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-white/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-6 h-6 text-yellow-300" />
                    <h4 className="text-xl md:text-2xl font-black">{bundle.rackOffer.title}</h4>
                  </div>
                  <p className="text-white/90">{bundle.rackOffer.description}</p>
                </motion.div>
              )}

              {/* Pricing */}
              <div className="mb-6">
                {bundle.discountPercent > 0 ? (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl md:text-5xl font-black">
                      ${bundle.price.toFixed(2)}
                    </span>
                    <span className="text-2xl line-through text-white/60">
                      ${bundle.totalValue.toFixed(2)}
                    </span>
                    <span className="px-4 py-2 bg-red-600 rounded-full text-lg font-bold">
                      Save {bundle.discountPercent}%
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl md:text-5xl font-black">
                    ${bundle.price.toFixed(2)}
                  </span>
                )}
                <p className="text-white/80 mt-2 text-lg">
                  {bundle.products.length} products included
                </p>
                {bundle.savings > 0 && (
                  <p className="text-green-300 font-bold text-lg mt-1">
                    You save ${bundle.savings.toFixed(2)}!
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/50"
              >
                <ShoppingCart className="w-6 h-6" />
                Choose Package & Add to Cart
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Right: Product Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
            >
              {bundle.products.slice(0, 12).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="relative aspect-square bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all group"
                >
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-white/5 animate-pulse" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                    <p className="text-xs text-white font-semibold truncate">
                      {product.name}
                    </p>
                    {product.quantity > 1 && (
                      <p className="text-xs text-white/70">
                        Qty: {product.quantity}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sparkle Effects */}
      {bundle.featured && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  )
}

