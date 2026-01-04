'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  Search,
  Calendar,
  Building2,
  DollarSign,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  code: string
}

interface Product {
  id: string
  name: string
  sku: string
  brand: string
  price: number
  cost: number | null
  imageUrl: string | null
}

interface POItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitCost: number
}

export default function NewPOPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<POItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Product search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/po')
      if (res.ok) {
        const data = await res.json()
        setVendors(data.vendors || [])
      }
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/ana/products/search?q=${encodeURIComponent(query)}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.products || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchProducts])

  const addItem = (product: Product) => {
    // Check if already added
    if (items.find(i => i.productId === product.id)) {
      return
    }
    setItems([...items, {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitCost: product.cost || product.price * 0.6 // Default to 60% of price if no cost
    }])
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
  }

  const updateItem = (index: number, field: 'quantity' | 'unitCost', value: number) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  }

  const handleSubmit = async () => {
    if (!selectedVendor) {
      setError('Selecciona un proveedor')
      return
    }
    if (items.length === 0) {
      setError('Agrega al menos un producto')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/ana/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendor,
          expectedDate: expectedDate || null,
          notes: notes || null,
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost
          }))
        })
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/ana/po/${data.po.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al crear la orden')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/ana/po"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Nueva Orden de Compra</h1>
          <p className="text-gray-500">Crea una orden para tus proveedores</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Vendor & Date */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-500" />
            Información de la Orden
          </h3>
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor *
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              >
                <option value="">Seleccionar proveedor...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Esperada
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales para esta orden..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Productos ({items.length})
            </h3>
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </button>
          </div>

          {/* Product Search Modal */}
          {showSearch && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 p-4" onClick={() => setShowSearch(false)}>
              <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar producto por nombre o SKU..."
                      autoFocus
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {searchQuery.length >= 2 ? 'No se encontraron productos' : 'Escribe para buscar'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map(product => {
                        const isAdded = items.some(i => i.productId === product.id)
                        return (
                          <button
                            key={product.id}
                            onClick={() => !isAdded && addItem(product)}
                            disabled={isAdded}
                            className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${
                              isAdded ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.brand} - SKU: {product.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-600">{formatCurrency(product.cost || product.price * 0.6)}</p>
                              {isAdded && <span className="text-xs text-green-600">Agregado</span>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowSearch(false)}
                    className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No hay productos agregados</p>
              <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Costo Unit.</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right"
                      />
                    </div>
                    <div className="text-right w-24">
                      <label className="text-xs text-gray-500 block mb-1">Total</label>
                      <p className="font-bold text-emerald-600 py-2">{formatCurrency(item.quantity * item.unitCost)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {items.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total de la Orden</p>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(getTotal())}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/ana/po"
            className="flex-1 py-4 text-center border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving || items.length === 0 || !selectedVendor}
            className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Crear Orden
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
