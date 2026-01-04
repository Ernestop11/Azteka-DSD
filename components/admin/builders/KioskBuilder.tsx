'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Clock,
  Settings,
  Palette,
  Image,
  Type,
  Monitor,
  Save,
  RefreshCw,
  Upload,
  Trash2,
  Eye,
  Check
} from 'lucide-react'

// Kiosk gradient presets
const KIOSK_GRADIENTS = [
  { id: 'emerald', name: 'Emerald (Default)', value: 'linear-gradient(to bottom right, #065f46, #047857, #0d9488)' },
  { id: 'ocean', name: 'Ocean Blue', value: 'linear-gradient(to bottom right, #0c4a6e, #0369a1, #075985)' },
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)' },
  { id: 'berry', name: 'Berry Purple', value: 'linear-gradient(to bottom right, #701a75, #a21caf, #c026d3)' },
  { id: 'sunset', name: 'Sunset Orange', value: 'linear-gradient(to bottom right, #9a3412, #ea580c, #fb923c)' },
  { id: 'forest', name: 'Deep Forest', value: 'linear-gradient(to bottom right, #0f3d0f, #166534, #15803d)' },
  { id: 'slate', name: 'Slate Gray', value: 'linear-gradient(to bottom right, #1e293b, #334155, #475569)' },
  { id: 'crimson', name: 'Crimson', value: 'linear-gradient(to bottom right, #7f1d1d, #b91c1c, #dc2626)' },
  { id: 'gold', name: 'Golden', value: 'linear-gradient(to bottom right, #713f12, #a16207, #ca8a04)' },
  { id: 'teal', name: 'Teal', value: 'linear-gradient(to bottom right, #134e4a, #0d9488, #14b8a6)' },
]

// Time display formats
const TIME_FORMATS = [
  { id: '12h', name: '12 Hour (3:45 PM)', format: 'h:mm A' },
  { id: '12h-seconds', name: '12 Hour + Seconds (3:45:30 PM)', format: 'h:mm:ss A' },
  { id: '24h', name: '24 Hour (15:45)', format: 'HH:mm' },
  { id: '24h-seconds', name: '24 Hour + Seconds (15:45:30)', format: 'HH:mm:ss' },
]

// Date display formats
const DATE_FORMATS = [
  { id: 'full', name: 'Friday, December 27, 2024', format: 'EEEE, MMMM d, yyyy' },
  { id: 'medium', name: 'Dec 27, 2024', format: 'MMM d, yyyy' },
  { id: 'short', name: '12/27/2024', format: 'MM/dd/yyyy' },
  { id: 'day-date', name: 'Fri, Dec 27', format: 'EEE, MMM d' },
]

