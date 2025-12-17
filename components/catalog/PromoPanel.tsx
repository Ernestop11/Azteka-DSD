'use client'

import { motion } from 'framer-motion'
import { Percent, Zap, TrendingUp, Star } from 'lucide-react'

export interface PromoPanelProps {
  title: string
  discount: number // Percentage (e.g., 30 for 30%)
  productImage: string
  description?: string
  badge?: string
  backgroundColor?: string
  gradientFrom?: string
  gradientTo?: string
  onCtaClick?: () => void
  ctaText?: string
  variant?: 'chedraui' | 'walmart' | 'default'
  index?: number
}

const variantStyles = {
  chedraui: {
    gradient: 'from-red-600 via-red-500 to-orange-500',
    accentGradient: 'from-yellow-400 to-orange-500',
    borderColor: 'border-red-400',
    glowColor: 'shadow-red-500/50',
    iconColor: 'text-yellow-300',
  },
  walmart: {
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    accentGradient: 'from-yellow-300 to-yellow-500',
    borderColor: 'border-blue-400',
    glowColor: 'shadow-blue-500/50',
    iconColor: 'text-yellow-400',
  },
  default: {
    gradient: 'from-purple-600 via-pink-500 to-red-500',
    accentGradient: 'from-pink-400 to-red-500',
    borderColor: 'border-pink-400',
    glowColor: 'shadow-pink-500/50',
    iconColor: 'text-pink-200',
  },
}

export default function PromoPanel({
  title,
  discount,
  productImage,
  description,
  badge,
  backgroundColor,
  onCtaClick,
  ctaText = 'Ver Oferta',
  variant = 'default',
  index = 0,
}: PromoPanelProps) {
  const style = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ scale: 1.03, y: -8 }}
      className={`
        group relative overflow-hidden rounded-2xl
        border-2 ${style.borderColor}
        shadow-xl ${style.glowColor} hover:shadow-2xl
        transition-all duration-300
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-70" />

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Floating Festive Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 right-6"
        >
          <Star className={`w-8 h-8 ${style.iconColor} opacity-40`} fill="currentColor" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-6 left-4"
        >
          <Zap className={`w-10 h-10 ${style.iconColor} opacity-30`} fill="currentColor" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-6"
        >
          <Percent className={`w-6 h-6 ${style.iconColor} opacity-50`} />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left: Discount Badge */}
          <div className="flex-shrink-0">
            <motion.div
              animate={{
                rotate: [0, -3, 3, -3, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="relative"
            >
              {/* Circular Badge */}
              <div className={`
                relative w-28 h-28 md:w-32 md:h-32 rounded-full
                bg-gradient-to-br ${style.accentGradient}
                flex flex-col items-center justify-center
                shadow-2xl border-4 border-white/50
              `}>
                {/* Badge Shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-80" />

                {/* Badge Content */}
                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-none">
                    {discount}%
                  </div>
                  <div className="text-xs md:text-sm font-bold text-white/90 uppercase mt-1">
                    OFF
                  </div>
                </div>
              </div>

              {/* Pulsing Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${style.accentGradient} blur-xl`}
              />
            </motion.div>
          </div>

          {/* Center: Product Image */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <img
                src={productImage}
                alt={title}
                className="w-full h-full object-contain drop-shadow-2xl"
              />

              {/* Image Glow */}
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl -z-10" />
            </div>

            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute -top-2 -right-2"
              >
                <div className="px-3 py-1 bg-white rounded-full shadow-lg">
                  <span className="text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {badge}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-lg">
              {title}
            </h3>

            {description && (
              <p className="text-sm md:text-base text-white/90 mb-4 drop-shadow">
                {description}
              </p>
            )}

            {/* CTA Button */}
            {onCtaClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCtaClick}
                className="
                  relative group/btn px-6 py-3 rounded-full
                  bg-white text-gray-900
                  font-bold text-sm md:text-base
                  shadow-xl hover:shadow-2xl
                  flex items-center gap-2 mx-auto md:mx-0
                  transition-all duration-300
                "
              >
                {/* Button Shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-transparent to-transparent opacity-60" />

                <span className="relative z-10">{ctaText}</span>
                <TrendingUp className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform relative z-10" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </motion.div>
  )
}
