import axios from "axios";

const baseURL = import.meta.env.DEV ? "/api/v1" : import.meta.env.VITE_API_BASE;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
