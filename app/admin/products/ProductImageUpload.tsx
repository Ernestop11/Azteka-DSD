'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Upload } from 'lucide-react'

interface ProductImageUploadProps {
  productId?: string
  currentImageUrl?: string | null
  onUploadComplete?: (imageUrl: string) => void
  onFileSelect?: (file: File) => void
}

export default function ProductImageUpload({
  productId,
  currentImageUrl,
  onUploadComplete,
  onFileSelect,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // If onFileSelect callback exists, use it (for form submission)
    if (onFileSelect) {
      onFileSelect(file)
      return
    }

    // Otherwise, upload immediately (legacy behavior)
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    if (productId) {
      formData.append('productId', productId)
    }

    try {
      const res = await fetch('/api/admin/products/uploadImage', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      if (onUploadComplete) {
        onUploadComplete(data.imageUrl)
      }
      toast('Image uploaded successfully', 'success')
    } catch (error) {
      toast('Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {preview && (
        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-4">
        <label className="flex-1">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span className="text-sm">
              {uploading ? 'Uploading...' : 'Upload Image'}
            </span>
          </div>
        </label>
      </div>
    </div>
  )
}

