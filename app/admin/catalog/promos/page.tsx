'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Save, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProductImageUpload from '../../products/ProductImageUpload'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface BillboardPromo {
  id?: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  imagePosition: 'left' | 'right'
  theme: 'blue' | 'purple' | 'emerald' | 'orange'
  ctaText: string
  ctaLink: string
  active: boolean
  displayOrder: number
}

export default function PromosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingPromo, setEditingPromo] = useState<BillboardPromo | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Fetch promos
  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['billboard-promos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/catalog/promos')
      if (!res.ok) throw new Error('Failed to fetch promos')
      const data = await res.json()
      return data.data || []
    },
  })

  // Save promo
  const savePromo = useMutation({
    mutationFn: async (promo: BillboardPromo) => {
      let imageUrl = promo.imageUrl

      // Upload image if new file exists
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('type', 'billboard-promo')

        const uploadRes = await fetch('/api/admin/catalog/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.imageUrl
        }
      }

      const method = promo.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/catalog/promos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promo, imageUrl }),
      })
      if (!res.ok) throw new Error('Failed to save promo')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billboard-promos'] })
      toast('Promo saved successfully', 'success')
      setEditingPromo(null)
      setImageFile(null)
    },
    onError: (error: any) => {
      toast('Failed to save promo: ' + error.message, 'error')
    },
  })

  // Delete promo
  const deletePromo = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/catalog/promos?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete promo')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billboard-promos'] })
      toast('Promo deleted successfully', 'success')
    },
    onError: () => {
      toast('Failed to delete promo', 'error')
    },
  })

  // Update display order
  const updateOrder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const res = await fetch('/api/admin/catalog/promos/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      })
      if (!res.ok) throw new Error('Failed to update order')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billboard-promos'] })
    },
  })

  const handleNew = () => {
    setEditingPromo({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      imagePosition: 'right',
      theme: 'blue',
      ctaText: '',
      ctaLink: '',
      active: true,
      displayOrder: promos.length,
    })
  }

  const handleEdit = (promo: BillboardPromo) => {
    setEditingPromo(promo)
  }

  const sortedPromos = [...promos].sort((a, b) => a.displayOrder - b.displayOrder)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading promos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billboard Promos</h1>
              <p className="text-gray-600 mt-1">Create and manage promotional billboards</p>
            </div>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Promo
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPromos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No promos configured
                  </TableCell>
                </TableRow>
              ) : (
                sortedPromos.map((promo: BillboardPromo, index: number) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => updateOrder.mutate({ id: promo.id!, direction: 'up' })}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateOrder.mutate({ id: promo.id!, direction: 'down' })}
                          disabled={index === sortedPromos.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{promo.title}</TableCell>
                    <TableCell>{promo.subtitle}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {promo.theme}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          promo.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(promo)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this promo?')) {
                              deletePromo.mutate(promo.id!)
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Editor Modal */}
        {editingPromo && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPromo.id ? 'Edit Promo' : 'New Promo'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <Input
                      value={editingPromo.title}
                      onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <Input
                      value={editingPromo.subtitle}
                      onChange={(e) => setEditingPromo({ ...editingPromo, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingPromo.description}
                    onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <select
                      value={editingPromo.theme}
                      onChange={(e) => setEditingPromo({ ...editingPromo, theme: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="emerald">Emerald</option>
                      <option value="orange">Orange</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Position</label>
                    <select
                      value={editingPromo.imagePosition}
                      onChange={(e) =>
                        setEditingPromo({ ...editingPromo, imagePosition: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                    <Input
                      value={editingPromo.ctaText}
                      onChange={(e) => setEditingPromo({ ...editingPromo, ctaText: e.target.value })}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                    <Input
                      value={editingPromo.ctaLink}
                      onChange={(e) => setEditingPromo({ ...editingPromo, ctaLink: e.target.value })}
                      placeholder="/catalog"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Image</label>
                  <ProductImageUpload
                    productId={editingPromo.id || 'billboard-promo'}
                    currentImageUrl={getPublicImageUrl(editingPromo.imageUrl)}
                    onUploadComplete={(url) => setEditingPromo({ ...editingPromo, imageUrl: url })}
                    onFileSelect={setImageFile}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="promo-active"
                    checked={editingPromo.active}
                    onChange={(e) => setEditingPromo({ ...editingPromo, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="promo-active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPromo(null)
                    setImageFile(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => savePromo.mutate(editingPromo)} disabled={savePromo.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {savePromo.isPending ? 'Saving...' : 'Save Promo'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

