import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../context/AuthContext';

interface Product {
  id: string;
  name: string;
  brand?: string | { id: string; name: string; logoUrl?: string };
  category?: string | { id: string; name: string; slug?: string };
  sku?: string;
  imageUrl?: string | null;
  hasImage: boolean;
}

interface UploadProgress {
  [key: string]: 'uploading' | 'success' | 'error';
}

export default function ProductImageUpload() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('productId');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]); // All products for stats
  const [products, setProducts] = useState<Product[]>([]); // Filtered products for display
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState<'all' | 'no-image' | 'with-image'>('no-image');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  // Auto-select product from URL parameter (check all products, not just filtered)
  useEffect(() => {
    if (productIdFromUrl && allProducts.length > 0) {
      const product = allProducts.find(p => p.id === productIdFromUrl);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [productIdFromUrl, allProducts]);

  const fetchProducts = async () => {
    try {
      // In development, use /api to leverage Vite proxy (forwards to port 4000)
      // In production, use VITE_API_URL if set, otherwise /api
      let apiUrl: string;
      if (import.meta.env.DEV) {
        apiUrl = '/api/products?all=true';
      } else {
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        apiUrl = apiBase.endsWith('/') 
          ? `${apiBase}products?all=true`
          : `${apiBase}/products?all=true`;
      }

      console.log('🔍 ProductImageUpload: Fetching from:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 ProductImageUpload: Raw API response:', data);
      console.log('📦 ProductImageUpload: Response type:', Array.isArray(data) ? 'array' : typeof data);
      
      // Handle different response formats
      let productArray: Product[] = [];
      if (Array.isArray(data)) {
        productArray = data;
      } else if (data.products && Array.isArray(data.products)) {
        productArray = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        productArray = data.data;
      }

      console.log('✅ ProductImageUpload: Processed products:', productArray.length);

      // Filter products based on selected filter
      let filtered = productArray;
      if (filter === 'no-image') {
        filtered = productArray.filter((p: Product) => !p.imageUrl && !p.hasImage);
      } else if (filter === 'with-image') {
        filtered = productArray.filter((p: Product) => p.imageUrl || p.hasImage);
      }

      console.log('📊 ProductImageUpload: Filtered products:', filtered.length, `(filter: ${filter})`);
      setAllProducts(productArray); // Store all products for stats
      setProducts(filtered); // Store filtered products for display
    } catch (error) {
      console.error('❌ ProductImageUpload: Failed to fetch products:', error);
      setAllProducts([]);
      setProducts([]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [selectedProduct]);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or WebP images.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedProduct || !selectedFile) {
      alert('Please select both a product and an image');
      return;
    }

    setUploading(true);
    setUploadProgress(prev => ({
      ...prev,
      [selectedProduct.id]: 'uploading'
    }));

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Use proxy in development
      const apiBase = import.meta.env.DEV 
        ? '/api' 
        : (import.meta.env.VITE_API_URL || '/api');
      const apiUrl = apiBase.endsWith('/')
        ? `${apiBase}products/${selectedProduct.id}/upload-image`
        : `${apiBase}/products/${selectedProduct.id}/upload-image`;
      
      const response = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUploadProgress(prev => ({
          ...prev,
          [selectedProduct.id]: 'success'
        }));

        // Clear selection and refresh
        setSelectedFile(null);
        setPreviewUrl(null);
        setSelectedProduct(null);

        // Refresh products list
        setTimeout(() => {
          fetchProducts();
          setUploadProgress({});
        }, 2000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [selectedProduct.id]: 'error'
      }));
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Image Upload</h1>
          <p className="text-gray-600">
            Upload product images one at a time. Select a product from the list and drag & drop or browse for an image.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{allProducts.length}</p>
              </div>
              <ImageIcon className="text-gray-400" size={32} />
            </div>
          </div>

          <div
            className={`bg-white p-4 rounded-xl shadow-sm border-2 cursor-pointer transition ${
              filter === 'no-image' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
            }`}
            onClick={() => setFilter('no-image')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missing Images</p>
                <p className="text-2xl font-bold text-red-600">
                  {allProducts.filter(p => !p.imageUrl && !p.hasImage).length}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>

          <div
            className={`bg-white p-4 rounded-xl shadow-sm border-2 cursor-pointer transition ${
              filter === 'with-image' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => setFilter('with-image')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Images</p>
                <p className="text-2xl font-bold text-green-600">
                  {allProducts.filter(p => p.imageUrl || p.hasImage).length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Product Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Product</h2>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setFilter('no-image')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'no-image'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No Image
              </button>
              <button
                onClick={() => setFilter('with-image')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'with-image'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                With Image
              </button>
            </div>

            <select
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === e.target.value);
                setSelectedProduct(product || null);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              <option value="">Choose a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {(() => {
                    const brandName = typeof product.brand === 'object' && product.brand !== null 
                      ? product.brand.name 
                      : (product.brand || '');
                    return brandName ? `${brandName} - ` : '';
                  })()}{product.name}
                  {(() => {
                    const categoryName = typeof product.category === 'object' && product.category !== null 
                      ? product.category.name 
                      : (product.category || '');
                    return categoryName ? ` (${categoryName})` : '';
                  })()}
                  {!product.imageUrl ? ' - NO IMAGE' : ''}
                </option>
              ))}
            </select>

            {selectedProduct && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Selected Product:</h3>
                <p className="text-sm text-gray-700"><strong>Name:</strong> {selectedProduct.name}</p>
                {selectedProduct.brand && (
                  <p className="text-sm text-gray-700">
                    <strong>Brand:</strong> {
                      typeof selectedProduct.brand === 'object' && selectedProduct.brand !== null
                        ? selectedProduct.brand.name
                        : selectedProduct.brand
                    }
                  </p>
                )}
                {selectedProduct.category && (
                  <p className="text-sm text-gray-700">
                    <strong>Category:</strong> {
                      typeof selectedProduct.category === 'object' && selectedProduct.category !== null
                        ? selectedProduct.category.name
                        : selectedProduct.category
                    }
                  </p>
                )}
                {selectedProduct.sku && (
                  <p className="text-sm text-gray-700"><strong>SKU:</strong> {selectedProduct.sku}</p>
                )}
                <p className="text-sm mt-2">
                  <strong>Current Image:</strong>{' '}
                  {selectedProduct.imageUrl ? (
                    <span className="text-green-600">✓ Has image</span>
                  ) : (
                    <span className="text-red-600">✗ No image</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Upload Area */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>

            {selectedProduct ? (
              <>
                {/* Upload Area */}
                <div
                  className={`
                    border-4 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                    ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'}
                    ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-400 hover:bg-emerald-50'}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !uploading && document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-3"></div>
                      <p className="text-gray-700 font-medium">Uploading image...</p>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSelection();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-600">
                        JPG, PNG, WebP up to 5MB
                      </p>
                    </>
                  )}
                </div>

                {/* Upload Button */}
                {selectedFile && !uploading && (
                  <button
                    onClick={handleUpload}
                    className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={!selectedProduct || !selectedFile}
                  >
                    <Upload size={20} />
                    Upload Image
                  </button>
                )}

                {/* Upload Status */}
                {selectedProduct && uploadProgress[selectedProduct.id] && (
                  <div className="mt-4">
                    {uploadProgress[selectedProduct.id] === 'success' && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                        <div>
                          <h3 className="font-bold text-green-900 mb-1">Upload Successful!</h3>
                          <p className="text-green-700">Image uploaded for {selectedProduct.name}</p>
                        </div>
                      </div>
                    )}
                    {uploadProgress[selectedProduct.id] === 'error' && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                        <div>
                          <h3 className="font-bold text-red-900 mb-1">Upload Failed</h3>
                          <p className="text-red-700">Please try again.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <ImageIcon className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-lg">Select a product to upload an image</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span><strong>Step 1:</strong> Select a product from the dropdown (products without images shown first)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span><strong>Step 2:</strong> Drag & drop an image or click to browse</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span><strong>Step 3:</strong> Preview the image and click "Upload Image"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span><strong>Supported formats:</strong> JPG, PNG, WebP (max 5MB)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <span><strong>Best practice:</strong> Use high-quality product photos with white background</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
