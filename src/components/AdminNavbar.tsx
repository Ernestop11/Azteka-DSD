import { Link } from 'react-router-dom';
import { LayoutDashboard, Grid3x3, History, Settings, Package, Target, Palette, Sliders, BarChart3, Monitor, FileText, GitBranch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 shadow-lg">
      <div className="max-w-full px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-600">Comprehensive Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/admin/catalog-builder" className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <LayoutDashboard size={16} />
              <span className="hidden md:inline">Builder</span>
            </Link>
            <Link to="/admin/products" className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Package size={16} />
              <span className="hidden md:inline">Products</span>
            </Link>
            <Link to="/admin/categories" className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Grid3x3 size={16} />
              <span className="hidden md:inline">Categories</span>
            </Link>
            <Link to="/admin/racks" className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Target size={16} />
              <span className="hidden md:inline">Racks</span>
            </Link>
            <Link to="/admin/theme" className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Palette size={16} />
              <span className="hidden md:inline">Theme</span>
            </Link>
            <Link to="/admin/ux" className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Sliders size={16} />
              <span className="hidden md:inline">UX</span>
            </Link>
            <Link to="/admin/analytics" className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <BarChart3 size={16} />
              <span className="hidden md:inline">Analytics</span>
            </Link>
            <Link to="/admin/monitor" className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Monitor size={16} />
              <span className="hidden md:inline">Monitor</span>
            </Link>
            <Link to="/admin/content" className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <FileText size={16} />
              <span className="hidden md:inline">Content</span>
            </Link>
            <Link to="/admin/workflows" className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <GitBranch size={16} />
              <span className="hidden md:inline">Workflows</span>
            </Link>
            <Link to="/admin/settings" className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-1.5">
              <Settings size={16} />
              <span className="hidden md:inline">Settings</span>
            </Link>
            {user && (
              <button
                onClick={logout}
                className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-rose-500 hover:text-rose-600 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

