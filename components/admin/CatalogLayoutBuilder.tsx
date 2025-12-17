'use client'

import { useState, useEffect } from 'react'
import {
  Layout,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Save,
  Copy,
  Grid,
  List,
  Image as ImageIcon,
  Star,
  Tag,
  Package,
  Sparkles,
  Settings
} from 'lucide-react'

interface LayoutSection {
  id: string
  type: 'hero' | 'brands' | 'categories' | 'products' | 'bundles' | 'promo' | 'custom'
  title: string
  visible: boolean
  order: number
  config: {
    layout?: 'grid' | 'carousel' | 'row'
    columns?: number
    itemsPerPage?: number
    showFilters?: boolean
    categoryId?: string
    brandId?: string
    featured?: boolean
    backgroundColor?: string
    backgroundGradient?: string
    height?: number
  }
}

const SECTION_TEMPLATES: { type: LayoutSection['type']; icon: any; label: string; defaultConfig: LayoutSection['config'] }[] = [
  {
    type: 'hero',
    icon: ImageIcon,
    label: 'Hero Banner',
    defaultConfig: {
      height: 400,
      layout: 'carousel',
      backgroundColor: '#667eea'
    }
  },
  {
    type: 'brands',
    icon: Star,
    label: 'Brand Showcase',
    defaultConfig: {
      layout: 'row',
      columns: 6,
      itemsPerPage: 12
    }
  },
  {
    type: 'categories',
    icon: Grid,
    label: 'Categories',
    defaultConfig: {
      layout: 'grid',
      columns: 4,
      itemsPerPage: 8
    }
  },
  {
    type: 'products',
    icon: Package,
    label: 'Product Grid',
    defaultConfig: {
      layout: 'grid',
      columns: 4,
      itemsPerPage: 12,
      showFilters: true
    }
  },
  {
    type: 'bundles',
    icon: Tag,
    label: 'Bundle Section',
    defaultConfig: {
      layout: 'carousel',
      columns: 3,
      featured: true
    }
  },
  {
    type: 'promo',
    icon: Sparkles,
    label: 'Promotional Banner',
    defaultConfig: {
      height: 200,
      backgroundColor: '#f5576c'
    }
  },
  {
    type: 'custom',
    icon: Settings,
    label: 'Custom Section',
    defaultConfig: {
      layout: 'grid',
      columns: 3
    }
  }
]

