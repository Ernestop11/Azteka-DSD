'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Tag } from 'lucide-react'

export interface Category {
  id: string
  name: string
  imageUrl: string
  productCount?: number
  color?: string
  description?: string
}

export interface CategoriesRowVisualProps {
  title?: string
  subtitle?: string
  categories: Category[]
  layout?: 'grid' | 'horizontal'
  festiveEdges?: boolean
  onCategoryClick?: (categoryId: string) => void
  onViewAll?: () => void
}

export default function CategoriesRowVisual({
  title = "Explora por Categoría",
  subtitle = "Encuentra lo que necesitas",
  categories,
  layout = 'grid',
  festiveEdges = true,
  onCategoryClick,
  onViewAll,
}: CategoriesRowVisualProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative Pattern Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)
          `,
        }}
      />

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          {/* Tag Icon Badge */}
          <motion.div
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="inline-block mb-4"
          >
            <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/50">
              {/* Badge Glossy Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70" />

              <Tag className="w-6 h-6 text-white relative z-10" />
              <span className="text-white font-bold text-sm uppercase tracking-wide relative z-10">
                Categorías
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            {title}
          </h2>

          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 font-semibold">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Categories Layout */}
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                festiveEdges={festiveEdges}
                onClick={() => onCategoryClick?.(category.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50 mb-8">
            {categories.map((category, index) => (
              <div key={category.id} className="flex-shrink-0 w-80">
                <CategoryCard
                  category={category}
                  index={index}
                  festiveEdges={festiveEdges}
                  onClick={() => onCategoryClick?.(category.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {onViewAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewAll}
              className="
                group/btn relative inline-flex items-center gap-3
                px-8 py-4 rounded-full
                bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600
                text-white font-bold text-lg
                shadow-2xl hover:shadow-purple-500/50
                transition-all duration-300
              "
            >
              {/* Button Glossy Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-70" />

              <span className="relative z-10">Ver Todas</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform relative z-10" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

// Category Card Component
interface CategoryCardProps {
  category: Category
  index: number
  festiveEdges: boolean
  onClick: () => void
}

function CategoryCard({ category, index, festiveEdges, onClick }: CategoryCardProps) {
  const defaultColor = 'from-blue-500 to-purple-600'
  const gradientColor = category.color || defaultColor

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        type: 'spring',
        stiffness: 120,
      }}
      whileHover={{ scale: 1.05, y: -10 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative h-64 md:h-80 overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradientColor} opacity-60 group-hover:opacity-70 transition-opacity`} />

        {/* Glossy Top Shine */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent opacity-50" />

        {/* Festive Edge Pattern */}
        {festiveEdges && (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-3 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.5) 10px,
                  rgba(255,255,255,0.5) 20px
                )`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-3 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.5) 10px,
                  rgba(255,255,255,0.5) 20px
                )`,
              }}
            />
          </>
        )}

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Product Count Badge */}
        {category.productCount && (
          <div className="absolute top-4 right-4 z-10">
            <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
              <span className="text-sm font-bold text-gray-900">
                {category.productCount}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          {/* Category Name */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-2xl leading-tight"
            style={{
              textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 0 40px rgba(255,255,255,0.2)',
            }}
          >
            {category.name}
          </motion.h3>

          {/* Description */}
          {category.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="text-sm md:text-base text-white/90 mb-4 line-clamp-2 drop-shadow-lg"
            >
              {category.description}
            </motion.p>
          )}

          {/* Explore Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="inline-flex items-center gap-2 text-white font-bold text-sm group-hover:gap-3 transition-all"
          >
            <span className="drop-shadow-lg">Explorar</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>

        {/* Bottom Reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}
