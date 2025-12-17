'use client'

import { motion } from 'framer-motion'

export default function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[280px] md:h-[360px] bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 md:px-6 lg:px-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-white"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
            Welcome to Azteka DSD
          </h1>
          <p className="text-base md:text-xl opacity-90">
            Discover premium products for your business
          </p>
        </motion.div>
      </div>

      {/* Parallax effect on scroll (placeholder for future implementation) */}
    </motion.div>
  )
}
