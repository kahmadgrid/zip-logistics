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

    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      !isLoginPage
    ) {
      if (onLogout) onLogout(); // ✅ call logout from context
    }

    return Promise.reject(err);
  }
);
let onLogout = null;

export const setLogoutHandler = (logoutFn) => {
  onLogout = logoutFn;
};
export default api;
