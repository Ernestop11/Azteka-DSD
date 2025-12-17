/**
 * Field Test Configuration
 * Controls debug mode, logging, and performance optimizations
 */

export interface FieldTestConfig {
  debugOverlay: boolean
  logInteractions: boolean
  safeMode: boolean // Disables heavy FX if needed
  tabletMode: boolean
  forceCustomer: string | null
}

const defaultConfig: FieldTestConfig = {
  debugOverlay: process.env.NODE_ENV === 'development',
  logInteractions: process.env.NODE_ENV === 'development',
  safeMode: false,
  tabletMode: false,
  forceCustomer: null,
}

// Load from environment or localStorage (client-side)
export function getFieldTestConfig(): FieldTestConfig {
  if (typeof window === 'undefined') {
    return defaultConfig
  }

  try {
    const stored = localStorage.getItem('fieldTestConfig')
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.warn('Failed to load field test config from localStorage', error)
  }

  return defaultConfig
}

export function setFieldTestConfig(config: Partial<FieldTestConfig>): void {
  if (typeof window === 'undefined') return

  try {
    const current = getFieldTestConfig()
    const updated = { ...current, ...config }
    localStorage.setItem('fieldTestConfig', JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save field test config to localStorage', error)
  }
}

export const fieldTestConfig = getFieldTestConfig()

