'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Edit2, Trash2, GripVertical, ArrowLeft, Search, X,
  Image as ImageIcon, Star, Eye, ChevronUp, ChevronDown, Package
} from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  imageUrl: string | null
  unitsPerCase: number
  inStock: boolean
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
}

interface SectionItem {
  id: string
  productId: string
  displayOrder: number
  featured: boolean
  product: Product
}

interface CatalogSection {
  id: string
  name: string
  description: string | null
  type: string
  position: number
  hero: boolean
  imageUrl: string | null
  badgeText: string | null
  badgeColor: string | null
  active: boolean
  items: SectionItem[]
  _count: { items: number }
}

const SECTION_TYPES = [
  { value: 'FEATURED', label: 'Featured', icon: '⭐' },
  { value: 'CHIPS', label: 'Chips & Snacks', icon: '🍟' },
  { value: 'CANDY', label: 'Candy', icon: '🍬' },
  { value: 'BEVERAGES', label: 'Beverages', icon: '🥤' },
  { value: 'GROCERY', label: 'Grocery', icon: '🛒' },
  { value: 'SEASONAL', label: 'Seasonal', icon: '🎄' },
  { value: 'SPECIAL', label: 'Special Offers', icon: '🔥' },
  { value: 'BUNDLES', label: 'Bundles', icon: '📦' },
  { value: 'BAKERY', label: 'Bakery', icon: '🥐' },
  { value: 'DAIRY', label: 'Dairy', icon: '🥛' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
]

export default function SectionEditorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<CatalogSection | null>(null)
  const [isNewSection, setIsNewSection] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)

  // Fetch sections
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => {
      const res = await fetch('/api/admin/sections')
      if (!res.ok) throw new Error('Failed to fetch sections')
      const json = await res.json()
      return json.data || []
    }
  })

  const sections: CatalogSection[] = sectionsData || []

  // Fetch all products for picker
  const { data: productsData } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products?limit=1000')
      if (!res.ok) throw new Error('Failed to fetch products')
      const json = await res.json()
      return json.data || []
    }
  })

  const allProducts: Product[] = productsData || []

  // Auto-select first section
  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id)
    }
  }, [sections, selectedSection])

  const currentSection = sections.find(s => s.id === selectedSection)

  // Save section mutation
  const saveSectionMutation = useMutation({
    mutationFn: async (section: Partial<CatalogSection> & { id?: string }) => {
      const method = section.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/sections', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section)
      })
      if (!res.ok) throw new Error('Failed to save section')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      setEditingSection(null)
      setIsNewSection(false)
      toast('Section saved successfully', 'success')
    },
    onError: (error: any) => {
      toast('Failed to save section: ' + error.message, 'error')
    }
  })

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sections?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete section')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      if (selectedSection === editingSection?.id) {
        setSelectedSection(null)
      }
      toast('Section deleted', 'success')
    },
    onError: (error: any) => {
      toast('Failed to delete section: ' + error.message, 'error')
    }
  })

  // Add item to section
  const addItemMutation = useMutation({
    mutationFn: async ({ sectionId, productId }: { sectionId: string; productId: string }) => {
      const res = await fetch('/api/admin/sections/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, productId })
      })
      if (!res.ok) throw new Error('Failed to add item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      toast('Product added to section', 'success')
    },
    onError: (error: any) => {
      toast('Failed to add product: ' + error.message, 'error')
    }
  })

  // Remove item from section
  const removeItemMutation = useMutation({
    mutationFn: async ({ sectionId, productId }: { sectionId: string; productId: string }) => {
      const res = await fetch(`/api/admin/sections/items?sectionId=${sectionId}&productId=${productId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to remove item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      toast('Product removed', 'success')
    },
    onError: (error: any) => {
      toast('Failed to remove product: ' + error.message, 'error')
    }
  })

  // Reorder sections
  const reorderSectionsMutation = useMutation({
    mutationFn: async (order: string[]) => {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      })
      if (!res.ok) throw new Error('Failed to reorder')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
    }
  })

  // Reorder items within section
  const reorderItemsMutation = useMutation({
    mutationFn: async ({ sectionId, order }: { sectionId: string; order: string[] }) => {
      const res = await fetch('/api/admin/sections/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, order })
      })
      if (!res.ok) throw new Error('Failed to reorder')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
    }
  })

  const handleAddSection = () => {
    setEditingSection({
      id: '',
      name: '',
      description: null,
      type: 'GROCERY',
      position: sections.length,
      hero: false,
      imageUrl: null,
      badgeText: null,
      badgeColor: '#10b981',
      active: true,
      items: [],
      _count: { items: 0 }
    })
    setIsNewSection(true)
  }

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection) return

    const payload = isNewSection
      ? {
          name: editingSection.name,
          description: editingSection.description,
          type: editingSection.type,
          hero: editingSection.hero,
          imageUrl: editingSection.imageUrl,
          badgeText: editingSection.badgeText,
          badgeColor: editingSection.badgeColor,
          active: editingSection.active,
        }
      : editingSection

    saveSectionMutation.mutate(payload)
  }

  const handleDeleteSection = (id: string) => {
    if (!confirm('Delete this section? Products will NOT be deleted, just removed from this section.')) return
    deleteSectionMutation.mutate(id)
  }

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return

    const newSections = [...sections]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]]

    reorderSectionsMutation.mutate(newSections.map(s => s.id))
  }

  // Filter products for picker (exclude already in section)
  const currentSectionProductIds = new Set(currentSection?.items.map(i => i.productId) || [])
  const filteredProducts = allProducts.filter(p => {
    if (currentSectionProductIds.has(p.id)) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) ||
           p.sku.toLowerCase().includes(q) ||
           p.brand?.name.toLowerCase().includes(q) ||
           p.category?.name.toLowerCase().includes(q)
  })

  // Drag and drop for items
  const handleItemDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleItemDrop = (targetItemId: string) => {
    if (!draggedItem || !currentSection || draggedItem === targetItemId) {
      setDraggedItem(null)
      return
    }

    const items = [...currentSection.items]
    const draggedIndex = items.findIndex(i => i.id === draggedItem)
    const targetIndex = items.findIndex(i => i.id === targetItemId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null)
      return
    }

    // Reorder
    const [removed] = items.splice(draggedIndex, 1)
    items.splice(targetIndex, 0, removed)

    reorderItemsMutation.mutate({
      sectionId: currentSection.id,
      order: items.map(i => i.id)
    })

    setDraggedItem(null)
  }

  if (sectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading sections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Catalog Section Editor</h1>
                <p className="text-sm text-white/60">Build your catalog page section by section</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/catalog"
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </a>
              <button
                onClick={handleAddSection}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sections List (Left Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-white/10 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Sections</h2>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-all ${
                      selectedSection === section.id
                        ? 'bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-yellow-400/20 border-2 border-amber-500'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {SECTION_TYPES.find(t => t.value === section.type)?.icon || '📋'}
                        </span>
                        <div>
                          <span className="font-medium text-white text-sm">{section.name}</span>
                          {section.hero && (
                            <span className="ml-2 text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                              Hero
                            </span>
                          )}
                          <p className="text-xs text-white/40">{section._count.items} products</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, 'up') }}
                          disabled={index === 0}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, 'down') }}
                          disabled={index === sections.length - 1}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingSection(section); setIsNewSection(false) }}
                          className="p-1 text-white/40 hover:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id) }}
                          className="p-1 text-white/40 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sections.length === 0 && (
                  <div className="text-center py-8 text-white/40">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No sections yet</p>
                    <p className="text-sm">Click "Add Section" to start</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Items (Right Panel) */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl border border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {currentSection ? currentSection.name : 'Select a section'}
                  </h2>
                  {currentSection?.description && (
                    <p className="text-sm text-white/60 mt-1">{currentSection.description}</p>
                  )}
                </div>
                {currentSection && (
                  <button
                    onClick={() => setShowProductPicker(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform"
                  >
                    <Plus className="h-4 w-4" />
                    Add Products
                  </button>
                )}
              </div>

              {!currentSection ? (
                <div className="text-center py-16 text-white/40">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a section to manage its products</p>
                </div>
              ) : currentSection.items.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No products in this section</p>
                  <p className="text-sm mt-2">Click "Add Products" to add items</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentSection.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleItemDragStart(item.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleItemDrop(item.id)}
                      className={`flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-move transition-all ${
                        draggedItem === item.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <GripVertical className="h-5 w-5 text-white/30" />

                      <div className="h-16 w-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white/30">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{item.product.name}</h3>
                        <p className="text-sm text-white/50">{item.product.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-400 font-bold">
                            ${Number(item.product.price).toFixed(2)}
                          </span>
                          <span className="text-white/40 text-xs">
                            / {item.product.unitsPerCase} units
                          </span>
                          {item.product.brand && (
                            <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded">
                              {item.product.brand.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItemMutation.mutate({
                          sectionId: currentSection.id,
                          productId: item.productId
                        })}
                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">
              {isNewSection ? 'Create Section' : 'Edit Section'}
            </h2>
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Name</label>
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Weekend Specials"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
                <textarea
                  value={editingSection.description || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Type</label>
                  <select
                    value={editingSection.type}
                    onChange={(e) => setEditingSection({ ...editingSection, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {SECTION_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-gray-800">
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Badge Color</label>
                  <input
                    type="color"
                    value={editingSection.badgeColor || '#10b981'}
                    onChange={(e) => setEditingSection({ ...editingSection, badgeColor: e.target.value })}
                    className="w-full h-10 px-1 py-1 bg-white/5 border border-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Badge Text (optional)</label>
                <input
                  type="text"
                  value={editingSection.badgeText || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, badgeText: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Hot Deal, New Arrival"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSection.hero}
                    onChange={(e) => setEditingSection({ ...editingSection, hero: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-white/80">Hero Section (large banner)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSection.active}
                    onChange={(e) => setEditingSection({ ...editingSection, active: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-white/80">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveSectionMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 text-black font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {saveSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingSection(null); setIsNewSection(false) }}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {showProductPicker && currentSection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Add Products to {currentSection.name}</h2>
              <button
                onClick={() => { setShowProductPicker(false); setSearchQuery('') }}
                className="p-2 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Search products by name, SKU, brand..."
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredProducts.slice(0, 50).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="h-12 w-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/30">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/50">{product.sku}</span>
                      {product.brand && (
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded">
                          {product.brand.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-amber-400 font-bold">
                    ${Number(product.price).toFixed(2)}
                  </span>

                  <button
                    onClick={() => addItemMutation.mutate({
                      sectionId: currentSection.id,
                      productId: product.id
                    })}
                    disabled={addItemMutation.isPending}
                    className="px-3 py-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 text-black font-semibold rounded-lg text-sm hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <p>No products found</p>
                </div>
              )}

              {filteredProducts.length > 50 && (
                <p className="text-center text-white/40 text-sm py-2">
                  Showing first 50 results. Use search to narrow down.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
