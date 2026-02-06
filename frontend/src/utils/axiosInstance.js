import axios from "axios";

// Debug environment variables
console.log("Environment:", import.meta.env.MODE);
console.log("API Base URL:", import.meta.env.VITE_API_BASE);

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000",
  withCredentials: true, // CRITICAL for httpOnly cookies
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request Interceptor - Add debug info
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('With Credentials:', config.withCredentials);
    
    // For file uploads, remove Content-Type header (browser will set it automatically)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required or session expired');
      
      // Don't retry if already retrying
      if (originalRequest._retry) {
        console.log('Already retried, redirecting to login');
        
        // Clear any stored tokens (if using localStorage)
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Redirect to login page with current location
        const currentPath = window.location.pathname + window.location.search;
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        console.log('🔄 Attempting to refresh token/session...');
        
        // Try to refresh the session (if your backend has refresh endpoint)
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/refresh`,
          { withCredentials: true }
        );
        
        if (refreshResponse.data.success) {
          console.log('✅ Session refreshed successfully');
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Session refresh failed:', refreshError);
        
        // Clear user data
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Redirect to login
        const currentPath = window.location.pathname + window.location.search;
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    // Handle 403 Forbidden - User doesn't have permission
    if (error.response?.status === 403) {
      console.error('⛔ Access forbidden - insufficient permissions');
      // You can show a modal or redirect to appropriate page
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Resource not found');
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('💥 Server error');
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error - server might be down');
      // Show user-friendly message
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API calls
export const apiHelper = {
  // GET request with error handling
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // POST request with error handling
  post: async (url, data, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // PUT request with error handling
  put: async (url, data, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // DELETE request with error handling
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // PATCH request with error handling
  patch: async (url, data, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // Upload files with progress
  upload: async (url, formData, onProgress = null) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  }
};

export default api;