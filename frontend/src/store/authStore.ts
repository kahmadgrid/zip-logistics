import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, Role } from "../services/types";

type AuthState = {
  token: string | null;
  email: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (payload: AuthResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      isAuthenticated: false,
      login: (payload) =>
        set({
          token: payload.token,
          email: payload.email,
          role: payload.role,
          isAuthenticated: true
        }),
      logout: () =>
        set({
          token: null,
          email: null,
          role: null,
          isAuthenticated: false
        })
    }),
    {
      name: "zip-logistics-auth"
    }
  )
);

