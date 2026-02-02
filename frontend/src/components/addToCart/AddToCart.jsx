import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { 
  ShoppingBag, 
  Plus, 
  Minus,
  Check,
  Eye
} from "lucide-react";

export default function AddToCart({ 
  productId, 
  productSlug, 
  className = "", 
  showQuantity = true,
  showViewDetails = false 
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const handleChange = (val) => {
    const value = Number(val);
    if (value >= 1 && value <= 99) setQty(value);
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post("/api/cart", { productId, quantity: qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        const next = encodeURIComponent(`/product/${productSlug}?add=${productId}&qty=${qty}`);
        window.location.href = `/login?next=${next}`;
      } else {
        alert(err.response?.data?.error || "Failed to add to cart");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quantity Selector - Always visible when showQuantity is true */}
      {showQuantity && (
        <div className="flex items-center justify-between bg-white/80 rounded-lg p-2 border border-[#f4e6c3]">
          <span className="text-xs font-medium text-gray-700">QTY:</span>
          <div className="flex items-center border border-[#e0c98c] rounded-lg bg-white overflow-hidden">
            <button 
              onClick={() => handleChange(qty - 1)}
              disabled={qty <= 1}
              className="p-1.5 text-gray-600 hover:text-[#b2965a] hover:bg-[#fef8e9] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <div className="w-8 text-center py-1 text-sm font-semibold text-gray-900 border-x border-[#f4e6c3]">
              {qty}
            </div>
            
            <button 
              onClick={() => handleChange(qty + 1)}
              disabled={qty >= 99}
              className="p-1.5 text-gray-600 hover:text-[#b2965a] hover:bg-[#fef8e9] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className={`flex gap-2 ${showViewDetails ? '' : 'flex-col'}`}>
        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          disabled={loading || added}
          className={`flex-1 py-2.5 rounded-lg font-medium text-xs transition-all duration-300 flex items-center justify-center gap-1.5 relative overflow-hidden ${
            added 
              ? 'bg-green-600 text-white' 
              : 'bg-gradient-to-r from-[#b2965a] to-[#d4b97d] hover:from-[#8c703f] hover:to-[#b2965a] text-white hover:shadow-md'
          }`}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : added ? (
            <>
              <Check className="w-3 h-3" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3 h-3" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* View Details Button (Conditional) */}
        {showViewDetails && (
          <Link
            to={`/product/${product.slug}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#b2965a] text-[#b2965a] hover:bg-[#fef8e9] transition-colors text-xs font-medium min-w-[100px]"
          >
            <Eye className="w-3 h-3" />
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}