'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import ProductCard from './ProductCard'
import Link from 'next/link'

interface HeroSectionProps {
  title: string
  subtitle: string
  brandName?: string
  categoryName?: string
  gradient?: string
  limit?: number
  ctaText?: string
  ctaLink?: string
}

export default function HeroSection({
  title,
  subtitle,
  brandName,
  categoryName,
  gradient = 'from-blue-600 to-purple-600',
  limit = 4,
  ctaText,
  ctaLink,
}: HeroSectionProps) {
  // Build query params - use name directly, API will handle matching
  const params = new URLSearchParams()
  if (brandName) params.set('brand', brandName)
  if (categoryName) params.set('category', categoryName)
  params.set('limit', limit.toString())

  const { data, isLoading } = useQuery<{ products: any[] }>({
    queryKey: ['hero-products', brandName, categoryName, limit],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const products = data?.products || []

  return (
    <section className="mb-6 md:mb-10">
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${gradient} p-6 md:p-10 lg:p-12`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-4 drop-shadow-md">
              {title}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/90 font-semibold max-w-2xl">
              {subtitle}
            </p>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="bg-white/20 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
              {products.slice(0, limit).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white/20 rounded-xl p-8 text-center text-white">
              <p className="text-lg">No products found</p>
            </div>
          )}

          {/* CTA Button */}
          {ctaText && ctaLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {ctaText}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

