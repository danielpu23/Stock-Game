import axios from "axios";
import { getToken, removeToken, removeUser } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A rejected token used to leave the app polling a protected endpoint every
    // five seconds behind a UI that still believed it was signed in.
    const isAuthRequest = error.config?.url?.startsWith("/auth");

    if (error.response?.status === 401 && !isAuthRequest) {
      removeToken();
      removeUser();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
