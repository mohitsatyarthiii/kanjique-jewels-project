import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Gold Chain Necklace",
    price: "₹4,999",
    category: "Necklaces",
    image: "https://i.postimg.cc/JngCbyYw/Copyof-PMW01NC030.webp",
  },
  {
    id: 2,
    name: "Pearl Drop Earrings",
    price: "₹3,299",
    category: "Earrings",
    image: "https://i.postimg.cc/Jhzhxkxx/PM-EARRINGS-032-3-0040.jpg",
  },
  {
    id: 3,
    name: "Minimal Gold Ring",
    price: "₹2,199",
    category: "Rings",
    image: "https://i.postimg.cc/y8v1DNKF/PM-RING-093.webp",
  },
  {
    id: 4,
    name: "Classic Bracelet",
    price: "₹3,999",
    category: "Bracelets",
    image: "https://i.postimg.cc/CK5FkVMq/Artboard14-2.jpg",
  },
  {
    id: 5,
    name: "Layered Necklace",
    price: "₹5,799",
    category: "Necklaces",
    image: "https://i.postimg.cc/bJMfQGVp/NK484-3-88bbcc99-8a1e-415c-9e14-44e6a3123557.webp",
  },
  {
    id: 6,
    name: "Stud Earrings",
    price: "₹1,999",
    category: "Earrings",
    image: "https://i.postimg.cc/BvnvpKpY/ER159-2-0040.webp",
  },
  {
    id: 7,
    name: "Diamond Ring",
    price: "₹7,999",
    category: "Rings",
    image: "https://i.postimg.cc/t42qsgbN/PM-RING-041.webp",
  },
  {
    id: 8,
    name: "Charm Bracelet",
    price: "₹4,499",
    category: "Bracelets",
    image: "https://i.postimg.cc/fLXQfzGX/01-e869a853-ae2b-4543-8f22-61455b80f6a6.webp",
  },
  {
    id: 9,
    name: "Mangalsutra Classic",
    price: "₹6,299",
    category: "Mangalsutra",
    image: "https://i.postimg.cc/JngCbyYw/Copyof-PMW01NC030.webp",
  },
  {
    id: 10,
    name: "Hoop Earrings",
    price: "₹2,899",
    category: "Earrings",
    image: "https://i.postimg.cc/nLhL2D2Y/PMW01ER046.webp",
  },
  {
    id: 11,
    name: "Statement Ring",
    price: "₹3,499",
    category: "Rings",
    image: "https://i.postimg.cc/BnMSjv3C/RG151-49b40051-551f-4f17-9d8c-2b5014e41fde.webp",
  },
  {
    id: 12,
    name: "Minimal Bracelet",
    price: "₹2,799",
    category: "Bracelets",
    image: "https://i.postimg.cc/wvJYQqCN/Artboard9-4.webp",
  },
];

const FeaturedProducts = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide text-black">
            Featured Collections
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600">
            Handpicked designs across our most loved categories
          </p>
        </div>

        {/* Product Grid */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10
          transition-all duration-1000
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative cursor-pointer"
            >
              {/* Image */}
              <div className="relative bg-[#faf9f7] rounded-2xl overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[220px] md:h-[280px] object-contain
                  transition-transform duration-700 group-hover:scale-110"
                />

                {/* Hover CTA */}
                <div className="absolute inset-0 flex items-end justify-center
                  bg-black/0 group-hover:bg-black/10 transition">
                    <Link to="/products">
                  <button
                    className="mb-4 px-6 py-2 text-xs tracking-widest uppercase
                    bg-white text-black opacity-0 group-hover:opacity-100
                    transition-all duration-300"
                  >
                    View Product
                  </button>
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  {product.category}
                </p>
                <h3 className="mt-1 text-sm font-sans text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {product.price}
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
