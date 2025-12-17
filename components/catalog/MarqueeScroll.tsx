'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MarqueeItem {
  id: string
  imageUrl: string
  title: string
  price?: number
  badge?: string
}

interface MarqueeScrollProps {
  items: MarqueeItem[]
  speed?: number // seconds for one complete loop
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  title?: string
  onItemClick?: (item: MarqueeItem) => void
}

export default function MarqueeScroll({
  items,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  title,
  onItemClick,
}: MarqueeScrollProps) {
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items]

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8">
      {/* Section Title */}
      {title && (
        <div className="container mx-auto px-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>
      )}

      {/* Marquee Container */}
      <div
        className="relative"
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Content */}
        <motion.div
          className="flex gap-6"
          animate={{
            x: direction === 'left' ? [0, -100 / 3 + '%'] : [-100 / 3 + '%', 0],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
            ...(isPaused && { duration: 0 }),
          }}
        >
          {duplicatedItems.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              whileHover={{ scale: 1.05, y: -8 }}
              className="flex-shrink-0 w-64 cursor-pointer group"
              onClick={() => onItemClick?.(item)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200">
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60 pointer-events-none z-10" />

                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                      {item.badge}
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  {item.price && (
                    <div className="text-xl font-bold text-emerald-600">
                      ${item.price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Bottom Glossy Reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
