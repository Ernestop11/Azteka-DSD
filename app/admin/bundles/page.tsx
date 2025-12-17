'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import { Plus, Package, Search, Edit2, Trash2, ArrowLeft, Filter } from 'lucide-react'
import Input from '@/components/ui/input'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Bundle {
  id: string
  name: string
  sku?: string | null
  description?: string | null
  imageUrl?: string | null
  price: number
  discountPercent: number
  stock: number
  inStock: boolean
  featured: boolean
  active: boolean
  badgeText?: string | null
  badgeColor?: string | null
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  items?: Array<{ product: { name: string }; quantity: number }>
}

export default function BundlesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterBrand, setFilterBrand] = useState<string>('all')

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
  })

  // Fetch brands for filter
  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) throw new Error('Failed to fetch brands')
      return res.json()
    },
  })

  const categories = categoriesData?.data || []
  const brands = brandsData?.data || []

  const { data: bundlesData, isLoading, refetch } = useQuery<{ data: Bundle[] }>({
    queryKey: ['admin-bundles', searchTerm, filterActive],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (filterActive !== null) params.set('active', filterActive.toString())
      
      const res = await fetch(`/api/admin/bundles?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch bundles')
      return res.json()
    },
  })

  const bundles = (bundlesData?.data || []).filter((bundle) => {
    const matchesCategory = filterCategory === 'all' || bundle.category?.id === filterCategory
    const matchesBrand = filterBrand === 'all' || bundle.brand?.id === filterBrand
    return matchesCategory && matchesBrand
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return
    
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      refetch()
    } catch (error) {
      alert('Failed to delete bundle')
    }
  }

  const handleToggleActive = async (bundle: Bundle) => {
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bundle,
          active: !bundle.active,
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      refetch()
    } catch (error) {
      alert('Failed to update bundle')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Bundles</h1>
                <p className="text-sm text-gray-600">Manage multi-product bundles</p>
              </div>
            </div>
            <Button onClick={() => router.push('/admin/bundles/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Bundle
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Brands</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>

              <select
                value={filterActive === null ? 'all' : filterActive.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  setFilterActive(value === 'all' ? null : value === 'true')
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Bundles Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading bundles...</p>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No bundles found</p>
            <p className="text-gray-500 text-sm mb-4">Create your first bundle to get started</p>
            <Button onClick={() => router.push('/admin/bundles/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Bundle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Bundle Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {bundle.imageUrl ? (
                    <img
                      src={getPublicImageUrl(bundle.imageUrl)}
                      alt={bundle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  {bundle.badgeText && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: bundle.badgeColor || '#10b981' }}
                    >
                      {bundle.badgeText}
                    </div>
                  )}
                  {!bundle.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold">INACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Bundle Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{bundle.name}</h3>
                  {bundle.sku && (
                    <p className="text-sm text-gray-500 mb-2">SKU: {bundle.sku}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${Number(bundle.price || 0).toFixed(2)}
                      </p>
                      {bundle.discountPercent > 0 && (
                        <p className="text-sm text-green-600">
                          {bundle.discountPercent}% OFF
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {bundle.items?.length || 0} products
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {bundle.stock}
                      </p>
                    </div>
                  </div>

                  {bundle.category && (
                    <p className="text-xs text-gray-500 mb-2">
                      Category: {bundle.category.name}
                    </p>
                  )}
                  {bundle.brand && (
                    <p className="text-xs text-gray-500 mb-3">
                      Brand: {bundle.brand.name}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/bundles/${bundle.id}`)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(bundle)}
                      className={bundle.active ? 'text-orange-600' : 'text-green-600'}
                    >
                      {bundle.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bundle.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

