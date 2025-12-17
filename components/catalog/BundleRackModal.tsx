'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Minus, Plus, ShoppingCart, Check, Grid3x3, Pyramid } from 'lucide-react'
import { useState } from 'react'

interface RackOption {
  id: string
  name: string
  description: string
  price: number
  capacity: string
  dimensions: string
  features: string[]
  icon: typeof Grid3x3
  gradient: string
}

interface BundleRackModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToCart: (rackId: string, quantity: number) => void
}

const RACK_OPTIONS: RackOption[] = [
  {
    id: 'wire-rack-2x2',
    name: '2x2 Wire Rack',
    description: 'Professional branded wire display rack - perfect for high-traffic areas',
    price: 1300,
    capacity: '48-60 units',
    dimensions: '24" x 24" x 60"H',
    features: [
      'Durable powder-coated steel',
      'La Molienda branded header',
      'Adjustable shelves',
      '4 product levels',
      'Easy assembly',
      'Caster wheels included'
    ],
    icon: Grid3x3,
    gradient: 'from-slate-500 via-gray-600 to-slate-700'
  },
  {
    id: 'wooden-pyramid',
    name: 'Wooden Pyramid Mega Rack',
    description: 'Premium wooden pyramid display - eye-catching centerpiece for maximum visibility',
    price: 2300,
    capacity: '120-150 units',
    dimensions: '48" x 48" x 72"H',
    features: [
      'Solid wood construction',
      'Premium La Molienda branding',
      'Multi-tier pyramid design',
      '6-8 display levels',
      'Corner & center placement',
      'Professional finish'
    ],
    icon: Pyramid,
    gradient: 'from-amber-700 via-orange-600 to-red-700'
  }
]

export default function BundleRackModal({ isOpen, onClose, onAddToCart }: BundleRackModalProps) {
  const [selectedRack, setSelectedRack] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'wire-rack-2x2': 1,
    'wooden-pyramid': 1
  })

  const handleQuantityChange = (rackId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [rackId]: Math.max(1, Math.min(10, (prev[rackId] || 1) + delta))
    }))
  }

  const handleAddToCart = () => {
    if (selectedRack) {
      onAddToCart(selectedRack, quantities[selectedRack])
      onClose()
    }
  }

  const selectedRackData = RACK_OPTIONS.find(r => r.id === selectedRack)
  const totalPrice = selectedRackData ? selectedRackData.price * quantities[selectedRack] : 0

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-red-600 px-8 py-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-white mb-1">
                        Choose Your Rack
                      </h2>
                      <p className="text-white/90 text-lg">
                        Select the perfect display for your La Molienda bundle
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <X className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Rack Options Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {RACK_OPTIONS.map((rack, index) => {
                      const isSelected = selectedRack === rack.id
                      const Icon = rack.icon

                      return (
                        <motion.div
                          key={rack.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedRack(rack.id)}
                          className={`
                            relative cursor-pointer rounded-2xl overflow-hidden
                            border-4 transition-all duration-300
                            ${isSelected
                              ? 'border-orange-500 shadow-2xl scale-[1.02]'
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-xl'
                            }
                          `}
                        >
                          {/* Selected Checkmark */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="w-6 h-6 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Rack Header with Gradient */}
                          <div className={`relative bg-gradient-to-br ${rack.gradient} px-6 py-8`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60" />
                            <div className="relative flex items-center gap-4 text-white">
                              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <Icon className="w-8 h-8" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold">{rack.name}</h3>
                                <p className="text-white/90">{rack.capacity}</p>
                              </div>
                            </div>
                          </div>

                          {/* Rack Details */}
                          <div className="p-6 bg-white space-y-4">
                            <p className="text-gray-700">{rack.description}</p>

                            {/* Price */}
                            <div className="text-3xl font-black text-gray-900">
                              ${rack.price.toLocaleString()}
                            </div>

                            {/* Dimensions */}
                            <div className="text-sm text-gray-600">
                              <strong>Dimensions:</strong> {rack.dimensions}
                            </div>

                            {/* Features */}
                            <div>
                              <div className="text-sm font-semibold text-gray-900 mb-2">
                                Features:
                              </div>
                              <ul className="space-y-1">
                                {rack.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Quantity Selector */}
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">Quantity:</span>
                                <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleQuantityChange(rack.id, -1)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    <Minus className="w-4 h-4 text-gray-700" />
                                  </motion.button>
                                  <span className="text-lg font-bold text-gray-900 w-8 text-center">
                                    {quantities[rack.id]}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleQuantityChange(rack.id, 1)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-gray-700" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
                    <div>
                      {selectedRackData && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="text-sm text-gray-600 mb-1">Total Price</div>
                          <div className="text-4xl font-black text-gray-900">
                            ${totalPrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quantities[selectedRack!]} × ${selectedRackData.price.toLocaleString()}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-8 py-4 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        disabled={!selectedRack}
                        className={`
                          px-8 py-4 rounded-xl font-bold text-white
                          flex items-center gap-3 shadow-lg
                          transition-all duration-300
                          ${selectedRack
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-xl hover:from-orange-600 hover:to-red-700'
                            : 'bg-gray-300 cursor-not-allowed'
                          }
                        `}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
