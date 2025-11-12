import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Package,
  Grid3x3,
  LayoutGrid,
  Image as ImageIcon,
  Upload,
  Save,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Trash2,
  Edit3,
  GripVertical,
  Sparkles,
  Wand2,
  Gift,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Settings,
  Layers,
  Users,
  DollarSign,
  Tag,
  RefreshCw
} from 'lucide-react';
import { products } from '../lib/mockData';

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  description?: string;
  brand?: string;
  stock?: number;
  unitsPerCase?: number;
  minOrderQty?: number;
  featured?: boolean;
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  layout: string;
  color: string;
  productIds: string[];
  order: number;
  visible: boolean;
  brandLogo?: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  discount: number;
  featured: boolean;
}

export default function CatalogEditor() {
  const [view, setView] = useState<'sections' | 'products' | 'bundles' | 'preview'>('sections');
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Hot Deals',
      subtitle: 'Limited Time',
      layout: 'hero-grid',
      color: 'from-red-600 to-orange-600',
      productIds: products.slice(0, 6).map(p => p.id),
      order: 1,
      visible: true,
    },
    {
      id: '2',
      title: 'Jumex',
      subtitle: 'Premium Juices',
      layout: 'netflix-curtain',
      color: 'from-orange-600 to-red-600',
      productIds: products.slice(6, 18).map(p => p.id),
      order: 2,
      visible: true,
      brandLogo: '🧃',
    },
    {
      id: '3',
      title: 'Trending Now',
      subtitle: 'What others buy',
      layout: 'carousel-snap',
      color: 'from-yellow-500 to-amber-600',
      productIds: products.slice(8, 14).map(p => p.id),
      order: 3,
      visible: true,
    },
  ]);

  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [bundles, setBundles] = useState<Bundle[]>([
    {
      id: '1',
      name: 'Beverage Starter Pack',
      description: 'Popular drinks bundle',
      productIds: [products[0].id, products[1].id, products[2].id],
      discount: 30,
      featured: true,
    },
  ]);

  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIUpload, setShowAIUpload] = useState(false);

  const layoutOptions = [
    { value: 'netflix-curtain', label: 'Netflix Curtain', icon: '🎬' },
    { value: 'hero-grid', label: 'Hero Grid', icon: '⭐' },
    { value: 'carousel-snap', label: 'Carousel', icon: '➡️' },
    { value: 'brand-spotlight', label: 'Brand Spotlight', icon: '🏆' },
    { value: 'pricing-cards', label: 'Pricing Cards', icon: '💰' },
    { value: 'staggered-grid', label: 'Staggered Grid', icon: '🔲' },
    { value: 'compact-tiles', label: 'Compact Tiles', icon: '▪️' },
    { value: 'brand-wall', label: 'Brand Wall', icon: '🧱' },
    { value: 'wide-cards', label: 'Wide Cards', icon: '▬' },
    { value: 'list-view', label: 'List View', icon: '☰' },
    { value: 'dense-grid', label: 'Dense Grid', icon: '▪' },
    { value: 'bundle-cards', label: 'Bundle Cards', icon: '🎁' },
  ];

  const colorOptions = [
    'from-red-600 to-orange-600',
    'from-orange-600 to-red-600',
    'from-yellow-500 to-amber-600',
    'from-green-600 to-emerald-600',
    'from-cyan-600 to-blue-600',
    'from-blue-600 to-cyan-600',
    'from-purple-600 to-pink-600',
    'from-pink-600 to-purple-600',
  ];

  const handleSaveSections = () => {
    alert('Sections saved! (Would sync to Supabase)');
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'New Section',
      subtitle: 'Description',
      layout: 'hero-grid',
      color: 'from-blue-600 to-cyan-600',
      productIds: [],
      order: sections.length + 1,
      visible: true,
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleUpdateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Catalog Editor</h1>
                <p className="text-sm text-slate-400">Manage products, sections & bundles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIUpload(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
              >
                <Wand2 className="w-4 h-4" />
                AI Import
              </button>
              <button
                onClick={handleSaveSections}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save All
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { key: 'sections', label: 'Sections & Layout', icon: LayoutGrid },
              { key: 'products', label: 'Products', icon: Package },
              { key: 'bundles', label: 'Bundles', icon: Gift },
              { key: 'preview', label: 'Live Preview', icon: Eye },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key as any)}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                  view === key
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'sections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Section Manager</h2>
              <button
                onClick={handleAddSection}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-4">
              {sections.map((section) => (
                <Reorder.Item key={section.id} value={section}>
                  <motion.div
                    layout
                    className="bg-slate-900 rounded-2xl p-6 border-2 border-slate-700 hover:border-cyan-500 transition-all cursor-move"
                  >
                    <div className="flex items-start gap-4">
                      <div className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-6 h-6 text-slate-500" />
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Section Header */}
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                            className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-2 text-xl font-black focus:border-cyan-500 outline-none"
                            placeholder="Section Title"
                          />
                          <button
                            onClick={() => handleUpdateSection(section.id, { visible: !section.visible })}
                            className={`p-2 rounded-lg ${section.visible ? 'bg-green-600' : 'bg-slate-700'}`}
                          >
                            {section.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-2 bg-red-600 hover:bg-red-500 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Section Subtitle */}
                        <input
                          type="text"
                          value={section.subtitle}
                          onChange={(e) => handleUpdateSection(section.id, { subtitle: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-cyan-500 outline-none"
                          placeholder="Section Subtitle"
                        />

                        {/* Layout Selector */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {layoutOptions.map((layout) => (
                            <button
                              key={layout.value}
                              onClick={() => handleUpdateSection(section.id, { layout: layout.value })}
                              className={`p-3 rounded-xl font-bold text-sm transition-all border-2 ${
                                section.layout === layout.value
                                  ? 'bg-cyan-600 border-cyan-400 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              <span className="text-2xl mb-1 block">{layout.icon}</span>
                              {layout.label}
                            </button>
                          ))}
                        </div>

                        {/* Color Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400 font-bold">Color:</span>
                          <div className="flex gap-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color}
                                onClick={() => handleUpdateSection(section.id, { color })}
                                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} border-2 ${
                                  section.color === color ? 'border-white scale-110' : 'border-slate-700'
                                } transition-all`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Products Count */}
                        <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                          <span className="text-sm font-bold text-slate-300">
                            {section.productIds.length} products assigned
                          </span>
                          <button
                            onClick={() => setSelectedSection(section)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-bold"
                          >
                            Manage Products
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {view === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Product Library</h2>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setShowProductModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-900 rounded-xl p-4 border-2 border-slate-700 hover:border-cyan-500 transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-cyan-400 font-black text-lg">${product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">{product.stock} in stock</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductModal(true);
                      }}
                      className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Product
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {view === 'bundles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Bundle Manager</h2>
              <button
                onClick={() => {
                  setSelectedBundle(null);
                  setShowBundleModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Bundle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border-2 border-purple-500/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-white mb-1">{bundle.name}</h3>
                      <p className="text-sm text-slate-400">{bundle.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500 text-white text-xs font-black rounded-full">
                      -{bundle.discount}%
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {bundle.productIds.map(pid => {
                      const product = allProducts.find(p => p.id === pid);
                      return product ? (
                        <div key={pid} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                          <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <span className="text-sm text-white font-bold flex-1 line-clamp-1">{product.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBundle(bundle);
                      setShowBundleModal(true);
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Bundle
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Live Preview</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-sm">Mobile</button>
                <button className="px-4 py-2 bg-cyan-600 rounded-lg font-bold text-sm">Desktop</button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border-2 border-slate-700">
              <div className="text-center text-slate-400">
                <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold">Preview will show live catalog here</p>
                <p className="text-sm">Changes reflect in real-time</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Upload Modal */}
      <AnimatePresence>
        {showAIUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAIUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 max-w-lg w-full border-2 border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black">AI Product Import</h3>
                </div>
                <button
                  onClick={() => setShowAIUpload(false)}
                  className="p-2 hover:bg-slate-700 rounded-full"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400">Upload a purchase order and AI will extract products automatically</p>

                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-purple-500 transition-all cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p className="font-bold text-white mb-1">Drop PO file here</p>
                  <p className="text-sm text-slate-400">PDF, Excel, or CSV</p>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-black">
                  Process with AI
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
