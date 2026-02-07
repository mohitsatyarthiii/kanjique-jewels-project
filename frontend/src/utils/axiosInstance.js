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
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !url.includes("/auth/me")) {
      // clear local user state once
      localStorage.removeItem("user");

      // Redirect based on the failing endpoint:
      // - admin API errors -> admin login
      // - other APIs -> normal user login
      if (url.includes("/api/admin")) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
