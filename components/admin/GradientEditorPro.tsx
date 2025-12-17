'use client'

import { useState, useEffect } from 'react'
import { Paintbrush, Sparkles, Eye, Copy, Save, Trash2, Download } from 'lucide-react'

interface GradientStop {
  color: string
  position: number
}

interface GradientPreset {
  id: string
  name: string
  gradient: string
  stops: GradientStop[]
}

const PRESET_GRADIENTS: GradientPreset[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ]
  },
  {
    id: 'sunset',
    name: 'Sunset',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    stops: [
      { color: '#f093fb', position: 0 },
      { color: '#f5576c', position: 100 }
    ]
  },
  {
    id: 'fire',
    name: 'Fire',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    stops: [
      { color: '#fa709a', position: 0 },
      { color: '#fee140', position: 100 }
    ]
  },
  {
    id: 'forest',
    name: 'Forest',
    gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    stops: [
      { color: '#134e5e', position: 0 },
      { color: '#71b280', position: 100 }
    ]
  },
  {
    id: 'sky',
    name: 'Sky',
    gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)',
    stops: [
      { color: '#00d2ff', position: 0 },
      { color: '#3a47d5', position: 100 }
    ]
  },
  {
    id: 'grape',
    name: 'Grape',
    gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
    stops: [
      { color: '#8e2de2', position: 0 },
      { color: '#4a00e0', position: 100 }
    ]
  },
  {
    id: 'peach',
    name: 'Peach',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    stops: [
      { color: '#ffecd2', position: 0 },
      { color: '#fcb69f', position: 100 }
    ]
  },
  {
    id: 'mint',
    name: 'Mint',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    stops: [
      { color: '#a8edea', position: 0 },
      { color: '#fed6e3', position: 100 }
    ]
  },
  {
    id: 'royal',
    name: 'Royal',
    gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    stops: [
      { color: '#141e30', position: 0 },
      { color: '#243b55', position: 100 }
    ]
  },
  {
    id: 'candy',
    name: 'Candy',
    gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
    stops: [
      { color: '#ee9ca7', position: 0 },
      { color: '#ffdde1', position: 100 }
    ]
  }
]

interface GradientEditorProProps {
  value?: string
  onChange?: (gradient: string) => void
  onSave?: (gradient: string, name: string) => void
}

