import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosInstance";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  Shield, 
  Home,
  Phone,
  Mail,
  Printer,
  Download,
  Share2
} from "lucide-react";

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get("order_id");
        
        if (!orderId) {
          navigate("/");
          return;
        }

        const res = await api.get(`/api/checkout/order/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-8">
            Your payment has been processed successfully. Order details will be available in your account.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg">
            Order #{order.orderNumber} has been confirmed
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            Fully Insured • Hallmarked • Authenticity Guaranteed
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#b2965a]" />
                Order Details
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      {item.product?.mainImages?.[0]?.url ? (
                        <img
                          src={item.product.mainImages[0].url}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full p-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product?.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>Price: ₹{item.price}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#b2965a]" />
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Delivery Address</h3>
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-600">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Estimated Delivery</h3>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-600">3-5 Business Days</p>
                      <p className="text-sm text-gray-500">Insured & Tracked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Order Status</span>
                </div>
                <p className="text-blue-800 text-sm">{order.status.toUpperCase()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Print Invoice
                </button>
                
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  View All Orders
                </button>
                
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Home className="w-5 h-5" />
                  Continue Shopping
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Need Help?</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>+91-XXXXXX-XXXX</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>support@kanjique.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}