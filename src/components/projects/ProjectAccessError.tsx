import { AlertTriangle, FolderX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiError } from "@/lib/api";

/** Error state for project pages: "not found / no access" for 403/404, otherwise a retryable error. */
export function ProjectAccessError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const noAccess = error instanceof ApiError && (error.status === 403 || error.status === 404);
  return (
    <EmptyState
      tone={noAccess ? "neutral" : "error"}
      icon={noAccess ? FolderX : AlertTriangle}
      title={noAccess ? "Project not found" : "Could not load project"}
      description={noAccess ? "This project doesn't exist or you don't have access to it." : error.message}
      action={
        noAccess ? (
          <Link href="/projects" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none">
            Go to your projects
          </Link>
        ) : (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
