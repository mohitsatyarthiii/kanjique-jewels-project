import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { 
  FiFilter, 
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
  FiGrid,
  FiList,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiInfo,
  FiCheck
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Fixed categories for filter sidebar (icons removed)
const FIXED_CATEGORIES = [
  { title: "Rings", value: "Rings" },
  { title: "Bangles", value: "Bangles" },
  { title: "Necklaces", value: "Necklaces" },
  { title: "Earrings", value: "Earrings" },
  { title: "Bracelets", value: "Bracelets" },
  { title: "Pendants", value: "Pendants" },
  { title: "Anklets", value: "Anklets" },
  { title: "Mang Tikka", value: "Mang Tikka" },
  { title: "Nath", value: "Nath" }
];

// Color options for filter
const COLOR_OPTIONS = [
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
const SORT_OPTIONS = [
  { value: "newest", label: "New Arrivals", icon: <FiClock /> },
  { value: "popular", label: "Popular", icon: <FiTrendingUp /> },
  { value: "price-asc", label: "Price: Low to High", icon: <FiTrendingUp /> },
  { value: "price-desc", label: "Price: High to Low", icon: <FiTrendingUp className="rotate-180" /> },
  { value: "name-asc", label: "Name: A to Z", icon: <FiPackage /> },
  { value: "name-desc", label: "Name: Z to A", icon: <FiPackage className="rotate-180" /> }
];

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceFilter, setPriceFilter] = useState([0, 1000000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    subCategories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: { minPrice: 0, maxPrice: 1000000 }
  });
  const itemsPerPage = 12;

  // Fetch available filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get("/api/public/products/filters/available", {
          params: { category }
        });
        
        if (res.data.success) {
          setAvailableFilters(res.data.filters);
          // Set price filter range based on available products
          if (res.data.filters.priceRange) {
            setPriceFilter([
              res.data.filters.priceRange.minPrice || 0,
              res.data.filters.priceRange.maxPrice || 1000000
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };
    
    fetchFilters();
  }, [category]);

  // Fetch products based on category and filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use PUBLIC ROUTE for frontend
        let url = "/api/public/products";
        const params = {
          page: currentPage,
          limit: itemsPerPage
        };

        // Apply category filter
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
          // Take only first color for API filter
          params.color = selectedColors[0];
        }

        // Apply sort
        switch (sortBy) {
          case 'newest':
            params.sortBy = 'createdAt';
            params.sortOrder = 'desc';
            break;
          case 'popular':
            params.sortBy = 'isFeatured';
            params.sortOrder = 'desc';
            break;
          case 'price-asc':
            params.sortBy = 'minPrice';
            params.sortOrder = 'asc';
            break;
          case 'price-desc':
            params.sortBy = 'minPrice';
            params.sortOrder = 'desc';
            break;
          case 'name-asc':
            params.sortBy = 'title';
            params.sortOrder = 'asc';
            break;
          case 'name-desc':
            params.sortBy = 'title';
            params.sortOrder = 'desc';
            break;
          default:
            params.sortBy = 'createdAt';
            params.sortOrder = 'desc';
        }

        const res = await api.get(url, { params });
        console.log("Products API Response:", res.data);

        if (res.data.success) {
          // Debug: Check the structure of products data
          console.log("First product data:", res.data.products?.[0]);
          console.log("First product inStock value:", res.data.products?.[0]?.inStock);
          console.log("First product variants:", res.data.products?.[0]?.variants);
          
          setProducts(res.data.products || []);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalProducts(res.data.pagination.totalProducts || 0);
          }
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
  }, [category, currentPage, sortBy, priceFilter, selectedColors]);

  // Handle category change
  const handleCategoryChange = (cat) => {
    setCurrentPage(1);
    if (cat === 'all') {
      navigate('/products');
    } else {
      navigate(`/category/${cat}`);
    }
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
    setPriceFilter([
      availableFilters.priceRange.minPrice || 0,
      availableFilters.priceRange.maxPrice || 1000000
    ]);
    setSelectedColors([]);
    setSortBy("newest");
  };

  // Get product image
  const getProductImage = (product) => {
    if (product.mainImages && product.mainImages.length > 0 && product.mainImages[0].url) {
      return product.mainImages[0].url;
    }
    // Fallback image
    return "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
  };

  // Get stock status - Improved logic based on actual API response
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

  // Handle product click - navigate to product page by ID
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle add to cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic here
    console.log("Add to cart:", product._id);
    // You can implement cart functionality here
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
        <div 
          onClick={() => handleProductClick(product._id)}
          className="block cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-lg bg-white shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Badge Container */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
              {product.isFeatured && (
                <div className="px-3 py-1 bg-[#b2965a] text-white text-xs font-bold rounded-full shadow-lg">
                  <FiAward className="inline mr-1" /> Featured
                </div>
              )}
              {product.baseSalePrice && product.baseSalePrice < product.basePrice && (
                <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  {Math.round(((product.basePrice - product.baseSalePrice) / product.basePrice) * 100)}% OFF
                </div>
              )}
              
              {/* Stock Badge - Show only if out of stock */}
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

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to wishlist logic
              }}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#b2965a] hover:text-white transition-all duration-300"
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
                }}
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
                    handleProductClick(product._id);
                  }}
                  className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg flex items-center gap-2 hover:bg-[#b2965a] hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <FiEye className="w-5 h-5" /> Quick View
                </button>
              </motion.div>
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
                {product.shortDescription || "Premium quality jewelry piece."}
              </p>

              {/* Price */}
              <div className="mb-4">
                {getPriceDisplay(product)}
              </div>

              {/* Stock Status - Updated with Product Page Logic */}
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
                    <FiLayers className="w-3 h-3" />
                    {product.availableColors.length} colors
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProductClick(product._id);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <FiShoppingBag className="w-4 h-4" /> View Details
                </button>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={!stockStatus.inStock}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    stockStatus.inStock
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-[#b2965a]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={stockStatus.inStock ? "Add to Cart" : "Out of Stock"}
                >
                  <FiShoppingCart className="w-5 h-5" />
                </button>
              </div>
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
        <div 
          onClick={() => handleProductClick(product._id)}
          className="block cursor-pointer"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="md:w-48 md:h-48 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={getProductImage(product)}
                  alt={product.title || "Product"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
                  }}
                />
                
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
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#b2965a] transition-colors">
                      {product.title || "Untitled Product"}
                    </h3>
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
                      <div className="text-xs text-gray-500 mb-1">Available</div>
                      <div className="text-sm text-gray-700">
                        {stockStatus.inStock ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProductClick(product._id);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <FiShoppingBag className="w-4 h-4" /> View Details
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={!stockStatus.inStock}
                      className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                        stockStatus.inStock
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FiShoppingCart className="w-4 h-4" /> 
                      {stockStatus.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50 pt-30 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {category ? `${category} Collection` : "All Products"}
          </h1>
          <p className="text-gray-600">
            {category 
              ? `Browse our premium collection of ${category.toLowerCase()} jewelry` 
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
                  <span className="text-sm text-gray-500">{availableFilters.categories.length}</span>
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !category 
                        ? 'bg-[#b2965a] text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:pl-5'
                    }`}
                  >
                    All Products
                  </button>
                  {FIXED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                        category === cat.value
                          ? 'bg-[#b2965a] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:pl-5'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        category === cat.value ? 'bg-white' : 'bg-[#b2965a]'
                      }`}></span>
                      <span>{cat.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              

              {/* Colors - Professional Color Selector */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-4">Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
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

              {/* Active Filters - Professional Tags */}
              {(priceFilter[0] > (availableFilters.priceRange.minPrice || 0) || 
                priceFilter[1] < (availableFilters.priceRange.maxPrice || 1000000) || 
                selectedColors.length > 0) && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {(priceFilter[0] > (availableFilters.priceRange.minPrice || 0) || 
                      priceFilter[1] < (availableFilters.priceRange.maxPrice || 1000000)) && (
                      <span className="px-3 py-1.5 bg-[#b2965a]/10 text-[#b2965a] text-sm rounded-full border border-[#b2965a]/20 flex items-center gap-1">
                        <FiTag className="w-3 h-3" />
                        Price: ₹{priceFilter[0].toLocaleString()} - ₹{priceFilter[1].toLocaleString()}
                      </span>
                    )}
                    {selectedColors.map(color => (
                      <span key={color} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLOR_OPTIONS.find(c => c.name === color)?.hexCode || '#ccc' }}
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                  {category && (
                    <div className="mt-2">
                      <span className="text-xs px-3 py-1 bg-[#b2965a] text-white rounded-full font-medium">
                        {category}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Sort - Professional Select */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort by
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#b2965a] focus:ring-2 focus:ring-[#b2965a]/30 outline-none appearance-none bg-white min-w-[200px] shadow-sm"
                      >
                        {SORT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FiChevronLeft className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                    </div>
                  </div>

                  {/* View Mode - Professional Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      View
                    </label>
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
                  Try adjusting your filters or browse our complete collection
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={clearFilters}
                    className="bg-[#b2965a] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#9c8146] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="bg-white text-[#b2965a] border border-[#b2965a] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    Browse All Products
                  </button>
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