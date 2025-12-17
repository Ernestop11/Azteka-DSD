'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface Brand {
  id: string
  name: string
  logoUrl: string
  productCount?: number
  featured?: boolean
}

interface BrandSectionProps {
  brands: Brand[]
  title?: string
  onBrandClick?: (brandId: string) => void
  onViewAll?: () => void
}

export default function BrandSection({
  brands,
  title = 'Shop by Brand',
  onBrandClick,
  onViewAll,
}: BrandSectionProps) {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            {title}
          </motion.h2>

          {onViewAll && (
            <motion.button
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ x: 5 }}
              onClick={onViewAll}
              className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                type: 'spring',
              }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="relative group cursor-pointer"
              onClick={() => onBrandClick?.(brand.id)}
            >
              {/* Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-400">
                {/* Glossy Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-40 pointer-events-none" />

                {/* Featured Badge */}
                {brand.featured && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-pulse shadow-lg" />
                  </div>
                )}

                {/* Logo Container */}
                <div className="aspect-square p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                {/* Brand Info */}
                <div className="p-4 bg-gradient-to-br from-white to-gray-50 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 text-center truncate group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </h3>
                  {brand.productCount !== undefined && (
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {brand.productCount} products
                    </p>
                  )}
                </div>

                {/* Hover Gradient Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 pointer-events-none" />

                {/* Bottom Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
