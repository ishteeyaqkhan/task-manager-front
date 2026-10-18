import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// A 401 here means bad credentials, not an expired session, so never redirect.
export function register(input: RegisterInput) {
  return api.post<AuthResponse>("/auth/register", input, { redirectOn401: false });
}

export function login(input: LoginInput) {
  return api.post<AuthResponse>("/auth/login", input, { redirectOn401: false });
}

export function getMe() {
  return api.get<User>("/auth/me");
}
