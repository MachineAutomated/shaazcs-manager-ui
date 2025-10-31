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
      console.log("Attaching token to request:", token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
