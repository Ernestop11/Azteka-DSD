/**
 * Preset Picker - Tailwind State Classes
 *
 * Type-safe Tailwind class utilities for preset picker states:
 * - Selected/Unselected
 * - Focused/Unfocused
 * - Hover states
 * - Disabled states
 * - Loading states
 *
 * Usage with clsx/cn:
 * ```tsx
 * <div className={cn(getPresetSwatchClasses({ selected: true, focused: false }))} />
 * ```
 */

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface PresetSwatchState {
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'card';
}

// ============================================================================
// SWATCH BASE CLASSES
// ============================================================================

/**
 * Returns complete Tailwind classes for preset swatch based on state
 *
 * @param state - Swatch state configuration
 * @returns Tailwind class string
 */
export function getPresetSwatchClasses(state: PresetSwatchState): string {
  const {
    selected = false,
    focused = false,
    disabled = false,
    loading = false,
    size = 'md',
    variant = 'default',
  } = state;

  const baseClasses = [
    'relative',
    'cursor-pointer',
    'transition-all',
    'duration-200',
    'ease-in-out',
  ];

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12 rounded-md',
    md: 'w-20 h-20 rounded-lg',
    lg: 'w-28 h-28 rounded-xl',
  };

  // Variant classes
  const variantClasses = {
    default: '',
    compact: 'shadow-sm',
    card: 'shadow-md p-2',
  };

  // Border classes
  const borderClasses = selected
    ? 'ring-4 ring-blue-500 ring-offset-2'
    : 'ring-2 ring-gray-200 ring-offset-0';

  // Focus classes
  const focusClasses = focused
    ? 'ring-4 ring-blue-400 ring-offset-2 outline-none'
    : 'focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none';

  // Hover classes
  const hoverClasses = disabled
    ? ''
    : 'hover:scale-105 hover:shadow-lg hover:ring-gray-300';

  // Disabled classes
  const disabledClasses = disabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : '';

  // Loading classes
  const loadingClasses = loading ? 'animate-pulse' : '';

  return [
    ...baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    borderClasses,
    focusClasses,
    hoverClasses,
    disabledClasses,
    loadingClasses,
  ]
    .filter(Boolean)
    .join(' ');
}

// ============================================================================
// SELECTION STATE CLASSES
// ============================================================================

/**
 * Returns classes for selected state only
 */
export function getSelectedStateClasses(selected: boolean): string {
  return selected
    ? 'ring-4 ring-blue-500 ring-offset-2 shadow-lg scale-105'
    : 'ring-2 ring-gray-200 ring-offset-0';
}

/**
 * Returns classes for focus state only
 */
export function getFocusStateClasses(focused: boolean): string {
  return focused
    ? 'ring-4 ring-blue-400 ring-offset-2 outline-none'
    : 'focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none';
}

/**
 * Returns classes for hover state
 */
export function getHoverStateClasses(disabled: boolean = false): string {
  return disabled ? '' : 'hover:scale-105 hover:shadow-lg hover:ring-gray-300';
}

// ============================================================================
// CHECKMARK OVERLAY CLASSES
// ============================================================================

/**
 * Returns classes for checkmark overlay on selected preset
 */
export function getCheckmarkOverlayClasses(selected: boolean): string {
  const baseClasses = [
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'bg-blue-500/20',
    'backdrop-blur-sm',
    'rounded-lg',
    'transition-opacity',
    'duration-200',
  ];

  const visibilityClasses = selected ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return [...baseClasses, visibilityClasses].join(' ');
}

/**
 * Returns classes for checkmark icon
 */
export function getCheckmarkIconClasses(): string {
  return [
    'w-8',
    'h-8',
    'text-white',
    'drop-shadow-lg',
    'bg-blue-500',
    'rounded-full',
    'p-1',
  ].join(' ');
}

// ============================================================================
// LABEL CLASSES
// ============================================================================

export interface PresetLabelState {
  selected?: boolean;
  position?: 'top' | 'bottom' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Returns classes for preset label/caption
 */
export function getPresetLabelClasses(state: PresetLabelState): string {
  const { selected = false, position = 'bottom', size = 'md' } = state;

  const baseClasses = ['text-center', 'font-medium', 'transition-colors', 'duration-200'];

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Position classes
  const positionClasses = {
    top: 'mb-2',
    bottom: 'mt-2',
    overlay: 'absolute bottom-2 left-0 right-0 px-2 text-white drop-shadow-lg',
  };

  // Selected state classes
  const selectedClasses = selected ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return [
    ...baseClasses,
    sizeClasses[size],
    positionClasses[position],
    selectedClasses,
  ].join(' ');
}

// ============================================================================
// BADGE CLASSES
// ============================================================================

/**
 * Returns classes for preset badges (Popular, Premium, New, etc.)
 */
export function getPresetBadgeClasses(
  type: 'popular' | 'premium' | 'new' | 'seasonal'
): string {
  const baseClasses = [
    'absolute',
    'top-1',
    'right-1',
    'px-1.5',
    'py-0.5',
    'text-xs',
    'font-semibold',
    'rounded',
    'shadow-sm',
  ];

  const typeClasses = {
    popular: 'bg-amber-400 text-amber-900',
    premium: 'bg-purple-500 text-white',
    new: 'bg-green-500 text-white',
    seasonal: 'bg-rose-500 text-white',
  };

  return [...baseClasses, typeClasses[type]].join(' ');
}

// ============================================================================
// CONTAINER CLASSES
// ============================================================================

/**
 * Returns classes for preset picker container
 */
export function getPresetPickerContainerClasses(
  layout: 'grid' | 'list' = 'grid'
): string {
  const baseClasses = ['w-full', 'p-4', 'bg-white', 'rounded-lg', 'border', 'border-gray-200'];

  const layoutClasses = {
    grid: 'grid grid-cols-4 gap-4',
    list: 'flex flex-col gap-2',
  };

  return [...baseClasses, layoutClasses[layout]].join(' ');
}

/**
 * Returns classes for preset picker section header
 */
export function getPresetSectionHeaderClasses(): string {
  return ['text-lg', 'font-semibold', 'text-gray-900', 'mb-4', 'flex', 'items-center', 'gap-2'].join(
    ' '
  );
}

/**
 * Returns classes for preset picker search/filter bar
 */
export function getPresetFilterBarClasses(): string {
  return [
    'flex',
    'items-center',
    'gap-3',
    'mb-4',
    'p-3',
    'bg-gray-50',
    'rounded-lg',
    'border',
    'border-gray-200',
  ].join(' ');
}

// ============================================================================
// TOOLTIP CLASSES
// ============================================================================

/**
 * Returns classes for preset tooltip/popover
 */
export function getPresetTooltipClasses(): string {
  return [
    'absolute',
    'z-50',
    'px-3',
    'py-2',
    'text-sm',
    'text-white',
    'bg-gray-900',
    'rounded-lg',
    'shadow-lg',
    'pointer-events-none',
    'transition-opacity',
    'duration-200',
    'max-w-xs',
  ].join(' ');
}

/**
 * Returns classes for tooltip arrow
 */
export function getTooltipArrowClasses(position: 'top' | 'bottom' | 'left' | 'right'): string {
  const baseClasses = ['absolute', 'w-2', 'h-2', 'bg-gray-900', 'transform', 'rotate-45'];

  const positionClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2',
  };

  return [...baseClasses, positionClasses[position]].join(' ');
}

// ============================================================================
// LOADING SKELETON CLASSES
// ============================================================================

/**
 * Returns classes for preset loading skeleton
 */
export function getPresetSkeletonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  return [
    sizeClasses[size],
    'rounded-lg',
    'bg-gray-200',
    'animate-pulse',
  ].join(' ');
}

// ============================================================================
// EMPTY STATE CLASSES
// ============================================================================

