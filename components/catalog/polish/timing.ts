/**
 * Azteka DSD Catalog - Global Animation Timing System
 * Unified timing for all transitions and animations
 *
 * LAP #4: Polish - Consistent timing with motion preference support
 */

// ============================================================================
// BASELINE DURATIONS
// ============================================================================

/**
 * Standard duration scale (milliseconds)
 * Based on multiples of 80ms for smooth perception
 */
export const DURATIONS = {
  instant: 0,       // No animation
  fastest: 80,      // Micro interactions (hover states)
  fast: 160,        // Quick transitions (dropdowns, tooltips)
  normal: 240,      // Standard transitions (modals, slides)
  slow: 320,        // Deliberate transitions (page transitions)
  slowest: 400,     // Emphasis transitions (hero reveals)
} as const

/**
 * Tailwind duration class mappings
 */
export const DURATION_CLASSES = {
  instant: 'duration-0',
  fastest: 'duration-75',     // 75ms (closest to 80ms)
  fast: 'duration-150',       // 150ms (closest to 160ms)
  normal: 'duration-200',     // 200ms (closest to 240ms)
  slow: 'duration-300',       // 300ms (closest to 320ms)
  slowest: 'duration-500',    // 500ms (extended for emphasis)
} as const

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

/**
 * Standard easing curves
 */
export const EASING = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  custom: {
    // Custom bezier curves
    snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Material Design standard
    smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',        // Smooth deceleration
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect
    springy: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring effect
  },
} as const

/**
 * Tailwind easing class mappings
 */
