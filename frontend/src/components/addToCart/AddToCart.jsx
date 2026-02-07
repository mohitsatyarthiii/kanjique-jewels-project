import React, { useState } from 'react';
import { ShoppingCart, AlertCircle, Check } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AddToCart = ({ 
  product, 
  variant = null, 
  quantity = 1,
  className = '',
  showIcon = true,
  showText = true
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    // Validate product
    if (!product || !product._id) {
      setError("Invalid product");
      return;
    }

    // Validate product ID
    if (typeof product._id !== 'string' && typeof product._id !== 'object') {
      setError("Invalid product ID format");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productId = typeof product._id === 'object' ? product._id.toString() : product._id;
      
      const payload = {
        productId: productId,
        quantity: quantity
      };

      // Add variant if available
      if (variant && variant._id) {
        payload.variantId = variant._id;
      }

      console.log("Adding to cart with payload:", payload);

      const response = await api.post('/api/cart', payload);
      
      if (response.data.success) {
        setSuccess(true);
        // Reset success message after 2 seconds
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(response.data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      
      if (err.response) {
        // Server responded with error
        setError(err.response.data.error || "Server error adding to cart");
        
        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          navigate('/login');
        }
      } else if (err.request) {
        // Request was made but no response
        setError("Network error. Please check your connection.");
      } else {
        // Other errors
        setError(err.message || "Failed to add to cart");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in stock
  const isInStock = () => {
    if (variant) {
      return variant.stockQuantity > 0;
    }
    return product?.inStock || product?.totalStock > 0;
  };

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={loading || !isInStock()}
        className={`${className} ${!isInStock() ? 'opacity-50 cursor-not-allowed' : ''} relative overflow-hidden`}
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : success ? (
            <>
              <Check className="w-5 h-5" />
              <span>Added!</span>
            </>
          ) : (
            <>
              {showIcon && <ShoppingCart className="w-5 h-5" />}
              {showText && <span>{isInStock() ? 'Add to Cart' : 'Out of Stock'}</span>}
            </>
          )}
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-1 z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToCart;