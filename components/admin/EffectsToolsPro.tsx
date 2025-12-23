'use client'

import { useState, useRef } from 'react'
import { LottieBadge, SparkleOverlay } from '@/components/ui/LottieBadge'
import { Upload, Sparkles, Wand2, ImagePlus, Loader2, Check, X, Zap, Star, Flame, Tag, Download } from 'lucide-react'

/**
 * Effects Tools Pro - Visual Enhancement Features
 *
 * Integrated into Design Studio:
 * 1. AI Background Removal (imgly)
 * 2. Image Enhancement (sharpen, color boost)
 * 3. Lottie Animation Badges
 * 4. Sparkle Effects
 */

export default function EffectsToolsPro() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setProcessedUrl(null)
      setResult(null)
      setError(null)
    }
  }

  const processImage = async (type: 'remove-bg' | 'enhance' | 'both') => {
    if (!selectedFile) return

    setProcessing(true)
    setProcessingType(type)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('id', 'test-visual-tools') // Use a test ID

      if (type === 'remove-bg' || type === 'both') {
        formData.append('removeBackground', 'true')
      }
      if (type === 'enhance' || type === 'both') {
        formData.append('enhance', 'true')
      }

      const response = await fetch('/api/employee/products/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Add cache buster to see new image
        setProcessedUrl(`${data.imageUrl}?t=${Date.now()}`)
        setResult(data)
      } else {
        setError(data.error || 'Processing failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process image')
    } finally {
      setProcessing(false)
      setProcessingType('')
    }
  }

  const downloadProcessedImage = () => {
    if (processedUrl) {
      const link = document.createElement('a')
      link.href = processedUrl
      link.download = `processed-${Date.now()}.png`
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Image Processing */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Wand2 className="w-5 h-5 text-purple-600" />
              AI Image Processing
            </h2>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg mx-auto"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setProcessedUrl(null)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Click to upload an image</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Test AI background removal & enhancement
                  </p>
                </div>
              )}
            </div>

            {/* Processing Buttons */}
            {selectedFile && (
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => processImage('remove-bg')}
                  disabled={processing}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {processing && processingType === 'remove-bg' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  AI Background Removal
                  <span className="text-xs bg-purple-800 px-2 py-0.5 rounded">imgly</span>
                </button>

                <button
                  onClick={() => processImage('enhance')}
                  disabled={processing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {processing && processingType === 'enhance' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  Enhance Image
                  <span className="text-xs bg-blue-800 px-2 py-0.5 rounded">sharpen + color</span>
                </button>

                <button
                  onClick={() => processImage('both')}
                  disabled={processing}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {processing && processingType === 'both' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  Remove BG + Enhance
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Result Display */}
            {processedUrl && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Processed Result:</h3>
                  <button
                    onClick={downloadProcessedImage}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <div className="bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] rounded-lg p-4">
                  <img
                    src={processedUrl}
                    alt="Processed"
                    className="max-h-64 mx-auto rounded"
                  />
                </div>
                {result && (
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      {result.usedAI ? (
                        <><Check className="w-4 h-4 text-green-500" /> AI Processing Used</>
                      ) : (
                        <><X className="w-4 h-4 text-yellow-500" /> Basic Processing (AI fallback)</>
                      )}
                    </p>
                    {result.enhanced && (
                      <p className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-500" /> Image Enhanced
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Lottie Animations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Star className="w-5 h-5 text-yellow-500" />
              Lottie Animation Badges
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Animated badges to make products stand out. Free, lightweight, no API costs.
            </p>

            {/* Badge Showcase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="flex justify-center mb-3">
                  <LottieBadge type="sale" size={60} />
                </div>
                <p className="text-sm font-medium text-gray-900">Sale Badge</p>
                <code className="text-xs text-gray-500">type="sale"</code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="flex justify-center mb-3">
                  <LottieBadge type="new" size={60} />
                </div>
                <p className="text-sm font-medium text-gray-900">New Badge</p>
                <code className="text-xs text-gray-500">type="new"</code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="flex justify-center mb-3">
                  <LottieBadge type="hot" size={60} />
                </div>
                <p className="text-sm font-medium text-gray-900">Hot Badge</p>
                <code className="text-xs text-gray-500">type="hot"</code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="flex justify-center mb-3">
                  <LottieBadge type="trending" size={60} />
                </div>
                <p className="text-sm font-medium text-gray-900">Trending Badge</p>
                <code className="text-xs text-gray-500">type="trending"</code>
              </div>
            </div>

            {/* Product Card Demo */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Product Card Example:</h3>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 relative max-w-[200px] mx-auto shadow-lg">
                <SparkleOverlay size={40} position="top-right" />
                <div className="absolute top-2 left-2 z-10">
                  <LottieBadge type="sale" text="-20%" size={45} />
                </div>
                <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center shadow-inner">
                  <span className="text-gray-400 text-4xl">📦</span>
                </div>
                <h4 className="font-medium text-gray-900">Sample Product</h4>
                <p className="text-green-600 font-bold">$24.99</p>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Tag className="w-5 h-5 text-green-600" />
              How to Use
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-purple-600 mb-1">AI Background Removal</h3>
                <code className="block bg-gray-100 p-2 rounded text-xs overflow-x-auto text-gray-700 border">
                  {`formData.append('removeBackground', 'true')`}
                </code>
              </div>

              <div>
                <h3 className="font-medium text-blue-600 mb-1">Image Enhancement</h3>
                <code className="block bg-gray-100 p-2 rounded text-xs overflow-x-auto text-gray-700 border">
                  {`formData.append('enhance', 'true')`}
                </code>
              </div>

              <div>
                <h3 className="font-medium text-yellow-600 mb-1">Lottie Badges</h3>
                <code className="block bg-gray-100 p-2 rounded text-xs overflow-x-auto text-gray-700 whitespace-pre border">
{`import { LottieBadge } from '@/components/ui/LottieBadge'

<LottieBadge type="sale" text="-20%" size={50} />`}
                </code>
              </div>

              <div>
                <h3 className="font-medium text-pink-600 mb-1">Sparkle Overlay</h3>
                <code className="block bg-gray-100 p-2 rounded text-xs overflow-x-auto text-gray-700 whitespace-pre border">
{`import { SparkleOverlay } from '@/components/ui/LottieBadge'

<div className="relative">
  <SparkleOverlay position="top-right" size={40} />
  <img src="..." />
</div>`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-200">
        <p>All tools are free and open source. No API costs or subscriptions required.</p>
        <p className="mt-1">
          Powered by: <span className="text-purple-600">@imgly/background-removal-node</span> • <span className="text-yellow-600">lottie-react</span> • <span className="text-blue-600">sharp</span>
        </p>
      </div>
    </div>
  )
}
