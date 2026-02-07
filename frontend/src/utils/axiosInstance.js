import axios from "axios";

const api = axios.create({
  baseURL: "https://api.kanjiquejewels.com",   // 🔥 FINAL LIVE BACKEND
  withCredentials: true, // MUST for cookies
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto logout on /me failure
      if (!error.config.url.includes("/auth/me")) {
        localStorage.removeItem("user");
        const url = error.config?.url || "";
        // Don't auto logout on /me failure
        if (!url.includes("/auth/me")) {
          // clear local user state
          localStorage.removeItem("user");

          // Redirect based on the failing endpoint:
          // - admin API errors -> admin login
          // - other APIs -> normal user login
          // This avoids sending every public visitor to the admin login page.
          if (url.includes("/api/admin")) {
            window.location.href = "/admin";
          } else {
            window.location.href = "/login";
          }
        }
    }
    return Promise.reject(error);
  }
);

export default api;
