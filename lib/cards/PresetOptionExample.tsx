/**
 * PresetOption Component - Example Implementation
 *
 * Example component showing how to use all the preset picker helpers.
 * This is a REFERENCE IMPLEMENTATION - copy and customize as needed.
 *
 * Features:
 * - Type-safe preview rendering
 * - Keyboard navigation
 * - ARIA accessibility
 * - Selected/focused states
 * - Tooltips
 * - Loading states
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  getGradientPreviewStyle,
  getGlowPreviewShadow,
  getSplashPreviewSvg,
  getPresetMeta,
} from './presetPreviewHelpers';
import {
  getPresetAriaProps,
  announcePresetSelection,
  handleGridKeyNavigation,
} from './presetPickerAccessibility';
import {
  getPresetSwatchClasses,
  getCheckmarkOverlayClasses,
  getCheckmarkIconClasses,
  getPresetLabelClasses,
  getPresetBadgeClasses,
} from './presetPickerStyles';

// ============================================================================
// PRESET OPTION COMPONENT
// ============================================================================

export interface PresetOptionProps {
  type: 'gradient' | 'glow' | 'splash';
  id: string;
  index: number;
  totalCount: number;
  isSelected: boolean;
  isFocused: boolean;
  showLabel?: boolean;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onSelect: (id: string) => void;
  onFocus?: (index: number) => void;
}

export function PresetOption({
  type,
  id,
  index,
  totalCount,
  isSelected,
  isFocused,
  showLabel = true,
  showBadge = true,
  size = 'md',
  onSelect,
  onFocus,
}: PresetOptionProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const swatchRef = useRef<HTMLDivElement>(null);

  // Get preset metadata
  const meta = getPresetMeta(type, id);

  if (!meta) {
    console.warn(`Preset ${type}:${id} not found`);
    return null;
  }

  // Get ARIA props
  const ariaProps = getPresetAriaProps({
    type,
    id,
    label: meta.label,
    index,
    total: totalCount,
    isSelected,
    isFocused,
  });

  // Handle click
  const handleClick = () => {
    onSelect(id);
    announcePresetSelection(type, meta.label, meta.description);
  };

  // Handle keyboard
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Auto-focus when focused state changes
  useEffect(() => {
    if (isFocused && swatchRef.current) {
      swatchRef.current.focus();
    }
  }, [isFocused]);

  // Render preview based on type
  const renderPreview = () => {
    switch (type) {
      case 'gradient': {
        const style = getGradientPreviewStyle(id, size);
        return <div style={style || undefined} className="w-full h-full" />;
      }

      case 'glow': {
        const style = getGlowPreviewShadow(id, size);
        return <div style={style || undefined} className="w-full h-full" />;
      }

      case 'splash': {
        const svg = getSplashPreviewSvg(id);
        return (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svg || '' }}
          />
        );
      }

      default:
        return null;
    }
  };

  // Determine badge type
  const getBadgeType = (): 'popular' | 'premium' | 'new' | 'seasonal' | null => {
    if (!showBadge) return null;

    // Example logic - customize based on your metadata
    if (meta && typeof meta === 'object' && 'popularity' in meta) {
      const popularity = (meta as any).popularity;
      if (typeof popularity === 'number' && popularity >= 90) return 'popular';
    }
    if (meta && typeof meta === 'object' && 'premium' in meta) {
      const premium = (meta as any).premium;
      if (premium) return 'premium';
    }
    if (meta && typeof meta === 'object' && 'season' in meta) {
      const season = (meta as any).season;
      if (Array.isArray(season) && season.length > 0) return 'seasonal';
    }

    return null;
  };

  const badgeType = getBadgeType();

  return (
    <div
      ref={swatchRef}
      className={getPresetSwatchClasses({
        selected: isSelected,
        focused: isFocused,
        size,
      })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => onFocus?.(index)}
      data-preset-id={id}
      data-preset-index={index}
      {...ariaProps}
    >
      {/* Preview */}
      {renderPreview()}

      {/* Badge */}
      {badgeType && (
        <div className={getPresetBadgeClasses(badgeType)}>
          {badgeType === 'popular' && '🔥'}
          {badgeType === 'premium' && '⭐'}
          {badgeType === 'new' && 'NEW'}
          {badgeType === 'seasonal' && '🎉'}
        </div>
      )}

      {/* Checkmark overlay for selected state */}
      {isSelected && (
        <div className={getCheckmarkOverlayClasses(true)}>
          <svg
            className={getCheckmarkIconClasses()}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <div
          className={getPresetLabelClasses({
            selected: isSelected,
            position: 'bottom',
            size: size === 'sm' ? 'sm' : 'md',
          })}
        >
          {meta.label}
        </div>
      )}

      {/* Tooltip (optional) */}
      {showTooltip && !isSelected && (
        <div
          className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
          role="tooltip"
        >
          {meta.description}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 bottom-[-4px] left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PRESET GRID COMPONENT (EXAMPLE)
// ============================================================================

export interface PresetGridProps {
  type: 'gradient' | 'glow' | 'splash';
  presetIds: string[];
  selectedId?: string;
  onSelect: (id: string) => void;
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showBadges?: boolean;
}

export function PresetGrid({
  type,
  presetIds,
  selectedId,
  onSelect,
  columns = 4,
  size = 'md',
  showLabels = true,
  showBadges = true,
}: PresetGridProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    handleGridKeyNavigation(event, {
      columns,
      totalItems: presetIds.length,
      currentIndex: focusedIndex,
      onNavigate: (newIndex) => setFocusedIndex(newIndex),
      onSelect: (index) => onSelect(presetIds[index]),
      wrapAround: true,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-${columns} gap-4 p-4`}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label={`${type} preset picker`}
    >
      {presetIds.map((id, index) => (
        <PresetOption
          key={id}
          type={type}
          id={id}
          index={index}
          totalCount={presetIds.length}
          isSelected={selectedId === id}
          isFocused={focusedIndex === index}
          showLabel={showLabels}
          showBadge={showBadges}
          size={size}
          onSelect={onSelect}
          onFocus={setFocusedIndex}
        />
      ))}
    </div>
  );
}

// ============================================================================
// COMPACT PRESET SELECTOR (DROPDOWN STYLE)
// ============================================================================

export interface CompactPresetSelectorProps {
  type: 'gradient' | 'glow' | 'splash';
  presetIds: string[];
  selectedId?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}

export function CompactPresetSelector({
  type,
  presetIds,
  selectedId,
  onSelect,
  placeholder = 'Select a preset',
}: CompactPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const selectedMeta = selectedId ? getPresetMeta(type, selectedId) : null;

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {selectedMeta ? (
          <>
            {/* Preview thumbnail */}
            <div className="flex-shrink-0">
              {type === 'gradient' && (
                <div
                  style={getGradientPreviewStyle(selectedId!, 'sm') || undefined}
                  className="w-8 h-8 rounded"
                />
              )}
              {type === 'glow' && (
                <div
                  style={getGlowPreviewShadow(selectedId!, 'sm') || undefined}
                  className="w-8 h-8 rounded"
                />
              )}
              {type === 'splash' && (
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{
                    __html: getSplashPreviewSvg(selectedId!) || '',
                  }}
                />
              )}
            </div>
            <span className="flex-1 text-left font-medium">{selectedMeta.label}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-gray-500">{placeholder}</span>
        )}

        {/* Dropdown arrow */}
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
          <PresetGrid
            type={type}
            presetIds={presetIds}
            selectedId={selectedId}
            onSelect={handleSelect}
            columns={3}
            size="sm"
            showLabels={true}
            showBadges={false}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Grid layout
<PresetGrid
  type="gradient"
  presetIds={['candy-dream', 'mint-grove', 'ocean-breeze', 'rose-garden']}
  selectedId={selectedGradient}
  onSelect={setSelectedGradient}
  columns={4}
  size="md"
  showLabels={true}
  showBadges={true}
/>

// Example 2: Compact dropdown
<CompactPresetSelector
  type="glow"
  presetIds={['citrus-pop', 'cool-blue', 'sugar-rush']}
  selectedId={selectedGlow}
  onSelect={setSelectedGlow}
  placeholder="Choose a glow effect"
/>

// Example 3: Custom single preset
<PresetOption
  type="splash"
  id="paleta-drip"
  index={0}
  totalCount={1}
  isSelected={selectedSplash === 'paleta-drip'}
  isFocused={false}
  size="lg"
  onSelect={setSelectedSplash}
/>
*/
