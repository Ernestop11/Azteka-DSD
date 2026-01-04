'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface FavoritesUISettings {
  id?: string
  backgroundGradient: string
  backgroundPattern: string | null
  patternOpacity: number
  patternSize: string | null
  cardBackground: string
  cardBorderRadius: string
  cardShadow: string
  cardHoverScale: number
  primaryColor: string
  accentColor: string
  animation: string | null
  glowEffect: boolean
  headerBackground: string
  bottomBarStyle: string
  // New fields matching Catalog builder
  cardStylePreset: string
  imageEffect: string
  imageBg: string
}

// Background gradient presets (dark theme for rep dashboard)
const BG_GRADIENT_PRESETS = [
  { id: 'slate-dark', name: 'Slate Dark', value: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)' },
  { id: 'forest', name: 'Forest Night', value: 'linear-gradient(180deg, #052e16 0%, #14532d 50%, #052e16 100%)' },
  { id: 'ocean', name: 'Deep Ocean', value: 'linear-gradient(180deg, #0c4a6e 0%, #164e63 50%, #0c4a6e 100%)' },
  { id: 'purple', name: 'Dark Purple', value: 'linear-gradient(180deg, #2e1065 0%, #4c1d95 50%, #2e1065 100%)' },
  { id: 'warm-black', name: 'Warm Black', value: 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #1c1917 100%)' },
  { id: 'emerald', name: 'Emerald Night', value: 'linear-gradient(180deg, #064e3b 0%, #065f46 50%, #064e3b 100%)' },
]

// Card Style Presets - SAME AS CATALOG BUILDER
const CARD_STYLE_PRESETS = [
  { id: 'dark-red', name: 'Dark Red', cardBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', imageBg: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)', borderColor: '#334155', accentColor: '#ef4444', glowColor: '#ef4444', textLight: true, icon: '🔴' },
  { id: 'dark-emerald', name: 'Dark Emerald', cardBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', imageBg: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', borderColor: '#10b981', accentColor: '#10b981', glowColor: '#10b981', textLight: true, icon: '🟢' },
  { id: 'dark-gold', name: 'Dark Gold', cardBg: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)', imageBg: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)', borderColor: '#d97706', accentColor: '#f59e0b', glowColor: '#fbbf24', textLight: true, icon: '🟡' },
  { id: 'dark-purple', name: 'Dark Purple', cardBg: 'linear-gradient(180deg, #1e1b4b 0%, #0f0d22 100%)', imageBg: 'linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)', borderColor: '#7c3aed', accentColor: '#8b5cf6', glowColor: '#a78bfa', textLight: true, icon: '🟣' },
  { id: 'clean-white', name: 'Clean White', cardBg: '#ffffff', imageBg: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderColor: '#e2e8f0', accentColor: '#ef4444', glowColor: '#ef4444', textLight: false, icon: '⬜' },
  { id: 'aztec-jade', name: 'Aztec Jade', cardBg: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', imageBg: 'linear-gradient(180deg, #022c22 0%, #064e3b 100%)', borderColor: '#10b981', accentColor: '#fbbf24', glowColor: '#fbbf24', textLight: true, icon: '🌿' },
  { id: 'fiesta-red', name: 'Fiesta Red', cardBg: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 100%)', imageBg: 'linear-gradient(180deg, #450a0a 0%, #7f1d1d 100%)', borderColor: '#f87171', accentColor: '#fbbf24', glowColor: '#fbbf24', textLight: true, icon: '❤️' },
  { id: 'ocean-blue', name: 'Ocean Blue', cardBg: 'linear-gradient(180deg, #0c4a6e 0%, #075985 100%)', imageBg: 'linear-gradient(180deg, #082f49 0%, #0c4a6e 100%)', borderColor: '#0ea5e9', accentColor: '#0ea5e9', glowColor: '#38bdf8', textLight: true, icon: '💙' },
]

// Product Image Effects - SAME AS CATALOG BUILDER
const CARD_IMAGE_EFFECTS = [
  { id: 'none', name: 'None', value: '', icon: '⬜' },
  { id: 'soft-shadow', name: 'Soft Shadow', value: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))', icon: '🌫️' },
  { id: 'strong-shadow', name: 'Strong Shadow', value: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))', icon: '⬛' },
  { id: 'glow-white', name: 'White Glow', value: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))', icon: '✨' },
  { id: 'glow-gold', name: 'Gold Glow', value: 'drop-shadow(0 0 20px rgba(255,215,0,0.4))', icon: '🌟' },
  { id: 'glow-emerald', name: 'Emerald Glow', value: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))', icon: '💚' },
  { id: 'float-3d', name: '3D Float', value: 'drop-shadow(0 25px 25px rgba(0,0,0,0.25)) drop-shadow(0 5px 10px rgba(0,0,0,0.1))', icon: '🎯' },
  // WOW Effects
  { id: 'neon-red', name: 'Neon Red', value: 'drop-shadow(0 0 10px rgba(239,68,68,0.8)) drop-shadow(0 0 30px rgba(239,68,68,0.5)) drop-shadow(0 0 50px rgba(239,68,68,0.3))', icon: '🔴' },
  { id: 'neon-blue', name: 'Neon Blue', value: 'drop-shadow(0 0 10px rgba(59,130,246,0.8)) drop-shadow(0 0 30px rgba(59,130,246,0.5)) drop-shadow(0 0 50px rgba(59,130,246,0.3))', icon: '🔵' },
  { id: 'neon-purple', name: 'Neon Purple', value: 'drop-shadow(0 0 10px rgba(139,92,246,0.8)) drop-shadow(0 0 30px rgba(139,92,246,0.5)) drop-shadow(0 0 50px rgba(139,92,246,0.3))', icon: '🟣' },
  { id: 'fire', name: 'Fire', value: 'drop-shadow(0 0 15px rgba(251,146,60,0.9)) drop-shadow(0 0 30px rgba(239,68,68,0.6)) drop-shadow(0 5px 20px rgba(234,179,8,0.4))', icon: '🔥' },
  { id: 'ice', name: 'Ice', value: 'drop-shadow(0 0 15px rgba(147,197,253,0.8)) drop-shadow(0 0 30px rgba(59,130,246,0.5)) drop-shadow(0 5px 20px rgba(255,255,255,0.4))', icon: '❄️' },
  { id: 'electric', name: 'Electric', value: 'drop-shadow(0 0 8px rgba(250,204,21,1)) drop-shadow(0 0 20px rgba(234,179,8,0.8)) drop-shadow(0 0 40px rgba(251,191,36,0.5))', icon: '⚡' },
  { id: 'premium', name: 'Premium Gold', value: 'drop-shadow(0 0 15px rgba(251,191,36,0.9)) drop-shadow(0 10px 30px rgba(180,83,9,0.6)) drop-shadow(0 5px 15px rgba(255,215,0,0.4))', icon: '👑' },
  { id: 'hologram', name: 'Hologram', value: 'drop-shadow(-5px 0 15px rgba(239,68,68,0.5)) drop-shadow(5px 0 15px rgba(59,130,246,0.5)) drop-shadow(0 0 20px rgba(16,185,129,0.4))', icon: '🌈' },
  { id: 'mega-3d', name: 'Mega 3D', value: 'drop-shadow(0 35px 35px rgba(0,0,0,0.4)) drop-shadow(0 15px 15px rgba(0,0,0,0.2)) drop-shadow(0 5px 5px rgba(0,0,0,0.1))', icon: '🚀' },
  { id: 'spotlight', name: 'Spotlight', value: 'drop-shadow(0 0 40px rgba(255,255,255,0.8)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))', icon: '💡' },
]

