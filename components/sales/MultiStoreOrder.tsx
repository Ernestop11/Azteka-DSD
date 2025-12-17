'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Package, ShoppingCart, Gift, Search, Plus } from 'lucide-react'
import Button from '@/components/ui/button'
import ProductCard from '@/components/catalog/ProductCard'
import { useCartStore } from '@/store/cart'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Customer {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface StoreCart {
  customerId: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    imageUrl?: string
  }>
}

interface MultiStoreOrderProps {
  isOpen: boolean
  onClose: () => void
}

interface Product {
  id: string
  name: string
  sku: string
  description?: string | null
  price: number | string
  unitsPerCase: number
  imageUrl?: string | null
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
}

export default function MultiStoreOrder({ isOpen, onClose }: MultiStoreOrderProps) {
  const [activeStoreIndex, setActiveStoreIndex] = useState(0)
  const [storeCarts, setStoreCarts] = useState<Record<string, StoreCart>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const mainCart = useCartStore()

  // Fetch customers (filter for Carlos group - for now, fetch all active customers)
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers', 'carlos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/customers?active=true&limit=9')
      if (!res.ok) throw new Error('Failed to fetch customers')
      const data = await res.json()
      // API returns array directly, not wrapped in data
      return Array.isArray(data) ? data : []
    },
  })

  // Fetch products from catalog
  const { data: productsData, isLoading: isLoadingProducts } = useQuery<{ data: Product[]; meta: any }>({
    queryKey: ['catalog-products', 'multi-store'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=100')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
  })

  const products = productsData?.data || []
  const [submittingOrder, setSubmittingOrder] = useState<string | null>(null)
  const [applyingBundle, setApplyingBundle] = useState(false)
  
  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query) ||
      product.brand?.name.toLowerCase().includes(query)
    )
  })

  // Initialize store carts
  useEffect(() => {
    if (customers.length > 0) {
      const initialCarts: Record<string, StoreCart> = {}
      customers.forEach((customer) => {
        initialCarts[customer.id] = {
          customerId: customer.id,
          items: [],
        }
      })
      setStoreCarts(initialCarts)
    }
  }, [customers])

  const activeStore = customers[activeStoreIndex]
  const activeCart = activeStore ? storeCarts[activeStore.id] : null

  const addToStoreCart = (customerId: string, product: any, quantity: number = 1) => {
    setStoreCarts((prev) => {
      const cart = prev[customerId] || { customerId, items: [] }
      const existingItem = cart.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cart.items.push({
          id: product.id,
          name: product.name,
          price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
          quantity,
          imageUrl: product.imageUrl || undefined,
        })
      }

      return { ...prev, [customerId]: cart }
    })
  }

  const updateStoreCartQuantity = (customerId: string, productId: string, quantity: number) => {
    setStoreCarts((prev) => {
      const cart = prev[customerId]
      if (!cart) return prev

      if (quantity <= 0) {
        cart.items = cart.items.filter((item) => item.id !== productId)
      } else {
        const item = cart.items.find((item) => item.id === productId)
        if (item) {
          item.quantity = quantity
        }
      }

      return { ...prev, [customerId]: cart }
    })
  }

  const cloneOrderToAllStores = () => {
    if (!activeCart || activeCart.items.length === 0) return

    setStoreCarts((prev) => {
      const updated = { ...prev }
      customers.forEach((customer) => {
        if (customer.id !== activeStore?.id) {
          updated[customer.id] = {
            customerId: customer.id,
            items: activeCart.items.map((item) => ({ ...item })),
          }
        }
      })
      return updated
    })
  }

  const applyBundleToAllStores = async () => {
    setApplyingBundle(true)
    try {
      // Fetch available bundles
      const res = await fetch('/api/catalog/bundles')
      if (!res.ok) throw new Error('Failed to fetch bundles')
      const data = await res.json()
      const bundles = data.data || []
      
      if (!bundles || bundles.length === 0) {
        alert('No bundles available')
        return
      }

      // For now, apply the first bundle to all stores
      // In a full implementation, you'd show a bundle selector
      const bundle = bundles[0]
      if (!bundle.items || bundle.items.length === 0) {
        alert('Bundle has no items')
        return
      }

      // Resolve bundle SKUs to products
      const bundleSkus = bundle.items.map((item: any) => item.sku)
      const productRes = await fetch(`/api/catalog/products?limit=1000`)
      if (!productRes.ok) throw new Error('Failed to fetch products for bundle')
      const productData = await productRes.json()
      const allProducts = productData.data || []
      
      // Create SKU to product map
      const skuToProduct = new Map<string, Product>()
      allProducts.forEach((product: Product) => {
        if (product.sku) {
          skuToProduct.set(product.sku.toLowerCase().trim(), product)
        }
      })

      setStoreCarts((prev) => {
        const updated = { ...prev }
        customers.forEach((customer) => {
          const cart = updated[customer.id] || { customerId: customer.id, items: [] }
          
          // Add bundle items to cart
          bundle.items.forEach((bundleItem: any) => {
            const normalizedSku = bundleItem.sku?.toLowerCase().trim()
            const product = normalizedSku ? skuToProduct.get(normalizedSku) : null
            
            if (product) {
              const existingItem = cart.items.find((item) => item.id === product.id)
              const quantity = bundleItem.quantity || 1
              
              if (existingItem) {
                existingItem.quantity += quantity
              } else {
                cart.items.push({
                  id: product.id,
                  name: product.name,
                  price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
                  quantity,
                  imageUrl: product.imageUrl || undefined,
                })
              }
            }
          })
          
          updated[customer.id] = cart
        })
        return updated
      })
      
      alert(`Bundle "${bundle.name || 'Bundle'}" applied to all stores`)
    } catch (error) {
      console.error('Error applying bundle:', error)
      alert('Failed to apply bundle')
    } finally {
      setApplyingBundle(false)
    }
  }

  const getStoreCartTotal = (customerId: string): number => {
    const cart = storeCarts[customerId]
    if (!cart) return 0
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getAllStoresTotal = (): number => {
    return customers.reduce((total, customer) => total + getStoreCartTotal(customer.id), 0)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Multi-Store Order Mode</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage orders for {customers.length} stores
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Store Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {isLoadingCustomers ? (
              <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                Loading stores...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No stores found</div>
            ) : (
              customers.map((customer, index) => {
                const cartTotal = getStoreCartTotal(customer.id)
                const itemCount = storeCarts[customer.id]?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
                return (
                  <button
                    key={customer.id}
                    onClick={() => setActiveStoreIndex(index)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap min-w-[120px] ${
                      activeStoreIndex === index
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <span className="truncate">{customer.businessName}</span>
                      {itemCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                          activeStoreIndex === index
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {itemCount}
                        </span>
                      )}
                    </div>
                    {cartTotal > 0 && (
                      <div className={`text-xs mt-1 text-center ${
                        activeStoreIndex === index ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        ${cartTotal.toFixed(2)}
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Actions Bar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={cloneOrderToAllStores}
                disabled={!activeCart || activeCart.items.length === 0}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Clone Order to All Stores</span>
                <span className="sm:hidden">Clone</span>
              </Button>
              <Button
                onClick={applyBundleToAllStores}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                disabled={applyingBundle}
              >
                <Gift className={`w-4 h-4 mr-2 ${applyingBundle ? 'animate-pulse' : ''}`} />
                {applyingBundle ? (
                  <span>Applying...</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Apply Bundle to All</span>
                    <span className="sm:hidden">Bundle</span>
                  </>
                )}
              </Button>
            </div>
            <div className="text-sm font-semibold text-gray-700">
              Total: <span className="text-blue-600">${getAllStoresTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex">
            {/* Store Cart Sidebar */}
            {activeStore && activeCart && (
              <div className="w-80 border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{activeStore.businessName}</h3>
                  <p className="text-xs text-gray-600">{activeStore.address}, {activeStore.city}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {activeCart.items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeCart.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {item.imageUrl && (
                            <img
                              src={getPublicImageUrl(item.imageUrl)}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStoreCartQuantity(activeStore.id, item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateStoreCartQuantity(activeStore.id, item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Items:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {activeCart.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${getStoreCartTotal(activeStore.id).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={async () => {
                      if (!activeStore || !activeCart || activeCart.items.length === 0) return
                      
                      setSubmittingOrder(activeStore.id)
                      try {
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            customerId: activeStore.id,
                            items: activeCart.items.map((item) => ({
                              productId: item.id,
                              quantity: item.quantity,
                            })),
                          }),
                        })
                        
                        if (!res.ok) {
                          const error = await res.json()
                          throw new Error(error.error || 'Failed to place order')
                        }
                        
                        // Clear cart after successful order
                        setStoreCarts((prev) => ({
                          ...prev,
                          [activeStore.id]: { customerId: activeStore.id, items: [] },
                        }))
                        
                        alert(`Order placed successfully for ${activeStore.businessName}`)
                      } catch (error: any) {
                        console.error('Error placing order:', error)
                        alert(error.message || 'Failed to place order')
                      } finally {
                        setSubmittingOrder(null)
                      }
                    }}
                    disabled={!activeCart || activeCart.items.length === 0 || submittingOrder === activeStore.id}
                  >
                    {submittingOrder === activeStore.id ? 'Placing Order...' : `Place Order for ${activeStore.businessName}`}
                  </Button>
                </div>
              </div>
            )}

            {/* Product Catalog */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Mobile Cart Summary (shown when sidebar is hidden) */}
              {activeStore && activeCart && (
                <div className="md:hidden p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{activeStore.businessName}</h3>
                      <p className="text-xs text-gray-600">
                        {activeCart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        ${getStoreCartTotal(activeStore.id).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={async () => {
                      if (!activeStore || !activeCart || activeCart.items.length === 0) return
                      
                      setSubmittingOrder(activeStore.id)
                      try {
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            customerId: activeStore.id,
                            items: activeCart.items.map((item) => ({
                              productId: item.id,
                              quantity: item.quantity,
                            })),
                          }),
                        })
                        
                        if (!res.ok) {
                          const error = await res.json()
                          throw new Error(error.error || 'Failed to place order')
                        }
                        
                        setStoreCarts((prev) => ({
                          ...prev,
                          [activeStore.id]: { customerId: activeStore.id, items: [] },
                        }))
                        
                        alert(`Order placed successfully for ${activeStore.businessName}`)
                      } catch (error: any) {
                        console.error('Error placing order:', error)
                        alert(error.message || 'Failed to place order')
                      } finally {
                        setSubmittingOrder(null)
                      }
                    }}
                    disabled={!activeCart || activeCart.items.length === 0 || submittingOrder === activeStore.id}
                  >
                    {submittingOrder === activeStore.id ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              )}
              
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, category, or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {searchQuery && (
                  <p className="text-xs text-gray-500 mt-2">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingProducts ? (
                  <div className="text-center text-gray-500 py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                    <p className="text-sm">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">
                      {searchQuery ? 'No products found matching your search' : 'No products available'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product, index) => {
                      const activeStore = customers[activeStoreIndex]
                      const activeCart = activeStore ? storeCarts[activeStore.id] : null
                      const cartItem = activeCart?.items.find((item) => item.id === product.id)
                      const quantity = cartItem?.quantity || 0

                      return (
                        <div key={product.id} className="relative group">
                          <ProductCard product={product} index={index} mode="preview" />
                          {/* Quick Add Overlay */}
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            {quantity > 0 ? (
                              <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                                <button
                                  onClick={() => updateStoreCartQuantity(activeStore?.id || '', product.id, quantity - 1)}
                                  className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm font-medium"
                                  disabled={!activeStore}
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                                <button
                                  onClick={() => {
                                    if (activeStore) {
                                      addToStoreCart(activeStore.id, product, 1)
                                    }
                                  }}
                                  className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 text-sm font-medium"
                                  disabled={!activeStore}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (activeStore) {
                                    addToStoreCart(activeStore.id, product, 1)
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                disabled={!activeStore}
                              >
                                <Plus className="w-4 h-4" />
                                Quick Add
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

