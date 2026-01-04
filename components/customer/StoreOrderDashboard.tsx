'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package, Truck, Clock, MapPin, Phone,
  CheckCircle, AlertCircle, ShoppingCart, Edit3, Share2, Users, Copy, Check, Upload,
  X, Send, MessageCircle, User, ChevronRight
} from 'lucide-react'
import { useCartStore } from '@/store/cart'

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

interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku?: string
  quantity: number
  price: number
}

interface Order {
  id: string
  status: string
  total: number
  notes?: string
  createdAt: string
  itemCount: number
  items?: OrderItem[]
}

interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
  role?: string
}

interface StoreOrderDashboardProps {
  store: Store
  customerId: string
}

// Get short name for La Superior stores
function getShortName(businessName: string, city?: string): string {
  const superiorMatch = businessName.match(/la\s*superior\s*#?(\d+)/i)
  if (superiorMatch) {
    const storeNum = superiorMatch[1]
    const cityName = city || ''
    return cityName ? `La Superior #${storeNum}, ${cityName}` : `La Superior #${storeNum}`
  }
  const parts = businessName.split(' - ')
  return parts.length > 1 ? parts[parts.length - 1] : businessName
}

export default function StoreOrderDashboard({ store, customerId }: StoreOrderDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const { items } = useCartStore()

  // Delegate modal flow state
  const [showDelegateModal, setShowDelegateModal] = useState(false)
  const [delegateStep, setDelegateStep] = useState<'generate' | 'contacts' | 'send'>('generate')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [sendingLink, setSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  // Order detail modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Default contacts from store data + option to add custom
  const storeContacts: Contact[] = [
    { id: 'primary', name: store.contactName, phone: store.phone, email: store.email, role: 'Primary Contact' },
  ]

  // Get cart items for this specific store
  const storeCartItems = items.filter(item => item.storeId === store.id)
  const storeCartTotal = storeCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const storeCartCount = storeCartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    loadOrders()
  }, [store.id])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/history/${store.id}?limit=20`)
      if (res.ok) {
        const json = await res.json()
        // API returns { data: { orders: [...] } } structure
        const data = json.data || json
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDelegateLink = async () => {
    setGeneratingLink(true)
    try {
      const res = await fetch(`/api/rep/customer/${store.id}/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkPurpose: 'HANDOFF',
          createdById: customerId,
        })
      })
      if (res.ok) {
        const data = await res.json()
        // API returns 'magicLink' not 'link'
        setGeneratedLink(data.magicLink)
        // Move to contact selection step
        setDelegateStep('contacts')
      }
    } catch (error) {
      console.error('Error generating link:', error)
    } finally {
      setGeneratingLink(false)
    }
  }

  // Open delegate modal and start the flow
  const openDelegateFlow = () => {
    setShowDelegateModal(true)
    setDelegateStep('generate')
    setSelectedContact(null)
    setLinkSent(false)
    // If we already have a link, go to contacts
    if (generatedLink) {
      setDelegateStep('contacts')
    }
  }

  // Close modal and reset
  const closeDelegateModal = () => {
    setShowDelegateModal(false)
    setDelegateStep('generate')
    setSelectedContact(null)
    setLinkSent(false)
  }

  // Select contact and move to send step
  const selectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setDelegateStep('send')
  }

  // Send link to selected contact (via SMS/copy)
  const sendLinkToContact = async () => {
    if (!generatedLink || !selectedContact) return

    setSendingLink(true)
    try {
      // For now, just copy to clipboard - could integrate SMS API later
      await navigator.clipboard.writeText(generatedLink)
      setLinkSent(true)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      console.error('Error sending link:', error)
    } finally {
      setSendingLink(false)
    }
  }

  const copyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing': case 'picking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped': case 'in_transit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered': case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processing': case 'picking': return <Package className="w-4 h-4" />
      case 'shipped': case 'in_transit': return <Truck className="w-4 h-4" />
      case 'delivered': case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Separate open orders (pending, processing, shipped) from past orders (delivered, completed)
  const openOrders = orders.filter(o =>
    ['pending', 'processing', 'picking', 'shipped', 'in_transit'].includes(o.status.toLowerCase())
  )
  const pastOrders = orders.filter(o =>
    ['delivered', 'completed'].includes(o.status.toLowerCase())
  )

  return (
    <div className="space-y-4 pb-32">
      {/* Delegate Section - Opens modal flow */}
      <button
        onClick={openDelegateFlow}
        className="w-full bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Delegate ordering</span>
          </div>
          <div className="flex items-center gap-2">
            {generatedLink ? (
              <span className="text-xs text-emerald-400">Link ready</span>
            ) : (
              <span className="text-xs text-slate-500">Generate link</span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </button>

      {/* Open Cart Section - Shows if there are items in cart for this store */}
      {storeCartCount > 0 && (
        <Link
          href={`/catalog?customer=${store.id}&delegated=true&parent=${customerId}&storeName=${encodeURIComponent(getShortName(store.businessName, store.city))}`}
          className="block bg-amber-500/20 rounded-xl p-4 border-2 border-amber-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/30 rounded-lg">
                <Edit3 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-amber-400 font-bold">Open Cart</p>
                <p className="text-xs text-slate-400">
                  {storeCartCount} items • Tap to continue
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-bold text-lg">${storeCartTotal.toFixed(2)}</p>
              <span className="text-xs text-amber-300">In Progress</span>
            </div>
          </div>
        </Link>
      )}

      {/* Store Info Card */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{store.address}, {store.city}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Phone className="w-4 h-4" />
            <span>{store.phone}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-white">{store.orderCount}</p>
            <p className="text-[9px] text-slate-400">Orders</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">
              ${(store.totalSpent / 1000).toFixed(1)}k
            </p>
            <p className="text-[9px] text-slate-400">Spent</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-400">{store.pendingOrders}</p>
            <p className="text-[9px] text-slate-400">Pending</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-purple-400">{store.inTransitOrders}</p>
            <p className="text-[9px] text-slate-400">In Transit</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* OPEN ORDERS Section - Highlighted */}
          {openOrders.length > 0 && (
            <div>
              <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Open Orders ({openOrders.length})
              </h3>
              <div className="space-y-2">
                {openOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-emerald-500/10 rounded-xl p-4 border-2 border-emerald-500/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-white font-medium">Order #{order.id.slice(-6)}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">${Number(order.total).toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAST ORDERS Section */}
          <div>
            <h3 className="text-slate-400 font-medium mb-3">Past Orders</h3>
            {pastOrders.length === 0 && openOrders.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No orders yet for this store</p>
              </div>
            ) : pastOrders.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No completed orders yet</p>
            ) : (
              <div className="space-y-2">
                {pastOrders.slice(0, 10).map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full bg-slate-800 rounded-xl p-3 border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {order.notes || `Order #${order.id.slice(-6)}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-300 font-medium text-sm">${Number(order.total).toFixed(2)}</p>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delegate Modal - Multi-step flow */}
      {showDelegateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={closeDelegateModal}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 rounded-2xl z-50 border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-emerald-600">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-white" />
                <div>
                  <h2 className="font-bold text-white">Delegate Order</h2>
                  <p className="text-xs text-emerald-100">{getShortName(store.businessName, store.city)}</p>
                </div>
              </div>
              <button
                onClick={closeDelegateModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content based on step */}
            <div className="p-4">
              {delegateStep === 'generate' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    Generate a magic link to let someone else place orders for this store.
                  </p>
                  <button
                    onClick={generateDelegateLink}
                    disabled={generatingLink}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                  >
                    {generatingLink ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Generate Link
                      </>
                    )}
                  </button>
                </div>
              )}

              {delegateStep === 'contacts' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    Select a contact to send the ordering link to:
                  </p>

                  {/* Contact Options */}
                  <div className="space-y-2">
                    {storeContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => selectContact(contact)}
                        className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-left"
                      >
                        <div className="p-2 bg-emerald-600/20 rounded-lg">
                          <User className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{contact.name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {contact.phone && <span>{contact.phone}</span>}
                            {contact.email && contact.phone && <span> • </span>}
                            {contact.email && <span>{contact.email}</span>}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                    ))}

                    {/* Copy link directly option */}
                    <button
                      onClick={() => {
                        copyLink()
                        closeDelegateModal()
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-dashed border-slate-600 transition-colors text-left"
                    >
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <Copy className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300 font-medium">Copy link manually</p>
                        <p className="text-xs text-slate-500">Share via any app</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {delegateStep === 'send' && selectedContact && (
                <div className="space-y-4">
                  {!linkSent ? (
                    <>
                      <div className="text-center">
                        <div className="inline-flex p-4 bg-emerald-600/20 rounded-full mb-3">
                          <User className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold text-lg">{selectedContact.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {selectedContact.phone || selectedContact.email || 'No contact info'}
                        </p>
                      </div>

                      <p className="text-slate-400 text-sm text-center">
                        Send the ordering link to this contact?
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setDelegateStep('contacts')}
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={sendLinkToContact}
                          disabled={sendingLink}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
                        >
                          {sendingLink ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Copy className="w-5 h-5" />
                              Copy & Send
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="inline-flex p-4 bg-emerald-600/20 rounded-full mb-3">
                        <Check className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Link Copied!</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Send this link to {selectedContact.name} via text or email.
                      </p>
                      <button
                        onClick={closeDelegateModal}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-slate-900 rounded-2xl z-50 border border-slate-800 overflow-hidden max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                </div>
                <div>
                  <h2 className="font-bold text-white">
                    {selectedOrder.notes || `Order #${selectedOrder.id.slice(-6)}`}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                        {item.productSku && (
                          <p className="text-xs text-slate-500">{item.productSku}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                        <span className="text-slate-400 text-sm">x{item.quantity}</span>
                        <span className="text-white font-medium text-sm w-16 text-right">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No item details available</p>
                </div>
              )}
            </div>

            {/* Footer with Total */}
            <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500 text-xs ml-2">{selectedOrder.itemCount} items</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Total</p>
                  <p className="text-emerald-400 font-bold text-lg">${Number(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
