'use client'

import { motion } from 'framer-motion'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface BundleCardProps {
  id: string
  title: string
  tagline?: string
  imageUrl?: string
  index?: number
}

export default function BundleCard({ 
  id, 
  title, 
  tagline = 'Top Sellers Bundle',
  imageUrl = '/placeholder-bundle.png',
  index = 0
}: BundleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.35,
        type: 'spring',
        stiffness: 100
      }}
      className="flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Bundle Image */}
      <div className="relative w-full h-[180px] md:h-[200px] bg-gray-100 overflow-hidden">
        <img
          src={getPublicImageUrl(imageUrl)}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect fill="%23f3f4f6" width="320" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3EBundle%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* Bundle Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {tagline}
        </p>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          {title}
        </h3>
        <button
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Add All
        </button>
      </div>
    </motion.div>
  )
}
