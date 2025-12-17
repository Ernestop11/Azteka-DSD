'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Star } from 'lucide-react'
import Link from 'next/link'

interface DiscountBannerProps {
  title: string
  subtitle?: string
  discount: number
  discountText: string
  validFrom?: string
  validTo?: string
  theme?: 'black-friday' | 'christmas' | 'summer' | 'default'
  backgroundColor?: string
  textColor?: string
  products?: any[]
  ctaText?: string
  ctaLink?: string
  size?: 'full' | 'half' | 'card'
}

export default function DiscountBanner({
  title,
  subtitle,
  discount,
  discountText,
  validFrom,
  validTo,
  theme = 'default',
  backgroundColor,
  textColor = '#FFFFFF',
  products = [],
  ctaText = 'Shop Now',
  ctaLink = '/catalog',
  size = 'full',
}: DiscountBannerProps) {
  // Theme-based styling
  const themeStyles = {
    'black-friday': {
      bg: 'bg-gradient-to-r from-red-600 via-yellow-500 to-red-600',
      pattern: 'bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)]',
    },
    'christmas': {
      bg: 'bg-gradient-to-r from-red-600 via-green-600 to-red-600',
      pattern: 'bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)]',
    },
    'summer': {
      bg: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500',
      pattern: 'bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)]',
    },
    'default': {
      bg: 'bg-gradient-to-r from-blue-600 to-purple-600',
      pattern: 'bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)]',
    },
  }

  const style = themeStyles[theme] || themeStyles.default
  const bgColor = backgroundColor || style.bg

  // Format validity dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const containerClass = size === 'full' 
    ? 'w-full' 
    : size === 'half' 
    ? 'w-full md:w-1/2' 
    : 'w-full max-w-md'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${containerClass} relative overflow-hidden rounded-2xl shadow-2xl`}
      style={{
        background: backgroundColor || undefined,
      }}
    >
      {/* Background Pattern */}
      <div className={`absolute inset-0 ${style.pattern} bg-[length:40px_40px] opacity-30`} />

      {/* Animated Stars/Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10 lg:p-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Text Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                  {formatDate(validFrom)} - {formatDate(validTo)}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-lg">
                {title}
              </h2>
              
              {subtitle && (
                <p className="text-lg md:text-xl text-white/90 font-semibold mb-4">
                  {subtitle}
                </p>
              )}

              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
              >
                {ctaText}
                <span>→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Discount Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="relative"
          >
            <div className="relative">
              {/* Large Discount Percentage */}
              <div className="text-7xl md:text-8xl lg:text-9xl font-black text-white drop-shadow-2xl">
                {discount}%
              </div>
              
              {/* Discount Text */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm md:text-base shadow-lg">
                  {discountText}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4">
                <Star className="w-8 h-8 text-yellow-300 animate-pulse" fill="currentColor" />
              </div>
              <div className="absolute -bottom-8 -left-4">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Images (if provided) */}
        {products && products.length > 0 && (
          <div className="mt-8 grid grid-cols-4 md:grid-cols-6 gap-4">
            {products.slice(0, 6).map((product: any, index: number) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative aspect-square bg-white/20 rounded-lg overflow-hidden backdrop-blur-sm"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

