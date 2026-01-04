'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, ChevronRight, Star, Plus, Camera, FileText, TrendingUp, ShoppingCart, Clock, Check, AlertTriangle, Truck, FileCheck } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'
import { useCartStore } from '@/store/cart'

interface CustomerDetail {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  priceTier: string
  latitude?: number
  longitude?: number
  notes?: string
  lastVisitDate: string | null
  nextScheduledVisit: string | null
  visitFrequency: string | null
  orderCount?: number
  lastOrderDate?: string | null
  totalSpent?: number
}

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  total: number
  status: string
  itemCount: number
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  productImage: string | null
  quantity: number
  price: number
  total: number
}

interface DeliveryInfo {
  id: string
  hasDriverSignature: boolean
  hasCustomerSignature: boolean
  driverName: string | null
  customerName: string | null
  notes: string | null
  hasIssues: boolean
  confirmedItems: unknown
  deliveryStarted: string | null
  confirmedAt: string | null
}

interface OrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt?: string
  status: string
  total: number
  customerName: string
  notes: string | null
  items: OrderItem[]
  delivery: DeliveryInfo | null
}

interface TopProduct {
  id: string
  name: string
  sku: string
  imageUrl: string | null
  totalQuantity: number
  orderCount: number
  lastOrdered: string
}

interface Analytics {
  topProducts: TopProduct[]
  monthlyData: { month: string; total: number; orderCount: number }[]
  stats: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    orderFrequency: number
  }
}

interface Survey {
  id: string
  surveyDate: string
  satisfactionScore: number
  serviceQuality: number
  deliveryRating: number | null
  productQuality: number | null
  pricingFairness: number | null
  notes: string | null
  productFeedback: string | null
  improvementSuggestions: string | null
  followUpRequired: boolean
}

interface ProductRequest {
  id: string
  productName: string
  productSku: string | null
  description: string | null
  competitorPrice: number | null
  competitorName: string | null
  imageUrl: string | null
  status: string
  createdAt: string
  adminNotes: string | null
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  // Cart store for current order
  const { items: cartItems, customerId: cartCustomerId, getTotal, clearCart, _hasHydrated } = useCartStore()
  const hasActiveCart = _hasHydrated && cartCustomerId === customerId && cartItems.length > 0
  const cartTotal = hasActiveCart ? getTotal() : 0

  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'pricing'>('overview')
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [repSession, setRepSession] = useState<{ id: string; name: string; token: string } | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed'>('all')

