'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  MapPin,
  Search,
  Save,
  AlertCircle,
  Check,
  Loader2,
  Grid3X3,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sku: string
  warehouseLocation: string | null
  stock: number
  imageUrl: string | null
}

// Warehouse configuration - matches inventory page
const AISLE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const SHELF_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const BIN_OPTIONS = ['1', '2', '3', '4', '5', '6']

export default function WarehouseMapPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/employee/inventory', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data.data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Parse location string to parts
  const parseLocation = (location: string | null) => {
    if (!location) return { aisle: '', shelf: '', bin: '' }
    const parts = location.split('-')
    return { aisle: parts[0] || '', shelf: parts[1] || '', bin: parts[2] || '' }
  }

  // Get products at a specific location
  const getProductsAtLocation = (aisle: string, shelf: string) => {
    return products.filter(p => {
      const loc = parseLocation(p.warehouseLocation)
      return loc.aisle === aisle && loc.shelf === shelf
    })
  }

  // Get products without location
  const unassignedProducts = products.filter(p => !p.warehouseLocation)

  // Search filter
  const filteredProducts = searchTerm
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.warehouseLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products

  // Assign product to location
  const assignLocation = async (productId: string, aisle: string, shelf: string, bin: string = '') => {
    try {
      const location = bin ? `${aisle}-${shelf}-${bin}` : `${aisle}-${shelf}`

      const res = await fetch(`/api/employee/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ warehouseLocation: location })
      })

      if (!res.ok) throw new Error('Failed to update location')

      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, warehouseLocation: location } : p
      ))
      setSuccess('Location updated!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  // Get cell color based on occupancy
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200'
    if (count <= 3) return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300'
    if (count <= 6) return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300'
    return 'bg-red-100 hover:bg-red-200 border-red-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Map</h1>
            <p className="text-sm text-gray-600">Visual location editor for products</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{products.filter(p => p.warehouseLocation).length}</div>
          <div className="text-sm text-gray-600">With Location</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{unassignedProducts.length}</div>
          <div className="text-sm text-gray-600">Unassigned</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name, SKU, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Warehouse Grid
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gray-100 border"></div>
              <span>Empty</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"></div>
              <span>1-3 items</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
              <span>4-6 items</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
              <span>7+ items</span>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs text-gray-500 font-medium">Aisle</th>
                  {SHELF_OPTIONS.map(shelf => (
                    <th key={shelf} className="p-2 text-xs text-gray-500 font-medium">
                      Shelf {shelf}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AISLE_OPTIONS.map(aisle => (
                  <tr key={aisle}>
                    <td className="p-2 text-center font-bold text-gray-700">{aisle}</td>
                    {SHELF_OPTIONS.map(shelf => {
                      const cellProducts = getProductsAtLocation(aisle, shelf)
                      const cellKey = `${aisle}-${shelf}`
                      const isSelected = selectedCell === cellKey

                      return (
                        <td key={shelf} className="p-1">
                          <button
                            onClick={() => setSelectedCell(isSelected ? null : cellKey)}
                            className={`
                              w-full aspect-square rounded-lg border-2 transition-all
                              flex flex-col items-center justify-center text-xs
                              ${getCellColor(cellProducts.length)}
                              ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
                            `}
                          >
                            <span className="font-bold">{cellProducts.length}</span>
                            <span className="text-[10px] text-gray-500">{cellKey}</span>
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Cell Details */}
          {selectedCell && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Location: {selectedCell}
              </h3>

              {(() => {
                const [aisle, shelf] = selectedCell.split('-')
                const cellProducts = getProductsAtLocation(aisle, shelf)

                if (cellProducts.length === 0) {
                  return (
                    <p className="text-sm text-gray-500">No products at this location</p>
                  )
                }

                return (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cellProducts.map(product => (
                      <div key={product.id} className="p-2 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-emerald-600">Stock: {product.stock}</span>
                          <span className="text-xs text-gray-400">{product.warehouseLocation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Unassigned Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              Unassigned Products ({unassignedProducts.length})
            </h3>

            {unassignedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">All products have locations</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {unassignedProducts.slice(0, 20).map(product => (
                  <div key={product.id} className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{product.sku || 'No SKU'}</p>

                    {/* Quick assign buttons */}
                    {selectedCell && (
                      <button
                        onClick={() => {
                          const [aisle, shelf] = selectedCell.split('-')
                          assignLocation(product.id, aisle, shelf)
                        }}
                        className="mt-2 w-full py-1 px-2 bg-emerald-600 text-white rounded text-xs font-medium"
                      >
                        Assign to {selectedCell}
                      </button>
                    )}
                  </div>
                ))}
                {unassignedProducts.length > 20 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    +{unassignedProducts.length - 20} more products
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>1. Click a cell to select it</li>
              <li>2. Click an unassigned product to place it</li>
              <li>3. Use inventory page to set bin locations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Search Results ({filteredProducts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredProducts.slice(0, 12).map(product => (
              <div key={product.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  product.warehouseLocation
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {product.warehouseLocation || 'Unassigned'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
