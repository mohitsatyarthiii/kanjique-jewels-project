import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { useCurrency } from '../../context/CurrencyContext';
import { 
  MapPin, 
  Package, 
  Shield, 
  Lock, 
  CreditCard, 
  Truck, 
  CheckCircle,
  ChevronRight,
  X,
  Sparkles,
  Crown,
  Gem,
  AlertCircle,
  Home,
  ShoppingBag,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestCheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get currency functions
  const { format: formatPrice, currency, rates, loading: currencyLoading, convertAmount, getSymbol } = useCurrency();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart");
        console.log("Cart data:", res.data.cart);
        setCart(res.data.cart);

        const profileRes = await api.get("/api/profile");
        setAddress(profileRes.data.user.address || "");
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handlePayment = async () => {
    if (!address) {
      setShowAddressModal(true);
      return;
    }

    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      alert("Payment gateway is not loaded. Please refresh the page and try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // Save address if needed
      if (!address.trim()) {
        alert("Please add a delivery address");
        setIsProcessing(false);
        return;
      }

      // Calculate total in selected currency for the order
      const totalInSelectedCurrency = convertAmount(total);
      
      // First, create order on our server with currency info
      const orderRes = await api.post("/api/checkout/order", {
        currency: currency, // Send selected currency to backend
        amount: total, // Original INR amount
        convertedAmount: totalInSelectedCurrency // Converted amount
      });
      
      const { order, key, payment_id } = orderRes.data;

      // Validate key format
      if (!key || !key.startsWith('rzp_live_')) {
        console.error("Invalid Razorpay key. Expected live key (rzp_live_*), got:", key);
        alert("Payment configuration error. Please contact support.");
        setIsProcessing(false);
        return;
      }

      console.log("Using Razorpay Key:", key.substring(0, 15) + "...");
      console.log("Order Details:", { 
        amount: order.amount, 
        currency: order.currency,
        selectedCurrency: currency 
      });

      // Fetch user data for prefill
      let userData = {};
      try {
        const profileRes = await api.get("/api/profile");
        userData = profileRes.data.user;
      } catch (err) {
        console.log("Could not fetch user profile");
      }

      // Razorpay options - UPDATED with dynamic currency
      const options = {
        key, // This is the actual payment gateway key (live or test)
        amount: order.amount, // Amount is already in the correct currency from backend
        currency: currency, // Dynamic currency from user selection
        name: "KANJIQUE JEWELS",
        description: `Premium Jewelry Purchase (${currency})`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying signature...", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            });

            // Verify payment with shipping address and currency info
            const verifyRes = await api.post("/api/checkout/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: payment_id,
              shippingAddress: address,
              currency: currency, // Send selected currency
              originalAmount: total // Original INR amount
            });

            if (verifyRes.data.success) {
              console.log("Payment verified successfully");
              // Redirect to success page with order details and currency
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
          name: userData.name || "",
          email: userData.email || "",
          contact: userData.phone || ""
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
          escape: false, // Prevent closing with ESC
        },
        notes: {
          address: address,
          payment_id: payment_id,
          selected_currency: currency,
          original_amount_inr: total
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Credit/Debit Cards',
                instruments: [
                  {
                    method: 'card',
                    issuers: ['MASTERCARD', 'VISA', 'RUPAY']
                  }
                ]
              },
              netbanking: {
                name: 'Net Banking',
                instruments: [
                  {
                    method: 'netbanking',
                    banks: ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'YESBANK']
                  }
                ]
              },
              upi: {
                name: "UPI",
                instruments: [
                  {
                    method: 'upi',
                    flows: ['collect', 'intent', 'qr']
                  }
                ]
              },
              wallet: {
                name: "Wallets",
                instruments: [
                  {
                    method: 'wallet',
                    wallets: ['paytm', 'phonepe', 'amazonpay', 'freecharge', 'mobikwik']
                  }
                ]
              }
            },
            sequence: ['block.banks', 'block.netbanking', 'block.upi', 'block.wallet'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        retry: {
          enabled: true,
          max_count: 2
        },
        timeout: 900, // 15 minutes
        remember_customer: true
      };

      console.log("Opening Razorpay with options:", {
        key: options.key.substring(0, 15) + "...",
        amount: options.amount,
        currency: options.currency,
        orderId: options.order_id
      });

      const rzp = new window.Razorpay(options);
      
      // Add event listeners for better UX
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.on('payment.authorized', function (response) {
        console.log('Payment authorized:', response.razorpay_payment_id);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      
      // User-friendly error messages
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
      console.error(err);
      alert(err.response?.data?.error || "Failed to update address");
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading || currencyLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-8">
          <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-[#d4b97d]/30 rounded-full"></div>
          <ShoppingBag className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Preparing Your Order</h3>
        <p className="text-gray-600">Securing your precious collection...</p>
      </div>
    </div>
  );

  if (!cart || !cart.items || cart.items.length === 0) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-[#b2965a]" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Your Cart Is Empty</h2>
        <p className="text-gray-600 mb-8">Add exquisite jewelry pieces to proceed with checkout.</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
          Shop Collection
        </button>
      </div>
    </div>
  );

  // Calculate subtotal from cart items
  const subtotal = cart.totalPrice || cart.items.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Calculate delivery fee (free above ₹5000)
  const delivery = subtotal > 5000 ? 0 : 99;

  // Calculate discount (simplified logic)
  const discount = subtotal > 10000 ? 500 : 0;
  
  // Total includes subtotal + delivery - discount
  const total = subtotal + delivery - discount;

  // Converted amounts for display
  const subtotalConverted = convertAmount(subtotal);
  const deliveryConverted = convertAmount(delivery);
  const discountConverted = convertAmount(discount);
  const totalConverted = convertAmount(total);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
      {/* Golden Blobs Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header - UPDATED */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
                <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Secure Checkout</span>
                <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
                Finalize Your Order
              </h1>
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
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#b2965a]" />
              <span className="text-sm">Insured Delivery</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-[#b2965a]" />
              <span className="text-sm">Authenticity Guaranteed</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-b from-white to-[#fef8e9] rounded-3xl border-2 border-[#f4e6c3] shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#b2965a]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                      <p className="text-sm text-gray-600">Where should we deliver your precious items?</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 rounded-xl border-2 border-[#b2965a] text-[#b2965a] font-semibold hover:bg-[#fef8e9] transition-colors"
                  >
                    {address ? "Edit" : "Add Address"}
                  </button>
                </div>
                
                {address ? (
                  <div className="p-4 bg-gradient-to-r from-white to-[#fef8e9] rounded-xl border border-[#f4e6c3]">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-[#b2965a] mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">Primary Address</span>
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                            Default
                          </span>
                        </div>
                        <p className="text-gray-700">{address}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-xl">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No delivery address added</p>
                    <p className="text-sm text-gray-500">Please add your address to proceed with delivery</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#b2965a]" />
                  Delivery Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Insured Shipping</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>3-5 Business Days</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free Gift Packaging</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Signature Required</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Items Card - UPDATED */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-b from-white to-[#fef8e9] rounded-3xl border-2 border-[#f4e6c3] shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#b2965a]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                    <p className="text-sm text-gray-600">{cart.items.length} exquisite items</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {cart.items.map((item, index) => {
                    const product = item.product;
                    const price = item.price || 0;
                    const imageUrl = product?.mainImages?.[0]?.url || "";
                    const title = product?.title || "Product";
                    const category = product?.category || "";
                    
                    return (
                      <motion.div
                        key={item._id || `${product?._id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 bg-white rounded-xl border border-[#f4e6c3] hover:shadow-lg transition-shadow"
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-[#b2965a]" />
                            </div>
                          )}
                          <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full">
                            ×{item.quantity}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="capitalize">{category}</span>
                                {item.variantDetails?.color && (
                                  <>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{item.variantDetails.color.name}</span>
                                  </>
                                )}
                                {item.variantDetails?.size && (
                                  <>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>Size: {item.variantDetails.size}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {/* Price with currency formatting */}
                              <div className="text-lg font-bold text-gray-900">
                                {formatPrice(price * item.quantity)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatPrice(price)} each
                              </div>
                              
                              {/* Show original INR for non-INR currencies */}
                              {currency !== 'INR' && (
                                <div className="text-xs text-gray-400 mt-1">
                                  ₹{(price * item.quantity).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Crown className="w-3 h-3 text-[#b2965a]" />
                              <span>Premium</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Shield className="w-3 h-3 text-[#b2965a]" />
                              <span>Authentic</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Gem className="w-3 h-3 text-[#b2965a]" />
                              <span>Hallmarked</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
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
              <div className="bg-gradient-to-b from-white to-[#fef8e9] rounded-3xl border-2 border-[#f4e6c3] shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] p-6">
                  <h2 className="text-2xl font-serif font-bold text-white mb-1">Order Summary</h2>
                  <p className="text-white/90 text-sm">Review your purchase details</p>
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
                    <span className="text-gray-600">Premium Discount</span>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-green-600">-{formatPrice(discount)}</span>
                      {currency !== 'INR' && discount > 0 && (
                        <div className="text-xs text-gray-400">-₹{discount.toLocaleString()}</div>
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
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xl font-bold text-gray-900">Total Amount</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{formatPrice(total)}</div>
                        <div className="text-sm text-gray-500">Including all taxes</div>
                        {currency !== 'INR' && (
                          <div className="text-xs text-gray-400 mt-1">₹{total.toLocaleString()}</div>
                        )}
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
                </div>

                {/* Terms Checkbox */}
                <div className="p-6 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-[#b2965a] text-[#b2965a] focus:ring-[#b2965a] focus:ring-2 focus:ring-offset-2"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-[#b2965a] hover:underline">Terms of Service</a> and 
                      acknowledge that this is a premium purchase with specific conditions.
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment CTA - UPDATED */}
              <div className="space-y-4">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !agreedToTerms}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : !agreedToTerms
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#b2965a] to-[#d4b97d] hover:shadow-xl hover:scale-[1.02]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

                <div className="text-center">
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    256-bit SSL Secured • PCI DSS Compliant
                  </p>
                </div>
              </div>

              {/* Payment Methods - UPDATED */}
              <div className="bg-gradient-to-b from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#b2965a]" />
                  Accepted Payment Methods in {currency}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                    <div className="text-xs font-semibold text-gray-700">Cards</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                    <div className="text-xs font-semibold text-gray-700">UPI</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                    <div className="text-xs font-semibold text-gray-700">NetBanking</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                    <div className="text-xs font-semibold text-gray-700">Wallets</div>
                  </div>
                </div>
                {currency !== 'INR' && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Your bank may charge foreign transaction fees
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Address Modal - UPDATED */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-white to-[#fef8e9] rounded-3xl border-2 border-[#f4e6c3] shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#b2965a]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Please provide your complete address for insured delivery of your precious items.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none resize-none"
                      placeholder="Enter your full address including house number, street, city, state, and PIN code"
                    ></textarea>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Your address is secured with 256-bit encryption. We only share necessary details with our insured delivery partners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress || !address.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingAddress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}