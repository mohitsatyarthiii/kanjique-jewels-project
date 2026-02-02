import { useState } from "react";
import { Link } from "react-router-dom";

const tabs = ["Necklaces", "Earrings", "Rings", "Bracelets"];

const products = {
  Necklaces: [
    { id: 1, name: "Gold Chain Necklace", price: "₹4,999", image: "https://i.postimg.cc/JngCbyYw/Copyof-PMW01NC030.webp" },
    { id: 2, name: "Pearl Statement Necklace", price: "₹6,499", image: "https://i.postimg.cc/tTfGh1vX/NK-40-1-0040.webp" },
    { id: 3, name: "Minimal Pendant", price: "₹3,299", image: "https://i.postimg.cc/zBMYnL2z/NK390-1.webp" },
    { id: 4, name: "Layered Necklace", price: "₹5,799", image: "https://i.postimg.cc/bJMfQGVp/NK484-3-88bbcc99-8a1e-415c-9e14-44e6a3123557.webp" },
  ],
  Earrings: [
    { id: 5, name: "Gold Hoops", price: "₹2,499", image: "https://i.postimg.cc/hGtGsdsC/DSC08245.webp" },
    { id: 6, name: "Stud Earrings", price: "₹1,999", image: "https://i.postimg.cc/BvnvpKpY/ER159-2-0040.webp" },
    { id: 7, name: "Pearl Drops", price: "₹3,299", image: "https://i.postimg.cc/Jhzhxkxx/PM-EARRINGS-032-3-0040.jpg" },
    { id: 8, name: "Minimal Hoops", price: "₹2,899", image: "https://i.postimg.cc/nLhL2D2Y/PMW01ER046.webp" },
  ],
  Rings: [
    { id: 9, name: "Gold Band Ring", price: "₹2,199", image: "https://i.postimg.cc/R0hMKzCn/01-2aa47a63-6c8f-4bbe-8e5b-ee11e027a449.webp" },
    { id: 10, name: "Diamond Ring", price: "₹7,999", image: "https://i.postimg.cc/t42qsgbN/PM-RING-041.webp" },
    { id: 11, name: "Minimal Ring", price: "₹1,799", image: "https://i.postimg.cc/y8v1DNKF/PM-RING-093.webp" },
    { id: 12, name: "Stackable Ring", price: "₹2,999", image: "https://i.postimg.cc/BnMSjv3C/RG151-49b40051-551f-4f17-9d8c-2b5014e41fde.webp" },
  ],
  Bracelets: [
    { id: 13, name: "Gold Bracelet", price: "₹3,999", image: "https://i.postimg.cc/CK5FkVMq/Artboard14-2.jpg" },
    { id: 14, name: "Charm Bracelet", price: "₹4,499", image: "https://i.postimg.cc/t42qsgbN/PM-RING-041.webp" },
    { id: 15, name: "Minimal Cuff", price: "₹2,799", image: "https://i.postimg.cc/fLXQfzGX/01-e869a853-ae2b-4543-8f22-61455b80f6a6.webp" },
    { id: 16, name: "Pearl Bracelet", price: "₹3,499", image: "https://i.postimg.cc/wvJYQqCN/Artboard9-4.webp" },
  ],
};

const TabbedProducts = () => {
  const [activeTab, setActiveTab] = useState("Necklaces");

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide">
            Our Best Picks
          </h2>
        </div>

        {/* Tabs (Scrollable on Mobile) */}
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

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
          {products[activeTab].map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer transition-all duration-500"
            >
              {/* Card */}
              <div className="relative bg-[#faf9f7] rounded-xl md:rounded-2xl
                overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-500">

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[180px] md:h-[260px] object-contain
                  transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
              </div>

              {/* Text */}
              <div className="mt-3 md:mt-5 text-center transition-all duration-500">
                <h3 className="text-xs md:text-sm font-sans text-gray-900 leading-snug">
                  {product.name}
                </h3>
                <p className="mt-1 text-xs md:text-sm text-gray-500">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-14 md:mt-20 text-center">
          <Link to="/products">
          <button className="px-10 md:px-12 py-3 border border-black
            text-xs md:text-sm tracking-[0.25em] uppercase
            hover:bg-black hover:text-white transition-all duration-300">
            View All
          </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TabbedProducts;
