'use client'

import { motion } from 'framer-motion'
import { Snowflake, Sun, Skull } from 'lucide-react'
import GlossyProductCard from './GlossyProductCard'

interface SeasonalProduct {
  id: string
  name: string
  brand?: string
  price: number
  originalPrice?: number
  imageUrl: string
  badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
}

interface SeasonalSectionProps {
  season: 'christmas' | 'summer' | 'dia-muertos'
  products: SeasonalProduct[]
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

const seasonalConfig = {
  christmas: {
    title: 'Christmas Collection',
    subtitle: 'Celebrate the Season',
    icon: Snowflake,
    gradient: 'from-red-600 via-green-600 to-red-700',
    bgPattern: 'bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),rgba(22,163,74,0.1))]',
    iconColor: 'text-red-600',
    accentColor: 'from-red-500 to-green-600',
  },
  summer: {
    title: 'Summer Favorites',
    subtitle: 'Beat the Heat',
    icon: Sun,
    gradient: 'from-cyan-500 via-blue-500 to-purple-600',
    bgPattern: 'bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.1),rgba(147,51,234,0.1))]',
    iconColor: 'text-cyan-500',
    accentColor: 'from-cyan-500 to-purple-600',
  },
  'dia-muertos': {
    title: 'Día de Muertos',
    subtitle: 'Honor & Celebrate',
    icon: Skull,
    gradient: 'from-orange-600 via-pink-600 to-purple-700',
    bgPattern: 'bg-[radial-gradient(circle_at_50%_120%,rgba(234,88,12,0.1),rgba(126,34,206,0.1))]',
    iconColor: 'text-orange-600',
    accentColor: 'from-orange-500 to-purple-600',
  },
}

export default function SeasonalSection({
  season,
  products,
  onProductClick,
  onAddToCart,
}: SeasonalSectionProps) {
  const config = seasonalConfig[season]
  const Icon = config.icon

  return (
    <section className={`relative py-16 overflow-hidden ${config.bgPattern}`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-32 -left-32 w-96 h-96"
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-3xl`} />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-32 -right-32 w-96 h-96"
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-3xl`} />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className={`p-6 rounded-3xl bg-gradient-to-br ${config.accentColor} shadow-2xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className={`text-sm font-bold uppercase tracking-wider mb-2 bg-gradient-to-r ${config.accentColor} bg-clip-text text-transparent`}>
              {config.subtitle}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {config.title}
            </h2>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <GlossyProductCard
              key={product.id}
              product={{
                ...product,
                seasonal: season,
              }}
              index={index}
              onClick={() => onProductClick?.(product.id)}
              onAddToCart={() => onAddToCart?.(product.id)}
            />
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-8 py-4 rounded-full
              bg-gradient-to-r ${config.accentColor}
              text-white font-bold text-lg
              shadow-xl hover:shadow-2xl
              transition-all duration-300
            `}
          >
            View All {config.title}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
