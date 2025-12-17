'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import ProductEditorPro from '@/components/admin/ProductEditorPro'
import BundleEditorPro from '@/components/admin/BundleEditorPro'
import ImageEditorPro from '@/components/admin/ImageEditorPro'
import GradientEditorPro from '@/components/admin/GradientEditorPro'
import PresetLibraryPro from '@/components/admin/PresetLibraryPro'
import CatalogLayoutBuilder from '@/components/admin/CatalogLayoutBuilder'

type EditorTab = 'products' | 'bundles' | 'images' | 'gradients' | 'presets' | 'layout'

export default function DesignStudioPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<EditorTab>('products')

  const tabs = [
    {
      id: 'products' as EditorTab,
      label: 'Product Editor',
      icon: Package,
      description: 'Edit product visuals and styling'
    },
    {
      id: 'bundles' as EditorTab,
      label: 'Bundle Editor',
      icon: Tag,
      description: 'Create and style bundles'
    },
    {
      id: 'images' as EditorTab,
      label: 'Image Tools',
      icon: ImageIcon,
      description: 'Crop and edit images'
    },
    {
      id: 'gradients' as EditorTab,
      label: 'Gradient Editor',
      icon: Palette,
      description: 'Create custom gradients'
    },
    {
      id: 'presets' as EditorTab,
      label: 'Preset Library',
      icon: Sparkles,
      description: 'Manage visual presets'
    },
    {
      id: 'layout' as EditorTab,
      label: 'Layout Builder',
      icon: Layout,
      description: 'Build catalog layout'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Design Studio</h1>
              <p className="text-purple-100 mt-1">
                Professional tools to create and manage your catalog visuals
              </p>
            </div>
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
        {/* Product Editor */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Product Editor Pro</h3>
              <p className="text-sm text-blue-700">
                Create and edit products with live preview. Choose from preset styles or create your own custom designs.
              </p>
            </div>
            <ProductEditorPro />
          </div>
        )}

        {/* Bundle Editor */}
        {activeTab === 'bundles' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Bundle Editor Pro</h3>
              <p className="text-sm text-green-700">
                Create attractive bundle deals with automatic pricing calculations and visual customization.
              </p>
            </div>
            <BundleEditorPro />
          </div>
        )}

        {/* Image Editor */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Image Editor Pro</h3>
              <p className="text-sm text-orange-700">
                Upload, crop, rotate, and adjust your product images with real-time preview.
              </p>
            </div>
            <ImageEditorPro />
          </div>
        )}

        {/* Gradient Editor */}
        {activeTab === 'gradients' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Gradient Editor Pro</h3>
              <p className="text-sm text-purple-700">
                Design custom gradients and see how they look on different card types in real-time.
              </p>
            </div>
            <GradientEditorPro />
          </div>
        )}

        {/* Preset Library */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-2">Visual Preset Library</h3>
              <p className="text-sm text-pink-700">
                Save and manage your favorite visual styles. Apply presets to products and bundles with one click.
              </p>
            </div>
            <PresetLibraryPro />
          </div>
        )}

        {/* Layout Builder */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">Catalog Layout Builder</h3>
              <p className="text-sm text-indigo-700">
                Design your catalog page structure by adding, ordering, and configuring sections.
              </p>
            </div>
            <CatalogLayoutBuilder />
          </div>
        )}
      </div>
    </div>
  )
}
