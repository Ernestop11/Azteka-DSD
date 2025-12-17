'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Search, Plus, X, GripVertical, Eye, EyeOff, Save, ArrowUp, ArrowDown } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  imageUrl?: string | null
  featured?: boolean
  trending?: boolean
  seasonal?: boolean
}

interface SectionConfig {
  id: string
  name: string
  key: string
  productIds: string[]
  enabled: boolean
  displayOrder: number
}

interface ProductSectionManagerProps {
  sectionKey: string
  sectionName: string
  description: string
  currentProductIds: string[]
  onSave: (productIds: string[]) => Promise<void>
}

export default function ProductSectionManager({
  sectionKey,
  sectionName,
  description,
  currentProductIds,
  onSave,
}: ProductSectionManagerProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(currentProductIds)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products-for-section'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const json = await res.json()
      return json.data || []
    },
  })

  // Filter products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedProducts = selectedProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)

  const availableProducts = filteredProducts.filter((p) => !selectedProductIds.includes(p.id))

  const handleAddProduct = (productId: string) => {
    setSelectedProductIds([...selectedProductIds, productId])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIds(selectedProductIds.filter((id) => id !== productId))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...selectedProductIds]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    setSelectedProductIds(newOrder)
  }

  const handleMoveDown = (index: number) => {
    if (index === selectedProductIds.length - 1) return
    const newOrder = [...selectedProductIds]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    setSelectedProductIds(newOrder)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selectedProductIds)
      toast(`${sectionName} saved successfully`, 'success')
    } catch (error: any) {
      toast(`Failed to save: ${error.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{sectionName}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Selected Products */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Selected Products ({selectedProducts.length})
          </h4>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Section'}
          </Button>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No products selected. Add products from the list below.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="w-4 h-4 cursor-move" />
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === selectedProducts.length - 1}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.sku}</div>
                </div>

                <div className="text-sm font-semibold text-gray-700">
                  ${Number(product.price || 0).toFixed(2)}
                </div>

                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Products */}
      <div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading products...</div>
        ) : availableProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            {searchTerm ? 'No products found matching your search' : 'All products are already selected'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {availableProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product.id)}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={getPublicImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate">{product.sku}</div>
                </div>

                <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}







