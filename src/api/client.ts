import axios from "axios";
import { API_URL } from "@/config/env";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("access_token", data.access);
          if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
