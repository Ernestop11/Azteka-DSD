'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import GlossyProductCard from '../GlossyProductCard'

interface CarouselRowProps {
  products: any[]
  onProductClick?: (product: any) => void
  onAddToCart?: (product: any) => void
  title?: string
  description?: string
  autoScroll?: boolean
}

export default function CarouselRow({
  products,
  onProductClick,
  onAddToCart,
  title,
  description,
  autoScroll = false
}: CarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 300)
    }
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-10">
        {/* Section Header */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                {title}
              </h2>
              {description && (
                <p className="text-lg text-gray-600">
                  {description}
                </p>
              )}
            </div>

            {/* Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`
                  p-3 rounded-full shadow-lg transition-all
                  ${canScrollLeft
                    ? 'bg-white hover:bg-gray-50 text-gray-900'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`
                  p-3 rounded-full shadow-lg transition-all
                  ${canScrollRight
                    ? 'bg-white hover:bg-gray-50 text-gray-900'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Horizontal Scrolling Container */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          ref={scrollRef}
          onScroll={checkScroll}
          className="
            flex gap-6 overflow-x-auto pb-4
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
            scroll-smooth
          "
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E0 #F3F4F6'
          }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
              className="flex-shrink-0 w-80"
            >
              <GlossyProductCard
                product={product}
                index={index}
                onClick={() => onProductClick?.(product)}
                onAddToCart={() => onAddToCart?.(product)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator Dots (Mobile) */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / 2) }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
