'use client'

import { motion } from 'framer-motion'
import { Package, Gift, ShoppingCart, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { getPublicImageUrl } from '@/lib/imageUrl'
import AddToCartModal from './AddToCartModal'
import type { CatalogProduct } from '@/lib/queries/catalog'

interface BrandBundle {
  id: string
  name: string
  brandId: string
  brandName: string
  imageUrl?: string | null
  products: CatalogProduct[]
  price: number
  discountPercent?: number
  rackOffer?: {
    title: string
    description: string
    imageUrl?: string
  }
  badgeText?: string
  badgeColor?: string
}

interface BrandBundleHeroProps {
  bundle: BrandBundle
  onAddToCart?: () => void
}

export default function BrandBundleHero({ bundle, onAddToCart }: BrandBundleHeroProps) {
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const { add } = useCart()

  const handleAddBundle = () => {
    // Add all products in bundle to cart
    bundle.products.forEach((product) => {
      add({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        imageUrl: product.imageUrl,
        sku: product.sku,
        unitsPerCase: product.unitsPerCase || 24,
      })
    })
    onAddToCart?.()
  }

  const discountedPrice = bundle.discountPercent
    ? bundle.price * (1 - bundle.discountPercent / 100)
    : bundle.price

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-2xl mb-12">
      {/* Background Image/Pattern */}
      <div className="absolute inset-0">
        {bundle.imageUrl ? (
          <img
            src={getPublicImageUrl(bundle.imageUrl)}
            alt={bundle.brandName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Brand Info & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              {/* Badge */}
              {bundle.badgeText && (
                <div
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
                  style={{ backgroundColor: bundle.badgeColor || '#10b981' }}
                >
                  {bundle.badgeText}
                </div>
              )}

              {/* Brand Name */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-2xl">
                {bundle.brandName} Bundle
              </h2>

              {/* Bundle Name */}
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white/90">
                {bundle.name}
              </h3>

              {/* Rack Offer - Enhanced */}
              {bundle.rackOffer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-yellow-300/50 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-400 rounded-full">
                      <Gift className="w-6 h-6 text-yellow-900" />
                    </div>
                    <h4 className="text-2xl font-black text-white drop-shadow-lg">
                      {bundle.rackOffer.title}
                    </h4>
                  </div>
                  <p className="text-white font-semibold">{bundle.rackOffer.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-yellow-200">
                    <Package className="w-5 h-5" />
                    <span className="text-sm font-bold">2 Rack Fill Options Available</span>
                  </div>
                </motion.div>
              )}

              {/* Pricing */}
              <div className="mb-6">
                {bundle.discountPercent && bundle.discountPercent > 0 ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-black">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xl line-through text-white/60">
                      ${bundle.price.toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-bold">
                      {bundle.discountPercent}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl md:text-4xl font-black">
                    ${bundle.price.toFixed(2)}
                  </span>
                )}
                <p className="text-white/80 mt-2">
                  {bundle.products.length} products included
                </p>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddBundle}
                className="group flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/50"
              >
                <ShoppingCart className="w-6 h-6" />
                Add Bundle to Cart
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Right: Product Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
            >
              {bundle.products.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="relative aspect-square bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all group cursor-pointer"
                >
                  <img
                    src={getPublicImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                    <p className="text-xs text-white font-semibold truncate">
                      {product.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

