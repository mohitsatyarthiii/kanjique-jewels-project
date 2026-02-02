const BlackMarquee = () => {
  return (
    <>
      {/* Inline CSS for animation */}
      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>

      <div className="w-full bg-black overflow-hidden h-8 md:h-10 flex items-center">
        <div
          className="flex w-max gap-16"
          style={{
            animation: "marquee 50s linear infinite",
          }}
        >
          <MarqueeContent />
          <MarqueeContent />
        </div>
      </div>
    </>
  );
};

const MarqueeContent = () => {
  const items = [
  "EXCLUSIVE DESIGNS DROPPING EVERY WEEK",
  "PREMIUM JEWELLERY MADE FOR EVERYDAY LUXURY",
  "LIMITED EDITION STYLES AVAILABLE NOW",
  "TIMELESS DESIGNS WITH A MODERN TOUCH",
  "ELEVATE YOUR LOOK WITH KANJIQUE JEWELS",
  "CURATED COLLECTIONS FOR EVERY OCCASION",
];


  return (
    <div className="flex gap-16">
      {items.map((item, index) => (
        <span
          key={index}
          className="text-white text-[10px] md:text-xs font-sans tracking-[0.35em] whitespace-nowrap"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export default BlackMarquee;
