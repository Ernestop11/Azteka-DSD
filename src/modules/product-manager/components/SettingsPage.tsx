import React, { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { Category, Brand } from '../types';

interface SettingsConfig {
  featuredProductsLimit: number;
  defaultSorting: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'popular';
  defaultBrandOrder: string[];
  homePageCategories: string[];
  enableProductReviews: boolean;
  enableOutOfStockPurchase: boolean;
}

interface SettingsPageProps {
  categories: Category[];
  brands: Brand[];
  onSave: (settings: SettingsConfig) => Promise<void>;
  initialSettings?: Partial<SettingsConfig>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  categories,
  brands,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<SettingsConfig>({
    featuredProductsLimit: initialSettings?.featuredProductsLimit || 6,
    defaultSorting: initialSettings?.defaultSorting || 'newest',
    defaultBrandOrder: initialSettings?.defaultBrandOrder || brands.map((b) => b.id),
    homePageCategories: initialSettings?.homePageCategories || [],
    enableProductReviews: initialSettings?.enableProductReviews ?? true,
    enableOutOfStockPurchase: initialSettings?.enableOutOfStockPurchase ?? false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>(
    brands.filter((b) => !settings.defaultBrandOrder.includes(b.id)).map((b) => b.id)
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const moveBrandUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...settings.defaultBrandOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSettings({ ...settings, defaultBrandOrder: newOrder });
  };

  const moveBrandDown = (index: number) => {
    if (index === settings.defaultBrandOrder.length - 1) return;
    const newOrder = [...settings.defaultBrandOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSettings({ ...settings, defaultBrandOrder: newOrder });
  };

  const toggleHomePageCategory = (categoryId: string) => {
    const isIncluded = settings.homePageCategories.includes(categoryId);
    setSettings({
      ...settings,
      homePageCategories: isIncluded
        ? settings.homePageCategories.filter((id) => id !== categoryId)
        : [...settings.homePageCategories, categoryId],
    });
  };

  const getBrandName = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.name || 'Unknown Brand';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown Category';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="text-gray-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Product Manager Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Featured Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Products Limit
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.featuredProductsLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  featuredProductsLimit: parseInt(e.target.value) || 6,
                })
              }
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of featured products to display on the homepage
            </p>
          </div>

          {/* Default Sorting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Product Sorting
            </label>
            <select
              value={settings.defaultSorting}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultSorting: e.target.value as SettingsConfig['defaultSorting'],
                })
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Default sorting order for product listings
            </p>
          </div>

          {/* Brand Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Display Order
            </label>
            <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
              {settings.defaultBrandOrder.map((brandId, index) => (
                <div
                  key={brandId}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}. {getBrandName(brandId)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveBrandUp(index)}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveBrandDown(index)}
                      disabled={index === settings.defaultBrandOrder.length - 1}
                      className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Drag to reorder how brands appear in listings
            </p>
          </div>

          {/* Home Page Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Page Categories
            </label>
            <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={settings.homePageCategories.includes(category.id)}
                    onChange={() => toggleHomePageCategory(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select which categories to display on the homepage
            </p>
          </div>

          {/* Additional Settings */}
          <div className="space-y-3 pt-4 border-t">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableProductReviews}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableProductReviews: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Enable Product Reviews</span>
                <p className="text-xs text-gray-500">Allow customers to leave product reviews</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableOutOfStockPurchase}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableOutOfStockPurchase: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Allow Out-of-Stock Purchase
                </span>
                <p className="text-xs text-gray-500">
                  Let customers order products that are out of stock
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw size={20} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save size={20} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
