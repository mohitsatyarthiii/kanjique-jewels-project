import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "NECKLACES",
    image: "https://th.bing.com/th/id/R.8d87d469051a75c8dfbde8d6563b608c?rik=qbgp4Mmlzz8qVQ&riu=http%3a%2f%2fwww.dancejewellery.co.uk%2fmedia%2fcatalog%2fproduct%2fcache%2f1%2fimage%2f9df78eab33525d08d6e5fb8d27136e95%2fs%2fw%2fswarovski-large-necklace-model.jpg&ehk=ABK%2bGMR0ij8cSKEEYNTHKxU4slmQqjaooZftHcat%2bF4%3d&risl=&pid=ImgRaw&r=0",
    path: "/category/Necklaces"
  },
  {
    name: "EARRINGS",
    image: "https://oldnavy.gap.com/webcontent/0053/593/083/cn53593083.jpg",
    path: "/category/Earrings"
  },
  {
    name: "RINGS",
    image: "https://thumbs.dreamstime.com/b/diamond-vintage-engagement-ring-product-photo-white-background-soft-lighting-beauty-fashion-wedding-jewelry-diamond-vintage-268477836.jpg",
    path: "/category/Rings"
  },
  {
    name: "BRACELETS",
    image: "https://tse2.mm.bing.net/th/id/OIP.TqRJqitXc9-nYVeQKbGExAHaEJ?rs=1&pid=ImgDetMain&o=7&rm=3",
    path: "/category/Bracelets & Bangles"
  },
  {
    name: "NEW ARRIVALS",
    image: "https://tse4.mm.bing.net/th/id/OIP.finYEhP3rjDgw2Y7KtiKFAHaFP?rs=1&pid=ImgDetMain&o=7&rm=3",
    path: "/new-arrivals"
  },
  {
    name: "MANGALSUTRA",
    image: "https://i.postimg.cc/JngCbyYw/Copyof-PMW01NC030.webp",
    path: "/category/Mangalsutra"
  },
];


const Categories = () => {
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
      className={`w-full bg-white py-16 transition-all duration-1000
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
    >
      {/* Heading */}
      <div className="mb-10 md:mb-14 text-center">
        <h2 className="font-serif text-2xl md:text-4xl tracking-wide text-black">
          Explore by Categories
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 🔑 Mobile = 2 cols | Desktop = 3 cols */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">

          {/* NECKLACES – HERO ONLY ON DESKTOP */}
          <Link to="/category/Necklaces">
          <CategoryCard
            name={categories[0].name}
            image={categories[0].image}
            visible={visible}
            className="
              h-[220px]
              md:col-span-2 md:row-span-2 md:h-[520px]
            "
          />
          </Link>

          {/* EARRINGS */}
          <Link to="/category/Earrings">
          <CategoryCard
            name={categories[1].name}
            image={categories[1].image}
            visible={visible}
            className="h-[220px] md:h-[250px]"
          />
          </Link>

          {/* RINGS */}
           <Link to="/category/Rings">
          <CategoryCard
            name={categories[2].name}
            image={categories[2].image}
            visible={visible}
            className="h-[220px] md:h-[250px]"
          />
          </Link>

          {/* BRACELETS */}
          <CategoryCard
            name={categories[3].name}
            image={categories[3].image}
            visible={visible}
            className="h-[220px] md:h-[250px]"
          />

          {/* NEW ARRIVALS */}
           <Link to="/category/Bracelets & Bangles">
          <CategoryCard
            name={categories[4].name}
            image={categories[4].image}
            visible={visible}
            className="h-[220px] md:h-[250px]"
          />
          </Link>

          {/* 🔥 MANGALSUTRA – FILLS DESKTOP GAP */}
          <Link to="/category/Mangalsutra">
          <CategoryCard
            name={categories[5].name}
            image={categories[5].image}
            visible={visible}
            className="h-[220px] md:h-[250px]"
          />
          </Link>
        </div>
      </div>
    </section>
  );
};

const CategoryCard = ({ name, image, className, visible }) => {
  return (
    <div
      className={`relative overflow-hidden group cursor-pointer ${className}
      transition-all duration-1000 ease-out
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-black/25"></div>

      <div className="absolute bottom-5 left-5">
        <h3 className="text-white font-serif text-lg md:text-xl tracking-widest">
          {name}
        </h3>
      </div>
    </div>
  );
};

export default Categories;
