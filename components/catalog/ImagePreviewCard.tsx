'use client'

import { motion } from 'framer-motion'
import { Image as ImageIcon, CheckCircle2 } from 'lucide-react'

export interface ImagePreviewCardProps {
  src: string | null | undefined
  label: string
  aspect?: 'square' | 'video' | 'wide' | 'portrait'
  showCheckmark?: boolean
  onClick?: () => void
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  portrait: 'aspect-[3/4]',
}

export default function ImagePreviewCard({
  src,
  label,
  aspect = 'square',
  showCheckmark = false,
  onClick,
}: ImagePreviewCardProps) {
  const hasImage = Boolean(src)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden border-2
        ${hasImage ? 'border-green-500' : 'border-gray-300'}
        ${onClick ? 'cursor-pointer' : ''}
        shadow-lg hover:shadow-xl transition-all duration-300
      `}
    >
      {/* Image Container */}
      <div className={`relative ${aspectRatios[aspect]} bg-gradient-to-br from-gray-100 to-gray-200`}>
        {hasImage ? (
          <>
            {/* Actual Image */}
            <img
              src={src || undefined}
              alt={label}
              className="w-full h-full object-cover"
            />

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Success Checkmark */}
            {showCheckmark && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="absolute top-2 right-2"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              No image uploaded
            </p>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="p-3 bg-white border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {label}
        </p>
        {hasImage && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Image uploaded
          </p>
        )}
      </div>
    </motion.div>
  )
}
