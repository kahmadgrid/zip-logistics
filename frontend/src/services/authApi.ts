import { http } from "./http";
import type { AuthResponse, Role } from "./types";

export type RegisterPayload = {
  email: string;
  mobile: string;
  password: string;
  fullName: string;
  role: Role;
};

export type LoginPayload = {
  emailOrMobile: string;
  password: string;
};

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await http.post<AuthResponse>("/api/auth/register", payload);
    return data;
  },
  login: async (payload: LoginPayload) => {
    const { data } = await http.post<AuthResponse>("/api/auth/login", payload);
    return data;
  }
};

