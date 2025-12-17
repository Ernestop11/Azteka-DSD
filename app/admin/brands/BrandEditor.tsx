'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Drawer from '@/components/ui/drawer'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Upload } from 'lucide-react'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface Brand {
  id?: string
  name: string
  slug: string
  imageUrl?: string | null
}

interface BrandEditorProps {
  isOpen: boolean
  onClose: () => void
  brand?: Brand | null
}

export default function BrandEditor({
  isOpen,
  onClose,
  brand,
}: BrandEditorProps) {
  const [formData, setFormData] = useState<Brand>({
    name: '',
    slug: '',
    imageUrl: null,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (brand) {
      setFormData(brand)
      setImagePreview(brand.imageUrl ? getPublicImageUrl(brand.imageUrl) : null)
    } else {
      setFormData({ name: '', slug: '', imageUrl: null })
      setImagePreview(null)
    }
    setImageFile(null)
  }, [brand])

  // Auto-generate slug from name
  useEffect(() => {
    if (!brand && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name, brand])

  const saveMutation = useMutation({
    mutationFn: async (data: Brand) => {
      const url = '/api/admin/brands'
      const method = brand?.id ? 'PUT' : 'POST'
      
      // Save brand first
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: brand?.id }),
      })
      if (!res.ok) throw new Error('Failed to save brand')
      const saved = await res.json()
      
      // Upload image if provided
      if (imageFile && saved.id) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('brandId', saved.id)
        
        const uploadRes = await fetch('/api/admin/brands/uploadImage', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) {
          console.warn('Failed to upload brand image')
        } else {
          const uploadData = await uploadRes.json()
          // Update brand with image URL
          await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, id: saved.id, imageUrl: uploadData.imageUrl }),
          })
        }
      }
      
      return saved
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] })
      toast('Brand saved successfully', 'success')
      setImageFile(null)
      onClose()
    },
    onError: () => {
      toast('Failed to save brand', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/brands', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete brand')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] })
      toast('Brand deleted successfully', 'success')
      onClose()
    },
    onError: () => {
      toast('Failed to delete brand', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (brand?.id && confirm('Are you sure you want to delete this brand?')) {
      deleteMutation.mutate(brand.id)
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={brand ? 'Edit Brand' : 'New Brand'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <Input
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            URL-friendly identifier (auto-generated from name)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          {imagePreview && (
            <div className="mb-3 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Brand preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span className="text-sm">
              {imageFile ? 'Change Image' : 'Upload Image'}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Optional: Upload a brand image (PNG, JPG, or WebP)
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {brand?.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Drawer>
  )
}

