import { useState, useEffect } from 'react';
import { Plus, X, Save, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  priceCase?: number;
  imageUrl?: string;
}

interface BundleItem {
  productId: string;
  quantity: number;
}

interface Bundle {
  id?: string;
  name: string;
  description: string;
  categoryId?: string;
  discountPercent: number;
  price: number;
  items: BundleItem[];
}

export default function BundleEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Bundle>({
    name: '',
    description: '',
    categoryId: '',
    discountPercent: 0,
    price: 0,
    items: [],
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${apiBase}/products?all=true`).then(r => r.json()),
        fetch(`${apiBase}/categories`).then(r => r.json()),
      ]);

      setProducts(Array.isArray(productsRes) ? productsRes : []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProductToBundle = () => {
    if (!selectedProductId) return;

    const existingItem = formData.items.find(item => item.productId === selectedProductId);
    
    if (existingItem) {
      // Update quantity if product already in bundle
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        ),
      });
    } else {
      // Add new product to bundle
      setFormData({
        ...formData,
        items: [...formData.items, { productId: selectedProductId, quantity: selectedQuantity }],
      });
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const removeProductFromBundle = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.productId !== productId),
    });
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  };

  const calculateBundlePrice = () => {
    let total = 0;
    formData.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.priceCase) {
        total += product.priceCase * item.quantity;
      }
    });
    
    const discountAmount = total * (formData.discountPercent / 100);
    return total - discountAmount;
  };

  const handleSave = async () => {
    if (!formData.name || formData.items.length === 0) {
      setError('Bundle name and at least one product are required');
      return;
    }

    try {
      setError(null);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const bundlePrice = calculateBundlePrice();
      
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId || null,
        discountPercent: formData.discountPercent,
        price: bundlePrice,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(`${apiBase}/admin/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bundle');
      }

      // Reset form on success
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        discountPercent: 0,
        price: 0,
        items: [],
      });

      alert('Bundle created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save bundle');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bundle Editor</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Basic bundle information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Bundle Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bundle Name *</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="e.g., La Molienda Starter Pack"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Bundle description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="w-full p-2 border rounded"
                placeholder="15"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* Add products to bundle */}
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-lg font-semibold">Add Products</h2>
          
          <div className="flex gap-2">
            <select
              className="flex-1 p-2 border rounded"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.priceCase ? `($${product.priceCase})` : ''}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              min="1"
              className="w-24 p-2 border rounded"
              placeholder="Qty"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
            />
            
            <button
              type="button"
              onClick={addProductToBundle}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              disabled={!selectedProductId}
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </div>

        {/* Bundle items list */}
        {formData.items.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h2 className="text-lg font-semibold">Bundle Items ({formData.items.length})</h2>
            
            <div className="space-y-2">
              {formData.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                
                return (
                  <div key={item.productId} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      {product.priceCase && (
                        <div className="text-sm text-gray-600">
                          ${product.priceCase} × {item.quantity} = ${(product.priceCase * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        className="w-20 p-1 border rounded text-center"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeProductFromBundle(item.productId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle price summary */}
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Subtotal</div>
                  <div className="text-lg font-semibold">
                    ${calculateBundlePrice().toFixed(2)}
                  </div>
                  {formData.discountPercent > 0 && (
                    <div className="text-sm text-green-600">
                      {formData.discountPercent}% discount applied
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!formData.name || formData.items.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            Create Bundle
          </button>
        </div>
      </div>
    </div>
  );
}

