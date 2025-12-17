'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeVariant, getTheme, type ThemeDefinition } from '@/lib/theme/themeVariants'

interface ThemeContextValue {
  currentTheme: ThemeVariant
  themeDefinition: ThemeDefinition
  setTheme: (theme: ThemeVariant) => void
  persistTheme: (userId: string, theme: ThemeVariant) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'azteka-theme'

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: ThemeVariant
  userId?: string // For sales reps to persist their theme choice
}

export function ThemeProvider({ children, initialTheme = 'toy-store', userId }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(initialTheme)
  const [themeDefinition, setThemeDefinition] = useState<ThemeDefinition>(getTheme(initialTheme))

  // Load saved theme on mount (for sales reps)
  useEffect(() => {
    if (userId) {
      const savedTheme = localStorage.getItem(`${STORAGE_KEY}-${userId}`)
      if (savedTheme && isValidTheme(savedTheme)) {
        setCurrentTheme(savedTheme as ThemeVariant)
        setThemeDefinition(getTheme(savedTheme as ThemeVariant))
      }
    } else {
      const savedTheme = localStorage.getItem(STORAGE_KEY)
      if (savedTheme && isValidTheme(savedTheme)) {
        setCurrentTheme(savedTheme as ThemeVariant)
        setThemeDefinition(getTheme(savedTheme as ThemeVariant))
      }
    }
  }, [userId])

  const setTheme = (theme: ThemeVariant) => {
    setCurrentTheme(theme)
    setThemeDefinition(getTheme(theme))

    // Save to localStorage
    if (userId) {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, theme)
    } else {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }

  const persistTheme = async (userId: string, theme: ThemeVariant) => {
    try {
      // Save to database (for sales reps)
      const response = await fetch('/api/users/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, theme }),
      })

      if (!response.ok) {
        console.error('Failed to persist theme to database')
      }

      // Also save locally
      setTheme(theme)
    } catch (error) {
      console.error('Error persisting theme:', error)
      // Still save locally even if DB save fails
      setTheme(theme)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeDefinition,
        setTheme,
        persistTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

function isValidTheme(theme: string): boolean {
  return ['toy-store', 'neon-energy', 'fresh-splash', 'luxury-gold'].includes(theme)
}
