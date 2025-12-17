'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Trash2,
  Edit2,
  Copy,
  Star,
  StarOff,
  Palette,
  Sparkles,
  Eye,
  Download,
  Upload,
  Search
} from 'lucide-react'

interface VisualPreset {
  id: string
  name: string
  type: 'product' | 'bundle' | 'hero' | 'promo'
  backgroundColor?: string
  backgroundGradient?: string
  textColor?: string
  badgeColor?: string
  badgeText?: string
  glossLevel?: 'none' | 'soft' | 'premium'
  sparkle?: boolean
  borderRadius?: number
  shadow?: string
  favorite?: boolean
  createdAt: string
  updatedAt: string
}

const DEFAULT_PRESETS: VisualPreset[] = [
  {
    id: 'preset-ocean',
    name: 'Ocean Blue',
    type: 'product',
    backgroundColor: '#0ea5e9',
    backgroundGradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    textColor: '#ffffff',
    badgeColor: '#fbbf24',
    badgeText: 'NEW',
    glossLevel: 'premium',
    sparkle: true,
    borderRadius: 12,
    shadow: '0 10px 30px rgba(14, 165, 233, 0.3)',
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'preset-sunset',
    name: 'Sunset Glow',
    type: 'bundle',
    backgroundColor: '#f5576c',
    backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    badgeColor: '#fbbf24',
    badgeText: 'HOT',
    glossLevel: 'soft',
    sparkle: false,
    borderRadius: 16,
    shadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'preset-forest',
    name: 'Fresh Forest',
    type: 'product',
    backgroundColor: '#71b280',
    backgroundGradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff',
    badgeColor: '#a3e635',
    badgeText: 'ORGANIC',
    glossLevel: 'soft',
    sparkle: false,
    borderRadius: 8,
    shadow: '0 8px 20px rgba(113, 178, 128, 0.3)',
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'preset-fire',
    name: 'Hot Fire',
    type: 'promo',
    backgroundColor: '#ea580c',
    backgroundGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: '#ffffff',
    badgeColor: '#dc2626',
    badgeText: 'SALE',
    glossLevel: 'premium',
    sparkle: true,
    borderRadius: 20,
    shadow: '0 15px 40px rgba(234, 88, 12, 0.4)',
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

interface PresetLibraryProProps {
  onSelectPreset?: (preset: VisualPreset) => void
  onSavePreset?: (preset: VisualPreset) => Promise<void>
  onDeletePreset?: (id: string) => Promise<void>
}

export default function PresetLibraryPro({
  onSelectPreset,
  onSavePreset,
  onDeletePreset
}: PresetLibraryProProps) {
  const [presets, setPresets] = useState<VisualPreset[]>(DEFAULT_PRESETS)
  const [filteredPresets, setFilteredPresets] = useState<VisualPreset[]>(DEFAULT_PRESETS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'product' | 'bundle' | 'hero' | 'promo'>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [editingPreset, setEditingPreset] = useState<VisualPreset | null>(null)
  const [previewPreset, setPreviewPreset] = useState<VisualPreset | null>(null)

  // Load presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('azteka-visual-presets')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPresets([...DEFAULT_PRESETS, ...parsed])
      } catch (e) {
        console.error('Failed to load presets:', e)
      }
    }
  }, [])

  // Filter presets
  useEffect(() => {
    let filtered = presets

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType)
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(p => p.favorite)
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.badgeText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPresets(filtered)
  }, [presets, filterType, showFavoritesOnly, searchQuery])

  // Save presets to localStorage
  const saveToLocalStorage = (updatedPresets: VisualPreset[]) => {
    const customPresets = updatedPresets.filter(p => !DEFAULT_PRESETS.find(d => d.id === p.id))
    localStorage.setItem('azteka-visual-presets', JSON.stringify(customPresets))
  }

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    const updated = presets.map(p =>
      p.id === id ? { ...p, favorite: !p.favorite } : p
    )
    setPresets(updated)
    saveToLocalStorage(updated)
  }

  // Delete preset
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return

    if (onDeletePreset) {
      await onDeletePreset(id)
    }

    const updated = presets.filter(p => p.id !== id)
    setPresets(updated)
    saveToLocalStorage(updated)
  }

  // Duplicate preset
  const duplicatePreset = (preset: VisualPreset) => {
    const duplicated: VisualPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      name: `${preset.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...presets, duplicated]
    setPresets(updated)
    saveToLocalStorage(updated)
  }

  // Export presets
  const exportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `azteka-presets-${Date.now()}.json`
    link.click()
  }

  // Import presets
  const importPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        const updated = [...presets, ...imported]
        setPresets(updated)
        saveToLocalStorage(updated)
        alert(`Imported ${imported.length} presets successfully!`)
      } catch (error) {
        alert('Failed to import presets. Invalid file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-600" />
            Preset Library
          </h2>
          <div className="flex gap-2">
            <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importPresets}
                className="hidden"
              />
            </label>
            <button
              onClick={exportPresets}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({presets.length})
            </button>
            <button
              onClick={() => setFilterType('product')}
              className={`px-4 py-2 rounded ${
                filterType === 'product'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Products ({presets.filter(p => p.type === 'product').length})
            </button>
            <button
              onClick={() => setFilterType('bundle')}
              className={`px-4 py-2 rounded ${
                filterType === 'bundle'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bundles ({presets.filter(p => p.type === 'bundle').length})
            </button>
            <button
              onClick={() => setFilterType('hero')}
              className={`px-4 py-2 rounded ${
                filterType === 'hero'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Heroes ({presets.filter(p => p.type === 'hero').length})
            </button>
            <button
              onClick={() => setFilterType('promo')}
              className={`px-4 py-2 rounded ${
                filterType === 'promo'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Promos ({presets.filter(p => p.type === 'promo').length})
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <div key={preset.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Preview */}
            <div
              className="relative h-48 p-6 flex flex-col justify-between"
              style={{
                background: preset.backgroundGradient || preset.backgroundColor,
                borderRadius: `${preset.borderRadius}px ${preset.borderRadius}px 0 0`,
                boxShadow: preset.shadow
              }}
            >
              {preset.sparkle && (
                <Sparkles className="absolute top-2 right-2 w-5 h-5 text-yellow-300 animate-pulse" />
              )}

              <div>
                {preset.badgeText && (
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                    style={{
                      backgroundColor: preset.badgeColor,
                      color: '#fff'
                    }}
                  >
                    {preset.badgeText}
                  </div>
                )}
                <h3
                  className="font-bold text-xl drop-shadow-lg"
                  style={{ color: preset.textColor }}
                >
                  Sample Text
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="font-bold text-2xl drop-shadow-lg"
                  style={{ color: preset.textColor }}
                >
                  $19.99
                </div>
                {preset.glossLevel !== 'none' && (
                  <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
                    {preset.glossLevel}
                  </div>
                )}
              </div>
            </div>

            {/* Info & Actions */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{preset.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{preset.type}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(preset.id)}
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  {preset.favorite ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectPreset?.(preset)}
                  className="flex-1 py-2 px-3 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Use
                </button>
                <button
                  onClick={() => duplicatePreset(preset)}
                  className="py-2 px-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPreset(preset)}
                  className="py-2 px-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!DEFAULT_PRESETS.find(d => d.id === preset.id) && (
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="py-2 px-3 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPresets.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No presets found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first preset to get started'}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Library Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{presets.length}</div>
            <div className="text-sm text-gray-500">Total Presets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {presets.filter(p => p.favorite).length}
            </div>
            <div className="text-sm text-gray-500">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {presets.filter(p => !DEFAULT_PRESETS.find(d => d.id === p.id)).length}
            </div>
            <div className="text-sm text-gray-500">Custom</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {DEFAULT_PRESETS.length}
            </div>
            <div className="text-sm text-gray-500">Built-in</div>
          </div>
        </div>
      </div>
    </div>
  )
}
