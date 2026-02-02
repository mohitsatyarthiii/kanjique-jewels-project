import { useEffect, useRef, useState } from "react";

const images = [
  "https://i.postimg.cc/sXTt3BC4/1.png",
  "https://i.postimg.cc/26kspQMN/2.png",
  "https://i.postimg.cc/gJgfGwbR/3.png",
  "https://i.postimg.cc/xC6W9kVK/4.png",
];

const EditorialShowcase = () => {
  const sectionRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(
        0,
        Math.min(1, 1 - rect.top / window.innerHeight)
      );
      setOffset(scrollProgress * 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-3 gap-10 items-start">

          {/* Left Big Image */}
          <div
            className="col-span-2 overflow-hidden"
            style={{
              transform: `translateY(${offset * 0.4}px)`,
            }}
          >
            <img
              src={images[0]}
              alt=""
              className="w-full h-[520px] object-cover"
            />
          </div>

          {/* Right Stack */}
          <div className="flex flex-col gap-10">
            <div
              style={{
                transform: `translateY(${offset * 0.6}px)`,
              }}
            >
              <img
                src={images[1]}
                alt=""
                className="w-full h-[250px] object-cover"
              />
            </div>
            <div
              style={{
                transform: `translateY(${offset * 0.8}px)`,
              }}
            >
              <img
                src={images[2]}
                alt=""
                className="w-full h-[250px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col gap-6">
          {images.slice(0, 3).map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              className="w-full h-[300px] object-cover"
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default EditorialShowcase;
