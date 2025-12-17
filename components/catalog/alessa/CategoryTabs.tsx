'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

interface Category {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
}

interface CategoryTabsProps {
  activeCategoryId?: string | null
  onCategoryChange?: (categoryId: string | null) => void
}

export default function CategoryTabs({
  activeCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { data: categoriesData, isLoading } = useQuery<Category[]>({
    queryKey: ['catalog-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/categories')
      return Array.isArray(res) ? res : res.data || []
    },
  })

  const categories = categoriesData || []

  const handleCategoryClick = (categoryId: string | null) => {
    onCategoryChange?.(categoryId)
  }

  // Scroll active category into view
  useEffect(() => {
    if (activeCategoryId && scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector(
        `[data-category-id="${activeCategoryId}"]`
      )
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [activeCategoryId])

  if (isLoading) {
    return (
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {/* All Categories Button */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeCategoryId === null
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          {/* Category Buttons */}
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id
            return (
              <motion.button
                key={category.id}
                data-category-id={category.id}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </motion.button>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

