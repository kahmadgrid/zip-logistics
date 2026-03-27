import { useMemo } from "react";
import { useAuthStore } from "../store/authStore";

export function useRoleRedirect() {
  const { role } = useAuthStore();
  return useMemo(() => {
    if (role === "ROLE_ADMIN") return "/admin";
    if (role === "ROLE_DRIVER") return "/driver";
    if (role === "ROLE_USER") return "/user";
    return "/";
  }, [role]);
}

