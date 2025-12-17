'use client'

import { useRouter } from 'next/navigation'
import { Package, Tag, Grid3x3, ShoppingBag, BarChart3, Settings, Layout, Sparkles, Layers, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()

  const sections = [
    {
      title: 'Main Dashboard',
      description: 'Full-featured admin dashboard with tabbed interface, barcode scanner, and product editor',
      icon: Layers,
      href: '/admin/dashboard',
      color: 'from-emerald-500 to-teal-600',
      stats: 'NEW - Recommended',
      featured: true
    },
    {
      title: 'Catalog Block Builder',
      description: 'Visual drag-and-drop catalog builder with style presets and backgrounds',
      icon: Layout,
      href: '/admin/block-builder',
      color: 'from-indigo-500 to-purple-600',
      stats: 'Visual editor'
    },
    {
      title: 'Products',
      description: 'Manage product catalog, pricing, and inventory',
      icon: Package,
      href: '/admin/products',
      color: 'from-blue-500 to-blue-600',
      stats: 'Full editor with visual presets'
    },
    {
      title: 'Bundles',
      description: 'Create and manage product bundles and deals',
      icon: ShoppingBag,
      href: '/admin/bundles',
      color: 'from-purple-500 to-purple-600',
      stats: 'Multi-product bundles'
    },
    {
      title: 'Categories',
      description: 'Organize products into categories',
      icon: Grid3x3,
      href: '/admin/categories',
      color: 'from-green-500 to-green-600',
      stats: 'Category management'
    },
    {
      title: 'Brands',
      description: 'Manage brand information and logos',
      icon: Tag,
      href: '/admin/brands',
      color: 'from-orange-500 to-orange-600',
      stats: 'Brand database'
    },
    {
      title: 'Promos & Seasonal',
      description: 'Manage promotional banners and seasonal sections',
      icon: Sparkles,
      href: '/admin/catalog/promos',
      color: 'from-red-500 to-pink-600',
      stats: 'Promotions'
    },
    {
      title: 'Design Studio',
      description: 'Advanced visual editing, presets, and layout builder',
      icon: Settings,
      href: '/admin/design-studio',
      color: 'from-pink-500 to-rose-600',
      stats: 'Visual tools'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your wholesale DSD platform</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Featured Dashboard Link */}
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="w-full mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-left hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">Open Full Dashboard</h2>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full">NEW</span>
                </div>
                <p className="text-white/80 mt-1">
                  Tabbed interface with Products, Block Builder, Barcode Scanner, Customer Pricing & more
                </p>
              </div>
            </div>
            <ArrowRight className="w-8 h-8 text-white group-hover:translate-x-2 transition-transform" />
          </div>
        </button>

        {/* Quick Access Cards */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.filter(s => !s.featured).map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.href}
                onClick={() => router.push(section.href)}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden text-left"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${section.color} p-6`}>
                  <div className="flex items-center justify-between">
                    <Icon className="w-10 h-10 text-white" />
                    <span className="text-white/80 text-sm font-medium">{section.stats}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {section.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                  <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    Open <span className="ml-2">→</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
