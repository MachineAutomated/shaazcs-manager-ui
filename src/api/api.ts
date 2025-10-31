import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1", // Adjust to your backend
});

// Add interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    else {
      console.log("Token missing!!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
