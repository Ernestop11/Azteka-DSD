'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  X,
  Check,
  Sparkles,
  Image as ImageIcon,
  Scissors
} from 'lucide-react'

interface ImageEditorProProps {
  onImageSelect?: (file: File) => void
  onImageCrop?: (croppedImage: string) => void
  initialImage?: string
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageEditorPro({ onImageSelect, onImageCrop, initialImage }: ImageEditorProProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [cropMode, setCropMode] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImage(result)
      setOriginalImage(result)
      onImageSelect?.(file)
    }
    reader.readAsDataURL(file)
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImage(result)
        setOriginalImage(result)
        onImageSelect?.(file)
      }
      reader.readAsDataURL(file)
    }
  }

  // Apply filters to canvas
  const applyFilters = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Apply transformations
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom, zoom)

      // Apply filters
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
      `

      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      ctx.restore()
    }
    img.src = image
  }

  useEffect(() => {
    applyFilters()
  }, [image, rotation, zoom, brightness, contrast, saturation])

  // Reset all adjustments
  const resetAdjustments = () => {
    setRotation(0)
    setZoom(1)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setImage(originalImage)
  }

  // Apply current edits
  const applyEdits = () => {
    if (!canvasRef.current) return
    const editedImage = canvasRef.current.toDataURL('image/png')
    setImage(editedImage)
    setOriginalImage(editedImage)
    onImageCrop?.(editedImage)
  }

  // Download edited image
  const downloadImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `edited-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  // Crop presets
  const cropPresets = [
    { name: 'Square', ratio: 1 },
    { name: '4:3', ratio: 4/3 },
    { name: '16:9', ratio: 16/9 },
    { name: '3:2', ratio: 3/2 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload & Controls */}
      <div className="lg:col-span-1 space-y-4">
        {/* Upload Area */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Image
          </h3>

          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Change Image
              </button>
              <button
                onClick={() => {
                  setImage(null)
                  setOriginalImage(null)
                }}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Remove Image
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Adjustments */}
        {image && (
          <>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Adjustments
              </h3>

              <div className="space-y-4">
                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      Rotation
                    </span>
                    <span className="text-gray-500">{rotation}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex gap-1 mt-2">
                    {[0, 90, 180, 270].map(deg => (
                      <button
                        key={deg}
                        onClick={() => setRotation(deg)}
                        className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ZoomIn className="w-4 h-4" />
                      Zoom
                    </span>
                    <span className="text-gray-500">{Math.round(zoom * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Brightness */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Brightness</span>
                    <span className="text-gray-500">{brightness}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Contrast</span>
                    <span className="text-gray-500">{contrast}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Saturation</span>
                    <span className="text-gray-500">{saturation}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={resetAdjustments}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Reset
                </button>
                <button
                  onClick={applyEdits}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>

            {/* Crop Tool */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crop className="w-5 h-5 text-orange-600" />
                Crop Image
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setCropMode(!cropMode)}
                  className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${
                    cropMode
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  {cropMode ? 'Exit Crop Mode' : 'Enter Crop Mode'}
                </button>

                {cropMode && (
                  <>
                    <div className="text-xs text-gray-500 text-center">
                      Select a preset ratio or drag on the image
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {cropPresets.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            // Apply preset ratio
                            setCropArea({
                              x: 10,
                              y: 10,
                              width: 80,
                              height: 80 / preset.ratio
                            })
                          }}
                          className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={downloadImage}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border p-6 sticky top-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>

          {image ? (
            <div className="space-y-4">
              {/* Canvas Preview */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                <canvas
                  ref={canvasRef}
                  className="max-w-full mx-auto"
                  style={{ maxHeight: '600px' }}
                />

                {cropMode && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Scissors className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Crop Mode Active</p>
                      <p className="text-sm text-gray-300">Drag to select area</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500 mb-1">Rotation</div>
                  <div className="font-medium">{rotation}°</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500 mb-1">Zoom</div>
                  <div className="font-medium">{Math.round(zoom * 100)}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500 mb-1">Filters</div>
                  <div className="font-medium">
                    {brightness !== 100 || contrast !== 100 || saturation !== 100 ? 'Active' : 'None'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-3" />
                <p>No image selected</p>
                <p className="text-sm">Upload an image to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
