/**
 * Visual Design Panel - Polished Version
 *
 * Improvements:
 * - Clean section dividers with labels
 * - Tooltips on all interactive elements
 * - Smooth transitions for tab changes
 * - Tighter swatch spacing (gap-2 instead of gap-4)
 * - Larger, responsive preview card (sticky on desktop)
 * - Better visual hierarchy
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresetGrid, CompactPresetSelector } from '../../lib/cards/PresetOptionExample';
import { getAdminPresets, getRecommendedPresetsForProduct } from '../../lib/cards/adminPresetPicker';
import { getCardTheme } from '../../lib/cards/resolvePresets';
import type { VisualProduct } from '../../lib/cards/presetTypes';

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION DIVIDER
// ============================================================================

function SectionDivider({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-4">
      {icon}
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</div>
        <div className="h-px bg-gradient-to-r from-gray-300 to-transparent mt-1" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface VisualDesignPanelProps {
  product: Partial<VisualProduct>;
  onUpdate: (updates: Partial<VisualProduct>) => void;
}

export function VisualDesignPanelPolished({ product, onUpdate }: VisualDesignPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [presetSection, setPresetSection] = useState<'gradient' | 'glow' | 'splash'>('gradient');

  const allPresets = getAdminPresets();

  const recommended = product.name
    ? getRecommendedPresetsForProduct({
        category: 'Candy',
        name: product.name,
        seasonal: product.seasonal,
        seasonal_theme: product.seasonal_theme || undefined,
      })
    : null;

  const handleGradientSelect = (id: string) => {
    onUpdate({
      visual_preset: id,
      background_gradient: undefined,
      background_color: undefined,
    });
  };

  const handleGlowSelect = (id: string) => {
    onUpdate({ glow_preset: id });
  };

  const handleSplashSelect = (id: string) => {
    onUpdate({
      visual_preset: id,
      splash_overlay: undefined,
    });
  };

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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content - Left Side */}
      <div className="flex-1 space-y-6">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visual Design</h3>
            <p className="text-sm text-gray-500 mt-1">
              Customize the visual appearance of this product card
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <Tooltip content="Choose from preset themes">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'presets'
                    ? 'bg-white text-gray-900 shadow-sm scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Presets
              </button>
            </Tooltip>
            <Tooltip content="Create custom styles">
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Recommended Presets */}
        <AnimatePresence mode="wait">
          {activeTab === 'presets' && recommended && recommended.gradients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-blue-900">Recommended for this product</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {recommended.gradients.slice(0, 4).map((preset) => (
                  <Tooltip key={preset.id} content={preset.description}>
                    <button
                      type="button"
                      onClick={() => handleGradientSelect(preset.id)}
                      className="group relative transition-transform hover:scale-105"
                    >
                      <div
                        style={{ background: preset.css }}
                        className="w-full aspect-square rounded-lg ring-2 ring-blue-300 hover:ring-blue-500 transition-all shadow-sm"
                      />
                      <div className="text-xs text-center mt-1 text-blue-900 font-medium truncate">
                        {preset.label}
                      </div>
                    </button>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset Mode */}
        <AnimatePresence mode="wait">
          {activeTab === 'presets' && (
            <motion.div
              key="presets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <SectionDivider label="Preset Library" />

              {/* Preset Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-6">
                  {[
                    { id: 'gradient', label: 'Gradients', tooltip: 'Background gradients' },
                    { id: 'glow', label: 'Glows', tooltip: 'Shadow effects' },
                    { id: 'splash', label: 'Splashes', tooltip: 'Decorative overlays' },
                  ].map((tab) => (
                    <Tooltip key={tab.id} content={tab.tooltip}>
                      <button
                        type="button"
                        onClick={() => setPresetSection(tab.id as any)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                          presetSection === tab.id
                            ? 'border-blue-500 text-blue-600 scale-105'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Preset Content with Transitions */}
              <AnimatePresence mode="wait">
                {presetSection === 'gradient' && (
                  <motion.div
                    key="gradient"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-3 text-sm text-gray-600">
                      Choose a gradient background for your product card
                    </div>
                    <div className="grid grid-cols-4 gap-2">
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
                  </motion.div>
                )}

                {presetSection === 'glow' && (
                  <motion.div
                    key="glow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-3 text-sm text-gray-600">
                      Add a glow effect to make your product stand out
                    </div>
                    <div className="grid grid-cols-4 gap-2">
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
                  </motion.div>
                )}

                {presetSection === 'splash' && (
                  <motion.div
                    key="splash"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-3 text-sm text-gray-600">
                      Add a decorative splash overlay (best for transparent backgrounds)
                    </div>
                    <div className="grid grid-cols-3 gap-2">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Custom Mode */}
          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <SectionDivider label="Custom Styling" />

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                  <Tooltip content="Choose a solid background color">
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Tooltip>
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={product.background_color || '#ffffff'}
                    onChange={(e) =>
                      onUpdate({
                        background_color: e.target.value,
                        background_gradient: undefined,
                        visual_preset: undefined,
                      })
                    }
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer transition-transform hover:scale-105"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Custom Gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS Gradient
                  <Tooltip content="Enter a CSS gradient (linear-gradient, radial-gradient)">
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Tooltip>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none font-mono text-sm transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a valid CSS gradient (e.g., linear-gradient, radial-gradient)
                </p>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                  <Tooltip content="Choose text color for better contrast">
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Tooltip>
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={product.text_color || '#111827'}
                    onChange={(e) => onUpdate({ text_color: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer transition-transform hover:scale-105"
                  />
                  <input
                    type="text"
                    value={product.text_color || ''}
                    onChange={(e) => onUpdate({ text_color: e.target.value })}
                    placeholder="#111827"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Custom Splash Overlay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Splash Overlay URL
                  <Tooltip content="PNG/SVG with transparent background recommended">
                    <svg className="inline w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Tooltip>
                </label>
                <input
                  type="url"
                  value={product.splash_overlay || ''}
                  onChange={(e) => onUpdate({ splash_overlay: e.target.value })}
                  placeholder="https://example.com/overlay.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                />
              </div>

              {/* Glow Effect */}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhancement Flags */}
        <div className="pt-6 border-t border-gray-200">
          <SectionDivider label="Enhancement Flags" />
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'featured', label: 'Featured Product', tooltip: 'Show as featured item' },
              { key: 'seasonal', label: 'Seasonal', tooltip: 'Mark as seasonal product' },
              { key: 'new_arrival', label: 'New Arrival', tooltip: 'Show new arrival badge' },
              { key: 'trending', label: 'Trending', tooltip: 'Show trending badge' },
            ].map((flag) => (
              <Tooltip key={flag.key} content={flag.tooltip}>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={product[flag.key as keyof typeof product] as boolean || false}
                    onChange={(e) => onUpdate({ [flag.key]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400 transition-transform group-hover:scale-110"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {flag.label}
                  </span>
                </label>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
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
            className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* Live Preview - Right Side (Sticky on Desktop) */}
      {previewTheme && (
        <div className="lg:w-80 xl:w-96">
          <div className="lg:sticky lg:top-6">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Live Preview</div>
                <Tooltip content="Real-time preview of your changes">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Tooltip>
              </div>

              <motion.div
                className={`relative w-full h-64 sm:h-72 rounded-lg transition-all ${previewTheme.border_classes} ${previewTheme.shadow_classes} ${previewTheme.glow_classes}`}
                style={{
                  background: previewTheme.background,
                  color: previewTheme.text_color,
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {previewTheme.splash_overlay_url && (
                  <img
                    src={previewTheme.splash_overlay_url}
                    alt="Splash overlay"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-40"
                  />
                )}

                <div className="relative p-4 h-full flex flex-col justify-between">
                  <div>
                    {previewTheme.badges.featured && (
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded shadow-sm">
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
              </motion.div>

              {/* Theme Info */}
              <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <span className="font-medium">Theme:</span>{' '}
                    <span className="text-gray-700">{previewTheme.theme_id}</span>
                  </div>
                  {previewTheme.preset_id && (
                    <div>
                      <span className="font-medium">Preset:</span>{' '}
                      <span className="text-gray-700">{previewTheme.preset_id}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
