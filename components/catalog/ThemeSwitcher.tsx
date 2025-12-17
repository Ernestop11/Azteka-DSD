'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, ChevronDown } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { getThemeOptions, type ThemeVariant } from '@/lib/theme/themeVariants'

interface ThemeSwitcherProps {
  userId?: string
  className?: string
}

export default function ThemeSwitcher({ userId, className = '' }: ThemeSwitcherProps) {
  const { currentTheme, themeDefinition, setTheme, persistTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const themeOptions = getThemeOptions()

  const handleThemeChange = async (newTheme: ThemeVariant) => {
    if (userId) {
      await persistTheme(userId, newTheme)
    } else {
      setTheme(newTheme)
    }
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Switcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <p className="text-xs text-gray-500 font-medium">Catalog Theme</p>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <span>{themeDefinition.icon}</span>
              <span>{themeDefinition.name}</span>
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[320px]"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">
                  Select Catalog Theme
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Choose the best theme for your customer
                </p>
              </div>

              {/* Theme Options */}
              <div className="p-2">
                {themeOptions.map((option) => {
                  const isActive = option.value === currentTheme
                  const theme = themeDefinition.id === option.value ? themeDefinition : null

                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="text-2xl">{option.icon}</div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{option.label}</p>
                            {isActive && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {theme?.description || getThemeOptions().find(t => t.value === option.value)?.label}
                          </p>
                        </div>

                        {/* Preview Circle */}
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-300"
                          style={{
                            background: theme?.cardGradient || 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
                          }}
                        />
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  💡 <strong>Tip:</strong> Theme persists across sessions
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
