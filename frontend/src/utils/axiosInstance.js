import axios from "axios";

const api = axios.create({
  baseURL: "http://api.kanjiquejewels.com",   // 🔥 FINAL LIVE BACKEND
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
        window.location.href = "/admin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
