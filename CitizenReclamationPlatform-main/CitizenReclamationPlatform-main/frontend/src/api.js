import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Use environment variable or default to local development server
const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
});


api.interceptors.request.use(
  (config) => {
    //built-in web storage object provided by the browser. local storage data is with no expiration date, session storage data is cleared when the page session ends
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;