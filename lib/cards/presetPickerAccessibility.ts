/**
 * Preset Picker - Accessibility Helpers
 *
 * WCAG 2.1 AA compliant keyboard navigation and ARIA utilities
 * for preset picker components.
 *
 * Supports:
 * - Arrow key navigation (2D grid)
 * - Enter/Space selection
 * - Escape to cancel
 * - Tab focus management
 * - Screen reader announcements
 */

import type { KeyboardEvent, RefObject } from 'react';

// ============================================================================
// KEYBOARD NAVIGATION TYPES
// ============================================================================

export interface GridNavigationConfig {
  columns: number;
  totalItems: number;
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  onSelect?: (index: number) => void;
  onCancel?: () => void;
  wrapAround?: boolean;
}

export interface KeyboardNavigationResult {
  handled: boolean;
  newIndex?: number;
  action?: 'navigate' | 'select' | 'cancel';
}

// ============================================================================
// 2D GRID NAVIGATION
// ============================================================================

/**
 * Handles keyboard navigation in a 2D grid of presets
 *
 * Supports:
 * - Arrow keys: Navigate grid
 * - Enter/Space: Select preset
 * - Escape: Cancel/close picker
 * - Home/End: Jump to first/last
 *
 * @param event - Keyboard event
 * @param config - Grid navigation configuration
 * @returns Navigation result with new index
 */
export function handleGridKeyNavigation(
  event: KeyboardEvent,
  config: GridNavigationConfig
): KeyboardNavigationResult {
  const { columns, totalItems, currentIndex, onNavigate, onSelect, onCancel, wrapAround = true } =
    config;

  const rows = Math.ceil(totalItems / columns);

  let newIndex = currentIndex;
  let handled = true;
  let action: 'navigate' | 'select' | 'cancel' | undefined;

  switch (event.key) {
    case 'ArrowRight': {
      newIndex = currentIndex + 1;
      if (newIndex >= totalItems) {
        newIndex = wrapAround ? 0 : currentIndex;
      }
      action = 'navigate';
      break;
    }

    case 'ArrowLeft': {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = wrapAround ? totalItems - 1 : 0;
      }
      action = 'navigate';
      break;
    }

    case 'ArrowDown': {
      newIndex = currentIndex + columns;
      if (newIndex >= totalItems) {
        if (wrapAround) {
          newIndex = currentIndex % columns; // Wrap to top of same column
        } else {
          newIndex = currentIndex; // Stay in place
        }
      }
      action = 'navigate';
      break;
    }

    case 'ArrowUp': {
      newIndex = currentIndex - columns;
      if (newIndex < 0) {
        if (wrapAround) {
          // Wrap to bottom of same column
          const column = currentIndex % columns;
          newIndex = (rows - 1) * columns + column;
          if (newIndex >= totalItems) {
            newIndex = totalItems - 1;
          }
        } else {
          newIndex = currentIndex; // Stay in place
        }
      }
      action = 'navigate';
      break;
    }

    case 'Home': {
      newIndex = 0;
      action = 'navigate';
      break;
    }

    case 'End': {
      newIndex = totalItems - 1;
      action = 'navigate';
      break;
    }

    case 'Enter':
    case ' ': {
      if (onSelect) {
        onSelect(currentIndex);
        action = 'select';
      }
      break;
    }

    case 'Escape': {
      if (onCancel) {
        onCancel();
        action = 'cancel';
      }
      break;
    }

    default:
      handled = false;
  }

  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (action === 'navigate' && newIndex !== currentIndex) {
    onNavigate(newIndex);
  }

  return {
    handled,
    newIndex: action === 'navigate' ? newIndex : undefined,
    action,
  };
}

// ============================================================================
// LINEAR NAVIGATION (LIST MODE)
// ============================================================================

/**
 * Handles keyboard navigation in a linear list of presets
 * (for dropdown or vertical list layouts)
 */
export function handleListKeyNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void,
  onSelect?: (index: number) => void,
  onCancel?: () => void,
  wrapAround: boolean = true
): KeyboardNavigationResult {
  let newIndex = currentIndex;
  let handled = true;
  let action: 'navigate' | 'select' | 'cancel' | undefined;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight': {
      newIndex = currentIndex + 1;
      if (newIndex >= totalItems) {
        newIndex = wrapAround ? 0 : currentIndex;
      }
      action = 'navigate';
      break;
    }

    case 'ArrowUp':
    case 'ArrowLeft': {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = wrapAround ? totalItems - 1 : 0;
      }
      action = 'navigate';
      break;
    }

    case 'Home': {
      newIndex = 0;
      action = 'navigate';
      break;
    }

    case 'End': {
      newIndex = totalItems - 1;
      action = 'navigate';
      break;
    }

    case 'Enter':
    case ' ': {
      if (onSelect) {
        onSelect(currentIndex);
        action = 'select';
      }
      break;
    }

    case 'Escape': {
      if (onCancel) {
        onCancel();
        action = 'cancel';
      }
      break;
    }

    default:
      handled = false;
  }

  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (action === 'navigate' && newIndex !== currentIndex) {
    onNavigate(newIndex);
  }

  return {
    handled,
    newIndex: action === 'navigate' ? newIndex : undefined,
    action,
  };
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Moves focus to a specific preset swatch in the grid
 */
