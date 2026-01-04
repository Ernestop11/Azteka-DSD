'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Building2,
  ChevronLeft,
  Loader2,
  Plus,
  Minus,
  Move,
  Save,
  Trash2,
  RotateCcw,
  Layers,
  Grid3X3,
  Box,
  Home,
  PenTool,
  Eye,
  Settings,
  Square,
  RectangleHorizontal,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Edit3,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  Download,
  Type,
  Package,
  ChevronRight,
  Info,
  Lightbulb,
  MousePointer2,
  Hand,
  GripHorizontal,
  CornerRightDown,
  AlertCircle,
  BookOpen
} from 'lucide-react'

// Types for warehouse map
interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface ShelfUnit {
  id: string
  type: 'shelf' | 'beam' | 'hallway' | 'office' | 'stairs' | 'dock' | 'wall' | 'label'
  position: Position
  size: Size
  rotation: number
  label: string
  levels?: number // For shelves - how many levels
  color?: string
  zone?: string
  floor: number
  fontSize?: number // For label type
  textColor?: string // For label type
  products?: ShelfProduct[] // Products assigned to this shelf
}

interface ShelfProduct {
  productId: string
  name: string
  sku?: string
  level: number // Which level (1-5)
  position: number // Position on shelf (1-10)
}

interface WarehouseFloor {
  id: number
  name: string
  width: number
  height: number
  items: ShelfUnit[]
  backgroundColor?: string
}

interface WarehouseMap {
  id?: string
  name: string
  floors: WarehouseFloor[]
  createdAt?: string
  updatedAt?: string
}

// Item templates for toolbar
const ITEM_TEMPLATES: { type: ShelfUnit['type']; label: string; icon: any; defaultSize: Size; color: string }[] = [
  { type: 'shelf', label: 'Shelf', icon: Box, defaultSize: { width: 120, height: 40 }, color: '#3B82F6' },
  { type: 'beam', label: 'Support Beam', icon: Square, defaultSize: { width: 20, height: 20 }, color: '#6B7280' },
  { type: 'hallway', label: 'Hallway', icon: RectangleHorizontal, defaultSize: { width: 200, height: 60 }, color: '#F59E0B' },
  { type: 'office', label: 'Office', icon: Home, defaultSize: { width: 100, height: 80 }, color: '#10B981' },
  { type: 'stairs', label: 'Stairs', icon: ArrowUp, defaultSize: { width: 60, height: 80 }, color: '#8B5CF6' },
  { type: 'dock', label: 'Loading Dock', icon: RectangleHorizontal, defaultSize: { width: 150, height: 50 }, color: '#EF4444' },
  { type: 'wall', label: 'Wall', icon: Square, defaultSize: { width: 200, height: 10 }, color: '#1F2937' },
  { type: 'label', label: 'Text Label', icon: Type, defaultSize: { width: 100, height: 30 }, color: 'transparent' },
]

const ZONE_COLORS: Record<string, string> = {
  'A': '#3B82F6',
  'B': '#10B981',
  'C': '#F59E0B',
  'D': '#EF4444',
  'E': '#8B5CF6',
  'F': '#EC4899',
  'HALL': '#F97316',
  'OFFICE': '#14B8A6',
  'DOCK': '#DC2626',
}

