// components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiChevronDown, FiClock } from "react-icons/fi";
import api from "../utils/axiosInstance";

const SearchBar = ({ isGlass = false, onCloseMobileMenu = null }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const searchRef = useRef();

  // Load all products from API on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/products");
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllProducts();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (searchTerm) => {
    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Filter products based on query
  const filterProducts = (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase().trim();
    
    // Filter products by title, category, or tags
    const filtered = allProducts.filter(product => {
      return (
        product.title?.toLowerCase().includes(queryLower) ||
        product.category?.toLowerCase().includes(queryLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ||
        product.description?.toLowerCase().includes(queryLower)
      );
    }).slice(0, 8); // Limit to 8 suggestions
    
    setSuggestions(filtered);
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      filterProducts(query);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query, allProducts]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery("");
      if (onCloseMobileMenu) onCloseMobileMenu();
    }
  };

  const handleProductClick = (productId, productSlug) => {
    saveRecentSearch(query.trim());
    // Navigate to single product page using product ID or slug
    navigate(`/product/${productId || productSlug}`);
    setShowSuggestions(false);
    setQuery("");
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowSuggestions(false);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Get popular products for trending section
  const getPopularProducts = () => {
    // Sort by some criteria (you can modify this based on your data)
    return [...allProducts]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 4);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query || recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Search diamonds, gold, collections..."
          className={[
            "w-full h-11 px-5 pr-12 text-sm rounded-full border transition-all font-sans",
            isGlass
              ? "bg-white/90 backdrop-blur-sm border-white/30 text-black placeholder:text-black/60 focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3]"
              : "bg-white border-gray-200 text-black placeholder:text-gray-500 focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3]",
          ].join(" ")}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
        >
          <FiSearch
            className={[
              "w-5 h-5 transition-colors",
              isGlass
                ? "text-black/70 hover:text-black"
                : "text-gray-600 hover:text-[#b2965a]",
            ].join(" ")}
          />
        </button>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[480px] overflow-y-auto"
          >
            {loading && allProducts.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-[#b2965a] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Loading products...
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        Recent Searches
                      </h3>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-gray-500 hover:text-[#b2965a]"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRecentSearchClick(search)}
                          className="w-full text-left p-3 hover:bg-[#fef8e9] rounded-lg transition-colors flex items-center gap-3 group"
                        >
                          <FiSearch className="w-4 h-4 text-gray-500 group-hover:text-[#b2965a]" />
                          <span className="text-sm text-gray-800 font-medium group-hover:text-[#b2965a]">
                            {search}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Suggestions */}
                {query && (
                  <>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-4">
                        Suggestions for "{query}"
                      </p>
                      
                      {suggestions.length > 0 ? (
                        <div className="space-y-3">
                          {suggestions.map((product) => (
                            <button
                              key={product._id}
                              onClick={() => handleProductClick(product._id, product.slug)}
                              className="w-full text-left p-3 hover:bg-[#fef8e9] rounded-xl transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] flex-shrink-0">
                                  {product.images && product.images[0]?.url ? (
                                    <img
                                      src={product.images[0].url}
                                      alt={product.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#b2965a] to-[#d4b97d] flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {product.title?.charAt(0) || "J"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 group-hover:text-[#b2965a] text-sm truncate">
                                    {product.title}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-600 capitalize">
                                      {product.category || "Jewellery"}
                                    </span>
                                    <span className="font-bold text-[#b2965a]">
                                      ₹{product.price ? product.price.toLocaleString() : "0"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                          
                          {/* View All Results Button */}
                          <button
                            onClick={() => {
                              saveRecentSearch(query.trim());
                              navigate(`/search?q=${encodeURIComponent(query)}`);
                              setShowSuggestions(false);
                              setQuery("");
                              if (onCloseMobileMenu) onCloseMobileMenu();
                            }}
                            className="w-full p-3 bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] text-[#b2965a] font-medium hover:from-[#f4e6c3] hover:to-[#fef8e9] transition-all flex items-center justify-center gap-2 rounded-xl"
                          >
                            View all results
                            <FiChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      ) : query.trim() ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-[#fef8e9] rounded-full flex items-center justify-center mx-auto mb-3">
                            <FiSearch className="w-6 h-6 text-[#b2965a]" />
                          </div>
                          <p className="font-medium text-gray-900 mb-2">
                            No products found for "{query}"
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            Try different keywords
                          </p>
                          
                          {/* Suggested Keywords */}
                          <div className="flex flex-wrap gap-2 justify-center">
                            {["Diamond", "Gold", "Ring", "Necklace", "Earrings", "Bracelet"].map(
                              (keyword) => (
                                <button
                                  key={keyword}
                                  onClick={() => setQuery(keyword)}
                                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-[#f4e6c3] text-gray-800 rounded-full font-medium transition-all"
                                >
                                  {keyword}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}

                {/* Trending Products (when no query) */}
                {!query && allProducts.length > 0 && (
                  <div className="p-4 bg-[#fef8e9]">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Popular Products
                    </p>
                    <div className="space-y-3">
                      {getPopularProducts().map((product) => (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product._id, product.slug)}
                          className="w-full text-left p-3 bg-white hover:bg-white/80 rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] flex-shrink-0">
                              {product.images && product.images[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#b2965a] to-[#d4b97d] flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {product.title?.charAt(0) || "J"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {product.title}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  {product.category || "Jewellery"}
                                </span>
                                <span className="text-sm font-bold text-[#b2965a]">
                                  ₹{product.price ? product.price.toLocaleString() : "0"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Categories */}
                {!query && (
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Quick Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Necklaces",
                        "Earrings",
                        "Rings",
                        "Bracelets",
                        "Diamonds",
                        "Gold",
                        "Silver",
                        "Pearls",
                      ].map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setQuery(category);
                            setShowSuggestions(true);
                          }}
                          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-[#f4e6c3] text-gray-800 rounded-full font-medium transition-all"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;