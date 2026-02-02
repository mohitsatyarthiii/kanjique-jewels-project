import { useRef } from "react";

const banners = [
  {
    id: 1,
    image: "https://i.postimg.cc/sXTt3BC4/1.png",
    title: "WELCOME GIFT",
    subtitle: "Use Code KANJIQUE10",
  },
  {
    id: 2,
    image: "https://i.postimg.cc/26kspQMN/2.png",
    title: "LIMITED TIME",
    subtitle: "Flat 15% Off on Select Styles",
  },
  {
    id: 3,
    image: "https://i.postimg.cc/gJgfGwbR/3.png",
    title: "ELEVATE YOUR LOOK",
    subtitle: "Exclusive Online Savings",
  },
  {
    id: 4,
    image: "https://i.postimg.cc/xC6W9kVK/4.png",
    title: "SPECIAL EDIT",
    subtitle: "Complimentary Savings Await",
  },
];

const CouponBannerSlider = () => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    const container = sliderRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">

        {/* Heading */}
        <div className="mb-10 md:mb-14 text-center">
          <h2 className="font-serif text-2xl md:text-4xl tracking-wide">
            Exclusive Offers
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600">
            Thoughtfully curated privileges, just for you
          </p>
        </div>

        {/* Arrows */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2
          w-12 h-12 rounded-full bg-white shadow-lg
          items-center justify-center text-2xl hover:scale-105 transition z-10"
        >
          ‹
        </button>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2
          w-12 h-12 rounded-full bg-white shadow-lg
          items-center justify-center text-2xl hover:scale-105 transition z-10"
        >
          ›
        </button>

        {/* Slider */}
        {/* Slider Wrapper (NO SCROLLBAR VISIBLE) */}
<div className="overflow-hidden">
  <div
    ref={sliderRef}
    className="
      flex gap-6
      overflow-x-auto overflow-y-hidden
      scroll-smooth snap-x snap-mandatory
      scrollbar-none
    "
  >
    {banners.map((banner) => (
      <div
        key={banner.id}
        className="
          snap-start flex-shrink-0
          w-[90%] sm:w-[70%] md:w-[48%]
          group cursor-pointer
        "
      >
        <div
          className="
            relative h-[260px] md:h-[320px]
            rounded-3xl overflow-hidden
            shadow-sm group-hover:shadow-2xl
            transition-all duration-500
          "
        >
          <img
            src={banner.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/25"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
            <p className="text-xs tracking-[0.3em] uppercase mb-3">
              {banner.title}
            </p>
            <h3 className="font-serif text-xl md:text-2xl tracking-wide">
              {banner.subtitle}
            </h3>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


      </div>
    </section>
  );
};

export default CouponBannerSlider;
