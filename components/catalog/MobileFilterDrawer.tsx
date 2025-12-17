'use client'

import { motion, AnimatePresence } from 'framer-motion'
import FiltersSidebar from './FiltersSidebar'

interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileFilterDrawer({ isOpen, onClose }: MobileFilterDrawerProps) {
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
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm"
          >
            <FiltersSidebar isMobile={true} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

