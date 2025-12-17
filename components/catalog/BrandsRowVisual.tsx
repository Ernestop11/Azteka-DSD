'use client'

import { motion } from 'framer-motion'
import { Award, ChevronRight, Star } from 'lucide-react'

export interface Brand {
  id: string
  name: string
  logoUrl: string
  productCount?: number
  featured?: boolean
}

export interface BrandsRowVisualProps {
  title?: string
  subtitle?: string
  brands: Brand[]
  onBrandClick?: (brandId: string) => void
  onViewAll?: () => void
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

export default function BrandsRowVisual({
  title = "Marcas Premium",
  subtitle = "Calidad garantizada",
  brands,
  onBrandClick,
  onViewAll,
  columns = { mobile: 2, tablet: 3, desktop: 6 },
}: BrandsRowVisualProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 relative overflow-hidden">
      {/* Gold Texture Pattern Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(255,215,0,0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255,215,0,0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,215,0,0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255,215,0,0.1) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      />

      {/* Floating Star Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
            className="absolute"
            style={{
              left: `${5 + i * 10}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
          >
            <Star className="w-4 h-4 text-yellow-600/30" fill="currentColor" />
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
          {/* Award Badge */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block mb-4"
          >
            <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 shadow-2xl shadow-yellow-500/50">
              {/* Badge Glossy Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70" />

              <Award className="w-6 h-6 text-white relative z-10" />
              <span className="text-white font-bold text-sm uppercase tracking-wide relative z-10">
                Marcas Premium
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            {title}
          </h2>

          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 font-semibold">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.05,
                duration: 0.4,
                type: 'spring',
                stiffness: 150,
              }}
              whileHover={{ scale: 1.1, y: -10 }}
              onClick={() => onBrandClick?.(brand.id)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Gold Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600" />

                {/* Gold Texture Overlay */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
                      radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 50%)
                    `,
                  }}
                />

                {/* Glossy Top Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/10 to-transparent opacity-70" />

                {/* Emboss Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20" />
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Shine Sweep on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                  />
                </div>

                {/* Featured Star Badge */}
                {brand.featured && (
                  <div className="absolute top-2 right-2 z-10">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 text-yellow-600" fill="currentColor" />
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Brand Logo - Centered */}
                <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain drop-shadow-lg filter grayscale-0 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-300"
                  />
                </div>

                {/* Product Count Badge */}
                {brand.productCount && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                      <span className="text-xs font-bold text-gray-800">
                        {brand.productCount} productos
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Embossed Border */}
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl group-hover:border-white/50 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        {onViewAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewAll}
              className="
                group/btn relative inline-flex items-center gap-3
                px-8 py-4 rounded-full
                bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700
                text-white font-bold text-lg
                shadow-2xl hover:shadow-yellow-500/50
                transition-all duration-300
              "
            >
              {/* Button Glossy Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-70" />

              {/* Button Shine */}
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 rounded-full" />
              </div>

              <span className="relative z-10">Ver Todas las Marcas</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform relative z-10" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
