'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShoppingCart,
  Package,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Clock,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Gift,
  Plus,
  Mail
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useCart as useCartContext } from '@/context/CartContext'
import { calculateSubtotal } from '@/lib/calculateOrderTotal'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useQuery } from '@tanstack/react-query'
import type { CatalogProduct } from '@/lib/queries/catalog'
import { getQuickAddSuggestions, type CartItem } from '@/lib/upsells/smartUpsells'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Types for cart blocks from database
interface CartBlock {
  id: string
  type: string
  title: string
  config: Record<string, unknown>
  position: number
  enabled: boolean
  products?: { product: CatalogProduct }[]
}

// Style presets for blocks
const BLOCK_STYLE_PRESETS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  'minimal': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', accent: 'bg-gray-500' },
  'accent-orange': { bg: 'bg-gradient-to-r from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-900', accent: 'bg-gradient-to-br from-orange-500 to-amber-500' },
  'accent-blue': { bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-900', accent: 'bg-gradient-to-br from-blue-500 to-indigo-500' },
  'accent-green': { bg: 'bg-gradient-to-r from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-900', accent: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  'accent-purple': { bg: 'bg-gradient-to-r from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-900', accent: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  'accent-amber': { bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-gradient-to-br from-amber-500 to-yellow-500' },
}

// Icon mapping for block types
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  'CART_ITEMS': <ShoppingCart className="w-4 h-4 text-white" />,
  'COMPLETE_ORDER': <Zap className="w-4 h-4 text-white" />,
  'TRENDING_NOW': <TrendingUp className="w-4 h-4 text-white" />,
  'PREVIOUSLY_ORDERED': <Clock className="w-4 h-4 text-white" />,
  'BUNDLE_PROGRESS': <Package className="w-4 h-4 text-white" />,
  'REWARDS_STATUS': <Gift className="w-4 h-4 text-white" />,
  'UPSELL_PRODUCTS': <TrendingUp className="w-4 h-4 text-white" />,
  'IMPULSE_ITEMS': <Zap className="w-4 h-4 text-white" />,
  'SUGGESTED_ADDONS': <Plus className="w-4 h-4 text-white" />,
}

interface EnhancedCartDrawerProps {
  isOpen: boolean
  onClose: () => void
  customerId?: string
  onOrderComplete?: () => void
  // For delegated orders - only show items for this specific store
  storeId?: string
  // Customer self-order mode - no PIN required to return to dashboard
  isCustomerSelfOrder?: boolean
  // Where to redirect after order (for customer portal)
  returnUrl?: string
}

type CheckoutStep = 'cart' | 'confirm' | 'success' | 'pin'

export default function EnhancedCartDrawer({ isOpen, onClose, customerId, onOrderComplete, storeId, isCustomerSelfOrder = false, returnUrl }: EnhancedCartDrawerProps) {
  const router = useRouter()
  const { items: allItems, increment, decrement, removeItem, setQuantity, getCartCount, clearCart } = useCartStore()
  const { add } = useCartContext()

  // Filter items by storeId if provided (delegated orders show only that store's items)
  const items = storeId
    ? allItems.filter(item => item.storeId === storeId)
    : allItems
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  // Checkout state
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<{ orderId?: string; printed?: boolean } | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  // Email capture state
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [hasEmailOnFile, setHasEmailOnFile] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)

  const subtotal = calculateSubtotal(items)
  const cartCount = getCartCount()
  const totalCases = items.reduce((sum, item) => sum + item.quantity, 0)

  // Fetch cart blocks from database (admin-configured)
  const { data: blocksData } = useQuery<{ data: CartBlock[] }>({
    queryKey: ['cart-blocks-drawer'],
    queryFn: async () => {
      const res = await fetch('/api/builder/cart/blocks')
      if (!res.ok) return { data: [] }
      return res.json()
    },
    staleTime: 1000 * 2, // 2 seconds for instant updates
    refetchInterval: 3000, // Auto-refresh every 3 seconds for live preview sync
    refetchIntervalInBackground: false, // Only when drawer is open
    enabled: isOpen,
  })

  const cartBlocks = (blocksData?.data || [])
    .filter(b => b.enabled)
    .sort((a, b) => a.position - b.position)

  // Fetch products for upsells
  const { data: productsData } = useQuery<{ data: CatalogProduct[] }>({
    queryKey: ['catalog-products-cart-upsell'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/products?limit=100')
      if (!res.ok) throw new Error('Failed to fetch products')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: isOpen,
  })

  // Fetch customer favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['customer-favorites-cart', customerId],
    queryFn: async () => {
      if (!customerId) return { data: [] }
      const res = await fetch(`/api/orders/reorder-template?customerId=${customerId}&limit=6`)
      if (!res.ok) return { data: [] }
      return res.json()
    },
    enabled: isOpen && !!customerId,
  })

  const allProducts = productsData?.data || []
  const cartProductIds = items.map(item => item.id)

  // Get suggestions (exclude cart items)
  const cartItemsForExclusion: CartItem[] = items.map(item => ({ id: item.id }))
  const quickAddProducts = allProducts.length > 0
    ? getQuickAddSuggestions(
        allProducts[0], // Use first product as seed
        allProducts,
        cartItemsForExclusion,
        4
      )
    : []

  // Filter favorites (exclude cart items)
  const favorites = (favoritesData?.data || [])
    .filter((f: any) => !cartProductIds.includes(f.id))
    .slice(0, 4)

  // Popular/trending products not in cart
  const trendingProducts = allProducts
    .filter(p => (p.featured || p.trending) && !cartProductIds.includes(p.id))
    .slice(0, 4)

  const handleAddProduct = (product: CatalogProduct | any) => {
    // ALWAYS add with quantity 1 to prevent accumulation bugs
    // (previously ordered qty is visual only, not for adding)
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl,
      sku: product.sku,
      unitsPerCase: product.unitsPerCase || 24,
    })
  }

  const handleQuantityBlur = (itemId: string) => {
    const value = inputValues[itemId]
    if (value !== undefined) {
      // Cap at 999 to prevent crazy numbers
      const newQty = Math.min(parseInt(value) || 0, 999)
      if (newQty > 0) {
        setQuantity(itemId, newQty)
      } else {
        removeItem(itemId)
      }
    }
    setEditingId(null)
  }

  // Reset checkout state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setCheckoutStep('cart')
      setOrderResult(null)
      setPin('')
      setPinError('')
      setEmailInput('')
      setEmailError('')
      setShowEmailPrompt(false)
    }
  }, [isOpen])

  // Check if customer has email when entering confirm step
  useEffect(() => {
    if (checkoutStep === 'confirm' && customerId) {
      fetch(`/api/customer/email?customerId=${customerId}`)
        .then(res => res.json())
        .then(data => {
          setHasEmailOnFile(data.hasEmail)
          setCustomerEmail(data.email)
          // Show email prompt if no email on file
          if (!data.hasEmail) {
            setShowEmailPrompt(true)
          }
        })
        .catch(err => {
          console.error('Error checking email:', err)
          setShowEmailPrompt(true)
        })
    }
  }, [checkoutStep, customerId])

  // Save customer email
  const handleSaveEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Please enter a valid email')
      return
    }

    setEmailSaving(true)
    setEmailError('')

    try {
      const res = await fetch('/api/customer/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          email: emailInput
        })
      })

      if (res.ok) {
        setHasEmailOnFile(true)
        setCustomerEmail(emailInput)
        setShowEmailPrompt(false)
      } else {
        const data = await res.json()
        setEmailError(data.error || 'Failed to save email')
      }
    } catch (error) {
      setEmailError('Failed to save email')
    } finally {
      setEmailSaving(false)
    }
  }

  // Submit order
  const handleSubmitOrder = async () => {
    if (!customerId || items.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          items: items.map(item => {
            // Extract actual product UUID from composite key if needed
            // Composite keys are formatted as: productId-storeId (73 chars for two UUIDs)
            // Single UUID is 36 chars
            const productId = item.id.length > 36 && item.storeId
              ? item.id.substring(0, 36)
              : item.id
            return {
              productId,
              quantity: item.quantity,
            }
          }),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setOrderResult({
          orderId: data.data?.id,
          printed: data.data?.workflow?.printed,
        })
        clearCart()
        setCheckoutStep('success')
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Verify PIN and go to dashboard
  const handlePinSubmit = async () => {
    setPinError('')
    try {
      // Check rep session for PIN
      const session = localStorage.getItem('repSession')
      if (session) {
        const parsed = JSON.parse(session)
        if (parsed.pin === pin) {
          router.push('/rep/dashboard')
          onClose()
          onOrderComplete?.()
          return
        }
      }
      setPinError('Invalid PIN')
    } catch {
      setPinError('Invalid PIN')
    }
  }

  // Handle PIN keypad
  const handlePinKey = (key: string) => {
    if (key === 'clear') {
      setPin('')
    } else if (key === 'back') {
      setPin(p => p.slice(0, -1))
    } else if (pin.length < 4) {
      setPin(p => p + key)
    }
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col w-full max-w-md"
          >
            {/* Header - Domino's style */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Your Cart</h2>
                    <p className="text-sm text-white/80">
                      {totalCases} case{totalCases !== 1 ? 's' : ''} • ${subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 text-lg font-semibold mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mb-6">Add items from the catalog to get started</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Items in Cart</h3>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => {
                        // Use composite key for items with storeId
                        const itemKey = item.storeId ? `${item.id}-${item.storeId}` : item.id
                        return (
                        <motion.div
                          key={itemKey}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="bg-gray-50 rounded-xl p-3"
                        >
                          {/* Row 1: Image, Name, Delete */}
                          <div className="flex items-start gap-3 mb-2">
                            {/* Product Image */}
                            <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                              {item.imageUrl ? (
                                <img
                                  src={getPublicImageUrl(item.imageUrl)}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            {/* Product Name - Full width, wraps */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">${item.price.toFixed(2)}/case</p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => removeItem(itemKey)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Row 2: Quantity Controls + Total */}
                          <div className="flex items-center justify-between pl-[68px]">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-0 bg-white rounded-lg border shadow-sm">
                              <button
                                onClick={() => decrement(itemKey)}
                                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-l-lg transition-colors font-bold text-lg"
                              >
                                −
                              </button>
                              {editingId === itemKey ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={inputValues[itemKey] ?? item.quantity}
                                  onChange={(e) => setInputValues({ ...inputValues, [itemKey]: e.target.value })}
                                  onBlur={() => handleQuantityBlur(itemKey)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuantityBlur(itemKey)
                                  }}
                                  autoFocus
                                  className="w-12 text-center text-sm font-bold text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded border-0"
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    setInputValues({ ...inputValues, [itemKey]: String(item.quantity) })
                                    setEditingId(itemKey)
                                  }}
                                  className="w-12 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 py-2"
                                >
                                  {item.quantity}
                                </button>
                              )}
                              <button
                                onClick={() => increment(itemKey)}
                                className="w-9 h-9 flex items-center justify-center text-white bg-emerald-500 hover:bg-emerald-600 rounded-r-lg transition-colors font-bold text-lg"
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total */}
                            <p className="font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dynamic Cart Blocks from Admin */}
                  {cartBlocks.map((block) => {
                    const style = BLOCK_STYLE_PRESETS[(block.config?.style as string) || 'minimal']
                    const maxItems = (block.config?.maxItems as number) || 4
                    const icon = BLOCK_ICONS[block.type] || <Package className="w-4 h-4 text-white" />

                    // Get products for this block - use block's assigned products or fallback to smart selection
                    const getBlockProducts = () => {
                      // If block has assigned products, use those
                      if (block.products && block.products.length > 0) {
                        return block.products
                          .map(bp => bp.product)
                          .filter(p => p && !cartProductIds.includes(p.id))
                          .slice(0, maxItems)
                      }

                      // Otherwise use smart selection based on block type
                      switch (block.type) {
                        case 'COMPLETE_ORDER':
                        case 'UPSELL_PRODUCTS':
                        case 'SUGGESTED_ADDONS':
                          return quickAddProducts.slice(0, maxItems)
                        case 'TRENDING_NOW':
                          return trendingProducts.slice(0, maxItems)
                        case 'PREVIOUSLY_ORDERED':
                          return favorites.slice(0, maxItems)
                        case 'IMPULSE_ITEMS':
                          return allProducts
                            .filter(p => Number(p.price) < 15 && !cartProductIds.includes(p.id))
                            .slice(0, maxItems)
                        default:
                          return allProducts
                            .filter(p => !cartProductIds.includes(p.id))
                            .slice(0, maxItems)
                      }
                    }

                    const blockProducts = getBlockProducts()

                    // Skip if no products to show (except for special blocks)
                    if (blockProducts.length === 0 && !['BUNDLE_PROGRESS', 'REWARDS_STATUS'].includes(block.type)) {
                      return null
                    }

                    // Render BUNDLE_PROGRESS block
                    if (block.type === 'BUNDLE_PROGRESS') {
                      if (totalCases >= 3) return null // Already qualified
                      return (
                        <div key={block.id} className={`p-4 ${style.bg} border-b ${style.border}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${style.accent} rounded-full flex items-center justify-center`}>
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold ${style.text}`}>
                                {block.title || `Add ${3 - totalCases} more case${3 - totalCases !== 1 ? 's' : ''} for 15% off!`}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((totalCases / 3) * 100, 100)}%` }}
                                  className={`${style.accent} h-2 rounded-full`}
                                />
                              </div>
                              <p className={`text-xs ${style.text} opacity-70 mt-1`}>{totalCases}/3 cases</p>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    // Render REWARDS_STATUS block
                    if (block.type === 'REWARDS_STATUS') {
                      return (
                        <div key={block.id} className={`p-4 ${style.bg} border-b ${style.border}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-6 h-6 ${style.accent} rounded-lg flex items-center justify-center`}>
                              {icon}
                            </div>
                            <h3 className={`font-bold ${style.text}`}>{block.title}</h3>
                          </div>
                          <div className="bg-white/80 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-2xl font-bold text-pink-600">1,250</p>
                                <p className="text-xs text-gray-500">Reward Points</p>
                              </div>
                              <Gift className="w-10 h-10 text-pink-400" />
                            </div>
                            <div className="mt-2 p-2 bg-pink-50 rounded-lg">
                              <p className="text-xs text-pink-800 font-medium">250 points away from a free case!</p>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    // Render product-based blocks (TRENDING_NOW, PREVIOUSLY_ORDERED, COMPLETE_ORDER, etc.)
                    const isPreviouslyOrdered = block.type === 'PREVIOUSLY_ORDERED'

                    return (
                      <div key={block.id} className={`p-4 ${style.bg} border-b ${style.border}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-6 h-6 ${style.accent} rounded-lg flex items-center justify-center`}>
                            {icon}
                          </div>
                          <h3 className={`font-bold ${style.text}`}>{block.title}</h3>
                          {block.type === 'TRENDING_NOW' && (
                            <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-[10px] font-bold">HOT</span>
                          )}
                          {isPreviouslyOrdered && (
                            <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-[10px] font-bold">QUICK ADD</span>
                          )}
                        </div>

                        {/* Grid layout for COMPLETE_ORDER, horizontal scroll for others */}
                        {block.type === 'COMPLETE_ORDER' || block.type === 'UPSELL_PRODUCTS' || block.type === 'SUGGESTED_ADDONS' ? (
                          <div className="grid grid-cols-2 gap-2">
                            {blockProducts.map((product: any) => (
                              <motion.button
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAddProduct(product)}
                                className={`flex items-center gap-2 p-2 bg-white border ${style.border} rounded-lg hover:shadow-md transition-all text-left`}
                              >
                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {product.imageUrl ? (
                                    <img
                                      src={getPublicImageUrl(product.imageUrl)}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                                  <p className={`text-xs font-semibold ${style.text}`}>${Number(product.price).toFixed(2)}</p>
                                </div>
                                <div className={`w-6 h-6 ${style.accent} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  <span className="text-white text-sm font-bold">+</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                            {blockProducts.map((product: any) => (
                              <motion.button
                                key={product.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddProduct(product)}
                                className={`flex-shrink-0 ${isPreviouslyOrdered ? 'w-28 p-3' : 'w-24 p-2'} bg-white border ${style.border} rounded-lg hover:shadow-md transition-all text-center snap-start`}
                              >
                                <div className={`${isPreviouslyOrdered ? 'w-18 h-18' : 'w-16 h-16'} mx-auto bg-gray-100 rounded-lg overflow-hidden mb-1 relative`}>
                                  {product.imageUrl ? (
                                    <img
                                      src={getPublicImageUrl(product.imageUrl)}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="w-4 h-4" />
                                    </div>
                                  )}
                                  {isPreviouslyOrdered && product.lastOrderedQuantity && (
                                    <div className={`absolute -top-1 -right-1 w-6 h-6 ${style.accent} rounded-full flex items-center justify-center shadow`}>
                                      <span className="text-white text-xs font-bold">+{product.lastOrderedQuantity}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-[10px] font-medium text-gray-900 line-clamp-2">{product.name}</p>
                                <p className={`text-xs font-bold ${style.text}`}>${Number(product.price).toFixed(2)}</p>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}

{/* No fallback blocks - only show blocks configured in admin */}
                </>
              )}
            </div>

            {/* Footer - Different states */}
            {checkoutStep === 'cart' && items.length > 0 && (
              <div className="border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
                {/* Summary */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal ({totalCases} cases)</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</p>
                </div>

                {/* Checkout Button - goes to confirm if customer selected */}
                {customerId ? (
                  <button
                    onClick={() => setCheckoutStep('confirm')}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full mt-2 py-3 text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}

            {/* Confirm Order Step */}
            {checkoutStep === 'confirm' && (
              <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 p-6 overflow-auto">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cart
                  </button>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Order</h2>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                      <span>Total ({totalCases} cases)</span>
                      <span className="text-emerald-600">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Email Capture - Show if no email on file */}
                  {showEmailPrompt && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">Get Order Updates</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Add your email to receive order confirmations and shipping updates.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={emailInput}
                              onChange={(e) => {
                                setEmailInput(e.target.value)
                                setEmailError('')
                              }}
                              placeholder="your@email.com"
                              className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleSaveEmail}
                              disabled={emailSaving}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              {emailSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Save'
                              )}
                            </button>
                          </div>
                          {emailError && (
                            <p className="text-sm text-red-600 mt-2">{emailError}</p>
                          )}
                          <button
                            onClick={() => setShowEmailPrompt(false)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                          >
                            Skip for now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email on file confirmation */}
                  {hasEmailOnFile && customerEmail && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">
                        Order confirmation will be sent to <span className="font-medium">{customerEmail}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mb-4">
                    By placing this order, it will be sent to the warehouse for processing.
                  </p>
                </div>

                <div className="border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-center font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Step */}
            {checkoutStep === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-600 mb-2">
                  Your order has been submitted successfully.
                </p>
                {orderResult?.printed && (
                  <p className="text-sm text-emerald-600 mb-6">
                    ✓ Picking list sent to printer
                  </p>
                )}

                <div className="w-full space-y-3 mt-4">
                  <button
                    onClick={() => {
                      // For customer self-orders, go directly to return URL
                      if (isCustomerSelfOrder && returnUrl) {
                        clearCart()
                        router.push(returnUrl)
                        onClose()
                        return
                      }
                      // For non-handoff mode (rep ordering without handoff), go to rep dashboard
                      // PIN step is only for hand-off mode - but that's handled by the parent component
                      clearCart()
                      router.push('/rep/dashboard')
                      onClose()
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutStep('cart')
                      // Stay on catalog for more orders
                    }}
                    className="w-full py-3 text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

            {/* PIN Verification Step */}
            {checkoutStep === 'pin' && (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Enter Rep PIN</h2>
                <p className="text-slate-400 text-sm mb-6">Enter your PIN to return to dashboard</p>

                {/* PIN Display */}
                <div className="flex gap-3 mb-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${
                        pin.length > i
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      {pin.length > i ? '•' : ''}
                    </div>
                  ))}
                </div>

                {pinError && (
                  <p className="text-red-400 text-sm mb-4">{pinError}</p>
                )}

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === 'clear' || key === 'back') {
                          handlePinKey(key)
                        } else {
                          handlePinKey(key)
                          // Auto-submit when 4 digits entered
                          if (pin.length === 3) {
                            setTimeout(() => handlePinSubmit(), 100)
                          }
                        }
                      }}
                      className={`h-14 rounded-xl font-bold text-lg transition-colors ${
                        key === 'clear'
                          ? 'bg-red-600 hover:bg-red-500 text-white text-sm'
                          : key === 'back'
                          ? 'bg-slate-700 hover:bg-slate-600 text-white text-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {key === 'clear' ? 'Clear' : key === 'back' ? '←' : key}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCheckoutStep('success')}
                  className="mt-6 text-slate-500 hover:text-slate-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
