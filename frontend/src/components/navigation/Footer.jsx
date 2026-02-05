import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
   // <-- apne path ke hisaab se change karna
import { MdWhatsapp } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* 🔥 BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#f7f4ef] to-[#efe7dc]" />

      {/* 🌈 FLOATING BLOBS */}
      <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-[#e8dcc7] rounded-full blur-[200px] opacity-80 animate-pulse" />
      <div className="absolute top-1/3 -right-56 w-[650px] h-[650px] bg-[#eadff2] rounded-full blur-[220px] opacity-70 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#dfeeea] rounded-full blur-[200px] opacity-70 animate-pulse" />

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 py-28">
        {/* 🔥 GLASS CARD */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.08)] p-12">
          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
            {/* BRAND WITH LOGO */}
            <div>
              <Link to="/">
                <img
                  src="/logo.png"
                  alt="Kanjique Jewels Logo"
                  className="h-20 w-auto mb-4"
                />
              </Link>

              <p className="mt-6 text-sm text-gray-600 leading-relaxed">
                Kanjique Jewels is a modern luxury jewellery brand crafting
                refined designs for everyday elegance. Each piece blends
                timeless beauty with contemporary sophistication.
              </p>

              {/* SOCIAL ICONS */}
              <div className="mt-8 flex gap-4">
                <SocialIcon
                  icon={Instagram}
                  url="https://www.instagram.com/kanjique_jewels?igsh=MWFteXFycTZsZHU0dQ=="
                  label="Instagram"
                />
                <SocialIcon
                  icon={Facebook}
                  url="https://www.facebook.com/share/1AgAXZpJmn/?mibextid=wwXIfr"
                  label="Facebook"
                />
                <SocialIcon
                  icon={MdWhatsapp}
                  url="https://wa.me/918744827772"
                  label="Whatsapp"
                />
                <SocialIcon
                  icon={Youtube}
                  url="https://youtube.com/@kanjique_jewels?si=2Cp6_e03kLHFuRQz"
                  label="YouTube"
                />
              </div>
            </div>

            {/* SHOP */}
            <FooterColumn
              title="Shop"
              items={[
                { label: "Necklaces", path: "/category/Necklaces" },
                { label: "Earrings", path: "/category/Earrings" },
                { label: "Rings", path: "/category/Rings" },
                { label: "Bracelets", path: "/category/Bracelets & Bangles" },
                { label: "Collections", path: "/category/Collections" },
              ]}
            />

            {/* COMPANY */}
            <FooterColumn
              title="Company"
              items={[
                { label: "About Us", path: "/about" },
                { label: "Our Craft", path: "/craft" },
                { label: "Products", path: "/products" },
                { label: "Contact", path: "/contact" },
              ]}
            />

            {/* SUPPORT */}
            <FooterColumn
              title="Support"
              items={[
                { label: "FAQs", path: "/faqs" },
                { label: "Shipping & Returns", path: "/shipping-returns" },
                { label: "Privacy Policy", path: "/privacy-policy" },
                { label: "Terms & Conditions", path: "/terms-conditions" },
              ]}
            />
          </div>

          {/* DIVIDER */}
          <div className="my-14 h-px bg-black/10" />

          {/* BOTTOM */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} Kanjique Jewels. All rights reserved.
            </p>

            <p className="tracking-widest uppercase text-xs text-gray-500">
              Crafted with care · Designed for elegance
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ---------------- SUB COMPONENTS ---------------- */

const FooterColumn = ({ title, items }) => (
  <div>
    <h4 className="text-xs uppercase tracking-[0.3em] text-gray-800">
      {title}
    </h4>
    <ul className="mt-6 space-y-4 text-sm text-gray-600">
      {items.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className="
              relative w-fit cursor-pointer transition-all block
              hover:text-[#b2965a] hover:translate-x-1
            "
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ icon: Icon, url, label }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="
      w-10 h-10 rounded-full flex items-center justify-center
      bg-white/70 border border-white
      shadow-md cursor-pointer
      transition-all duration-300
      hover:scale-110 hover:bg-[#b2965a] hover:text-white
    "
  >
    <Icon size={18} />
  </a>
);

export default Footer;
