import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/protect/ProtectedRoute";
import Navbar from "./components/navigation/Navbar";
import AdminProtectedRoute from "./components/protect/AdminProtectedRoute";
import Footer from "./components/navigation/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { CartNotificationProvider } from "./context/CartNotificationContext";
import WhatsAppFloat from "./components/WhatsAppFloat";

const SignupPage = lazy(() => import("./components/auth/SignupPage"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const CategoryPage = lazy(() => import("./pages/category/CategoryPage"));
const ProductPage = lazy(() => import("./pages/category/ProductPage"));
const OrdersPage = lazy(() => import("./pages/dashboard/components/OrdersPage"));
const CartPage = lazy(() => import("./pages/dashboard/components/CartPage"));
const TestCheckoutPage = lazy(() => import("./pages/payments/PaymentPage"));
const BuyNowCheckout = lazy(() => import("./pages/payments/BuyNowCheckout"));
const SuccessPage = lazy(() => import("./pages/payments/components/SuccessPage"));
const FailurePage = lazy(() => import("./pages/payments/components/FailurePage"));
const ProfilePage = lazy(() => import("./pages/dashboard/ProfilePage"));
const UsersOrdersPage = lazy(() => import("./pages/dashboard/UsersOrdersPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AboutUs = lazy(() => import("./pages/AboutPage"));
const ContactUs = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ShippingReturns = lazy(() => import("./pages/ShippingPolicyPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsAndConditions"));
const AdminProducts = lazy(() => import("./pages/dashboard/components/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/dashboard/components/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/dashboard/components/AdminOrders"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

function App() {

  const location = useLocation();   // ✅ VERY IMPORTANT FIX

  // ✅ admin routes pe Navbar & Footer hide
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      <CartNotificationProvider>
        <div>
          {/* Navbar */}
          {!isAdminRoute && <Navbar />}

          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>}>
          <Routes>

  {/* ---------- PUBLIC / USER ROUTES ---------- */}
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutUs />} />
  <Route path="/contact" element={<ContactUs />} />
  <Route path="/faqs" element={<FAQPage />} />
  <Route path="/terms-conditions" element={<TermsConditions />} />
  <Route path="/shipping-returns" element={<ShippingReturns />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/login" element={<LoginPage />} />

  <Route path="/category/:category/:subcategory" element={<CategoryPage />} />
  <Route path="/category/:category" element={<CategoryPage />} />
  <Route path="/product/:id" element={<ProductPage />} />
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/products" element={<ProductsPage />} />
  <Route path="/search" element={<ProductsPage />} />

  <Route
    path="/cart"
    element={
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/user-orders"
    element={
      <ProtectedRoute>
        <UsersOrdersPage />
      </ProtectedRoute>
    }
  />

  <Route path="/checkout" element={<TestCheckoutPage />} />
  <Route 
    path="/checkout/buy-now" 
    element={
      <ProtectedRoute>
        <BuyNowCheckout />
      </ProtectedRoute>
    } 
  />
  <Route path="/checkout/success" element={<SuccessPage />} />
  <Route path="/checkout/failure" element={<FailurePage />} />

  {/* ================== ADMIN SECTION ================== */}

  {/* 👉 STEP 1: /admin = ADMIN LOGIN PAGE */}
  <Route path="/admin" element={<AdminLogin />} />

  {/* 👉 STEP 2: All real admin pages UNDER protection */}
  <Route element={<AdminProtectedRoute />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/products" element={<AdminProducts />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
  </Route>

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" />} />

</Routes>
          </Suspense>

          {/* Footer */}
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <WhatsAppFloat />}
        </div>
      </CartNotificationProvider>
    </>
  );
}

export default App
