import axios from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";

export const API_BASE_URL = "http://localhost:8080";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Request failed";
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error("Session expired. Please login again.");
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

