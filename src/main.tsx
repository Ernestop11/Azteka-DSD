import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Admin from './pages/Admin.tsx';
import BundleEditor from './pages/admin/BundleEditor.tsx';
import ProductImageUpload from './pages/admin/ProductImageUpload.tsx';
import ProductImages from './pages/admin/ProductImages.tsx';
import FulfillmentDashboard from './pages/fulfillment/FulfillmentDashboard.tsx';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function Root() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
            <Route path="/" element={<App />} />
            <Route path="/catalog" element={<App />} />
            <Route path="/checkout" element={<App />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/bundles/edit" element={<BundleEditor />} />
            <Route path="/admin/products/images" element={<ProductImages />} />
            <Route path="/admin/products/images/upload" element={<ProductImageUpload />} />
            <Route path="/fulfillment" element={<FulfillmentDashboard />} />
          </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
