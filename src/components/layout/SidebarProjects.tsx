"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/cn";

const itemBase =
  "flex h-10 w-full items-center gap-2.5 rounded-md pr-2 pl-3 text-sm transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none";

/** The user's projects, listed under "Projects" in the sidebar, plus a "New project" shortcut. */
export function SidebarProjects({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const projects = useProjects();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mt-1 ml-5 border-l border-border pl-2">
      {projects.isPending ? (
        <div className="space-y-1 py-1" aria-busy="true" aria-label="Loading projects">
          {[0, 1].map((i) => (
            <div key={i} className="mx-3 my-3 h-4 animate-pulse rounded bg-background-secondary" />
          ))}
        </div>
      ) : projects.isError ? (
        <div className="px-3 py-2 text-sm text-text-secondary">
          <p>Couldn&apos;t load projects.</p>
          <button
            type="button"
            onClick={() => void projects.refetch()}
            className="mt-1 inline-flex h-10 items-center rounded-sm font-medium text-primary hover:text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      ) : (
        <ul aria-label="Your projects" className="space-y-0.5">
          {projects.data.map((project) => {
            const href = `/projects/${project.id}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const openTasks = project.taskCounts.TODO + project.taskCounts.IN_PROGRESS;
            return (
              <li key={project.id}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    itemBase,
                    active
                      ? "bg-primary-light font-medium text-primary-dark"
                      : "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
                  )}
                >
                  <span
                    className={cn("size-2 shrink-0 rounded-full", active ? "bg-primary" : "bg-border")}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  {openTasks > 0 && (
                    <span className="shrink-0 text-xs text-text-secondary tabular-nums">
                      {openTasks}
                      <span className="sr-only"> open {openTasks === 1 ? "task" : "tasks"}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className={cn(itemBase, "mt-0.5 text-text-secondary hover:bg-background-secondary hover:text-text-primary")}
      >
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        New project
      </button>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(project) => {
          onNavigate?.();
          router.push(`/projects/${project.id}`);
        }}
      />
    </div>
  );
}
