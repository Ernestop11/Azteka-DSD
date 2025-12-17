'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  collapsible?: boolean
}

export default function FilterSection({ 
  title, 
  children, 
  defaultOpen = true,
  collapsible = true 
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-md"
          aria-expanded={isOpen}
          aria-controls={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      ) : (
        <h3 className="text-sm font-semibold text-gray-900 py-4">{title}</h3>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

