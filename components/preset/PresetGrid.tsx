'use client'

import { useState, useRef, useEffect } from 'react'
import PresetOption from './PresetOption'
import { handleGridKeyNavigation } from '@/lib/cards/presetPickerAccessibility'

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

interface PresetGridProps {
  type: 'gradient' | 'glow' | 'splash'
  presets: Preset[]
  selectedId?: string | null
  onSelect: (id: string) => void
  columns?: number
  searchQuery?: string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

export default function PresetGrid({
  type,
  presets,
  selectedId,
  onSelect,
  columns = 4,
  searchQuery = '',
  size = 'md',
  showLabels = true,
}: PresetGridProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter presets by search query
  const filteredPresets = presets.filter((preset) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const name = (preset.name || preset.label || '').toLowerCase()
    return name.includes(query)
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const result = handleGridKeyNavigation(
      e,
      {
        columns,
        totalItems: filteredPresets.length,
        currentIndex: focusedIndex,
        onNavigate: (newIndex) => {
          setFocusedIndex(newIndex)
          if (containerRef.current) {
            const swatches = containerRef.current.querySelectorAll('[data-preset-index]')
            const targetSwatch = swatches[newIndex] as HTMLElement
            if (targetSwatch) {
              targetSwatch.focus()
            }
          }
        },
        onSelect: (idx) => {
          if (filteredPresets[idx]) {
            onSelect(filteredPresets[idx].id)
          }
        },
        wrapAround: true,
      }
    )
  }

  if (filteredPresets.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-sm">No presets found matching "{searchQuery}"</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={`${type} presets`}
      onKeyDown={handleKeyDown}
      className={`grid gap-3 md:gap-4 relative z-20`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      <div className="col-span-full overflow-y-auto max-h-[360px] pr-2 -mr-2">
        <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {filteredPresets.map((preset, index) => (
            <PresetOption
              key={preset.id}
              type={type}
              id={preset.id}
              name={preset.name || preset.label || preset.id}
              index={index}
              totalCount={filteredPresets.length}
              isSelected={selectedId === preset.id}
              isFocused={focusedIndex === index}
              showLabel={showLabels}
              size={size}
              onSelect={onSelect}
              onFocus={setFocusedIndex}
              previewData={preset.previewData}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

