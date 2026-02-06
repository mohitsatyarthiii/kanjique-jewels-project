import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";

const AddToCart = ({ 
  productId, 
  variantId, 
  quantity = 1, 
  className = "",
  showQuantity = true,
  showViewDetails = true
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post("/api/cart", {
        productId,
        variantId,
        quantity
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(err.response?.data?.error || "Failed to add to cart");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!error) {
      navigate("/cart");
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
        <Check className="w-5 h-5" />
        <span>Added to Cart!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className={`flex-1 bg-[#b2965a] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#9c8146] transition-colors disabled:opacity-50 ${className}`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
        
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default AddToCart;