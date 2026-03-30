import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginPage = window.location.pathname === '/login';

    // ❌ Don't auto logout on login page
    if (err.response?.status === 401 && !isLoginPage) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);
export default api;
