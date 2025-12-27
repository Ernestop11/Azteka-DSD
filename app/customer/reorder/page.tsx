'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useCartStore } from '@/store/cart'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

interface FavoriteProduct {
  id: string
  name: string
  sku: string
  price: number
  customerPrice: number
  imageUrl: string | null
  inStock: boolean
  unitsPerCase: number
  orderCount: number
  totalQuantityOrdered: number
  suggestedQuantity: number
  brand?: { id: string; name: string } | null
}

export default function CustomerReorderPage() {
  const router = useRouter()
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { addItem, items, getQuantity, increment, decrement, clearCart, switchCustomer } = useCartStore()

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      router.replace('/customer/login')
      return
    }

    const parsed = JSON.parse(stored) as CustomerSession
    setSession(parsed)
    switchCustomer(parsed.customerId)
    loadFavorites(parsed.customerId)
  }, [router])

  const loadFavorites = async (customerId: string) => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/favorites`)
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuggested = (product: FavoriteProduct) => {
    const currentQty = getQuantity(product.id)
    if (currentQty === 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.customerPrice,
        quantity: product.suggestedQuantity,
        imageUrl: product.imageUrl || undefined,
      })
    } else {
      // Add suggested amount to current
      for (let i = 0; i < product.suggestedQuantity; i++) {
        increment(product.id)
      }
    }
  }

  const handleQuickReorderAll = () => {
    clearCart()
    switchCustomer(session?.customerId || '')

    favorites.forEach(product => {
      if (product.inStock) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.customerPrice,
          quantity: product.suggestedQuantity,
          imageUrl: product.imageUrl || undefined,
        })
      }
    })
  }

  const handleSubmitOrder = async () => {
    if (!session || items.length === 0) return

    setSubmitting(true)
    try {
      const orderData = {
        customerId: session.customerId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        // Mark session as used (for magic links)
        const stored = localStorage.getItem('customerSession')
        if (stored) {
          const parsed = JSON.parse(stored)
          await fetch(`/api/customer/session?token=${parsed.token}`, { method: 'DELETE' })
        }

        clearCart()
        router.push('/customer/orders?success=true')
      } else {
        const error = await res.json()
        alert(`Order failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Failed to submit order')
    } finally {
      setSubmitting(false)
    }
  }

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quick Reorder</h1>
          <p className="text-slate-400 text-sm">Products you order regularly</p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={handleQuickReorderAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Add All
          </button>
        )}
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700/50">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold text-white mb-2">No Order History</h2>
          <p className="text-slate-400 mb-6">
            Place your first order to see your favorites here
          </p>
          <Link
            href={`/catalog?customer=${session?.customerId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
          >
            Browse Catalog
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {favorites.map((product) => {
            const qty = getQuantity(product.id)

            return (
              <div
                key={product.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
              >
                {/* Order frequency badge */}
                <div className="bg-blue-600/20 px-3 py-1 flex items-center justify-between">
                  <span className="text-blue-400 text-xs font-medium">
                    {product.orderCount}x ordered
                  </span>
                  <button
                    onClick={() => handleAddSuggested(product)}
                    disabled={!product.inStock}
                    className="text-emerald-400 hover:text-emerald-300 text-xs font-bold disabled:text-slate-500"
                  >
                    +{product.suggestedQuantity}
                  </button>
                </div>

                {/* Product image */}
                <div className="aspect-square bg-white m-3 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-3 pt-0 space-y-2">
                  <h3 className="text-white text-sm font-medium line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">${product.customerPrice.toFixed(2)}</span>
                    <span className="text-slate-500 text-xs">{product.unitsPerCase}/case</span>
                  </div>

                  {/* Quantity controls */}
                  {product.inStock ? (
                    qty > 0 ? (
                      <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
                        <button
                          onClick={() => decrement(product.id)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-600 hover:bg-slate-500 rounded-lg text-white text-lg"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-white font-bold">{qty}</span>
                        <button
                          onClick={() => increment(product.id)}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-lg"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddSuggested(product)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Add {product.suggestedQuantity}
                      </button>
                    )
                  ) : (
                    <div className="w-full py-2 bg-slate-700 text-slate-400 text-sm text-center rounded-lg">
                      Out of Stock
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Browse More CTA */}
      <Link
        href={`/catalog?customer=${session?.customerId}`}
        className="block w-full py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white text-center font-medium rounded-xl transition-colors"
      >
        Browse Full Catalog →
      </Link>

      {/* Sticky Cart Footer */}
      {items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 px-4 py-3 z-40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm">{cartCount} items</p>
              <p className="text-xl font-bold text-white">${cartTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-bold rounded-xl transition-colors"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* Extra bottom padding for cart footer */}
      {items.length > 0 && <div className="h-24" />}
    </div>
  )
}
