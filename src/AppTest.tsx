import { useState, useEffect } from 'react';

export default function AppTest() {
  const [status, setStatus] = useState('Starting...');
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AppTest mounted');
    setStatus('Mounted');
    testFetch();
  }, []);

  async function testFetch() {
    try {
      setStatus('Fetching from /api/products...');
      console.log('Fetching from /api/products...');

      const response = await fetch('/api/products');
      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Data parsed:', data);

      setProducts(data);
      setStatus(`Success! Got ${data.length} products`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error:', msg);
      setError(msg);
      setStatus(`Error: ${msg}`);
    }
  }

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#059669', marginBottom: '20px' }}>
        🧪 App Test Page
      </h1>

      <div style={{
        padding: '20px',
        background: error ? '#fee2e2' : '#ecfdf5',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Status:</h2>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          {status}
        </p>
      </div>

      {error && (
        <div style={{
          padding: '20px',
          background: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Error:</h2>
          <p style={{ margin: 0, fontFamily: 'monospace' }}>{error}</p>
          <button
            onClick={testFetch}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {products.length > 0 && (
        <div style={{
          padding: '20px',
          background: 'white',
          border: '2px solid #059669',
          borderRadius: '8px'
        }}>
          <h2 style={{ margin: '0 0 15px 0' }}>Products ({products.length}):</h2>
          {products.map((p, i) => (
            <div key={i} style={{
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#059669' }}>
                {p.name || 'No name'}
              </h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                SKU: {p.sku || 'N/A'} | Price: ${p.price || 0}
              </p>
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', color: '#0891b2' }}>
                  Show all properties
                </summary>
                <pre style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: '#1f2937',
                  color: '#10b981',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(p, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f3f4f6',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Diagnostic Info:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>API Endpoint: /api/products</li>
          <li>Current URL: {window.location.href}</li>
          <li>React mounted: {status !== 'Starting...' ? 'Yes ✅' : 'No ❌'}</li>
          <li>Products fetched: {products.length > 0 ? 'Yes ✅' : 'No ❌'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
        <p>Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  );
}
