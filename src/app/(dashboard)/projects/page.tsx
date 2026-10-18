"use client";

import { AlertTriangle, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const projects = useProjects();
  const [createOpen, setCreateOpen] = useState(false);

  const newProjectButton = (
    <Button onClick={() => setCreateOpen(true)}>
      <Plus className="size-4" aria-hidden="true" />
      New Project
    </Button>
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-text-secondary">All the projects you own or are a member of.</p>
        </div>
        {newProjectButton}
      </div>

      {projects.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading projects">
          {[0, 1, 2].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.isError ? (
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title="Could not load projects"
          description={projects.error.message}
          action={
            <Button variant="secondary" onClick={() => void projects.refetch()} loading={projects.isFetching}>
              Try again
            </Button>
          }
        />
      ) : projects.data.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to start organizing your tasks on a board."
          action={newProjectButton}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
