import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { useCart } from '../context/CartContext';
import { fetchProducts, fetchStores, submitOrder, submitMultiStoreOrder, type Product, type Store } from '../lib/api';

// Extended Product with brandName for display
interface ProductDisplay extends Product {
  brandName: string;
}

// Multi-store ordering matrix for Carlos
interface StoreQuantities {
  [storeId: string]: number;
}

interface MultiStoreCartItem {
  productId: string;
  productName: string;
  price: number;
  storeQuantities: StoreQuantities;
}

const CustomerCatalog: React.FC = () => {
  // Cart context for regular mode
  const cart = useCart();
  
  // State management
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [multiStoreCart, setMultiStoreCart] = useState<MultiStoreCartItem[]>([]);
  const [isMultiStoreMode, setIsMultiStoreMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, storesData] = await Promise.all([
          fetchProducts(),
          fetchStores(),
        ]);

        // Build brand lookup (if brands are embedded)
        const enhancedProducts: ProductDisplay[] = productsData.map(p => ({
          ...p,
          brandName: p.brandName || 'Unknown Brand',
        }));

        setProducts(enhancedProducts);
        setStores(storesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Regular cart handler
  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    cart.addItem({
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      unitType: product.unitType || undefined,
    });
  };

  // Multi-store quantity handler
  const handleMultiStoreQuantityChange = (
    productId: string,
    storeId: string,
    quantity: number
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setMultiStoreCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === productId);

      if (existingItem) {
        // Update existing item
        if (quantity === 0) {
          // Remove this store from the item
          const newQuantities = { ...existingItem.storeQuantities };
          delete newQuantities[storeId];
          
          // If no stores left, remove the item
          if (Object.keys(newQuantities).length === 0) {
            return prevCart.filter(item => item.productId !== productId);
          }
          
          return prevCart.map((item) =>
            item.productId === productId
              ? { ...item, storeQuantities: newQuantities }
              : item
          );
        }
        
        return prevCart.map((item) =>
          item.productId === productId
            ? {
                ...item,
                storeQuantities: { ...item.storeQuantities, [storeId]: quantity },
              }
            : item
        );
      }

      // Add new item if quantity > 0
      if (quantity > 0) {
        return [
          ...prevCart,
          {
            productId: product.id,
            productName: product.name,
            price: product.price,
            storeQuantities: { [storeId]: quantity },
          },
        ];
      }
      
      return prevCart;
    });
  };

  const handleViewCart = () => {
    console.log('Regular cart:', cart.items);
    console.log('Multi-store cart:', multiStoreCart);
    if (!isMultiStoreMode) {
      alert(`Cart has ${cart.getTotalItems()} items totaling $${cart.getTotalPrice().toFixed(2)}`);
    } else {
      const totalItems = getTotalMultiStoreItems();
      const totalPrice = getTotalMultiStorePrice();
      alert(`Multi-store cart has ${totalItems} items totaling $${totalPrice.toFixed(2)}`);
    }
  };

  const getTotalMultiStoreItems = () => {
    return multiStoreCart.reduce((sum, item) => {
      const storeTotal = Object.values(item.storeQuantities).reduce(
        (acc, qty) => acc + qty,
        0
      );
      return sum + storeTotal;
    }, 0);
  };

  const getTotalMultiStorePrice = () => {
    return multiStoreCart.reduce((sum, item) => {
      const storeTotal = Object.values(item.storeQuantities).reduce(
        (acc, qty) => acc + qty,
        0
      );
      return sum + storeTotal * item.price;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      if (!isMultiStoreMode) {
        // Submit regular order
        const orderData = {
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cart.getTotalPrice(),
          notes: 'Customer mobile order',
        };
        
        const result = await submitOrder(orderData);
        if (result.success) {
          alert(`Order submitted successfully! Order ID: ${result.orderId}`);
          cart.clearCart();
        } else {
          alert(`Failed to submit order: ${result.error}`);
        }
      } else {
        // Submit multi-store order
        const storeOrders = stores.map(store => {
          const storeItems = multiStoreCart
            .filter(item => item.storeQuantities[store.id] && item.storeQuantities[store.id] > 0)
            .map(item => ({
              productId: item.productId,
              quantity: item.storeQuantities[store.id],
              price: item.price,
            }));
          
          return {
            storeId: store.id,
            items: storeItems,
          };
        }).filter(order => order.items.length > 0);
        
        const orderData = {
          storeOrders,
          totalAmount: getTotalMultiStorePrice(),
          notes: 'Multi-store order from Carlos',
        };
        
        const result = await submitMultiStoreOrder(orderData);
        if (result.success) {
          alert(`Multi-store order submitted successfully! ${result.orderIds?.length} orders created.`);
          setMultiStoreCart([]);
        } else {
          alert(`Failed to submit multi-store order: ${result.error}`);
        }
      }
    } catch (error) {
      alert('Failed to submit order. Please try again.');
      console.error('Order submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Convert multi-store cart to regular cart format for FloatingCartButton
  const multiStoreCartItems = multiStoreCart.map((item) => ({
    id: item.productId,
    productId: item.productId,
    name: item.productName,
    quantity: Object.values(item.storeQuantities).reduce((acc, qty) => acc + qty, 0),
    price: item.price,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Azteka Foods</h1>
        <p className="text-sm opacity-90">Order authentic Mexican products</p>
      </div>

      {/* Search and Mode Toggle */}
      <div className="sticky top-0 bg-white shadow-md px-4 py-4 z-40">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-orange-500 focus:outline-none mb-3"
        />

        <button
          onClick={() => setIsMultiStoreMode(!isMultiStoreMode)}
          className={`w-full px-4 py-2 rounded-full font-semibold transition-all ${
            isMultiStoreMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isMultiStoreMode ? '📊 Multi-Store Mode Active' : '🏪 Enable Multi-Store Mode'}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {!isMultiStoreMode ? (
          // Regular single-store view
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {searchQuery ? 'Search Results' : 'All Products'}
            </h2>
            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
                columns={1}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No products found matching "{searchQuery}"
              </p>
            )}
          </>
        ) : (
          // Multi-store ordering table
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Multi-Store Order Table
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-orange-500 z-10">
                      Product
                    </th>
                    {stores.map((store) => (
                      <th key={store.id} className="px-4 py-3 text-center font-semibold">
                        {store.name}
                        <div className="text-xs opacity-90">({store.storeCode || store.id.slice(0, 4)})</div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => {
                    const cartItem = multiStoreCart.find(
                      (item) => item.productId === product.id
                    );
                    const rowTotal = cartItem
                      ? Object.values(cartItem.storeQuantities).reduce(
                          (sum, qty) => sum + qty,
                          0
                        )
                      : 0;

                    return (
                      <tr
                        key={product.id}
                        className={`border-b ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-orange-50 transition-colors`}
                      >
                        <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${product.price.toFixed(2)} / {product.unitType || 'unit'}
                              </div>
                            </div>
                          </div>
                        </td>
                        {stores.map((store) => (
                          <td key={store.id} className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={cartItem?.storeQuantities[store.id] || 0}
                              onChange={(e) =>
                                handleMultiStoreQuantityChange(
                                  product.id,
                                  store.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-bold text-orange-600">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Multi-store summary */}
            {getTotalMultiStoreItems() > 0 && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Items:</span>
                    <span className="font-bold">{getTotalMultiStoreItems()}</span>
                  </div>
                  <div className="flex justify-between text-xl">
                    <span className="text-gray-900 font-bold">Total Price:</span>
                    <span className="text-green-600 font-bold">
                      ${getTotalMultiStorePrice().toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Multi-Store Order'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Regular mode submit button */}
        {!isMultiStoreMode && cart.getTotalItems() > 0 && (
          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all z-40"
          >
            {submitting ? 'Submitting...' : 'Submit Order'}
          </button>
        )}
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton
        items={isMultiStoreMode ? multiStoreCartItems : cart.items}
        onViewCart={handleViewCart}
      />
    </div>
  );
};

export default CustomerCatalog;