  // Modals
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showSurveyHistory, setShowSurveyHistory] = useState(false)
  const [showAppLinkModal, setShowAppLinkModal] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Survey form state
  const [surveyForm, setSurveyForm] = useState({
    satisfactionScore: 0,
    serviceQuality: 0,
    deliveryRating: 0,
    productQuality: 0,
    pricingFairness: 0,
    notes: '',
    productFeedback: '',
    improvementSuggestions: '',
    followUpRequired: false
  })
  const [submittingSurvey, setSubmittingSurvey] = useState(false)

  // Product request form state
  const [requestForm, setRequestForm] = useState({
    productName: '',
    productSku: '',
    description: '',
    competitorPrice: '',
    competitorName: ''
  })
  const [submittingRequest, setSubmittingRequest] = useState(false)

  // Pricing tab state
  const [productSearch, setProductSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{
    id: string
    name: string
    sku: string
    basePrice: number
    priceTierA: number | null
    priceTierB: number | null
    priceTierC: number | null
    imageUrl: string | null
    hasOverride: boolean
    override: { fixedPrice: number | null; discountPercent: number | null } | null
  }[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [editingOverride, setEditingOverride] = useState<string | null>(null)
  const [overridePrice, setOverridePrice] = useState('')
  const [savingOverride, setSavingOverride] = useState(false)
  const [existingOverrides, setExistingOverrides] = useState<{
    id: string
    productId: string
    productName: string
    productSku: string
    fixedPrice: number | null
    discountPercent: number | null
  }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('repSession')
    if (!stored) {
      router.replace('/rep/login')
      return
    }

    try {
      const session = JSON.parse(stored)
      setRepSession(session)
      loadCustomerData(session.token)
      loadAnalytics()
      loadSurveys()
      loadProductRequests()
    } catch {
      router.replace('/rep/login')
    }
  }, [customerId, router])

  const loadCustomerData = async (token: string) => {
    try {
      const customerRes = await fetch(`/api/rep/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (customerRes.ok) {
        const data = await customerRes.json()
        setCustomer(data.customer)
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/analytics`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const loadSurveys = async () => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/surveys`)
      if (res.ok) {
        const data = await res.json()
        setSurveys(data.surveys || [])
      }
    } catch (error) {
      console.error('Error loading surveys:', error)
    }
  }

  const loadProductRequests = async () => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/product-requests`)
      if (res.ok) {
        const data = await res.json()
        setProductRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading product requests:', error)
    }
  }

  const startOrder = () => {
    sessionStorage.setItem('selectedCustomerId', customerId)
    router.push(`/catalog?customer=${customerId}&mode=rep`)
  }

  const openInMaps = () => {
    if (!customer) return
    const address = encodeURIComponent(`${customer.address}, ${customer.city}, ${customer.state} ${customer.zipCode}`)
    window.open(`https://maps.google.com/?q=${address}`, '_blank')
  }

  const callCustomer = () => {
    if (!customer?.phone) return
    window.location.href = `tel:${customer.phone}`
  }

  const loadOrderDetail = async (orderId: string) => {
    setOrderLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data.order)
      }
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setOrderLoading(false)
    }
  }

  const submitSurvey = async () => {
    if (surveyForm.satisfactionScore === 0 || surveyForm.serviceQuality === 0) {
      alert('Please rate satisfaction and service quality')
      return
    }

    setSubmittingSurvey(true)
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...surveyForm,
          conductedById: repSession?.id || 'unknown'
        })
      })

      if (res.ok) {
        setShowSurveyModal(false)
        setSurveyForm({
          satisfactionScore: 0,
          serviceQuality: 0,
          deliveryRating: 0,
          productQuality: 0,
          pricingFairness: 0,
          notes: '',
          productFeedback: '',
          improvementSuggestions: '',
          followUpRequired: false
        })
        loadSurveys()
        // Refresh customer data to update lastVisitDate
        if (repSession) loadCustomerData(repSession.token)
      } else {
        alert('Failed to submit survey')
      }
    } catch {
      alert('Failed to submit survey')
    } finally {
      setSubmittingSurvey(false)
    }
  }

  const submitProductRequest = async () => {
    if (!requestForm.productName.trim()) {
      alert('Product name is required')
      return
    }

    setSubmittingRequest(true)
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/product-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestForm,
          competitorPrice: requestForm.competitorPrice ? parseFloat(requestForm.competitorPrice) : null,
          createdById: repSession?.id || 'unknown'
        })
      })

      if (res.ok) {
        setShowRequestModal(false)
        setRequestForm({
          productName: '',
          productSku: '',
          description: '',
          competitorPrice: '',
          competitorName: ''
        })
        loadProductRequests()
      } else {
        alert('Failed to submit request')
      }
    } catch {
      alert('Failed to submit request')
    } finally {
      setSubmittingRequest(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': case 'completed': return 'bg-emerald-500/20 text-emerald-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'processing': case 'picking': return 'bg-blue-500/20 text-blue-400'
      case 'shipped': case 'in_transit': return 'bg-purple-500/20 text-purple-400'
      case 'cancelled': case 'rejected': return 'bg-red-500/20 text-red-400'
      case 'approved': case 'fulfilled': return 'bg-emerald-500/20 text-emerald-400'
      case 'in_review': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  // Generate MVP Dashboard link for customer to install as PWA
  const generateAppLink = async () => {
    setLinkLoading(true)
    setGeneratedLink(null)
    setLinkCopied(false)
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkPurpose: 'MVP_DASHBOARD',
          createdById: repSession?.id
        })
      })
      if (res.ok) {
        const data = await res.json()
        setGeneratedLink(data.magicLink)
        setShowAppLinkModal(true)
      } else {
        alert('Failed to generate link')
      }
    } catch {
      alert('Failed to generate link')
    } finally {
      setLinkLoading(false)
    }
  }

  const copyLinkToClipboard = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generatedLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const shareLink = async () => {
    if (!generatedLink || !customer) return
    const shareText = `Hi! Here's your Azteka app link for ${customer.businessName}. Open this on your phone and add it to your home screen: ${generatedLink}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Azteka App',
          text: shareText,
          url: generatedLink
        })
      } catch {
        // User cancelled or share failed, copy instead
        copyLinkToClipboard()
      }
    } else {
      // Fallback to SMS on mobile
      window.location.href = `sms:?body=${encodeURIComponent(shareText)}`
    }
  }

  const getDaysSinceVisit = (date: string | null) => {
    if (!date) return null
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  // Load existing price overrides for this customer
  const loadExistingOverrides = async () => {
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/price-overrides`)
      if (res.ok) {
        const data = await res.json()
        setExistingOverrides(data.overrides || [])
      }
    } catch (error) {
      console.error('Error loading overrides:', error)
    }
  }

  // Load overrides when pricing tab is active
  useEffect(() => {
    if (activeTab === 'pricing') {
      loadExistingOverrides()
    }
  }, [activeTab, customerId])

  // Product search for pricing tab
  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/rep/products/search?q=${encodeURIComponent(query)}&customerId=${customerId}&limit=15`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.products || [])
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Save price override
  const saveOverride = async (productId: string) => {
    if (!overridePrice || isNaN(parseFloat(overridePrice))) {
      alert('Please enter a valid price')
      return
    }
    setSavingOverride(true)
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/price-overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          overrideType: 'FIXED_PRICE',
          fixedPrice: overridePrice,
          createdById: repSession?.id || 'unknown'
        })
      })

      if (res.ok) {
        // Refresh search results and existing overrides
        if (productSearch) searchProducts(productSearch)
        loadExistingOverrides()
        setEditingOverride(null)
        setOverridePrice('')
      } else {
        alert('Failed to save price override')
      }
    } catch {
      alert('Failed to save price override')
    } finally {
      setSavingOverride(false)
    }
  }

  // Remove price override
  const removeOverride = async (productId: string) => {
    if (!confirm('Remove this price override?')) return
    try {
      const res = await fetch(`/api/rep/customer/${customerId}/price-overrides?productId=${productId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        if (productSearch) searchProducts(productSearch)
        loadExistingOverrides()
      }
    } catch {
      alert('Failed to remove override')
    }
  }

  // Debounced product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearch.length >= 2) {
        searchProducts(productSearch)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch])

  // Star rating component
  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <Star
            className={`w-5 h-5 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Customer not found</p>
          <Link href="/rep/dashboard" className="text-blue-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const latestSurvey = surveys[0] || null
  const pendingRequests = productRequests.filter(r => r.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Safe area background for iPhone notch */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900 z-50" style={{ height: 'env(safe-area-inset-top)' }} />

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-3 sticky top-0 z-40" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold truncate">{customer.businessName}</h1>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                  customer.priceTier === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                  customer.priceTier === 'B' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {customer.priceTier}
                </span>
              </div>
              <p className="text-slate-400 text-xs truncate">{customer.contactName}</p>
            </div>
          </div>
          <button
            onClick={startOrder}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
          >
            <span>🛒</span> Order
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-3 py-3 flex gap-2 overflow-x-auto">
        <button
          onClick={callCustomer}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-slate-600 transition-colors flex-shrink-0"
        >
          <span>📞</span>
          <span className="text-sm">Call</span>
        </button>
        <button
          onClick={openInMaps}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-slate-600 transition-colors flex-shrink-0"
        >
          <span>🗺️</span>
          <span className="text-sm">Navigate</span>
        </button>
        <button
          onClick={() => setShowSurveyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors flex-shrink-0"
        >
          <span>📋</span>
          <span className="text-sm text-purple-300">Survey</span>
        </button>
        <button
          onClick={() => router.push(`/rep/seed-invoice?customer=${customerId}`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors flex-shrink-0"
        >
          <span>📄</span>
          <span className="text-sm text-blue-300">Seed Invoice</span>
        </button>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/20 border border-amber-500/30 rounded-lg hover:bg-amber-600/30 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-300">Request</span>
        </button>
        <button
          onClick={generateAppLink}
          disabled={linkLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <span>📲</span>
          <span className="text-sm text-emerald-300">{linkLoading ? 'Loading...' : 'Send App'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 mb-3">
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'orders', label: 'Orders', icon: '📦' },
            { id: 'pricing', label: 'Pricing', icon: '💰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-3 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Key Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-slate-400 text-[10px]">Orders</p>
                <p className="text-lg font-bold">{customer.orderCount || 0}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-slate-400 text-[10px]">Total</p>
                <p className="text-lg font-bold text-emerald-400">${((customer.totalSpent || 0) / 1000).toFixed(1)}k</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-slate-400 text-[10px]">Avg Order</p>
                <p className="text-lg font-bold">${analytics?.stats.averageOrderValue?.toFixed(0) || '0'}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-slate-400 text-[10px]">Last Visit</p>
                <p className="text-lg font-bold">
                  {customer.lastVisitDate ? `${getDaysSinceVisit(customer.lastVisitDate)}d` : '-'}
                </p>
              </div>
            </div>

            {/* Top Products */}
            {analytics && analytics.topProducts.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Top Products
                  </h3>
                  <span className="text-xs text-slate-500">{analytics.topProducts.length} items</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {analytics.topProducts.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className="bg-slate-700/50 rounded-lg p-2 flex items-center gap-2"
                    >
                      <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={getPublicImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-400">{product.totalQuantity} ordered</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Activity Chart - Simple CSS bars */}
            {analytics && analytics.monthlyData.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-3">
                <h3 className="font-semibold text-sm mb-3">Order Activity (12 Months)</h3>
                <div className="flex items-end gap-1 h-20">
                  {analytics.monthlyData.slice(-12).map((month, i) => {
                    const maxTotal = Math.max(...analytics.monthlyData.map(m => m.total))
                    const height = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0
                    return (
                      <div key={month.month} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-emerald-500/50 rounded-t transition-all"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <span className="text-[8px] text-slate-500 mt-1">
                          {month.month.slice(5)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {analytics.stats.orderFrequency > 0 && (
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Orders every ~{analytics.stats.orderFrequency} days on average
                  </p>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-slate-800 rounded-xl p-3">
              <h3 className="font-semibold text-sm mb-2 text-slate-300">Contact Info</h3>
              <div className="space-y-2">
                <button
                  onClick={openInMaps}
                  className="w-full flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-slate-400">📍</span>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{customer.address}</p>
                    <p className="text-[10px] text-slate-400">{customer.city}, {customer.state} {customer.zipCode}</p>
                  </div>
                </button>
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-slate-400">📞</span>
                    <span className="text-xs text-blue-400">{customer.phone}</span>
                  </a>
                )}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-slate-400">✉️</span>
                    <span className="text-xs text-blue-400 truncate">{customer.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Latest Survey */}
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-300">Latest Survey</h3>
                {surveys.length > 0 && (
                  <button
                    onClick={() => setShowSurveyHistory(true)}
                    className="text-xs text-blue-400"
                  >
                    View All ({surveys.length})
                  </button>
                )}
              </div>
              {latestSurvey ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(latestSurvey.surveyDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Satisfaction:</span>
                      <StarRating value={latestSurvey.satisfactionScore} readonly />
                    </div>
                  </div>
                  {latestSurvey.notes && (
                    <p className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded">{latestSurvey.notes}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500 mb-2">No surveys yet</p>
                  <button
                    onClick={() => setShowSurveyModal(true)}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    Conduct First Survey
                  </button>
                </div>
              )}
            </div>

            {/* Product Requests */}
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-300 flex items-center gap-2">
                  Product Requests
                  {pendingRequests > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">
                      {pendingRequests} pending
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="text-xs text-amber-400 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              {productRequests.length > 0 ? (
                <div className="space-y-2">
                  {productRequests.slice(0, 3).map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{req.productName}</p>
                        {req.competitorPrice && (
                          <p className="text-[10px] text-slate-400">
                            Competitor: ${req.competitorPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-2">No product requests</p>
              )}
            </div>

            {/* Notes */}
            {customer.notes && (
              <div className="bg-slate-800 rounded-xl p-3">
                <h3 className="font-semibold text-sm mb-2 text-slate-300">Notes</h3>
                <p className="text-xs text-slate-400">{customer.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {/* Current Cart / Open Order Section */}
            {hasActiveCart && (
              <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-amber-400">Current Order</h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full">
                      {cartItems.length} items
                    </span>
                  </div>
                  <span className="text-lg font-bold text-amber-400">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startOrder}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm transition-colors"
                  >
                    Continue Order
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Clear the current cart?')) clearCart()
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {/* Cart preview */}
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {cartItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs bg-slate-800/50 rounded px-2 py-1">
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="text-slate-400 ml-2">×{item.quantity}</span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-[10px] text-slate-500 text-center">+{cartItems.length - 3} more items</p>
                  )}
                </div>
              </div>
            )}

            {/* Order History Header & Filters */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-300">Order History</h3>
              <div className="flex gap-1">
                {(['all', 'pending', 'completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                      orderFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {orders.length === 0 && !hasActiveCart ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg mb-2">No orders yet</p>
                <button
                  onClick={startOrder}
                  className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors"
                >
                  Create First Order
                </button>
              </div>
            ) : (
              orders
                .filter(order => {
                  if (orderFilter === 'all') return true
                  if (orderFilter === 'pending') return ['pending', 'processing', 'picking', 'packing', 'in_transit'].includes(order.status.toLowerCase())
                  if (orderFilter === 'completed') return ['delivered', 'completed'].includes(order.status.toLowerCase())
                  return true
                })
                .map((order) => (
                <button
                  key={order.id}
                  onClick={() => loadOrderDetail(order.id)}
                  className="w-full bg-slate-800 rounded-xl p-3 hover:bg-slate-700/80 active:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">#{order.orderNumber}</span>
                      {/* Status icon */}
                      {order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'completed' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : order.status.toLowerCase() === 'in_transit' ? (
                        <Truck className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items
                    </span>
                    <span className="font-semibold text-emerald-400">${order.total.toFixed(2)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-3">
            {/* Price Tier */}
            <div className="bg-slate-800 rounded-xl p-3">
              <h3 className="font-semibold text-sm mb-2 text-slate-300">Current Price Tier</h3>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                  customer.priceTier === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                  customer.priceTier === 'B' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {customer.priceTier}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {customer.priceTier === 'A' ? 'Premium' :
                     customer.priceTier === 'B' ? 'Standard' : 'Basic'} Tier
                  </p>
                  <p className="text-xs text-slate-400">
                    Uses Tier {customer.priceTier} pricing by default
                  </p>
                </div>
              </div>
            </div>

            {/* Current Price Overrides */}
            {existingOverrides.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-amber-400">Active Overrides</h3>
                  <span className="text-xs text-amber-400/70">{existingOverrides.length} products</span>
                </div>
                <div className="space-y-2">
                  {existingOverrides.map((override) => (
                    <div key={override.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{override.productName}</p>
                        <p className="text-[10px] text-slate-400">{override.productSku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-amber-400">
                          ${override.fixedPrice?.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeOverride(override.productId)}
                          className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 bg-red-500/10 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Search for Price Overrides */}
            <div className="bg-slate-800 rounded-xl p-3">
              <h3 className="font-semibold text-sm mb-2 text-slate-300">Set Price Overrides</h3>
              <p className="text-xs text-slate-500 mb-3">Search products to set custom prices for this customer.</p>

              {/* Search Input */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by name or SKU..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div key={product.id} className="bg-slate-700/50 rounded-lg p-2">
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 bg-slate-600 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={getPublicImageUrl(product.imageUrl)} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-[10px] text-slate-400">{product.sku}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500">
                              Base: ${product.basePrice.toFixed(2)}
                            </span>
                            {customer.priceTier === 'A' && product.priceTierA && (
                              <span className="text-[10px] text-emerald-400">Tier A: ${product.priceTierA.toFixed(2)}</span>
                            )}
                            {customer.priceTier === 'B' && product.priceTierB && (
                              <span className="text-[10px] text-blue-400">Tier B: ${product.priceTierB.toFixed(2)}</span>
                            )}
                            {customer.priceTier === 'C' && product.priceTierC && (
                              <span className="text-[10px] text-slate-400">Tier C: ${product.priceTierC.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Override controls */}
                      <div className="mt-2 pt-2 border-t border-slate-600/50">
                        {product.hasOverride && product.override ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Override</span>
                              <span className="text-sm font-semibold text-amber-400">${product.override.fixedPrice?.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={() => removeOverride(product.id)}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : editingOverride === product.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={overridePrice}
                              onChange={(e) => setOverridePrice(e.target.value)}
                              placeholder="0.00"
                              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-sm text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => saveOverride(product.id)}
                              disabled={savingOverride}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium disabled:opacity-50"
                            >
                              {savingOverride ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditingOverride(null); setOverridePrice('') }}
                              className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingOverride(product.id); setOverridePrice('') }}
                            className="text-xs text-blue-400 hover:underline"
                          >
                            + Set Custom Price
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {productSearch.length >= 2 && searchResults.length === 0 && !searchLoading && (
                <p className="text-xs text-slate-500 text-center py-4">No products found</p>
              )}

              {productSearch.length < 2 && (
                <p className="text-xs text-slate-500 text-center py-4">Type at least 2 characters to search</p>
              )}
            </div>

            {/* Frequently Ordered Quick Access */}
            {analytics && analytics.topProducts.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-3">
                <h3 className="font-semibold text-sm mb-2 text-slate-300">Frequently Ordered</h3>
                <p className="text-xs text-slate-500 mb-3">Click a product to search and set a custom price.</p>
                <div className="flex flex-wrap gap-2">
                  {analytics.topProducts.slice(0, 8).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setProductSearch(product.name.split(' ').slice(0, 2).join(' '))}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={getPublicImageUrl(product.imageUrl)} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      <span className="text-[10px] truncate max-w-[100px]">{product.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Survey Modal */}
      <AnimatePresence>
        {showSurveyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowSurveyModal(false)}
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-[90vh] bg-slate-900 rounded-t-2xl overflow-hidden"
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold">Customer Survey</h3>
                <button onClick={() => setShowSurveyModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
                {/* Ratings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Satisfaction *</span>
                    <StarRating value={surveyForm.satisfactionScore} onChange={(v) => setSurveyForm({...surveyForm, satisfactionScore: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Quality *</span>
                    <StarRating value={surveyForm.serviceQuality} onChange={(v) => setSurveyForm({...surveyForm, serviceQuality: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Delivery</span>
                    <StarRating value={surveyForm.deliveryRating} onChange={(v) => setSurveyForm({...surveyForm, deliveryRating: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Product Quality</span>
                    <StarRating value={surveyForm.productQuality} onChange={(v) => setSurveyForm({...surveyForm, productQuality: v})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Pricing</span>
                    <StarRating value={surveyForm.pricingFairness} onChange={(v) => setSurveyForm({...surveyForm, pricingFairness: v})} />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">General Notes</label>
                  <textarea
                    value={surveyForm.notes}
                    onChange={(e) => setSurveyForm({...surveyForm, notes: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    rows={2}
                    placeholder="Any comments..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Product Feedback</label>
                  <textarea
                    value={surveyForm.productFeedback}
                    onChange={(e) => setSurveyForm({...surveyForm, productFeedback: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    rows={2}
                    placeholder="Specific product feedback..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Suggestions</label>
                  <textarea
                    value={surveyForm.improvementSuggestions}
                    onChange={(e) => setSurveyForm({...surveyForm, improvementSuggestions: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    rows={2}
                    placeholder="How can we improve..."
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={surveyForm.followUpRequired}
                    onChange={(e) => setSurveyForm({...surveyForm, followUpRequired: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Requires follow-up</span>
                </label>

                <button
                  onClick={submitSurvey}
                  disabled={submittingSurvey}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 rounded-xl font-medium"
                >
                  {submittingSurvey ? 'Submitting...' : 'Submit Survey'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowRequestModal(false)}
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-[85vh] bg-slate-900 rounded-t-2xl overflow-hidden"
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold">Product Request</h3>
                <button onClick={() => setShowRequestModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={requestForm.productName}
                    onChange={(e) => setRequestForm({...requestForm, productName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">SKU (if known)</label>
                  <input
                    type="text"
                    value={requestForm.productSku}
                    onChange={(e) => setRequestForm({...requestForm, productSku: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    rows={2}
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Competitor Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={requestForm.competitorPrice}
                      onChange={(e) => setRequestForm({...requestForm, competitorPrice: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                      placeholder="$0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Competitor</label>
                    <input
                      type="text"
                      value={requestForm.competitorName}
                      onChange={(e) => setRequestForm({...requestForm, competitorName: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                      placeholder="Where seen"
                    />
                  </div>
                </div>

                <button
                  onClick={submitProductRequest}
                  disabled={submittingRequest}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 rounded-xl font-medium"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Survey History Modal */}
      <AnimatePresence>
        {showSurveyHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowSurveyHistory(false)}
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-[85vh] bg-slate-900 rounded-t-2xl overflow-hidden"
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold">Survey History</h3>
                <button onClick={() => setShowSurveyHistory(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                {surveys.map((survey) => (
                  <div key={survey.id} className="bg-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {new Date(survey.surveyDate).toLocaleDateString()}
                      </span>
                      <StarRating value={survey.satisfactionScore} readonly />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Service:</span>
                        <StarRating value={survey.serviceQuality} readonly />
                      </div>
                      {survey.deliveryRating && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Delivery:</span>
                          <StarRating value={survey.deliveryRating} readonly />
                        </div>
                      )}
                    </div>
                    {survey.notes && (
                      <p className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded">{survey.notes}</p>
                    )}
                    {survey.followUpRequired && !survey.followUpCompleted && (
                      <span className="text-[10px] text-amber-400">Follow-up needed</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal with Story Timeline */}
      <AnimatePresence>
        {(selectedOrder || orderLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => !orderLoading && setSelectedOrder(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden"
            >
              {orderLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedOrder && (
                <>
                  <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">Order #{selectedOrder.orderNumber}</h3>
                        <p className="text-slate-400 text-sm">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                        <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full bg-slate-700/50">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    {/* Order Story Timeline */}
                    <div className="mb-4 bg-slate-800/50 rounded-xl p-3">
                      <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Order Story
                      </h4>
                      <div className="space-y-3">
                        {/* Ordered */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">Order Placed</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(selectedOrder.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>

                        {/* Processing/Picking */}
                        {['processing', 'picking', 'packing', 'shipped', 'in_transit', 'delivered', 'completed'].includes(selectedOrder.status.toLowerCase()) && (
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Package className="w-3 h-3 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-white">Processing Started</p>
                              <p className="text-[10px] text-slate-400">Order being prepared</p>
                            </div>
                          </div>
                        )}

                        {/* Delivery */}
                        {selectedOrder.delivery && (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Truck className="w-3 h-3 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-white">Out for Delivery</p>
                                {selectedOrder.delivery.driverName && (
                                  <p className="text-[10px] text-slate-400">Driver: {selectedOrder.delivery.driverName}</p>
                                )}
                                {selectedOrder.delivery.deliveryStarted && (
                                  <p className="text-[10px] text-slate-400">
                                    {new Date(selectedOrder.delivery.deliveryStarted).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Confirmed */}
                            {selectedOrder.delivery.confirmedAt && (
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileCheck className="w-3 h-3 text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-white">Delivered & Confirmed</p>
                                  <p className="text-[10px] text-slate-400">
                                    {new Date(selectedOrder.delivery.confirmedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </p>
                                  <div className="flex gap-2 mt-1">
                                    {selectedOrder.delivery.hasDriverSignature && (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Driver signed</span>
                                    )}
                                    {selectedOrder.delivery.hasCustomerSignature && (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">Customer signed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Issues */}
                            {selectedOrder.delivery.hasIssues && (
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <AlertTriangle className="w-3 h-3 text-red-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-red-400">Issues Reported</p>
                                  {selectedOrder.delivery.notes && (
                                    <p className="text-[10px] text-slate-400 mt-1 bg-red-500/10 rounded p-1.5">
                                      {selectedOrder.delivery.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Pending status */}
                        {selectedOrder.status.toLowerCase() === 'pending' && (
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Clock className="w-3 h-3 text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-yellow-400">Awaiting Processing</p>
                              <p className="text-[10px] text-slate-400">Order will be processed soon</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Notes */}
                    {selectedOrder.notes && (
                      <div className="mb-4 bg-slate-800/50 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-slate-400 mb-1">Order Notes</h4>
                        <p className="text-sm text-white">{selectedOrder.notes}</p>
                      </div>
                    )}

                    {/* Items List */}
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Items ({selectedOrder.items.length})</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-2.5">
                          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.productImage ? (
                              <img src={getPublicImageUrl(item.productImage)} alt={item.productName} className="w-full h-full object-contain" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm line-clamp-1">{item.productName}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-slate-400 text-xs">{item.quantity} × ${item.price.toFixed(2)}</span>
                              <span className="text-emerald-400 font-semibold text-sm">${item.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Order Total</span>
                      <span className="text-2xl font-bold text-emerald-400">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Link Modal */}
      <AnimatePresence>
        {showAppLinkModal && generatedLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAppLinkModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-emerald-500/30"
            >
              <div className="bg-emerald-600/20 border-b border-emerald-500/30 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📲</span>
                  <div>
                    <h3 className="font-bold text-white">Send App Link</h3>
                    <p className="text-emerald-300 text-sm">{customer?.businessName}</p>
                  </div>
                </div>
                <button onClick={() => setShowAppLinkModal(false)} className="p-2 rounded-full bg-slate-700/50">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <p className="text-slate-300 text-sm">
                  Send this link to the customer. They can open it on their phone and save the app to their home screen.
                </p>

                {/* Link display */}
                <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Magic Link</p>
                  <p className="text-emerald-400 text-sm break-all font-mono">{generatedLink}</p>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyLinkToClipboard}
                    className={`py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      linkCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        Copy Link
                      </>
                    )}
                  </button>
                  <button
                    onClick={shareLink}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📤</span>
                    Share / SMS
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Instructions for customer:</p>
                  <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                    <li>Open the link on their iPhone/Android</li>
                    <li>Tap Share button (iOS) or Menu (Android)</li>
                    <li>Select &quot;Add to Home Screen&quot;</li>
                    <li>Log in with phone + PIN</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
