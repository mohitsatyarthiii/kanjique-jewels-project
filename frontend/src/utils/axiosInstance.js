import axios from "axios";

console.log("Environment:", import.meta.env.MODE);
console.log("API Base URL:", import.meta.env.VITE_API_BASE);

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000",
  withCredentials: true,   // VERY IMPORTANT for cookies
  timeout: 30000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// -------- REQUEST INTERCEPTOR --------
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // For file uploads remove JSON header
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// -------- RESPONSE INTERCEPTOR (FIXED VERSION) --------
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // ====== 🔐 HANDLE 401 (TOKEN EXPIRED) ======
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Refreshing session...");

        // IMPORTANT FIX: use SAME api instance
        await api.get("/api/auth/refresh");

        console.log("✅ Session refreshed. Retrying request...");
        return api(originalRequest); // retry original request
      } 
      catch (err) {
        console.error("❌ Refresh failed. Redirecting to login...");

        localStorage.removeItem("user");
        sessionStorage.removeItem("user");

        const redirectPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;

        return Promise.reject(err);
      }
    }

    // ====== OTHER ERRORS ======
    if (error.response?.status === 403) {
      console.error("⛔ Access forbidden");
    }

    if (error.response?.status === 404) {
      console.error("🔍 Resource not found");
    }

    if (error.response?.status >= 500) {
      console.error("💥 Server error");
    }

    if (!error.response) {
      console.error("🌐 Network error - server might be down");
    }

    return Promise.reject(error);
  }
);

// -------- HELPER FUNCTIONS (unchanged) --------
export const apiHelper = {
  get: async (url, config = {}) => {
    const res = await api.get(url, config);
    return res.data;
  },

  post: async (url, data, config = {}) => {
    const res = await api.post(url, data, config);
    return res.data;
  },

  put: async (url, data, config = {}) => {
    const res = await api.put(url, data, config);
    return res.data;
  },

  delete: async (url, config = {}) => {
    const res = await api.delete(url, config);
    return res.data;
  },

  patch: async (url, data, config = {}) => {
    const res = await api.patch(url, data, config);
    return res.data;
  },

  upload: async (url, formData, onProgress = null) => {
    const res = await api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    });
    return res.data;
  },
};

export default api;
