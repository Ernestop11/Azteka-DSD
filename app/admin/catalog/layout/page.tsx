'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Save, Upload, Image as ImageIcon, Settings, ArrowLeft, Eye, Package, TrendingUp, Sparkles, Droplet, Snowflake, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProductImageUpload from '../../products/ProductImageUpload'
import ProductSectionManager from '@/components/admin/ProductSectionManager'
import { getPublicImageUrl } from '@/lib/imageUrl'

interface HeroBannerSettings {
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  theme: 'christmas' | 'summer' | 'dia-muertos' | 'default'
  active: boolean
}

interface MarqueeSettings {
  active: boolean
  title: string
  speed: number
  direction: 'left' | 'right'
  pauseOnHover: boolean
}

export default function CatalogLayoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Hero Banner State
  const [heroBanner, setHeroBanner] = useState<HeroBannerSettings>({
    title: 'Premium Wholesale Products',
    subtitle: 'Your Trusted Distribution Partner',
    imageUrl: '/hero-banner.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/catalog',
    theme: 'default',
    active: true,
  })
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)

  // Marquee State
  const [marquee, setMarquee] = useState<MarqueeSettings>({
    active: false,
    title: 'Trending Now',
    speed: 30,
    direction: 'left',
    pauseOnHover: true,
  })

  // Fetch current settings
  const { data: layoutData, isLoading } = useQuery({
    queryKey: ['catalog-layout'],
    queryFn: async () => {
      const res = await fetch('/api/admin/catalog/layout')
      if (!res.ok) throw new Error('Failed to fetch layout settings')
      return res.json()
    },
  })

  // Section configurations state
  const [sectionConfigs, setSectionConfigs] = useState<Record<string, string[]>>({
    showcase: [],
    trending: [],
    sabritas: [],
    barcel: [],
    drinks: [],
    seasonal: [],
  })

  // Load settings into state
  useEffect(() => {
    if (layoutData) {
      const data = layoutData
      if (data.heroBanner) {
        setHeroBanner({
          title: data.heroBanner.title || data.heroBanner.headline || '',
          subtitle: data.heroBanner.subtitle || data.heroBanner.subheadline || '',
          imageUrl: data.heroBanner.imageUrl || '',
          ctaText: data.heroBanner.ctaText || '',
          ctaLink: data.heroBanner.ctaLink || '',
          theme: (data.heroBanner.theme as any) || 'default',
          active: data.heroBanner.active !== false,
        })
      }
      if (data.marquee) setMarquee(data.marquee)
      
      // Load section configurations
      loadSectionConfigs()
    }
  }, [layoutData])

  // Load section configurations from API
  const loadSectionConfigs = async () => {
    try {
      const keys = ['section_showcase', 'section_trending', 'section_sabritas', 'section_barcel', 'section_drinks', 'section_seasonal']
      const configs: Record<string, string[]> = {}
      
      for (const key of keys) {
        try {
          const res = await fetch(`/api/admin/catalog/layout?key=${key}`)
          if (res.ok) {
            const data = await res.json()
            if (data.value && Array.isArray(data.value)) {
              configs[key.replace('section_', '')] = data.value
            }
          }
        } catch (e) {
          // Section not configured yet, use empty array
          configs[key.replace('section_', '')] = []
        }
      }
      
      setSectionConfigs(configs)
    } catch (error) {
      console.error('Error loading section configs:', error)
    }
  }

  // Save Hero Banner
  const saveHeroBanner = useMutation({
    mutationFn: async (settings: HeroBannerSettings) => {
      // Upload image if new file exists
      let imageUrl = settings.imageUrl
      if (heroImageFile) {
        const formData = new FormData()
        formData.append('image', heroImageFile)
        formData.append('type', 'hero-banner')

        const uploadRes = await fetch('/api/admin/catalog/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.imageUrl
        }
      }

      const res = await fetch('/api/admin/catalog/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'hero_banner',
          value: { ...settings, imageUrl },
        }),
      })
      if (!res.ok) throw new Error('Failed to save hero banner')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-layout'] })
      toast('Hero banner saved successfully', 'success')
      setHeroImageFile(null)
    },
    onError: (error: any) => {
      toast('Failed to save hero banner: ' + error.message, 'error')
    },
  })

  // Save Marquee
  const saveMarquee = useMutation({
    mutationFn: async (settings: MarqueeSettings) => {
      const res = await fetch('/api/admin/catalog/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'marquee',
          value: settings,
        }),
      })
      if (!res.ok) throw new Error('Failed to save marquee settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-layout'] })
      toast('Marquee settings saved successfully', 'success')
    },
    onError: (error: any) => {
      toast('Failed to save marquee settings: ' + error.message, 'error')
    },
  })

  // Save Section Configuration
  const saveSectionConfig = async (sectionKey: string, productIds: string[]) => {
    const res = await fetch('/api/admin/catalog/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: `section_${sectionKey}`,
        value: productIds,
        active: true,
      }),
    })
    if (!res.ok) throw new Error(`Failed to save ${sectionKey} section`)
    queryClient.invalidateQueries({ queryKey: ['catalog-layout'] })
    setSectionConfigs({ ...sectionConfigs, [sectionKey]: productIds })
    return res.json()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading layout settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catalog Layout</h1>
            <p className="text-gray-600 mt-1">Manage hero banners, marquee settings, and layout preferences</p>
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Hero Banner</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  value={heroBanner.title}
                  onChange={(e) => setHeroBanner({ ...heroBanner, title: e.target.value })}
                  placeholder="Premium Wholesale Products"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <Input
                  value={heroBanner.subtitle}
                  onChange={(e) => setHeroBanner({ ...heroBanner, subtitle: e.target.value })}
                  placeholder="Your Trusted Distribution Partner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                <Input
                  value={heroBanner.ctaText}
                  onChange={(e) => setHeroBanner({ ...heroBanner, ctaText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                <Input
                  value={heroBanner.ctaLink}
                  onChange={(e) => setHeroBanner({ ...heroBanner, ctaLink: e.target.value })}
                  placeholder="/catalog"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={heroBanner.theme}
                onChange={(e) => setHeroBanner({ ...heroBanner, theme: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="christmas">Christmas</option>
                <option value="summer">Summer</option>
                <option value="dia-muertos">Día de Muertos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Banner Image</label>
              <ProductImageUpload
                productId="hero-banner"
                currentImageUrl={getPublicImageUrl(heroBanner.imageUrl)}
                onUploadComplete={(url) => setHeroBanner({ ...heroBanner, imageUrl: url })}
                onFileSelect={setHeroImageFile}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hero-active"
                checked={heroBanner.active}
                onChange={(e) => setHeroBanner({ ...heroBanner, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="hero-active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <Button
              onClick={() => saveHeroBanner.mutate(heroBanner)}
              disabled={saveHeroBanner.isPending}
              className="w-full md:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveHeroBanner.isPending ? 'Saving...' : 'Save Hero Banner'}
            </Button>
          </div>
        </div>

        {/* Marquee Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Marquee Banner</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="marquee-active"
                checked={marquee.active}
                onChange={(e) => setMarquee({ ...marquee, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="marquee-active" className="text-sm font-medium text-gray-700">
                Enable Marquee Banner
              </label>
            </div>

            {marquee.active && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={marquee.title}
                    onChange={(e) => setMarquee({ ...marquee, title: e.target.value })}
                    placeholder="Trending Now"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speed (seconds)</label>
                    <Input
                      type="number"
                      value={marquee.speed}
                      onChange={(e) => setMarquee({ ...marquee, speed: parseInt(e.target.value) || 30 })}
                      min="10"
                      max="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                    <select
                      value={marquee.direction}
                      onChange={(e) => setMarquee({ ...marquee, direction: e.target.value as 'left' | 'right' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="marquee-pause"
                    checked={marquee.pauseOnHover}
                    onChange={(e) => setMarquee({ ...marquee, pauseOnHover: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="marquee-pause" className="text-sm font-medium text-gray-700">
                    Pause on Hover
                  </label>
                </div>
              </>
            )}

            <Button
              onClick={() => saveMarquee.mutate(marquee)}
              disabled={saveMarquee.isPending}
              className="w-full md:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMarquee.isPending ? 'Saving...' : 'Save Marquee Settings'}
            </Button>
          </div>
        </div>

        {/* Product Sections Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Product Sections</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Manage which products appear in each section of the catalog. Drag to reorder products within each section.
          </p>

          <div className="space-y-8">
            {/* Showcase Section */}
            <ProductSectionManager
              sectionKey="showcase"
              sectionName="Featured Products (Showcase)"
              description="Products displayed in the main Featured Products section at the top of the catalog"
              currentProductIds={sectionConfigs.showcase || []}
              onSave={(ids) => saveSectionConfig('showcase', ids)}
            />

            {/* Trending Section */}
            <ProductSectionManager
              sectionKey="trending"
              sectionName="Trending Products"
              description="Products displayed in the Trending Now section"
              currentProductIds={sectionConfigs.trending || []}
              onSave={(ids) => saveSectionConfig('trending', ids)}
            />

            {/* Sabritas Section */}
            <ProductSectionManager
              sectionKey="sabritas"
              sectionName="Sabritas Products"
              description="Products displayed in the Sabritas carousel section"
              currentProductIds={sectionConfigs.sabritas || []}
              onSave={(ids) => saveSectionConfig('sabritas', ids)}
            />

            {/* Barcel Section */}
            <ProductSectionManager
              sectionKey="barcel"
              sectionName="Barcel Products"
              description="Products displayed in the Barcel zigzag grid section"
              currentProductIds={sectionConfigs.barcel || []}
              onSave={(ids) => saveSectionConfig('barcel', ids)}
            />

            {/* Drinks Section */}
            <ProductSectionManager
              sectionKey="drinks"
              sectionName="Beverages Section"
              description="Products displayed in the Beverages splash section"
              currentProductIds={sectionConfigs.drinks || []}
              onSave={(ids) => saveSectionConfig('drinks', ids)}
            />

            {/* Seasonal Section */}
            <ProductSectionManager
              sectionKey="seasonal"
              sectionName="Seasonal Products"
              description="Products displayed in the Seasonal Favorites themed section"
              currentProductIds={sectionConfigs.seasonal || []}
              onSave={(ids) => saveSectionConfig('seasonal', ids)}
            />
          </div>
        </div>

        {/* Preview Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Preview Your Changes</h3>
              <p className="text-sm text-blue-700">
                View how your layout changes appear on the frontend catalog page
              </p>
            </div>
            <a
              href="/catalog"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Catalog
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

