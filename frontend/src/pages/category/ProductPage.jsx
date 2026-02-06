import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Check,
  Gem,
  Sparkles,
  Crown,
  Award,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Tag,
  Package,
  Clock,
  Zap,
  TrendingUp,
  Layers,
  Palette,
  Ruler,
  Scale,
  Sparkle,
  Clock4,
  Hash,
  Percent,
  Eye,
  Minus,
  Plus,
  ShoppingCart,
  AlertCircle,
  Gift,
  Diamond,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import AddToCart from "../../components/addToCart/AddToCart";

export default function ProductPage() {
  const { id } = useParams(); // Changed from slug to id
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [showNotification, setShowNotification] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the correct API endpoint - get product by ID
        const res = await api.get(`/api/admin/products/${id}`);
        
        if (!res.data.product) {
          throw new Error("Product not found");
        }
        
        setProduct(res.data.product);
        
        // Set initial variant
        if (res.data.product.variants && res.data.product.variants.length > 0) {
          const firstVariant = res.data.product.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }
        
        // Set initial image
        if (res.data.product.mainImages && res.data.product.mainImages.length > 0) {
          setSelectedImage(0);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product) return;
      
      setLoadingSimilar(true);
      try {
        // Fetch products by category (public endpoint)
        const res = await api.get(`/api/admin/products/category${product.category}?limit=8`);
        if (res.data.products) {
          // Filter out current product
          const filtered = res.data.products.filter(p => 
            p._id !== product._id
          ).slice(0, 4);
          setSimilarProducts(filtered);
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
        // If category endpoint fails, try public products
        try {
          const fallbackRes = await api.get("/api/admin/products?limit=8");
          if (fallbackRes.data.products) {
            setSimilarProducts(fallbackRes.data.products.slice(0, 4));
          }
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
        }
      } finally {
        setLoadingSimilar(false);
      }
    };

    if (product && product.category) {
      fetchSimilarProducts();
    }
  }, [product]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedSize(variant.size);
    // Reset image to first variant image or main image
    setSelectedImage(0);
  };

  const handleColorSelect = (color) => {
    // Find variant with this color and current size
    const variant = product.variants.find(v => 
      v.color.name === color.name && 
      (!selectedSize || v.size === selectedSize)
    );
    if (variant) {
      setSelectedVariant(variant);
      setSelectedColor(color);
      setSelectedSize(variant.size);
    }
  };

  const handleSizeSelect = (size) => {
    // Find variant with this size and current color
    const variant = product.variants.find(v => 
      v.size === size && 
      (!selectedColor || v.color.name === selectedColor.name)
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
    const newWishlistState = !wishlist;
    setWishlist(newWishlistState);
    setShowNotification(newWishlistState ? "Added to wishlist!" : "Removed from wishlist!");
    setTimeout(() => setShowNotification(""), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this beautiful ${product.title} from our collection`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowNotification("Link copied to clipboard!");
      setTimeout(() => setShowNotification(""), 2000);
    }
  };

  const getMainImages = () => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product.mainImages || [];
  };

  const getCurrentPrice = () => {
    if (selectedVariant?.salePrice) {
      return selectedVariant.salePrice;
    }
    if (selectedVariant?.price) {
      return selectedVariant.price;
    }
    if (product.baseSalePrice) {
      return product.baseSalePrice;
    }
    return product.basePrice || 0;
  };

  const getOriginalPrice = () => {
    if (selectedVariant?.price && selectedVariant?.salePrice) {
      return selectedVariant.price;
    }
    if (product.baseSalePrice && product.basePrice) {
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
    
    return product.overallDiscountPercentage || 0;
  };

  const getAvailableColors = () => {
    const colors = [];
    const seen = new Set();
    
    product.variants?.forEach(variant => {
      const colorKey = JSON.stringify(variant.color);
      if (!seen.has(colorKey)) {
        seen.add(colorKey);
        colors.push(variant.color);
      }
    });
    
    return colors;
  };

  const getAvailableSizes = () => {
    const sizes = new Set();
    
    product.variants?.forEach(variant => {
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
      inStock: product.inStock,
      quantity: product.totalStock || 0,
      isLow: (product.totalStock || 0) < 10 && (product.totalStock || 0) > 0
    };
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <div key={i} className="relative">
            <Star size={18} className="text-gray-300" />
            <Star 
              size={18} 
              className="fill-yellow-400 text-yellow-400 absolute left-0 top-0"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(<Star key={i} size={18} className="text-gray-300" />);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-16 h-16 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Loading Product Details
          </h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-[#b2965a] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#9c8146] transition-colors"
            >
              Go to Home
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="bg-white text-[#b2965a] border border-[#b2965a] px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
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
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-[#b2965a] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/products/category/${product.category}`} 
            className="hover:text-[#b2965a] transition-colors capitalize"
          >
            {product.category}
          </Link>
          {product.subCategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{product.subCategory}</span>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl border border-gray-200 p-4">
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {discountPercentage}% OFF
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 right-4 z-10 bg-[#b2965a] text-white px-3 py-1 rounded-full text-sm font-bold">
                  Featured
                </div>
              )}

              {mainImages.length > 0 ? (
                <img
                  src={mainImages[selectedImage]?.url}
                  alt={product.title}
                  className="w-full h-96 object-contain"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Stock Badge */}
              <div className="absolute bottom-4 left-4">
                {!stockStatus.inStock ? (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Out of Stock
                  </span>
                ) : stockStatus.isLow ? (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Only {stockStatus.quantity} left
                  </span>
                ) : (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {mainImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {mainImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                      selectedImage === idx
                        ? "border-[#b2965a]"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Variant Images */}
            {hasVariants && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">All Variants</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant._id || idx}
                      onClick={() => handleVariantSelect(variant)}
                      className={`relative border-2 rounded-lg overflow-hidden ${
                        selectedVariant?._id === variant._id
                          ? "border-[#b2965a]"
                          : "border-gray-200"
                      }`}
                    >
                      {variant.images?.[0]?.url ? (
                        <img
                          src={variant.images[0].url}
                          alt={`${variant.color.name} ${variant.size}`}
                          className="w-full h-20 object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-20 flex items-center justify-center"
                          style={{ backgroundColor: variant.color?.hexCode || "#f4e6c3" }}
                        >
                          <Gem className="w-6 h-6 text-white/80" />
                        </div>
                      )}
                      
                      {selectedVariant?._id === variant._id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-[#b2965a] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="mb-2">
                <span className="text-sm font-semibold text-[#b2965a] uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-lg font-semibold text-[#b2965a]">
                  {product.brand || "Premium Brand"}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600 capitalize">
                  {product.gender || "Unisex"}
                </span>
              </div>

              {product.shortDescription && (
                <p className="text-gray-600 mb-6">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(4.5)}
                </div>
                <span className="text-lg font-bold text-gray-900">4.5</span>
              </div>
              <span className="text-gray-600">(1.2k reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{currentPrice.toLocaleString()}
                    </span>
                    {originalPrice && originalPrice > currentPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ₹{originalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          Save {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#b2965a]" /> Select Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                          selectedColor?.name === color.name
                            ? "border-[#b2965a] bg-[#b2965a]/10"
                            : "border-gray-300 hover:border-[#b2965a]"
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-sm font-medium">
                          {color.name}
                        </span>
                        {selectedColor?.name === color.name && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-[#b2965a]" /> Select Size
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {availableSizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => handleSizeSelect(size)}
                        className={`p-3 rounded-lg border text-center ${
                          selectedSize === size
                            ? "border-[#b2965a] bg-[#b2965a]/10 font-bold"
                            : "border-gray-300 hover:border-[#b2965a]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material & Weight */}
              <div className="grid grid-cols-2 gap-4">
                {product.material && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Material</div>
                    <div className="font-medium">{product.material}</div>
                  </div>
                )}
                {product.weight && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Weight</div>
                    <div className="font-medium">{product.weight}g</div>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Quantity</h3>
                  <div className="text-sm text-gray-600">
                    Max: {stockStatus.inStock ? stockStatus.quantity : 0} available
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded flex items-center justify-center bg-white border border-gray-300 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={!stockStatus.inStock || quantity >= stockStatus.quantity}
                      className="w-10 h-10 rounded flex items-center justify-center bg-white border border-gray-300 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      Subtotal: ₹{(currentPrice * quantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleWishlist}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Heart className={`w-5 h-5 ${wishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </button>
                  
                  {stockStatus.inStock ? (
                    
                      <AddToCart/>
                    
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Out of Stock
                    </button>
                  )}
                </div>

                <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#b2965a]" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">3-5 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-[#b2965a]" />
                <div>
                  <p className="font-medium text-gray-900">30-Day Returns</p>
                  <p className="text-sm text-gray-600">Easy Exchange</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#b2965a]" />
                <div>
                  <p className="font-medium text-gray-900">2-Year Warranty</p>
                  <p className="text-sm text-gray-600">Free Maintenance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-[#b2965a]" />
                <div>
                  <p className="font-medium text-gray-900">Free Gift Wrap</p>
                  <p className="text-sm text-gray-600">Premium Packaging</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {["description", "specifications", "shipping"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 font-semibold border-b-2 ${
                    activeTab === tab
                      ? "border-[#b2965a] text-[#b2965a]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "description" && "Description"}
                  {tab === "specifications" && "Specifications"}
                  {tab === "shipping" && "Shipping & Returns"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {activeTab === "description" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Product Description</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Product Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Material</span>
                      <span className="font-medium">{product.material || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Weight</span>
                      <span className="font-medium">{product.weight || "N/A"}g</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-medium capitalize">{product.gender || "Unisex"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Variants</h4>
                  {hasVariants ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-600">Color</th>
                            <th className="text-left py-2 text-gray-600">Size</th>
                            <th className="text-left py-2 text-gray-600">Stock</th>
                            <th className="text-left py-2 text-gray-600">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variants.map((variant, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full border"
                                    style={{ backgroundColor: variant.color?.hexCode }}
                                  />
                                  <span>{variant.color?.name}</span>
                                </div>
                              </td>
                              <td className="py-2">{variant.size || "N/A"}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${variant.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {variant.stockQuantity > 0 ? `${variant.stockQuantity} units` : 'Out of stock'}
                                </span>
                              </td>
                              <td className="py-2 font-medium">
                                ₹{variant.salePrice || variant.price}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">No variants available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-900">Shipping & Returns</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900">Shipping Information</h5>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <Truck className="w-5 h-5 text-[#b2965a] flex-shrink-0" />
                        <span>Free shipping on all orders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-[#b2965a] flex-shrink-0" />
                        <span>Delivery within 3-7 business days</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900">Return Policy</h5>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <RotateCcw className="w-5 h-5 text-[#b2965a] flex-shrink-0" />
                        <span>30-day return policy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#b2965a] flex-shrink-0" />
                        <span>Items must be in original condition</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Similar Products
            </h2>
            <p className="text-gray-600">
              Discover more from our collection
            </p>
          </div>

          {loadingSimilar ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link
                  key={similarProduct._id}
                  to={`/product/${similarProduct._id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-100">
                      {similarProduct.mainImages?.[0]?.url ? (
                        <img
                          src={similarProduct.mainImages[0].url}
                          alt={similarProduct.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 line-clamp-1 mb-1 group-hover:text-[#b2965a]">
                        {similarProduct.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          ₹{(similarProduct.baseSalePrice || similarProduct.basePrice || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-600 capitalize">
                          {similarProduct.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No similar products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}