export const EASING_CLASSES = {
  linear: 'ease-linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const

// ============================================================================
// COMPONENT-SPECIFIC TIMING PRESETS
// ============================================================================

/**
 * Fade transitions
 */
export const FADE_TIMING = {
  in: {
    duration: DURATIONS.fast,
    easing: EASING.easeOut,
    class: `${DURATION_CLASSES.fast} ${EASING_CLASSES.easeOut}`,
  },
  out: {
    duration: DURATIONS.fastest,
    easing: EASING.easeIn,
    class: `${DURATION_CLASSES.fastest} ${EASING_CLASSES.easeIn}`,
  },
}

/**
 * Slide transitions
 */
export const SLIDE_TIMING = {
  in: {
    duration: DURATIONS.normal,
    easing: EASING.custom.snappy,
    class: `${DURATION_CLASSES.normal} ease-out`,
  },
  out: {
    duration: DURATIONS.fast,
    easing: EASING.easeIn,
    class: `${DURATION_CLASSES.fast} ${EASING_CLASSES.easeIn}`,
  },
}

/**
 * Shine/shimmer effects
 */
export const SHINE_TIMING = {
  sweep: {
    duration: 800,     // 800ms shine sweep
    easing: EASING.easeInOut,
    class: 'duration-[800ms] ease-in-out',
  },
  pulse: {
    duration: 2000,    // 2s glow pulse
    easing: EASING.easeInOut,
    class: 'duration-[2000ms] ease-in-out',
  },
}

/**
 * Scale/pop effects
 */
export const SCALE_TIMING = {
  hover: {
    duration: DURATIONS.fast,
    easing: EASING.custom.snappy,
    class: `${DURATION_CLASSES.fast} ease-out`,
  },
  tap: {
    duration: DURATIONS.fastest,
    easing: EASING.easeIn,
    class: `${DURATION_CLASSES.fastest} ${EASING_CLASSES.easeIn}`,
  },
  bounce: {
    duration: DURATIONS.slow,
    easing: EASING.custom.bounce,
    class: `${DURATION_CLASSES.slow} ease-out`,
  },
}

/**
 * Hero banner entrance
 */
export const HERO_TIMING = {
  entrance: {
    duration: DURATIONS.slowest,
    easing: EASING.custom.smooth,
    class: `${DURATION_CLASSES.slowest} ease-out`,
  },
  ctaDelay: 200,  // Delay CTA appearance by 200ms
}

/**
 * Product grid stagger
 */
export const STAGGER_TIMING = {
  mobile: {
    duration: DURATIONS.fast,
    delay: 50,       // 50ms between items
    class: `${DURATION_CLASSES.fast} ease-out`,
  },
  tablet: {
    duration: DURATIONS.normal,
    delay: 60,       // 60ms between items
    class: `${DURATION_CLASSES.normal} ease-out`,
  },
  desktop: {
    duration: DURATIONS.normal,
    delay: 80,       // 80ms between items
    class: `${DURATION_CLASSES.normal} ease-out`,
  },
}

/**
 * Modal/overlay timing
 */
export const MODAL_TIMING = {
  open: {
    backdrop: DURATIONS.fast,
    content: DURATIONS.normal,
    class: `${DURATION_CLASSES.normal} ease-out`,
  },
  close: {
    duration: DURATIONS.fast,
    class: `${DURATION_CLASSES.fast} ${EASING_CLASSES.easeIn}`,
  },
}

/**
 * Skeleton loading pulse
 */
export const SKELETON_TIMING = {
  pulse: {
    duration: 1500,    // 1.5s pulse cycle
    easing: EASING.easeInOut,
    class: 'duration-[1500ms] ease-in-out',
  },
  shimmer: {
    duration: 2000,    // 2s shimmer sweep
    easing: EASING.linear,
    class: 'duration-[2000ms] linear',
  },
}

// ============================================================================
// MOTION PREFERENCE DETECTION
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get timing config respecting motion preferences
 */
export function getAccessibleTiming<T extends { duration: number; class: string }>(
  timing: T
): T {
  if (prefersReducedMotion()) {
    return {
      ...timing,
      duration: 0,
      class: 'duration-0',
    }
  }

  return timing
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get duration value
 */
export function getDuration(key: keyof typeof DURATIONS): number {
  return DURATIONS[key]
}

/**
 * Get duration class
 */
export function getDurationClass(key: keyof typeof DURATION_CLASSES): string {
  return DURATION_CLASSES[key]
}

/**
 * Get complete transition class
 */
export function getTransitionClass(
  duration: keyof typeof DURATION_CLASSES = 'normal',
  easing: keyof typeof EASING_CLASSES = 'easeOut',
  properties: string = 'all'
): string {
  return `transition-${properties} ${DURATION_CLASSES[duration]} ${EASING_CLASSES[easing]}`
}

/**
 * Get stagger delay for index
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = STAGGER_TIMING.desktop.delay
): number {
  return index * baseDelay
}

/**
 * Get stagger delay class
 */
export function getStaggerDelayClass(
  index: number,
  baseDelay: number = STAGGER_TIMING.desktop.delay
): string {
  const delay = getStaggerDelay(index, baseDelay)
  return `delay-[${delay}ms]`
}

/**
 * Build custom transition
 */
export function buildTransition(options: {
  duration?: number
  easing?: string
  delay?: number
  properties?: string
}): string {
  const {
    duration = DURATIONS.normal,
    easing = EASING.easeOut,
    delay = 0,
    properties = 'all',
  } = options

  const parts = [`transition-${properties}`, `duration-[${duration}ms]`]

  if (easing) parts.push(`[transition-timing-function:${easing}]`)
  if (delay > 0) parts.push(`delay-[${delay}ms]`)

  return parts.join(' ')
}

// ============================================================================
// ANIMATION KEYFRAMES
// ============================================================================

/**
 * Keyframe animation configurations
 */
export const KEYFRAMES = {
  shimmer: {
    name: 'shimmer',
    duration: 2000,
    css: `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `,
  },
  pulse: {
    name: 'pulse',
    duration: 1500,
    css: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  },
  glowPulse: {
    name: 'glow-pulse',
    duration: 2000,
    css: `
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.3); }
        50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.6); }
      }
    `,
  },
  bounce: {
    name: 'bounce',
    duration: 2000,
    css: `
      @keyframes bounce {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.05) rotate(-2deg); }
        50% { transform: scale(1) rotate(0deg); }
        75% { transform: scale(1.03) rotate(2deg); }
      }
    `,
  },
}

// ============================================================================
// TIMING PRESETS FOR COMPONENTS
// ============================================================================

/**
 * Get timing preset for specific component
 */
export function getComponentTiming(
  component:
    | 'fade'
    | 'slide'
    | 'shine'
    | 'scale'
    | 'hero'
    | 'stagger'
    | 'modal'
    | 'skeleton'
) {
  const timingMap = {
    fade: FADE_TIMING,
    slide: SLIDE_TIMING,
    shine: SHINE_TIMING,
    scale: SCALE_TIMING,
    hero: HERO_TIMING,
    stagger: STAGGER_TIMING,
    modal: MODAL_TIMING,
    skeleton: SKELETON_TIMING,
  }

  return timingMap[component]
}

// ============================================================================
// COMPLETE TIMING SYSTEM EXPORT
// ============================================================================

/**
 * All timing utilities in one object
 */
export const timingSystem = {
  // Durations
  durations: DURATIONS,
  durationClasses: DURATION_CLASSES,

  // Easing
  easing: EASING,
  easingClasses: EASING_CLASSES,

  // Component presets
  fade: FADE_TIMING,
  slide: SLIDE_TIMING,
  shine: SHINE_TIMING,
  scale: SCALE_TIMING,
  hero: HERO_TIMING,
  stagger: STAGGER_TIMING,
  modal: MODAL_TIMING,
  skeleton: SKELETON_TIMING,

  // Keyframes
  keyframes: KEYFRAMES,

  // Motion preferences
  prefersReducedMotion,
  getAccessibleTiming,

  // Utilities
  getDuration,
  getDurationClass,
  getTransitionClass,
  getStaggerDelay,
  getStaggerDelayClass,
  buildTransition,
  getComponentTiming,
}

export default timingSystem
