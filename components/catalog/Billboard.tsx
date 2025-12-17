'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star } from 'lucide-react'

interface BillboardProps {
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  imagePosition?: 'left' | 'right'
  ctaText?: string
  ctaLink?: string
  theme?: 'blue' | 'purple' | 'emerald' | 'orange'
  overlay?: boolean
  onCtaClick?: () => void
}

const themeGradients = {
  blue: {
    bg: 'from-blue-600 via-cyan-600 to-blue-700',
    accent: 'from-blue-400 to-cyan-500',
    text: 'text-blue-600',
  },
  purple: {
    bg: 'from-purple-600 via-pink-600 to-purple-700',
    accent: 'from-purple-400 to-pink-500',
    text: 'text-purple-600',
  },
  emerald: {
    bg: 'from-emerald-600 via-teal-600 to-emerald-700',
    accent: 'from-emerald-400 to-teal-500',
    text: 'text-emerald-600',
  },
  orange: {
    bg: 'from-orange-600 via-amber-600 to-orange-700',
    accent: 'from-orange-400 to-amber-500',
    text: 'text-orange-600',
  },
}

export default function Billboard({
  title,
  subtitle,
  description,
  imageUrl,
  imagePosition = 'right',
  ctaText,
  ctaLink,
  theme = 'blue',
  overlay = true,
  onCtaClick,
}: BillboardProps) {
  const colors = themeGradients[theme]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl shadow-2xl"
    >
      <div
        className={`
        relative grid grid-cols-1 lg:grid-cols-2 gap-0
        bg-gradient-to-br ${colors.bg}
        min-h-[400px] lg:min-h-[500px]
      `}
      >
        {/* Content Side */}
        <div
          className={`
          relative z-10 p-8 md:p-12 lg:p-16
          flex flex-col justify-center
          ${imagePosition === 'right' ? 'order-1' : 'order-2'}
        `}
        >
          {/* Decorative Elements */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-10 right-10 opacity-20"
          >
            <Sparkles className="w-32 h-32 text-white" />
          </motion.div>

          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-10 left-10 opacity-10"
          >
            <Star className="w-40 h-40 text-white" />
          </motion.div>

          {/* Content */}
          <div className="relative space-y-6 max-w-xl">
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
              >
                <span className="text-white text-sm font-bold uppercase tracking-wider">
                  {subtitle}
                </span>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              {title}
            </motion.h2>

            {description && (
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-white/90 leading-relaxed"
              >
                {description}
              </motion.p>
            )}

            {(ctaText || onCtaClick) && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCtaClick}
                  className="
                    group/btn
                    px-8 py-4 rounded-full
                    bg-white text-gray-900
                    font-bold text-lg
                    shadow-2xl hover:shadow-white/30
                    flex items-center gap-3
                    transition-all duration-300
                  "
                >
                  {ctaText || 'Shop Now'}
                  <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Image Side */}
        <div
          className={`
          relative overflow-hidden
          ${imagePosition === 'right' ? 'order-2' : 'order-1'}
        `}
        >
          {/* Image */}
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Overlay */}
          {overlay && (
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-40`} />
          )}

          {/* Glossy Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50" />
        </div>

        {/* Connecting Gradient */}
        <div
          className={`
          absolute inset-0
          bg-gradient-to-${imagePosition === 'right' ? 'r' : 'l'}
          from-transparent via-transparent to-black/10
          pointer-events-none
        `}
        />
      </div>
    </motion.div>
  )
}
