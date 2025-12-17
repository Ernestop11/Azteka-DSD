import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  brand?: string | { id: string; name: string; logoUrl?: string };
  hasImage?: boolean;
  imageUrl?: string;
}

export default function ProductImages() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('🚀 ProductImages component mounted');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiUrl = '/api/products?all=true';
      console.log('🔍 Fetching products from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API response:', data);
      
      // Handle different response formats
      let productArray: Product[] = [];
      if (Array.isArray(data)) {
        productArray = data;
      } else if (data.products && Array.isArray(data.products)) {
        productArray = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        productArray = data.data;
      }
      
      console.log('✅ Processed products:', productArray.length, 'items');
      
      setProducts(productArray);
      setError('');
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Minimal render to avoid any potential issues
  try {
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0,
            color: '#333'
          }}>
            Product Images Dashboard
          </h1>
          <a
            href="/admin/products/images/upload"
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Upload Images
          </a>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '16px', 
          marginBottom: '16px', 
          border: '1px solid #ddd', 
          borderRadius: '8px' 
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Debug Information</h2>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Products Count:</strong> {products.length}</p>
        </div>

        {loading && (
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '32px', 
            textAlign: 'center', 
            border: '1px solid #ddd', 
            borderRadius: '8px' 
          }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Loading products...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ 
            backgroundColor: '#fee', 
            padding: '16px', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            marginBottom: '16px' 
          }}>
            <p style={{ color: '#c33', fontWeight: 'bold' }}>Error: {error}</p>
            <button 
              onClick={fetchProducts}
              style={{ 
                marginTop: '12px', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #ddd' 
              }}>
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Total Products</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{products.length}</p>
              </div>
              
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #ddd' 
              }}>
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>With Images</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  {products.filter(p => p.hasImage).length}
                </p>
              </div>
              
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #ddd' 
              }}>
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Need Images</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                  {products.filter(p => !p.hasImage).length}
                </p>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              border: '1px solid #ddd' 
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Products List (Showing first 20 of {products.length})
                </h2>
              </div>
              
              <div style={{ padding: '16px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '12px' 
                }}>
                  {products.slice(0, 20).map((product, index) => {
                    const brandName = typeof product.brand === 'object' && product.brand !== null 
                      ? product.brand.name 
                      : (product.brand || 'No Brand');
                    
                    return (
                      <div 
                        key={product.id || `product-${index}`}
                        style={{ 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '6px', 
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                            {product.name || 'Unnamed Product'}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                            {brandName}
                          </p>
                          <p style={{ fontSize: '12px' }}>
                            <span style={{ 
                              color: product.hasImage ? '#059669' : '#dc2626',
                              fontWeight: 'bold'
                            }}>
                              {product.hasImage ? '✅ Has Image' : '❌ No Image'}
                            </span>
                          </p>
                          {product.imageUrl && (
                            <div style={{ marginTop: '8px' }}>
                              <img 
                                src={`/uploads/${product.imageUrl}`} 
                                alt={product.name}
                                style={{ 
                                  width: '100%', 
                                  height: '120px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid #e5e7eb'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <a
                            href={`/admin/products/images/upload?productId=${product.id}`}
                            style={{
                              flex: 1,
                              padding: '6px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              textAlign: 'center',
                              fontWeight: '500'
                            }}
                          >
                            {product.hasImage ? 'Change Image' : 'Upload Image'}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '32px', 
            textAlign: 'center', 
            border: '1px solid #ddd', 
            borderRadius: '8px' 
          }}>
            <p style={{ fontSize: '18px', color: '#666' }}>No products found</p>
            <button 
              onClick={fetchProducts}
              style={{ 
                marginTop: '12px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    );
  } catch (renderError: any) {
    console.error('❌ Render error:', renderError);
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#fee', 
        minHeight: '100vh' 
      }}>
        <h1 style={{ color: '#c33' }}>Render Error</h1>
        <p>{renderError.message}</p>
        <pre style={{ backgroundColor: '#fff', padding: '16px', overflow: 'auto' }}>
          {renderError.stack}
        </pre>
      </div>
    );
  }
}
