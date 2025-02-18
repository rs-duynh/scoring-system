import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Hoặc lấy token từ Redux
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;