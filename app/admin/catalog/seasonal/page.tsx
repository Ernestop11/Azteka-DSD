'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Save, Plus, Edit2, Trash2, Calendar, Snowflake, Sun, Skull } from 'lucide-react'
import ProductImageUpload from '../../products/ProductImageUpload'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface SeasonalTheme {
  id?: string
  season: 'christmas' | 'summer' | 'dia-muertos'
  active: boolean
  title: string
  subtitle: string
  description: string
  imageUrl: string
  startDate: string
  endDate: string
}

const seasonConfig = {
  christmas: { icon: Snowflake, label: 'Christmas', color: 'text-red-600' },
  summer: { icon: Sun, label: 'Summer', color: 'text-cyan-600' },
  'dia-muertos': { icon: Skull, label: 'Día de Muertos', color: 'text-orange-600' },
}

export default function SeasonalThemesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingTheme, setEditingTheme] = useState<SeasonalTheme | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Fetch themes
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['seasonal-themes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/catalog/seasonal')
      if (!res.ok) throw new Error('Failed to fetch themes')
      const data = await res.json()
      return data.data || []
    },
  })

  // Save theme
  const saveTheme = useMutation({
    mutationFn: async (theme: SeasonalTheme) => {
      let imageUrl = theme.imageUrl

      // Upload image if new file exists
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('season', theme.season)

        const uploadRes = await fetch('/api/admin/catalog/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.imageUrl
        }
      }

      const method = theme.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/catalog/seasonal', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...theme, imageUrl }),
      })
      if (!res.ok) throw new Error('Failed to save theme')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonal-themes'] })
      toast('Theme saved successfully', 'success')
      setEditingTheme(null)
      setImageFile(null)
    },
    onError: (error: any) => {
      toast('Failed to save theme: ' + error.message, 'error')
    },
  })

  // Delete theme
  const deleteTheme = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/catalog/seasonal?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete theme')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonal-themes'] })
      toast('Theme deleted successfully', 'success')
    },
    onError: () => {
      toast('Failed to delete theme', 'error')
    },
  })

  // Toggle active
  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch('/api/admin/catalog/seasonal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      })
      if (!res.ok) throw new Error('Failed to update theme')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonal-themes'] })
    },
  })

  const handleNew = () => {
    setEditingTheme({
      season: 'christmas',
      active: false,
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      startDate: '',
      endDate: '',
    })
  }

  const handleEdit = (theme: SeasonalTheme) => {
    setEditingTheme(theme)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading seasonal themes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seasonal Themes</h1>
            <p className="text-gray-600 mt-1">Manage seasonal collections and themes</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Theme
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {themes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No seasonal themes configured
                  </TableCell>
                </TableRow>
              ) : (
                themes.map((theme: SeasonalTheme) => {
                  const config = seasonConfig[theme.season]
                  const Icon = config.icon
                  return (
                    <TableRow key={theme.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-medium">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>{theme.title}</TableCell>
                      <TableCell>{theme.subtitle}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleActive.mutate({ id: theme.id!, active: !theme.active })}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            theme.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {theme.active ? 'Active' : 'Inactive'}
                        </button>
                      </TableCell>
                      <TableCell>
                        {theme.startDate && theme.endDate ? (
                          <div className="text-sm text-gray-600">
                            {new Date(theme.startDate).toLocaleDateString()} -{' '}
                            {new Date(theme.endDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(theme)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this theme?')) {
                                deleteTheme.mutate(theme.id!)
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Editor Modal */}
        {editingTheme && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTheme.id ? 'Edit Theme' : 'New Theme'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
                  <select
                    value={editingTheme.season}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, season: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="christmas">Christmas</option>
                    <option value="summer">Summer</option>
                    <option value="dia-muertos">Día de Muertos</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <Input
                      value={editingTheme.title}
                      onChange={(e) => setEditingTheme({ ...editingTheme, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <Input
                      value={editingTheme.subtitle}
                      onChange={(e) => setEditingTheme({ ...editingTheme, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingTheme.description}
                    onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={editingTheme.startDate}
                      onChange={(e) => setEditingTheme({ ...editingTheme, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={editingTheme.endDate}
                      onChange={(e) => setEditingTheme({ ...editingTheme, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme Image</label>
                  <ProductImageUpload
                    productId={editingTheme.id || `seasonal-${editingTheme.season}`}
                    currentImageUrl={getPublicImageUrl(editingTheme.imageUrl)}
                    onUploadComplete={(url) => setEditingTheme({ ...editingTheme, imageUrl: url })}
                    onFileSelect={setImageFile}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="theme-active"
                    checked={editingTheme.active}
                    onChange={(e) => setEditingTheme({ ...editingTheme, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="theme-active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTheme(null)
                  setImageFile(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => saveTheme.mutate(editingTheme)} disabled={saveTheme.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {saveTheme.isPending ? 'Saving...' : 'Save Theme'}
              </Button>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

