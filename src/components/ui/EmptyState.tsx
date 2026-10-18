import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
  /** Heading level: h2 for page-level states, h3 when nested under a section heading. */
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  headingLevel: Heading = "h2",
  className,
}: EmptyStateProps) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-full",
            tone === "error" ? "bg-error/10 text-error" : "bg-primary-subtle text-primary",
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <Heading className="text-base font-semibold text-text-primary">{title}</Heading>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
