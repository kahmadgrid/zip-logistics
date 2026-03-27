import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../services/types";
import type { ReactElement } from "react";

export function ProtectedRoute({ children, allow }: { children: ReactElement; allow: Role[] }) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