const DEFAULT_LAYOUT: LayoutSection[] = [
  {
    id: 'hero-1',
    type: 'hero',
    title: 'Main Hero Banner',
    visible: true,
    order: 0,
    config: {
      height: 400,
      layout: 'carousel',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  },
  {
    id: 'brands-1',
    type: 'brands',
    title: 'Featured Brands',
    visible: true,
    order: 1,
    config: {
      layout: 'row',
      columns: 6,
      itemsPerPage: 12
    }
  },
  {
    id: 'products-1',
    type: 'products',
    title: 'All Products',
    visible: true,
    order: 2,
    config: {
      layout: 'grid',
      columns: 4,
      itemsPerPage: 20,
      showFilters: true
    }
  },
  {
    id: 'bundles-1',
    type: 'bundles',
    title: 'Bundle Deals',
    visible: true,
    order: 3,
    config: {
      layout: 'carousel',
      columns: 3,
      featured: true
    }
  }
]

interface CatalogLayoutBuilderProps {
  onSave?: (layout: LayoutSection[]) => Promise<void>
  initialLayout?: LayoutSection[]
}

export default function CatalogLayoutBuilder({ onSave, initialLayout }: CatalogLayoutBuilderProps) {
  const [sections, setSections] = useState<LayoutSection[]>(initialLayout || DEFAULT_LAYOUT)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load layout from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('azteka-catalog-layout')
    if (saved && !initialLayout) {
      try {
        setSections(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load layout:', e)
      }
    }
  }, [])

  // Add new section
  const addSection = (type: LayoutSection['type']) => {
    const template = SECTION_TEMPLATES.find(t => t.type === type)
    if (!template) return

    const newSection: LayoutSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: `New ${template.label}`,
      visible: true,
      order: sections.length,
      config: template.defaultConfig
    }

    setSections([...sections, newSection])
    setHasChanges(true)
  }

  // Delete section
  const deleteSection = (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return
    setSections(sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })))
    setHasChanges(true)
  }

  // Move section
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return

    const newSections = [...sections]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    ;[newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]]

    newSections.forEach((s, i) => s.order = i)
    setSections(newSections)
    setHasChanges(true)
  }

  // Toggle visibility
  const toggleVisibility = (id: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    ))
    setHasChanges(true)
  }

  // Update section config
  const updateSection = (id: string, updates: Partial<LayoutSection>) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, ...updates } : s
    ))
    setHasChanges(true)
  }

  // Duplicate section
  const duplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id)
    if (!section) return

    const duplicate: LayoutSection = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      title: `${section.title} (Copy)`,
      order: sections.length
    }

    setSections([...sections, duplicate])
    setHasChanges(true)
  }

  // Save layout
  const handleSave = async () => {
    localStorage.setItem('azteka-catalog-layout', JSON.stringify(sections))
    if (onSave) {
      await onSave(sections)
    }
    setHasChanges(false)
    alert('Layout saved successfully!')
  }

  // Reset to default
  const resetToDefault = () => {
    if (!confirm('Reset to default layout? This will discard all changes.')) return
    setSections(DEFAULT_LAYOUT)
    setHasChanges(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sections List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Add Section
          </h3>

          <div className="space-y-2">
            {SECTION_TEMPLATES.map(template => (
              <button
                key={template.type}
                onClick={() => addSection(template.type)}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded flex items-center gap-3 text-left transition-colors"
              >
                <template.icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-sm">{template.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Layout
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            <button
              onClick={resetToDefault}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ You have unsaved changes
            </p>
          </div>
        )}
      </div>

      {/* Layout Builder */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="w-6 h-6 text-blue-600" />
              Catalog Layout
            </h2>
            <div className="text-sm text-gray-500">
              {sections.length} sections
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.sort((a, b) => a.order - b.order).map((section) => {
              const template = SECTION_TEMPLATES.find(t => t.type === section.type)
              const Icon = template?.icon || Settings
              const isEditing = editingSection === section.id

              return (
                <div
                  key={section.id}
                  className={`border rounded-lg overflow-hidden ${
                    !section.visible ? 'opacity-50' : ''
                  }`}
                >
                  {/* Section Header */}
                  <div className="bg-gray-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold">{section.title}</h3>
                        <p className="text-xs text-gray-500 capitalize">{section.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVisibility(section.id)}
                        className={`p-2 rounded ${
                          section.visible
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                        title={section.visible ? 'Hide' : 'Show'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={section.order === 0}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={section.order === sections.length - 1}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSection(isEditing ? null : section.id)}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateSection(section.id)}
                        className="p-2 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section Config (when editing) */}
                  {isEditing && (
                    <div className="p-4 bg-white border-t space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>

                      {/* Layout Type */}
                      {(section.type === 'products' || section.type === 'bundles' || section.type === 'categories' || section.type === 'brands') && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Layout</label>
                          <div className="flex gap-2">
                            {['grid', 'carousel', 'row'].map(layout => (
                              <button
                                key={layout}
                                onClick={() => updateSection(section.id, {
                                  config: { ...section.config, layout: layout as any }
                                })}
                                className={`flex-1 py-2 px-3 rounded capitalize ${
                                  section.config.layout === layout
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {layout}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Columns */}
                      {section.config.layout === 'grid' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Columns: {section.config.columns || 4}
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="6"
                            value={section.config.columns || 4}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, columns: parseInt(e.target.value) }
                            })}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Background Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={section.config.backgroundColor || '#ffffff'}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, backgroundColor: e.target.value }
                            })}
                            className="w-12 h-10 rounded border"
                          />
                          <input
                            type="text"
                            value={section.config.backgroundColor || '#ffffff'}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, backgroundColor: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border rounded font-mono text-sm"
                          />
                        </div>
                      </div>

                      {/* Height (for hero/promo) */}
                      {(section.type === 'hero' || section.type === 'promo') && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Height: {section.config.height || 300}px
                          </label>
                          <input
                            type="range"
                            min="100"
                            max="600"
                            step="50"
                            value={section.config.height || 300}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, height: parseInt(e.target.value) }
                            })}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Show Filters */}
                      {section.type === 'products' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`filters-${section.id}`}
                            checked={section.config.showFilters || false}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, showFilters: e.target.checked }
                            })}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`filters-${section.id}`} className="text-sm font-medium">
                            Show Filters
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview */}
                  {!isEditing && (
                    <div
                      className="p-8"
                      style={{
                        background: section.config.backgroundGradient || section.config.backgroundColor || '#f9fafb',
                        height: section.config.height ? `${section.config.height}px` : 'auto'
                      }}
                    >
                      <div className="text-center text-gray-500">
                        <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">
                          {section.type === 'hero' && 'Hero banner will appear here'}
                          {section.type === 'brands' && 'Brand logos will appear here'}
                          {section.type === 'categories' && 'Category cards will appear here'}
                          {section.type === 'products' && 'Product grid will appear here'}
                          {section.type === 'bundles' && 'Bundle cards will appear here'}
                          {section.type === 'promo' && 'Promotional content will appear here'}
                          {section.type === 'custom' && 'Custom content will appear here'}
                        </p>
                        <p className="text-xs mt-1">
                          Layout: {section.config.layout || 'default'}
                          {section.config.columns && ` • ${section.config.columns} columns`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {sections.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Layout className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No sections added yet</p>
                <p className="text-sm">Add sections from the left panel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
