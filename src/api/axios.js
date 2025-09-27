import axios from 'axios';

const API = axios.create({
  baseURL: 'https://makpower-sw.onrender.com/api/',
  // baseURL: 'http://127.0.0.1:8000/api/',
  
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // ✅ Token expire ho gaya — logout
      localStorage.clear();
      window.location.href = "/login"; // ya jis route par login hai
    }
    return Promise.reject(error);
  }
);

export default API;