// Clock template presets
const CLOCK_TEMPLATES = [
  {
    id: 'modern-emerald',
    name: 'Modern Emerald',
    preview: '🌿',
    settings: {
      gradient: 'linear-gradient(to bottom right, #065f46, #047857, #0d9488)',
      accentColor: '#34d399',
      timeFormat: '12h',
      dateFormat: 'full',
      showSeconds: false,
      showLogo: true,
      logoText: 'AZTEKA',
      tagline: 'TIME CLOCK',
      buttonStyle: 'glow',
    }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    preview: '🏢',
    settings: {
      gradient: 'linear-gradient(to bottom right, #0c4a6e, #0369a1, #075985)',
      accentColor: '#38bdf8',
      timeFormat: '24h',
      dateFormat: 'medium',
      showSeconds: true,
      showLogo: true,
      logoText: 'EMPLOYEE',
      tagline: 'TIME CLOCK',
      buttonStyle: 'solid',
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    preview: '🌑',
    settings: {
      gradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
      accentColor: '#94a3b8',
      timeFormat: '24h-seconds',
      dateFormat: 'short',
      showSeconds: true,
      showLogo: false,
      logoText: '',
      tagline: '',
      buttonStyle: 'outline',
    }
  },
  {
    id: 'vibrant-purple',
    name: 'Vibrant Purple',
    preview: '💜',
    settings: {
      gradient: 'linear-gradient(to bottom right, #701a75, #a21caf, #c026d3)',
      accentColor: '#e879f9',
      timeFormat: '12h',
      dateFormat: 'day-date',
      showSeconds: false,
      showLogo: true,
      logoText: 'PUNCH IN',
      tagline: 'CLOCK SYSTEM',
      buttonStyle: 'glow',
    }
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    preview: '🌅',
    settings: {
      gradient: 'linear-gradient(to bottom right, #9a3412, #ea580c, #fb923c)',
      accentColor: '#fdba74',
      timeFormat: '12h-seconds',
      dateFormat: 'full',
      showSeconds: true,
      showLogo: true,
      logoText: 'CHECK IN',
      tagline: 'EMPLOYEE PORTAL',
      buttonStyle: 'solid',
    }
  },
]

interface KioskSettings {
  gradient: string
  accentColor: string
  timeFormat: string
  dateFormat: string
  showSeconds: boolean
  showLogo: boolean
  logoText: string
  tagline: string
  buttonStyle: 'glow' | 'solid' | 'outline'
  backgroundImage: string | null
  backgroundOpacity: number
  businessName: string
}

const defaultSettings: KioskSettings = {
  gradient: 'linear-gradient(to bottom right, #065f46, #047857, #0d9488)',
  accentColor: '#34d399',
  timeFormat: '12h',
  dateFormat: 'full',
  showSeconds: false,
  showLogo: true,
  logoText: 'AZTEKA',
  tagline: 'TIME CLOCK',
  buttonStyle: 'glow',
  backgroundImage: null,
  backgroundOpacity: 30,
  businessName: 'Employee Time Clock',
}

export function KioskBuilder() {
  const [settings, setSettings] = useState<KioskSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<'templates' | 'gradient' | 'display' | 'branding' | 'background'>('templates')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved settings
  useEffect(() => {
    fetch('/api/admin/kiosk/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings })
        }
      })
      .catch(() => {})
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const format = TIME_FORMATS.find(f => f.id === settings.timeFormat)
    if (format?.id === '12h') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    } else if (format?.id === '12h-seconds') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    } else if (format?.id === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } else {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    }
  }

  const formatDate = (date: Date) => {
    const format = DATE_FORMATS.find(f => f.id === settings.dateFormat)
    if (format?.id === 'full') {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    } else if (format?.id === 'medium') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } else if (format?.id === 'short') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/kiosk/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const applyTemplate = (template: typeof CLOCK_TEMPLATES[0]) => {
    setSettings(prev => ({
      ...prev,
      ...template.settings
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'kiosk-background')

    try {
      const res = await fetch('/api/admin/kiosk/upload-background', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setSettings(prev => ({ ...prev, backgroundImage: data.url }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const sections = [
    { id: 'templates', icon: Monitor, label: 'Templates' },
    { id: 'gradient', icon: Palette, label: 'Colors' },
    { id: 'display', icon: Clock, label: 'Time Display' },
    { id: 'branding', icon: Type, label: 'Branding' },
    { id: 'background', icon: Image, label: 'Background' },
  ]

  return (
    <div className="flex gap-6">
      {/* Editor Sidebar */}
      <div className="w-80 bg-slate-900 rounded-xl p-4 border border-slate-800">
        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white">Clock Templates</h3>
            <p className="text-sm text-slate-400">Quick start with pre-built designs</p>
            <div className="grid grid-cols-2 gap-3">
              {CLOCK_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-all text-left"
                >
                  <span className="text-2xl mb-2 block">{template.preview}</span>
                  <span className="text-sm font-medium text-white">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gradient Section */}
        {activeSection === 'gradient' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white">Background Gradient</h3>
            <div className="grid grid-cols-2 gap-2">
              {KIOSK_GRADIENTS.map(gradient => (
                <button
                  key={gradient.id}
                  onClick={() => setSettings(prev => ({ ...prev, gradient: gradient.value }))}
                  className={`h-16 rounded-xl border-2 transition-all ${
                    settings.gradient === gradient.value
                      ? 'border-white ring-2 ring-blue-500'
                      : 'border-transparent hover:border-slate-600'
                  }`}
                  style={{ background: gradient.value }}
                  title={gradient.name}
                />
              ))}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Time Display Section */}
        {activeSection === 'display' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white">Time Format</h3>
            <div className="space-y-2">
              {TIME_FORMATS.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSettings(prev => ({ ...prev, timeFormat: format.id }))}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    settings.timeFormat === format.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {format.name}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-white mt-6">Date Format</h3>
            <div className="space-y-2">
              {DATE_FORMATS.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSettings(prev => ({ ...prev, dateFormat: format.id }))}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    settings.dateFormat === format.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {format.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Branding Section */}
        {activeSection === 'branding' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white">Logo & Branding</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLogo}
                onChange={(e) => setSettings(prev => ({ ...prev, showLogo: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-slate-300">Show Logo Text</span>
            </label>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Logo Text</label>
              <input
                type="text"
                value={settings.logoText}
                onChange={(e) => setSettings(prev => ({ ...prev, logoText: e.target.value }))}
                placeholder="AZTEKA"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="TIME CLOCK"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Business Name (Footer)</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Employee Time Clock"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Button Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['glow', 'solid', 'outline'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setSettings(prev => ({ ...prev, buttonStyle: style }))}
                    className={`py-2 px-3 rounded-lg text-sm capitalize transition-all ${
                      settings.buttonStyle === style
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Background Section */}
        {activeSection === 'background' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white">Background Image</h3>
            <p className="text-sm text-slate-400">Add a background image overlay</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {settings.backgroundImage ? (
              <div className="relative">
                <img
                  src={settings.backgroundImage}
                  alt="Background"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => setSettings(prev => ({ ...prev, backgroundImage: null }))}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-8 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all"
              >
                {uploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            )}

            {settings.backgroundImage && (
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Image Opacity: {settings.backgroundOpacity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={settings.backgroundOpacity}
                  onChange={(e) => setSettings(prev => ({ ...prev, backgroundOpacity: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Live Preview */}
      <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <h3 className="font-semibold text-slate-300 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
          </h3>
          <a
            href="/kiosk"
            target="_blank"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Open Full Kiosk →
          </a>
        </div>

        {/* Preview Container */}
        <div
          className="relative min-h-[600px] flex flex-col items-center justify-center p-8 select-none"
          style={{
            background: settings.gradient,
          }}
        >
          {/* Background Image Overlay */}
          {settings.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${settings.backgroundImage})`,
                opacity: settings.backgroundOpacity / 100,
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Logo */}
            {settings.showLogo && (
              <div className="mb-6">
                <h2 className="text-4xl font-bold tracking-wider" style={{ color: settings.accentColor }}>
                  {settings.logoText || 'AZTEKA'}
                </h2>
                <p className="text-sm tracking-widest opacity-60" style={{ color: settings.accentColor }}>
                  {settings.tagline || 'TIME CLOCK'}
                </p>
              </div>
            )}

            {/* Clock Icon */}
            <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: settings.accentColor }} />

            {/* Time */}
            <h1 className="text-6xl md:text-7xl font-mono font-bold text-white mb-4 tracking-tight">
              {formatTime(currentTime)}
            </h1>

            {/* Date */}
            <p className="text-xl mb-8" style={{ color: settings.accentColor }}>
              {formatDate(currentTime)}
            </p>

            {/* CTA Button */}
            <div
              className={`px-12 py-6 inline-block rounded-2xl ${
                settings.buttonStyle === 'glow'
                  ? 'bg-white/10 backdrop-blur animate-pulse'
                  : settings.buttonStyle === 'solid'
                  ? 'bg-white/20'
                  : 'border-2 border-white/30'
              }`}
            >
              <p className="text-2xl text-white font-medium">
                Tap to Clock In / Out
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 text-sm opacity-60" style={{ color: settings.accentColor }}>
            {settings.businessName || 'Employee Time Clock'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default KioskBuilder
