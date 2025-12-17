import React, { useState } from 'react';
import { Section, Product, Category, Brand } from '../types';
import { X, Save } from 'lucide-react';

interface SectionEditorProps {
  section: Section;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  onSave: (section: Section) => void;
  onCancel: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  products,
  categories,
  brands,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState(section);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateConfig = (updates: Partial<typeof formData.config>) => {
    setFormData({
      ...formData,
      config: { ...formData.config, ...updates },
    });
  };

  const renderConfigFields = () => {
    switch (section.type) {
      case 'hero':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Title
              </label>
              <input
                type="text"
                value={formData.config.heroTitle || ''}
                onChange={(e) => updateConfig({ heroTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Main headline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={formData.config.heroSubtitle || ''}
                onChange={(e) => updateConfig({ heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Supporting text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Image URL
              </label>
              <input
                type="url"
                value={formData.config.heroImageUrl || ''}
                onChange={(e) => updateConfig({ heroImageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.config.heroCta || ''}
                  onChange={(e) => updateConfig({ heroCta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Shop Now"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Link
                </label>
                <input
                  type="text"
                  value={formData.config.heroCtaLink || ''}
                  onChange={(e) => updateConfig({ heroCtaLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="/products"
                />
              </div>
            </div>
          </>
        );

      case 'two-column-grid':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns
              </label>
              <select
                value={formData.config.columns || 2}
                onChange={(e) => updateConfig({ columns: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Products
              </label>
              <select
                multiple
                value={formData.config.productIds || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                  updateConfig({ productIds: selected });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-48"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple products
              </p>
            </div>
          </>
        );

      case 'brand-row':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Brand
              </label>
              <select
                value={formData.config.brandId || ''}
                onChange={(e) => updateConfig({ brandId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a brand...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Products to Display
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.config.maxProducts || 6}
                onChange={(e) => updateConfig({ maxProducts: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );

      case 'bundle-block':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundle Title
              </label>
              <input
                type="text"
                value={formData.config.bundleTitle || ''}
                onChange={(e) => updateConfig({ bundleTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Special Bundle Deal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundle Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.config.bundlePrice || 0}
                onChange={(e) =>
                  updateConfig({ bundlePrice: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundle Products
              </label>
              <select
                multiple
                value={formData.config.bundleProductIds || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                  updateConfig({ bundleProductIds: selected });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-48"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case 'scrolling-section':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.config.categoryId || ''}
                onChange={(e) => updateConfig({ categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scroll Speed
              </label>
              <select
                value={formData.config.scrollSpeed || 'medium'}
                onChange={(e) =>
                  updateConfig({
                    scrollSpeed: e.target.value as 'slow' | 'medium' | 'fast',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Edit Section: {formData.title}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Section title"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Optional subtitle"
            />
          </div>

          {/* Type-specific configuration */}
          {renderConfigFields()}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save size={16} />
            <span>Save Section</span>
          </button>
        </div>
      </div>
    </div>
  );
};
