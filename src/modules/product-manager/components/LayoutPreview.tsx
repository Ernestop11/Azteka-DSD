import React from 'react';
import { Section, Product } from '../types';
import { X, Smartphone } from 'lucide-react';

interface LayoutPreviewProps {
  sections: Section[];
  products: Product[];
  onClose: () => void;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  sections,
  products,
  onClose,
}) => {
  const getProductsForSection = (section: Section): Product[] => {
    if (section.config.productIds) {
      return products.filter((p) => section.config.productIds?.includes(p.id));
    }
    if (section.config.bundleProductIds) {
      return products.filter((p) => section.config.bundleProductIds?.includes(p.id));
    }
    if (section.config.categoryId) {
      return products.filter((p) => p.categoryId === section.config.categoryId);
    }
    if (section.config.brandId) {
      return products.filter((p) => p.brandId === section.config.brandId).slice(
        0,
        section.config.maxProducts || 6
      );
    }
    return [];
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div
            className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden"
            style={{
              backgroundImage: section.config.heroImageUrl
                ? `url(${section.config.heroImageUrl})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-8">
              <h2 className="text-3xl font-bold text-center">
                {section.config.heroTitle || 'Hero Title'}
              </h2>
              {section.config.heroSubtitle && (
                <p className="text-lg mt-2 text-center">
                  {section.config.heroSubtitle}
                </p>
              )}
              {section.config.heroCta && (
                <button className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
                  {section.config.heroCta}
                </button>
              )}
            </div>
          </div>
        );

      case 'two-column-grid':
        const gridProducts = getProductsForSection(section);
        const columns = section.config.columns || 2;
        return (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {gridProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundColor: product.backgroundColor || '#f3f4f6',
                    backgroundImage: product.imageUrl
                      ? `url(${product.imageUrl})`
                      : undefined,
                  }}
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                  <p className="text-green-600 font-bold mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'brand-row':
        const brandProducts = getProductsForSection(section);
        return (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {brandProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div
                  className="h-32 bg-cover bg-center"
                  style={{
                    backgroundColor: product.backgroundColor || '#f3f4f6',
                    backgroundImage: product.imageUrl
                      ? `url(${product.imageUrl})`
                      : undefined,
                  }}
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                  <p className="text-green-600 font-bold mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'bundle-block':
        const bundleProducts = getProductsForSection(section);
        return (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 border-2 border-orange-200">
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              {section.config.bundleTitle || 'Bundle Deal'}
            </h3>
            {section.config.bundlePrice && (
              <div className="text-2xl font-bold text-green-600 mb-4">
                ${section.config.bundlePrice.toFixed(2)}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {bundleProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div
                    className="h-24 bg-cover bg-center"
                    style={{
                      backgroundColor: product.backgroundColor || '#f3f4f6',
                      backgroundImage: product.imageUrl
                        ? `url(${product.imageUrl})`
                        : undefined,
                    }}
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{product.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">
              Add Bundle to Cart
            </button>
          </div>
        );

      case 'scrolling-section':
        const scrollProducts = getProductsForSection(section);
        return (
          <div className="relative">
            <div className="marquee-smooth paused flex space-x-4 overflow-x-auto pb-2">
              {scrollProducts.concat(scrollProducts).map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-shrink-0 w-40 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div
                    className="h-28 bg-cover bg-center"
                    style={{
                      backgroundColor: product.backgroundColor || '#f3f4f6',
                      backgroundImage: product.imageUrl
                        ? `url(${product.imageUrl})`
                        : undefined,
                    }}
                  />
                  <div className="p-2">
                    <h4 className="font-semibold text-xs truncate">{product.name}</h4>
                    <p className="text-green-600 font-bold text-sm">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <Smartphone className="text-gray-600" size={24} />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Layout Preview</h3>
              <p className="text-sm text-gray-500">Galaxy Tab S9 FE (1080 × 1920)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Device Frame */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
          <div className="mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ width: '360px', maxWidth: '100%' }}>
            {/* Device Screen */}
            <div className="bg-gray-900 p-2">
              <div className="bg-white h-full overflow-y-auto" style={{ height: '640px' }}>
                <div className="p-4 space-y-6">
                  {sections
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((section) => (
                      <div key={section.id}>
                        {section.title && (
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              {section.title}
                            </h3>
                            {section.subtitle && (
                              <p className="text-sm text-gray-500">{section.subtitle}</p>
                            )}
                          </div>
                        )}
                        {renderSection(section)}
                      </div>
                    ))}

                  {sections.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                      <p>No sections to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
