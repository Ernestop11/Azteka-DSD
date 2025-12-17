'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Truck, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface StickyPromoBarProps {
  message?: string
  discount?: number
  freeShippingThreshold?: number
  countdownDate?: Date
  dismissible?: boolean
}

export default function StickyPromoBar({
  message = 'Free shipping on orders over $1,399',
  discount,
  freeShippingThreshold = 1399,
  countdownDate,
  dismissible = true,
}: StickyPromoBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (countdownDate) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const distance = countdownDate.getTime() - now

        if (distance < 0) {
          setTimeLeft('EXPIRED')
          clearInterval(interval)
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          setTimeLeft(`${days}d ${hours}h ${minutes}m`)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [countdownDate])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4 text-sm md:text-base">
            {/* Free Shipping Icon */}
            <Truck className="w-5 h-5 flex-shrink-0" />

            {/* Message */}
            <div className="flex-1 text-center">
              {discount ? (
                <span className="font-bold">
                  <span className="text-2xl font-black">{discount}% OFF</span> - {message}
                </span>
              ) : (
                <span className="font-semibold">{message}</span>
              )}
            </div>

            {/* Countdown */}
            {countdownDate && timeLeft && (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-bold">{timeLeft}</span>
              </div>
            )}

            {/* Dismiss Button */}
            {dismissible && (
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

