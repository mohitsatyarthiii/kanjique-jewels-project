import React, { useState, useContext } from 'react';
import { Zap, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const BuyNow = ({ 
  product, 
  variant = null, 
  quantity = 1,
  className = '',
  showIcon = true,
  showText = true
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useCurrency();

  const calculatePrice = () => {
    let price = 0;
    
    if (variant?.salePrice) {
      price = variant.salePrice;
    } else if (variant?.price) {
      price = variant.price;
    } else if (product?.baseSalePrice) {
      price = product.baseSalePrice;
    } else {
      price = product?.basePrice || 0;
    }
    
    return price;
  };

  const calculateDeliveryFee = (subtotal) => {
    return subtotal > 5000 ? 0 : 99;
  };

  const handleBuyNow = async () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Please login to continue with checkout'
        } 
      });
      return;
    }

    // Validate product
    if (!product || !product._id) {
      setError("Invalid product");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Clear cart and add only this product
      const price = calculatePrice();
      const subtotal = price * quantity;
      const delivery = calculateDeliveryFee(subtotal);
      const total = subtotal + delivery;

      // Create a temporary order object to pass to checkout
      const orderData = {
        product: {
          _id: product._id,
          title: product.title,
          slug: product.slug,
          mainImages: product.mainImages,
          basePrice: product.basePrice,
          baseSalePrice: product.baseSalePrice,
        },
        variant: variant ? {
          _id: variant._id,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          salePrice: variant.salePrice,
          stockQuantity: variant.stockQuantity,
          images: variant.images,
          discountPercentage: variant.discountPercentage,
        } : null,
        quantity: quantity,
        price: price,
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        currency: currency || 'INR',
      };

      // Store order data in session/local storage for checkout page
      console.log("Storing buyNowData:", orderData);
      sessionStorage.setItem('buyNowData', JSON.stringify(orderData));

      // Navigate to checkout page
      navigate('/checkout/buy-now');

    } catch (err) {
      console.error("Buy now error:", err);
      setError(err.message || "Failed to process buy now request");
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
        onClick={handleBuyNow}
        disabled={loading || !isInStock()}
        className={`${className} ${!isInStock() ? 'opacity-50 cursor-not-allowed' : ''} relative overflow-hidden`}
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : showIcon && showText ? (
            <>
              <Zap className="w-5 h-5" />
              BUY NOW
            </>
          ) : showIcon ? (
            <Zap className="w-5 h-5" />
          ) : (
            'BUY NOW'
          )}
        </div>
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BuyNow;
