import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  Share2,
  Shield,
  Truck,
  Check,
  ShoppingBag,
  ChevronRight,
  Minus,
  Plus,
  AlertCircle,
  Camera,
  ShieldCheck,
  TrendingUp,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import { useCurrency } from '../../context/CurrencyContext';
import AddToCart from "../../components/addToCart/AddToCart";
import BuyNow from "../../components/addToCart/BuyNow";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Get currency functions
  const { format: formatPrice, currency, rates, loading: currencyLoading } = useCurrency();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        
        try {
          res = await api.get(`/api/public/products/${id}`);
        } catch (err) {
          res = await api.get(`/api/products/${id}`);
        }
        
        if (!res.data.product) {
          throw new Error("Product not found");
        }
        
        const productData = res.data.product;
        console.log("Product data received:", productData);
        setProduct(productData);
        
        if (productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }
        
        if (productData.mainImages && productData.mainImages.length > 0) {
          setSelectedImage(0);
        }

        try {
          setLoadingRelated(true);
          const relatedRes = await api.get(`/api/public/products/related/${id}?limit=6`);
          if (relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.products);
          }
        } catch (relatedErr) {
          console.log("Could not fetch related products:", relatedErr);
          setRelatedProducts([]);
        } finally {
          setLoadingRelated(false);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.error || "Product not found. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedSize(variant.size);
    setSelectedImage(0);
  };

  const handleColorSelect = (color) => {
    if (!product?.variants) return;
    
    const variant = product.variants.find(v => 
      v.color?.name === color?.name && 
      (!selectedSize || v.size === selectedSize)
    );
    if (variant) {
      setSelectedVariant(variant);
      setSelectedColor(color);
      setSelectedSize(variant.size);
    }
  };

  const handleSizeSelect = (size) => {
    if (!product?.variants) return;
    
    const variant = product.variants.find(v => 
      v.size === size && 
      (!selectedColor || v.color?.name === selectedColor?.name)
    );
    if (variant) {
      setSelectedVariant(variant);
      setSelectedSize(size);
      setSelectedColor(variant.color);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleWishlist = () => {
    setWishlist(!wishlist);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getMainImages = () => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product?.mainImages || [];
  };

  const getCurrentPrice = () => {
    if (selectedVariant?.salePrice) {
      return selectedVariant.salePrice;
    }
    if (selectedVariant?.price) {
      return selectedVariant.price;
    }
    if (product?.baseSalePrice) {
      return product.baseSalePrice;
    }
    return product?.basePrice || 0;
  };

  const getOriginalPrice = () => {
    if (selectedVariant?.price && selectedVariant?.salePrice) {
      return selectedVariant.price;
    }
    if (product?.baseSalePrice && product?.basePrice) {
      return product.basePrice;
    }
    return null;
  };

  const getDiscountPercentage = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    
    if (originalPrice && originalPrice > currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    
    if (selectedVariant?.discountPercentage) {
      return selectedVariant.discountPercentage;
    }
    
    return product?.overallDiscountPercentage || 0;
  };

  const getAvailableColors = () => {
    if (!product?.variants) return [];
    
    const colors = [];
    const seen = new Set();
    
    product.variants.forEach(variant => {
      if (variant.color) {
        const colorKey = JSON.stringify(variant.color);
        if (!seen.has(colorKey)) {
          seen.add(colorKey);
          colors.push(variant.color);
        }
      }
    });
    
    return colors;
  };

  const getAvailableSizes = () => {
    if (!product?.variants) return [];
    
    const sizes = new Set();
    
    product.variants.forEach(variant => {
      if (variant.size) {
        sizes.add(variant.size);
      }
    });
    
    return Array.from(sizes);
  };

  const getStockStatus = () => {
    if (selectedVariant) {
      return {
        inStock: selectedVariant.stockQuantity > 0,
        quantity: selectedVariant.stockQuantity,
        isLow: selectedVariant.stockQuantity < 10 && selectedVariant.stockQuantity > 0
      };
    }
    return {
      inStock: product?.inStock || false,
      quantity: product?.totalStock || 0,
      isLow: (product?.totalStock || 0) < 10 && (product?.totalStock || 0) > 0
    };
  };

  const handleImageMouseMove = (e) => {
    if (!zoomImage) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading || currencyLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-100 border-t-[#ff3f6c] rounded-full animate-spin"></div>
            <TrendingUp className="w-10 h-10 text-[#ff3f6c] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
            Loading Product
          </h3>
          <p className="text-gray-600">Fetching the finest details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center">
            <X className="w-12 h-12 text-[#ff3f6c]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-[#ff3f6c] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#e63560] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainImages = getMainImages();
  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const discountPercentage = getDiscountPercentage();
  const stockStatus = getStockStatus();
  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-[#ff3f6c] transition-colors duration-200">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/category/${product.category}`} 
            className="hover:text-[#ff3f6c] transition-colors duration-200 capitalize"
          >
            {product.category}
          </Link>
          {product.subCategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-400 capitalize">{product.subCategory}</span>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Image Gallery - Left Column */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              {/* Main Image with Zoom */}
              <div className="relative bg-white rounded-xl mb-4 overflow-hidden border border-gray-100">
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 z-20 bg-[#ff3f6c] text-white px-3 py-1 rounded text-sm font-bold shadow-lg">
                    {discountPercentage}% OFF
                  </div>
                )}
                {product.isFeatured && (
                  <div className="absolute top-4 right-4 z-20 bg-black text-white px-3 py-1 rounded text-sm font-bold">
                    TRENDING
                  </div>
                )}

                <div 
                  className="relative overflow-hidden cursor-zoom-in"
                  onMouseEnter={() => mainImages.length > 0 && setZoomImage(true)}
                  onMouseLeave={() => setZoomImage(false)}
                  onMouseMove={handleImageMouseMove}
                >
                  {mainImages.length > 0 ? (
                    <>
                      <img
                        src={mainImages[selectedImage]?.url}
                        alt={product.title}
                        className="w-full h-[500px] object-contain bg-gray-50 transition-transform duration-300"
                      />
                      {zoomImage && (
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: `url(${mainImages[selectedImage]?.url})`,
                            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            backgroundSize: '200%',
                            transform: 'scale(1.5)'
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Stock Badge */}
                <div className="absolute bottom-4 left-4">
                  {!stockStatus.inStock ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                      OUT OF STOCK
                    </span>
                  ) : stockStatus.isLow ? (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">
                      ONLY {stockStatus.quantity} LEFT
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {mainImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {mainImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedImage === idx
                          ? "border-[#ff3f6c] ring-2 ring-[#ff3f6c] ring-opacity-30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&h=150&fit=crop&q=80";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleWishlist}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#ff3f6c] transition-colors duration-200"
                >
                  <Heart className={`w-5 h-5 ${wishlist ? "fill-[#ff3f6c] text-[#ff3f6c]" : ""}`} />
                  <span className="text-sm font-medium">{wishlist ? "SAVED" : "SAVE"}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#ff3f6c] transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">SHARE</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-600 hover:text-[#ff3f6c] transition-colors duration-200">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">SECURE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Details - Right Column */}
          <div className="lg:col-span-5">
            {/* Product Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {product.brand && (
                  <span className="text-gray-600 font-normal">{product.brand} </span>
                )}
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(4.5 • 1.2k reviews)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm font-medium text-green-600">
                  {product.gender ? `${product.gender}'s` : "Unisex"}
                </span>
              </div>
            </div>

            {/* Price Section - UPDATED */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {originalPrice && originalPrice > currentPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-sm font-bold text-[#ff3f6c] bg-[#ff3f6c]/10 px-2 py-1 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                incl. of all taxes • {currency} {rates[currency] ? `(1 INR = ${rates[currency]} ${currency})` : ''}
              </p>
            </div>

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">SELECT COLOR</h3>
                  <span className="text-sm text-gray-500">
                    {selectedColor?.name || "Select a color"}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {availableColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color)}
                      className={`relative group p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedColor?.name === color.name
                          ? "border-[#ff3f6c] ring-2 ring-[#ff3f6c] ring-opacity-30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                          {color.name}
                        </span>
                      </div>
                      {selectedColor?.name === color.name && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ff3f6c] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">SELECT SIZE</h3>
                  <button className="text-sm text-[#ff3f6c] font-semibold hover:underline">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {availableSizes.map((size, index) => {
                    const variantStock = product.variants?.find(v => 
                      v.size === size && 
                      (!selectedColor || v.color?.name === selectedColor?.name)
                    )?.stockQuantity || 0;
                    
                    const isAvailable = variantStock > 0;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => isAvailable && handleSizeSelect(size)}
                        disabled={!isAvailable}
                        className={`relative py-3 rounded-md text-center transition-all duration-200 ${
                          selectedSize === size && isAvailable
                            ? "bg-black text-white border-2 border-black"
                            : "bg-white border border-gray-300 hover:border-gray-400"
                        } ${!isAvailable ? "opacity-40 cursor-not-allowed" : "hover:shadow-md"}`}
                      >
                        <span className={`font-medium ${selectedSize === size && isAvailable ? "text-white" : "text-gray-900"}`}>
                          {size}
                        </span>
                        {!isAvailable && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Actions - UPDATED */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Quantity</h3>
                <div className="text-sm text-gray-500">
                  {stockStatus.inStock ? `${stockStatus.quantity} units available` : "Out of stock"}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border-2 border-[#b2965a] rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-[#b2965a] hover:bg-[#fef8e9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="w-16 text-center text-xl font-bold text-gray-900 border-l border-r border-[#b2965a]">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={!stockStatus.inStock || quantity >= stockStatus.quantity}
                    className="w-12 h-12 flex items-center justify-center text-[#b2965a] hover:bg-[#fef8e9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-lg font-bold text-gray-900">
                  Total: <span className="text-[#b2965a]">{formatPrice(currentPrice * quantity)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {stockStatus.inStock ? (
                  <>
                    <AddToCart 
                      product={product}
                      variant={selectedVariant}
                      quantity={quantity}
                      className="flex-1 bg-white border-2 border-[#b2965a] text-[#b2965a] py-3 px-4 rounded-xl font-semibold text-base hover:bg-[#fef8e9] transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      ADD TO BAG
                    </AddToCart>
                    <BuyNow 
                      product={product}
                      variant={selectedVariant}
                      quantity={quantity}
                      className="flex-1 bg-gradient-to-r from-[#b2965a] to-[#c9a96f] text-white py-3 px-4 rounded-xl font-semibold text-base hover:from-[#9d7f4c] hover:to-[#b8945f] transition-all duration-300 shadow-md hover:shadow-lg uppercase tracking-wide"
                    />
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-100 text-gray-500 py-3 px-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wide"
                  >
                    <AlertCircle className="w-5 h-5" />
                    OUT OF STOCK
                  </button>
                )}
              </div>
            </div>

            {/* Delivery & Offers */}
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">Delivery in 3-5 days</p>
                </div>
              </div>
            
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">100% Authentic</p>
                  <p className="text-sm text-gray-600">Quality Assured</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - UPDATED */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Similar Products</h2>
                <p className="text-gray-600">Complete your look with these</p>
              </div>
              <Link 
                to={`/category/${product.category}`}
                className="text-[#ff3f6c] font-semibold hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingRelated ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse flex space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-64 h-80 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <motion.div
                    key={relatedProduct._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${relatedProduct._id}`)}
                  >
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-3">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={relatedProduct.mainImages?.[0]?.url || "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&q=80"}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {relatedProduct.overallDiscountPercentage > 0 && (
                          <div className="absolute top-3 left-3 bg-[#ff3f6c] text-white px-2 py-1 rounded text-xs font-bold">
                            {relatedProduct.overallDiscountPercentage}% OFF
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-[#ff3f6c] transition-colors">
                        {relatedProduct.title}
                      </h3>
                      {relatedProduct.brand && (
                        <p className="text-xs text-gray-500 mb-2">{relatedProduct.brand}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {formatPrice(relatedProduct.displayPrice || relatedProduct.basePrice)}
                        </span>
                        {relatedProduct.hasDiscount && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(relatedProduct.basePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}