export default function WarehouseMapBuilderPage() {
  // Map state
  const [warehouseMap, setWarehouseMap] = useState<WarehouseMap>({
    name: 'Azteka Warehouse',
    floors: [
      { id: 1, name: 'Floor 1 - Main', width: 800, height: 600, items: [], backgroundColor: '#1E293B' },
      { id: 2, name: 'Floor 2 - Upstairs/Attic', width: 800, height: 600, items: [], backgroundColor: '#1E293B' },
    ]
  })

  const [currentFloor, setCurrentFloor] = useState(1)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<'select' | 'pan' | ShelfUnit['type']>('select')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingItem, setEditingItem] = useState<ShelfUnit | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [shelfDetailItem, setShelfDetailItem] = useState<ShelfUnit | null>(null)

  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'se' | 'e' | 's' | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get current floor data
  const currentFloorData = warehouseMap.floors.find(f => f.id === currentFloor) || warehouseMap.floors[0]

  // Load saved map
  useEffect(() => {
    loadMap()
  }, [])

  const loadMap = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/staff/warehouse-map', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.map) {
          setWarehouseMap(data.map)
        }
      }
    } catch (error) {
      console.error('Failed to load warehouse map:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveMap = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/staff/warehouse-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ map: warehouseMap })
      })
      if (res.ok) {
        alert('Map saved successfully!')
      } else {
        alert('Failed to save map')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save map')
    } finally {
      setSaving(false)
    }
  }

  // Generate unique ID
  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Add item to canvas
  const addItem = (type: ShelfUnit['type']) => {
    const template = ITEM_TEMPLATES.find(t => t.type === type)
    if (!template) return

    const newItem: ShelfUnit = {
      id: generateId(),
      type,
      position: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
      size: { ...template.defaultSize },
      rotation: 0,
      label: type === 'label' ? 'New Label' : `${template.label} ${currentFloorData.items.filter(i => i.type === type).length + 1}`,
      levels: type === 'shelf' ? 3 : undefined,
      color: template.color,
      floor: currentFloor,
      zone: type === 'shelf' ? 'A' : undefined,
      fontSize: type === 'label' ? 14 : undefined,
      textColor: type === 'label' ? '#FFFFFF' : undefined,
      products: type === 'shelf' ? [] : undefined
    }

    setWarehouseMap(prev => ({
      ...prev,
      floors: prev.floors.map(f =>
        f.id === currentFloor
          ? { ...f, items: [...f.items, newItem] }
          : f
      )
    }))

    setSelectedItem(newItem.id)
    setSelectedTool('select')
  }

  // Delete selected item
  const deleteItem = (itemId: string) => {
    setWarehouseMap(prev => ({
      ...prev,
      floors: prev.floors.map(f =>
        f.id === currentFloor
          ? { ...f, items: f.items.filter(i => i.id !== itemId) }
          : f
      )
    }))
    setSelectedItem(null)
  }

  // Update item
  const updateItem = (itemId: string, updates: Partial<ShelfUnit>) => {
    setWarehouseMap(prev => ({
      ...prev,
      floors: prev.floors.map(f =>
        f.id === currentFloor
          ? { ...f, items: f.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : f
      )
    }))
  }

  // Duplicate item
  const duplicateItem = (itemId: string) => {
    const item = currentFloorData.items.find(i => i.id === itemId)
    if (!item) return

    const newItem: ShelfUnit = {
      ...item,
      id: generateId(),
      position: { x: item.position.x + 20, y: item.position.y + 20 },
      label: `${item.label} (copy)`
    }

    setWarehouseMap(prev => ({
      ...prev,
      floors: prev.floors.map(f =>
        f.id === currentFloor
          ? { ...f, items: [...f.items, newItem] }
          : f
      )
    }))

    setSelectedItem(newItem.id)
  }

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === 'select' || selectedTool === 'pan') {
      // Check if clicked on empty area
      const target = e.target as HTMLElement
      if (target.dataset.canvasArea === 'true') {
        setSelectedItem(null)
      }
    } else {
      // Add new item at click position
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom
        const y = (e.clientY - rect.top - pan.y) / zoom

        const template = ITEM_TEMPLATES.find(t => t.type === selectedTool)
        if (template) {
          const newItem: ShelfUnit = {
            id: generateId(),
            type: selectedTool,
            position: { x, y },
            size: { ...template.defaultSize },
            rotation: 0,
            label: `${template.label} ${currentFloorData.items.filter(i => i.type === selectedTool).length + 1}`,
            levels: selectedTool === 'shelf' ? 3 : undefined,
            color: template.color,
            floor: currentFloor,
            zone: selectedTool === 'shelf' ? 'A' : undefined
          }

          setWarehouseMap(prev => ({
            ...prev,
            floors: prev.floors.map(f =>
              f.id === currentFloor
                ? { ...f, items: [...f.items, newItem] }
                : f
            )
          }))

          setSelectedItem(newItem.id)
        }
      }
    }
  }

  // Handle item drag
  const handleItemMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    if (selectedTool !== 'select') return

    setSelectedItem(itemId)
    setIsDragging(true)

    const item = currentFloorData.items.find(i => i.id === itemId)
    if (item) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragStart({
          x: e.clientX - (item.position.x * zoom + pan.x),
          y: e.clientY - (item.position.y * zoom + pan.y)
        })
      }
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isResizing && selectedItem && resizeStart && resizeHandle) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const deltaX = (e.clientX - resizeStart.x) / zoom
        const deltaY = (e.clientY - resizeStart.y) / zoom

        let newWidth = resizeStart.width
        let newHeight = resizeStart.height

        if (resizeHandle === 'se' || resizeHandle === 'e') {
          newWidth = Math.max(30, resizeStart.width + deltaX)
        }
        if (resizeHandle === 'se' || resizeHandle === 's') {
          newHeight = Math.max(20, resizeStart.height + deltaY)
        }

        updateItem(selectedItem, { size: { width: newWidth, height: newHeight } })
      }
    } else if (isDragging && selectedItem) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - dragStart.x - pan.x) / zoom
        const y = (e.clientY - dragStart.y - pan.y) / zoom
        updateItem(selectedItem, { position: { x: Math.max(0, x), y: Math.max(0, y) } })
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    }
  }, [isDragging, selectedItem, dragStart, pan, zoom, isPanning, panStart, isResizing, resizeStart, resizeHandle])

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsPanning(false)
    setIsResizing(false)
    setResizeHandle(null)
    setResizeStart(null)
  }

  // Start resize
  const handleResizeStart = (e: React.MouseEvent, handle: 'se' | 'e' | 's', itemId: string) => {
    e.stopPropagation()
    e.preventDefault()

    const item = currentFloorData.items.find(i => i.id === itemId)
    if (!item) return

    setSelectedItem(itemId)
    setIsResizing(true)
    setResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.size.width,
      height: item.size.height
    })
  }

  // Pan handling
  const handlePanStart = (e: React.MouseEvent) => {
    if (selectedTool === 'pan' || e.button === 1) { // Middle mouse or pan tool
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Clear floor
  const clearFloor = () => {
    if (confirm('Are you sure you want to clear all items on this floor?')) {
      setWarehouseMap(prev => ({
        ...prev,
        floors: prev.floors.map(f =>
          f.id === currentFloor
            ? { ...f, items: [] }
            : f
        )
      }))
      setSelectedItem(null)
    }
  }

  // Render item on canvas
  const renderItem = (item: ShelfUnit) => {
    const isSelected = selectedItem === item.id
    const zoneColor = item.zone ? ZONE_COLORS[item.zone] : item.color

    // Label items render differently
    if (item.type === 'label') {
      return (
        <div
          key={item.id}
          className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}
          style={{
            left: item.position.x * zoom,
            top: item.position.y * zoom,
            width: item.size.width * zoom,
            height: item.size.height * zoom,
            transform: `rotate(${item.rotation}deg)`,
            zIndex: isSelected ? 100 : 10,
          }}
          onMouseDown={(e) => handleItemMouseDown(e, item.id)}
          onDoubleClick={() => setEditingItem(item)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              color: item.textColor || '#FFFFFF',
              fontSize: (item.fontSize || 14) * zoom,
              fontWeight: 'bold',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}
          >
            {item.label}
          </div>

          {/* Resize handles for selected label */}
          {isSelected && (
            <>
              {/* Right edge handle */}
              <div
                className="absolute top-1/2 -right-2 w-4 h-8 bg-cyan-400 rounded cursor-e-resize transform -translate-y-1/2 flex items-center justify-center"
                onMouseDown={(e) => handleResizeStart(e, 'e', item.id)}
              >
                <GripHorizontal className="w-3 h-3 text-white rotate-90" />
              </div>
              {/* Bottom edge handle */}
              <div
                className="absolute -bottom-2 left-1/2 w-8 h-4 bg-cyan-400 rounded cursor-s-resize transform -translate-x-1/2 flex items-center justify-center"
                onMouseDown={(e) => handleResizeStart(e, 's', item.id)}
              >
                <GripHorizontal className="w-3 h-3 text-white" />
              </div>
              {/* Corner handle */}
              <div
                className="absolute -right-2 -bottom-2 w-5 h-5 bg-cyan-400 rounded-full cursor-se-resize flex items-center justify-center"
                onMouseDown={(e) => handleResizeStart(e, 'se', item.id)}
              >
                <CornerRightDown className="w-3 h-3 text-white" />
              </div>
            </>
          )}
        </div>
      )
    }

    return (
      <div
        key={item.id}
        className={`absolute cursor-move transition-shadow select-none ${isSelected ? 'ring-2 ring-white shadow-lg' : ''}`}
        style={{
          left: item.position.x * zoom,
          top: item.position.y * zoom,
          width: item.size.width * zoom,
          height: item.size.height * zoom,
          backgroundColor: zoneColor || item.color,
          transform: `rotate(${item.rotation}deg)`,
          borderRadius: item.type === 'beam' ? '50%' : '4px',
          opacity: 0.9,
          zIndex: isSelected ? 100 : 10,
        }}
        onMouseDown={(e) => handleItemMouseDown(e, item.id)}
        onDoubleClick={() => item.type === 'shelf' ? setShelfDetailItem(item) : setEditingItem(item)}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-1 overflow-hidden">
          <span className="text-[10px] font-bold leading-tight truncate w-full" style={{ fontSize: Math.max(8, 10 * zoom) }}>
            {item.label}
          </span>
          {item.type === 'shelf' && item.levels && (
            <span className="text-[8px] opacity-75" style={{ fontSize: Math.max(6, 8 * zoom) }}>
              {item.levels} levels
            </span>
          )}
          {item.zone && (
            <span className="text-[8px] font-mono bg-black/30 px-1 rounded mt-0.5" style={{ fontSize: Math.max(6, 8 * zoom) }}>
              Zone {item.zone}
            </span>
          )}
          {item.type === 'shelf' && item.products && item.products.length > 0 && (
            <span className="text-[8px] bg-emerald-500/70 px-1 rounded mt-0.5" style={{ fontSize: Math.max(6, 8 * zoom) }}>
              {item.products.length} products
            </span>
          )}
        </div>

        {/* Resize handles for selected item */}
        {isSelected && (
          <>
            {/* Right edge handle */}
            <div
              className="absolute top-1/2 -right-2 w-4 h-8 bg-white rounded cursor-e-resize transform -translate-y-1/2 flex items-center justify-center shadow-lg"
              onMouseDown={(e) => handleResizeStart(e, 'e', item.id)}
            >
              <GripHorizontal className="w-3 h-3 text-slate-600 rotate-90" />
            </div>
            {/* Bottom edge handle */}
            <div
              className="absolute -bottom-2 left-1/2 w-8 h-4 bg-white rounded cursor-s-resize transform -translate-x-1/2 flex items-center justify-center shadow-lg"
              onMouseDown={(e) => handleResizeStart(e, 's', item.id)}
            >
              <GripHorizontal className="w-3 h-3 text-slate-600" />
            </div>
            {/* Corner handle */}
            <div
              className="absolute -right-2 -bottom-2 w-5 h-5 bg-white rounded-full cursor-se-resize flex items-center justify-center shadow-lg"
              onMouseDown={(e) => handleResizeStart(e, 'se', item.id)}
            >
              <CornerRightDown className="w-3 h-3 text-slate-600" />
            </div>
          </>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Loading Map Builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 px-3 py-2 flex items-center gap-2 z-20">
        <a href="/staff" className="p-1 text-white/80 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </a>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Warehouse Map Builder
          </h1>
        </div>
        <button onClick={() => setShowHelp(true)} className="p-1.5 bg-white/20 rounded-lg">
          <HelpCircle className="w-4 h-4 text-white" />
        </button>
        <button onClick={saveMap} disabled={saving} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-1 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      {/* Floor Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex items-center gap-2 overflow-x-auto">
        {warehouseMap.floors.map(floor => (
          <button
            key={floor.id}
            onClick={() => setCurrentFloor(floor.id)}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              currentFloor === floor.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {floor.name}
            <span className="text-xs opacity-70">({floor.items.length})</span>
          </button>
        ))}
        <button
          onClick={() => {
            const newFloorId = warehouseMap.floors.length + 1
            setWarehouseMap(prev => ({
              ...prev,
              floors: [...prev.floors, {
                id: newFloorId,
                name: `Floor ${newFloorId}`,
                width: 800,
                height: 600,
                items: [],
                backgroundColor: '#1E293B'
              }]
            }))
            setCurrentFloor(newFloorId)
          }}
          className="px-2 py-1.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex items-center gap-1 overflow-x-auto">
        {/* Selection Tools */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2 mr-2">
          <button
            onClick={() => setSelectedTool('select')}
            className={`p-2 rounded-lg ${selectedTool === 'select' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Select (V)"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool('pan')}
            className={`p-2 rounded-lg ${selectedTool === 'pan' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Pan (H)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Item Tools */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2 mr-2">
          {ITEM_TEMPLATES.map(template => (
            <button
              key={template.type}
              onClick={() => setSelectedTool(template.type)}
              className={`p-2 rounded-lg flex items-center gap-1 ${
                selectedTool === template.type
                  ? 'ring-2 ring-white'
                  : 'hover:bg-slate-700'
              }`}
              style={{ backgroundColor: selectedTool === template.type ? template.color : '#334155' }}
              title={template.label}
            >
              <template.icon className="w-4 h-4 text-white" />
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2 mr-2">
          <button onClick={() => handleZoom(-0.1)} className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => handleZoom(0.1)} className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={resetView} className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg" title="Reset View">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Clear */}
        <button onClick={clearFloor} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg" title="Clear Floor">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-slate-950"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(100,116,139,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100,116,139,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="absolute cursor-crosshair"
          data-canvas-area="true"
          style={{
            width: currentFloorData.width * zoom,
            height: currentFloorData.height * zoom,
            left: pan.x,
            top: pan.y,
            backgroundColor: currentFloorData.backgroundColor,
            border: '2px dashed rgba(100,116,139,0.3)',
            borderRadius: '8px',
          }}
          onClick={handleCanvasClick}
          onMouseDown={handlePanStart}
        >
          {/* Canvas Label */}
          <div className="absolute -top-6 left-0 text-slate-500 text-xs">
            {currentFloorData.name} ({currentFloorData.width}x{currentFloorData.height})
          </div>

          {/* Render Items */}
          {currentFloorData.items.map(renderItem)}
        </div>

        {/* Instructions overlay when empty */}
        {currentFloorData.items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-800/90 rounded-xl p-6 text-center max-w-md mx-4">
              <Building2 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Start Building Your Map</h3>
              <p className="text-slate-400 text-sm mb-4">
                Select a tool from the toolbar above, then click on the canvas to place items.
                Build your warehouse layout with shelves, hallways, offices, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {ITEM_TEMPLATES.slice(0, 4).map(t => (
                  <span key={t.type} className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: t.color }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Item Panel */}
      {selectedItem && (
        <div className="absolute bottom-20 left-2 right-2 bg-slate-900 rounded-xl p-3 border border-slate-700 shadow-xl z-30" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
          {(() => {
            const item = currentFloorData.items.find(i => i.id === selectedItem)
            if (!item) return null

            return (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.zone ? ZONE_COLORS[item.zone] : item.color }}>
                  {ITEM_TEMPLATES.find(t => t.type === item.type)?.icon && (
                    <Box className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{item.label}</p>
                  <p className="text-slate-400 text-xs">{item.type} • {Math.round(item.position.x)}, {Math.round(item.position.y)}</p>
                </div>

                {/* Zone selector for shelves */}
                {item.type === 'shelf' && (
                  <div className="flex gap-0.5">
                    {Object.keys(ZONE_COLORS).filter(z => !['HALL', 'OFFICE', 'DOCK'].includes(z)).map(zone => (
                      <button
                        key={zone}
                        onClick={() => updateItem(item.id, { zone })}
                        className={`w-6 h-6 rounded text-[10px] font-bold ${item.zone === zone ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: ZONE_COLORS[zone] }}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                )}

                {/* Levels control for shelves */}
                {item.type === 'shelf' && (
                  <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateItem(item.id, { levels: Math.max(1, (item.levels || 1) - 1) })}
                      className="text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-white text-xs w-6 text-center">{item.levels || 1}L</span>
                    <button
                      onClick={() => updateItem(item.id, { levels: Math.min(5, (item.levels || 1) + 1) })}
                      className="text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <button onClick={() => setEditingItem(item)} className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateItem(item.id)} className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })()}
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Items: <span className="text-white font-medium">{currentFloorData.items.length}</span>
          </span>
          <span className="text-slate-400">
            Shelves: <span className="text-blue-400 font-medium">{currentFloorData.items.filter(i => i.type === 'shelf').length}</span>
          </span>
          <span className="text-slate-400">
            Zones: <span className="text-purple-400 font-medium">
              {new Set(currentFloorData.items.filter(i => i.zone).map(i => i.zone)).size}
            </span>
          </span>
        </div>
        <div className="text-slate-500">
          {selectedTool === 'select' ? 'Click to select • Drag to move' :
           selectedTool === 'pan' ? 'Drag to pan view' :
           `Click to place ${selectedTool}`}
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
          <div className="bg-slate-900 rounded-xl max-w-md w-full p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Edit Item</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Label</label>
                <input
                  type="text"
                  value={editingItem.label}
                  onChange={e => {
                    setEditingItem({ ...editingItem, label: e.target.value })
                    updateItem(editingItem.id, { label: e.target.value })
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Width</label>
                  <input
                    type="number"
                    value={editingItem.size.width}
                    onChange={e => {
                      const width = parseInt(e.target.value) || 50
                      setEditingItem({ ...editingItem, size: { ...editingItem.size, width } })
                      updateItem(editingItem.id, { size: { ...editingItem.size, width } })
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Height</label>
                  <input
                    type="number"
                    value={editingItem.size.height}
                    onChange={e => {
                      const height = parseInt(e.target.value) || 50
                      setEditingItem({ ...editingItem, size: { ...editingItem.size, height } })
                      updateItem(editingItem.id, { size: { ...editingItem.size, height } })
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">X Position</label>
                  <input
                    type="number"
                    value={Math.round(editingItem.position.x)}
                    onChange={e => {
                      const x = parseInt(e.target.value) || 0
                      setEditingItem({ ...editingItem, position: { ...editingItem.position, x } })
                      updateItem(editingItem.id, { position: { ...editingItem.position, x } })
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(editingItem.position.y)}
                    onChange={e => {
                      const y = parseInt(e.target.value) || 0
                      setEditingItem({ ...editingItem, position: { ...editingItem.position, y } })
                      updateItem(editingItem.id, { position: { ...editingItem.position, y } })
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>

              {editingItem.type === 'shelf' && (
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Shelf Levels</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => {
                          setEditingItem({ ...editingItem, levels: level })
                          updateItem(editingItem.id, { levels: level })
                        }}
                        className={`flex-1 py-2 rounded-lg font-medium ${
                          editingItem.levels === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Label-specific options */}
              {editingItem.type === 'label' && (
                <>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Font Size</label>
                    <div className="flex gap-2">
                      {[10, 12, 14, 16, 20, 24, 32].map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            setEditingItem({ ...editingItem, fontSize: size })
                            updateItem(editingItem.id, { fontSize: size })
                          }}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                            (editingItem.fontSize || 14) === size
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Text Color</label>
                    <div className="flex gap-2">
                      {['#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'].map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setEditingItem({ ...editingItem, textColor: color })
                            updateItem(editingItem.id, { textColor: color })
                          }}
                          className={`w-8 h-8 rounded-lg ${(editingItem.textColor || '#FFFFFF') === color ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Rotation (degrees)</label>
                <div className="flex gap-2">
                  {[0, 45, 90, 135, 180].map(rot => (
                    <button
                      key={rot}
                      onClick={() => {
                        setEditingItem({ ...editingItem, rotation: rot })
                        updateItem(editingItem.id, { rotation: rot })
                      }}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                        editingItem.rotation === rot
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {rot}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditingItem(null)}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Done
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Help/Tutorial Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Map Builder Tutorial</h3>
                  <p className="text-slate-400 text-sm">Learn how to build your warehouse map</p>
                </div>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Step 1: Getting Started */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                  <h4 className="text-blue-400 font-bold">Getting Started - Select a Tool</h4>
                </div>
                <p className="text-slate-300 mb-3">Look at the toolbar at the top. You'll see different colored buttons for each item type:</p>
                <div className="grid grid-cols-2 gap-3">
                  {ITEM_TEMPLATES.map(t => (
                    <div key={t.type} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: t.color || '#64748b' }}>
                        <t.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-medium">{t.label}</span>
                        <p className="text-slate-400 text-xs">
                          {t.type === 'shelf' && 'For product storage'}
                          {t.type === 'hallway' && 'Walking paths'}
                          {t.type === 'wall' && 'Room dividers'}
                          {t.type === 'office' && 'Work areas'}
                          {t.type === 'dock' && 'Loading areas'}
                          {t.type === 'stairs' && 'Floor access'}
                          {t.type === 'beam' && 'Support columns'}
                          {t.type === 'label' && 'Add text/notes'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Placing Items */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                  <h4 className="text-emerald-400 font-bold">Placing Items on the Map</h4>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <MousePointer2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Tap</strong> on a tool button, then <strong>tap</strong> on the dark canvas area where you want to place it</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Move className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Use the <strong>Select tool</strong> (arrow icon) to drag items around</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hand className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Use the <strong>Pan tool</strong> to scroll around the canvas</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Resizing */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                  <h4 className="text-purple-400 font-bold">Resizing Items</h4>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p>When you select an item, you'll see <strong>resize handles</strong> (white circles/bars):</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                      <GripHorizontal className="w-4 h-4 text-white mx-auto mb-1 rotate-90" />
                      <span className="text-xs">Right edge = Width</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                      <GripHorizontal className="w-4 h-4 text-white mx-auto mb-1" />
                      <span className="text-xs">Bottom = Height</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                      <CornerRightDown className="w-4 h-4 text-white mx-auto mb-1" />
                      <span className="text-xs">Corner = Both</span>
                    </div>
                  </div>
                  <p className="text-amber-400 mt-2">Drag these handles to resize your items!</p>
                </div>
              </div>

              {/* Step 4: Editing Details */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
                  <h4 className="text-amber-400 font-bold">Editing Item Details</h4>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Double-tap</strong> any item to open the edit panel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Double-tap a shelf</strong> to see its levels and assign products</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Type className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Change labels, sizes, rotation, and zone assignments</span>
                  </div>
                </div>
              </div>

              {/* Step 5: Zones */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">5</div>
                  <h4 className="text-pink-400 font-bold">Organizing with Zones</h4>
                </div>
                <p className="text-slate-300 mb-3">Assign zones (A-F) to shelves to group products by area:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ZONE_COLORS).filter(([k]) => !['HALL', 'OFFICE', 'DOCK'].includes(k)).map(([zone, color]) => (
                    <span key={zone} className="px-3 py-1.5 rounded-lg text-sm text-white font-bold" style={{ backgroundColor: color }}>
                      Zone {zone}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mt-2">Click a zone button in the bottom panel when a shelf is selected</p>
              </div>

              {/* Step 6: Saving */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">6</div>
                  <h4 className="text-emerald-400 font-bold">Don't Forget to Save!</h4>
                </div>
                <p className="text-slate-300">Click the green <strong>Save</strong> button in the top right to save your work. Your map will load automatically next time you open the builder.</p>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-yellow-400 font-bold">Pro Tips</h4>
                </div>
                <ul className="space-y-1 text-slate-300 text-sm">
                  <li>• Use <strong>Copy</strong> to duplicate items quickly</li>
                  <li>• Use <strong>Zoom</strong> controls for detailed work</li>
                  <li>• Add <strong>Text Labels</strong> for aisle names, notes, etc.</li>
                  <li>• Switch between <strong>Floor tabs</strong> for multi-level warehouses</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Got it, let's build!
            </button>
          </div>
        </div>
      )}

      {/* Shelf Detail Modal */}
      {shelfDetailItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShelfDetailItem(null)}>
          <div className="bg-slate-900 rounded-xl max-w-lg w-full p-5 max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: shelfDetailItem.zone ? ZONE_COLORS[shelfDetailItem.zone] : '#3B82F6' }}>
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{shelfDetailItem.label}</h3>
                  <p className="text-slate-400 text-sm">
                    Zone {shelfDetailItem.zone || 'N/A'} • {shelfDetailItem.levels || 3} Levels
                  </p>
                </div>
              </div>
              <button onClick={() => setShelfDetailItem(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shelf Visualization */}
            <div className="mb-4">
              <h4 className="text-slate-400 text-xs uppercase font-bold mb-2">Shelf Levels</h4>
              <div className="space-y-2">
                {Array.from({ length: shelfDetailItem.levels || 3 }).map((_, levelIdx) => {
                  const levelNum = (shelfDetailItem.levels || 3) - levelIdx
                  const levelProducts = shelfDetailItem.products?.filter(p => p.level === levelNum) || []

                  return (
                    <div key={levelNum} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">Level {levelNum}</span>
                        <span className="text-slate-400 text-xs">{levelProducts.length} products</span>
                      </div>
                      {levelProducts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {levelProducts.map((prod, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded">
                              {prod.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs italic">No products assigned to this level</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Edit Properties */}
            <div className="space-y-3 border-t border-slate-700 pt-4">
              <h4 className="text-slate-400 text-xs uppercase font-bold">Quick Edit</h4>

              {/* Label */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Shelf Name</label>
                <input
                  type="text"
                  value={shelfDetailItem.label}
                  onChange={e => {
                    const newLabel = e.target.value
                    setShelfDetailItem({ ...shelfDetailItem, label: newLabel })
                    updateItem(shelfDetailItem.id, { label: newLabel })
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Zone Selection */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Zone</label>
                <div className="flex gap-2">
                  {Object.entries(ZONE_COLORS).filter(([k]) => !['HALL', 'OFFICE', 'DOCK'].includes(k)).map(([zone, color]) => (
                    <button
                      key={zone}
                      onClick={() => {
                        setShelfDetailItem({ ...shelfDetailItem, zone })
                        updateItem(shelfDetailItem.id, { zone })
                      }}
                      className={`flex-1 py-2 rounded-lg font-bold text-white ${shelfDetailItem.zone === zone ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: color }}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Number of Levels</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => {
                        setShelfDetailItem({ ...shelfDetailItem, levels: level })
                        updateItem(shelfDetailItem.id, { levels: level })
                      }}
                      className={`flex-1 py-2 rounded-lg font-bold ${
                        shelfDetailItem.levels === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-300 text-xs">
                  Product assignments will be populated during inventory counting. As products are scanned, they'll be mapped to their shelf locations here.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShelfDetailItem(null)
                  setEditingItem(shelfDetailItem)
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Full Edit
              </button>
              <button
                onClick={() => setShelfDetailItem(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
