import { CheckCircle, Package, Calendar, MapPin, Mail, Phone } from 'lucide-react';

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate?: string;
  total: number;
  onNewOrder: () => void;
}

export default function OrderConfirmation({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  deliveryAddress,
  deliveryDate,
  total,
  onNewOrder,
}: OrderConfirmationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-12 text-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle size={56} className="text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl text-white/90">Thank you for your order</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-6 text-center border-2 border-emerald-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Order Number</p>
            <p className="text-3xl font-bold text-gray-900">{orderNumber}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="text-emerald-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1">Order Total</p>
                <p className="text-2xl font-bold text-emerald-600">${total.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">Payment collected on delivery</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1">Delivery Address</p>
                <p className="text-gray-700">{deliveryAddress}</p>
              </div>
            </div>

            {deliveryDate && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-amber-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">Preferred Delivery Date</p>
                  <p className="text-gray-700">
                    {new Date(deliveryDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t-2 border-gray-200 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={18} className="text-gray-500" />
                <span>{customerEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-gray-500" />
                <span>{customerPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>You will receive an email confirmation at {customerEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Our team will prepare your order for delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Your driver will contact you to confirm delivery details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Payment will be collected upon delivery</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onNewOrder}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Place Another Order
          </button>
        </div>
      </div>
    </div>
  );
}
