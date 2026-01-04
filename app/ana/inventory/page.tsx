'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Search,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  TrendingDown,
  ShoppingCart,
  Lightbulb,
  HelpCircle,
  X,
  Filter,
  ArrowLeft,
  DollarSign,
  Edit3,
  Save,
  Box,
  Layers,
  Percent,
  TrendingUp
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  productCount: number
  lowStockCount: number
}

interface Vendor {
  id: string
  name: string
  code: string | null
  productCount: number
  lowStockCount: number
}

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  imageUrl: string | null
  price: number
  cost: number | null
  margin: string | null
  priceTierA: number | null
  priceTierB: number | null
  priceTierC: number | null
  categoryId: string | null
  vendorId: string | null
  categoryName?: string
  vendorName?: string
  unitType: string
  unitsPerCase: number
  grossProfit: number | null
  profitPerUnit: number | null
}

interface InventorySummary {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
}

export default function InventoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [summary, setSummary] = useState<InventorySummary>({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'categories' | 'vendors' | 'products'>('categories')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  // Edit modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editTierA, setEditTierA] = useState('')
  const [editTierB, setEditTierB] = useState('')
  const [editTierC, setEditTierC] = useState('')
  const [editUnitType, setEditUnitType] = useState('case')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/inventory')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
        setVendors(data.vendors || [])
        setProducts(data.products || [])
        setSummary(data.summary || summary)
      }
    } catch (error) {
      console.error('Error al cargar inventario:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—'
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Open edit modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setEditPrice(product.price.toString())
    setEditCost(product.cost?.toString() || '')
    setEditTierA(product.priceTierA?.toString() || '')
    setEditTierB(product.priceTierB?.toString() || '')
    setEditTierC(product.priceTierC?.toString() || '')
    setEditUnitType(product.unitType || 'case')
  }

  // Save product changes
  const saveProduct = async () => {
    if (!editingProduct) return
    setSaving(true)
    try {
      const res = await fetch(`/api/ana/inventory/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(editPrice) || editingProduct.price,
          cost: editCost ? parseFloat(editCost) : null,
          priceTierA: editTierA ? parseFloat(editTierA) : null,
          priceTierB: editTierB ? parseFloat(editTierB) : null,
          priceTierC: editTierC ? parseFloat(editTierC) : null
        })
      })
      if (res.ok) {
        setEditingProduct(null)
        fetchInventoryData()
      } else {
        alert('Error al guardar')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Toggle unit type
  const toggleUnitType = async (productId: string, currentType: string) => {
    const newType = currentType === 'case' ? 'unit' : 'case'
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitType: newType })
      })
      if (res.ok) {
        fetchInventoryData()
      }
    } catch (error) {
      console.error('Error toggling unit type:', error)
    }
  }

  // Filter products based on selection
  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false
    if (selectedVendor && p.vendorId !== selectedVendor) return false
    if (showLowStockOnly && p.stock >= p.minStock) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    }
    return true
  })

  const getSelectedName = () => {
    if (selectedCategory) {
      return categories.find(c => c.id === selectedCategory)?.name || ''
    }
    if (selectedVendor) {
      return vendors.find(v => v.id === selectedVendor)?.name || ''
    }
    return ''
  }

  // Category color map (for visual variety)
  const categoryColors: Record<string, string> = {
    'chips': 'from-amber-400 to-orange-500',
    'candy': 'from-pink-400 to-rose-500',
    'beverages': 'from-blue-400 to-cyan-500',
    'bakery': 'from-amber-300 to-yellow-500',
    'dairy': 'from-sky-300 to-blue-400',
    'grocery': 'from-emerald-400 to-teal-500',
    'seasonal': 'from-purple-400 to-violet-500',
    'default': 'from-gray-400 to-slate-500'
  }

  const getCategoryColor = (slug: string) => {
    return categoryColors[slug.toLowerCase()] || categoryColors['default']
  }

  // Vendor colors
  const vendorColors: Record<string, string> = {
    'sabritas': 'from-red-500 to-orange-500',
    'bimbo': 'from-blue-500 to-indigo-500',
    'barcel': 'from-yellow-500 to-amber-500',
    'default': 'from-purple-400 to-pink-500'
  }

  const getVendorColor = (name: string) => {
    const key = name.toLowerCase()
    for (const [vendor, color] of Object.entries(vendorColors)) {
      if (key.includes(vendor)) return color
    }
    return vendorColors['default']
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-rose-600 mb-4">¿Cómo Usar Inventario?</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1</span>
                </div>
                <p>Toca una categoría o proveedor para ver sus productos</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2</span>
                </div>
                <p>Los productos en rojo o naranja están bajos de stock</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3</span>
                </div>
                <p>Usa el lápiz para editar precios y márgenes</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">4</span>
                </div>
                <p>Toca el icono de caja para cambiar si se vende por caja o pieza</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingProduct(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Editar Precios</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
              {editingProduct.imageUrl ? (
                <img src={editingProduct.imageUrl} alt={editingProduct.name} className="w-12 h-12 object-contain rounded-lg" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-bold text-gray-800">{editingProduct.name}</p>
                <p className="text-sm text-gray-500 font-mono">{editingProduct.sku}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Unit Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Venta</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditUnitType('case')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      editUnitType === 'case'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Box className="w-5 h-5" />
                    Por Caja
                  </button>
                  <button
                    onClick={() => setEditUnitType('unit')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      editUnitType === 'unit'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    Por Pieza
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Compra</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta (Base)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Margin */}
              {editCost && editPrice && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700 font-medium">Margen Calculado</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {(((parseFloat(editPrice) - parseFloat(editCost)) / parseFloat(editPrice)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-emerald-700 font-medium">Ganancia por Unidad</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(parseFloat(editPrice) - parseFloat(editCost))}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Precios por Nivel de Cliente
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-600 mb-1">Tier A (Premium)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editTierA}
                        onChange={(e) => setEditTierA(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-600 mb-1">Tier B (Estándar)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editTierB}
                        onChange={(e) => setEditTierB(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tier C (Básico)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editTierC}
                        onChange={(e) => setEditTierC(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveProduct}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500">Ve tus productos, precios y márgenes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPricing(!showPricing)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              showPricing
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            {showPricing ? 'Ocultar Precios' : 'Ver Precios'}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors font-medium"
          >
            <HelpCircle className="w-5 h-5" />
            Ayuda
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
            <Package className="w-4 h-4" />
            Total Productos
          </div>
          <p className="text-3xl font-bold text-gray-800">{summary.totalProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 text-sm font-medium mb-2">
            <TrendingDown className="w-4 h-4" />
            Stock Bajo
          </div>
          <p className="text-3xl font-bold text-orange-600">{summary.lowStockCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-100">
          <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-2">
            <AlertTriangle className="w-4 h-4" />
            Sin Stock
          </div>
          <p className="text-3xl font-bold text-red-600">{summary.outOfStockCount}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            Valor Total
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalValue)}</p>
        </div>
      </div>

      {/* AI Suggestion Banner */}
      {summary.lowStockCount > 0 && (
        <div className="mb-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Sugerencia de Orden</h3>
              <p className="text-white/80">
                Tienes {summary.lowStockCount} productos con stock bajo. Te recomendamos hacer una orden pronto.
              </p>
            </div>
            <button
              onClick={() => setShowLowStockOnly(true)}
              className="px-5 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
            >
              Ver Productos
            </button>
          </div>
        </div>
      )}

      {/* View Tabs */}
      {!selectedCategory && !selectedVendor && (
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
          <button
            onClick={() => setView('categories')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              view === 'categories'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Por Categoría
          </button>
          <button
            onClick={() => setView('vendors')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              view === 'vendors'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Por Proveedor
          </button>
        </div>
      )}

      {/* Category View */}
      {view === 'categories' && !selectedCategory && !selectedVendor && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay categorías</p>
            </div>
          ) : (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.slug)} opacity-90`} />
                <div className="relative text-white">
                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.productCount} productos</p>
                  {category.lowStockCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 w-fit">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.lowStockCount} bajo stock</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))
          )}
        </div>
      )}

      {/* Vendor View */}
      {view === 'vendors' && !selectedCategory && !selectedVendor && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />
            ))
          ) : vendors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay proveedores</p>
            </div>
          ) : (
            vendors.map(vendor => (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor.id)}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getVendorColor(vendor.name)} opacity-90`} />
                <div className="relative text-white">
                  <h3 className="text-xl font-bold mb-1">{vendor.name}</h3>
                  {vendor.code && <p className="text-white/60 text-xs font-mono mb-1">{vendor.code}</p>}
                  <p className="text-white/80 text-sm">{vendor.productCount} productos</p>
                  {vendor.lowStockCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 w-fit">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{vendor.lowStockCount} bajo stock</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))
          )}
        </div>
      )}

      {/* Products View (when category or vendor selected) */}
      {(selectedCategory || selectedVendor) && (
        <div>
          {/* Back button and filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedVendor(null)
                setShowLowStockOnly(false)
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a {selectedCategory ? 'Categorías' : 'Proveedores'}
            </button>
            <div className="flex gap-3">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  showLowStockOnly
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                Solo Bajo Stock
              </button>
            </div>
          </div>

          {/* Category/Vendor Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 mb-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{getSelectedName()}</h2>
              <p className="text-white/80">{filteredProducts.length} productos</p>
            </div>
            <Link
              href={`/ana/po/new?${selectedVendor ? `vendor=${selectedVendor}` : `category=${selectedCategory}`}`}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Hacer Orden
            </Link>
          </div>

          {/* Products Grid/Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron productos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 font-semibold">Producto</th>
                      <th className="px-4 py-3 font-semibold text-center">Tipo</th>
                      <th className="px-4 py-3 font-semibold text-right">Stock</th>
                      {showPricing && (
                        <>
                          <th className="px-4 py-3 font-semibold text-right">Costo</th>
                          <th className="px-4 py-3 font-semibold text-right">Precio</th>
                          <th className="px-4 py-3 font-semibold text-right">Margen</th>
                          <th className="px-4 py-3 font-semibold text-right text-amber-600">Tier A</th>
                          <th className="px-4 py-3 font-semibold text-right text-blue-600">Tier B</th>
                          <th className="px-4 py-3 font-semibold text-right text-gray-600">Tier C</th>
                        </>
                      )}
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const isLowStock = product.stock < product.minStock
                      const isOutOfStock = product.stock === 0
                      return (
                        <tr
                          key={product.id}
                          className={`border-b border-gray-50 hover:bg-gray-50/50 ${
                            isOutOfStock ? 'bg-red-50/30' :
                            isLowStock ? 'bg-orange-50/30' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleUnitType(product.id, product.unitType)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                product.unitType === 'case'
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                              title="Clic para cambiar"
                            >
                              {product.unitType === 'case' ? (
                                <>
                                  <Box className="w-3 h-3" />
                                  Caja
                                </>
                              ) : (
                                <>
                                  <Layers className="w-3 h-3" />
                                  Pieza
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className={`text-lg font-bold ${
                              isOutOfStock ? 'text-red-600' :
                              isLowStock ? 'text-orange-600' :
                              'text-gray-800'
                            }`}>
                              {product.stock}
                            </div>
                            <p className="text-xs text-gray-400">min: {product.minStock}</p>
                          </td>
                          {showPricing && (
                            <>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {formatCurrency(product.cost)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-800">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {product.margin ? (
                                  <span className={`font-medium ${
                                    parseFloat(product.margin) >= 20 ? 'text-emerald-600' :
                                    parseFloat(product.margin) >= 10 ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>
                                    {product.margin}%
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 text-right text-amber-600 font-medium">
                                {formatCurrency(product.priceTierA)}
                              </td>
                              <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                {formatCurrency(product.priceTierB)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {formatCurrency(product.priceTierC)}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Editar precios"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
