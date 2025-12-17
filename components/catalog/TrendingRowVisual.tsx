'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Flame, Zap } from 'lucide-react'

export interface TrendingProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  discount?: number
  badge?: string
}

export interface TrendingRowVisualProps {
  title?: string
  subtitle?: string
  products: TrendingProduct[]
  gradientTheme?: 'red' | 'blue' | 'purple' | 'gold'
  onProductClick?: (productId: string) => void
}

const gradientThemes = {
  red: {
    background: 'from-red-600 via-orange-500 to-red-700',
    card: 'from-red-100 via-orange-50 to-red-100',
    glow: 'shadow-red-500/50',
    text: 'text-red-600',
    accentGradient: 'from-red-500 to-orange-600',
  },
  blue: {
    background: 'from-blue-600 via-cyan-500 to-blue-700',
    card: 'from-blue-100 via-cyan-50 to-blue-100',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-600',
    accentGradient: 'from-blue-500 to-cyan-600',
  },
  purple: {
    background: 'from-purple-600 via-pink-500 to-purple-700',
    card: 'from-purple-100 via-pink-50 to-purple-100',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-600',
    accentGradient: 'from-purple-500 to-pink-600',
  },
  gold: {
    background: 'from-yellow-600 via-amber-500 to-yellow-700',
    card: 'from-yellow-100 via-amber-50 to-yellow-100',
    glow: 'shadow-yellow-500/50',
    text: 'text-yellow-700',
    accentGradient: 'from-yellow-500 to-amber-600',
  },
}

export default function TrendingRowVisual({
  title = "¡Tendencias Ahora!",
  subtitle = "Los más vendidos",
  products,
  gradientTheme = 'red',
  onProductClick,
}: TrendingRowVisualProps) {
  const theme = gradientThemes[gradientTheme]

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Flowing Gradient Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`
            absolute inset-0
            bg-gradient-to-r ${theme.background}
            opacity-10
          `}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Animated Flame Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
          >
            <Flame className={`w-8 h-8 ${theme.text} opacity-20`} />
          </motion.div>
        ))}
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          {/* Icon Badge */}
          <motion.div
            animate={{
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="inline-block mb-4"
          >
            <div className={`
              relative inline-flex items-center gap-2
              px-6 py-3 rounded-full
              bg-gradient-to-r ${theme.accentGradient}
              shadow-2xl ${theme.glow}
            `}>
              {/* Badge Glossy Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70" />

              <TrendingUp className="w-6 h-6 text-white relative z-10" />
              <span className="text-white font-bold text-sm uppercase tracking-wide relative z-10">
                Trending
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3 drop-shadow-lg">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 font-semibold">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Horizontal Scroll Cards */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 100,
                }}
                whileHover={{ scale: 1.05, y: -15 }}
                onClick={() => onProductClick?.(product.id)}
                className="flex-shrink-0 w-80 cursor-pointer group"
              >
                <div className={`
                  relative overflow-hidden rounded-3xl
                  shadow-xl group-hover:shadow-2xl ${theme.glow}
                  transition-all duration-300
                  border-2 border-transparent group-hover:border-white
                `}>
                  {/* Card Background with Gradient */}
                  <div className={`
                    relative
                    bg-gradient-to-br ${theme.card}
                    p-8
                  `}>
                    {/* Glossy Top Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-transparent opacity-80" />

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    {/* Floating Zap Icon */}
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute top-4 right-4"
                    >
                      <Zap className={`w-8 h-8 ${theme.text} opacity-30`} fill="currentColor" />
                    </motion.div>

                    {/* Product Image */}
                    <div className="relative mb-6 h-64 flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Image Glow */}
                      <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl -z-10 scale-75" />
                    </div>

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4">
                        <div className={`
                          px-4 py-2 rounded-full
                          bg-gradient-to-r ${theme.accentGradient}
                          shadow-lg
                        `}>
                          <span className="text-xs font-bold text-white uppercase">
                            {product.badge}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* Price & Discount */}
                      <div className="flex items-center gap-3">
                        {product.price && (
                          <div className="text-3xl font-black text-transparent bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                            ${product.price.toFixed(2)}
                          </div>
                        )}

                        {product.discount && (
                          <div className={`
                            px-3 py-1 rounded-full
                            bg-gradient-to-r ${theme.accentGradient}
                            shadow-lg
                          `}>
                            <span className="text-sm font-bold text-white">
                              -{product.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-b-3xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Hint */}
        {products.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <motion.span
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ←
              </motion.span>
              Desliza para ver más
              <motion.span
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
