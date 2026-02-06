import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp, 
  FiStar, 
  FiShoppingBag, 
  FiShoppingCart,
  FiEye,
  FiHeart,
  FiPercent,
  FiTag,
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiLoader,
  FiXCircle,
  FiGrid,
  FiList,
  FiX,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Fixed categories for filter sidebar
const FIXED_CATEGORIES = [
  { title: "Rings", icon: "💍" },
  { title: "Bangles", icon: "🔗" },
  { title: "Necklaces", icon: "📿" },
  { title: "Earrings", icon: "✨" },
  { title: "Bracelets", icon: "💫" },
  { title: "Pendants", icon: "🔶" }
];

// Color options for filter
const COLOR_OPTIONS = [
  { name: "Gold", hexCode: "#FFD700" },
  { name: "Rose Gold", hexCode: "#B76E79" },
  { name: "White Gold", hexCode: "#F5F5F5" },
  { name: "Silver", hexCode: "#C0C0C0" },
  { name: "Platinum", hexCode: "#E5E4E2" }
];

// Sort options
const SORT_OPTIONS = [
  { value: "featured", label: "Featured", icon: <FiAward /> },
  { value: "newest", label: "New Arrivals", icon: <FiClock /> },
  { value: "price-low", label: "Price: Low to High", icon: <FiTrendingUp /> },
  { value: "price-high", label: "Price: High to Low", icon: <FiTrendingUp className="rotate-180" /> }
];

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceFilter, setPriceFilter] = useState([0, 1000000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 12;

  // Fetch products based on category and filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = "/api/admin/products";
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortBy === 'featured' ? 'isFeatured' : 'createdAt',
          sortOrder: sortBy === 'price-low' ? 'asc' : 'desc'
        };

        // Apply category filter if exists
        if (category && category !== 'all') {
          params.category = category;
        }

        // Apply price filter
        if (priceFilter[0] > 0 || priceFilter[1] < 1000000) {
          params.minPrice = priceFilter[0];
          params.maxPrice = priceFilter[1];
        }

        // Apply color filter
        if (selectedColors.length > 0) {
          params.color = selectedColors.join(',');
        }

        const res = await api.get(url, { params });
        console.log("API Response:", res.data);

        // Handle response based on structure
        let productsData = [];
        let paginationData = null;

        if (res.data.products && Array.isArray(res.data.products)) {
          productsData = res.data.products;
          if (res.data.pagination) {
            paginationData = res.data.pagination;
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalProducts(res.data.pagination.totalProducts || 0);
          }
        } else if (Array.isArray(res.data)) {
          productsData = res.data;
          setTotalPages(1);
          setTotalProducts(res.data.length);
        } else {
          productsData = [];
        }

        setProducts(productsData);

      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentPage, sortBy, priceFilter, selectedColors]);

  // Handle category change
  const handleCategoryChange = (cat) => {
    setCurrentPage(1);
    if (cat === 'all') {
      navigate('/products');
    } else {
      navigate(`/category/${cat}`);
    }
    setShowFilters(false);
  };

  // Handle price change
  const handlePriceChange = (min, max) => {
    setCurrentPage(1);
    setPriceFilter([min, max]);
  };

  // Handle color filter
  const handleColorSelect = (color) => {
    setCurrentPage(1);
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setCurrentPage(1);
    setSortBy(sort);
  };

  // Clear all filters
  const clearFilters = () => {
    setCurrentPage(1);
    setPriceFilter([0, 1000000]);
    setSelectedColors([]);
    setSortBy("featured");
  };

  // Get product image
  const getProductImage = (product) => {
    if (product.mainImages && product.mainImages.length > 0 && product.mainImages[0].url) {
      return product.mainImages[0].url;
    }
    if (product.images && product.images.length > 0 && product.images[0].url) {
      return product.images[0].url;
    }
    return "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
  };

  // Get price display
  const getPriceDisplay = (product) => {
    const basePrice = product.basePrice || 0;
    const salePrice = product.baseSalePrice || product.salePrice;
    
    if (salePrice && salePrice < basePrice) {
      const discountPercent = Math.round(((basePrice - salePrice) / basePrice) * 100);
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">₹{salePrice.toLocaleString()}</span>
            <span className="text-sm text-gray-500 line-through">₹{basePrice.toLocaleString()}</span>
          </div>
          <span className="text-xs text-red-600 font-semibold mt-1">
            Save {discountPercent}%
          </span>
        </div>
      );
    }
    return <span className="text-lg font-bold text-gray-900">₹{basePrice.toLocaleString()}</span>;
  };

  // Modern Product Card Component
  const ProductCard = ({ product, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        key={product._id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group"
      >
        <Link to={`/product/${product._id}`} className="block">
          <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Badge Container */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
              {product.isFeatured && (
                <div className="px-3 py-1 bg-[#b2965a] text-white text-xs font-bold rounded-full shadow-lg">
                  <FiAward className="inline mr-1" /> Featured
                </div>
              )}
              {(product.overallDiscountPercentage > 0 || product.baseSalePrice < product.basePrice) && (
                <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  {Math.round(((product.basePrice - (product.baseSalePrice || product.basePrice)) / product.basePrice) * 100)}% OFF
                </div>
              )}
              {!product.inStock && (
                <div className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full shadow-lg">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to wishlist logic
              }}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#b2965a] hover:text-white transition-all duration-300"
              title="Add to Wishlist"
            >
              <FiHeart className="w-4 h-4" />
            </button>

            {/* Product Image */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <motion.img
                src={getProductImage(product)}
                alt={product.title || "Product"}
                className="w-full h-full object-cover"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Quick View Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/product/${product._id}`);
                  }}
                  className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg flex items-center gap-2 hover:bg-[#b2965a] hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <FiEye className="w-5 h-5" /> Quick View
                </button>
              </motion.div>

              {/* Color Dots */}
              {product.availableColors && product.availableColors.length > 0 && (
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {product.availableColors.slice(0, 3).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color?.hexCode || "#FFD700" }}
                      title={color?.name || "Gold"}
                    />
                  ))}
                  {product.availableColors.length > 3 && (
                    <div className="w-4 h-4 rounded-full bg-white/90 border-2 border-white shadow-md flex items-center justify-center">
                      <span className="text-xs text-gray-700 font-bold">+{product.availableColors.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Category */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                  {product.category || "Jewelry"}
                </span>
                {product.brand && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 hover:text-[#b2965a] transition-colors duration-300">
                {product.title || "Untitled Product"}
              </h3>

              {/* Short Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                {product.shortDescription || product.description || "Premium quality jewelry piece."}
              </p>

              {/* Price */}
              <div className="mb-4">
                {getPriceDisplay(product)}
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-between mb-4">
                <div className={`text-xs px-2 py-1 rounded-full ${
                  product.inStock 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
                {product.variants?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiLayers className="w-3 h-3" />
                    {product.variants.length} variants
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/product/${product._id}`);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <FiShoppingBag className="w-4 h-4" /> View Details
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Add to cart logic
                    console.log("Add to cart:", product._id);
                  }}
                  className="w-10 h-10 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:text-[#b2965a] transition-all duration-300"
                  title="Add to Cart"
                >
                  <FiShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // List View Product Component
  const ProductListCard = ({ product, index }) => {
    return (
      <motion.div
        key={product._id || index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <Link to={`/product/${product._id}`} className="block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="md:w-48 md:h-48 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={getProductImage(product)}
                  alt={product.title || "Product"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.isFeatured && (
                    <div className="px-2 py-1 bg-[#b2965a] text-white text-xs font-bold rounded">
                      Featured
                    </div>
                  )}
                  {(product.overallDiscountPercentage > 0 || product.baseSalePrice < product.basePrice) && (
                    <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      {Math.round(((product.basePrice - (product.baseSalePrice || product.basePrice)) / product.basePrice) * 100)}% OFF
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 p-4">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                        {product.category || "Jewelry"}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-gray-500">{product.brand}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#b2965a] transition-colors">
                      {product.title || "Untitled Product"}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.shortDescription || product.description || "Premium quality jewelry piece."}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Price</div>
                      {getPriceDisplay(product)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Stock</div>
                      <div className={`text-sm font-medium ${
                        product.inStock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.inStock ? 'Available' : 'Out of Stock'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Variants</div>
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <FiLayers className="w-3 h-3" /> {product.variants?.length || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Colors</div>
                      <div className="flex gap-1">
                        {product.availableColors?.slice(0, 3).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color?.hexCode || "#FFD700" }}
                            title={color?.name || "Gold"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/product/${product._id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                      <FiShoppingBag className="w-4 h-4" /> View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Add to cart logic
                      }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-gray-200 transition-all"
                    >
                      <FiShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // Loading state
  if (loading) return (
    <div className="min-h-screen pt-32 pb-40 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#d4b97d]/30 rounded-full animate-ping"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen pt-32 pb-40 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <FiXCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#b2965a] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#9c8146] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category ? `${category} Collection` : "All Products"}
          </h1>
          <p className="text-gray-600">
            {category 
              ? `Browse our premium collection of ${category.toLowerCase()} jewelry` 
              : 'Discover our complete range of premium jewelry'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              {/* Mobile Filter Header */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !category 
                        ? 'bg-[#b2965a] text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Products
                  </button>
                  {FIXED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.title}
                      onClick={() => handleCategoryChange(cat.title)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        category === cat.title
                          ? 'bg-[#b2965a] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Min</label>
                      <input
                        type="number"
                        value={priceFilter[0]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), priceFilter[1])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Max</label>
                      <input
                        type="number"
                        value={priceFilter[1]}
                        onChange={(e) => handlePriceChange(priceFilter[0], Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none"
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={priceFilter[0]}
                      onChange={(e) => handlePriceChange(Number(e.target.value), priceFilter[1])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={priceFilter[1]}
                      onChange={(e) => handlePriceChange(priceFilter[0], Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4">Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColors.includes(color.name)
                          ? 'border-[#b2965a]'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(priceFilter[0] > 0 || priceFilter[1] < 1000000 || selectedColors.length > 0) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">Active Filters</h4>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[#b2965a] hover:text-[#9c8146]"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(priceFilter[0] > 0 || priceFilter[1] < 1000000) && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        Price: ₹{priceFilter[0].toLocaleString()} - ₹{priceFilter[1].toLocaleString()}
                      </span>
                    )}
                    {selectedColors.map(color => (
                      <span key={color} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-gray-600 text-sm">
                  Showing <span className="font-bold text-gray-900">{products.length}</span> products
                  {totalProducts > 0 && (
                    <span> of <span className="font-bold text-gray-900">{totalProducts}</span></span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#b2965a] focus:ring-1 focus:ring-[#b2965a] outline-none appearance-none bg-white"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Mode */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                      title="Grid View"
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                      title="List View"
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or browse all products</p>
                <button
                  onClick={clearFilters}
                  className="bg-[#b2965a] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#9c8146] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <ProductListCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-lg font-medium ${
                          currentPage === pageNum
                            ? 'border-[#b2965a] bg-[#b2965a] text-white'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}