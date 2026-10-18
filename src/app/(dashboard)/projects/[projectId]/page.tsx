"use client";

import { AlertTriangle, Plus, SearchX, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BackLink } from "@/components/layout/BackLink";
import { ProjectAccessError } from "@/components/projects/ProjectAccessError";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useMembers } from "@/hooks/useMembers";
import { useProject } from "@/hooks/useProjects";
import { useCreateTask, useDeleteTask, useMoveTask, useTasks, useUpdateTask } from "@/hooks/useTasks";
import type { TaskFilters as TaskFilterValues, TaskInput } from "@/services/task.service";
import { PRIORITIES, TASK_STATUSES, type Priority, type Task, type TaskStatus } from "@/types";

const TASK_FORM_ID = "task-form";

type Editor = { mode: "create"; status: TaskStatus } | { mode: "edit"; task: Task } | null;

export default function ProjectBoardPage() {
  // The board reads filters from the URL via useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense fallback={<PageSpinner label="Loading board" />}>
      <ProjectBoard />
    </Suspense>
  );
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Filters from the URL; invalid values are ignored rather than sent to the API. */
function useBoardFilters() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";
  const priorityParam = searchParams.get("priority");
  const priority = PRIORITIES.includes(priorityParam as Priority) ? (priorityParam as Priority) : undefined;
  const assigneeParam = searchParams.get("assigneeId") ?? "";
  const assigneeId = UUID_PATTERN.test(assigneeParam) ? assigneeParam : undefined;
  const filters: TaskFilterValues = { search: search || undefined, priority, assigneeId };
  return { search, priority, assigneeId, filters };
}

function ProjectBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { search, priority, assigneeId, filters } = useBoardFilters();
  const toast = useToast();

  const project = useProject(projectId);
  const tasks = useTasks(projectId, filters);
  const members = useMembers(projectId);
  const memberList = members.data ?? [];
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const moveTask = useMoveTask(projectId);

  const [editor, setEditor] = useState<Editor>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);

  const handleMove = (taskId: string, status: TaskStatus, position: number) => {
    moveTask.mutate(
      { taskId, status, position },
      { onError: (error) => toast.error(`Could not move task: ${error.message}`) },
    );
  };

  const handleSubmit = async (input: TaskInput) => {
    if (editor?.mode === "edit") {
      await updateTask.mutateAsync({ taskId: editor.task.id, input });
      toast.success("Task updated");
    } else {
      await createTask.mutateAsync(input);
      toast.success("Task created");
    }
    setEditor(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteTask.mutate(confirmDelete.id, {
      onSuccess: () => {
        toast.success("Task deleted");
        setConfirmDelete(null);
        setEditor(null);
      },
      onError: (error) => toast.error(`Could not delete task: ${error.message}`),
    });
  };

  if (project.isError) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink href="/projects" label="Projects" />
        <ProjectAccessError error={project.error} onRetry={() => void project.refetch()} />
      </div>
    );
  }

  const hasFilters = Boolean(filters.search || filters.priority || filters.assigneeId);
  const saving = createTask.isPending || updateTask.isPending;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
      <BackLink href="/projects" label="Projects" />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {project.isPending ? (
            <div className="h-8 w-56 animate-pulse rounded bg-border/60" aria-hidden="true" />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold break-words">{project.data.name}</h1>
                <Badge tone={project.data.role === "OWNER" ? "primary" : "neutral"}>
                  {project.data.role === "OWNER" ? "Owner" : "Member"}
                </Badge>
              </div>
              {project.data.description && (
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">{project.data.description}</p>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-text-primary transition-colors hover:bg-background-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Settings className="size-4" aria-hidden="true" />
            {project.data?.role === "OWNER" ? "Settings" : "Members"}
          </Link>
          <Button onClick={() => setEditor({ mode: "create", status: "TODO" })}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <TaskFilters
          search={search}
          priority={priority}
          assigneeId={assigneeId}
          members={memberList}
          membersUnavailable={members.isError}
          updating={tasks.isFetching && tasks.isPlaceholderData}
        />
      </div>

      {tasks.isPending ? (
        <BoardSkeleton />
      ) : tasks.isError ? (
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title="Could not load tasks"
          description={tasks.error.message}
          action={
            <Button variant="secondary" onClick={() => void tasks.refetch()} loading={tasks.isFetching}>
              Try again
            </Button>
          }
        />
      ) : hasFilters && tasks.data.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching tasks"
          description="No tasks match your search and filters. Try a different search or clear the filters."
        />
      ) : (
        <TaskBoard
          tasks={tasks.data}
          onMove={handleMove}
          onAddTask={(status) => setEditor({ mode: "create", status })}
          onOpenTask={(task) => setEditor({ mode: "edit", task })}
        />
      )}

      <Modal
        open={editor !== null}
        onClose={() => setEditor(null)}
        title={editor?.mode === "edit" ? "Edit task" : "New task"}
        size="lg"
        footer={
          <>
            {editor?.mode === "edit" && (
              <Button
                variant="ghost"
                className="text-error hover:bg-error/10 hover:text-error sm:mr-auto"
                onClick={() => setConfirmDelete(editor.task)}
                disabled={saving}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditor(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form={TASK_FORM_ID} loading={saving}>
              {editor?.mode === "edit" ? "Save changes" : "Create task"}
            </Button>
          </>
        }
      >
        {editor && (
          <TaskForm
            key={editor.mode === "edit" ? editor.task.id : `new-${editor.status}`}
            id={TASK_FORM_ID}
            task={editor.mode === "edit" ? editor.task : undefined}
            defaultStatus={editor.mode === "create" ? editor.status : undefined}
            members={memberList}
            membersUnavailable={members.isError}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleteTask.isPending}
        title="Delete task?"
        description={`"${confirmDelete?.title ?? ""}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete task"
      />
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-busy="true" aria-label="Loading tasks">
      {TASK_STATUSES.map((status) => (
        <div key={status} className="rounded-lg border border-border bg-background-secondary p-3">
          <div className="mb-3 h-5 w-24 animate-pulse rounded bg-border/60" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-2 h-20 animate-pulse rounded-lg bg-background" />
          ))}
        </div>
      ))}
    </div>
  );
}
