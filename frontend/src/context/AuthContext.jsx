import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLogoutHandler } from '../services/api'; // adjust path if needed
import toast from 'react-hot-toast'; // optional but recommended

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setReady(true);
  }, []);

useEffect(() => {
  setLogoutHandler(logout);
}, []);

  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    toast.error('Session expired. Please login again.'); // optional
    localStorage.clear();
    setToken(null);
    setUser(null);
    navigate('/login'); // ✅ smooth redirect
  };

  const isAdmin  = user?.role === 'ROLE_ADMIN';
  const isDriver = user?.role === 'ROLE_DRIVER';
  const isUser   = user?.role === 'ROLE_USER';

  return (
    <AuthContext.Provider value={{
      user, setUser,
      token,
      login, logout,
      isAdmin, isDriver, isUser,
      ready,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);