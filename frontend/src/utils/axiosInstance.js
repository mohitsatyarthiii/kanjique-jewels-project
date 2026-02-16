import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",   // 🔥 FINAL LIVE BACKEND
  withCredentials: true, // MUST for cookies
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const currentPath = window.location.pathname;

    // Don't redirect on 401 for auth-related calls (login, signup, /me, etc.)
    const isAuthEndpoint = url.includes("/auth/") || url.includes("/login") || url.includes("/signup");
    const isPublicPage = ["/", "/about", "/contact", "/faqs", "/products", "/category"].some(path => currentPath.startsWith(path));

    if (status === 401 && !isAuthEndpoint && !isPublicPage) {
      // Only redirect on 401 for protected API calls on protected pages
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Redirect based on the failing endpoint:
      // - admin API errors -> admin login
      // - other APIs -> normal user login
      if (url.includes("/api/admin")) {
        window.location.href = "/admin";
      } else if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/signup")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
