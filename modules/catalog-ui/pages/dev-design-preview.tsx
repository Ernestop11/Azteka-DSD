import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Code, Palette, Sparkles, Grid3x3, Layout, ImageIcon } from 'lucide-react';
import { 
  HeroBanner,
  ProductGrid,
  BundleSection,
  BrandRow,
  LoadingOverlay,
} from '../index';
import { neonColors, glassmorphism, glowPresets } from '../theme/catalogVisuals';

type PreviewSection = 'hero' | 'products' | 'bundles' | 'brands' | 'loading' | 'all';

// Mock data for previews
const mockProducts = [
  {
    id: 'preview-1',
    name: 'Premium Energy Drink',
    description: 'High-performance energy boost',
    sku: 'PREV-001',
    price: 2.99,
    unitType: 'can',
    unitsPerCase: 24,
    imageUrl: '/placeholder-product.png',
    categoryId: 'beverages',
    brandId: 'monster',
    brandName: 'Monster Energy',
    status: 'active' as const,
    inStock: true,
    isNew: true,
    backgroundColor: '#1a1a1a',
  },
  {
    id: 'preview-2',
    name: 'Classic Cola 12oz',
    description: 'The original taste',
    sku: 'PREV-002',
    price: 1.49,
    unitType: 'can',
    unitsPerCase: 12,
    imageUrl: '/placeholder-product.png',
    categoryId: 'beverages',
    brandId: 'coca-cola',
    brandName: 'Coca-Cola',
    status: 'active' as const,
    inStock: true,
    isNew: false,
    backgroundColor: '#cc0000',
  },
  {
    id: 'preview-3',
    name: 'Spring Water 500ml',
    description: 'Pure mountain spring water',
    sku: 'PREV-003',
    price: 0.99,
    unitType: 'bottle',
    unitsPerCase: 24,
    imageUrl: '/placeholder-product.png',
    categoryId: 'beverages',
    brandId: 'evian',
    brandName: 'Evian',
    status: 'draft' as const,
    inStock: true,
    isNew: false,
    backgroundColor: '#e8f4f8',
  },
  {
    id: 'preview-4',
    name: 'Orange Juice 1L',
    description: 'Freshly squeezed',
    sku: 'PREV-004',
    price: 3.99,
    unitType: 'carton',
    unitsPerCase: 6,
    imageUrl: '',
    categoryId: 'beverages',
    brandId: 'tropicana',
    brandName: 'Tropicana',
    status: 'active' as const,
    inStock: false,
    isNew: false,
    backgroundColor: '#ff8c00',
  },
];

const mockBundles = [
  {
    id: 'bundle-1',
    title: 'Energy Starter Pack',
    name: 'Energy Starter Pack',
    description: 'Everything you need to boost your day',
    imageUrl: '/placeholder-bundle.png',
    originalPrice: 29.99,
    bundlePrice: 24.99,
    savings: 5.0,
    products: mockProducts.slice(0, 2),
    isLimitedTime: true,
  },
];

const mockBrands = [
  { id: 'coca-cola', name: 'Coca-Cola', logoUrl: '/placeholder-logo.png', productCount: 24 },
  { id: 'pepsi', name: 'Pepsi', logoUrl: '/placeholder-logo.png', productCount: 18 },
  { id: 'monster', name: 'Monster Energy', logoUrl: '/placeholder-logo.png', productCount: 12 },
  { id: 'redbull', name: 'Red Bull', logoUrl: '/placeholder-logo.png', productCount: 8 },
];

