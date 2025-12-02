import axios from "axios";

// Create API instance without credentials since we're using Sanctum tokens
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
});

// Create separate instance for CSRF cookie if needed for other operations
const csrfApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Function to get CSRF cookie (for non-SPA operations if needed)
export const initSanctum = async () => {
  await csrfApi.get("/sanctum/csrf-cookie");
};

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For file uploads, ensure we're using multipart/form-data
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or invalidation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;