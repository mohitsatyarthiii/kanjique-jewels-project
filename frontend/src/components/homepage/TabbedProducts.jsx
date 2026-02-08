import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";

const tabs = ["Necklaces", "Rings", "Bracelets"];

const TabbedProducts = () => {
  const [activeTab, setActiveTab] = useState("Necklaces");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch ALL products once, then filter by tab
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/public/products", {
          params: {
            limit: 100,
            page: 1,
            sortBy: "createdAt",
            sortOrder: "desc"
          }
        });

        if (res.data.success && res.data.products?.length) {
          setAllProducts(res.data.products);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.error("API Error:", err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on active tab
  const filteredProducts = allProducts
    .filter(
      (p) => p.category === activeTab || p.subCategory === activeTab
    )
    .slice(0, 4); // UI me 4 cards hi the

  if (loading) {
    return (
      <section className="w-full bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-2xl md:text-4xl">
            Our Best Picks
          </h2>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Heading (SAME) */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide">
            Our Best Picks
          </h2>
        </div>

        {/* Tabs (SAME UI) */}
        <div className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 w-max mx-auto bg-[#f5f4f2] p-2 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-[11px] md:text-[12px] uppercase tracking-[0.2em]
                rounded-full whitespace-nowrap transition-all duration-300
                ${
                  activeTab === tab
                    ? "bg-black text-white shadow"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid (SAME UI + IMAGE CLICKABLE) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group cursor-pointer transition-all duration-500"
              >
                {/* Card */}
                <div
                  className="relative bg-[#faf9f7] rounded-xl md:rounded-2xl
                  overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-500"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={
                      product.mainImages?.[0]?.url ||
                      product.images?.[0]?.url ||
                      product.image ||
                      product.imageUrl ||
                      "https://i.postimg.cc/JngCbyYw/Copyof-PMW01NC030.webp"
                    }
                    alt={product.title || product.name}
                    className="w-full h-[180px] md:h-[260px] object-cover
                    transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                </div>

                {/* Text (SAME) */}
                <div className="mt-3 md:mt-5 text-center transition-all duration-500">
                  <h3 className="text-xs md:text-sm font-sans text-gray-900 leading-snug">
                    {product.title || product.name}
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-gray-500">
                    ₹{
                      product.baseSalePrice ||
                      product.basePrice ||
                      product.price ||
                      2999
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-500">
              No products found for {activeTab}
            </div>
          )}
        </div>

        {/* View All (SAME) */}
        <div className="mt-14 md:mt-20 text-center">
          <Link to="/products">
            <button
              className="px-10 md:px-12 py-3 border border-black
              text-xs md:text-sm tracking-[0.25em] uppercase
              hover:bg-black hover:text-white transition-all duration-300"
            >
              View All
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TabbedProducts;
