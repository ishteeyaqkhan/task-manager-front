"use client";

import { ServerCrash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Client-side route protection. The token lives in localStorage on a different
 * domain from the API, so Next middleware cannot see it.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, error, retry, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <EmptyState
          tone="error"
          icon={ServerCrash}
          title="Could not load your session"
          description={error?.message ?? "Something went wrong."}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={logout}>
                Log out
              </Button>
              <Button onClick={retry}>Try again</Button>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh">
      <PageSpinner label="Checking your session" />
    </main>
  );
}
