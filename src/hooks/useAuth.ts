"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { setToken } from "@/lib/token";
import { AuthContext, authKeys } from "@/providers/AuthProvider";
import * as authService from "@/services/auth.service";
import type { AuthResponse } from "@/types";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

function useStoreSession() {
  const queryClient = useQueryClient();
  return ({ user, token }: AuthResponse) => {
    queryClient.clear();
    queryClient.setQueryData(authKeys.me, user);
    setToken(token);
  };
}

export function useLogin() {
  const storeSession = useStoreSession();
  return useMutation({ mutationFn: authService.login, onSuccess: storeSession });
}

export function useRegister() {
  const storeSession = useStoreSession();
  return useMutation({ mutationFn: authService.register, onSuccess: storeSession });
}
