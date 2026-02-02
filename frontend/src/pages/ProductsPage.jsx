import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import api from "../utils/axiosInstance";
import {
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiShoppingBag,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
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
} from "lucide-react";
import AddToCart from "../components/addToCart/AddToCart";

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const { slug } = useParams();
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState({});
  const [priceFilter, setPriceFilter] = useState([0, 500000]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchQuery, setSearchQuery] = useState(query.get("q") || "");
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Categories for filter sidebar
  const categories = [
    {
      title: "Necklaces",
      category: "Necklaces",
      subcategories: [
        "Gold Necklaces",
        "Diamond Necklaces",
        "Chokers",
        "Bridal Necklaces",
        "Daily Wear Necklaces",
      ],
    },
    {
      title: "Earrings",
      category: "Earrings",
      subcategories: [
        "Stud Earrings",
        "Hoop Earrings",
        "Drop Earrings",
        "Jhumkas",
        "Diamond Earrings",
        "Gold Earrings",
      ],
    },
    {
      title: "Rings",
      category: "Rings",
      subcategories: [
        "Engagement Rings",
        "Wedding Rings",
        "Casual Rings",
        "Cocktail Rings",
        "Diamond Rings",
        "Gold Rings",
      ],
    },
    {
      title: "Bracelets",
      category: "Bracelets & Bangles",
      subcategories: [
        "Gold Bangles",
        "Diamond Bangles",
        "Bracelets",
        "Cuffs",
        "Kids Bangles",
      ],
    },
    {
      title: "Collections",
      category: "Collections",
      subcategories: [
        "Bridal Collection",
        "Festive Collection",
        "Daily Wear Collection",
        "Kids Collection",
        "Men's Collection",
      ],
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortBy,
          minPrice: priceFilter[0],
          maxPrice: priceFilter[1],
          search: searchQuery,
        };

        // Add category filter if active
        Object.keys(activeFilters).forEach((key) => {
          if (key.startsWith("category_")) {
            params.category = key.replace("category_", "");
          }
          if (key.startsWith("subcategory_")) {
            params.subcategory = key.replace("subcategory_", "");
          }
        });

        const res = await api.get("/api/products", { params });
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    sortBy,
    priceFilter,
    activeFilters,
    searchQuery,
    itemsPerPage,
  ]);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceFilter((prev) =>
      name === "min" ? [Number(value), prev[1]] : [prev[0], Number(value)],
    );
    setActiveFilters((prev) => ({ ...prev, price: true }));
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setActiveFilters((prev) => ({
      ...prev,
      [`category_${category}`]: true,
      ...Object.keys(prev).reduce((acc, key) => {
        if (key.startsWith("subcategory_")) delete acc[key];
        return acc;
      }, {}),
    }));
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleSubcategoryFilter = (subcategory) => {
    setActiveFilters((prev) => ({
      ...prev,
      [`subcategory_${subcategory}`]: true,
    }));
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setPriceFilter([0, 500000]);
    setActiveFilters({});
    setSortBy("featured");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const removeFilter = (key) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post("/api/cart", { productId, quantity: 1 });
      alert("Added to cart!");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate(`/login?next=/products`);
      } else {
        alert(err.response?.data?.error || "Failed to add to cart");
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-[#d4b97d]/30 rounded-full"></div>
            <Gem className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Loading Exquisite Collection
          </h3>
          <p className="text-gray-600">Curating premium jewelry pieces...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
      {/* Golden Blobs Background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/40 to-[#d4b97d]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/30 to-[#b2965a]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-6 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
                <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">
                  Premium Collection
                </span>
                <span className="w-6 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
                {searchQuery ? `Search: "${searchQuery}"` : "All Products"}
              </h1>
              <p className="text-gray-600">
                Discover our complete collection of exquisite jewelry pieces
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-white to-[#fef8e9] px-4 py-2 rounded-2xl border border-[#f4e6c3]">
              <Gem className="w-5 h-5 text-[#b2965a]" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {products.length} Items
                </div>
                <div className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(activeFilters).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 bg-[#fef8e9] text-[#b2965a] px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {key.replace(/_/g, " ")}
                  <button
                    onClick={() => removeFilter(key)}
                    className="hover:text-[#8c703f]"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
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
          className="lg:hidden fixed top-24 right-4 z-20 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
        >
          <FiFilter /> Filters
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="lg:w-80 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#f4e6c3] p-6 lg:sticky lg:top-32 h-fit lg:max-h-[calc(100vh-10rem)] overflow-y-auto"
              >
                {/* Close button for mobile */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-[#b2965a]"
                >
                  ✕
                </button>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFilter className="text-[#b2965a]" /> Filters
                  </h3>
                  {Object.keys(activeFilters).length > 0 && (
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
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Price Range
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">
                          Min
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="min"
                            value={priceFilter[0]}
                            onChange={handlePriceChange}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">
                          Max
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="max"
                            value={priceFilter[1]}
                            onChange={handlePriceChange}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
                            placeholder="500000"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <input
                        type="range"
                        min="0"
                        max="500000"
                        value={priceFilter[1]}
                        onChange={(e) =>
                          setPriceFilter([
                            priceFilter[0],
                            Number(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#b2965a]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹0</span>
                        <span>₹5,00,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="mb-8 pb-6 border-b border-[#f4e6c3]">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.title} className="relative">
                        <button
                          onClick={() => handleCategoryFilter(cat.category)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                            activeFilters[`category_${cat.category}`]
                              ? "bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] text-[#b2965a] font-semibold"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{cat.title}</span>
                          {activeFilters[`category_${cat.category}`] && (
                            <span className="w-2 h-2 bg-[#b2965a] rounded-full"></span>
                          )}
                        </button>

                        {/* Subcategories */}
                        <div className="ml-6 mt-2 space-y-1">
                          {cat.subcategories.map((subcat) => (
                            <button
                              key={subcat}
                              onClick={() => handleSubcategoryFilter(subcat)}
                              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                                activeFilters[`subcategory_${subcat}`]
                                  ? "bg-[#b2965a] text-white font-medium"
                                  : "text-gray-600 hover:text-[#b2965a] hover:bg-[#fef8e9]"
                              }`}
                            >
                              <span>{subcat}</span>
                              {activeFilters[`subcategory_${subcat}`] && (
                                <FiChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Sort By</h4>
                  <div className="space-y-2">
                    {["featured", "price-low", "price-high", "newest"].map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() => handleSortChange(option)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                            sortBy === option
                              ? "bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option === "featured" && "Featured"}
                          {option === "price-low" && "Price: Low to High"}
                          {option === "price-high" && "Price: High to Low"}
                          {option === "newest" && "Newest Arrivals"}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Items Per Page */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Items Per Page
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[12, 24, 48].map((count) => (
                      <button
                        key={count}
                        onClick={() => setItemsPerPage(count)}
                        className={`py-2 rounded-lg transition-all ${
                          itemsPerPage === count
                            ? "bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-medium"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {count}
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
            <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-[#f4e6c3]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-bold text-gray-900">
                      {Math.min(currentPage * itemsPerPage, products.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {products.length}
                    </span>{" "}
                    products
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
                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3]">
                        <Link to={`/product/${product._id}`}>
                          <img
                            src={
                              product.images[0]?.url ||
                              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"
                            }
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </Link>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:text-[#ff6b6b] transition-colors">
                            <FiShoppingBag className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                            {product.category}
                          </span>
                        </div>

                        <Link to={`/product/${product._id}`}>
                          <h3 className="font-serif text-lg font-bold text`-gray-900 mb-2 line-clamp-1 group-hover:text-[#b2965a] transition-colors">
                            {product.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description ||
                            "Premium quality jewelry piece with exquisite craftsmanship"}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {renderStars(product.rating || 4)}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.reviewCount || 24})
                          </span>
                        </div>

                        {/* Add to Cart Button */}

                       <AddToCart 
  productId={product._id}
  productSlug={product.slug}
  showQuantity={true}
  showViewDetails={false}
  className="mt-3"
/>
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
                        <Link to={`/product/${product.slug}`}>
                          <img
                            src={
                              product.images[0]?.url ||
                              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"
                            }
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </Link>
                        <div className="absolute top-2 left-2">
                          <span className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-2 py-1 rounded-full text-xs font-bold">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                          <div>
                            <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                              {product.category}
                            </span>
                            <Link to={`/product/${product.slug}`}>
                              <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#b2965a] transition-colors">
                                {product.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 mb-4">
                              {product.description ||
                                "Premium quality jewelry piece with exquisite craftsmanship. Perfect for special occasions."}
                            </p>
                          </div>

                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              ₹{product.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 justify-center md:justify-end">
                              {renderStars(product.rating || 4)}
                              <span className="text-sm text-gray-500">
                                ({product.reviewCount || 24})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <Crown className="w-3 h-3" /> Premium
                          </span>
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
                          <button
                            onClick={() => handleAddToCart(product._id)}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <FiShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </button>
                          <Link
                            to={`/product/${product.slug}`}
                            className="px-6 py-3 rounded-xl border-2 border-[#b2965a] text-[#b2965a] font-semibold hover:bg-[#fef8e9] transition-colors flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
