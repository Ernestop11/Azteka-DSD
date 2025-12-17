'use client'

import { motion } from 'framer-motion'
import GlossyProductCard from './GlossyProductCard'

interface CategorySplashSectionProps {
  category: string
  products: any[]
  onProductClick?: (product: any) => void
  onAddToCart?: (product: any) => void
}

// Category-specific splash patterns and colors
const categorySplashes: Record<string, {
  gradient: string
  pattern: string
  accentColor: string
  title: string
}> = {
  snacks: {
    gradient: 'from-orange-500/20 via-amber-400/20 to-yellow-500/20',
    pattern: 'radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.15) 0%, transparent 50%)',
    accentColor: 'orange-600',
    title: 'Crunchy Snacks'
  },
  beverages: {
    gradient: 'from-blue-500/20 via-cyan-400/20 to-teal-500/20',
    pattern: 'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
    accentColor: 'blue-600',
    title: 'Refreshing Beverages'
  },
  candy: {
    gradient: 'from-pink-500/20 via-purple-400/20 to-fuchsia-500/20',
    pattern: 'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
    accentColor: 'pink-600',
    title: 'Sweet Treats'
  },
  chips: {
    gradient: 'from-red-500/20 via-orange-400/20 to-yellow-500/20',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)',
    accentColor: 'red-600',
    title: 'Potato & Tortilla Chips'
  },
  default: {
    gradient: 'from-violet-500/20 via-fuchsia-400/20 to-pink-500/20',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
    accentColor: 'violet-600',
    title: 'Featured Products'
  }
}

function getCategorySplash(category: string) {
  const key = category.toLowerCase()
  for (const [splashKey, splash] of Object.entries(categorySplashes)) {
    if (key.includes(splashKey) || splashKey.includes(key)) {
      return splash
    }
  }
  return categorySplashes.default
}

export default function CategorySplashSection({
  category,
  products,
  onProductClick,
  onAddToCart
}: CategorySplashSectionProps) {
  if (!products || products.length === 0) return null

  const splash = getCategorySplash(category)

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gray-50">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${splash.gradient}`} />

        {/* Splash Pattern */}
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: splash.pattern }}
        />

        {/* Animated Circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-20 right-20 w-96 h-96 bg-${splash.accentColor}/10 rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className={`absolute bottom-20 left-20 w-80 h-80 bg-${splash.accentColor}/10 rounded-full blur-3xl`}
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 md:px-6 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`inline-block mb-4 px-6 py-2 bg-${splash.accentColor}/10 border-2 border-${splash.accentColor}/30 rounded-full`}
          >
            <span className={`text-${splash.accentColor} font-bold uppercase tracking-wider text-sm`}>
              {category}
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
            {splash.title}
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our selection of {category.toLowerCase()} products
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: Math.min(index * 0.1, 0.4),
                type: 'spring'
              }}
            >
              <GlossyProductCard
                product={product}
                index={index}
                onClick={() => onProductClick?.(product)}
                onAddToCart={() => onAddToCart?.(product)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
