import { motion } from "framer-motion";

const womenItems = [
  { name: "Rings", img: "data:image/webp;base64,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", link: "/women/rings" },
  { name: "Earrings", img: "https://th.bing.com/th/id/OIP.UGQG-yj5W7NrEi4XJEajAAHaHa?w=188&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", link: "/women/earrings" },
  { name: "Pendants", img: "https://th.bing.com/th/id/OIP.HgFT_5Q18ClVuLTpwFAUqAHaEM?w=325&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", link: "/women/pendants" },
  { name: "Bracelets", img: "https://th.bing.com/th/id/OIP.i8lfFt8P_2mYKuzYCG2-uQHaE9?w=294&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", link: "/women/bracelets" },
  { name: "Necklaces", img: "https://cdn.shopify.com/s/files/1/0522/8095/0955/files/137A41260_x1200.jpg?v=1697524854", link: "/women/necklaces" },
  { name: "Anklets", img: "https://th.bing.com/th/id/OIP.o2IumfvFGVF1DE9bGroZZgAAAA?w=197&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", link: "/women/anklets" },
];

export default function WomensCollectionSection() {
  return (
    <section className="px-4 sm:px-8 lg:px-16 py-16">
      <div className="bg-[#F2D8E1] rounded-[36px] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* Left : Categories */}
        <div className="grid grid-cols-3 gap-6 order-2 lg:order-1">
          {womenItems.map((item, i) => (
            <motion.a
              key={i}
              href={item.link}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white shadow-sm hover:shadow-xl transition">
  <img
    src={item.img}
    alt={item.name}
    className="w-full h-full object-cover"
  />
</div>

              <p className="mt-3 text-sm sm:text-base font-medium tracking-wide text-gray-800">
                {item.name}
              </p>
            </motion.a>
          ))}
        </div>

        {/* Right : Women Image */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[32px] overflow-hidden bg-[#FFF7FA] order-1 lg:order-2"
        >
          <img
            src="https://cdn.orra.co.in/media/wysiwyg/womenbanner.9.1.26.jpg"
            alt="Women Collection"
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-6 left-6">
            <h3 className="text-4xl font-serif mb-1">Women’s</h3>
            <p className="text-xl">Collection</p>

            <a
              href="/women"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9C5D74] text-white hover:scale-105 transition"
            >
              Explore →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
