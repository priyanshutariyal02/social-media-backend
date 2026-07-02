import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required for httpOnly cookies (refresh token)
});

// Request interceptor to attach access token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh access token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retrying
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        // Update Authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
