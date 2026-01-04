'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Search, Link2, Trash2, Image, Tag, AlertTriangle,
  Check, X, ChevronDown, ChevronUp, Sparkles, Loader2, Plus,
  Package, Store, Merge, Filter, LayoutGrid, List, RefreshCw
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string | null
  price: number
  imageUrl: string | null
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  inStock: boolean
  createdAt: string
  _count?: { OrderItem: number }
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface DuplicateMatch {
  newProduct: Product
  matches: Array<{
    product: Product
    score: number
    reason: string
  }>
}

type TabType = 'duplicates' | 'uncategorized' | 'all'

// Fuzzy matching function
function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.85

  // Calculate word overlap
  const words1 = str1.toLowerCase().split(/\s+/)
  const words2 = str2.toLowerCase().split(/\s+/)

  let matchedWords = 0
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1.length >= 3 && w2.length >= 3) {
        if (w1 === w2) matchedWords += 2
        else if (w1.includes(w2) || w2.includes(w1)) matchedWords += 1
      }
    }
  }

  const maxWords = Math.max(words1.length, words2.length)
  return matchedWords / (maxWords * 2)
}

export default function SyncProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('duplicates')
  const [saving, setSaving] = useState<string | null>(null)
  const [merging, setMerging] = useState<string | null>(null)

  // Quick create modal
  const [showQuickCreate, setShowQuickCreate] = useState<{
    type: 'category' | 'brand'
    productId?: string
    productName?: string
  } | null>(null)
  const [quickCreateName, setQuickCreateName] = useState('')
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkBrand, setBulkBrand] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)

  // Expanded product details
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const brandsData = await brandsRes.json()

      setProducts(productsData.data || productsData || [])
      setCategories(categoriesData.data || categoriesData || [])
      setBrands(brandsData.data || brandsData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Identify "new" products (no image OR no category - likely from invoice seeder)
  const newProducts = useMemo(() => {
    return products.filter(p => !p.imageUrl || !p.category)
  }, [products])

  // Complete/enriched products (have both image and category)
  const enrichedProducts = useMemo(() => {
    return products.filter(p => p.imageUrl && p.category)
  }, [products])

  // Find potential duplicates for new products
  const duplicateMatches = useMemo((): DuplicateMatch[] => {
    const matches: DuplicateMatch[] = []

    for (const newProduct of newProducts) {
      const productMatches: DuplicateMatch['matches'] = []

      for (const existingProduct of enrichedProducts) {
        // Skip if same product
        if (newProduct.id === existingProduct.id) continue

        // Check SKU match first
        if (newProduct.sku && existingProduct.sku) {
          const skuMatch = newProduct.sku.toLowerCase() === existingProduct.sku.toLowerCase()
          if (skuMatch) {
            productMatches.push({
              product: existingProduct,
              score: 1.0,
              reason: 'SKU match'
            })
            continue
          }
        }

        // Fuzzy name match
        const nameScore = fuzzyMatch(newProduct.name, existingProduct.name)
        if (nameScore >= 0.5) {
          productMatches.push({
            product: existingProduct,
            score: nameScore,
            reason: nameScore >= 0.85 ? 'Very similar name' : 'Similar name'
          })
        }
      }

      // Sort by score and keep top 3
      productMatches.sort((a, b) => b.score - a.score)

      if (productMatches.length > 0) {
        matches.push({
          newProduct,
          matches: productMatches.slice(0, 3)
        })
      }
    }

    // Sort by best match score
    matches.sort((a, b) => (b.matches[0]?.score || 0) - (a.matches[0]?.score || 0))

    return matches
  }, [newProducts, enrichedProducts])

  // Products without category
  const uncategorizedProducts = useMemo(() => {
    return products.filter(p => !p.category)
  }, [products])

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    let filtered: Product[] = []

    switch (activeTab) {
      case 'duplicates':
        // Show new products that have potential duplicates
        filtered = duplicateMatches.map(d => d.newProduct)
        break
      case 'uncategorized':
        filtered = uncategorizedProducts
        break
      case 'all':
        filtered = newProducts
        break
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [activeTab, duplicateMatches, uncategorizedProducts, newProducts, searchQuery])

  // Merge products
  const mergeProducts = async (sourceId: string, targetId: string, keepDescription: boolean = false) => {
    setMerging(sourceId)
    try {
      const res = await fetch('/api/admin/sync-products/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, targetId, keepDescription }),
      })

      if (res.ok) {
        // Remove from products list
        setProducts(prev => prev.filter(p => p.id !== sourceId))
        setExpandedProduct(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to merge')
      }
    } catch (error) {
      console.error('Merge failed:', error)
      alert('Failed to merge products')
    } finally {
      setMerging(null)
    }
  }

  // Update single product
  const updateProduct = async (productId: string, updates: { categoryId?: string; brandId?: string }) => {
    setSaving(productId)
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const formData = new FormData()
      formData.append('id', productId)
      formData.append('name', product.name)
      formData.append('sku', product.sku || '')
      formData.append('price', String(product.price))
      formData.append('unitsPerCase', '1')
      if (updates.categoryId) formData.append('categoryId', updates.categoryId)
      if (updates.brandId) formData.append('brandId', updates.brandId)

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        body: formData,
      })

      if (res.ok) {
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              category: updates.categoryId ? categories.find(c => c.id === updates.categoryId) || null : p.category,
              brand: updates.brandId ? brands.find(b => b.id === updates.brandId) || null : p.brand,
            }
          }
          return p
        }))
      }
    } catch (error) {
      console.error('Failed to update product:', error)
    } finally {
      setSaving(null)
    }
  }

  // Bulk update selected products
  const bulkUpdateProducts = async () => {
    if (selectedProducts.size === 0) return
    if (!bulkCategory && !bulkBrand) {
      alert('Select a category or brand to apply')
      return
    }

    setBulkSaving(true)
    try {
      const updates: { categoryId?: string; brandId?: string } = {}
      if (bulkCategory) updates.categoryId = bulkCategory
      if (bulkBrand) updates.brandId = bulkBrand

      // Update each selected product
      for (const productId of selectedProducts) {
        await updateProduct(productId, updates)
      }

      setSelectedProducts(new Set())
      setBulkCategory('')
      setBulkBrand('')
    } catch (error) {
      console.error('Bulk update failed:', error)
    } finally {
      setBulkSaving(false)
    }
  }

  // Quick create category or brand
  const handleQuickCreate = async () => {
    if (!showQuickCreate || !quickCreateName.trim()) return

    setQuickCreateLoading(true)
    try {
      const res = await fetch('/api/admin/sync-products/quick-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: showQuickCreate.type,
          name: quickCreateName.trim(),
          productId: showQuickCreate.productId,
          applyToProduct: !!showQuickCreate.productId,
        }),
      })

      if (res.ok) {
        const data = await res.json()

        if (showQuickCreate.type === 'category') {
          setCategories(prev => {
            if (prev.find(c => c.id === data.created.id)) return prev
            return [...prev, data.created].sort((a, b) => a.name.localeCompare(b.name))
          })
          if (showQuickCreate.productId) {
            setProducts(prev => prev.map(p =>
              p.id === showQuickCreate.productId
                ? { ...p, category: data.created }
                : p
            ))
          }
        } else {
          setBrands(prev => {
            if (prev.find(b => b.id === data.created.id)) return prev
            return [...prev, data.created].sort((a, b) => a.name.localeCompare(b.name))
          })
          if (showQuickCreate.productId) {
            setProducts(prev => prev.map(p =>
              p.id === showQuickCreate.productId
                ? { ...p, brand: data.created }
                : p
            ))
          }
        }

        setShowQuickCreate(null)
        setQuickCreateName('')
      }
    } catch (error) {
      console.error('Quick create failed:', error)
    } finally {
      setQuickCreateLoading(false)
    }
  }

  // Delete product
  const deleteProduct = async (productId: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return

    setSaving(productId)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      })

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setSaving(null)
    }
  }

  // Toggle product selection
  const toggleSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  // Select all visible products
  const selectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    if (score >= 0.65) return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading products...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Product Sync Tool</h1>
                <p className="text-sm text-slate-400">
                  {newProducts.length} new products • {duplicateMatches.length} potential duplicates
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'duplicates'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Merge className="w-4 h-4" />
              Duplicates
              {duplicateMatches.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {duplicateMatches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('uncategorized')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'uncategorized'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Tag className="w-4 h-4" />
              Uncategorized
              {uncategorizedProducts.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {uncategorizedProducts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              All New
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {newProducts.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Bulk Actions Bar */}
          {(activeTab === 'uncategorized' || activeTab === 'all') && filteredProducts.length > 0 && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                >
                  {selectedProducts.size === filteredProducts.length ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {selectedProducts.size === filteredProducts.length ? 'Deselect All' : 'Select All'}
                </button>

                {selectedProducts.size > 0 && (
                  <>
                    <span className="text-sm text-slate-400">
                      {selectedProducts.size} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                      >
                        <option value="">Category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <select
                        value={bulkBrand}
                        onChange={(e) => setBulkBrand(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                      >
                        <option value="">Brand...</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={bulkUpdateProducts}
                        disabled={bulkSaving || (!bulkCategory && !bulkBrand)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 rounded-lg text-sm font-medium"
                      >
                        {bulkSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Apply to Selected
                      </button>
                    </div>

                    {/* Quick create buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => {
                          setShowQuickCreate({ type: 'category' })
                          setQuickCreateName('')
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        New Category
                      </button>
                      <button
                        onClick={() => {
                          setShowQuickCreate({ type: 'brand' })
                          setQuickCreateName('')
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        New Brand
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Check className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {activeTab === 'duplicates' ? 'No duplicates found!' : 'All products categorized!'}
            </h2>
            <p className="text-slate-400">
              {activeTab === 'duplicates'
                ? 'All new products appear to be unique.'
                : 'No products need attention in this view.'}
            </p>
          </div>
        ) : activeTab === 'duplicates' ? (
          // Duplicates View - Shows potential matches
          <div className="space-y-4">
            {duplicateMatches
              .filter(d =>
                !searchQuery ||
                d.newProduct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (d.newProduct.sku && d.newProduct.sku.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((match) => (
                <div
                  key={match.newProduct.id}
                  className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
                >
                  {/* New Product Header */}
                  <div className="p-4 bg-amber-500/10 border-b border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400 font-medium uppercase">New Product</span>
                        </div>
                        <h3 className="font-bold text-lg truncate">{match.newProduct.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          {match.newProduct.sku && <span>SKU: {match.newProduct.sku}</span>}
                          <span className="text-emerald-400">${Number(match.newProduct.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProduct(match.newProduct.id)}
                        disabled={saving === match.newProduct.id}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                        title="Delete new product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Potential Matches */}
                  <div className="p-4">
                    <p className="text-sm text-slate-400 mb-3">
                      Potential matches in database:
                    </p>
                    <div className="space-y-2">
                      {match.matches.map((m, idx) => (
                        <div
                          key={m.product.id}
                          className={`p-3 rounded-xl border ${getScoreColor(m.score)} flex items-center gap-3`}
                        >
                          {/* Product Image */}
                          <div className="w-12 h-12 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                            {m.product.imageUrl ? (
                              <img
                                src={m.product.imageUrl}
                                alt={m.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image className="w-5 h-5 text-slate-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{m.product.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              {m.product.sku && <span>SKU: {m.product.sku}</span>}
                              <span className="text-emerald-400">${Number(m.product.price).toFixed(2)}</span>
                              {m.product.category && (
                                <span className="text-purple-400">{m.product.category.name}</span>
                              )}
                            </div>
                            <span className="text-xs opacity-75">
                              {Math.round(m.score * 100)}% • {m.reason}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => mergeProducts(match.newProduct.id, m.product.id, false)}
                              disabled={merging === match.newProduct.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              {merging === match.newProduct.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Merge className="w-3 h-3" />
                              )}
                              Merge
                            </button>
                            <button
                              onClick={() => mergeProducts(match.newProduct.id, m.product.id, true)}
                              disabled={merging === match.newProduct.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
                              title="Keep the description from the new product"
                            >
                              {merging === match.newProduct.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Merge className="w-3 h-3" />
                              )}
                              + Keep Desc
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Keep as new option */}
                    <button
                      onClick={() => setExpandedProduct(expandedProduct === match.newProduct.id ? null : match.newProduct.id)}
                      className="w-full mt-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-sm text-slate-400 flex items-center justify-center gap-2"
                    >
                      {expandedProduct === match.newProduct.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide categorization options
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Keep as new product & categorize
                        </>
                      )}
                    </button>

                    {/* Categorization panel */}
                    {expandedProduct === match.newProduct.id && (
                      <div className="mt-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs text-slate-400">Category</label>
                              <button
                                onClick={() => {
                                  setShowQuickCreate({
                                    type: 'category',
                                    productId: match.newProduct.id,
                                    productName: match.newProduct.name,
                                  })
                                  setQuickCreateName('')
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                New
                              </button>
                            </div>
                            <select
                              value={match.newProduct.category?.id || ''}
                              onChange={(e) => updateProduct(match.newProduct.id, { categoryId: e.target.value })}
                              disabled={saving === match.newProduct.id}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                            >
                              <option value="">Select...</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs text-slate-400">Brand</label>
                              <button
                                onClick={() => {
                                  setShowQuickCreate({
                                    type: 'brand',
                                    productId: match.newProduct.id,
                                    productName: match.newProduct.name,
                                  })
                                  setQuickCreateName('')
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                New
                              </button>
                            </div>
                            <select
                              value={match.newProduct.brand?.id || ''}
                              onChange={(e) => updateProduct(match.newProduct.id, { brandId: e.target.value })}
                              disabled={saving === match.newProduct.id}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                            >
                              <option value="">Select...</option>
                              {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // List View for Uncategorized/All
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-slate-900 rounded-xl border overflow-hidden transition-colors ${
                  selectedProducts.has(product.id) ? 'border-purple-500' : 'border-slate-800'
                }`}
              >
                <div className="p-4 flex items-center gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelection(product.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedProducts.has(product.id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {selectedProducts.has(product.id) && <Check className="w-3 h-3" />}
                  </button>

                  {/* Product Image */}
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      {product.sku && <span className="text-xs">{product.sku}</span>}
                      <span className="text-emerald-400">${Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quick Category/Brand */}
                  <div className="flex items-center gap-2">
                    <select
                      value={product.category?.id || ''}
                      onChange={(e) => updateProduct(product.id, { categoryId: e.target.value })}
                      disabled={saving === product.id}
                      className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs w-28"
                    >
                      <option value="">Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <select
                      value={product.brand?.id || ''}
                      onChange={(e) => updateProduct(product.id, { brandId: e.target.value })}
                      disabled={saving === product.id}
                      className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs w-28"
                    >
                      <option value="">Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      disabled={saving === product.id}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Create Modal */}
      {showQuickCreate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showQuickCreate.type === 'category' ? (
                  <Tag className="w-5 h-5 text-purple-400" />
                ) : (
                  <Store className="w-5 h-5 text-blue-400" />
                )}
                <h2 className="text-lg font-bold">
                  Create New {showQuickCreate.type === 'category' ? 'Category' : 'Brand'}
                </h2>
              </div>
              <button
                onClick={() => setShowQuickCreate(null)}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {showQuickCreate.productName && (
                <p className="text-sm text-slate-400 mb-4">
                  For product: <span className="text-white">{showQuickCreate.productName}</span>
                </p>
              )}

              <input
                type="text"
                value={quickCreateName}
                onChange={(e) => setQuickCreateName(e.target.value)}
                placeholder={`New ${showQuickCreate.type} name...`}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickCreateName.trim()) {
                    handleQuickCreate()
                  }
                }}
              />

              {/* Suggestions */}
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {showQuickCreate.type === 'category' && (
                    <>
                      {['Candy', 'Chips', 'Beverages', 'Cookies', 'Snacks', 'Chocolate', 'Gum', 'Nuts', 'Dried Fruit'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setQuickCreateName(cat)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs"
                        >
                          {cat}
                        </button>
                      ))}
                    </>
                  )}
                  {showQuickCreate.type === 'brand' && (
                    <>
                      {['De La Rosa', 'Vero', 'Lucas', 'Ricolino', 'Bimbo', 'Gamesa', 'Sabritas', 'Barcel', 'Pelon Pelo Rico'].map(brand => (
                        <button
                          key={brand}
                          onClick={() => setQuickCreateName(brand)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs"
                        >
                          {brand}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowQuickCreate(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickCreate}
                disabled={!quickCreateName.trim() || quickCreateLoading}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {quickCreateLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create {showQuickCreate.productId ? '& Apply' : ''}
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
