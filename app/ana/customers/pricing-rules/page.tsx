'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  DollarSign,
  Percent,
  Users,
  Package,
  Tag,
  Building2,
  Check,
  X,
  AlertCircle,
  Crown,
  Filter
} from 'lucide-react'

interface PricingRule {
  id: string
  customerId: string | null
  customerName: string
  productId: string | null
  productName: string | null
  productBrand: string | null
  basePrice: number | null
  categoryId: string | null
  categoryName: string | null
  brandId: string | null
  brandName: string | null
  overridePrice: number
  discountPercent: number | null
  startDate: string | null
  endDate: string | null
  active: boolean
  notes: string | null
  createdAt: string
}

interface Customer {
  id: string
  businessName: string
  priceTier: string
}

interface Brand {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  brand: string
  price: number
  imageUrl: string | null
  category: string | null
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchProducts, setSearchProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  // Form state
  const [ruleType, setRuleType] = useState<'product' | 'brand' | 'category'>('product')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceType, setPriceType] = useState<'fixed' | 'discount'>('fixed')
  const [overridePrice, setOverridePrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/pricing-rules')
      if (res.ok) {
        const data = await res.json()
        setRules(data.rules || [])
        setCustomers(data.customers || [])
        setBrands(data.brands || [])
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchProductsDebounced = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchProducts([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/ana/products/search?q=${encodeURIComponent(query)}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setSearchProducts(data.products || [])
      }
    } catch (error) {
      console.error('Product search error:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProductsDebounced(productSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch, searchProductsDebounced])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload: any = {
        customerId: selectedCustomer || null,
        notes: notes || null
      }

      if (ruleType === 'product' && selectedProduct) {
        payload.productId = selectedProduct.id
      } else if (ruleType === 'brand' && selectedBrand) {
        payload.brandId = selectedBrand
      } else if (ruleType === 'category' && selectedCategory) {
        payload.categoryId = selectedCategory
      }

      if (priceType === 'fixed') {
        payload.overridePrice = parseFloat(overridePrice)
      } else {
        payload.discountPercent = parseFloat(discountPercent)
        // Calculate override price based on discount
        if (selectedProduct) {
          payload.overridePrice = selectedProduct.price * (1 - parseFloat(discountPercent) / 100)
        }
      }

      const res = await fetch('/api/ana/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        await fetchRules()
        resetForm()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta regla de precio?')) return

    try {
      const res = await fetch(`/api/ana/pricing-rules?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRules(rules.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const resetForm = () => {
    setRuleType('product')
    setSelectedCustomer('')
    setSelectedProduct(null)
    setSelectedBrand('')
    setSelectedCategory('')
    setPriceType('fixed')
    setOverridePrice('')
    setDiscountPercent('')
    setNotes('')
    setProductSearch('')
    setSearchProducts([])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getRuleTypeIcon = (rule: PricingRule) => {
    if (rule.productId) return <Package className="w-5 h-5 text-blue-500" />
    if (rule.brandId) return <Tag className="w-5 h-5 text-purple-500" />
    if (rule.categoryId) return <Building2 className="w-5 h-5 text-amber-500" />
    return <DollarSign className="w-5 h-5 text-gray-500" />
  }

  const getRuleDescription = (rule: PricingRule) => {
    if (rule.productName) return rule.productName
    if (rule.brandName) return `Marca: ${rule.brandName}`
    if (rule.categoryName) return `Categoría: ${rule.categoryName}`
    return 'Regla general'
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/ana/customers"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Reglas de Precio</h1>
            <p className="text-gray-500">Precios especiales por cliente, marca o categoría</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Regla
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 mb-6">
        <div className="flex items-start gap-3">
          <Crown className="w-6 h-6 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 mb-1">¿Cómo funcionan las reglas?</h3>
            <p className="text-sm text-amber-700">
              Las reglas se aplican en orden de prioridad: <strong>Producto específico</strong> &gt; <strong>Marca</strong> &gt; <strong>Categoría</strong>.
              Si Carlos tiene una regla para Sabritas a $2.75, ese precio se usará en lugar del precio base.
            </p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Cargando reglas...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay reglas de precio</p>
            <p className="text-gray-400 text-sm mt-1">Crea una regla para dar precios especiales a clientes</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-rose-100 text-rose-600 rounded-lg font-medium hover:bg-rose-200 transition-colors"
            >
              Crear primera regla
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    {getRuleTypeIcon(rule)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{getRuleDescription(rule)}</h3>
                      {rule.productBrand && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {rule.productBrand}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {rule.customerName}
                      </span>
                      {rule.basePrice && (
                        <span className="text-gray-400">
                          Base: {formatCurrency(rule.basePrice)}
                        </span>
                      )}
                      {rule.notes && (
                        <span className="text-gray-400 italic">"{rule.notes}"</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(rule.overridePrice)}</p>
                    {rule.discountPercent && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                        <Percent className="w-3 h-3" />
                        {rule.discountPercent}% descuento
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nueva Regla de Precio</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Rule Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de regla</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setRuleType('product')}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    ruleType === 'product'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Producto
                </button>
                <button
                  onClick={() => setRuleType('brand')}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    ruleType === 'brand'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  Marca
                </button>
                <button
                  onClick={() => setRuleType('category')}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    ruleType === 'category'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Categoría
                </button>
              </div>
            </div>

            {/* Customer Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              >
                <option value="">Todos los clientes</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.businessName} (Tier {c.priceTier})</option>
                ))}
              </select>
            </div>

            {/* Product/Brand/Category Selector */}
            {ruleType === 'product' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                {selectedProduct ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                        <p className="text-sm text-gray-500">{selectedProduct.brand} - {formatCurrency(selectedProduct.price)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedProduct(null); setProductSearch('') }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar producto..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                    />
                    {searchProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                        {searchProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedProduct(p)
                              setProductSearch('')
                              setSearchProducts([])
                              if (priceType === 'fixed' && !overridePrice) {
                                setOverridePrice(p.price.toString())
                              }
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{p.name}</p>
                              <p className="text-sm text-gray-500">{p.brand} - {formatCurrency(p.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchLoading && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl p-4 text-center text-gray-500">
                        Buscando...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {ruleType === 'brand' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                >
                  <option value="">Seleccionar marca...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {ruleType === 'category' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de precio</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPriceType('fixed')}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    priceType === 'fixed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Precio Fijo
                </button>
                <button
                  onClick={() => setPriceType('discount')}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    priceType === 'discount'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  Descuento %
                </button>
              </div>
            </div>

            {/* Price Input */}
            {priceType === 'fixed' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio especial</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 text-lg font-medium"
                  />
                </div>
                {selectedProduct && overridePrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    {parseFloat(overridePrice) < selectedProduct.price ? (
                      <span className="text-emerald-600">
                        Ahorro: {formatCurrency(selectedProduct.price - parseFloat(overridePrice))} ({((1 - parseFloat(overridePrice) / selectedProduct.price) * 100).toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        Incremento: {formatCurrency(parseFloat(overridePrice) - selectedProduct.price)}
                      </span>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de descuento</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300 text-lg font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                </div>
                {selectedProduct && discountPercent && (
                  <p className="text-sm text-emerald-600 mt-1">
                    Precio final: {formatCurrency(selectedProduct.price * (1 - parseFloat(discountPercent) / 100))}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Precio especial para Carlos"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-300"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || (ruleType === 'product' && !selectedProduct) || (priceType === 'fixed' && !overridePrice) || (priceType === 'discount' && !discountPercent)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Crear Regla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
