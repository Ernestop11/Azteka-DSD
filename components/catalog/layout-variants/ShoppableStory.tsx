'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import type { CatalogProduct } from '@/src/types/catalog'

export interface StoryPanel {
  id: string
  imageUrl: string
  title: string
  description: string
  product?: CatalogProduct
  backgroundColor?: string
  textColor?: 'light' | 'dark'
}

export interface ShoppableStoryProps {
  panels: StoryPanel[]
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

export default function ShoppableStory({
  panels,
  onProductClick,
  onAddToCart,
}: ShoppableStoryProps) {
  return (
    <div className="space-y-0">
      {panels.map((panel, index) => (
        <StoryPanelCard
          key={panel.id}
          panel={panel}
          index={index}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

// Individual Story Panel Component
interface StoryPanelCardProps {
  panel: StoryPanel
  index: number
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

function StoryPanelCard({
  panel,
  index,
  onProductClick,
  onAddToCart,
}: StoryPanelCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const bgColor = panel.backgroundColor || 'from-gray-900 to-gray-800'
  const textColor = panel.textColor === 'light' ? 'text-white' : 'text-gray-900'

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor}`} />

      {/* Parallax Background Image */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-30"
      >
        <img
          src={panel.imageUrl}
          alt={panel.title}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Panel Number */}
            <div className={`text-6xl font-black ${textColor} opacity-20`}>
              {String(index + 1).padStart(2, '0')}
            </div>

            {/* Title */}
            <h2 className={`text-5xl md:text-6xl lg:text-7xl font-black ${textColor} leading-tight`}>
              {panel.title}
            </h2>

            {/* Description */}
            <p className={`text-xl md:text-2xl ${textColor} opacity-90 leading-relaxed`}>
              {panel.description}
            </p>

            {/* Product CTA (if product exists) */}
            {panel.product && (
              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onProductClick?.(panel.product!.id)}
                  className="inline-flex items-center gap-3 text-2xl font-bold group"
                >
                  <span className={textColor}>Ver Producto</span>
                  <ChevronRight className={`w-8 h-8 ${textColor} group-hover:translate-x-2 transition-transform`} />
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Product Card (if product exists) */}
          {panel.product && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
                {/* Glossy Overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70 pointer-events-none" />

                {/* Product Image */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative mb-8"
                >
                  <img
                    src={panel.product.imageUrl}
                    alt={panel.product.name}
                    className="w-full h-80 object-contain drop-shadow-2xl"
                  />

                  {/* Floating Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-full blur-3xl opacity-30 -z-10" />
                </motion.div>

                {/* Product Info */}
                <div className="space-y-4">
                  {panel.product.brand && (
                    <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                      {typeof panel.product.brand === 'string' ? panel.product.brand : panel.product.brand?.name || ''}
                    </p>
                  )}

                  <h3 className="text-2xl lg:text-3xl font-black text-gray-900">
                    {panel.product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${panel.product.price.toFixed(2)}
                    </span>
                    {panel.product.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        ${panel.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart?.(panel.product!.id)}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>Agregar al Carrito</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </motion.div>
  )
}
