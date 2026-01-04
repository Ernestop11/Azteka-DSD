'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Package, TrendingUp, Clock, Plus, Users,
  ChevronRight, Truck, LayoutGrid, FileSpreadsheet,
  ShoppingCart, Link as LinkIcon, CheckCircle, AlertCircle,
  Menu, Home, RotateCcw, ClipboardList, LogOut, Key, Eye, EyeOff,
  Calendar, Phone, MapPin, X, ArrowLeft, Edit3, Share2
} from 'lucide-react'
import StoreCard from '@/components/customer/StoreCard'
import StoreOrderDashboard from '@/components/customer/StoreOrderDashboard'
import DelegationPanel from '@/components/customer/DelegationPanel'
import MultiStoreReorderSpreadsheet from '@/components/catalog/MultiStoreReorderSpreadsheet'
import { useCartStore } from '@/store/cart'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

interface Store {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
  lastOrderStatus: string | null
  pendingOrders: number
  inTransitOrders: number
}

interface AggregateStats {
  totalStores: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  pendingOrders: number
  inTransitOrders: number
}

interface SpreadsheetProduct {
  id: string
  name: string
  sku?: string
  imageUrl?: string | null
  price: number
  unitsPerCase?: number
  lastOrderedQuantities: Record<string, number>
}

interface SpreadsheetStore {
  id: string
  name: string
}

interface StoreQuantity {
  storeId: string
  storeName: string
  quantity: number
}

type ViewMode = 'dashboard' | 'spreadsheet' | 'delegation'

function MultiStoreDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [stats, setStats] = useState<AggregateStats | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [loading, setLoading] = useState(true)
  const [ownerName, setOwnerName] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [delegateStoreId, setDelegateStoreId] = useState<string | null>(null)
  const [delegateStoreName, setDelegateStoreName] = useState<string | null>(null)
  const [showStoreSelection, setShowStoreSelection] = useState(false)

  // Get cart items from store
  const { items: cartItems } = useCartStore()

  // Group cart items by store to show open carts
  const openCarts = stores.map(store => {
    const storeItems = cartItems.filter(item => item.storeId === store.id)
    const total = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const count = storeItems.reduce((sum, item) => sum + item.quantity, 0)
    return { store, items: storeItems, total, count }
  }).filter(cart => cart.count > 0)
  const [showChangePinModal, setShowChangePinModal] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [changingPin, setChangingPin] = useState(false)

  // Spreadsheet state
  const [spreadsheetProducts, setSpreadsheetProducts] = useState<SpreadsheetProduct[]>([])
  const [spreadsheetStores, setSpreadsheetStores] = useState<SpreadsheetStore[]>([])
  const [spreadsheetLoading, setSpreadsheetLoading] = useState(false)
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderResult, setOrderResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      // Use window.location for more reliable redirect on mobile Safari
      window.location.href = '/customer/login'
      return
    }

    const parsed = JSON.parse(stored) as CustomerSession
    if (parsed.role !== 'OWNER') {
      window.location.href = '/customer/dashboard'
      return
    }

    setSession(parsed)
    loadStoreData(parsed.customerId)
  }, [router])

  // Handle delegate query param - when coming from store detail "Delegate" button
  useEffect(() => {
    const delegateId = searchParams.get('delegate')
    const storeName = searchParams.get('storeName')
    if (delegateId) {
      setDelegateStoreId(delegateId)
      setDelegateStoreName(storeName)
      setViewMode('delegation')
      // Clear the URL params
      router.replace('/customer/multi-store', { scroll: false })
    }
  }, [searchParams, router])

  const loadStoreData = async (ownerId: string) => {
    try {
      const res = await fetch(`/api/customer/multi-store?ownerId=${ownerId}`)
      if (res.ok) {
        const data = await res.json()
        setStores(data.stores || [])
        setStats(data.aggregateStats || null)
        setOwnerName(data.owner?.businessName || '')
      }
    } catch (error) {
      console.error('Error loading store data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load spreadsheet data when switching to spreadsheet view
  const loadSpreadsheetData = async (ownerId: string) => {
    setSpreadsheetLoading(true)
    try {
      const res = await fetch(`/api/customer/multi-store/products?ownerId=${ownerId}`)
      if (res.ok) {
        const data = await res.json()
        setSpreadsheetProducts(data.products || [])
        setSpreadsheetStores(data.stores || [])
      }
    } catch (error) {
      console.error('Error loading spreadsheet data:', error)
    } finally {
      setSpreadsheetLoading(false)
    }
  }

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setOrderResult(null) // Clear any order result
    if (mode === 'spreadsheet' && spreadsheetProducts.length === 0 && session) {
      loadSpreadsheetData(session.customerId)
    }
  }

  // Handle adding products to cart from spreadsheet
  const handleAddToCart = async (productId: string, storeQuantities: StoreQuantity[]) => {
    // This is called for individual product rows - we'll handle in bulk submit
    console.log('Add to cart:', productId, storeQuantities)
  }

  // Handle copying last order quantities
  const handleCopyLastOrder = () => {
    // The component already has lastOrderedQuantities pre-populated
    // This could refresh from server or reset to last order values
    if (session) {
      loadSpreadsheetData(session.customerId)
    }
  }

  // Handle bulk order submission
  const handleBulkOrderSubmit = async (quantities: Record<string, Record<string, number>>) => {
    if (!session) return

    setSubmittingOrder(true)
    setOrderResult(null)

    try {
      // Build orders per store
      const ordersByStore: Record<string, Array<{ productId: string; quantity: number; price: number }>> = {}

      for (const [productId, storeQuantities] of Object.entries(quantities)) {
        const product = spreadsheetProducts.find(p => p.id === productId)
        if (!product) continue

        for (const [storeId, quantity] of Object.entries(storeQuantities)) {
          if (quantity <= 0) continue

          if (!ordersByStore[storeId]) {
            ordersByStore[storeId] = []
          }
          ordersByStore[storeId].push({
            productId,
            quantity,
            price: product.price
          })
        }
      }

      // Convert to API format
      const orders = Object.entries(ordersByStore).map(([storeId, items]) => ({
        storeId,
        items
      }))

      if (orders.length === 0) {
        setOrderResult({
          success: false,
          message: 'No items to order',
          details: 'Please add quantities to at least one product for a store.'
        })
        return
      }

      const res = await fetch('/api/customer/multi-store/bulk-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: session.customerId, orders })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setOrderResult({
          success: true,
          message: `${data.summary.ordersCreated} orders created!`,
          details: `Total: $${data.summary.totalValue.toFixed(2)} across ${data.summary.totalItems} items`
        })
        // Refresh store data to show new orders
        loadStoreData(session.customerId)
      } else {
        setOrderResult({
          success: false,
          message: data.error || 'Failed to submit orders',
          details: data.errors?.map((e: { storeId: string; error: string }) => e.error).join(', ')
        })
      }
    } catch (error) {
      setOrderResult({
        success: false,
        message: 'Error submitting orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSubmittingOrder(false)
    }
  }

  const selectedStore = selectedStoreId ? stores.find(s => s.id === selectedStoreId) : null

  const handleLogout = () => {
    localStorage.removeItem('customerSession')
    router.replace('/customer/login')
  }

  const handleChangePin = async () => {
    setPinError('')
    setPinSuccess('')

    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      setPinError('PIN must be 4-6 digits')
      return
    }

    if (!/^\d+$/.test(newPin)) {
      setPinError('PIN must contain only numbers')
      return
    }

    if (newPin !== confirmPin) {
      setPinError('New PINs do not match')
      return
    }

    if (!session) return

    setChangingPin(true)

    try {
      const res = await fetch('/api/customer/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: session.customerId,
          currentPin,
          newPin,
          token: session.token
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setPinSuccess('PIN updated successfully!')
        setCurrentPin('')
        setNewPin('')
        setConfirmPin('')
        setTimeout(() => {
          setShowChangePinModal(false)
          setPinSuccess('')
        }, 2000)
      } else {
        setPinError(data.error || 'Failed to change PIN')
      }
    } catch (error) {
      setPinError('Error changing PIN')
    } finally {
      setChangingPin(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Sort stores by urgency (most days since order first)
  const sortedStores = [...stores].sort((a, b) => {
    const getDays = (date: string | null) => date ? Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)) : 999
    return getDays(b.lastOrderDate) - getDays(a.lastOrderDate)
  })

  // Helper to format date
  const formatLastOrder = (date: string | null) => {
    if (!date) return 'Never ordered'
    const d = new Date(date)
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-40">
      {/* Compact Owner Bar - No hamburger icon (use bottom nav Menu instead) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] px-[max(1rem,env(safe-area-inset-left))]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 rounded-lg">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{ownerName}</h1>
            <p className="text-slate-400 text-xs">{stores.length} Locations</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Either store list OR store detail */}
      {!selectedStore ? (
        <>
          {/* OPEN CARTS - Show prominently at the top when there are open carts */}
          {openCarts.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium text-sm">Open Carts ({openCarts.length})</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {openCarts.map(({ store, count, total }) => {
                  const storeName = store.businessName.match(/la\s*superior\s*#?(\d+)/i)
                    ? `#${store.businessName.match(/la\s*superior\s*#?(\d+)/i)?.[1]} ${store.city}`
                    : store.businessName.split(' - ').pop() || store.businessName
                  return (
                    <Link
                      key={store.id}
                      href={`/catalog?customer=${store.id}&delegated=true&parent=${session?.customerId}&storeName=${encodeURIComponent(storeName)}`}
                      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                    >
                      <div className="p-2 bg-amber-500/30 rounded-lg">
                        <Edit3 className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-amber-400 font-bold text-sm whitespace-nowrap">{storeName}</p>
                        <p className="text-xs text-slate-400">{count} items</p>
                      </div>
                      <span className="text-amber-400 font-bold ml-2">${total.toFixed(2)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Store List - Simple like Inventory */}
          <div className="px-4 py-3">
            <div className="space-y-2">
              {sortedStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isSelected={false}
                  onSelect={setSelectedStoreId}
                />
              ))}
            </div>
          </div>

          {/* View Mode Toggle - Only show in list view */}
          <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 mt-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange('spreadsheet')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'spreadsheet'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Bulk Order
              </button>
              <button
                onClick={() => handleViewModeChange('delegation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'delegation'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Users className="w-4 h-4" />
                Delegate
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Store Detail Header - Back button + Store name */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStoreId(null)}
                className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex-1">
                <h2 className="text-white font-bold">{selectedStore.businessName}</h2>
                <p className="text-slate-400 text-xs">{selectedStore.contactName} • {selectedStore.city}</p>
              </div>
            </div>
          </div>

          {/* Store Detail Dashboard */}
          <div className="px-4 py-4">
            <StoreOrderDashboard
              store={selectedStore}
              customerId={session?.customerId || ''}
            />
          </div>
        </>
      )}

      {/* Spreadsheet/Delegation Views - Only when NOT in store detail */}
      {!selectedStore && viewMode !== 'dashboard' && (
        <div className="px-4 py-4">
          {viewMode === 'spreadsheet' && (
            <div className="space-y-4">
            {/* Order Result Message */}
            {orderResult && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                orderResult.success
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                {orderResult.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${orderResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {orderResult.message}
                  </p>
                  {orderResult.details && (
                    <p className="text-sm text-slate-400 mt-1">{orderResult.details}</p>
                  )}
                </div>
              </div>
            )}

            {spreadsheetLoading ? (
              <div className="bg-slate-800 rounded-xl p-8 text-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading products...</p>
              </div>
            ) : spreadsheetProducts.length > 0 ? (
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                <MultiStoreReorderSpreadsheet
                  products={spreadsheetProducts}
                  stores={spreadsheetStores}
                  onAddToCart={handleAddToCart}
                  onCopyLastOrder={handleCopyLastOrder}
                />
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">No Order History</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Start ordering from the catalog to build your frequently ordered products list.
                </p>
                <Link
                  href={`/catalog?customer=${session?.customerId}&mode=multi-store`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Open Catalog
                </Link>
              </div>
            )}
          </div>
        )}

          {viewMode === 'delegation' && (
            <DelegationPanel
              stores={stores}
              ownerId={session?.customerId || ''}
              preSelectedStoreId={delegateStoreId}
              preSelectedStoreName={delegateStoreName}
            />
          )}
        </div>
      )}

      {/* Slide-out Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 border-r border-slate-800 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between pl-[max(1rem,env(safe-area-inset-left))]">
              <div>
                <h2 className="font-bold text-white">{ownerName}</h2>
                <p className="text-xs text-emerald-400">Multi-Store Owner</p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Open Carts Section - Shows if there are any open carts */}
              {openCarts.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-amber-500 px-4 py-2 flex items-center gap-2">
                    <Edit3 className="w-3 h-3" />
                    Open Carts ({openCarts.length})
                  </p>
                  {openCarts.map(({ store, count, total }) => {
                    const storeName = store.businessName.match(/la\s*superior\s*#?(\d+)/i)
                      ? `La Superior #${store.businessName.match(/la\s*superior\s*#?(\d+)/i)?.[1]}, ${store.city}`
                      : store.businessName.split(' - ').pop() || store.businessName
                    return (
                      <Link
                        key={store.id}
                        href={`/catalog?customer=${store.id}&delegated=true&parent=${session?.customerId}&storeName=${encodeURIComponent(storeName)}`}
                        onClick={() => setShowMenu(false)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Edit3 className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-amber-400 font-medium text-sm">{storeName}</p>
                            <p className="text-xs text-slate-400">{count} items</p>
                          </div>
                        </div>
                        <span className="text-amber-400 font-bold">${total.toFixed(2)}</span>
                      </Link>
                    )
                  })}
                  <div className="border-t border-slate-700 my-3" />
                </>
              )}

              {/* Quick Actions Section */}
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 py-2">Quick Actions</p>

              <button
                onClick={() => {
                  setShowMenu(false)
                  handleViewModeChange('spreadsheet')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Bulk Order (All Stores)
              </button>

              <Link
                href="/customer/delegate"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Delegate Tasks
              </Link>

              <div className="border-t border-slate-700 my-3" />

              {/* Team Section */}
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 py-2">Team</p>

              <Link
                href="/customer/managers"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Users className="w-5 h-5" />
                Store Managers
              </Link>

              <div className="border-t border-slate-700 my-3" />

              {/* Account Section */}
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 py-2">Account</p>

              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowChangePinModal(true)
                  setPinError('')
                  setPinSuccess('')
                  setCurrentPin('')
                  setNewPin('')
                  setConfirmPin('')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Key className="w-5 h-5" />
                Change PIN
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowChangePinModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 rounded-2xl z-50 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Key className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="font-bold text-white">Change PIN</h2>
              </div>
              <button
                onClick={() => setShowChangePinModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {pinError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {pinError}
                </div>
              )}

              {pinSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {pinSuccess}
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-sm mb-2">Current PIN</label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter current PIN"
                    inputMode="numeric"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-xl tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showCurrentPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">New PIN (4-6 digits)</label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter new PIN"
                    inputMode="numeric"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-xl tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Confirm New PIN</label>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Confirm new PIN"
                  inputMode="numeric"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-xl tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleChangePin}
                disabled={changingPin || !newPin || !confirmPin}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {changingPin ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update PIN'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Store Selection Modal - When clicking Order without a store selected */}
      {showStoreSelection && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowStoreSelection(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 rounded-2xl z-50 border border-slate-800 overflow-hidden max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-emerald-600">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-white" />
                <h2 className="font-bold text-white text-lg">New Order</h2>
              </div>
              <button
                onClick={() => setShowStoreSelection(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-400 text-sm mb-4">Select a store to start ordering:</p>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {sortedStores.map((store) => {
                  const storeName = store.businessName.match(/la\s*superior\s*#?(\d+)/i)
                    ? `La Superior #${store.businessName.match(/la\s*superior\s*#?(\d+)/i)?.[1]}, ${store.city}`
                    : store.businessName.split(' - ').pop() || store.businessName
                  const storeCart = openCarts.find(c => c.store.id === store.id)
                  return (
                    <Link
                      key={store.id}
                      href={`/catalog?customer=${store.id}&delegated=true&parent=${session?.customerId}&storeName=${encodeURIComponent(storeName)}`}
                      onClick={() => setShowStoreSelection(false)}
                      className={`block p-4 rounded-xl border transition-colors ${
                        storeCart
                          ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className={`w-5 h-5 ${storeCart ? 'text-amber-400' : 'text-slate-400'}`} />
                          <div>
                            <p className={`font-medium ${storeCart ? 'text-amber-400' : 'text-white'}`}>{storeName}</p>
                            <p className="text-xs text-slate-500">{store.contactName}</p>
                          </div>
                        </div>
                        {storeCart && (
                          <div className="text-right">
                            <p className="text-amber-400 font-bold">${storeCart.total.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">{storeCart.count} items</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation - Changes based on context */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2 px-[max(0.5rem,env(safe-area-inset-left))]">
          {selectedStore ? (
            <>
              {/* When store is selected: Stores | ORDER (center) | Menu */}
              {/* Stores Tab - Left */}
              <button
                onClick={() => {
                  setSelectedStoreId(null)
                  handleViewModeChange('dashboard')
                }}
                className="flex flex-col items-center gap-1 px-6 py-2 text-slate-400"
              >
                <Building2 className="w-6 h-6" />
                <span className="text-xs">Stores</span>
              </button>

              {/* Order Button - Center (glowing cart) */}
              <button
                onClick={() => {
                  const storeName = selectedStore.businessName.match(/la\s*superior\s*#?(\d+)/i)
                    ? `La Superior #${selectedStore.businessName.match(/la\s*superior\s*#?(\d+)/i)?.[1]}, ${selectedStore.city}`
                    : selectedStore.businessName.split(' - ').pop() || selectedStore.businessName
                  window.location.href = `/catalog?customer=${selectedStore.id}&delegated=true&parent=${session?.customerId}&storeName=${encodeURIComponent(storeName)}`
                }}
                className="flex flex-col items-center gap-1 px-4 py-2 -mt-4"
              >
                <div className="p-4 rounded-full shadow-lg transition-all bg-emerald-600 shadow-emerald-500/30 animate-order-glow">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-emerald-400 font-medium">Order</span>
              </button>

              {/* Menu Tab - Right */}
              <button
                onClick={() => setShowMenu(true)}
                className="flex flex-col items-center gap-1 px-6 py-2 text-slate-400"
              >
                <Menu className="w-6 h-6" />
                <span className="text-xs">Menu</span>
              </button>
            </>
          ) : (
            <>
              {/* When no store selected: Menu | STORES (center) | Menu */}
              {/* Left placeholder for balance */}
              <button
                onClick={() => setShowMenu(true)}
                className="flex flex-col items-center gap-1 px-6 py-2 text-slate-400"
              >
                <Menu className="w-6 h-6" />
                <span className="text-xs">Menu</span>
              </button>

              {/* Stores Button - Center (glowing) */}
              <button
                onClick={() => {
                  setSelectedStoreId(null)
                  handleViewModeChange('dashboard')
                }}
                className="flex flex-col items-center gap-1 px-4 py-2 -mt-4"
              >
                <div className="p-4 rounded-full shadow-lg transition-all bg-emerald-600 shadow-emerald-500/30 animate-order-glow">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs text-emerald-400 font-medium">Stores</span>
              </button>

              {/* Right - Delegate link */}
              <Link
                href="/customer/delegate"
                className="flex flex-col items-center gap-1 px-6 py-2 text-slate-400"
              >
                <Users className="w-6 h-6" />
                <span className="text-xs">Delegate</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}

// Wrap in Suspense because we use useSearchParams
export default function MultiStoreDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MultiStoreDashboardContent />
    </Suspense>
  )
}
