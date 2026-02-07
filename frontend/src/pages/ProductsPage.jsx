import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/axiosInstance";
import {
  FiFilter,
  FiStar,
  FiShoppingBag,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
  FiHeart,
  FiEye,
  FiShoppingCart
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Gem,
  Crown,
  Package,
  Truck,
  Shield,
  Zap,
  Award,
  Clock,
  TrendingUp
} from "lucide-react";
import AddToCart from "../components/addToCart/AddToCart";

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const itemsPerPage = 12;

  // Categories for filter sidebar
  const categories = [
    { value: "Rings", label: "Rings", icon: "💍" },
    { value: "Bangles", label: "Bangles", icon: "🔗" },
    { value: "Necklaces", label: "Necklaces", icon: "📿" },
    { value: "Earrings", label: "Earrings", icon: "✨" },
    { value: "Bracelets", label: "Bracelets", icon: "💫" },
    { value: "Pendants", label: "Pendants", icon: "🔶" },
    { value: "Anklets", label: "Anklets", icon: "👣" },
    { value: "Mang Tikka", label: "Mang Tikka", icon: "👑" },
    { value: "Nath", label: "Nath", icon: "👃" }
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
    { name: "Emerald Green", hexCode: "#50C878" }
  ];

  // Sort options
  const sortOptions = [
    { value: "newest", label: "New Arrivals", icon: <Clock className="w-4 h-4" /> },
    { value: "price-asc", label: "Price: Low to High", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "price-desc", label: "Price: High to Low", icon: <TrendingUp className="w-4 h-4 rotate-180" /> },
    { value: "popular", label: "Popular", icon: <Award className="w-4 h-4" /> }
  ];

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          minPrice: priceFilter[0] > 0 ? priceFilter[0] : undefined,
          maxPrice: priceFilter[1] < 500000 ? priceFilter[1] : undefined,
        };

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
        }

        // Apply category filter
        if (selectedCategories.length > 0) {
          params.category = selectedCategories.join(',');
        }

        // Apply color filter
        if (selectedColors.length > 0) {
          params.color = selectedColors[0]; // Backend supports single color filter
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
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
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
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setPriceFilter([0, 500000]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSortBy("newest");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getPriceDisplay = (product) => {
    const basePrice = product.basePrice || 0;
    const salePrice = product.baseSalePrice || product.displayPrice;
    
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

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-3 h-3 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <Gem className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Loading Exquisite Collection
          </h3>
          <p className="text-gray-600">Curating premium jewelry pieces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-24 pb-40">
      {/* Luxury Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
                <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">
                  Premium Collection
                </span>
                <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                {searchQuery ? `Search: "${searchQuery}"` : "Exquisite Jewelry"}
              </h1>
              <p className="text-gray-600">
                Discover {totalProducts} premium jewelry pieces crafted with perfection
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jewelry..."
                  className="w-full md:w-80 px-4 py-3 pl-12 bg-white/90 backdrop-blur-sm border border-[#f4e6c3] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b2965a]/20 focus:border-[#b2965a]"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 || selectedColors.length > 0 || priceFilter[0] > 0 || priceFilter[1] < 500000) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategories.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-2 bg-[#fef8e9] text-[#b2965a] px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {cat}
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className="hover:text-[#8c703f]"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedColors.map(color => (
                <span
                  key={color}
                  className="inline-flex items-center gap-2 bg-[#fef8e9] text-[#b2965a] px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {color}
                  <button
                    onClick={() => handleColorToggle(color)}
                    className="hover:text-[#8c703f]"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(priceFilter[0] > 0 || priceFilter[1] < 500000) && (
                <span className="inline-flex items-center gap-2 bg-[#fef8e9] text-[#b2965a] px-3 py-1.5 rounded-full text-sm font-medium">
                  Price: ₹{priceFilter[0].toLocaleString()} - ₹{priceFilter[1].toLocaleString()}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-[#b2965a] font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden fixed top-24 right-4 z-20 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-30"
        >
          <FiFilter /> Filters
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="lg:w-80 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-[#f4e6c3] p-6 lg:sticky lg:top-24 h-fit lg:max-h-[calc(100vh-8rem)] overflow-y-auto z-20"
              >
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-[#b2965a]"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFilter className="text-[#b2965a]" /> Filters
                  </h3>
                  {(selectedCategories.length > 0 || selectedColors.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[#b2965a] hover:text-[#8c703f] mb-4"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* Price Filter */}
                <div className="mb-8 pb-6 border-b border-[#f4e6c3]">
                  <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Min</label>
                        <input
                          type="number"
                          value={priceFilter[0]}
                          onChange={(e) => handlePriceChange(Number(e.target.value), priceFilter[1])}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Max</label>
                        <input
                          type="number"
                          value={priceFilter[1]}
                          onChange={(e) => handlePriceChange(priceFilter[0], Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
                          placeholder="500000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="mb-8 pb-6 border-b border-[#f4e6c3]">
                  <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryToggle(cat.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                          selectedCategories.includes(cat.value)
                            ? "bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] text-[#b2965a] font-semibold"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.label}</span>
                        {selectedCategories.includes(cat.value) && (
                          <span className="ml-auto w-2 h-2 bg-[#b2965a] rounded-full"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors Filter */}
                <div className="mb-8 pb-6 border-b border-[#f4e6c3]">
                  <h4 className="font-semibold text-gray-900 mb-4">Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorToggle(color.name)}
                        className={`relative group ${
                          selectedColors.includes(color.name)
                            ? "scale-110"
                            : ""
                        }`}
                        title={color.name}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 ${
                            selectedColors.includes(color.name)
                              ? "border-[#b2965a] shadow-lg"
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color.hexCode }}
                        />
                        {selectedColors.includes(color.name) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#b2965a] rounded-full flex items-center justify-center">
                            <FiX className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Sort By</h4>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                          sortBy === option.value
                            ? "bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1">
            {/* Controls Bar */}
            <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-[#f4e6c3]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">
                    Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
                    <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalProducts)}</span> of{" "}
                    <span className="font-bold text-gray-900">{totalProducts}</span> products
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">View:</span>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#fef8e9] text-[#b2965a]" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <FiGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#fef8e9] text-[#b2965a]" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <FiList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
                  <Gem className="w-12 h-12 text-[#b2965a]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#fef8e9] shadow-lg border border-[#f4e6c3] transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
                      {/* Product Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                        {product.isFeatured && (
                          <div className="px-3 py-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Featured
                          </div>
                        )}
                        {product.hasDiscount && (
                          <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                            {Math.round(((product.basePrice - product.displayPrice) / product.basePrice) * 100)}% OFF
                          </div>
                        )}
                        {!product.inStock && (
                          <div className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors">
                        <FiHeart className="w-4 h-4" />
                      </button>

                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3]">
                        <Link to={`/product/${product._id}`}>
                          <img
                            src={product.mainImages?.[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80";
                            }}
                          />
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {product.brand}
                            </span>
                          )}
                        </div>

                        <Link to={`/product/${product._id}`}>
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#b2965a] transition-colors">
                            {product.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                          {product.shortDescription || "Premium quality jewelry piece with exquisite craftsmanship"}
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
                          {product.availableColors?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Palette className="w-3 h-3" />
                              {product.availableColors.length} colors
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <AddToCart 
                            productId={product._id}
                            product={product}
                            className="flex-1 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                          >
                            <FiShoppingCart className="w-4 h-4" /> Add to Cart
                          </AddToCart>
                          <Link
                            to={`/product/${product._id}`}
                            className="w-10 h-10 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:text-[#b2965a] transition-all duration-300"
                            title="View Details"
                          >
                            <FiEye className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg hover:shadow-xl transition-all duration-300">
                      {/* Product Image */}
                      <div className="md:w-48 md:h-48 relative rounded-xl overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3]">
                        <Link to={`/product/${product._id}`}>
                          <img
                            src={product.mainImages?.[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </Link>
                        {product.isFeatured && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-2 py-1 rounded-full text-xs font-bold">
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                                {product.category}
                              </span>
                              {product.brand && (
                                <span className="text-xs text-gray-500">{product.brand}</span>
                              )}
                            </div>
                            <Link to={`/product/${product._id}`}>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#b2965a] transition-colors">
                                {product.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {product.shortDescription || "Premium quality jewelry piece with exquisite craftsmanship"}
                            </p>
                          </div>

                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="mb-2">
                              {getPriceDisplay(product)}
                            </div>
                            <div className="flex items-center gap-1 justify-center md:justify-end">
                              {renderStars()}
                              <span className="text-sm text-gray-500">
                                (4.5)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <Shield className="w-3 h-3" /> Authentic
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <Truck className="w-3 h-3" /> Free Shipping
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <Package className="w-3 h-3" /> Gift Packaging
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <AddToCart 
                            productId={product._id}
                            product={product}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <FiShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </AddToCart>
                          <Link
                            to={`/product/${product._id}`}
                            className="px-6 py-3 rounded-xl border-2 border-[#b2965a] text-[#b2965a] font-semibold hover:bg-[#fef8e9] transition-colors flex items-center gap-2"
                          >
                            <FiEye className="w-4 h-4" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
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
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-bold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Add missing icon
const Palette = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12h4a2 2 0 012 2 4 4 0 01-4 4H7z" />
  </svg>
);