export function focusPresetSwatch(
  containerRef: RefObject<HTMLElement>,
  index: number
): boolean {
  if (!containerRef.current) return false;

  const swatches = containerRef.current.querySelectorAll('[data-preset-index]');
  const targetSwatch = swatches[index] as HTMLElement;

  if (targetSwatch) {
    targetSwatch.focus();
    return true;
  }

  return false;
}

/**
 * Returns roving tabindex value for grid item
 * Only one item should have tabindex="0", others should be "-1"
 */
export function getRovingTabIndex(index: number, focusedIndex: number): 0 | -1 {
  return index === focusedIndex ? 0 : -1;
}

// ============================================================================
// ARIA ATTRIBUTES
// ============================================================================

export interface PresetAriaProps {
  role: string;
  'aria-label': string;
  'aria-selected'?: boolean;
  'aria-describedby'?: string;
  'aria-posinset': number;
  'aria-setsize': number;
  tabIndex: 0 | -1;
}

/**
 * Generates ARIA attributes for a preset option
 *
 * @param params - Preset option parameters
 * @returns ARIA props object
 */
export function getPresetAriaProps(params: {
  type: 'gradient' | 'glow' | 'splash';
  id: string;
  label: string;
  index: number;
  total: number;
  isSelected: boolean;
  isFocused: boolean;
  descriptionId?: string;
}): PresetAriaProps {
  const { type, id, label, index, total, isSelected, isFocused, descriptionId } = params;

  return {
    role: 'option',
    'aria-label': `${label} ${type} preset`,
    'aria-selected': isSelected,
    'aria-describedby': descriptionId,
    'aria-posinset': index + 1,
    'aria-setsize': total,
    tabIndex: getRovingTabIndex(index, isFocused ? index : 0),
  };
}

/**
 * Generates ARIA attributes for preset picker container
 */
export function getPresetPickerAriaProps(params: {
  type: 'gradient' | 'glow' | 'splash';
  selectedId?: string;
  labelId?: string;
}): {
  role: string;
  'aria-labelledby'?: string;
  'aria-activedescendant'?: string;
} {
  const { type, selectedId, labelId } = params;

  return {
    role: 'listbox',
    'aria-labelledby': labelId,
    'aria-activedescendant': selectedId ? `preset-${type}-${selectedId}` : undefined,
  };
}

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

/**
 * Creates a live region announcement for screen readers
 *
 * @param message - Message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Find or create live region
  let liveRegion = document.getElementById('preset-picker-announcer');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'preset-picker-announcer';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only class
    document.body.appendChild(liveRegion);
  }

  // Update aria-live priority if needed
  liveRegion.setAttribute('aria-live', priority);

  // Clear and set new message (triggers announcement)
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Announces preset selection to screen readers
 */
export function announcePresetSelection(
  type: 'gradient' | 'glow' | 'splash',
  label: string,
  description?: string
): void {
  const message = description
    ? `${label} ${type} preset selected. ${description}`
    : `${label} ${type} preset selected`;

  announceToScreenReader(message, 'polite');
}

/**
 * Announces navigation position in preset grid
 */
export function announceGridPosition(
  label: string,
  position: number,
  total: number
): void {
  announceToScreenReader(`${label}. ${position} of ${total}`, 'polite');
}

// ============================================================================
// KEYBOARD SHORTCUTS INFO
// ============================================================================

export interface KeyboardShortcut {
  key: string;
  description: string;
}

/**
 * Returns list of keyboard shortcuts for preset picker
 */
export function getPresetPickerKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    { key: 'Arrow Keys', description: 'Navigate through presets' },
    { key: 'Enter or Space', description: 'Select highlighted preset' },
    { key: 'Escape', description: 'Cancel and close picker' },
    { key: 'Home', description: 'Jump to first preset' },
    { key: 'End', description: 'Jump to last preset' },
    { key: 'Tab', description: 'Move to next section' },
  ];
}

// ============================================================================
// FOCUS TRAP (for modal pickers)
// ============================================================================

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(selectors));
}

/**
 * Traps focus within a container (for modal preset pickers)
 */
export function handleFocusTrap(
  event: KeyboardEvent,
  containerRef: RefObject<HTMLElement>
): void {
  if (event.key !== 'Tab' || !containerRef.current) return;

  const focusableElements = getFocusableElements(containerRef.current);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

// ============================================================================
// UTILITY HOOKS HELPERS
// ============================================================================

/**
 * Returns event handlers for grid navigation
 * (use in custom hooks)
 */
export function createGridNavigationHandlers(config: GridNavigationConfig) {
  return {
    onKeyDown: (event: KeyboardEvent) => handleGridKeyNavigation(event, config),
    onFocus: () => {
      // Announce current position when focused
      const { currentIndex, totalItems } = config;
      announceToScreenReader(`Preset ${currentIndex + 1} of ${totalItems}`, 'polite');
    },
  };
}

/**
 * Returns event handlers for list navigation
 */
export function createListNavigationHandlers(
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void,
  onSelect?: (index: number) => void,
  onCancel?: () => void
) {
  return {
    onKeyDown: (event: KeyboardEvent) =>
      handleListKeyNavigation(event, currentIndex, totalItems, onNavigate, onSelect, onCancel),
    onFocus: () => {
      announceToScreenReader(`Item ${currentIndex + 1} of ${totalItems}`, 'polite');
    },
  };
}
