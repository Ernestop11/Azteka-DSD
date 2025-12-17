import React, { useState } from 'react';
import { Brand } from '../types';
import { Plus, Edit, Trash2, Award } from 'lucide-react';

interface BrandManagerProps {
  brands: Brand[];
  onCreateBrand: (data: Partial<Brand>) => Promise<void>;
  onUpdateBrand: (id: string, data: Partial<Brand>) => Promise<void>;
  onDeleteBrand: (id: string) => Promise<void>;
}

export const BrandManager: React.FC<BrandManagerProps> = ({
  brands,
  onCreateBrand,
  onUpdateBrand,
  onDeleteBrand,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await onUpdateBrand(editingId, formData);
        setEditingId(null);
      } else {
        await onCreateBrand(formData);
        setIsCreating(false);
      }
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to save brand:', error);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      description: brand.description || '',
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Brands</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={16} />
            <span>Add Brand</span>
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-green-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Takis, Jarritos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {editingId ? 'Update' : 'Create'} Brand
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {brands.length === 0 ? (
          <div className="text-center py-8">
            <Award className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-4">No brands yet</p>
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <h4 className="font-medium text-gray-900">{brand.name}</h4>
                {brand.description && (
                  <p className="text-sm text-gray-500 mt-1">{brand.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(brand)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Edit brand"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${brand.name}"?`)) {
                      onDeleteBrand(brand.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete brand"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
