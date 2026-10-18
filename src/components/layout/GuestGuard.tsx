"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { safeRedirectPath } from "@/lib/validation";

/**
 * For the login/register pages: once the user is authenticated (already, or right
 * after a successful login/register), send them to `?next=` or /projects.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const next = safeRedirectPath(useSearchParams().get("next"));

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  if (status === "unauthenticated" || status === "error") {
    return <>{children}</>;
  }
  return <PageSpinner label={status === "authenticated" ? "Redirecting" : "Loading"} />;
}
