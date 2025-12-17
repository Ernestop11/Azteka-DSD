'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'

export interface ShowcaseProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  badge?: string
}

export interface ShowcaseSectionVisualProps {
  title: string
  subtitle?: string
  products: ShowcaseProduct[]
  backgroundPattern?: 'festive' | 'geometric' | 'gradient'
  layout?: 'horizontal' | 'grid'
  onProductClick?: (productId: string) => void
  onViewAll?: () => void
  ribbonColor?: string
}

const backgroundPatterns = {
  festive: `
    radial-gradient(circle at 20% 30%, rgba(255, 200, 50, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 100, 150, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(100, 150, 255, 0.1) 0%, transparent 50%)
  `,
  geometric: `
    linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(225deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(315deg, rgba(255,255,255,0.1) 25%, transparent 25%)
  `,
  gradient: `
    linear-gradient(135deg, rgba(255, 200, 100, 0.2) 0%, rgba(255, 100, 200, 0.15) 50%, rgba(100, 200, 255, 0.1) 100%)
  `,
}

export default function ShowcaseSectionVisual({
  title,
  subtitle,
  products,
  backgroundPattern = 'festive',
  layout = 'horizontal',
  onProductClick,
  onViewAll,
  ribbonColor = 'from-red-600 via-pink-600 to-purple-600',
}: ShowcaseSectionVisualProps) {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Festive Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"
        style={{
          backgroundImage: backgroundPatterns[backgroundPattern],
          backgroundSize: backgroundPattern === 'geometric' ? '40px 40px' : 'cover',
        }}
      />

      {/* Decorative Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
          >
            <Sparkles className="w-6 h-6 text-purple-400/40" />
          </motion.div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-6">
        {/* Title Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative inline-block">
            {/* Ribbon Background */}
            <div className={`
              px-12 py-6 rounded-2xl
              bg-gradient-to-r ${ribbonColor}
              shadow-2xl
              transform -rotate-1
            `}>
              {/* Glossy Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-70" />

              {/* Ribbon Content */}
              <div className="relative">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-lg md:text-xl text-white/90 mt-2 drop-shadow-lg">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Ribbon Reflection */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent rounded-b-2xl" />
            </div>

            {/* Ribbon Shadow */}
            <div className={`
              absolute inset-0 -z-10
              bg-gradient-to-r ${ribbonColor}
              blur-xl opacity-50
              transform rotate-1
            `} />
          </div>
        </motion.div>

        {/* Products Layout */}
        {layout === 'horizontal' ? (
          <div className="relative">
            {/* Horizontal Scroll Container */}
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-50">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => onProductClick?.(product.id)}
                  className="flex-shrink-0 w-64 cursor-pointer group"
                >
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 border-2 border-transparent hover:border-pink-300">
                    {/* Glossy Card Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-50" />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                          <span className="text-xs font-bold text-white">{product.badge}</span>
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="relative mb-4 h-48 flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price */}
                    {product.price && (
                      <div className="text-2xl font-black text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                        ${product.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => onProductClick?.(product.id)}
                className="cursor-pointer group"
              >
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 border-2 border-transparent hover:border-pink-300 h-full">
                  {/* Glossy Card Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-50" />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                        <span className="text-xs font-bold text-white">{product.badge}</span>
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative mb-4 h-48 flex items-center justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  {product.price && (
                    <div className="text-2xl font-black text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {onViewAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewAll}
              className="
                group/btn relative inline-flex items-center gap-3
                px-8 py-4 rounded-full
                bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600
                text-white font-bold text-lg
                shadow-2xl hover:shadow-pink-500/50
                transition-all duration-300
              "
            >
              {/* Button Glossy Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60" />

              <span className="relative z-10">Ver Todos</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform relative z-10" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
