import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/axiosInstance";
import {
  FiFilter,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiPackage,
  FiInfo,
  FiCheck
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceFilter, setPriceFilter] = useState([0, 500000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState(query.get("q") || "");
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    subCategories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: { minPrice: 0, maxPrice: 500000 }
  });
  const itemsPerPage = 30;

  // Categories for filter sidebar (icons removed)
  const categories = [
    { value: "Rings", label: "Rings" },
    { value: "Bangles", label: "Bangles" },
    { value: "Necklaces", label: "Necklaces" },
    { value: "Earrings", label: "Earrings" },
    { value: "Bracelets", label: "Bracelets" },
    { value: "Pendants", label: "Pendants" },
    { value: "Anklets", label: "Anklets" },
    { value: "Mang Tikka", label: "Mang Tikka" },
    { value: "Nath", label: "Nath" }
  ];

  // Color options
  const colorOptions = [
    { name: "Gold", hexCode: "#FFD700" },
    { name: "Rose Gold", hexCode: "#B76E79" },
    { name: "White Gold", hexCode: "#F5F5F5" },
    { name: "Silver", hexCode: "#C0C0C0" },
    { name: "Platinum", hexCode: "#E5E4E2" },
    { name: "Diamond White", hexCode: "#FFFFFF" },
    { name: "Ruby Red", hexCode: "#E0115F" },
    { name: "Emerald Green", hexCode: "#50C878" },
    { name: "Sapphire Blue", hexCode: "#0F52BA" },
    { name: "Black", hexCode: "#000000" }
  ];

  // Sort options
  const sortOptions = [
    { value: "newest", label: "New Arrivals", icon: <FiClock className="w-4 h-4" /> },
    { value: "price-asc", label: "Price: Low to High", icon: <FiTrendingUp className="w-4 h-4" /> },
    { value: "price-desc", label: "Price: High to Low", icon: <FiTrendingUp className="w-4 h-4 rotate-180" /> },
    { value: "popular", label: "Popular", icon: <FiAward className="w-4 h-4" /> },
    { value: "name-asc", label: "Name: A to Z", icon: <FiPackage className="w-4 h-4" /> },
    { value: "name-desc", label: "Name: Z to A", icon: <FiPackage className="w-4 h-4 rotate-180" /> }
  ];

  // Fetch available filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get("/api/public/products/filters/available");
        if (res.data.success) {
          setAvailableFilters(res.data.filters);
          // Set price filter range based on available products
          if (res.data.filters.priceRange) {
            setPriceFilter([
              res.data.filters.priceRange.minPrice || 0,
              res.data.filters.priceRange.maxPrice || 500000
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };
    
    fetchFilters();
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };

        // Apply search query
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Apply price filter
        if (priceFilter[0] > 0 || priceFilter[1] < 500000) {
          params.minPrice = priceFilter[0];
          params.maxPrice = priceFilter[1];
        }

        // Apply sorting
        if (sortBy === "newest") {
          params.sortBy = "createdAt";
          params.sortOrder = "desc";
        } else if (sortBy === "popular") {
          params.sortBy = "isFeatured";
          params.sortOrder = "desc";
        } else if (sortBy === "price-asc") {
          params.sortBy = "minPrice";
          params.sortOrder = "asc";
        } else if (sortBy === "price-desc") {
          params.sortBy = "minPrice";
          params.sortOrder = "desc";
        } else if (sortBy === "name-asc") {
          params.sortBy = "title";
          params.sortOrder = "asc";
        } else if (sortBy === "name-desc") {
          params.sortBy = "title";
          params.sortOrder = "desc";
        }

        // Apply category filter
        if (selectedCategories.length > 0) {
          params.category = selectedCategories[0]; // Take first category for API
        }

        // Apply color filter
        if (selectedColors.length > 0) {
          params.color = selectedColors[0]; // Take first color for API
        }

        console.log("Fetching products with params:", params);
        
        // Use public products endpoint
        const res = await api.get("/api/public/products", { params });
        console.log("Products response:", res.data);
        
        if (res.data.success) {
          setProducts(res.data.products || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalProducts(res.data.pagination?.totalProducts || 0);
        } else {
          throw new Error(res.data.error || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, sortBy, priceFilter, selectedCategories, selectedColors, searchQuery]);

  const handlePriceChange = (min, max) => {
    setPriceFilter([min, max]);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setCurrentPage(1);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setPriceFilter([
      availableFilters.priceRange.minPrice || 0,
      availableFilters.priceRange.maxPrice || 500000
    ]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSortBy("newest");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Get product image
  const getProductImage = (product) => {
    if (product.mainImages && product.mainImages.length > 0 && product.mainImages[0].url) {
      return product.mainImages[0].url;
    }
    return "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
  };

  // Get stock status - Same logic as category page
  const getStockStatus = (product) => {
    console.log("Checking stock for product:", product._id, product.title);
    console.log("Product data:", {
      inStock: product.inStock,
      totalStock: product.totalStock,
      variants: product.variants,
      stockQuantity: product.stockQuantity
    });
    
    // First, check if product has direct inStock field
    if (typeof product.inStock !== 'undefined') {
      console.log("Using direct inStock field:", product.inStock);
      return {
        inStock: product.inStock,
        quantity: product.totalStock || product.stockQuantity || 0,
        isLow: (product.totalStock || product.stockQuantity || 0) < 10 && 
               (product.totalStock || product.stockQuantity || 0) > 0
      };
    }
    
    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      // Calculate total stock from all variants
      const totalVariantStock = product.variants.reduce((total, variant) => {
        return total + (variant.stockQuantity || 0);
      }, 0);
      
      // Check if any variant has stock
      const hasStock = product.variants.some(variant => (variant.stockQuantity || 0) > 0);
      
      console.log("Using variant stock calculation:", { hasStock, totalVariantStock });
      
      return {
        inStock: hasStock,
        quantity: totalVariantStock,
        isLow: totalVariantStock < 10 && totalVariantStock > 0,
        variantStock: product.variants.map(v => ({
          color: v.color?.name || 'N/A',
          size: v.size || 'N/A',
          stock: v.stockQuantity || 0,
          inStock: (v.stockQuantity || 0) > 0
        }))
      };
    }
    
    // If no inStock field and no variants, assume in stock for display
    console.log("No stock data found, assuming in stock");
    return {
      inStock: true,
      quantity: 100, // Default value
      isLow: false
    };
  };

  // Get price display
  const getPriceDisplay = (product) => {
    const basePrice = product.basePrice || product.displayPrice || 0;
    const salePrice = product.baseSalePrice || (product.displayPrice !== basePrice ? product.displayPrice : null);
    
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

  // Modern Product Card Component (Grid View)
  const ProductCard = ({ product, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const stockStatus = getStockStatus(product);

    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group"
      >
        <div className="relative overflow-hidden rounded-lg bg-white shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Badge Container */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isFeatured && (
              <div className="px-3 py-1 bg-[#b2965a] text-white text-xs font-bold rounded-full shadow-lg">
                Featured
              </div>
            )}
            {product.baseSalePrice && product.baseSalePrice < product.basePrice && (
              <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                {Math.round(((product.basePrice - product.baseSalePrice) / product.basePrice) * 100)}% OFF
              </div>
            )}
            
            {/* Stock Badge - Show only if out of stock or low stock */}
            {!stockStatus.inStock && (
              <div className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full shadow-lg">
                Out of Stock
              </div>
            )}
            
            {/* Low Stock Badge */}
            {stockStatus.inStock && stockStatus.isLow && (
              <div className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                Only {stockStatus.quantity} left
              </div>
            )}
          </div>

          {/* Product Image */}
          <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <Link to={`/product/${product._id}`}>
              <motion.img
                src={getProductImage(product)}
                alt={product.title || "Product"}
                className="w-full h-full object-cover"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
                }}
              />
            </Link>
            
            {/* Quick View Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <Link
                to={`/product/${product._id}`}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg flex items-center gap-2 hover:bg-[#b2965a] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                <FiEye className="w-5 h-5" /> Quick View
              </Link>
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
            <Link to={`/product/${product._id}`}>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 hover:text-[#b2965a] transition-colors duration-300">
                {product.title || "Untitled Product"}
              </h3>
            </Link>

            {/* Short Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
              {product.shortDescription || "Premium quality jewelry piece."}
            </p>

            {/* Price */}
            <div className="mb-4">
              {getPriceDisplay(product)}
            </div>

            {/* Stock Status - Updated with proper logic */}
            <div className="flex items-center justify-between mb-4">
              <div className={`text-xs px-2 py-1 rounded-full ${
                stockStatus.inStock 
                  ? stockStatus.isLow 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {!stockStatus.inStock ? 'Out of Stock' : 
                 stockStatus.isLow ? `Only ${stockStatus.quantity} left` : 'In Stock'}
              </div>
              {product.availableColors?.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{product.availableColors.length} colors</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
           <div className="flex gap-4">
  <Link
    to={`/product/${product._id}`}
    className="w-full bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:scale-[1.02]"
  >
    <FiEye className="w-4 h-4" /> View Details
  </Link>
</div>

          </div>
        </div>
      </motion.div>
    );
  };

  // List View Product Component
  const ProductListCard = ({ product, index }) => {
    const stockStatus = getStockStatus(product);

    return (
      <motion.div
        key={product._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-48 md:h-48 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <Link to={`/product/${product._id}`}>
                <img
                  src={getProductImage(product)}
                  alt={product.title || "Product"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
                  }}
                />
              </Link>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isFeatured && (
                  <div className="px-2 py-1 bg-[#b2965a] text-white text-xs font-bold rounded">
                    Featured
                  </div>
                )}
                {product.baseSalePrice && product.baseSalePrice < product.basePrice && (
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    {Math.round(((product.basePrice - product.baseSalePrice) / product.basePrice) * 100)}% OFF
                  </div>
                )}
              </div>
              
              {/* Stock Badge */}
              {!stockStatus.inStock && (
                <div className="absolute bottom-3 left-3">
                  <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    Out of Stock
                  </div>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 p-6">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                      {product.category || "Jewelry"}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-gray-500">{product.brand}</span>
                    )}
                  </div>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#b2965a] transition-colors">
                      {product.title || "Untitled Product"}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {product.shortDescription || "Premium quality jewelry piece."}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Price</div>
                    {getPriceDisplay(product)}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stock Status</div>
                    <div className={`text-sm font-medium ${
                      stockStatus.inStock 
                        ? stockStatus.isLow 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {!stockStatus.inStock ? 'Out of Stock' : 
                       stockStatus.isLow ? `Low Stock (${stockStatus.quantity})` : 'In Stock'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Category</div>
                    <div className="text-sm text-gray-700">
                      {product.subCategory || "General"}
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
                      {product.availableColors?.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{product.availableColors.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
  <Link
    to={`/product/${product._id}`}
    className="w-full bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:scale-[1.02]"
  >
    <FiEye className="w-4 h-4" /> View Details
  </Link>
</div>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#d4b97d]/30 rounded-full animate-ping"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <FiInfo className="w-10 h-10 text-red-500" />
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
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
          </h1>
          <p className="text-gray-600">
            {searchQuery 
              ? `Browse products matching "${searchQuery}"` 
              : 'Discover our complete range of premium jewelry'}
            <span className="block text-sm text-gray-500 mt-1">
              {totalProducts} products available
            </span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Professional UI */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#b2965a] hover:text-[#9c8146] font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Categories - Icons removed */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <span>Categories</span>
                  <span className="text-sm text-gray-500">{categories.length}</span>
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategories([])}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategories.length === 0
                        ? 'bg-[#b2965a] text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:pl-5'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryToggle(cat.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                        selectedCategories.includes(cat.value)
                          ? 'bg-[#b2965a] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:pl-5'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        selectedCategories.includes(cat.value) ? 'bg-white' : 'bg-[#b2965a]'
                      }`}></span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range - Professional Slider */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">₹{priceFilter[0].toLocaleString()}</span>
                    <span className="font-medium text-gray-700">₹{priceFilter[1].toLocaleString()}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="absolute h-2 bg-[#b2965a] rounded-full"
                        style={{
                          left: `${((priceFilter[0] - (availableFilters.priceRange.minPrice || 0)) / 
                                 ((availableFilters.priceRange.maxPrice || 500000) - (availableFilters.priceRange.minPrice || 0))) * 100}%`,
                          right: `${100 - ((priceFilter[1] - (availableFilters.priceRange.minPrice || 0)) / 
                                  ((availableFilters.priceRange.maxPrice || 500000) - (availableFilters.priceRange.minPrice || 0))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min={availableFilters.priceRange.minPrice || 0}
                      max={availableFilters.priceRange.maxPrice || 500000}
                      value={priceFilter[0]}
                      onChange={(e) => handlePriceChange(Number(e.target.value), priceFilter[1])}
                      className="absolute w-full h-2 bg-transparent pointer-events-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#b2965a] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <input
                      type="range"
                      min={availableFilters.priceRange.minPrice || 0}
                      max={availableFilters.priceRange.maxPrice || 500000}
                      value={priceFilter[1]}
                      onChange={(e) => handlePriceChange(priceFilter[0], Number(e.target.value))}
                      className="absolute w-full h-2 bg-transparent pointer-events-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#b2965a] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Colors - Professional Color Selector */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4">Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorToggle(color.name)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        selectedColors.includes(color.name)
                          ? 'border-[#b2965a] scale-110 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    >
                      {selectedColors.includes(color.name) && (
                        <FiCheck className="absolute inset-0 m-auto w-4 h-4 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort - Professional Select */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Sort By</h4>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                        sortBy === option.value
                          ? 'bg-[#b2965a] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:pl-5'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Professional Layout */}
          <div className="flex-1">
            {/* Toolbar - Professional Design */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col">
                  <div className="text-gray-600 text-sm">
                    Showing <span className="font-bold text-gray-900">{Math.min(itemsPerPage, products.length)}</span> of{" "}
                    <span className="font-bold text-gray-900">{totalProducts}</span> products
                  </div>
                  {(selectedCategories.length > 0 || selectedColors.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCategories.map(cat => (
                        <span key={cat} className="text-xs px-3 py-1 bg-[#b2965a] text-white rounded-full font-medium">
                          {cat}
                        </span>
                      ))}
                      {selectedColors.map(color => (
                        <span key={color} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Search - Professional Input */}
                  <form onSubmit={handleSearch} className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#b2965a] focus:ring-2 focus:ring-[#b2965a]/30 outline-none bg-white min-w-[250px] shadow-sm"
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* View Mode - Professional Toggle */}
                  <div>
                    <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded transition-all duration-200 ${
                          viewMode === "grid" 
                            ? "bg-white shadow-sm text-[#b2965a]" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        title="Grid View"
                      >
                        <FiGrid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition-all duration-200 ${
                          viewMode === "list" 
                            ? "bg-white shadow-sm text-[#b2965a]" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        title="List View"
                      >
                        <FiList className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiPackage className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? `No products found for "${searchQuery}". Try a different search term or browse all products.`
                    : 'Try adjusting your filters or browse our complete collection'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={clearFilters}
                    className="bg-[#b2965a] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#9c8146] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Clear All Filters
                  </button>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="bg-white text-[#b2965a] border border-[#b2965a] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      Browse All Products
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {products.map((product, index) => (
                  <ProductListCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}

            {/* Pagination - Professional Design */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-bold text-gray-900">{currentPage}</span> of{" "}
                    <span className="font-bold text-gray-900">{totalPages}</span>
                  </div>
                  
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
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
                          className={`w-10 h-10 flex items-center justify-center border rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow ${
                            currentPage === pageNum
                              ? 'border-[#b2965a] bg-[#b2965a] text-white hover:bg-[#9c8146]'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-gray-400">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}