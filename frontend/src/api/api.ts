import axios from "axios";

// Extend AxiosRequestConfig to include retryCount
declare module 'axios' {
  interface AxiosRequestConfig {
    retryCount?: number;
  }
}

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

let csrfInitialized = false;

// Export function to reset CSRF state
export const resetCSRF = () => {
  csrfInitialized = false;
};

export const initSanctum = async () => {
  if (!csrfInitialized) {
    try {
      console.log("Initializing CSRF token...");
      const response = await csrfApi.get("/sanctum/csrf-cookie");
      console.log("CSRF token initialized:", response);
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

    // CSRF initialization - but don't retry in interceptors
    if (!csrfInitialized && config.retryCount === 0) {
      await initSanctum();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
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

    return Promise.reject(error);
  }
);

export default api;