import axios from 'axios';

// Extend AxiosRequestConfig to include retryCount
declare module 'axios' {
  interface AxiosRequestConfig {
    retryCount?: number;
  }
}

// Axios base configuration
const axiosBaseConfig = {
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
  ...axiosBaseConfig,
});

const csrfApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  ...axiosBaseConfig,
});

// Configure CSRF API to handle CORS properly
csrfApi.defaults.headers.common['Accept'] = 'application/json';
csrfApi.defaults.headers.common['Content-Type'] = 'application/json';

let csrfInitialized = false;
let csrfPromise: Promise<void> | null = null;

// Export function to reset CSRF state
export const resetCSRF = () => {
  csrfInitialized = false;
};

export const initSanctum = async () => {
  if (csrfInitialized) return;

  if (!csrfPromise) {
    csrfPromise = (async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log("Initializing CSRF token...");
        }
        // Use the full URL for the CSRF endpoint
        const response = await csrfApi.get("/sanctum/csrf-cookie");
        if (process.env.NODE_ENV === 'development') {
          console.log("CSRF token initialized:", response);
          console.log("Cookies after CSRF init:", document.cookie);
        }
        csrfInitialized = true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to initialize CSRF token:", error);
        }
        csrfInitialized = false; // Reset on failure
        throw error;
      } finally {
        csrfPromise = null;
      }
    })();
  }
  
  return csrfPromise;
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
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.params, config.data);
      console.log('Request headers:', config.headers);
      console.log('Cookies:', document.cookie);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    // If CSRF token expired, refresh (but limit retries and prevent recursion)
    if (error.response?.status === 419 && error.config && error.config.retryCount < 3) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log("CSRF token mismatch detected, refreshing...");
        }
        csrfInitialized = false;
        await initSanctum();
        error.config.retryCount++;
        return api(error.config);
      } catch (csrfError) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to refresh CSRF token:", csrfError);
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('API Response Error:', error.response?.status, error.response?.config.url, error.message);
    }
    return Promise.reject(error);
  }
);

// IMPORTANT: Do not modify the CSRF token handling above
// The authentication system relies on proper CSRF token initialization
// Changing this structure will break the login and other authenticated requests

export default api;