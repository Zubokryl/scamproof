import axios from 'axios';

// Extend AxiosRequestConfig to include retryCount
declare module 'axios' {
  interface AxiosRequestConfig {
    retryCount?: number;
  }
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

const csrfApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Configure CSRF API to handle CORS properly
csrfApi.defaults.headers.common['Accept'] = 'application/json';
csrfApi.defaults.headers.common['Content-Type'] = 'application/json';

let csrfInitialized = false;

// Export function to reset CSRF state
export const resetCSRF = () => {
  csrfInitialized = false;
};

export const initSanctum = async () => {
  if (!csrfInitialized) {
    try {
      console.log("Initializing CSRF token...");
      // Use the full URL for the CSRF endpoint
      const response = await csrfApi.get("/sanctum/csrf-cookie");
      console.log("CSRF token initialized:", response);
      console.log("Cookies after CSRF init:", document.cookie);
      csrfInitialized = true;
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
      csrfInitialized = false; // Reset on failure
      throw error;
    }
  }
};

// Interceptors
api.interceptors.request.use(
  async (config) => {
    // Initialize retry count if not present
    if (!config.retryCount) {
      config.retryCount = 0;
    }
    
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // File uploads
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Add logging
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params, config.data);
    console.log('Request headers:', config.headers);
    console.log('Cookies:', document.cookie);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    // If CSRF token expired, refresh (but limit retries and prevent recursion)
    if (error.response?.status === 419 && error.config && error.config.retryCount < 3) {
      try {
        console.log("CSRF token mismatch detected, refreshing...");
        csrfInitialized = false;
        await initSanctum();
        error.config.retryCount += 1;
        // Create a new request config to avoid axios retry issues
        const newConfig = {
          ...error.config,
          retryCount: error.config.retryCount
        };
        return api(newConfig);
      } catch (csrfError) {
        console.error("Failed to refresh CSRF token:", csrfError);
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
    }

    console.error('API Response Error:', error.response?.status, error.response?.config.url, error.message);
    return Promise.reject(error);
  }
);

// IMPORTANT: Do not modify the CSRF token handling above
// The authentication system relies on proper CSRF token initialization
// Changing this structure will break the login and other authenticated requests

export default api;