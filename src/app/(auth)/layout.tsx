import { Suspense, type ReactNode } from "react";
import { GuestGuard } from "@/components/layout/GuestGuard";
import { Brand } from "@/components/layout/Sidebar";
import { PageSpinner } from "@/components/ui/Spinner";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Brand />
      </div>
      <div className="w-full max-w-md">
        {/* GuestGuard reads ?next= via useSearchParams, which needs a Suspense boundary. */}
        <Suspense fallback={<PageSpinner />}>
          <GuestGuard>{children}</GuestGuard>
        </Suspense>
      </div>
    </main>
  );
}
