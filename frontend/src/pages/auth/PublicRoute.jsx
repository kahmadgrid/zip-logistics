import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    const dashMap = {
      ROLE_ADMIN:  '/admin/dashboard',
      ROLE_DRIVER: '/driver/dashboard',
      ROLE_USER:   '/user/dashboard',
    };

    return <Navigate to={dashMap[user.role] ?? '/'} replace />;
  }

  return children;
}