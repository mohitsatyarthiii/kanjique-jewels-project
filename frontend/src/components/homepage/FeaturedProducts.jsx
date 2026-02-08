import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { FiShoppingBag } from "react-icons/fi";

const fallbackImages = [
  "https://i.postimg.cc/26kspQMN/2.png",
  "https://i.postimg.cc/sXTt3BCM/3.png",
  "https://i.postimg.cc/7h7gq1JZ/4.png",
  "https://i.postimg.cc/GmQGZrC9/5.png"
];

const FeaturedProducts = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch real products only
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/public/products", {
          params: {
            limit: 12,
            page: 1,
             isFeatured: true,
            sortBy: "createdAt",
            sortOrder: "desc"
          }
        });

        if (res.data.success && res.data.products?.length) {
          setProducts(res.data.products.slice(0, 12));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("API Error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Safe visibility trigger (won’t hide products)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    // Backup safety (agar observer fail ho)
    const backupTimer = setTimeout(() => setVisible(true), 300);

    return () => {
      observer.disconnect();
      clearTimeout(backupTimer);
    };
  }, []);

  const getProductImage = (product, index) => {
    if (product.mainImages?.length) {
      const img = product.mainImages[0];
      return typeof img === "string" ? img : img?.url;
    }

    if (product.images?.length) {
      const img = product.images[0];
      return typeof img === "string" ? img : img?.url;
    }

    return fallbackImages[index % fallbackImages.length];
  };

  const getProductPrice = (product) => {
    const price =
      product.baseSalePrice ||
      product.basePrice ||
      product.displayPrice ||
      product.price ||
      product.minPrice;

    return price ? `₹${price.toLocaleString()}` : "₹2,999";
  };

  const getProductTitle = (product) =>
    product.title || product.name || product.productName || "Premium Jewelry";

  const getProductCategory = (product, index) => {
    if (product.category) return product.category;
    if (product.subCategory) return product.subCategory;

    const fallbackCategories = [
      "Necklaces", "Earrings", "Rings", "Bracelets",
      "Mangalsutra", "Earrings", "Rings", "Bracelets"
    ];

    return fallbackCategories[index % fallbackCategories.length];
  };

  const handleProductClick = (product) => {
    if (product?._id) {
      navigate(`/product/${product._id}`);
    } else {
      navigate("/products");
    }
  };

  if (loading) {
    return (
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-2xl md:text-4xl">
            Featured Collections
          </h2>
          <p className="mt-3 text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-2xl md:text-4xl">
            Featured Collections
          </h2>
          <p className="mt-3 text-gray-600">
            No featured products available right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        <div className="text-center mb-14">
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide text-black">
            Featured Collections
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600">
            Handpicked designs across our most loved categories
          </p>
        </div>

        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10
          transition-all duration-900
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {products.map((product, index) => (
            <div
              key={product._id}
              className="group relative cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div
                className="relative bg-[#faf9f7] rounded-2xl overflow-hidden w-full h-[220px] md:h-[280px]"
                style={{ minHeight: "220px" }}
              >
                <img
                  src={getProductImage(product, index)}
                  alt={getProductTitle(product)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      fallbackImages[index % fallbackImages.length];
                  }}
                />

                <div
                  className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.1), transparent)"
                  }}
                >
                  <button
                    className="mb-4 px-6 py-2 text-xs tracking-widest uppercase bg-white text-black rounded-sm shadow-md flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    <FiShoppingBag className="w-3 h-3" />
                    View Product
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                  {getProductCategory(product, index)}
                </p>
                <h3 className="mt-1 text-sm font-semibold line-clamp-1">
                  {getProductTitle(product)}
                </h3>
                <p className="mt-1 text-sm text-gray-600 font-medium">
                  {getProductPrice(product)}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
