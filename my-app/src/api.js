import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: apiUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export default api;
