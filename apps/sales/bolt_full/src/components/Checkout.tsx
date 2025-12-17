import { useState } from 'react';
import { CartItem, Customer, Product } from '../lib/supabase';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Sparkles, Plus } from 'lucide-react';

interface CheckoutProps {
  items: CartItem[];
  salesRepId?: string;
  upsellProducts?: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onComplete: (customer: Customer, orderData: { notes?: string; delivery_date?: string }) => void;
}

export default function Checkout({ items, salesRepId, upsellProducts = [], onBack, onAddToCart, onComplete }: CheckoutProps) {
  const [formData, setFormData] = useState<Customer>({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData, {
      notes: orderNotes || undefined,
      delivery_date: deliveryDate || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
            <p className="text-white/90">Fill in your business details below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {upsellProducts.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-orange-500" size={24} />
                  <h3 className="text-xl font-black text-gray-900">Complete Your Order!</h3>
                </div>
                <p className="text-gray-700 mb-4 font-semibold">Customers who bought these items also love:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {upsellProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl p-4 shadow-md border-2 border-orange-200 hover:border-orange-400 transition-all"
                    >
                      <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-lg font-black text-emerald-600 mb-2">${product.price.toFixed(2)}</p>
                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-1 hover:shadow-lg transition-all"
                      >
                        <Plus size={16} />
                        Add to Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Building2 size={18} />
                  Business Name
                </label>
                <input
                  type="text"
                  name="business_name"
                  required
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  placeholder="ABC Groceries Inc."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <User size={18} />
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contact_name"
                  required
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  placeholder="john@abcgroceries.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Phone size={18} />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <MapPin size={18} />
                  Delivery Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  placeholder="Los Angeles"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">ZIP Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    required
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="90001"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                  placeholder="Any special delivery instructions or requests..."
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-300 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 text-center mt-3">
                Payment will be collected by driver on delivery
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Place Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
