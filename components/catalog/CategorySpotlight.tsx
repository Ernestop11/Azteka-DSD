'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug?: string | null
  imageUrl?: string | null
  productCount?: number
}

interface CategorySpotlightProps {
  title?: string
  categories: Category[]
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  onCategoryClick?: (categoryId: string) => void
}

export default function CategorySpotlight({
  title = 'Shop by Category',
  categories,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  onCategoryClick,
}: CategorySpotlightProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        scrollElement.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 320 // card width + gap
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
  }

  if (categories.length === 0) return null

  return (
    <section className="py-6 md:py-8 lg:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm md:text-base">Browse our product categories</p>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Scroll Buttons - Desktop Only */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow -ml-4"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow -mr-4"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-10 lg:px-10"
            style={{
              scrollSnapType: 'x mandatory',
            }}
          >
            <div className="flex gap-4 md:gap-6 min-w-max">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-[280px] md:w-[300px] lg:w-[320px] snap-start"
                >
                  <Link
                    href={`/catalog?category=${category.slug || category.name}`}
                    onClick={(e) => {
                      if (onCategoryClick) {
                        e.preventDefault()
                        onCategoryClick(category.id)
                      }
                    }}
                    className="block group"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      {/* Category Image */}
                      {category.imageUrl ? (
                        <img
                          src={getPublicImageUrl(category.imageUrl)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-white">
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-black mb-2 text-center drop-shadow-lg">
                          {category.name}
                        </h3>
                        {category.productCount !== undefined && (
                          <p className="text-xs md:text-sm text-white/90 mb-3">
                            {category.productCount} products
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span>Shop Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Mobile Only */}
        <div className="flex justify-center mt-4 gap-2 lg:hidden">
          {categories.slice(0, Math.min(categories.length, 5)).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
          ))}
        </div>
      </div>
    </section>
  )
}

