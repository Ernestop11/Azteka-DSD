'use client'

import { useState } from 'react'
import PresetGrid from './PresetGrid'

interface Preset {
  id: string
  name: string
  label?: string
  previewData?: {
    gradient?: { rgb: string; classes?: string }
    glow?: { classes: string }
    splash?: { overlayUrl: string }
  }
}

interface PresetSelectorProps {
  type: 'gradient' | 'glow' | 'splash'
  presets: Preset[]
  selectedId?: string | null
  onSelect: (id: string | null) => void
  title?: string
  description?: string
}

export default function PresetSelector({
  type,
  presets,
  selectedId,
  onSelect,
  title,
  description,
}: PresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'seasonal'>('all')

  // Filter presets
  let filteredPresets = presets

  // Apply tab filter
  if (activeTab === 'popular') {
    // Sort by popularity if available, otherwise keep original order
    filteredPresets = [...presets].sort((a, b) => {
      // Placeholder - would use popularity score if available
      return 0
    })
  }

  // Apply search filter
  if (searchQuery) {
    filteredPresets = filteredPresets.filter((preset) => {
      const query = searchQuery.toLowerCase()
      const name = (preset.name || preset.label || '').toLowerCase()
      return name.includes(query)
    })
  }

  const columns = type === 'splash' ? 3 : 4

  return (
    <div className="space-y-4 relative z-20">
      {/* Header */}
      <div>
        {title && (
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
        )}
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${type} presets...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'popular'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seasonal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'seasonal'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Seasonal
          </button>
        </div>
      </div>

      {/* Preset Grid */}
      <PresetGrid
        type={type}
        presets={filteredPresets}
        selectedId={selectedId}
        onSelect={onSelect}
        columns={columns}
        searchQuery={searchQuery}
        size="md"
        showLabels={true}
      />

      {/* Clear Selection */}
      {selectedId && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Clear selection
        </button>
      )}
    </div>
  )
}

