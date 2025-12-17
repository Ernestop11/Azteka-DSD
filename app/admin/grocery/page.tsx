'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  weekendPrice: number | null;
  isWeekendSpecial: boolean;
  weekendStartDate: string | null;
  weekendEndDate: string | null;
  displayOrder: number;
  imageUrl: string | null;
  category: { name: string } | null;
}

export default function GroceryEditorPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/catalog/products?limit=1000');
      const data = await res.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeekendSpecial = async (productId: string, currentValue: boolean) => {
    setSaving(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isWeekendSpecial: !currentValue,
        }),
      });

      if (res.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateWeekendPrice = async (productId: string, price: number) => {
    setSaving(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekendPrice: price,
        }),
      });

      if (res.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateDates = async (
    productId: string,
    startDate: string | null,
    endDate: string | null
  ) => {
    setSaving(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekendStartDate: startDate || null,
          weekendEndDate: endDate || null,
        }),
      });

      if (res.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grocery Menu Editor</h1>
          <p className="text-gray-600">Manage weekend specials and grocery items</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regular Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekend Special
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekend Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Order
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleWeekendSpecial(product.id, product.isWeekendSpecial)}
                        disabled={saving === product.id}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          product.isWeekendSpecial
                            ? 'bg-yellow-400 text-gray-900'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {product.isWeekendSpecial ? '🌟 Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.weekendPrice || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : null;
                          handleUpdateWeekendPrice(product.id, value || 0);
                        }}
                        disabled={saving === product.id}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={
                            product.weekendStartDate
                              ? new Date(product.weekendStartDate).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => {
                            handleUpdateDates(
                              product.id,
                              e.target.value || null,
                              product.weekendEndDate
                            );
                          }}
                          disabled={saving === product.id}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="date"
                          value={
                            product.weekendEndDate
                              ? new Date(product.weekendEndDate).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => {
                            handleUpdateDates(
                              product.id,
                              product.weekendStartDate,
                              e.target.value || null
                            );
                          }}
                          disabled={saving === product.id}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={product.displayOrder || 0}
                        onChange={(e) => {
                          // TODO: Add display order update
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

