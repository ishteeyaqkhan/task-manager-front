import { Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { STATUS_LABELS, TASK_STATUSES, type Project, type TaskStatus } from "@/types";

const statusDots: Record<TaskStatus, string> = {
  TODO: "bg-text-secondary/50",
  IN_PROGRESS: "bg-primary",
  DONE: "bg-success",
};

export function ProjectCard({ project }: { project: Project }) {
  const { taskCounts } = project;
  const donePercent = taskCounts.total > 0 ? Math.round((taskCounts.DONE / taskCounts.total) * 100) : 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "group flex h-full flex-col rounded-lg border border-border bg-background p-5 transition-colors",
        "hover:border-primary/40 hover:bg-primary-subtle/40",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary group-hover:text-primary-dark">{project.name}</h2>
        <Badge tone={project.role === "OWNER" ? "primary" : "neutral"}>
          {project.role === "OWNER" ? "Owner" : "Member"}
        </Badge>
      </div>

      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-text-secondary">
        {project.description || "No description"}
      </p>

      <dl className="mt-4 flex flex-wrap gap-2">
        {TASK_STATUSES.map((status) => (
          <div
            key={status}
            className="flex flex-row-reverse items-center gap-1.5 rounded-md bg-background-secondary px-2.5 py-1.5 text-sm"
          >
            <dt className="text-text-secondary">{STATUS_LABELS[status]}</dt>
            <dd className="flex items-center gap-1.5 font-semibold text-text-primary">
              <span className={cn("size-2 shrink-0 rounded-full", statusDots[status])} aria-hidden="true" />
              {taskCounts[status]}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
          </span>
          <span>
            {taskCounts.total === 0 ? "No tasks yet" : `${donePercent}% done`}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-secondary"
          role="progressbar"
          aria-label="Tasks completed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={donePercent}
        >
          <div className="h-full rounded-full bg-success" style={{ width: `${donePercent}%` }} />
        </div>
      </div>
    </Link>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-background p-5" aria-hidden="true">
      <div className="h-5 w-2/3 animate-pulse rounded bg-background-secondary" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-background-secondary" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-background-secondary" />
      <div className="mt-4 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-md bg-background-secondary" />
        ))}
      </div>
      <div className="mt-5 h-1.5 animate-pulse rounded-full bg-background-secondary" />
    </div>
  );
}
