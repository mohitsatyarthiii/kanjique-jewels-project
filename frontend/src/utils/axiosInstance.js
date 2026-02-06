// frontend: utils/axiosInstance.js
import axios from "axios";

// Dynamic base URL based on environment
const getBaseURL = () => {
  const isProduction = window.location.hostname !== 'localhost';
  
  if (isProduction) {
    return 'https://api.kanjiquejewels.com'; // ✅ अपने production API domain के साथ replace करें
  } else {
    return 'http://localhost:5000';
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // ✅ IMPORTANT for cookies
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Debugging के लिए
    console.log(`${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      // Clear any stored data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;