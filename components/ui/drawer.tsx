'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'left' | 'right' | 'bottom'
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
}: DrawerProps) {
  const sideClasses = {
    left: 'left-0 top-0 bottom-0 w-full max-w-md lg:max-w-2xl',
    right: 'right-0 top-0 bottom-0 w-full max-w-md lg:max-w-2xl',
    bottom: 'bottom-0 left-0 right-0 max-h-[90vh]',
  }

  const slideVariants = {
    left: { x: '-100%' },
    right: { x: '100%' },
    bottom: { y: '100%' },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={slideVariants[side]}
            animate={{ x: 0, y: 0 }}
            exit={slideVariants[side]}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-white shadow-2xl flex flex-col',
              sideClasses[side]
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

