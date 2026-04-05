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

// Auto-logout only on 401 (unauthenticated / expired token).
// 403 means "forbidden for this user" — logging out is confusing and wrong for that case.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginPage = window.location.pathname === '/login';

    if (err.response?.status === 401 && !isLoginPage) {
      if (onLogout) onLogout();
    }

    return Promise.reject(err);
  }
);
let onLogout = null;

export const setLogoutHandler = (logoutFn) => {
  onLogout = logoutFn;
};
export default api;
