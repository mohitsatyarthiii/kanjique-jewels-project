import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import AddToCart from "../../components/addToCart/AddToCart";

export default function ProductPage() {
  const { slug } = useParams();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data.product);
        if (res.data.product.images.length) {
          setMainImage(res.data.product.images[0].url);
        }
        if (res.data.product.sizes && res.data.product.sizes.length > 0) {
          setSelectedSize(res.data.product.sizes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product) return;

      setLoadingSimilar(true);
      try {
        const res = await api.get(
          `/api/products/similar/${product._id}?limit=8`,
        );
        setSimilarProducts(res.data.similarProducts);
      } catch (err) {
        console.error("Error fetching similar products:", err);
        try {
          const fallbackRes = await api.get(
            `/api/products/suggested/${product.category}?limit=8&exclude=${product._id}`,
          );
          setSimilarProducts(fallbackRes.data.suggestedProducts);
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
        }
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarProducts();
  }, [product]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleWishlist = () => {
    setWishlist(!wishlist);
    if (!wishlist) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this beautiful ${product.title} from KANJIQUE JEWELS`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={18}
        className={
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }
      />
    ));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-40 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-[#d4b97d]/30 rounded-full"></div>
            <Gem className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Loading Exquisite Piece
          </h3>
          <p className="text-gray-600">Unveiling the beauty...</p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-40 pb-40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
            <Gem className="w-16 h-16 text-[#b2965a]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Jewel Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            This exquisite piece seems to have been claimed by another admirer.
          </p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Explore Our Collection
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
      {/* Golden Blobs Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/20 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Premium Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-12"
        >
          <Link
            to="/"
            className="text-gray-500 hover:text-[#b2965a] transition-colors flex items-center gap-1"
          >
            <Crown className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link
            to={`/category/${product.category}`}
            className="text-gray-500 hover:text-[#b2965a] transition-colors capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-[#b2965a] truncate max-w-xs">
            {product.title}
          </span>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative bg-gradient-to-br from-white to-[#fef8e9] rounded-3xl shadow-2xl overflow-hidden border-2 border-[#f4e6c3] p-8 mb-6">
              <div className="absolute top-4 left-4 z-10">
                {product.discount && (
                  <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Zap className="w-4 h-4" /> {product.discount}% OFF
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                    wishlist
                      ? "bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white hover:text-[#ff6b6b]"
                  } shadow-lg`}
                >
                  <Heart
                    className={`w-5 h-5 ${wishlist ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-[#b2965a] shadow-lg transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-[550px] object-contain transition-all duration-500 hover:scale-105"
              />

              {/* Premium Badges */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <span className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> Premium
                </span>
                <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Handcrafted
                </span>
                <span className="bg-gradient-to-r from-[#13b38b] to-[#11998e] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Hallmarked
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {product.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setMainImage(img.url)}
                  className={`flex-shrink-0 relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    mainImage === img.url
                      ? "border-[#b2965a] scale-105 shadow-lg"
                      : "border-gray-200 hover:border-[#d4b97d]"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover"
                  />
                  {mainImage === img.url && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#b2965a]/20 to-transparent"></div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Product Header */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-4 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
                <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">
                  Exclusive Collection
                </span>
                <span className="w-4 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-semibold bg-gradient-to-r from-[#b2965a] to-[#d4b97d] bg-clip-text text-transparent">
                  {product.brand || "KANJIQUE JEWELS"}
                </span>
                <span className="w-2 h-2 bg-[#b2965a] rounded-full"></span>
                <span className="text-gray-500 capitalize">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-6 p-6 bg-gradient-to-r from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-br from-white to-gray-50 px-4 py-2 rounded-full shadow">
                  <span className="flex items-center gap-1">
                    {renderStars(product.rating || 4.8)}
                  </span>
                  <span className="text-lg font-bold text-[#b2965a]">
                    {product.rating || 4.8}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {(product.reviewCount || "1.2k").toLocaleString()}
                  </span>{" "}
                  Reviews
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-gray-900">98%</span>{" "}
                  Customer Satisfaction
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-gray-900">5.2k</span> Sold
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-4 p-6 bg-white rounded-2xl border border-[#f4e6c3] shadow-sm">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Exclusive Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          Save ₹
                          {(
                            product.originalPrice - product.price
                          ).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="ml-auto">
                  <div className="text-sm text-gray-600">Special Offer</div>
                  <div className="text-lg font-bold text-[#b2965a]">
                    Free Gift Packaging
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#b2965a]" />
                  Price inclusive of all taxes
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#b2965a]" />
                  Free Insured Shipping
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-[#b2965a]" />
                  Lifetime Maintenance
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#b2965a]" />
                  Free Resizing Service
                </p>
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4 p-6 bg-white rounded-2xl border border-[#f4e6c3] shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#b2965a]" /> Select Size
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Perfect fit guaranteed
                    </p>
                  </div>
                  <button className="text-sm font-medium text-[#b2965a] hover:text-[#8c703f] transition-colors flex items-center gap-1">
                    Size Guide <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center group ${
                        selectedSize === size
                          ? "border-[#b2965a] bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] shadow-lg scale-105"
                          : "border-gray-200 hover:border-[#d4b97d] hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`font-bold ${selectedSize === size ? "text-[#b2965a]" : "text-gray-700"}`}
                      >
                        {size}
                      </span>
                      {selectedSize === size && (
                        <Check className="w-5 h-5 text-green-500 absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 max-w-xs">
  <AddToCart 
    productId={product._id}
    productSlug={product.slug}
    showQuantity={true}
    showViewDetails={false}
  />
</div>

            {/* Premium Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border border-[#f4e6c3] text-center">
                <Truck className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-600">3-5 Days Delivery</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border border-[#f4e6c3] text-center">
                <RotateCcw className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
                <p className="font-semibold text-gray-900">30-Day Returns</p>
                <p className="text-xs text-gray-600">Easy Exchange</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border border-[#f4e6c3] text-center">
                <Shield className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
                <p className="font-semibold text-gray-900">2-Year Warranty</p>
                <p className="text-xs text-gray-600">Free Maintenance</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border border-[#f4e6c3] text-center">
                <Gem className="w-8 h-8 text-[#b2965a] mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Authenticity</p>
                <p className="text-xs text-gray-600">Hallmark Certified</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
              <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">
                Complete Your Look
              </span>
              <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">
              Similar Exquisite Pieces
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover more stunning {product.category.toLowerCase()} from our
              premium collection
            </p>
          </div>

          {loadingSimilar ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 rounded-2xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct, index) => (
                <motion.div
                  key={similarProduct._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Link
                    to={`/product/${similarProduct._id}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#fef8e9] border-2 border-[#f4e6c3] shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3]">
                        <img
                          src={similarProduct.images[0]?.url}
                          alt={similarProduct.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {similarProduct.discount && (
                            <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                              -{similarProduct.discount}%
                            </span>
                          )}
                          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:text-[#ff6b6b] transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3">
                          <span className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                            ₹{similarProduct.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#b2965a] transition-colors">
                          {similarProduct.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">
                              {similarProduct.rating || 4.8} •{" "}
                              {similarProduct.reviewCount || "24"} reviews
                            </span>
                          </div>
                          <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-[#b2965a] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
                <Gem className="w-12 h-12 text-[#b2965a]" />
              </div>
              <p className="text-gray-600 mb-4">
                Currently no similar jewels available
              </p>
              <Link
                to={`/category/${product.category}`}
                className="inline-flex items-center gap-2 text-[#b2965a] hover:text-[#8c703f] font-semibold transition-colors"
              >
                Explore all {product.category}{" "}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            <span className="font-semibold">
              {wishlist ? "Added to wishlist!" : "Link copied to clipboard!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
