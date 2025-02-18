import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

// Add interceptor to automatically add token to header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Or get token from Redux
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;