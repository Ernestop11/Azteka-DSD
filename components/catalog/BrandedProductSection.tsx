'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import GlossyProductCard from './GlossyProductCard'
import type { CatalogProduct } from '@/lib/queries/catalog'

interface BrandedProductSectionProps {
  brandName: string
  title?: string
  products: CatalogProduct[]
  brandId?: string
  brandSlug?: string
  columns?: { mobile?: number; tablet?: number; desktop?: number }
}

export default function BrandedProductSection({
  brandName,
  title,
  products,
  brandId,
  brandSlug,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
}: BrandedProductSectionProps) {
  if (products.length === 0) return null

  const sectionTitle = title || `${brandName} Top Sellers`

  return (
    <section className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-6 md:mb-8"
        >
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              {sectionTitle}
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Best-selling products from {brandName}
            </p>
          </div>
          {(brandSlug || brandId) && (
            <Link
              href={`/catalog?brand=${brandSlug || brandId}`}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              View All {brandName}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </motion.div>

        {/* Product Grid */}
        <div
          className={`grid grid-cols-${columns.mobile || 2} sm:grid-cols-${columns.tablet || 3} lg:grid-cols-${columns.desktop || 4} gap-4 md:gap-6`}
        >
          {products.slice(0, columns.desktop || 8).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlossyProductCard
                product={{
                  ...product,
                  brand: brandName,
                }}
                index={index}
                onClick={() => (window.location.href = `/catalog/${product.id}`)}
                onAddToCart={() => {
                  // Handle add to cart
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Link */}
        {(brandSlug || brandId) && (
          <div className="mt-6 md:hidden text-center">
            <Link
              href={`/catalog?brand=${brandSlug || brandId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              View All {brandName}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

