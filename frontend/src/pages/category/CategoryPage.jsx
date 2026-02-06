import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { FiFilter, FiChevronDown, FiChevronUp, FiStar, FiShoppingBag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryPage() {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [priceFilter, setPriceFilter] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Categories for filter sidebar
  const categories = [
    {
      title: "Necklaces",
      subcategories: ["Gold Necklaces", "Diamond Necklaces", "Chokers", "Bridal Necklaces", "Daily Wear Necklaces"]
    },
    {
      title: "Earrings",
      subcategories: ["Stud Earrings", "Hoop Earrings", "Drop Earrings", "Jhumkas", "Diamond Earrings", "Gold Earrings"]
    },
    {
      title: "Rings",
      subcategories: ["Engagement Rings", "Wedding Rings", "Casual Rings", "Cocktail Rings", "Diamond Rings", "Gold Rings"]
    },
    {
      title: "Bracelets",
      subcategories: ["Gold Bangles", "Diamond Bangles", "Bracelets", "Cuffs", "Kids Bangles"]
    },
    {
      title: "Collections",
      subcategories: ["Bridal Collection", "Festive Collection", "Daily Wear Collection", "Kids Collection", "Men's Collection"]
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api", {
          params: { category, subcategory },
        });
        setProducts(res.data.products);

        const suggested = res.data.products.filter(
          (p) =>
            p.category.includes(category) &&
            (!subcategory || p.category.includes(subcategory))
        ).slice(0, 5);
        setSuggestions(suggested);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, subcategory]);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceFilter((prev) =>
      name === "min" ? [Number(value), prev[1]] : [prev[0], Number(value)]
    );
    setActiveFilters(prev => ({ ...prev, price: true }));
  };

  const handleCategoryFilter = (cat) => {
    navigate(`/category/${cat}`);
    setShowFilters(false);
  };

  const handleSubcategoryFilter = (subcat) => {
    navigate(`/category/${category}/${subcat}`);
    setShowFilters(false);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    let sorted = [...products];
    switch(sort) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    setProducts(sorted);
  };

  const handleBuyNow = (e, productId) => {
    e.preventDefault();
    // Add to cart logic here
    console.log("Buy Now:", productId);
    navigate(`/product/${productId}`);
  };

  const filteredProducts = products.filter(
    (p) => p.price >= priceFilter[0] && p.price <= priceFilter[1]
  );

  const clearFilters = () => {
    setPriceFilter([0, 500000]);
    setActiveFilters({});
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-40">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-[#d4b97d]/30 rounded-full"></div>
      </div>
    </div>
  );

  if (!products.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-32 pb-40 px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
          <FiShoppingBag className="w-12 h-12 text-[#b2965a]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">No Products Found</h2>
        <p className="text-gray-600 mb-8">We couldn't find any products in this category</p>
        <Link 
          to="/" 
          className="inline-block bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/20 pt-32 pb-40 relative overflow-hidden">
      {/* Decorative Golden Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/40 to-[#d4b97d]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/30 to-[#b2965a]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#d4b97d]/20 to-[#f4e6c3]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Category Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-6 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Premium Collection</span>
            <span className="w-6 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-3">
            {category} {subcategory && <span className="text-[#b2965a]">· {subcategory}</span>}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our exquisite collection of handcrafted {category.toLowerCase()} jewelry, designed for elegance and sophistication.
          </p>
        </div>

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
                  <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Min</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
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
                        <label className="block text-sm text-gray-600 mb-1">Max</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
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
                        onChange={(e) => setPriceFilter([priceFilter[0], Number(e.target.value)])}
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
                  <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.title} className="relative">
                        <button
                          onClick={() => handleCategoryFilter(cat.title)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                            category === cat.title
                              ? 'bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] text-[#b2965a] font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span>{cat.title}</span>
                          {category === cat.title && (
                            <span className="w-2 h-2 bg-[#b2965a] rounded-full"></span>
                          )}
                        </button>
                        
                        {/* Subcategories for active category */}
                        {category === cat.title && (
                          <div className="ml-6 mt-2 space-y-1">
                            {cat.subcategories.map((subcat) => (
                              <button
                                key={subcat}
                                onClick={() => handleSubcategoryFilter(subcat)}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                                  subcategory === subcat
                                    ? 'bg-[#b2965a] text-white font-medium'
                                    : 'text-gray-600 hover:text-[#b2965a] hover:bg-[#fef8e9]'
                                }`}
                              >
                                <span>{subcat}</span>
                                {subcategory === subcat && (
                                  <FiChevronUp className="w-4 h-4" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Sort By</h4>
                  <div className="space-y-2">
                    {["featured", "price-low", "price-high", "newest"].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                          sortBy === option
                            ? 'bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option === "featured" && "Featured"}
                        {option === "price-low" && "Price: Low to High"}
                        {option === "price-high" && "Price: High to Low"}
                        {option === "newest" && "Newest Arrivals"}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1">
            {/* Stats Bar */}
            <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-[#f4e6c3]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">
                    Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of{" "}
                    <span className="font-bold text-gray-900">{products.length}</span> products
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    {activeFilters.price && (
                      <span className="px-3 py-1 bg-[#fef8e9] text-[#b2965a] rounded-full text-sm flex items-center gap-1">
                        Price: ₹{priceFilter[0]} - ₹{priceFilter[1]}
                        <button onClick={() => setPriceFilter([0, 500000])} className="ml-1 hover:text-[#8c703f]">
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group relative"
                >
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#fef8e9] shadow-lg border border-[#f4e6c3] transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
                      {/* Product Image */}
                      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3]">
                        <img
                          src={product.images[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Quick Buy Button */}
                        <button
                          onClick={(e) => handleBuyNow(e, product._id)}
                          className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 group-hover:bottom-6 hover:shadow-xl hover:scale-105 z-10"
                        >
                          <FiShoppingBag className="inline mr-2" />
                          Buy Now
                        </button>
                        
                        {/* Price Tag */}
                        <div className="absolute text-sm top-4 right-4 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-2 py-1 rounded-full shadow-lg">
                          ₹{product.price.toLocaleString()}
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow">
                          <FiStar className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold">4.8</span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-serif text-md font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#b2965a] transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-xs mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {/* Features */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            In Stock
                          </span>
                          
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Suggestions Section */}
            {suggestions.length > 0 && (
              <section className="mt-20 pt-12 border-t border-[#f4e6c3]">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">
                    You Might Also Like
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Complete your look with these stunning pieces from our collection
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {suggestions.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug}`}
                      className="group relative bg-white rounded-2xl shadow-lg border border-[#f4e6c3] overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] overflow-hidden">
                        <img
                          src={product.images[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                          {product.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#b2965a]">
                            ₹{product.price.toLocaleString()}
                          </span>
                          <button className="w-8 h-8 bg-[#fef8e9] rounded-full flex items-center justify-center hover:bg-[#b2965a] hover:text-white transition-all">
                            <FiShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
                  <FiFilter className="w-12 h-12 text-[#b2965a]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Match Your Filters</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to find what you're looking for</p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}