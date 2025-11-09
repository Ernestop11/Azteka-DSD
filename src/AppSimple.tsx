import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Package, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  stock: number;
  unitType: string;
  unitsPerCase: number;
  backgroundColor?: string;
  featured: boolean;
}

export default function AppSimple() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching products from /api/products...');

      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Products received:', data);

      if (!Array.isArray(data)) {
        throw new Error('API did not return an array');
      }

      setProducts(data);
      console.log(`Successfully loaded ${data.length} products`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching products:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product: Product) {
    console.log('Added to cart:', product.name);
    alert(`Added ${product.name} to cart!`);
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{
            width: '64px',
            height: '64px',
            color: '#059669',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            Loading Catalog...
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Fetching products from database
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <AlertCircle style={{
            width: '64px',
            height: '64px',
            color: '#ef4444',
            margin: '0 auto 16px'
          }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            Error Loading Products
          </h2>
          <p style={{
            color: '#6b7280',
            margin: '0 0 24px 0'
          }}>
            {error}
          </p>
          <button
            onClick={fetchProducts}
            style={{
              padding: '12px 24px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <Package style={{
            width: '64px',
            height: '64px',
            color: '#9ca3af',
            margin: '0 auto 16px'
          }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            No Products Found
          </h2>
          <p style={{
            color: '#6b7280',
            margin: '0 0 24px 0'
          }}>
            The catalog is currently empty
          </p>
          <button
            onClick={fetchProducts}
            style={{
              padding: '12px 24px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Success state - show catalog
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '900',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                🏪 Azteka DSD Catalog
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>
                Showing <span style={{ fontWeight: 'bold', color: '#059669' }}>{products.length}</span> products
              </p>
            </div>
            <button
              onClick={fetchProducts}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#059669',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Product Image */}
              <div style={{
                width: '100%',
                aspectRatio: '1',
                background: product.backgroundColor || '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        const fallback = document.createElement('div');
                        fallback.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;';
                        fallback.textContent = '📦';
                        e.currentTarget.parentElement.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: '64px',
                    opacity: 0.5
                  }}>
                    📦
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px' }}>
                {/* Name */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </h3>

                {/* Description */}
                {product.description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>
                )}

                {/* Units */}
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 12px 0'
                }}>
                  📦 {product.unitsPerCase} units per {product.unitType}
                </p>

                {/* Price & Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: '0 0 4px 0'
                    }}>
                      Wholesale Price
                    </p>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#111827',
                      margin: '0'
                    }}>
                      ${product.price.toFixed(2)}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      per {product.unitType}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    style={{
                      padding: '12px 20px',
                      background: product.inStock
                        ? 'linear-gradient(135deg, #059669 0%, #0891b2 100%)'
                        : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: product.inStock ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: product.inStock ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (product.inStock) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (product.inStock) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <ShoppingCart size={16} />
                    <span>{product.inStock ? 'Add' : 'Out of Stock'}</span>
                  </button>
                </div>

                {/* Out of stock badge */}
                {!product.inStock && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Currently Unavailable
                  </div>
                )}

                {/* Featured badge */}
                {product.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '4px 12px',
                    background: '#fbbf24',
                    color: '#78350f',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    FEATURED
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: '48px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            ✅ Simple Working Catalog • {products.length} Products Loaded
          </p>
        </div>
      </footer>

      {/* Add spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
