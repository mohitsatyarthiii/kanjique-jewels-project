import { useState } from "react";

const slides = [
  "https://i.postimg.cc/gJgfGwbR/3.png",
  "https://i.postimg.cc/sXTt3BC4/1.png",
  "https://i.postimg.cc/xC6W9kVK/4.png",
  "https://i.postimg.cc/j5MGRWYP/6.png",
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  return (
    <section
      className="
        relative w-full overflow-hidden
        pt-[64px]              /* 👈 NAVBAR SAFE SPACE */
        h-[60vw] sm:h-[55vw] md:h-[100vh]
        max-h-[70vh] sm:max-h-[75vh] md:max-h-none
      "
    >
      {slides.map((img, index) => (
        <div
  key={index}
  className={`absolute inset-0 transition-opacity duration-700 ease-in-out 
    pt-[80px] md:pt-0
    h-[110%] md:h-full   /* 👈 only mobile height increase from bottom */
    ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
>
  <img
    src={img}
    alt={`Hero Slide ${index + 1}`}
    className="
      w-full h-full
      object-cover
      object-center
    "
  />
</div>


      ))}

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="
          absolute left-3 top-1/2 -translate-y-1/2 z-20
          bg-white/70 hover:bg-white
          w-9 h-9 rounded-full flex items-center justify-center
        "
      >
        ‹
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="
          absolute right-3 top-1/2 -translate-y-1/2 z-20
          bg-white/70 hover:bg-white
          w-9 h-9 rounded-full flex items-center justify-center
        "
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition ${
              index === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
