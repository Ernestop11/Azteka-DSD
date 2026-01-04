'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, FileText, Image, Loader2, Check, AlertTriangle, X, Plus, Trash2, Save, Eye, Search, Link2 } from 'lucide-react'

interface ExtractedProduct {
  id: string
  sku: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  isNewProduct: boolean
  existingProductId?: string
  matchedProductName?: string
  matchScore?: number
  matchType?: string
  priceVariance?: number // % difference from base price
  suggestedRule?: string // e.g., "10% discount", "fixed $X"
}

interface DbProduct {
  id: string
  name: string
  sku: string | null
  price: number
  category?: { name: string } | null
}

interface ExtractedCustomer {
  businessName: string
  contactName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  existingId?: string
  isNew: boolean
}

interface ExtractedInvoice {
  invoiceNumber: string
  invoiceDate: string
  customer: ExtractedCustomer
  products: ExtractedProduct[]
  subtotal: number
  tax: number
  total: number
  rawText?: string
}

function SeedInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetCustomerId = searchParams.get('customerId')
  const presetStoreName = searchParams.get('storeName')
  const [repSession, setRepSession] = useState<{ id: string; name: string } | null>(null)
  const [customerSession, setCustomerSession] = useState<{ customerId: string; businessName: string } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedInvoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
    createdProductIds?: string[];
    customerId?: string;
    orderId?: string;
  } | null>(null)
  const [showRawText, setShowRawText] = useState(false)
  const [showNewProductsModal, setShowNewProductsModal] = useState(false)

  // Editable fields
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [customerData, setCustomerData] = useState<ExtractedCustomer | null>(null)
  const [products, setProducts] = useState<ExtractedProduct[]>([])

  // Product lookup modal state
  const [showProductLookup, setShowProductLookup] = useState(false)
  const [lookupProductIndex, setLookupProductIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DbProduct[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check for rep session first
    const repStored = localStorage.getItem('repSession')
    if (repStored) {
      setRepSession(JSON.parse(repStored))
      return
    }

    // Check for customer session (multi-store owners)
    const customerStored = localStorage.getItem('customerSession')
    if (customerStored) {
      setCustomerSession(JSON.parse(customerStored))
      return
    }

    // If preset customerId is provided, allow access without session (for direct links)
    if (presetCustomerId && presetStoreName) {
      setCustomerSession({
        customerId: presetCustomerId,
        businessName: decodeURIComponent(presetStoreName)
      })
      return
    }

    // No valid session - redirect to rep login
    router.replace('/rep/login')
  }, [router, presetCustomerId, presetStoreName])

  // Pre-fill customer data if customerId is provided in URL
  useEffect(() => {
    if (presetCustomerId && presetStoreName && !customerData) {
      setCustomerData({
        businessName: decodeURIComponent(presetStoreName),
        contactName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        existingId: presetCustomerId,
        isNew: false
      })
    }
  }, [presetCustomerId, presetStoreName, customerData])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setExtractedData(null)
    setSaveResult(null)

    // Create preview for images
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selected)
    } else {
      setPreview(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.type.startsWith('image/') || dropped.type === 'application/pdf')) {
      setFile(dropped)
      setExtractedData(null)
      setSaveResult(null)

      if (dropped.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(dropped)
      } else {
        setPreview(null)
      }
    }
  }, [])

  const parseInvoice = async () => {
    if (!file) return

    setParsing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('repId', repSession?.id || '')

      const res = await fetch('/api/rep/parse-invoice', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to parse invoice')
      }

      const data: ExtractedInvoice = await res.json()
      setExtractedData(data)
      setCustomerData(data.customer)
      setProducts(data.products)
    } catch (error) {
      console.error('Parse error:', error)
      alert(error instanceof Error ? error.message : 'Failed to parse invoice')
    } finally {
      setParsing(false)
    }
  }

  const updateProduct = (index: number, field: keyof ExtractedProduct, value: string | number) => {
    setProducts(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      // Recalculate total if quantity or price changed
      if (field === 'quantity' || field === 'unitPrice') {
        updated[index].total = updated[index].quantity * updated[index].unitPrice
      }
      return updated
    })
  }

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  const addProduct = () => {
    setProducts(prev => [...prev, {
      id: `new-${Date.now()}`,
      sku: '',
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      isNewProduct: true,
    }])
  }

  // Open product lookup modal
  const openProductLookup = (index: number) => {
    setLookupProductIndex(index)
    setSearchQuery(products[index].name)
    setSearchResults([])
    setShowProductLookup(true)
    // Auto-search with current product name
    searchProducts(products[index].name)
  }

  // Search products in database
  const searchProducts = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const res = await fetch(`/api/rep/products/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.products || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Link invoice product to existing DB product
  const linkToDbProduct = (dbProduct: DbProduct, keepDbName: boolean) => {
    if (lookupProductIndex === null) return

    setProducts(prev => {
      const updated = [...prev]
      const invoiceProduct = updated[lookupProductIndex]
      updated[lookupProductIndex] = {
        ...invoiceProduct,
        existingProductId: dbProduct.id,
        matchedProductName: dbProduct.name,
        isNewProduct: false,
        matchType: 'manual',
        matchScore: 1,
        // Use DB name if requested, otherwise keep invoice name
        name: keepDbName ? dbProduct.name : invoiceProduct.name,
        // Use DB SKU if available and invoice SKU is empty
        sku: invoiceProduct.sku || dbProduct.sku || '',
      }
      return updated
    })

    setShowProductLookup(false)
    setLookupProductIndex(null)
    setSearchQuery('')
    setSearchResults([])
  }

  // Unlink product (mark as new again)
  const unlinkProduct = (index: number) => {
    setProducts(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        existingProductId: undefined,
        matchedProductName: undefined,
        isNewProduct: true,
        matchType: undefined,
        matchScore: undefined,
      }
      return updated
    })
  }

  const saveToDatabase = async () => {
    if (!customerData || products.length === 0) {
      alert('Please ensure customer and products are filled in')
      return
    }

    setSaving(true)
    setSaveResult(null)

    try {
      // Include preset customerId if available (ensures we update the right customer)
      const customerPayload = {
        ...customerData,
        existingId: customerData.existingId || presetCustomerId || undefined
      }

      const res = await fetch('/api/rep/seed-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerPayload,
          products,
          invoiceNumber: extractedData?.invoiceNumber,
          invoiceDate: extractedData?.invoiceDate,
          total: extractedData?.total,
          repId: repSession?.id || customerSession?.customerId,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save')
      }

      setSaveResult({
        success: true,
        message: `Saved! Customer: ${result.customer?.businessName}, ${result.productsCreated} new products, ${result.priceOverrides} price overrides set, Order created.`,
        createdProductIds: result.createdProductIds || [],
        customerId: result.customer?.id,
        orderId: result.orderId,
      })

      // If new products were created, show the enrichment modal
      if (result.productsCreated > 0) {
        setShowNewProductsModal(true)
      }
    } catch (error) {
      setSaveResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save data'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold">Invoice Seeder</h1>
              <p className="text-xs text-slate-400">Upload invoices to seed customers & products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Upload Zone */}
        {!extractedData && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              file ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="invoice-upload"
            />

            {!file ? (
              <>
                <div className="flex justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">Drop an invoice here</p>
                <p className="text-sm text-slate-400 mb-4">PNG, JPG, or PDF</p>
                <label
                  htmlFor="invoice-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Select File
                </label>
              </>
            ) : (
              <>
                {preview && (
                  <img src={preview} alt="Invoice preview" className="max-h-64 mx-auto rounded-lg mb-4" />
                )}
                <p className="text-lg font-medium mb-1">{file.name}</p>
                <p className="text-sm text-slate-400 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={parseInvoice}
                    disabled={parsing}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-xl font-medium transition-colors"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5" />
                        Parse Invoice
                      </>
                    )}
                  </button>
                  <label
                    htmlFor="invoice-upload"
                    className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium cursor-pointer transition-colors"
                  >
                    Change File
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* Extracted Data Editor */}
        {extractedData && (
          <div className="space-y-6">
            {/* Customer Section */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {customerData?.isNew ? (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">NEW</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">EXISTS</span>
                  )}
                  Customer
                </h2>
                <button
                  onClick={() => setEditingCustomer(!editingCustomer)}
                  className="text-sm text-blue-400 hover:underline"
                >
                  {editingCustomer ? 'Done' : 'Edit'}
                </button>
              </div>

              {editingCustomer && customerData ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Business Name</label>
                    <input
                      type="text"
                      value={customerData.businessName}
                      onChange={(e) => setCustomerData({ ...customerData, businessName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Contact Name</label>
                    <input
                      type="text"
                      value={customerData.contactName}
                      onChange={(e) => setCustomerData({ ...customerData, contactName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Phone</label>
                    <input
                      type="text"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Email</label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400">Address</label>
                    <input
                      type="text"
                      value={customerData.address}
                      onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">City</label>
                    <input
                      type="text"
                      value={customerData.city}
                      onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400">State</label>
                      <input
                        type="text"
                        value={customerData.state}
                        onChange={(e) => setCustomerData({ ...customerData, state: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">ZIP</label>
                      <input
                        type="text"
                        value={customerData.zipCode}
                        onChange={(e) => setCustomerData({ ...customerData, zipCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : customerData && (
                <div className="space-y-1">
                  <p className="font-semibold">{customerData.businessName}</p>
                  <p className="text-sm text-slate-400">{customerData.contactName}</p>
                  <p className="text-sm text-slate-400">{customerData.phone} • {customerData.email}</p>
                  <p className="text-sm text-slate-400">{customerData.address}, {customerData.city}, {customerData.state} {customerData.zipCode}</p>
                </div>
              )}
            </div>

            {/* Products Section */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Products ({products.length})</h2>
                <button
                  onClick={addProduct}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg border ${
                      product.isNewProduct
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : product.priceVariance && Math.abs(product.priceVariance) > 5
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-slate-700/50 border-slate-600/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={product.sku}
                            onChange={(e) => updateProduct(index, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="w-full px-2 py-1.5 bg-slate-600 border border-slate-500 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            placeholder="Product Name"
                            className="w-full px-2 py-1.5 bg-slate-600 border border-slate-500 rounded text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                            placeholder="Qty"
                            className="w-full px-2 py-1.5 bg-slate-600 border border-slate-500 rounded text-xs text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            value={product.unitPrice}
                            onChange={(e) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            className="w-full px-2 py-1.5 bg-slate-600 border border-slate-500 rounded text-xs text-right"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <span className="text-sm font-semibold text-emerald-400">
                            ${product.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(index)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Matched product indicator */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {product.isNewProduct ? (
                        <>
                          <span className="text-xs text-amber-400">New product will be created</span>
                          <button
                            onClick={() => openProductLookup(index)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs"
                          >
                            <Search className="w-3 h-3" />
                            Search DB
                          </button>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">
                            Linked to: {product.matchedProductName || 'existing product'}
                            {product.matchScore && product.matchType === 'fuzzy' && (
                              <span className="text-slate-500 ml-1">({Math.round(product.matchScore * 100)}% match)</span>
                            )}
                          </span>
                          <button
                            onClick={() => openProductLookup(index)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded text-xs"
                          >
                            <Search className="w-3 h-3" />
                            Change
                          </button>
                          <button
                            onClick={() => unlinkProduct(index)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                          >
                            <X className="w-3 h-3" />
                            Unlink
                          </button>
                        </>
                      )}
                    </div>

                    {/* Price variance indicator */}
                    {product.priceVariance !== undefined && Math.abs(product.priceVariance) > 0.5 && (
                      <div className="mt-1 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-400">
                          {product.priceVariance > 0 ? '+' : ''}{product.priceVariance.toFixed(1)}% from base price
                          {product.suggestedRule && ` → ${product.suggestedRule}`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-lg font-bold">
                  <span>Invoice Total</span>
                  <span className="text-emerald-400">
                    ${products.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw Text (Debug) */}
            {extractedData.rawText && (
              <div className="bg-slate-800 rounded-xl p-4">
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                  {showRawText ? 'Hide' : 'Show'} Raw Extracted Text
                </button>
                {showRawText && (
                  <pre className="mt-3 p-3 bg-slate-900 rounded text-xs text-slate-400 overflow-auto max-h-48">
                    {extractedData.rawText}
                  </pre>
                )}
              </div>
            )}

            {/* Save Result */}
            {saveResult && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                saveResult.success ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'
              }`}>
                {saveResult.success ? (
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={saveResult.success ? 'text-emerald-400' : 'text-red-400'}>
                  {saveResult.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveToDatabase}
                disabled={saving}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save to Database
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setExtractedData(null)
                  setFile(null)
                  setPreview(null)
                  setCustomerData(null)
                  setProducts([])
                  setSaveResult(null)
                }}
                className="px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Lookup Modal */}
      {showProductLookup && lookupProductIndex !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Find Matching Product</h2>
                <p className="text-sm text-slate-400">
                  Invoice: <span className="text-white">{products[lookupProductIndex]?.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProductLookup(false)
                  setLookupProductIndex(null)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    // Debounce search
                    if (searchTimeout) clearTimeout(searchTimeout)
                    const timeout = setTimeout(() => {
                      searchProducts(value)
                    }, 300)
                    setSearchTimeout(timeout)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchTimeout) clearTimeout(searchTimeout)
                      searchProducts(searchQuery)
                    }
                  }}
                  placeholder="Search products by name, SKU, or keyword..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              {/* Quick search hint */}
              <p className="text-xs text-slate-500 mt-2">Try: &quot;amos&quot;, &quot;peelerz&quot;, &quot;mazapan&quot;, or a SKU</p>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-slate-400">Searching...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {searchQuery.length < 2 ? (
                    'Type at least 2 characters to search'
                  ) : (
                    'No products found. Try different keywords.'
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((dbProduct) => (
                    <div
                      key={dbProduct.id}
                      className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-500 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{dbProduct.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                            {dbProduct.sku && (
                              <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{dbProduct.sku}</span>
                            )}
                            <span>${Number(dbProduct.price).toFixed(2)}</span>
                            {dbProduct.category?.name && (
                              <span className="text-slate-500">{dbProduct.category.name}</span>
                            )}
                          </div>
                        </div>

                        {/* Link Options */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => linkToDbProduct(dbProduct, true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium whitespace-nowrap"
                          >
                            Use DB Name
                          </button>
                          <button
                            onClick={() => linkToDbProduct(dbProduct, false)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium whitespace-nowrap"
                          >
                            Keep Invoice Name
                          </button>
                        </div>
                      </div>

                      {/* Show name comparison if different */}
                      {dbProduct.name.toLowerCase() !== products[lookupProductIndex]?.name.toLowerCase() && (
                        <div className="mt-3 pt-3 border-t border-slate-700 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-500">Invoice:</span>
                              <p className="text-amber-400 truncate">{products[lookupProductIndex]?.name}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Database:</span>
                              <p className="text-emerald-400 truncate">{dbProduct.name}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {searchResults.length > 0 && `${searchResults.length} product${searchResults.length !== 1 ? 's' : ''} found`}
              </p>
              <button
                onClick={() => {
                  setShowProductLookup(false)
                  setLookupProductIndex(null)
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Products Enrichment Modal */}
      {showNewProductsModal && saveResult?.success && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Invoice Saved Successfully!</h2>
                  <p className="text-sm text-slate-400">{saveResult.message}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {saveResult.createdProductIds && saveResult.createdProductIds.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-400 font-medium">
                        {saveResult.createdProductIds.length} new products were created
                      </p>
                      <p className="text-sm text-amber-400/80 mt-1">
                        These products need images and categories assigned. You can enrich them in the admin panel.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase">What&apos;s Next?</h3>

                <button
                  onClick={() => {
                    router.push('/admin/sync-products')
                    setShowNewProductsModal(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Sync & Enrich Products</p>
                    <p className="text-sm text-slate-400">Merge duplicates, add images & categories</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (saveResult.customerId) {
                      router.push(`/rep/customer/${saveResult.customerId}`)
                    }
                    setShowNewProductsModal(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">View Customer Profile</p>
                    <p className="text-sm text-slate-400">See order history and set price overrides</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    setExtractedData(null)
                    setCustomerData(null)
                    setProducts([])
                    setSaveResult(null)
                    setShowNewProductsModal(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Upload Another Invoice</p>
                    <p className="text-sm text-slate-400">Seed more historical data</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setShowNewProductsModal(false)}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SeedInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SeedInvoiceContent />
    </Suspense>
  )
}
