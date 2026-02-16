import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Package,
  Shield,
  Lock,
  CreditCard,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from '../../context/CurrencyContext';

export default function BuyNowCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { format: formatPrice, currency, rates, loading: currencyLoading, convertAmount } = useCurrency();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get order data from session storage
    const buyNowData = sessionStorage.getItem('buyNowData');
    console.log("Retrieved buyNowData from sessionStorage:", buyNowData);
    
    if (!buyNowData) {
      setError("No product selected for purchase");
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    try {
      const data = JSON.parse(buyNowData);
      console.log("Parsed orderData:", data);
      setOrderData(data);
      
      // Fetch user address
      const fetchAddress = async () => {
        try {
          const res = await api.get("/api/profile");
          setAddress(res.data.user.address || "");
        } catch (err) {
          console.error("Error fetching address:", err);
        }
      };
      
      fetchAddress();
    } catch (err) {
      setError("Invalid product data");
      setTimeout(() => navigate('/'), 2000);
    }
  }, [navigate]);

  const handlePayment = async () => {
    if (!address) {
      setShowAddressModal(true);
      return;
    }

    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    if (!window.Razorpay) {
      alert("Payment gateway is not loaded. Please refresh the page and try again.");
      return;
    }

    setIsProcessing(true);

    try {
      if (!address.trim()) {
        alert("Please add a delivery address");
        setIsProcessing(false);
        return;
      }

      // Calculate converted amounts for display
      const subtotalConverted = convertAmount(orderData.subtotal);
      const totalConverted = convertAmount(orderData.total);
      const deliveryConverted = convertAmount(orderData.delivery);

      // Create payment payload with currency info
      const paymentPayload = {
        products: [
          {
            productId: orderData.product._id,
            variantId: orderData.variant?._id || null,
            quantity: orderData.quantity,
            price: orderData.price, // Price in INR
          }
        ],
        address: address,
        subtotal: orderData.subtotal,
        delivery: orderData.delivery,
        total: orderData.total,
        currency: currency, // Send selected currency to backend
      };

      console.log("Creating payment with payload:", paymentPayload);

      // Create order on our server
      const orderRes = await api.post("/api/checkout/buy-now", paymentPayload);
      
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.error || "Failed to create order");
      }

      const { order, key, payment_id, convertedAmount, exchangeRate } = orderRes.data;

      console.log("Using Razorpay Key:", key.substring(0, 15) + "...");
      console.log("Order details:", {
        amount: order.amount,
        currency: order.currency,
        convertedAmount,
        exchangeRate
      });

      // Razorpay options - UPDATED with dynamic currency
      const options = {
        key,
        amount: order.amount, // Amount in selected currency (smallest unit)
        currency: order.currency, // Selected currency from backend
        name: "KANJIQUE JEWELS",
        description: `Premium Jewelry Purchase (${currency})`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying signature...", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            });

            // Verify payment with currency info
            const verifyRes = await api.post("/api/checkout/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: payment_id,
              shippingAddress: address,
              currency: currency, // Send selected currency
              originalAmount: orderData.total, // Original INR amount
            });

            if (verifyRes.data.success) {
              console.log("Payment verified successfully");
              // Clear session data
              sessionStorage.removeItem('buyNowData');
              // Redirect to success page with currency info
              window.location.href = `/checkout/success?order_id=${verifyRes.data.order.id}&payment_id=${verifyRes.data.payment.razorpay_payment_id}&currency=${currency}`;
            } else {
              alert("Payment verification failed. Please contact support.");
              setIsProcessing(false);
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: { 
          color: "#b2965a",
          backdrop_color: "#fef8e9"
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            setIsProcessing(false);
          },
          escape: false,
        },
        notes: {
          address: address,
          payment_id: payment_id,
          selected_currency: currency,
          original_amount_inr: orderData.total,
          exchange_rate: exchangeRate || 1
        },
        retry: {
          enabled: true,
          max_count: 2
        },
        timeout: 900,
        remember_customer: true
      };

      console.log("Opening Razorpay with options:", {
        key: options.key.substring(0, 15) + "...",
        amount: options.amount,
        currency: options.currency,
        orderId: options.order_id
      });

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      
      let errorMessage = "Failed to initiate payment";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      alert(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      alert("Address cannot be empty");
      return;
    }

    setSavingAddress(true);
    try {
      await api.put("/api/profile", { address });
      setShowAddressModal(false);
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">{error}</p>
        </div>
      </div>
    );
  }

  if (!orderData || currencyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#b2965a] animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Order</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  const { product, variant, quantity, price, subtotal, delivery, total } = orderData;

  // Calculate converted amounts
  const priceConverted = convertAmount(price);
  const subtotalConverted = convertAmount(subtotal);
  const deliveryConverted = convertAmount(delivery);
  const totalConverted = convertAmount(total);

  // Get the correct image to display
  const getProductImage = () => {
    console.log("Getting product image. Variant:", variant, "Product:", product);
    
    // If variant has images, use variant images
    if (variant?.images && variant?.images?.length > 0) {
      const imageUrl = typeof variant.images[0] === 'string' 
        ? variant.images[0] 
        : variant.images[0]?.url;
      console.log("Using variant image:", imageUrl);
      return imageUrl || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80";
    }
    // Otherwise use product main images
    if (product?.mainImages && product.mainImages?.length > 0) {
      const imageUrl = typeof product.mainImages[0] === 'string' 
        ? product.mainImages[0] 
        : product.mainImages[0]?.url;
      console.log("Using product mainImage:", imageUrl);
      return imageUrl || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80";
    }
    // Fallback image
    console.log("Using fallback image");
    return "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-30 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - UPDATED with Currency Display */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Summary</h1>
            <p className="text-gray-600">Review and complete your purchase</p>
          </div>
          
          {/* Currency Display */}
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm text-gray-600">Checkout in </span>
            <span className="font-bold text-[#b2965a]">{currency}</span>
            {currency !== 'INR' && rates[currency] && (
              <span className="text-xs text-gray-500 ml-2">
                (1 INR = {rates[currency].toFixed(4)} {currency})
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card - UPDATED */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 flex gap-6">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getProductImage()}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80";
                    }}
                  />
                </div>

                {/* Product Info - UPDATED */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.title}</h3>
                  {variant && (
                    <div className="text-sm text-gray-600 mb-2">
                      {variant.color && <span>{variant.color.name}</span>}
                      {variant.size && <span> • {variant.size}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>Quantity: <span className="font-semibold">{quantity}</span></span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(price)} {currency !== 'INR' && <span className="text-xs text-gray-500 ml-1">(₹{price.toLocaleString()})</span>}
                    </div>
                    {currency !== 'INR' && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatPrice(price)} per item
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[#b2965a]" />
                <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
              </div>

              {address ? (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-900">{address}</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-sm text-[#b2965a] hover:underline mt-2"
                  >
                    Change Address
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <p className="text-yellow-800">No delivery address added</p>
                  <p className="text-sm text-yellow-700">Please add your address to proceed</p>
                </div>
              )}

              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full bg-white border-2 border-[#b2965a] text-[#b2965a] py-2 rounded-lg font-semibold hover:bg-[#f4e6c3] transition-colors"
              >
                {address ? "Change Address" : "Add Address"}
              </button>
            </motion.div>
          </div>

          {/* Right Section - Order Summary & Payment - UPDATED */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-32 space-y-6"
            >
              {/* Order Summary Card */}
              <div className="bg-gradient-to-b from-white to-[#fef8e9] rounded-2xl border-2 border-[#f4e6c3] shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] p-6">
                  <h2 className="text-2xl font-serif font-bold text-white mb-1">Order Summary</h2>
                  <p className="text-white/90 text-sm">Review your purchase</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                      {currency !== 'INR' && (
                        <div className="text-xs text-gray-400">₹{subtotal.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery</span>
                    <div className="text-right">
                      <span className={`text-lg font-semibold ${delivery === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                      </span>
                      {currency !== 'INR' && delivery > 0 && (
                        <div className="text-xs text-gray-400">₹{delivery.toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total Amount</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{formatPrice(total)}</div>
                        <div className="text-sm text-gray-500">Including all taxes</div>
                        {currency !== 'INR' && (
                          <div className="text-xs text-gray-400 mt-1">₹{total.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Exchange Rate Info */}
                  {currency !== 'INR' && rates[currency] && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        Exchange Rate: 1 INR = {rates[currency].toFixed(4)} {currency}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        You'll be charged approximately {formatPrice(total)} in {currency}
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="p-6 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-[#b2965a] text-[#b2965a]"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-[#b2965a] hover:underline">Terms of Service</a>
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment Button - UPDATED */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !agreedToTerms || !address}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isProcessing || !agreedToTerms || !address
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay {formatPrice(total)}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Secure Payment in {currency}</p>
                    <p className="text-xs text-blue-700 mt-1">Your payment is encrypted and secure</p>
                    {currency !== 'INR' && (
                      <p className="text-xs text-blue-600 mt-1">
                        Your bank may charge foreign transaction fees
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Address Modal - UPDATED */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address (House no., Street, Area, City, Postal Code)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b2965a] mb-4 resize-none h-32"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={savingAddress || !address.trim()}
                className="flex-1 py-2 bg-[#b2965a] text-white rounded-lg font-semibold hover:bg-[#9c8146] disabled:opacity-50"
              >
                {savingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}