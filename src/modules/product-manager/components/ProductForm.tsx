import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../types';
import { Upload, X, DollarSign, Package, Tag, Sparkles, Eraser, Wand2, Image as ImageIcon, Loader } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  brands: Brand[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  brands,
  onSubmit,
  onCancel,
  onShowToast,
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    inStock: product?.inStock ?? true,
    stock: product?.stock || 0,
    featured: product?.featured || false,
    unitType: product?.unitType || 'case',
    unitsPerCase: product?.unitsPerCase || 1,
    minOrderQty: product?.minOrderQty || 1,
    backgroundColor: product?.backgroundColor || '#f3f4f6',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || product?.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiToolLoading, setAiToolLoading] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (formData.sku.trim().length < 2) {
      newErrors.sku = 'SKU must be at least 2 characters';
    }

    // Numeric validations
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (formData.price > 999999) {
      newErrors.price = 'Price must be less than $999,999';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    } else if (formData.cost > formData.price) {
      newErrors.cost = 'Cost should not exceed price';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (formData.stock > 999999) {
      newErrors.stock = 'Stock must be less than 999,999';
    }

    if (formData.unitsPerCase <= 0) {
      newErrors.unitsPerCase = 'Units per case must be at least 1';
    } else if (formData.unitsPerCase > 1000) {
      newErrors.unitsPerCase = 'Units per case must be less than 1,000';
    }

    if (formData.minOrderQty <= 0) {
      newErrors.minOrderQty = 'Minimum order quantity must be at least 1';
    } else if (formData.minOrderQty > 1000) {
      newErrors.minOrderQty = 'Minimum order quantity must be less than 1,000';
    }

    // Image validation
    if (imageFile) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(imageFile.type)) {
        newErrors.image = 'Only PNG and JPEG images are allowed';
      } else if (imageFile.size > 5 * 1024 * 1024) {
        newErrors.image = 'Image must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image immediately
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'Only PNG and JPEG images are allowed' });
        return;
      } else if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image must be less than 5MB' });
        return;
      }

      setImageFile(file);
      setErrors({ ...errors, image: '' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISearchImage = async () => {
    if (!product?.id) {
      onShowToast?.('Please save the product first before using AI tools', 'warning');
      return;
    }

    setAiToolLoading('search-image');
    try {
      const response = await fetch('/api/auto/search-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id, query: formData.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to search for image');
      }

      const result = await response.json();
      if (result.imageUrl) {
        setImagePreview(result.imageUrl);
        onShowToast?.('AI found a matching image!', 'success');
      }
    } catch (error) {
      console.error('AI search failed:', error);
      onShowToast?.('Failed to find image with AI', 'error');
    } finally {
      setAiToolLoading(null);
    }
  };

  const handleRemoveBackground = async () => {
    if (!imagePreview) {
      onShowToast?.('Please upload an image first', 'warning');
      return;
    }

    setAiToolLoading('bg-remove');
    try {
      const response = await fetch('/api/auto/bg-remove', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: imagePreview }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove background');
      }

      const result = await response.json();
      if (result.processedUrl) {
        setImagePreview(result.processedUrl);
        onShowToast?.('Background removed successfully!', 'success');
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      onShowToast?.('Failed to remove background', 'error');
    } finally {
      setAiToolLoading(null);
    }
  };

  const handleEnhanceImage = async () => {
    if (!imagePreview) {
      onShowToast?.('Please upload an image first', 'warning');
      return;
    }

    setAiToolLoading('enhance');
    try {
      const response = await fetch('/api/auto/enhance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: imagePreview }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance image');
      }

      const result = await response.json();
      if (result.enhancedUrl) {
        setImagePreview(result.enhancedUrl);
        onShowToast?.('Image enhanced successfully!', 'success');
      }
    } catch (error) {
      console.error('Image enhancement failed:', error);
      onShowToast?.('Failed to enhance image', 'error');
    } finally {
      setAiToolLoading(null);
    }
  };

  const handleGeneratePromoBanner = async () => {
    if (!product?.id) {
      onShowToast?.('Please save the product first before generating promo banners', 'warning');
      return;
    }

    setAiToolLoading('promo-banner');
    try {
      const response = await fetch('/api/design/render-promo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          template: 'default',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate promo banner');
      }

      const result = await response.json();
      onShowToast?.(`Promo banner generated! ${result.url ? 'Check your downloads.' : ''}`, 'success');
    } catch (error) {
      console.error('Promo generation failed:', error);
      onShowToast?.('Failed to generate promo banner', 'error');
    } finally {
      setAiToolLoading(null);
    }
  };

  const handleRegenerateProductCard = async () => {
    if (!product?.id) {
      onShowToast?.('Please save the product first before regenerating product card', 'warning');
      return;
    }

    setAiToolLoading('product-card');
    try {
      const response = await fetch('/api/design/render-product-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          template: 'modern',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate product card');
      }

      const result = await response.json();
      if (result.cardUrl) {
        setImagePreview(result.cardUrl);
        onShowToast?.('Product card regenerated!', 'success');
      }
    } catch (error) {
      console.error('Product card generation failed:', error);
      onShowToast?.('Failed to regenerate product card', 'error');
    } finally {
      setAiToolLoading(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Draft Product Banner */}
      {(product?.isDraft || product?.is_draft) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-yellow-600" size={24} />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">This is an AI Draft – Please Review</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This product was automatically extracted or generated by AI. Please verify all information before publishing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="flex items-center space-x-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                  setErrors({ ...errors, image: '' });
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className={`w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition ${
              errors.image ? 'border-red-300 hover:border-red-500' : 'border-gray-300 hover:border-blue-500'
            }`}>
              <Upload className="text-gray-400" size={32} />
              <span className="text-xs text-gray-500 mt-2">Upload Image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}

        {/* AI Image Tools */}
        {imagePreview && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="text-purple-600" size={18} />
              <h4 className="text-sm font-semibold text-gray-900">AI Image Tools</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleAISearchImage}
                disabled={aiToolLoading !== null}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {aiToolLoading === 'search-image' ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>Find Best Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={aiToolLoading !== null}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {aiToolLoading === 'bg-remove' ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Eraser size={14} />
                )}
                <span>Remove BG</span>
              </button>
              <button
                type="button"
                onClick={handleEnhanceImage}
                disabled={aiToolLoading !== null}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {aiToolLoading === 'enhance' ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Wand2 size={14} />
                )}
                <span>Enhance</span>
              </button>
              <button
                type="button"
                onClick={handleGeneratePromoBanner}
                disabled={aiToolLoading !== null}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {aiToolLoading === 'promo-banner' ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <ImageIcon size={14} />
                )}
                <span>Promo Banner</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerateProductCard}
                disabled={aiToolLoading !== null}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition col-span-2"
              >
                {aiToolLoading === 'product-card' ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>Regenerate Product Card</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <input
            type="text"
            required
            value={formData.sku}
            onChange={(e) => {
              setFormData({ ...formData, sku: e.target.value });
              if (errors.sku) setErrors({ ...errors, sku: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.sku ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="inline" size={16} /> Price *
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => {
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 });
              if (errors.price) setErrors({ ...errors, price: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="inline" size={16} /> Cost
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => {
              setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 });
              if (errors.cost) setErrors({ ...errors, cost: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.cost ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.cost && (
            <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
          )}
        </div>
      </div>

      {/* Category & Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="inline" size={16} /> Category
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <select
            value={formData.brandId}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Package className="inline" size={16} /> Stock
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => {
              setFormData({ ...formData, stock: parseInt(e.target.value) || 0 });
              if (errors.stock) setErrors({ ...errors, stock: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.stock ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Units per Case
          </label>
          <input
            type="number"
            min="1"
            value={formData.unitsPerCase}
            onChange={(e) => {
              setFormData({ ...formData, unitsPerCase: parseInt(e.target.value) || 1 });
              if (errors.unitsPerCase) setErrors({ ...errors, unitsPerCase: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.unitsPerCase ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.unitsPerCase && (
            <p className="mt-1 text-sm text-red-600">{errors.unitsPerCase}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Order Qty
          </label>
          <input
            type="number"
            min="1"
            value={formData.minOrderQty}
            onChange={(e) => {
              setFormData({ ...formData, minOrderQty: parseInt(e.target.value) || 1 });
              if (errors.minOrderQty) setErrors({ ...errors, minOrderQty: '' });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
              errors.minOrderQty ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.minOrderQty && (
            <p className="mt-1 text-sm text-red-600">{errors.minOrderQty}</p>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.inStock}
            onChange={(e) =>
              setFormData({ ...formData, inStock: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">In Stock</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) =>
              setFormData({ ...formData, featured: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Featured</span>
        </label>
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background Color
        </label>
        <input
          type="color"
          value={formData.backgroundColor}
          onChange={(e) =>
            setFormData({ ...formData, backgroundColor: e.target.value })
          }
          className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};
