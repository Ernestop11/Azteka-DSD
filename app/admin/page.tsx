'use client'

import { useRouter } from 'next/navigation'
import {
  Package,
  Tag,
  Grid3x3,
  ShoppingBag,
  Settings,
  Layout,
  Sparkles,
  Layers,
  Truck,
  Warehouse,
  Users,
  ShoppingCart,
  FileText,
  Store,
  Printer,
  ClipboardList,
  BookOpen,
  Apple,
  Image,
  Menu,
  Clock,
  DollarSign,
  MapPin,
  type LucideIcon
} from 'lucide-react'
import PrintStatusAlert from '@/components/admin/PrintStatusAlert'

interface PageCard {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
}

export default function AdminDashboard() {
  const router = useRouter()

  // Operations - Driver & Warehouse
  const operations: PageCard[] = [
    {
      title: 'Time Clock',
      description: 'Employee clock in/out kiosk',
      icon: Clock,
      href: '/kiosk',
      color: 'from-emerald-600 to-teal-500'
    },
    {
      title: 'Timeclock Admin',
      description: 'View hours, calculate payroll, manage employees',
      icon: Clock,
      href: '/admin/timeclock',
      color: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Employee Worksheet',
      description: 'Track employee activities and work logs',
      icon: ClipboardList,
      href: '/admin/employees',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Driver Hub',
      description: 'Daily routes, deliveries, and truck inventory',
      icon: Truck,
      href: '/driver/today',
      color: 'from-blue-600 to-cyan-500'
    },
    {
      title: 'Warehouse Orders',
      description: 'Order picking and fulfillment management',
      icon: Warehouse,
      href: '/warehouse/orders',
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Print Queue',
      description: 'Manage print jobs for pick lists and invoices',
      icon: Printer,
      href: '/warehouse/print-queue',
      color: 'from-slate-500 to-slate-600'
    },
    {
      title: 'Warehouse Map',
      description: 'Visual product location editor',
      icon: MapPin,
      href: '/admin/warehouse-map',
      color: 'from-teal-500 to-emerald-600'
    }
  ]

  // Employee Portal
  const employeePortal: PageCard[] = [
    {
      title: 'Employee Dashboard',
      description: 'Main employee portal and navigation',
      icon: Users,
      href: '/employee',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Employee Orders',
      description: 'View and manage orders',
      icon: ClipboardList,
      href: '/employee/orders',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Employee Delivery',
      description: 'Delivery tracking and management',
      icon: Truck,
      href: '/employee/delivery',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Employee Inventory',
      description: 'Inventory tracking and updates',
      icon: Package,
      href: '/employee/inventory',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Employee Products',
      description: 'Browse and search products',
      icon: ShoppingBag,
      href: '/employee/products',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  // Admin Tools
  const adminTools: PageCard[] = [
    {
      title: 'Products Editor',
      description: 'Full product catalog management with pricing',
      icon: Package,
      href: '/admin/products',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Inventory Image Seed',
      description: 'Drag & drop PNG images to update product pictures',
      icon: Image,
      href: '/admin/inventory-seed',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Price Management',
      description: 'Manage customer-specific pricing and overrides',
      icon: DollarSign,
      href: '/admin/pricing',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Bundles Manager',
      description: 'Create and manage product bundles',
      icon: ShoppingBag,
      href: '/admin/bundles',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Categories',
      description: 'Organize products into categories',
      icon: Grid3x3,
      href: '/admin/categories',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Brands',
      description: 'Manage brand information and logos',
      icon: Tag,
      href: '/admin/brands',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Sections',
      description: 'Manage catalog sections',
      icon: Layers,
      href: '/admin/sections',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Grocery Admin',
      description: 'Grocery-specific product management',
      icon: Apple,
      href: '/admin/grocery',
      color: 'from-lime-500 to-lime-600'
    }
  ]

  // Visual & Catalog Tools
  const visualTools: PageCard[] = [
    {
      title: 'Block Builder',
      description: 'Visual drag-and-drop catalog builder',
      icon: Layout,
      href: '/admin/block-builder',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Design Studio',
      description: 'Advanced visual editing and presets',
      icon: Sparkles,
      href: '/admin/design-studio',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Menu Editor',
      description: 'Edit navigation and menu structure',
      icon: Menu,
      href: '/admin/menu-editor',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Catalog Layout',
      description: 'Configure catalog page layout',
      icon: Layout,
      href: '/admin/catalog/layout',
      color: 'from-violet-500 to-violet-600'
    },
    {
      title: 'Promos Editor',
      description: 'Manage promotional banners and content',
      icon: Image,
      href: '/admin/catalog/promos',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Seasonal Items',
      description: 'Configure seasonal product displays',
      icon: Sparkles,
      href: '/admin/catalog/seasonal',
      color: 'from-amber-500 to-amber-600'
    }
  ]

  // Customer-Facing Pages
  const customerPages: PageCard[] = [
    {
      title: 'Main Catalog',
      description: 'Customer product catalog view',
      icon: BookOpen,
      href: '/catalog',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Alessa Catalog',
      description: 'Alessa brand catalog page',
      icon: Store,
      href: '/catalog/alessa',
      color: 'from-rose-500 to-rose-600'
    },
    {
      title: 'Grocery Page',
      description: 'Grocery shopping interface',
      icon: Apple,
      href: '/grocery',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Bundles Page',
      description: 'Customer bundle deals view',
      icon: ShoppingBag,
      href: '/bundles',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Shopping Cart',
      description: 'Customer cart and checkout',
      icon: ShoppingCart,
      href: '/cart',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Orders History',
      description: 'Customer order history',
      icon: FileText,
      href: '/orders',
      color: 'from-slate-500 to-slate-600'
    },
    {
      title: 'Multi-Store Order',
      description: 'Order for multiple locations',
      icon: Store,
      href: '/multistore-order',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  // Settings & Config
  const settingsPages: PageCard[] = [
    {
      title: 'Business Settings',
      description: 'Company info, customers, and drivers',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-slate-500 to-gray-600'
    },
    {
      title: 'Full Dashboard',
      description: 'Tabbed admin with all features',
      icon: Layers,
      href: '/admin/dashboard',
      color: 'from-emerald-500 to-teal-600'
    }
  ]

  // Card component
  const PageCardComponent = ({ page }: { page: PageCard }) => {
    const Icon = page.icon
    return (
      <button
        onClick={() => router.push(page.href)}
        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden text-left border border-gray-100"
      >
        <div className={`bg-gradient-to-r ${page.color} p-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {page.title}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {page.description}
          </p>
        </div>
      </button>
    )
  }

  // Section header component
  const SectionHeader = ({ icon: Icon, title, subtitle, color }: {
    icon: LucideIcon,
    title: string,
    subtitle: string,
    color: string
  }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Hub</h1>
          <p className="text-gray-500 text-sm">All pages in the Azteka DSD platform</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Print System Status Alert */}
        <PrintStatusAlert />

        {/* Operations */}
        <section>
          <SectionHeader
            icon={Truck}
            title="Operations"
            subtitle="Driver and warehouse management"
            color="from-blue-600 to-cyan-500"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {operations.map((page) => (
              <PageCardComponent key={page.href} page={page} />
            ))}
          </div>
        </section>

        {/* Employee Portal */}
        <section>
          <SectionHeader
            icon={Users}
            title="Employee Portal"
            subtitle="Employee-facing tools and pages"
            color="from-indigo-500 to-indigo-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {employeePortal.map((page) => (
              <PageCardComponent key={page.href} page={page} />
            ))}
          </div>
        </section>

        {/* Admin Tools */}
        <section>
          <SectionHeader
            icon={Package}
            title="Admin Tools"
            subtitle="Product and catalog management"
            color="from-blue-500 to-blue-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {adminTools.map((page) => (
              <PageCardComponent key={page.href} page={page} />
            ))}
          </div>
        </section>

        {/* Visual & Catalog Tools */}
        <section>
          <SectionHeader
            icon={Sparkles}
            title="Visual & Catalog Tools"
            subtitle="Design and layout editors"
            color="from-pink-500 to-rose-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {visualTools.map((page) => (
              <PageCardComponent key={page.href} page={page} />
            ))}
          </div>
        </section>

        {/* Customer-Facing Pages */}
        <section>
          <SectionHeader
            icon={Store}
            title="Customer Pages"
            subtitle="Customer-facing storefront pages"
            color="from-emerald-500 to-emerald-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {customerPages.map((page) => (
              <PageCardComponent key={page.href} page={page} />
            ))}
          </div>
        </section>

        {/* Settings & Dashboard */}
        <section>
          <SectionHeader
            icon={Settings}
            title="Settings & Dashboard"
            subtitle="Configuration and full admin"
            color="from-slate-500 to-gray-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {settingsPages.map((page) => (
              <PageCardComponent key={page.href} page={page} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
