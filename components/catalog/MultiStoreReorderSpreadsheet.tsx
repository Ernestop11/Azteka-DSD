'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Copy, FileSpreadsheet, Plus, Minus } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { TOY_STORE_COLORS, TOY_STORE_SHADOWS } from '@/lib/theme/toyStoreTheme'

interface StoreQuantity {
  storeId: string
  storeName: string
  quantity: number
}

interface MultiStoreProduct {
  id: string
  name: string
  imageUrl?: string | null
  price: number
  lastOrderedQuantities: Record<string, number> // storeId → quantity
}

interface MultiStoreReorderSpreadsheetProps {
  products: MultiStoreProduct[]
  stores: Array<{ id: string; name: string }>
  onAddToCart: (productId: string, storeQuantities: StoreQuantity[]) => void
  onCopyLastOrder: () => void
}

export default function MultiStoreReorderSpreadsheet({
  products,
  stores,
  onAddToCart,
  onCopyLastOrder,
}: MultiStoreReorderSpreadsheetProps) {
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>(
    products.reduce((acc, product) => {
      acc[product.id] = product.lastOrderedQuantities || {}
      return acc
    }, {} as Record<string, Record<string, number>>)
  )

  const handleQuantityChange = (productId: string, storeId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [storeId]: Math.max(0, value),
      },
    }))
  }

  const handleIncrement = (productId: string, storeId: string) => {
    const current = quantities[productId]?.[storeId] || 0
    handleQuantityChange(productId, storeId, current + 1)
  }

  const handleDecrement = (productId: string, storeId: string) => {
    const current = quantities[productId]?.[storeId] || 0
    handleQuantityChange(productId, storeId, current - 1)
  }

  const getProductTotal = (productId: string): number => {
    return Object.values(quantities[productId] || {}).reduce((sum, qty) => sum + qty, 0)
  }

  const getStoreTotal = (storeId: string): number => {
    return products.reduce((sum, product) => {
      return sum + (quantities[product.id]?.[storeId] || 0)
    }, 0)
  }

  const grandTotal = useMemo(() => {
    return products.reduce((sum, product) => sum + getProductTotal(product.id), 0)
  }, [quantities, products])

  const totalValue = useMemo(() => {
    return products.reduce((sum, product) => {
      const total = getProductTotal(product.id)
      return sum + total * product.price
    }, 0)
  }, [quantities, products])

  const handleAddAllToCart = () => {
    products.forEach((product) => {
      const storeQuantities: StoreQuantity[] = stores
        .map((store) => ({
          storeId: store.id,
          storeName: store.name,
          quantity: quantities[product.id]?.[store.id] || 0,
        }))
        .filter((sq) => sq.quantity > 0)

      if (storeQuantities.length > 0) {
        onAddToCart(product.id, storeQuantities)
      }
    })
  }

  return (
    <motion.section
      className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: TOY_STORE_COLORS.primary.blue,
              boxShadow: TOY_STORE_SHADOWS.badge,
            }}
          >
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Multi-Store Order</h2>
            <p className="text-sm text-gray-600">
              Order for all {stores.length} stores in one spreadsheet
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={onCopyLastOrder}
            className="px-4 py-2 rounded-lg font-bold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="w-4 h-4" />
            <span>Copy Last Order</span>
          </motion.button>

          <motion.button
            onClick={handleAddAllToCart}
            disabled={grandTotal === 0}
            className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 ${
              grandTotal === 0 ? 'bg-gray-300 cursor-not-allowed' : ''
            }`}
            style={
              grandTotal > 0
                ? {
                    background: TOY_STORE_COLORS.primary.green,
                    boxShadow: TOY_STORE_SHADOWS.card,
                  }
                : {}
            }
            whileHover={grandTotal > 0 ? { scale: 1.05 } : {}}
            whileTap={grandTotal > 0 ? { scale: 0.95 } : {}}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add All to Cart</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
              {grandTotal} cases
            </span>
          </motion.button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            {/* Header Row */}
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="sticky left-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-left font-bold border-r border-white/20">
                  Product
                </th>
                {stores.map((store) => (
                  <th
                    key={store.id}
                    className="px-3 py-3 text-center font-bold border-r border-white/20"
                  >
                    {store.name}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold bg-blue-700">Total</th>
              </tr>
            </thead>

            {/* Data Rows */}
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {/* Product Column (Sticky) */}
                  <td className={`sticky left-0 z-10 px-4 py-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-r border-gray-300`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={getPublicImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 font-bold">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Store Quantity Columns */}
                  {stores.map((store) => {
                    const quantity = quantities[product.id]?.[store.id] || 0

                    return (
                      <td key={store.id} className="px-2 py-2 text-center border-r border-gray-200">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDecrement(product.id, store.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                product.id,
                                store.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-14 text-center py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold text-sm"
                          />

                          <button
                            onClick={() => handleIncrement(product.id, store.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    )
                  })}

                  {/* Product Total */}
                  <td className="px-4 py-3 text-center bg-blue-50 font-bold text-blue-900">
                    {getProductTotal(product.id)}
                  </td>
                </tr>
              ))}

              {/* Store Totals Row */}
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                <td className="sticky left-0 z-10 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 text-left border-r border-gray-300">
                  Store Totals
                </td>
                {stores.map((store) => (
                  <td
                    key={store.id}
                    className="px-3 py-3 text-center border-r border-gray-300 text-gray-900"
                  >
                    {getStoreTotal(store.id)}
                  </td>
                ))}
                <td className="px-4 py-3 text-center bg-blue-600 text-white text-lg">
                  {grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Order Value</p>
              <p className="text-3xl font-black">${totalValue.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Cases</p>
              <p className="text-3xl font-black">{grandTotal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <motion.p
        className="text-center text-sm text-gray-600 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 <strong>Tip:</strong> Use + / - buttons or type quantities directly. Click "Add All to Cart" when ready!
      </motion.p>
    </motion.section>
  )
}
