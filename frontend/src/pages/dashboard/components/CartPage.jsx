import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosInstance";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Shield,
  Truck,
  RefreshCw,
  ChevronRight,
  Gem,
  Crown,
  Sparkles,
  X,
  Plus,
  Minus,
  Lock,
  AlertCircle,
  Package,
  Check,
  CreditCard,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0, totalSavings: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/cart");
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      if (err.response?.status === 401) {
        navigate("/login?redirect=/cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity, variantId = null) => {
    if (quantity < 0) return;
    
    setUpdating(productId);
    setError(null);
    
    try {
      const res = await api.put("/api/cart", {
        productId,
        quantity,
        variantId
      });
      
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update quantity");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId, variantId = null) => {
    try {
      let url = `/api/cart/${productId}`;
      if (variantId) {
        url += `?variantId=${variantId}`;
      }
      
      const res = await api.delete(url);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item");
      setTimeout(() => setError(null), 3000);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      const res = await api.delete("/api/cart");
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const getProductImage = (product) => {
    return product.mainImages?.[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80";
  };

  const getProductPrice = (item) => {
    const product = item.product;
    if (!product) return item.price || 0;
    
    // Check if product has sale price
    if (product.baseSalePrice && product.baseSalePrice < product.basePrice) {
      return product.baseSalePrice;
    }
    
    return product.basePrice || item.price || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <ShoppingBag className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Loading Your Collection
          </h3>
          <p className="text-gray-600">Gathering your exquisite pieces...</p>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalPrice || 0;
  const delivery = subtotal > 5000 ? 0 : 99;
  const discount = cart.totalSavings || 0;
  const total = subtotal + delivery - discount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-24 pb-20">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Shopping Bag
              </h1>
              <p className="text-gray-600">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {cart.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-[#b2965a]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Discover our exquisite collection of premium jewelry pieces
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cart.items.map((item, index) => (
                  <motion.div
                    key={`${item.product?._id}-${item.variant || 'no-variant'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Product Image */}
                      <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Link to={`/product/${item.product?._id}`}>
                          <img
                            src={getProductImage(item.product)}
                            alt={item.product?.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <Link to={`/product/${item.product?._id}`}>
                              <h3 className="text-xl font-bold text-gray-900 hover:text-[#b2965a] transition-colors">
                                {item.product?.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 capitalize mt-1">
                              {item.product?.category}
                            </p>
                            
                            {/* Variant Details */}
                            {item.variantDetails && (
                              <div className="mt-2 flex items-center gap-3">
                                {item.variantDetails.color && (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.variantDetails.color.hexCode }}
                                    />
                                    <span className="text-sm text-gray-600">{item.variantDetails.color.name}</span>
                                  </div>
                                )}
                                {item.variantDetails.size && (
                                  <span className="text-sm text-gray-600">Size: {item.variantDetails.size}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              ₹{(getProductPrice(item) * item.quantity).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{getProductPrice(item).toLocaleString()} each
                            </div>
                            
                            {/* Show savings if sale price */}
                            {item.product?.baseSalePrice && item.product.baseSalePrice < item.product.basePrice && (
                              <div className="text-sm text-green-600 mt-1">
                                Save ₹{((item.product.basePrice - item.product.baseSalePrice) * item.quantity).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-4">
                          {item.product?.inStock ? (
                            <span className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              <Check className="w-3 h-3" /> In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product?._id, item.quantity - 1, item.variant)}
                                disabled={updating === item.product?._id || item.quantity <= 1}
                                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-lg font-bold text-gray-900 min-w-[40px] text-center border-x">
                                {updating === item.product?._id ? "..." : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product?._id, item.quantity + 1, item.variant)}
                                disabled={updating === item.product?._id}
                                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-4">
                            <button
                              onClick={() => removeItem(item.product?._id, item.variant)}
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Order Summary</h2>
                    <p className="text-white/90 text-sm">Review your order</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-lg font-semibold text-green-600">
                          -₹{discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery</span>
                      <span className={`text-lg font-semibold ${delivery === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {delivery === 0 ? 'FREE' : `₹${delivery.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            ₹{total.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Including all taxes</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#b2965a]" />
                        Secure & Encrypted Payment
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => navigate("/checkout")}
                      className="w-full bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      <Lock className="w-5 h-5" />
                      Proceed to Checkout
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                 
                </div>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="w-full mt-6 py-4 rounded-xl border-2 border-[#b2965a] text-[#b2965a] font-semibold hover:bg-[#fef8e9] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Cart Tips */}
       
      </div>
    </div>
  );
}