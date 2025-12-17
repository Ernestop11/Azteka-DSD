'use client'

import { motion } from 'framer-motion'
import GlossyProductCard from '../GlossyProductCard'
import type { CatalogProduct } from '@/src/types/catalog'

export interface WideSpotlightProps {
  featuredProduct: CatalogProduct
  supportingProducts: CatalogProduct[]
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  activeTier?: 'A' | 'B' | 'C' | null
  title?: string
  subtitle?: string
}

export default function WideSpotlight({
  featuredProduct,
  supportingProducts,
  onProductClick,
  onAddToCart,
  activeTier,
  title = 'Producto Destacado',
  subtitle,
}: WideSpotlightProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-black text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </motion.div>
        )}

        {/* Spotlight Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Large Featured Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="lg:col-span-2 relative group"
          >
            <div className="relative h-full min-h-[500px] lg:min-h-[600px]">
              {/* Spotlight Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 rounded-3xl blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-700" />

              {/* Featured Product Card */}
              <div className="relative h-full z-10 scale-105">
                <div className="h-full p-8 bg-white rounded-3xl shadow-2xl border-2 border-transparent group-hover:border-purple-300 transition-all duration-300">
                  {/* Featured Badge */}
                  <div className="absolute -top-4 left-8 z-20">
                    <motion.div
                      animate={{
                        rotate: [0, -5, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl"
                    >
                      <span className="text-white font-bold text-sm uppercase tracking-wide">
                        ⭐ Destacado
                      </span>
                    </motion.div>
                  </div>

                  {/* Product Content */}
                  <div className="h-full flex flex-col">
                    {/* Product Image */}
                    <div className="flex-1 flex items-center justify-center mb-6">
                      <motion.img
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        src={featuredProduct.imageUrl}
                        alt={featuredProduct.name}
                        className="max-h-80 max-w-full object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                      {featuredProduct.brand && (
                        <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                          {typeof featuredProduct.brand === 'string' ? featuredProduct.brand : featuredProduct.brand?.name || ''}
                        </p>
                      )}

                      <h3 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                        {featuredProduct.name}
                      </h3>

                      {featuredProduct.description && (
                        <p className="text-gray-600 text-lg line-clamp-2">
                          {featuredProduct.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${featuredProduct.price.toFixed(2)}
                        </span>
                        {featuredProduct.originalPrice && (
                          <span className="text-2xl text-gray-400 line-through">
                            ${featuredProduct.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddToCart?.(featuredProduct.id)}
                        className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
                      >
                        Agregar al Carrito
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Supporting Products Stack */}
          <div className="space-y-6">
            {supportingProducts.slice(0, 2).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  duration: 0.6,
                  type: 'spring',
                }}
                className="h-[280px]"
              >
                <GlossyProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    imageUrl: product.imageUrl,
                    tier: product.tier || undefined,
                    rewardsPoints: product.rewardsPoints || product.points,
                    points: product.points || product.rewardsPoints,
                    rating: product.rating,
                    seasonal: product.seasonal || undefined,
                    priceTierA: product.priceTierA,
                    priceTierB: product.priceTierB,
                    priceTierC: product.priceTierC,
                    activeTier: activeTier || product.activeTier || undefined,
                    glossLevel: product.glossLevel || undefined,
                    sparkle: product.sparkle || false,
                    badge: product.badge || undefined,
                    theme: product.theme || undefined,
                  }}
                  index={index}
                  onClick={() => onProductClick?.(product.id)}
                  onAddToCart={() => onAddToCart?.(product.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