// Pattern presets - same as catalog
const PATTERN_PRESETS = [
  { id: 'none', name: 'None', value: null, icon: '⬜' },
  { id: 'aztec-diamonds', name: 'Aztec Diamonds', value: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)`, icon: '◆' },
  { id: 'stars', name: 'Scattered Stars', value: `radial-gradient(circle at 15% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 2px, transparent 2px), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.12) 2px, transparent 2px), radial-gradient(circle at 45% 60%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 1px, transparent 1px)`, icon: '✨' },
  { id: 'grid', name: 'Subtle Grid', value: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, icon: '📐' },
]

// Image Area Background presets
const IMAGE_BG_PRESETS = [
  { id: 'transparent', name: 'Transparent', value: 'transparent', icon: '⬜' },
  { id: 'slate', name: 'Slate', value: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)', icon: '🌫️' },
  { id: 'dark', name: 'Dark', value: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', icon: '⬛' },
  { id: 'emerald', name: 'Emerald', value: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', icon: '🌿' },
  { id: 'gold', name: 'Gold', value: 'linear-gradient(180deg, #78350f 0%, #92400e 100%)', icon: '🟡' },
  { id: 'white', name: 'White', value: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', icon: '⚪' },
]

export default function FavoritesUIBuilder() {
  const queryClient = useQueryClient()
  const previewRef = useRef<HTMLIFrameElement>(null)
  const [activeTab, setActiveTab] = useState<'background' | 'cards' | 'effects'>('cards')
  const [localSettings, setLocalSettings] = useState<Partial<FavoritesUISettings>>({})
  const [previewKey, setPreviewKey] = useState(0)

  // Fetch settings
  const { data: settings, isLoading } = useQuery<FavoritesUISettings>({
    queryKey: ['favorites-ui-settings'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/favorites-settings')
      const json = await res.json()
      return json.data
    },
  })

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newSettings: Partial<FavoritesUISettings>) => {
      const res = await fetch('/api/catalog/favorites-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites-ui-settings'] })
      setPreviewKey(prev => prev + 1)
    },
  })

  const updateSetting = <K extends keyof FavoritesUISettings>(key: K, value: FavoritesUISettings[K]) => {
    const updated = { ...localSettings, [key]: value }
    setLocalSettings(updated)
    saveMutation.mutate(updated)
  }

  // Apply card style preset
  const applyCardStylePreset = (presetId: string) => {
    const preset = CARD_STYLE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      const updated = {
        ...localSettings,
        cardStylePreset: presetId,
        cardBackground: preset.cardBg,
        imageBg: preset.imageBg,
        accentColor: preset.accentColor,
      }
      setLocalSettings(updated)
      saveMutation.mutate(updated)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Settings Panel */}
      <div className="w-[400px] space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
        <div>
          <h2 className="text-xl font-bold mb-2">Favorites UI</h2>
          <p className="text-sm text-slate-400">
            Customize how the favorites/order page looks for sales reps. Same card styles & effects as the Catalog builder.
          </p>
        </div>

        {/* Tabs - Same style as Catalog builder */}
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          {(['cards', 'background', 'effects'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab === 'cards' ? 'Card Background' : tab === 'effects' ? 'Product Image Effect' : 'Background'}
            </button>
          ))}
        </div>

        {/* Cards Tab - Card Style Presets (like Catalog) */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            {/* Card Style Preset Grid */}
            <div>
              <label className="block text-sm font-medium mb-3">Card Background</label>
              <div className="grid grid-cols-4 gap-3">
                {CARD_STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyCardStylePreset(preset.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      localSettings.cardStylePreset === preset.id
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ background: preset.cardBg }}
                    >
                      {preset.icon}
                    </div>
                    <span className="text-xs text-center text-slate-300">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Area Background */}
            <div>
              <label className="block text-sm font-medium mb-3">Image Area Background</label>
              <div className="grid grid-cols-3 gap-3">
                {IMAGE_BG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateSetting('imageBg', preset.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      localSettings.imageBg === preset.value
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border border-slate-600"
                      style={{ background: preset.value }}
                    >
                      {preset.icon}
                    </div>
                    <span className="text-xs text-center text-slate-300">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Background Tab */}
        {activeTab === 'background' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Page Background</label>
              <div className="grid grid-cols-2 gap-3">
                {BG_GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateSetting('backgroundGradient', preset.value)}
                    className={`h-20 rounded-lg border-2 transition-all flex items-center justify-center ${
                      localSettings.backgroundGradient === preset.value
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ background: preset.value }}
                  >
                    <span className="text-sm text-white/90 font-medium drop-shadow-lg px-2 text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Pattern Overlay</label>
              <div className="grid grid-cols-2 gap-3">
                {PATTERN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateSetting('backgroundPattern', preset.value)}
                    className={`h-14 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      localSettings.backgroundPattern === preset.value
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{
                      background: preset.value
                        ? `${preset.value}, linear-gradient(#1e293b, #1e293b)`
                        : '#1e293b'
                    }}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-xs text-white/80 font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab - Product Image Effects (like Catalog) */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Product Image Effect</label>
              <div className="grid grid-cols-4 gap-3">
                {CARD_IMAGE_EFFECTS.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => updateSetting('imageEffect', effect.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      localSettings.imageEffect === effect.id
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">{effect.icon}</span>
                    <span className="text-[10px] text-center text-slate-300 leading-tight">{effect.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview of selected effect */}
            {localSettings.imageEffect && localSettings.imageEffect !== 'none' && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">Selected Effect Preview:</p>
                <div
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"
                  style={{
                    filter: CARD_IMAGE_EFFECTS.find(e => e.id === localSettings.imageEffect)?.value || ''
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Save Status */}
        {saveMutation.isPending && (
          <div className="text-sm text-blue-400 animate-pulse">Saving...</div>
        )}
      </div>

      {/* Live Preview */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-300">Live Preview</h3>
          <button
            onClick={() => setPreviewKey(prev => prev + 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden bg-slate-900 h-[calc(100vh-200px)] ring-1 ring-slate-800">
          <iframe
            key={previewKey}
            ref={previewRef}
            src="/rep/order?customer=preview"
            className="w-full h-full border-0"
            title="Favorites Preview"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-slate-400 text-sm pointer-events-none">
            <div className="text-center">
              <p className="text-lg mb-1">Preview shows demo data</p>
              <p className="text-xs">Actual content varies per customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