export const DevDesignPreviewPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<PreviewSection>('all');
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingType, setLoadingType] = useState<'regenerating' | 'ingesting' | 'processing'>('processing');

  const sections: Array<{ id: PreviewSection; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'All Components', icon: <Layout className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero Banners', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'products', label: 'Product Cards', icon: <Grid3x3 className="w-4 h-4" /> },
    { id: 'bundles', label: 'Bundle Templates', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'brands', label: 'Brand Row', icon: <Palette className="w-4 h-4" /> },
    { id: 'loading', label: 'Loading States', icon: <Code className="w-4 h-4" /> },
  ];

  const shouldShow = (section: PreviewSection) => {
    return activeSection === 'all' || activeSection === section;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-6">
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        type={loadingType}
        details="This is a preview of the loading overlay component"
        progress={65}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Design Preview Studio
            </h1>
          </div>
          <p className="text-gray-600">
            Internal developer tool to preview and polish catalog UI components without touching business logic
          </p>
        </motion.div>

        {/* Section Selector */}
        <div className="mb-8">
          <div 
            className="flex gap-2 p-2 rounded-xl overflow-x-auto"
            style={{
              ...glassmorphism.light,
              border: `1px solid ${neonColors.cyan}20`,
            }}
          >
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
                style={
                  activeSection === section.id
                    ? {
                        background: `linear-gradient(135deg, ${neonColors.purple}, ${neonColors.pink})`,
                        boxShadow: glowPresets.neonPink.boxShadow,
                      }
                    : {}
                }
              >
                {section.icon}
                {section.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview Sections */}
        <div className="space-y-12">
          {/* Hero Banners */}
          {shouldShow('hero') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Hero Banner Templates</h2>
              </div>

              {/* Large Hero with Parallax */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Large Hero with Parallax
                </h3>
                <HeroBanner
                  title="Welcome to Azteka DSD"
                  subtitle="Your one-stop shop for premium beverages and snacks"
                  ctaText="Start Shopping"
                  ctaAction={() => alert('CTA clicked!')}
                  height="large"
                  parallax={true}
                  useCanvaImage={true}
                  canvaImageId="hero-main"
                  textOverlay={{ position: 'left', color: 'white' }}
                />
              </div>

              {/* Medium Hero - Center Aligned */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Medium Hero - Center Aligned
                </h3>
                <HeroBanner
                  title="Premium Energy Drinks"
                  subtitle="Boost your performance with top brands"
                  ctaText="View Collection"
                  ctaAction={() => alert('View Collection clicked!')}
                  height="medium"
                  parallax={false}
                  textOverlay={{ position: 'center', color: 'white' }}
                  gradientFrom="#1a1a1a"
                  gradientTo="#4a4a4a"
                />
              </div>

              {/* Small Hero - Right Aligned */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Small Hero - Right Aligned
                </h3>
                <HeroBanner
                  title="New Arrivals"
                  subtitle="Check out our latest products"
                  height="small"
                  parallax={false}
                  textOverlay={{ position: 'right', color: 'white' }}
                  gradientFrom="#667eea"
                  gradientTo="#764ba2"
                />
              </div>
            </motion.section>
          )}

          {/* Product Cards */}
          {shouldShow('products') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Grid3x3 className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Product Card Variations</h2>
              </div>

              {/* Standard Glossy Cards */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Standard Glossy Cards (4 columns)
                </h3>
                <ProductGrid
                  products={mockProducts}
                  columns={4}
                  onAddToCart={(id: string, qty: number) => alert(`Added ${qty}x ${id} to cart`)}
                  onProductClick={(id: string) => alert(`Clicked product ${id}`)}
                  glossyCards={true}
                  useAiImages={true}
                  showImageStatus={true}
                />
              </div>

              {/* Non-Glossy Cards */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Non-Glossy Cards (3 columns)
                </h3>
                <ProductGrid
                  products={mockProducts}
                  columns={3}
                  onAddToCart={(id: string, qty: number) => alert(`Added ${qty}x ${id} to cart`)}
                  glossyCards={false}
                  useAiImages={false}
                  showImageStatus={false}
                />
              </div>

              {/* Large 2-Column Layout */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Large 2-Column Layout
                </h3>
                <ProductGrid
                  products={mockProducts.slice(0, 2)}
                  columns={2}
                  onAddToCart={(id: string, qty: number) => alert(`Added ${qty}x ${id} to cart`)}
                  glossyCards={true}
                  useAiImages={true}
                />
              </div>
            </motion.section>
          )}

          {/* Bundle Templates */}
          {shouldShow('bundles') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Bundle Templates</h2>
              </div>

              {/* With AI Graphics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Bundle with AI Graphics & Animations
                </h3>
                <BundleSection
                  bundles={mockBundles}
                  onAddBundle={(id: string) => alert(`Added bundle ${id} to cart`)}
                  useAiGraphics={true}
                  isNew={true}
                />
              </div>

              {/* Without AI Graphics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Bundle without AI Graphics
                </h3>
                <BundleSection
                  bundles={mockBundles}
                  onAddBundle={(id: string) => alert(`Added bundle ${id} to cart`)}
                  useAiGraphics={false}
                  isNew={false}
                />
              </div>
            </motion.section>
          )}

          {/* Brand Row */}
          {shouldShow('brands') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Brand Row Templates</h2>
              </div>

              {/* Pill-Shaped with Canva Logos */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Pill-Shaped Buttons with Canva Logos
                </h3>
                <BrandRow
                  brands={mockBrands}
                  selectedBrandId="coca-cola"
                  onBrandClick={(id: string) => alert(`Selected brand: ${id}`)}
                  pillShaped={true}
                  useCanvaLogos={true}
                />
              </div>

              {/* Square Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                  Square Buttons without Canva
                </h3>
                <BrandRow
                  brands={mockBrands}
                  selectedBrandId="pepsi"
                  onBrandClick={(id: string) => alert(`Selected brand: ${id}`)}
                  pillShaped={false}
                  useCanvaLogos={false}
                />
              </div>
            </motion.section>
          )}

          {/* Loading States */}
          {shouldShow('loading') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Loading States</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Regenerating */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoadingType('regenerating');
                    setShowLoadingOverlay(true);
                    setTimeout(() => setShowLoadingOverlay(false), 3000);
                  }}
                  className="p-6 rounded-xl text-left"
                  style={{
                    ...glassmorphism.medium,
                    border: `2px solid ${neonColors.purple}40`,
                  }}
                >
                  <h3 className="font-bold text-lg mb-2 text-purple-600">Regenerating Images</h3>
                  <p className="text-sm text-gray-600">
                    Shows when bulk regenerating product images
                  </p>
                </motion.button>

                {/* Ingesting */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoadingType('ingesting');
                    setShowLoadingOverlay(true);
                    setTimeout(() => setShowLoadingOverlay(false), 3000);
                  }}
                  className="p-6 rounded-xl text-left"
                  style={{
                    ...glassmorphism.medium,
                    border: `2px solid ${neonColors.cyan}40`,
                  }}
                >
                  <h3 className="font-bold text-lg mb-2 text-cyan-600">Auto-Ingesting PO</h3>
                  <p className="text-sm text-gray-600">
                    Shows when processing purchase orders
                  </p>
                </motion.button>

                {/* Processing */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoadingType('processing');
                    setShowLoadingOverlay(true);
                    setTimeout(() => setShowLoadingOverlay(false), 3000);
                  }}
                  className="p-6 rounded-xl text-left"
                  style={{
                    ...glassmorphism.medium,
                    border: `2px solid ${neonColors.pink}40`,
                  }}
                >
                  <h3 className="font-bold text-lg mb-2 text-pink-600">AI Processing</h3>
                  <p className="text-sm text-gray-600">
                    Shows when AI is building the catalog
                  </p>
                </motion.button>
              </div>
            </motion.section>
          )}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-xl"
          style={{
            ...glassmorphism.light,
            border: `1px solid ${neonColors.cyan}20`,
          }}
        >
          <h3 className="font-bold text-gray-900 mb-2">Developer Notes:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• This is an internal preview tool - not visible to end users</li>
            <li>• All components use mock data for visual testing</li>
            <li>• Glossy effects, AI images, and animations can be toggled per component</li>
            <li>• Loading overlays auto-dismiss after 3 seconds in this preview</li>
            <li>• Use this to polish visuals without touching business logic</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DevDesignPreviewPage;
