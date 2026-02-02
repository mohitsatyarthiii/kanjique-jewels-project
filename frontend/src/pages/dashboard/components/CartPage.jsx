import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  Trash2, 
  Heart, 
  Shield, 
  Truck, 
  RefreshCw, 
  ChevronRight,
  Package,
  Gem,
  Crown,
  Sparkles,
  X,
  Plus,
  Minus,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data.cart);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = "/login?next=/cart";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCart(); 
  }, []);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put("/api/cart", { productId, quantity });
      setCart(res.data.cart);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    setRemovingItem(productId);
    try {
      const res = await api.delete(`/api/cart/${productId}`);
      setCart(res.data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setRemovingItem(null), 300);
    }
  };

  const moveToWishlist = async (productId) => {
    try {
      await api.post("/api/wishlist", { productId });
      removeItem(productId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-8">
          <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-[#d4b97d]/30 rounded-full"></div>
          <ShoppingBag className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Loading Your Treasure</h3>
        <p className="text-gray-600">Gathering your exquisite collection...</p>
      </div>
    </div>
  );

  const subtotal = cart.items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0);
  const delivery = 0;
  const discount = subtotal > 10000 ? 500 : 0;
  const total = subtotal + delivery - discount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
      {/* Golden Blobs Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
                <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Your Collection</span>
                <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
                Your Shopping Bag
              </h1>
            </div>
            
            <div className="flex items-center gap-4 bg-gradient-to-r from-white to-[#fef8e9] px-6 py-3 rounded-2xl border border-[#f4e6c3] shadow-sm">
              <ShoppingBag className="w-6 h-6 text-[#b2965a]" />
              <div>
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-xl font-bold text-gray-900">{cart.items.length}</div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-lg">
            Review and manage your selected exquisite pieces before checkout
          </p>
        </motion.div>

        {cart.items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-[#b2965a]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Your Treasure Chest Awaits
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Your cart is currently empty. Fill it with exquisite jewelry pieces that reflect your style.
            </p>
            <button 
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Explore Collection
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((it, index) => (
                <motion.div
                  key={it.product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className={`relative bg-white rounded-2xl border border-[#f4e6c3] shadow-lg overflow-hidden transition-all duration-300 ${
                    removingItem === it.product._id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  {/* Premium Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Product Image */}
                    <div className="relative w-full md:w-48 h-56 rounded-xl overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] flex-shrink-0">
                      <img 
                        src={it.product.images?.[0]?.url} 
                        alt={it.product.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      
                      {/* Quantity Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-900 shadow">
                        ×{it.quantity}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{it.product.title}</h3>
                          <p className="text-sm text-gray-600 capitalize mb-2">{it.product.category}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Gem className="w-4 h-4 text-[#b2965a]" />
                            <span>Kanjique Jewels</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{(it.product.price * it.quantity).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{it.product.price.toLocaleString()} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button 
                              onClick={() => updateQty(it.product._id, it.quantity - 1)}
                              disabled={it.quantity <= 1}
                              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-6 py-2 text-lg font-bold text-gray-900 min-w-[60px] text-center border-x">
                              {it.quantity}
                            </span>
                            <button 
                              onClick={() => updateQty(it.product._id, it.quantity + 1)}
                              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                          <button 
                            onClick={() => moveToWishlist(it.product._id)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#b2965a] transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="hidden sm:inline">Save for Later</span>
                          </button>
                          <button 
                            onClick={() => removeItem(it.product._id)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary - Right Column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-32">
                <div className="bg-gradient-to-b from-white to-[#fef8e9] rounded-3xl border-2 border-[#f4e6c3] shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] p-6">
                    <h2 className="text-2xl font-serif font-bold text-white mb-2">Order Summary</h2>
                    <p className="text-white/90 text-sm">Review your order details</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-lg font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-lg font-semibold text-green-600">-₹{discount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-lg font-semibold text-green-600">FREE</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-gray-900">Grand Total</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">₹{total.toLocaleString()}</div>
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
                      onClick={() => navigate("/test-checkout")}
                      className="w-full bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      <Lock className="w-5 h-5" />
                      Proceed to Secure Checkout
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Benefits */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#b2965a]" />
                      Premium Benefits Included
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Free Lifetime Maintenance</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>30-Day Easy Returns</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Insurance Covered Shipping</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Free Gift Packaging</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Shopping */}
                <button 
                  onClick={() => navigate("/")}
                  className="w-full mt-6 py-4 rounded-xl border-2 border-[#b2965a] text-[#b2965a] font-semibold hover:bg-[#fef8e9] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Cart Tips */}
        {cart.items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3]">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-[#b2965a]" />
                <div>
                  <h4 className="font-bold text-gray-900">Secure Purchase</h4>
                  <p className="text-sm text-gray-600">256-bit SSL encryption</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3]">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-8 h-8 text-[#b2965a]" />
                <div>
                  <h4 className="font-bold text-gray-900">Easy Returns</h4>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3]">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-8 h-8 text-[#b2965a]" />
                <div>
                  <h4 className="font-bold text-gray-900">Fast Delivery</h4>
                  <p className="text-sm text-gray-600">3-5 business days</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}