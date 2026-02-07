// success.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag, Gift, Truck } from "lucide-react";
import api from "../../../utils/axiosInstance";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentId = searchParams.get("payment_id");
    const orderId = searchParams.get("order_id");

    if (paymentId && orderId) {
      fetchOrderDetails(orderId);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/api/test/checkout/payments`);
      const payment = res.data.payments.find(p => p.razorpay_order_id === orderId);
      setOrderDetails(payment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Processing Your Order</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-3xl border-2 border-[#f4e6c3] shadow-xl p-8 text-center">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your order has been confirmed and is being processed.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">{orderDetails.razorpay_order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">₹{(orderDetails.amount / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">{orderDetails.status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-[#fef8e9] rounded-xl">
              <Truck className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
              <h3 className="font-semibold">Insured Delivery</h3>
              <p className="text-sm text-gray-600">3-5 business days</p>
            </div>
            <div className="p-4 bg-[#fef8e9] rounded-xl">
              <Gift className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
              <h3 className="font-semibold">Premium Packaging</h3>
              <p className="text-sm text-gray-600">Free gift wrapping</p>
            </div>
            <div className="p-4 bg-[#fef8e9] rounded-xl">
              <CheckCircle className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
              <h3 className="font-semibold">Order Confirmed</h3>
              <p className="text-sm text-gray-600">We'll notify you</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="px-8 py-3 rounded-xl border-2 border-[#b2965a] text-[#b2965a] font-semibold hover:bg-[#fef8e9] transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}