/**
 * Returns classes for empty state (no presets found)
 */
export function getPresetEmptyStateClasses(): string {
  return [
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'py-12',
    'text-center',
    'text-gray-500',
  ].join(' ');
}

/**
 * Returns classes for empty state icon
 */
export function getEmptyStateIconClasses(): string {
  return ['w-16', 'h-16', 'text-gray-300', 'mb-4'].join(' ');
}

// ============================================================================
// RESPONSIVE HELPERS
// ============================================================================

/**
 * Returns responsive grid classes based on screen size
 */
export function getResponsiveGridClasses(preset: {
  mobile: number;
  tablet: number;
  desktop: number;
}): string {
  return [
    'grid',
    `grid-cols-${preset.mobile}`,
    `md:grid-cols-${preset.tablet}`,
    `lg:grid-cols-${preset.desktop}`,
    'gap-3',
    'md:gap-4',
  ].join(' ');
}

/**
 * Returns recommended responsive config for preset type
 */
export function getRecommendedResponsiveGrid(
  type: 'gradient' | 'glow' | 'splash'
): string {
  const configs = {
    gradient: { mobile: 2, tablet: 3, desktop: 4 },
    glow: { mobile: 2, tablet: 3, desktop: 4 },
    splash: { mobile: 2, tablet: 2, desktop: 3 },
  };

  return getResponsiveGridClasses(configs[type]);
}

// ============================================================================
// ANIMATION CLASSES
// ============================================================================

/**
 * Returns classes for preset swatch entrance animation
 */
export function getPresetEntranceAnimationClasses(index: number): string {
  return [
    'animate-fade-in-up',
    `animation-delay-${Math.min(index * 50, 500)}`,
  ].join(' ');
}

/**
 * Returns classes for preset hover animation
 */
export function getPresetHoverAnimationClasses(): string {
  return [
    'transform',
    'transition-transform',
    'duration-200',
    'hover:scale-110',
    'active:scale-95',
  ].join(' ');
}

// ============================================================================
// UTILITY: CLASS NAME BUILDER
// ============================================================================

/**
 * Type-safe class name builder for preset components
 *
 * @param baseClasses - Base classes
 * @param conditionalClasses - Conditional classes object
 * @returns Combined class string
 */
export function buildPresetClasses(
  baseClasses: string,
  conditionalClasses: Record<string, boolean>
): string {
  const classes = [baseClasses];

  Object.entries(conditionalClasses).forEach(([className, condition]) => {
    if (condition) {
      classes.push(className);
    }
  });

  return classes.join(' ');
}

// ============================================================================
// PRESET CARD VARIANT CLASSES
// ============================================================================

export interface PresetCardVariant {
  variant: 'minimal' | 'detailed' | 'compact';
  selected: boolean;
  focused: boolean;
}

/**
 * Returns classes for preset card variants
 * (for more complex preset option layouts)
 */
export function getPresetCardClasses(config: PresetCardVariant): string {
  const { variant, selected, focused } = config;

  const baseClasses = [
    'relative',
    'cursor-pointer',
    'transition-all',
    'duration-200',
    'overflow-hidden',
  ];

  const variantClasses = {
    minimal: 'p-0',
    detailed: 'p-4 space-y-2',
    compact: 'p-2',
  };

  const borderClasses = selected
    ? 'border-2 border-blue-500 shadow-lg'
    : 'border border-gray-200 hover:border-gray-300';

  const focusClasses = focused
    ? 'ring-2 ring-blue-400 ring-offset-2'
    : 'focus:ring-2 focus:ring-blue-400 focus:ring-offset-2';

  const roundingClasses = {
    minimal: 'rounded-lg',
    detailed: 'rounded-xl',
    compact: 'rounded-md',
  };

  return [
    ...baseClasses,
    variantClasses[variant],
    borderClasses,
    focusClasses,
    roundingClasses[variant],
  ].join(' ');
}
