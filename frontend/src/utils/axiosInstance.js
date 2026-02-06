import axios from "axios";

// Dynamic base URL based on environment
const getBaseURL = () => {
  const isProduction = window.location.hostname !== "localhost";

  if (isProduction) {
    return "https://api.kanjiquejewels.com";
  } else {
    return "http://localhost:5000";
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,   // ✅ MUST for cookies
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `${config.method.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.config?.url
    );

    if (error.response?.status === 401) {
      // Clear only user (token cookies are httpOnly anyway)
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
