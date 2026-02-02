import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axiosInstance";
import {
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiChevronDown,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";
import {
  MdOutlineAccountCircle,
  MdOutlineShoppingBag,
} from "react-icons/md";
import SearchBar from "../../components/SearchBar";

// Jewellery categories
const categories = [
  { title: "Necklaces", category: "Necklaces" },
  { title: "Earrings", category: "Earrings" },
  { title: "Rings", category: "Rings" },
  { title: "Bracelets", category: "Bracelets & Bangles" },
  { title: "Collections", category: "Collections" },
];

const Navbar = ({ homeTransparent = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  const profileRef = useRef();
  const mobileMenuRef = useRef();
  const isHome = location.pathname === "/";

  // Scroll behavior for hide/show navbar
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && open) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Only homepage: transparent on hero, glass after scroll
  // Other pages: always glass
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    if (!isHome || !homeTransparent) {
      setScrolled(true);
      return;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, homeTransparent]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Fetch cart count
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart");
        const totalQty = res.data.cart.items.reduce(
          (sum, it) => sum + it.quantity,
          0
        );
        setCartCount(totalQty);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
    fetchCart();
  }, []);

  const isGlass = scrolled;
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setOpen(false);
  };

  return (
    <>
      <motion.header 
        initial={false}
        animate={{ 
          y: showNavbar ? 0 : -100,
          opacity: showNavbar ? 1 : 0
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="fixed top-0 left-0 w-full z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className={[
              "transition-all duration-300",
              isGlass
                ? "bg-white/80 backdrop-blur-xl shadow-lg border border-black/5 rounded-2xl"
                : "bg-transparent",
            ].join(" ")}
          >
            {/* TOP BAR */}
            <div className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6">
              {/* LOGO */}
              <NavLink
                to="/"
                className={[
                  "font-serif text-[25px] sm:text-[15px] tracking-wide transition-colors",
                  isGlass ? "text-black" : "text-white",
                ].join(" ")}
              >
                <span className="font-semibold">KANJIQUE</span>{" "}
                <span className={isGlass ? "text-[#b2965a]" : "text-[#ffd38a]"}>
                  JEWELS
                </span>
              </NavLink>

              {/* DESKTOP CATEGORIES LINKS */}
              <div className="hidden lg:flex gap-6 ml-8">
                {categories.map((menu, idx) => (
                  <NavLink
                    key={idx}
                    to={`/category/${menu.category}`}
                    className={[
                      "flex items-center gap-1 text-sm font-medium transition-colors py-2",
                      isGlass ? "text-gray-700 hover:text-[#b2965a]" : "text-white hover:text-[#ffd38a]"
                    ].join(" ")}
                  >
                    <span>{menu.title}</span>
                  </NavLink>
                ))}
              </div>

              {/* DESKTOP SEARCH BAR (Fixed position) */}
              <div className="hidden md:flex flex-1 max-w-xl mx-6">
                <SearchBar isGlass={isGlass} />
              </div>

              {/* DESKTOP ICONS with Auth Logic */}
              <div
                className={[
                  "hidden md:flex items-center gap-8 transition-colors",
                  isGlass ? "text-gray-900" : "text-white",
                ].join(" ")}
              >
                {/* Wishlist */}
                <NavLink to="/wishlist" className="hover:opacity-80 transition">
                  <FiHeart className="w-5 h-5" />
                </NavLink>

                {/* Cart with Count */}
                <NavLink
                  to="/cart"
                  className="relative hover:opacity-80 transition"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#b2965a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </NavLink>

                {/* Profile / Auth */}
                {user ? (
                  <div ref={profileRef} className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 hover:opacity-80 transition"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0) ||
                            user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`w-4 h-4 transition-transform ${
                          profileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-2xl py-3 z-50 border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-2">
                          <NavLink
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#fef8e9] transition-colors text-gray-700"
                            onClick={() => setProfileOpen(false)}
                          >
                            <MdOutlineAccountCircle className="w-5 h-5" />
                            <span>My Profile</span>
                          </NavLink>
                          <NavLink
                            to="/user-orders"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#fef8e9] transition-colors text-gray-700"
                            onClick={() => setProfileOpen(false)}
                          >
                            <MdOutlineShoppingBag className="w-5 h-5" />
                            <span>My Orders</span>
                          </NavLink>
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700"
                          >
                            <FiLogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-4 py-2 rounded-2xl font-medium hover:shadow-lg transition-all text-sm"
                  >
                    <FiUser className="w-4 h-4" />
                    Login
                  </NavLink>
                )}
              </div>

              {/* MOBILE ACTIONS */}
              <div
                className={[
                  "md:hidden flex items-center gap-5 transition-colors",
                  isGlass ? "text-gray-900" : "text-white",
                ].join(" ")}
              >
                <button
                  className="active:scale-95 transition"
                  aria-label="Search"
                  onClick={() => setOpen(true)}
                >
                  <FiSearch className="w-5 h-5" />
                </button>

                <button
                  className="text-2xl leading-none active:scale-95 transition"
                  onClick={() => setOpen(true)}
                  aria-label="Open Menu"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              ref={mobileMenuRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] p-6"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

              {/* Mobile Search - Using SearchBar component */}
              <div className="mb-7">
                <SearchBar onCloseMobileMenu={() => setOpen(false)} />
              </div>

              {/* Quick Icons */}
              <div className="flex justify-around mb-7 text-gray-900">
                <MobileIcon label="Wishlist" to="/wishlist">
                  <FiHeart className="w-6 h-6" />
                </MobileIcon>
                <MobileIcon label="Cart" to="/cart">
                  <div className="relative">
                    <FiShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#b2965a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </MobileIcon>
                {user ? (
                  <MobileIcon label="Account" to="/profile">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0) ||
                          user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </MobileIcon>
                ) : (
                  <MobileIcon label="Login" to="/login">
                    <FiUser className="w-6 h-6" />
                  </MobileIcon>
                )}
              </div>

              {/* Mobile Categories */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {categories.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <NavLink
                      to={`/category/${item.category}`}
                      className={({ isActive }) =>
                        [
                          "block py-4 px-4 rounded-xl border text-sm font-medium text-center transition",
                          isActive
                            ? "bg-[#fef8e9] text-[#b2965a] border-[#b2965a]"
                            : "bg-white text-gray-900 border-gray-200 hover:bg-[#fef8e9] hover:text-[#b2965a]",
                        ].join(" ")
                      }
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.title}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              {/* Auth Section in Mobile */}
              {user && (
                <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="flex gap-2 mt-3">
                    <NavLink
                      to="/profile"
                      className="flex-1 text-center py-2 text-sm bg-white border rounded-xl"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/user-orders"
                      className="flex-1 text-center py-2 text-sm bg-white border rounded-xl"
                      onClick={() => setOpen(false)}
                    >
                      Orders
                    </NavLink>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full mt-3 py-2 rounded-xl bg-red-50 text-red-600 font-medium flex items-center justify-center gap-2"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}

              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-medium active:scale-[0.98] transition"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ✅ Mobile Icon Component */
const MobileIcon = ({ children, label, to }) => (
  <NavLink to={to} className="flex flex-col items-center gap-2 text-sm">
    {children}
    <span>{label}</span>
  </NavLink>
);

export default Navbar;