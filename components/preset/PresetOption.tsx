'use client'

import { useState, useRef, useEffect } from 'react'
import { getPresetSwatchClasses, getCheckmarkOverlayClasses, getCheckmarkIconClasses, getPresetLabelClasses } from '@/lib/cards/presetPickerStyles'
import { getPresetAriaProps } from '@/lib/cards/presetPickerAccessibility'
import { getGradientPreviewStyle, getGlowPreviewShadow, getSplashPreviewSvg } from '@/lib/cards/presetPreviewHelpers'

interface PresetOptionProps {
  type: 'gradient' | 'glow' | 'splash'
  id: string
  name: string
  index: number
  totalCount: number
  isSelected: boolean
  isFocused: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  onSelect: (id: string) => void
  onFocus?: (index: number) => void
  previewData?: {
    gradient?: { rgb: string; classes?: string }
    glow?: { classes: string }
    splash?: { overlayUrl: string }
  }
}

export default function PresetOption({
  type,
  id,
  name,
  index,
  totalCount,
  isSelected,
  isFocused,
  showLabel = true,
  size = 'md',
  onSelect,
  onFocus,
  previewData,
}: PresetOptionProps) {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const ariaProps = getPresetAriaProps({
    type,
    id,
    label: name,
    index,
    total: totalCount,
    isSelected,
    isFocused,
  })

  // Get preview style based on type
  const getPreviewContent = () => {
    if (type === 'gradient') {
      if (previewData?.gradient?.rgb) {
        return (
          <div
            style={{ background: previewData.gradient.rgb }}
            className="w-full h-full rounded-lg"
          />
        )
      }
      const style = getGradientPreviewStyle(id, size)
      return style ? <div style={style} className="w-full h-full rounded-lg" /> : (
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-200 to-gray-300" />
      )
    }

    if (type === 'glow') {
      const style = previewData?.glow
        ? { boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }
        : getGlowPreviewShadow(id, size) || undefined
      return (
        <div
          style={style}
          className="w-full h-full rounded-lg bg-white border border-gray-200"
        />
      )
    }

    if (type === 'splash') {
      if (previewData?.splash?.overlayUrl) {
        return (
          <div
            className="w-full h-full rounded-lg bg-gray-100 bg-cover bg-center"
            style={{ backgroundImage: `url(${previewData.splash.overlayUrl})` }}
          />
        )
      }
      const svg = getSplashPreviewSvg(id)
      return svg ? (
        <div
          className="w-full h-full rounded-lg"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
          {name}
        </div>
      )
    }

    return null
  }

  const handleClick = () => {
    onSelect(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    } else if (e.key === 'ArrowRight' && onFocus) {
      e.preventDefault()
      onFocus(Math.min(index + 1, totalCount - 1))
    } else if (e.key === 'ArrowLeft' && onFocus) {
      e.preventDefault()
      onFocus(Math.max(index - 1, 0))
    }
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus(index)
    }
  }

  useEffect(() => {
    if (isFocused && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isFocused])

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={getPresetSwatchClasses({
          selected: isSelected,
          focused: isFocused,
          size,
        })}
        {...ariaProps}
        data-preset-index={index}
        data-preset-id={id}
        data-preset-type={type}
      >
        {/* Preview Content */}
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          {getPreviewContent()}

          {/* Checkmark Overlay */}
          {isSelected && (
            <div className={getCheckmarkOverlayClasses(true)}>
              <svg
                className={getCheckmarkIconClasses()}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* Hover Overlay */}
          {isHovered && !isSelected && (
            <div className="absolute inset-0 bg-black/5 rounded-lg transition-opacity duration-200" />
          )}
        </div>
      </button>

      {/* Label */}
      {showLabel && (
        <span className={getPresetLabelClasses({ selected: isSelected, size: 'sm' })}>
          {name}
        </span>
      )}
    </div>
  )
}

