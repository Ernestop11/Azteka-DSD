import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings, Package as PackageIcon, FileText, BarChart3, Zap, ShoppingBag, Home,
  TrendingUp, Users, Truck, Award, Grid3x3, Menu, X, Image, Edit3
} from 'lucide-react';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import CatalogPage from './pages/CatalogPage';
import InvoiceUpload from './pages/InvoiceUpload';
import PurchaseOrders from './pages/PurchaseOrders';
import AdminOrders from './pages/AdminOrders';
import AiInsights from './pages/AiInsights';
import AutomationCenter from './pages/AutomationCenter';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import SalesRepDashboard from './pages/SalesRepDashboard';
import DriverDashboard from './pages/DriverDashboard';
import CustomerPortal from './pages/CustomerPortal';
import Leaderboard from './pages/Leaderboard';
import Incentives from './pages/Incentives';
import Rewards from './pages/Rewards';
import Login from './pages/Login';
import ImageProcessing from './pages/ImageProcessing';
import CatalogOnline from './pages/CatalogOnline';
import CatalogCustomer from './pages/CatalogCustomer';
import CatalogSalesRep from './pages/CatalogSalesRep';
import CatalogEditor from './pages/CatalogEditor';

// Main Navigation Component
function MainNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/', label: 'Catalog', icon: Home },
    { path: '/admin', label: 'Admin', icon: Settings },
    { path: '/sales', label: 'Sales', icon: TrendingUp },
    { path: '/customer', label: 'Customer', icon: Users },
    { path: '/driver', label: 'Driver', icon: Truck },
  ];

  // Don't show nav on login page or catalog page (catalog has its own nav)
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              🏪 Azteka DSD
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

// Admin Dashboard component
function AdminDashboard() {
  const navigate = useNavigate();

  const adminFeatures = [
    {
      title: 'Invoice Upload',
      description: 'Upload PO invoices to seed products via AI OCR',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      path: '/admin/invoices',
      badge: 'ESSENTIAL'
    },
    {
      title: 'Purchase Orders',
      description: 'Manage purchase orders and suppliers',
      icon: PackageIcon,
      color: 'from-blue-500 to-cyan-500',
      path: '/admin/po'
    },
    {
      title: 'Orders Management',
      description: 'View and manage customer orders',
      icon: ShoppingBag,
      color: 'from-emerald-500 to-teal-500',
      path: '/admin/orders'
    },
    {
      title: 'AI Insights',
      description: 'Analytics and AI-powered insights',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      path: '/admin/analytics'
    },
    {
      title: 'Automation Center',
      description: 'Configure automation workflows',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      path: '/admin/automation'
    },
    {
      title: 'Executive Dashboard',
      description: 'High-level business metrics',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      path: '/admin/executive'
    },
    {
      title: 'AI Image Processing',
      description: 'Auto-search, background removal, and splash images',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      path: '/admin/images',
      badge: 'NEW'
    },
    {
      title: 'Catalog Editor',
      description: 'Edit products, layouts, bundles, and menus',
      icon: Edit3,
      color: 'from-cyan-500 to-blue-500',
      path: '/admin/catalog-editor',
      badge: 'ESSENTIAL'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                <Settings className="inline-block mr-3 text-gray-700" size={40} />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your Azteka DSD operations
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Features Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {feature.badge}
                  </div>
                )}

                {/* Content */}
                <div className="relative p-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="text-white" size={32} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Open →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <PackageIcon className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <ShoppingBag className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active POs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Invoices Uploaded</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <BarChart3 className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sales Dashboard
function SalesDashboard() {
  const navigate = useNavigate();

  const salesFeatures = [
    {
      title: 'Sales Dashboard',
      description: 'View your performance and metrics',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      path: '/sales/dashboard'
    },
    {
      title: 'Leaderboard',
      description: 'See top performers',
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      path: '/sales/leaderboard'
    },
    {
      title: 'Incentives',
      description: 'Track your rewards and bonuses',
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      path: '/sales/incentives'
    },
    {
      title: 'Catalog',
      description: 'Browse products for customers',
      icon: Grid3x3,
      color: 'from-blue-500 to-cyan-500',
      path: '/'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-8">
          <TrendingUp className="inline-block mr-3 text-emerald-600" size={40} />
          Sales Portal
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salesFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-6"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Main App with Router
export default function AppWithRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainNav />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/online" element={<CatalogOnline />} />
          <Route path="/catalog/customer" element={<CatalogCustomer />} />
          <Route path="/catalog/salesrep" element={<CatalogSalesRep />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/invoices" element={<InvoiceUpload />} />
          <Route path="/admin/po" element={<PurchaseOrders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/analytics" element={<AiInsights />} />
          <Route path="/admin/automation" element={<AutomationCenter />} />
          <Route path="/admin/executive" element={<ExecutiveDashboard />} />
          <Route path="/admin/images" element={<ImageProcessing />} />
          <Route path="/admin/catalog-editor" element={<CatalogEditor />} />

          {/* Sales Routes */}
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/dashboard" element={<SalesRepDashboard />} />
          <Route path="/sales/leaderboard" element={<Leaderboard />} />
          <Route path="/sales/incentives" element={<Incentives />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/rewards" element={<Rewards />} />

          {/* Driver Routes */}
          <Route path="/driver" element={<DriverDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
