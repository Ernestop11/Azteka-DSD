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

interface CompactPresetSelectorProps {
  type: 'gradient' | 'glow' | 'splash'
  presets: Preset[]
  selectedId?: string | null
  onSelect: (id: string | null) => void
  limit?: number
}

export default function CompactPresetSelector({
  type,
  presets,
  selectedId,
  onSelect,
  limit = 8,
}: CompactPresetSelectorProps) {
  const [showAll, setShowAll] = useState(false)

  const displayedPresets = showAll ? presets : presets.slice(0, limit)
  const hasMore = presets.length > limit

  return (
    <div className="space-y-3">
      <PresetGrid
        type={type}
        presets={displayedPresets}
        selectedId={selectedId}
        onSelect={onSelect}
        columns={4}
        size="sm"
        showLabels={false}
      />

      {hasMore && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Show all {presets.length} presets
        </button>
      )}

      {showAll && hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Show less
        </button>
      )}

      {selectedId && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      )}
    </div>
  )
}