export default function GradientEditorPro({ value, onChange, onSave }: GradientEditorProProps) {
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 }
  ])
  const [angle, setAngle] = useState(135)
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customName, setCustomName] = useState('')

  // Generate gradient CSS
  const generateGradientCSS = () => {
    const stopsCSS = gradientStops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ')

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsCSS})`
    } else {
      return `radial-gradient(circle, ${stopsCSS})`
    }
  }

  const currentGradient = generateGradientCSS()

  // Update parent when gradient changes
  useEffect(() => {
    onChange?.(currentGradient)
  }, [gradientStops, angle, gradientType])

  // Add gradient stop
  const addStop = () => {
    const newPosition = gradientStops.length > 0
      ? Math.max(...gradientStops.map(s => s.position)) / 2
      : 50

    setGradientStops([
      ...gradientStops,
      { color: '#6366f1', position: newPosition }
    ])
  }

  // Remove gradient stop
  const removeStop = (index: number) => {
    if (gradientStops.length <= 2) return // Keep at least 2 stops
    setGradientStops(gradientStops.filter((_, i) => i !== index))
  }

  // Update stop color
  const updateStopColor = (index: number, color: string) => {
    const updated = [...gradientStops]
    updated[index].color = color
    setGradientStops(updated)
  }

  // Update stop position
  const updateStopPosition = (index: number, position: number) => {
    const updated = [...gradientStops]
    updated[index].position = Math.max(0, Math.min(100, position))
    setGradientStops(updated)
  }

  // Load preset
  const loadPreset = (preset: GradientPreset) => {
    setGradientStops(preset.stops)
    setAngle(135) // Reset to default angle
    setGradientType('linear')
  }

  // Copy CSS
  const copyCSS = () => {
    navigator.clipboard.writeText(currentGradient)
    alert('Gradient CSS copied to clipboard!')
  }

  // Save gradient
  const handleSave = () => {
    if (!customName.trim()) {
      alert('Please enter a name for this gradient')
      return
    }
    onSave?.(currentGradient, customName)
    setCustomName('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-blue-600" />
            Gradient Editor
          </h3>

          {/* Gradient Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Gradient Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGradientType('linear')}
                className={`flex-1 py-2 px-4 rounded ${
                  gradientType === 'linear'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setGradientType('radial')}
                className={`flex-1 py-2 px-4 rounded ${
                  gradientType === 'radial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {/* Angle (Linear only) */}
          {gradientType === 'linear' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Angle: {angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                  <button
                    key={deg}
                    onClick={() => setAngle(deg)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gradient Stops */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Color Stops</label>
              <button
                onClick={addStop}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Stop
              </button>
            </div>

            <div className="space-y-3">
              {gradientStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStopColor(index, e.target.value)}
                    className="w-12 h-12 rounded border cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateStopPosition(index, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Position: {stop.position}%
                    </div>
                  </div>
                  {gradientStops.length > 2 && (
                    <button
                      onClick={() => removeStop(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CSS Output */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">CSS Output</label>
            <div className="relative">
              <textarea
                value={currentGradient}
                readOnly
                className="w-full p-3 border rounded font-mono text-sm bg-gray-50"
                rows={3}
              />
              <button
                onClick={copyCSS}
                className="absolute top-2 right-2 p-2 bg-white rounded shadow hover:bg-gray-50"
                title="Copy CSS"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Save Custom Gradient */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Gradient name..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Preset Gradients */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Preset Gradients
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {PRESET_GRADIENTS.map(preset => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset)}
                className="group relative h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
                style={{ background: preset.gradient }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-all">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6 sticky top-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            Live Preview
          </h3>

          {/* Large Preview */}
          <div
            className="w-full h-64 rounded-lg mb-4 shadow-lg"
            style={{ background: currentGradient }}
          />

          {/* Product Card Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">As Product Card</h4>
            <div
              className="relative rounded-lg p-6 h-48 flex flex-col justify-between overflow-hidden"
              style={{ background: currentGradient }}
            >
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-white/90 rounded-full text-xs font-semibold mb-2">
                  NEW
                </div>
                <h3 className="text-white font-bold text-lg drop-shadow-lg">
                  Product Name
                </h3>
                <p className="text-white/90 text-sm drop-shadow">
                  Sample description
                </p>
              </div>
              <div className="relative z-10">
                <div className="text-white font-bold text-2xl drop-shadow-lg">
                  $19.99
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Card Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">As Bundle Card</h4>
            <div
              className="relative rounded-lg p-6 h-48 overflow-hidden"
              style={{ background: currentGradient }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-10" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold mb-2">
                    BUNDLE DEAL
                  </div>
                  <h3 className="text-white font-bold text-xl drop-shadow-lg mb-2">
                    Ultimate Bundle
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow">
                    Save 25% on this combo
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-white/80 text-sm line-through drop-shadow">
                      $99.99
                    </div>
                    <div className="text-white font-bold text-3xl drop-shadow-lg">
                      $74.99
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg font-semibold text-sm">
                    Add to Cart
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Banner Preview */}
          <div>
            <h4 className="text-sm font-medium mb-2">As Hero Banner</h4>
            <div
              className="relative rounded-lg p-8 h-32 flex items-center overflow-hidden"
              style={{ background: currentGradient }}
            >
              <div className="relative z-10">
                <h2 className="text-white font-bold text-2xl drop-shadow-lg mb-2">
                  Special Offer
                </h2>
                <p className="text-white/90 drop-shadow">
                  Limited time only - Shop now and save!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
