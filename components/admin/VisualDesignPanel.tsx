'use client'

import { useState } from 'react'
import PresetSelector from '@/components/preset/PresetSelector'
import ProductCard from '@/components/catalog/ProductCard'

interface VisualDesignPanelProps {
  formData: {
    gradientPresetId?: string | null
    glowPresetId?: string | null
    splashPresetId?: string | null
    featured?: boolean
    seasonal?: boolean
    trending?: boolean
    backgroundColor?: string | null
    backgroundGradient?: string | null
    // Product data for preview
    id?: string
    name?: string
    sku?: string
    price?: number | string
    unitsPerCase?: number
    imageUrl?: string | null
    description?: string | null
    category?: { id: string; name: string } | null
    brand?: { id: string; name: string } | null
  }
  presets: {
    gradients: Array<{ id: string; name: string; rgb?: string; classes?: string }>
    splashes: Array<{ id: string; label: string; overlayUrl?: string }>
    glows: Array<{ id: string; label: string; classes?: string }>
  }
  onUpdate: (updates: Partial<VisualDesignPanelProps['formData']>) => void
}

export default function VisualDesignPanel({
  formData,
  presets,
  onUpdate,
}: VisualDesignPanelProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [activeTab, setActiveTab] = useState<'gradient' | 'glow' | 'splash'>('gradient')

  // Validate presets data
  if (!presets || (!presets.gradients && !presets.glows && !presets.splashes)) {
    console.warn('[VisualDesignPanel] Invalid or empty presets:', presets)
  }

  // Prepare preset data for selectors with defensive checks
  const gradientPresets = (presets?.gradients || []).map((g: any) => ({
    id: g.id || 'unknown',
    name: g.name || g.label || g.id || 'Unknown',
    previewData: {
      gradient: {
        rgb: g.rgb || g.classes || '',
        classes: g.classes || '',
      },
    },
  }))

  const glowPresets = (presets?.glows || []).map((g: any) => ({
    id: g.id || 'unknown',
    name: g.label || g.name || g.id || 'Unknown',
    previewData: {
      glow: {
        classes: g.classes || '',
      },
    },
  }))

  const splashPresets = (presets?.splashes || []).map((s: any) => ({
    id: s.id || 'unknown',
    name: s.label || s.name || s.id || 'Unknown',
    previewData: {
      splash: {
        overlayUrl: s.overlayUrl || s.overlay_url || s.sampleOverlay || '',
      },
    },
  }))

  // Debug: Log preset counts
  console.log('[VisualDesignPanel] Presets:', {
    gradients: gradientPresets.length,
    glows: glowPresets.length,
    splashes: splashPresets.length,
    sampleGradient: gradientPresets[0],
  })

  // Build preview product
  const previewProduct = {
    id: formData.id || 'preview',
    name: formData.name || 'Product Preview',
    sku: formData.sku || 'PREVIEW-001',
    description: formData.description || null,
    price: formData.price || 24.99,
    unitsPerCase: formData.unitsPerCase || 24,
    imageUrl: formData.imageUrl || null,
    backgroundColor: formData.backgroundColor || null,
    backgroundGradient: formData.backgroundGradient || null,
    featured: formData.featured || false,
    seasonal: formData.seasonal || false,
    trending: formData.trending || false,
    category: formData.category || null,
    brand: formData.brand || null,
    gradientPresetId: formData.gradientPresetId || null,
    glowPresetId: formData.glowPresetId || null,
    splashPresetId: formData.splashPresetId || null,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visual Design</h3>
          <p className="text-sm text-gray-500">
            Customize the visual appearance of this product card
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              mode === 'preset'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              mode === 'custom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Live Preview - Sticky with proper z-index */}
      <div className="lg:sticky lg:top-4 p-4 bg-gray-50 rounded-lg border border-gray-200 relative z-0">
        <div className="text-sm font-medium text-gray-700 mb-3">Live Preview</div>
        <div className="max-w-sm mx-auto lg:max-w-full">
          <ProductCard product={previewProduct} index={0} mode="preview" />
        </div>
      </div>

      {/* Preset Mode */}
      {mode === 'preset' && (
        <div className="space-y-6 relative">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('gradient')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'gradient'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Gradient
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('glow')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'glow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Glow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('splash')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'splash'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Splash
            </button>
          </div>

          {/* Preset Selectors - Wrapped in container with proper z-index */}
          <div className="relative z-10">
            {activeTab === 'gradient' && (
              <>
                {gradientPresets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No gradient presets available</p>
                    <p className="text-xs text-gray-400 mt-1">Check console for preset loading status</p>
                  </div>
                ) : (
                  <PresetSelector
                    type="gradient"
                    presets={gradientPresets}
                    selectedId={formData.gradientPresetId}
                    onSelect={(id) => {
                      onUpdate({
                        gradientPresetId: id,
                        backgroundGradient: null, // Clear custom gradient when preset selected
                        backgroundColor: null, // Clear custom color
                      })
                    }}
                    title="Gradient Preset"
                    description="Choose a gradient background preset"
                  />
                )}
              </>
            )}

            {activeTab === 'glow' && (
              <>
                {glowPresets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No glow presets available</p>
                    <p className="text-xs text-gray-400 mt-1">Check console for preset loading status</p>
                  </div>
                ) : (
                  <PresetSelector
                    type="glow"
                    presets={glowPresets}
                    selectedId={formData.glowPresetId}
                    onSelect={(id) => onUpdate({ glowPresetId: id })}
                    title="Glow Preset"
                    description="Add a glow effect to the card"
                  />
                )}
              </>
            )}

            {activeTab === 'splash' && (
              <>
                {splashPresets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No splash presets available</p>
                    <p className="text-xs text-gray-400 mt-1">Check console for preset loading status</p>
                  </div>
                ) : (
                  <PresetSelector
                    type="splash"
                    presets={splashPresets}
                    selectedId={formData.splashPresetId}
                    onSelect={(id) => onUpdate({ splashPresetId: id })}
                    title="Splash Overlay"
                    description="Add a decorative overlay effect"
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Mode */}
      {mode === 'custom' && (
        <div className="space-y-4">
          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColor || ''}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value || null })}
                placeholder="#FFFFFF"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Hex color code (e.g., #FF4444)
            </p>
          </div>

          {/* Custom Gradient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Gradient (CSS)
            </label>
            <textarea
              value={formData.backgroundGradient || ''}
              onChange={(e) => onUpdate({ backgroundGradient: e.target.value || null })}
              placeholder="linear-gradient(135deg, #FF0000 0%, #0000FF 100%)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">
              CSS gradient string (overrides color picker)
            </p>
          </div>

          {/* Custom Splash URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Splash Overlay URL
            </label>
            <input
              type="url"
              value={formData.splashPresetId || ''}
              onChange={(e) => onUpdate({ splashPresetId: e.target.value || null })}
              placeholder="/overlays/custom-splash.png"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL to custom overlay image (PNG with transparency)
            </p>
          </div>
        </div>
      )}

      {/* Enhancement Flags */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Enhancement Flags</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => onUpdate({ featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Featured Product</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.seasonal || false}
              onChange={(e) => onUpdate({ seasonal: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Seasonal</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.trending || false}
              onChange={(e) => onUpdate({ trending: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Trending</span>
          </label>
        </div>
      </div>
    </div>
  )
}

