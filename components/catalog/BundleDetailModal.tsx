'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, ShoppingCart, Gift, Check } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { getPublicImageUrl } from '@/lib/imageUrl'
import Button from '@/components/ui/button'
import type { CatalogBundle } from '@/lib/bundleBuilder'

interface BundleDetailModalProps {
  bundle: CatalogBundle | null
  isOpen: boolean
  onClose: () => void
}

interface RackVariant {
  id: string
  name: string
  description: string
  products: Array<{
    id: string
    name: string
    quantity: number
  }>
  imageUrl?: string
}

export default function BundleDetailModal({
  bundle,
  isOpen,
  onClose,
}: BundleDetailModalProps) {
  const { add } = useCart()
  const [selectedRackVariant, setSelectedRackVariant] = useState<string>('variant-1')
  const [showSuccess, setShowSuccess] = useState(false)

  if (!bundle) return null

  // Generate 2 rack variants (different product fills)
  const rackVariants: RackVariant[] = [
    {
      id: 'variant-1',
      name: 'Rack Fill Option 1',
      description: 'Balanced mix of all products',
      products: bundle.products.map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
      })),
    },
    {
      id: 'variant-2',
      name: 'Rack Fill Option 2',
      description: 'Emphasizes top sellers',
      products: bundle.products.map((p, i) => ({
        id: p.id,
        name: p.name,
        quantity: i < bundle.products.length / 2 ? p.quantity * 2 : p.quantity, // Double top sellers
      })),
    },
  ]

  const selectedVariant = rackVariants.find(v => v.id === selectedRackVariant) || rackVariants[0]

  const handleAddToCart = () => {
    // Add all products from selected variant to cart
    selectedVariant.products.forEach((product) => {
      const bundleProduct = bundle.products.find(p => p.id === product.id)
      if (bundleProduct) {
        add({
          id: bundleProduct.id,
          name: bundleProduct.name,
          price: bundleProduct.price,
          quantity: product.quantity,
          imageUrl: bundleProduct.imageUrl,
          sku: bundleProduct.sku || '',
          unitsPerCase: 24, // Default
        })
      }
    })

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 2000)
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
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 md:p-8 border-b border-gray-200">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="pr-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  {bundle.name}
                </h2>
                {bundle.description && (
                  <p className="text-gray-600 text-lg">{bundle.description}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Rack Offer */}
                {bundle.rackOffer && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Gift className="w-8 h-8" />
                      <h3 className="text-2xl font-black">{bundle.rackOffer.title}</h3>
                    </div>
                    <p className="text-white/90">{bundle.rackOffer.description}</p>
                  </div>
                )}

                {/* Rack Variant Selection */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Choose Your Rack Fill
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {rackVariants.map((variant) => (
                      <motion.button
                        key={variant.id}
                        onClick={() => setSelectedRackVariant(variant.id)}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                          selectedRackVariant === variant.id
                            ? 'border-blue-600 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-900">
                            {variant.name}
                          </h4>
                          {selectedRackVariant === variant.id && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{variant.description}</p>
                        <div className="space-y-2">
                          {variant.products.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{product.name}</span>
                              <span className="font-semibold text-gray-900">
                                Qty: {product.quantity}
                              </span>
                            </div>
                          ))}
                          {variant.products.length > 5 && (
                            <p className="text-xs text-gray-500">
                              +{variant.products.length - 5} more products
                            </p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Product List */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Bundle Contents
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVariant.products.map((product) => {
                      const bundleProduct = bundle.products.find(p => p.id === product.id)
                      if (!bundleProduct) return null

                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={getPublicImageUrl(bundleProduct.imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${bundleProduct.price.toFixed(2)} × {product.quantity}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Original Total:</span>
                      <span className="font-semibold">${bundle.totalValue.toFixed(2)}</span>
                    </div>
                    {bundle.discountPercent > 0 && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({bundle.discountPercent}%):</span>
                          <span className="font-semibold">
                            -${bundle.savings.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 border-t border-gray-300">
                          <span>Bundle Price:</span>
                          <span>${bundle.price.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {bundle.rackOffer && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-green-600 font-bold flex items-center gap-2">
                          <Gift className="w-5 h-5" />
                          Free Display Rack Included (${bundle.rackOffer.title})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    ${bundle.price.toFixed(2)}
                  </p>
                  {bundle.savings > 0 && (
                    <p className="text-green-600 font-semibold">
                      Save ${bundle.savings.toFixed(2)} ({bundle.discountPercent}% OFF)
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={showSuccess}
                  className="flex items-center gap-3 px-8 py-4 text-lg"
                  size="lg"
                >
                  {showSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add Bundle to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

