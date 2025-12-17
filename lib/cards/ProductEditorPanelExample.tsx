/**
 * ProductEditor "Visual Design" Panel - Example Layout
 *
 * Complete example showing how to structure the Visual Design panel
 * in the ProductEditor using all preset picker helpers.
 *
 * This is a REFERENCE IMPLEMENTATION showing:
 * - Panel layout structure
 * - Tabbed preset sections
 * - Custom override fields
 * - Live preview
 * - Recommended presets
 * - Form integration
 *
 * Copy and customize as needed for your actual ProductEditor.
 */

import React, { useState } from 'react';
import { PresetGrid, CompactPresetSelector } from './PresetOptionExample';
import { getAdminPresets, getRecommendedPresetsForProduct } from './adminPresetPicker';
import { getCardTheme } from './resolvePresets';
import type { VisualProduct } from './presetTypes';

// ============================================================================
// VISUAL DESIGN PANEL COMPONENT
// ============================================================================

export interface VisualDesignPanelProps {
  product: Partial<VisualProduct>;
  onUpdate: (updates: Partial<VisualProduct>) => void;
}

export function VisualDesignPanel({ product, onUpdate }: VisualDesignPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [presetSection, setPresetSection] = useState<'gradient' | 'glow' | 'splash'>('gradient');

  // Get all presets
  const allPresets = getAdminPresets();

  // Get recommended presets for this product
  const recommended = product.name
    ? getRecommendedPresetsForProduct({
        category: 'Candy', // Replace with actual category
        name: product.name,
        seasonal: product.seasonal,
        seasonal_theme: product.seasonal_theme || undefined,
      })
    : null;

  // Update handlers
  const handleGradientSelect = (id: string) => {
    onUpdate({
      visual_preset: id,
      background_gradient: undefined, // Clear custom gradient
      background_color: undefined, // Clear custom color
    });
  };

  const handleGlowSelect = (id: string) => {
    onUpdate({ glow_preset: id });
  };

  const handleSplashSelect = (id: string) => {
    onUpdate({
      visual_preset: id,
      splash_overlay: undefined, // Clear custom overlay
    });
  };

  // Generate preview theme
  const previewTheme = product.sku
    ? getCardTheme({
        ...product,
        sku: product.sku,
        name: product.name || 'Preview',
        price_case: product.price_case || 0,
        category_id: 1,
        featured: product.featured || false,
        seasonal: product.seasonal || false,
        new_arrival: product.new_arrival || false,
        trending: product.trending || false,
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visual Design</h3>
          <p className="text-sm text-gray-500">
            Customize the visual appearance of this product card
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'presets'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {previewTheme && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">Live Preview</div>
          <div
            className={`relative w-full h-48 rounded-lg transition-all ${previewTheme.border_classes} ${previewTheme.shadow_classes} ${previewTheme.glow_classes}`}
            style={{
              background: previewTheme.background,
              color: previewTheme.text_color,
            }}
          >
            {/* Splash overlay */}
            {previewTheme.splash_overlay_url && (
              <img
                src={previewTheme.splash_overlay_url}
                alt="Splash overlay"
                className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-40"
              />
            )}

            {/* Preview content */}
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div>
                {previewTheme.badges.featured && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded">
                    Featured
                  </span>
                )}
              </div>
              <div>
                <div className="text-lg font-bold">{product.name || 'Product Name'}</div>
                <div className="text-sm opacity-75">
                  ${product.price_case?.toFixed(2) || '0.00'} / case
                </div>
              </div>
            </div>
          </div>

          {/* Theme info */}
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <div>
              <span className="font-medium">Theme:</span> {previewTheme.theme_id}
            </div>
            {previewTheme.preset_id && (
              <div>
                <span className="font-medium">Preset:</span> {previewTheme.preset_id}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Mode */}
      {activeTab === 'presets' && (
        <div className="space-y-6">
          {/* Recommended Section (if available) */}
          {recommended && recommended.gradients.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-blue-900">
                  Recommended for this product
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {recommended.gradients.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleGradientSelect(preset.id)}
                    className="group relative"
                  >
                    <div
                      style={{ background: preset.css }}
                      className="w-full aspect-square rounded-lg ring-2 ring-blue-300 hover:ring-blue-500 transition-all"
                    />
                    <div className="text-xs text-center mt-1 text-blue-900 font-medium">
                      {preset.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Section Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPresetSection('gradient')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  presetSection === 'gradient'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Gradient Backgrounds
              </button>
              <button
                type="button"
                onClick={() => setPresetSection('glow')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  presetSection === 'glow'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Glow Effects
              </button>
              <button
                type="button"
                onClick={() => setPresetSection('splash')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  presetSection === 'splash'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Splash Overlays
              </button>
            </div>
          </div>

          {/* Gradient Presets */}
          {presetSection === 'gradient' && (
            <div>
              <div className="mb-3 text-sm text-gray-600">
                Choose a gradient background for your product card
              </div>
              <PresetGrid
                type="gradient"
                presetIds={allPresets.gradients.map((p) => p.id)}
                selectedId={product.visual_preset || undefined}
                onSelect={handleGradientSelect}
                columns={4}
                size="md"
                showLabels={true}
                showBadges={true}
              />
            </div>
          )}

          {/* Glow Presets */}
          {presetSection === 'glow' && (
            <div>
              <div className="mb-3 text-sm text-gray-600">
                Add a glow effect to make your product stand out
              </div>
              <PresetGrid
                type="glow"
                presetIds={allPresets.glows.map((p) => p.id)}
                selectedId={product.glow_preset || undefined}
                onSelect={handleGlowSelect}
                columns={4}
                size="md"
                showLabels={true}
                showBadges={true}
              />
            </div>
          )}

          {/* Splash Presets */}
          {presetSection === 'splash' && (
            <div>
              <div className="mb-3 text-sm text-gray-600">
                Add a decorative splash overlay (best for products with transparent backgrounds)
              </div>
              <PresetGrid
                type="splash"
                presetIds={allPresets.splashes.map((p) => p.id)}
                selectedId={product.visual_preset || undefined}
                onSelect={handleSplashSelect}
                columns={3}
                size="lg"
                showLabels={true}
                showBadges={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Custom Mode */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={product.background_color || '#ffffff'}
                onChange={(e) =>
                  onUpdate({
                    background_color: e.target.value,
                    background_gradient: undefined, // Clear gradient
                    visual_preset: undefined, // Clear preset
                  })
                }
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={product.background_color || ''}
                onChange={(e) =>
                  onUpdate({
                    background_color: e.target.value,
                    background_gradient: undefined,
                    visual_preset: undefined,
                  })
                }
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Gradient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom CSS Gradient
            </label>
            <textarea
              value={product.background_gradient || ''}
              onChange={(e) =>
                onUpdate({
                  background_gradient: e.target.value,
                  background_color: undefined,
                  visual_preset: undefined,
                })
              }
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a valid CSS gradient (e.g., linear-gradient, radial-gradient)
            </p>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={product.text_color || '#111827'}
                onChange={(e) => onUpdate({ text_color: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={product.text_color || ''}
                onChange={(e) => onUpdate({ text_color: e.target.value })}
                placeholder="#111827"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Splash Overlay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Splash Overlay URL
            </label>
            <input
              type="url"
              value={product.splash_overlay || ''}
              onChange={(e) => onUpdate({ splash_overlay: e.target.value })}
              placeholder="https://example.com/overlay.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL to a PNG/SVG overlay image (transparent background recommended)
            </p>
          </div>

          {/* Quick preset selector for glow */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Glow Effect (Optional)
            </label>
            <CompactPresetSelector
              type="glow"
              presetIds={allPresets.glows.map((p) => p.id)}
              selectedId={product.glow_preset || undefined}
              onSelect={handleGlowSelect}
              placeholder="No glow effect"
            />
          </div>
        </div>
      )}

      {/* Enhancement Flags */}
      <div className="pt-6 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-3">Enhancement Flags</div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.featured || false}
              onChange={(e) => onUpdate({ featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700">Featured Product</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.seasonal || false}
              onChange={(e) => onUpdate({ seasonal: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700">Seasonal</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.new_arrival || false}
              onChange={(e) => onUpdate({ new_arrival: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700">New Arrival</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.trending || false}
              onChange={(e) => onUpdate({ trending: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700">Trending</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() =>
            onUpdate({
              visual_preset: undefined,
              glow_preset: undefined,
              background_color: undefined,
              background_gradient: undefined,
              text_color: undefined,
              splash_overlay: undefined,
            })
          }
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE IN PRODUCT EDITOR
// ============================================================================

/*
// In your ProductEditor component:

export function ProductEditor() {
  const [product, setProduct] = useState<Partial<VisualProduct>>({
    sku: 'SKU-001',
    name: 'Sample Product',
    price_case: 24.99,
    category_id: 1,
  });

  const handleVisualUpdate = (updates: Partial<VisualProduct>) => {
    setProduct(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <VisualDesignPanel
        product={product}
        onUpdate={handleVisualUpdate}
      />
    </div>
  );
}
*/
