'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface FilterChipProps {
  label: string
  onRemove: () => void
  variant?: 'default' | 'primary'
}

export default function FilterChip({ label, onRemove, variant = 'default' }: FilterChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        ${variant === 'primary' 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'bg-gray-100 text-gray-700 border border-gray-200'
        }
        transition-colors hover:opacity-80
      `}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 hover:bg-black/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

