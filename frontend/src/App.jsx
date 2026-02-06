import { Route, Routes, useLocation } from "react-router-dom";
import SignupPage from "./components/auth/SignupPage";
import LoginPage from "./components/auth/LoginPage";
import Dashboard from "./pages/dashboard/ProfilePage";
import ProtectedRoute from "./components/protect/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Navbar from "./components/navigation/Navbar";
import AdminProtectedRoute from "./components/protect/AdminProtectedRoute";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Footer from "./components/navigation/Footer";
import CategoryPage from "./pages/category/CategoryPage";
import ProductPage from "./pages/category/ProductPage";
import OrdersPage from "./pages/dashboard/components/OrdersPage";
import CartPage from "./pages/dashboard/components/CartPage";
import TestCheckoutPage from "./pages/payments/PaymentPage";
import SuccessPage from "./pages/payments/components/SuccessPage";
import FailurePage from "./pages/payments/components/FailurePage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import UsersOrdersPage from "./pages/dashboard/UsersOrdersPage";
import ScrollToTop from "./components/ScrollToTop";
import ProductsPage from "./pages/ProductsPage";
import { CartNotificationProvider } from "./context/CartNotificationContext";
import AboutUs from "./pages/AboutPage";
import ContactUs from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import ShippingReturns from "./pages/ShippingPolicyPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsAndConditions";
import AdminProducts from "./pages/dashboard/components/AdminProducts";
import AdminUsers from "./pages/dashboard/components/AdminUsers";
import AdminOrders from "./pages/dashboard/components/AdminOrders";

import { useLocalization } from "./hooks/useLocalization";
import { LocalizationProvider } from "./context/LocalizationContext";

function App() {


  // ✅ admin routes pe Navbar & Footer hide
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      <CartNotificationProvider>
        <div>
          {/* Navbar */}
          {!isAdminRoute && <Navbar />}

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/shipping-returns" element={<ShippingReturns />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/category/:category/:subcategory"
              element={<CategoryPage />}
            />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />

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

            {/* 🔐 Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminProtectedRoute>
                  <AdminProducts />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminProtectedRoute>
                  <AdminOrders />
                </AdminProtectedRoute>
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

            <Route path="/test-checkout" element={<TestCheckoutPage />} />
            <Route path="/checkout/success" element={<SuccessPage />} />
            <Route path="/checkout/failure" element={<FailurePage />} />
          </Routes>

          {/* Footer */}
          {!isAdminRoute && <Footer />}
        </div>
      </CartNotificationProvider>
      
    </>
  );
}

export default App;
