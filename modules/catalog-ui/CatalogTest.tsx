import React from 'react';
import { CartProvider } from './context/CartContext';
import SalesRepCatalog from './pages/salesrep';
import CustomerCatalog from './pages/customer';

/**
 * Catalog UI Test Page
 * 
 * Use this to test the catalog pages locally:
 * 1. Import this file in your main App.tsx or create a route
 * 2. Make sure the API server is running on http://localhost:3000
 * 3. Toggle between Sales Rep and Customer views
 */

type ViewMode = 'salesrep' | 'customer';

const CatalogTest: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('salesrep');

  return (
    <CartProvider>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setViewMode('salesrep')}
          className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all ${
            viewMode === 'salesrep'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📱 Sales Rep View
        </button>
        <button
          onClick={() => setViewMode('customer')}
          className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all ${
            viewMode === 'customer'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🛒 Customer View
        </button>
      </div>

      {viewMode === 'salesrep' ? <SalesRepCatalog /> : <CustomerCatalog />}
    </CartProvider>
  );
};

export default CatalogTest;
