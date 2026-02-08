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

      // IMPORTANT: do NOT perform automatic navigation here. Let UI-level
      // route guards (ProtectedRoute/AdminProtectedRoute) handle redirects
      // after auth state resolves. Automatic redirects cause homepage load
      // to be interrupted when background API calls return 401.
    }

    return Promise.reject(error);
  }
);

export default api;
