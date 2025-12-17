'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { Package } from 'lucide-react'
import type { CatalogCategory } from '@/src/types/catalog'

interface CategoriesRowProps {
  title?: string
  onCategoryClick?: (categoryId: string) => void
}

export default function CategoriesRow({ title = 'Shop by Category', onCategoryClick }: CategoriesRowProps) {
  const { toggleCategory } = useCatalogFilters()

  const { data: categoriesData, isLoading } = useQuery<{ data: CatalogCategory[] }>({
    queryKey: ['catalog-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  const categories = categoriesData?.data || []

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null // Don't render if no categories
  }

  const handleCategoryClick = (categoryId: string) => {
    toggleCategory(categoryId)
    onCategoryClick?.(categoryId)
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            console.log("CATEGORY ITEM", category)
            return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(category.id)}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
            >
              {/* Category Image */}
              <div className="absolute inset-0">
                <img
                  src={getPublicImageUrl(category.imageUrl)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Category Name */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5" />
                  <h3 className="text-lg font-bold">{category.name}</h3>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
            </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
