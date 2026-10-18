"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { clearToken, getToken, subscribeToken } from "@/lib/token";
import { getMe } from "@/services/auth.service";
import type { User } from "@/types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  error: Error | null;
  retry: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// `undefined` = not yet known (server render / hydration); `null` = no token.
const getServerToken = () => undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useSyncExternalStore<string | null | undefined>(subscribeToken, getToken, getServerToken);

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });

  let status: AuthStatus;
  if (token === undefined) status = "loading";
  else if (token === null) status = "unauthenticated";
  else if (meQuery.isSuccess) status = "authenticated";
  else if (meQuery.isError) status = "error";
  else status = "loading";

  const { refetch } = meQuery;
  const retry = useCallback(() => void refetch(), [refetch]);

  const logout = useCallback(() => {
    clearToken();
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: status === "authenticated" ? (meQuery.data ?? null) : null,
      error: meQuery.error,
      retry,
      logout,
    }),
    [status, meQuery.data, meQuery.error, retry, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
