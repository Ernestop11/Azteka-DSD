import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import BulkOrderSheet from './BulkOrderSheet';
import { Package, Lock, User } from 'lucide-react';

interface CarlosBulkOrderProps {
  products: Product[];
  onClose: () => void;
}

export default function CarlosBulkOrder({ products, onClose }: CarlosBulkOrderProps) {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [showBulkOrder, setShowBulkOrder] = useState(false);
  const [isCarlos, setIsCarlos] = useState(false);

  useEffect(() => {
    // Check if user is Carlos
    if (user && user.email) {
      const carlosEmails = ['carlos@azteka.com', 'carlos@example.com'];
      setIsCarlos(carlosEmails.includes(user.email.toLowerCase()));
    }
  }, [user]);

  // Only show bulk order button if user is Carlos
  if (!isCarlos) {
    return null;
  }

  const stores = [
    { id: 'store1', store_name: 'Store 1' },
    { id: 'store2', store_name: 'Store 2' },
    { id: 'store3', store_name: 'Store 3' },
  ];

  const handleSubmitOrders = (orders: Record<string, Record<string, number>>) => {
    console.log('Carlos bulk orders:', orders);
    // Submit orders to API
    // TODO: Implement API call
  };

  if (showBulkOrder) {
    return (
      <BulkOrderSheet
        products={products}
        stores={stores}
        onSubmitOrders={handleSubmitOrders}
        onClose={() => setShowBulkOrder(false)}
      />
    );
  }

  return (
    <button
      onClick={() => setShowBulkOrder(true)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all font-bold text-lg"
      aria-label="Bulk Order"
    >
      <Package size={24} />
      <span className="hidden sm:inline">{t('catalog.bulkOrder')}</span>
    </button>
  );
}

