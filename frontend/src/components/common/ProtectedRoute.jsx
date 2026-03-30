import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, token, ready } = useAuth();

  if (!ready) return null;

  if (!token || !user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const dashMap = {
      ROLE_ADMIN:  '/admin/dashboard',
      ROLE_DRIVER: '/driver/dashboard',
      ROLE_USER:   '/user/dashboard',
    };
    return <Navigate to={dashMap[user.role] ?? '/login'} replace />;
  }

  return children;
}