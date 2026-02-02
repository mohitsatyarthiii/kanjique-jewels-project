import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiX, FiChevronRight, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles } from "lucide-react";

const CartNotification = ({ 
  product, 
  quantity = 1,
  onClose 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
        >
          <div className="relative bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-2xl border-2 border-[#f4e6c3] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Added to Cart!</h3>
                    <p className="text-white/90 text-sm">Your item has been successfully added</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setVisible(false);
                    onClose?.();
                  }}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <FiX className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] flex-shrink-0">
                  <img
                    src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
                    {product.title}
                  </h4>
                  <p className="text-xs text-gray-600 capitalize mb-2">{product.category}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-[#b2965a]">
                        ₹{(product.price * quantity).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {quantity} item{quantity > 1 ? 's' : ''} • ₹{product.price.toLocaleString()} each
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Qty: {quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cart"
                  className="group flex-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  onClick={() => {
                    setVisible(false);
                    onClose?.();
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  View Cart
                  <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/checkout"
                  className="group flex-1 bg-white border-2 border-[#b2965a] text-[#b2965a] py-3 rounded-xl font-semibold text-sm hover:bg-[#fef8e9] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  onClick={() => {
                    setVisible(false);
                    onClose?.();
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Checkout
                </Link>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                Free shipping • 30-day returns • Insured delivery
              </p>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartNotification;