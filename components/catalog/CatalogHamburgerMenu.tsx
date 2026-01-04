'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Star, Grid3X3, Package, Layers, ShoppingBag, Users, ArrowLeft, RotateCcw, UserCheck, Search, ScanBarcode, Lock, Building2 } from 'lucide-react'

export type CatalogTab = 'catalog' | 'favorites' | 'bundles' | 'categories' | 'orders' | 'credits' | 'handoff'
export type UserMode = 'rep' | 'customer' | 'carlos' | 'guest'

interface CatalogHamburgerMenuProps {
  activeTab: CatalogTab
  onTabChange: (tab: CatalogTab) => void
  userMode: UserMode
  customerId?: string | null
  customerName?: string | null
  favoritesCount?: number
  onBackToDashboard?: () => void
  isHandoffMode?: boolean
  onEnterHandoff?: () => void
  onExitHandoff?: (pin: string) => boolean
  // For delegated store orders
  isDelegatedOrder?: boolean
  parentCustomerId?: string | null
  storeName?: string | null
}

export default function CatalogHamburgerMenu({
  activeTab,
  onTabChange,
  userMode,
  customerId,
  customerName,
  favoritesCount,
  onBackToDashboard,
  isHandoffMode,
  onEnterHandoff,
  onExitHandoff,
  isDelegatedOrder,
  parentCustomerId,
  storeName,
}: CatalogHamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  // Only render portal after mount (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Auto-submit PIN when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && showPinModal && onExitHandoff) {
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        if (onExitHandoff(pin)) {
          setShowPinModal(false)
          setIsOpen(false)
          setPin('')
          setPinError(false)
        } else {
          setPinError(true)
          setPin('')
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [pin, showPinModal, onExitHandoff])

  const handleTabClick = (tab: CatalogTab) => {
    onTabChange(tab)
    setIsOpen(false)
  }

  // Drawer content - rendered via portal
  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 99998,
            }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '320px',
              maxWidth: '85vw',
              height: '100vh',
              backgroundColor: '#0f172a',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Delegated Order Context - Ordering for a specific store */}
              {isDelegatedOrder && storeName && (
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">Ordering for store:</span>
                  </div>
                  <p className="text-white font-bold mt-1 truncate">{storeName}</p>
                </div>
              )}

              {/* Customer Context (for rep/customer modes) */}
              {!isDelegatedOrder && customerId && customerName && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Ordering for:</span>
                  </div>
                  <p className="text-white font-bold mt-1 truncate">{customerName}</p>
                </div>
              )}

              {/* Mode indicator */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userMode === 'rep' ? 'bg-blue-500/20 text-blue-400' :
                  userMode === 'carlos' ? 'bg-purple-500/20 text-purple-400' :
                  userMode === 'customer' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {userMode === 'rep' ? 'Sales Rep' :
                   userMode === 'carlos' ? 'Multi-Store Manager' :
                   userMode === 'customer' ? 'Customer Portal' :
                   'Guest'}
                </span>
                {isHandoffMode && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-purple-300 border border-purple-500/50 animate-pulse">
                    🤝 Modo Cliente
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Tabs - Scrollable middle section */}
            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#0f172a' }}>
              <div className="space-y-3">
                {/* Catalog Tab - Always visible */}
                <button
                  onClick={() => handleTabClick('catalog')}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    activeTab === 'catalog'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">Catalogo</span>
                </button>

                {/* Favorites Tab - Always visible */}
                <button
                  onClick={() => handleTabClick('favorites')}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">Favoritos</span>
                  {favoritesCount !== undefined && favoritesCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === 'favorites' ? 'bg-slate-900/20 text-slate-900' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Categories Tab - Always visible */}
                <button
                  onClick={() => handleTabClick('categories')}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    activeTab === 'categories'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">Categorias</span>
                </button>

                {/* Credits Tab - SALES REP ONLY, NOT in handoff mode */}
                {userMode === 'rep' && !isHandoffMode && (
                  <button
                    onClick={() => handleTabClick('credits')}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                      activeTab === 'credits'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">Creditos / Devoluciones</span>
                  </button>
                )}

                {/* Bundles Tab - CARLOS ONLY */}
                {userMode === 'carlos' && (
                  <button
                    onClick={() => handleTabClick('bundles')}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                      activeTab === 'bundles'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">Pedidos en Lote</span>
                  </button>
                )}

                {/* Orders Tab - ALL LOGGED IN USERS, hidden in handoff mode */}
                {(userMode === 'rep' || userMode === 'customer' || userMode === 'carlos') && !isHandoffMode && (
                  <button
                    onClick={() => handleTabClick('orders')}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">
                      {userMode === 'carlos' ? 'Pedidos de Tiendas' :
                       userMode === 'customer' ? 'Mis Pedidos' : 'Historial de Pedidos'}
                    </span>
                  </button>
                )}

                {/* Search Product - Only visible in handoff mode */}
                {isHandoffMode && (
                  <button
                    onClick={() => handleTabClick('catalog')}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Search className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">Buscar Producto</span>
                  </button>
                )}

                {/* Barcode Scan - Only visible in handoff mode */}
                {isHandoffMode && (
                  <button
                    onClick={() => handleTabClick('catalog')}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <ScanBarcode className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">Escanear Código</span>
                  </button>
                )}

                {/* Return to Sales Rep - Only visible in handoff mode */}
                {isHandoffMode && onBackToDashboard && (
                  <>
                    <div className="my-4 border-t border-slate-700/50" />
                    <button
                      onClick={() => setShowPinModal(true)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 hover:text-amber-200 border border-amber-500/30"
                    >
                      <Lock className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">Regresar a Vendedor (PIN)</span>
                    </button>
                  </>
                )}

                {/* Divider and Actions - Sales Rep only, NOT in handoff mode */}
                {userMode === 'rep' && !isHandoffMode && (
                  <>
                    <div className="my-4 border-t border-slate-700/50" />

                    {/* Return to Dashboard */}
                    {onBackToDashboard && (
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          onBackToDashboard()
                        }}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50 mb-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium flex-1 text-left">Regresar al Dashboard</span>
                      </button>
                    )}

                    {/* Handoff Mode - Give tablet to customer */}
                    {onEnterHandoff && (
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          onEnterHandoff()
                        }}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 border border-purple-500/30"
                      >
                        <UserCheck className="w-5 h-5" />
                        <span className="font-medium flex-1 text-left">Entregar Tablet a Cliente</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="p-4 border-t border-slate-700/50 flex-shrink-0" style={{ backgroundColor: '#0f172a' }}>
              {/* Back to Multi-Store Dashboard - For delegated orders */}
              {isDelegatedOrder && parentCustomerId && (
                <a
                  href="/customer/multi-store"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors mb-3"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Volver a Dashboard</span>
                </a>
              )}

              {/* Back to Dashboard - PIN protected in handoff mode only */}
              {userMode === 'rep' && isHandoffMode && onBackToDashboard && (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors mb-3"
                >
                  <Lock className="w-5 h-5" />
                  <span>Regresar (PIN)</span>
                </button>
              )}

              {/* Quick info */}
              <p className="text-center text-slate-500 text-xs">
                {isDelegatedOrder ? `Cart will be saved for ${storeName}` :
                 isHandoffMode ? 'Modo cliente activo' : 'Tap outside to close'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // PIN Modal content
  const pinModalContent = (
    <AnimatePresence>
      {showPinModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          onClick={() => {
            setShowPinModal(false)
            setPin('')
            setPinError(false)
          }}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm mx-4 bg-slate-900 rounded-2xl p-6 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Ingrese PIN</h3>
              <p className="text-slate-400 text-sm mt-1">Para regresar al panel de vendedor</p>
            </div>

            {/* PIN Input */}
            <div className="mb-6">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setPin(value)
                  setPinError(false)
                }}
                placeholder="••••"
                className={`w-full text-center text-3xl tracking-[1em] py-4 bg-slate-800 border-2 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-colors ${
                  pinError ? 'border-red-500 shake-animation' : 'border-slate-700 focus:border-amber-500'
                }`}
                autoFocus
              />
              {pinError && (
                <p className="text-red-400 text-sm text-center mt-2">PIN incorrecto</p>
              )}
            </div>

            {/* PIN Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (key === null) return
                    if (key === 'del') {
                      setPin(prev => prev.slice(0, -1))
                    } else if (pin.length < 4) {
                      setPin(prev => prev + key)
                    }
                    setPinError(false)
                  }}
                  disabled={key === null}
                  className={`py-4 rounded-xl text-xl font-bold transition-colors ${
                    key === null
                      ? 'invisible'
                      : key === 'del'
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {key === 'del' ? '⌫' : key}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false)
                  setPin('')
                  setPinError(false)
                }}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onExitHandoff && onExitHandoff(pin)) {
                    setShowPinModal(false)
                    setIsOpen(false)
                    setPin('')
                    setPinError(false)
                  } else {
                    setPinError(true)
                    setPin('')
                  }
                }}
                disabled={pin.length !== 4}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold hover:from-amber-400 hover:to-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Portal the drawer to document.body to escape any parent transforms/positioning */}
      {mounted && createPortal(drawerContent, document.body)}

      {/* Portal the PIN modal to document.body */}
      {mounted && createPortal(pinModalContent, document.body)}
    </>
  )
}
