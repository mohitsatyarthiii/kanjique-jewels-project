import { motion } from "framer-motion";

const giftData = [
  { title: "Wife", img: "https://i.postimg.cc/CLL0HCJb/Wife.webp" },
  { title: "Husband", img: "https://i.postimg.cc/155Sc0M6/Husband-3-187cd795-8819-4d77-b53a-1e368f233d35.webp" },
  { title: "Mother", img: "https://i.postimg.cc/qMMrXcQ3/Ma.webp" },
  { title: "Brother", img: "https://i.postimg.cc/rFFTCGgt/Brother-1.webp" },
  { title: "Sister", img: "https://i.postimg.cc/L66SBkvg/Sister-2e1f458e-b7fc-4954-84a1-a18cd22158d7.webp" },
  { title: "Friends", img: "https://i.postimg.cc/DfcFXpQc/Friends.webp" },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function GiftGuideSection() {
  return (
    <section className="px-4 sm:px-8 lg:px-16 py-16">
      <div className="rounded-[32px] bg-gradient-to-b from-[#FFE7D1] to-[#FFF4EB] px-4 sm:px-8 py-14">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl sm:text-4xl font-semibold mb-12"
        >
          Gifting Guide
        </motion.h2>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
        >
          {giftData.map((item, i) => (
            <motion.div
              key={i}
              variants={card}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white rounded-[26px] p-3 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[3/4] rounded-[20px] overflow-hidden">
                <img
                  src={item.img}
                  alt="Gift category"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
