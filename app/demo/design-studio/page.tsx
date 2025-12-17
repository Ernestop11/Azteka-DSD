'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Package,
  Image as ImageIcon,
  Palette,
  Layout,
  Sparkles,
  Tag
} from 'lucide-react'

// Import our professional editors
import GradientEditorPro from '@/components/admin/GradientEditorPro'
import ImageEditorPro from '@/components/admin/ImageEditorPro'
import PresetLibraryPro from '@/components/admin/PresetLibraryPro'

type EditorTab = 'gradients' | 'images' | 'presets'

export default function DesignStudioDemoPage() {
  const [activeTab, setActiveTab] = useState<EditorTab>('gradients')

  const tabs = [
    {
      id: 'gradients' as EditorTab,
      label: 'Gradient Editor',
      icon: Palette,
      description: 'Create custom gradients'
    },
    {
      id: 'images' as EditorTab,
      label: 'Image Tools',
      icon: ImageIcon,
      description: 'Crop and edit images'
    },
    {
      id: 'presets' as EditorTab,
      label: 'Preset Library',
      icon: Sparkles,
      description: 'Manage visual presets'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6">
            <div className="inline-block px-4 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold mb-4">
              🎨 DEMO MODE - No Database Required
            </div>
            <h1 className="text-3xl font-bold">Design Studio Demo</h1>
            <p className="text-purple-100 mt-1">
              Professional visual editing tools - Test all features without login!
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className={`text-xs ${activeTab === tab.id ? 'text-purple-500' : 'text-purple-200'}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Gradient Editor */}
        {activeTab === 'gradients' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">✨ Gradient Editor Pro</h3>
              <p className="text-sm text-purple-700">
                Design custom gradients and see how they look on different card types in real-time.
              </p>
            </div>
            <GradientEditorPro />
          </div>
        )}

        {/* Image Editor */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">📸 Image Editor Pro</h3>
              <p className="text-sm text-orange-700">
                Upload, crop, rotate, and adjust your product images with real-time preview.
              </p>
            </div>
            <ImageEditorPro />
          </div>
        )}

        {/* Preset Library */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-2">💎 Visual Preset Library</h3>
              <p className="text-sm text-pink-700">
                Save and manage your favorite visual styles. Apply presets to products and bundles with one click.
              </p>
            </div>
            <PresetLibraryPro />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 How to Use This Demo</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-purple-600 mb-2">Gradient Editor</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choose linear or radial gradients</li>
                <li>• Add/remove color stops</li>
                <li>• Adjust angle (0-360°)</li>
                <li>• Preview on cards in real-time</li>
                <li>• Copy CSS or save preset</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">Image Tools</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Drag & drop to upload</li>
                <li>• Rotate, zoom, adjust filters</li>
                <li>• Crop with preset ratios</li>
                <li>• Live canvas preview</li>
                <li>• Download edited image</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-pink-600 mb-2">Preset Library</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Browse built-in presets</li>
                <li>• Filter by type</li>
                <li>• Favorite presets</li>
                <li>• Duplicate to customize</li>
                <li>• Export/import as JSON</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Note:</strong> This demo showcases the visual editing tools. The Product Editor, Bundle Editor, and Layout Builder
              require database access and are available at <code className="bg-white px-2 py-1 rounded">/admin/design-studio</code>
              (requires refresh after middleware update).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
