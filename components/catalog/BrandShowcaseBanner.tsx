'use client'

import { motion } from 'framer-motion'
import { getPublicImageUrl } from '@/lib/imageUrl'
import Link from 'next/link'

interface Brand {
  id: string
  name: string
  imageUrl?: string | null
  slug?: string | null
}

interface BrandShowcaseBannerProps {
  title?: string
  brands: Brand[]
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  onBrandClick?: (brandId: string) => void
}

export default function BrandShowcaseBanner({
  title = 'Brands We Love',
  brands,
  columns = { mobile: 2, tablet: 4, desktop: 6 },
  onBrandClick,
}: BrandShowcaseBannerProps) {
  if (brands.length === 0) return null

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">Shop your favorite brands</p>
        </motion.div>

        <div className={`grid gap-4 md:gap-6 ${
          columns.mobile === 2 ? 'grid-cols-2' : 
          columns.mobile === 3 ? 'grid-cols-3' : 
          columns.mobile === 4 ? 'grid-cols-4' : 'grid-cols-2'
        } ${
          columns.tablet === 3 ? 'md:grid-cols-3' : 
          columns.tablet === 4 ? 'md:grid-cols-4' : 
          columns.tablet === 6 ? 'md:grid-cols-6' : 'md:grid-cols-4'
        } ${
          columns.desktop === 4 ? 'lg:grid-cols-4' : 
          columns.desktop === 6 ? 'lg:grid-cols-6' : 
          columns.desktop === 8 ? 'lg:grid-cols-8' : 'lg:grid-cols-6'
        }`}>
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group"
            >
              <Link
                href={`/catalog?brand=${brand.slug || brand.name}`}
                onClick={(e) => {
                  if (onBrandClick) {
                    e.preventDefault()
                    onBrandClick(brand.id)
                  }
                }}
                className="block"
              >
                <div className="relative aspect-square bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 group-hover:border-blue-300">
                  {/* Brand Image */}
                  {brand.imageUrl ? (
                    <img
                      src={getPublicImageUrl(brand.imageUrl)}
                      alt={brand.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Brand Name (on hover) */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-semibold text-gray-900 text-center">{brand.name}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

