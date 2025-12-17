'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import ProductCard from './ProductCard'

interface PromotionalHeroProps {
  title: string
  subtitle?: string
  description?: string
  gradient?: string
  backgroundColor?: string
  products?: any[]
  imagePosition?: 'left' | 'right' | 'center'
  ctaText?: string
  ctaLink?: string
  theme?: 'default' | 'holiday' | 'summer' | 'black-friday'
  animated?: boolean
}

export default function PromotionalHero({
  title,
  subtitle,
  description,
  gradient = 'from-blue-600 via-purple-600 to-pink-600',
  backgroundColor,
  products = [],
  imagePosition = 'right',
  ctaText = 'Shop Now',
  ctaLink = '/catalog',
  theme = 'default',
  animated = true,
}: PromotionalHeroProps) {
  const bgStyle = backgroundColor 
    ? { backgroundColor }
    : { background: `linear-gradient(135deg, var(--tw-gradient-stops))` }

  const themeStyles = {
    'black-friday': 'from-red-600 via-yellow-500 to-red-600',
    'holiday': 'from-red-600 via-green-600 to-red-600',
    'summer': 'from-cyan-400 via-blue-500 to-purple-500',
    'default': gradient,
  }

  const finalGradient = themeStyles[theme] || gradient

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${finalGradient} shadow-2xl`}
          style={bgStyle}
        >
          {/* Animated Background Pattern */}
          {animated && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Floating Particles */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}

              {/* Sparkle Effects */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
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
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 p-6 md:p-10 lg:p-16">
            <div className={`flex flex-col ${imagePosition === 'right' ? 'lg:flex-row' : imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-col'} items-center gap-8 lg:gap-12`}>
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  {subtitle && (
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">
                      {subtitle}
                    </div>
                  )}
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg">
                    {title}
                  </h2>
                  
                  {description && (
                    <p className="text-lg md:text-xl text-white/90 font-medium mb-6 max-w-2xl">
                      {description}
                    </p>
                  )}

                  <Link
                    href={ctaLink}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    {ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              {/* Products Grid */}
              {products && products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 w-full"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((product: any, index: number) => (
                      <motion.div
                        key={product.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <ProductCard product={product} index={index} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

