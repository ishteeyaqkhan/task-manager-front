"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { STATUS_LABELS, type Task, type TaskStatus } from "@/types";
import { SortableTaskCard } from "./TaskCard";

export const columnDroppableId = (status: TaskStatus) => `column:${status}`;

const accents: Record<TaskStatus, string> = {
  TODO: "bg-text-secondary/50",
  IN_PROGRESS: "bg-primary",
  DONE: "bg-success",
};

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  /** True while a dragged card is over this column. */
  highlighted?: boolean;
  onAddTask: (status: TaskStatus) => void;
  onOpenTask: (task: Task) => void;
}

export function TaskColumn({ status, tasks, highlighted = false, onAddTask, onOpenTask }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id: columnDroppableId(status), data: { type: "column", status } });
  const headingId = `column-heading-${status}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex w-[85vw] max-w-sm shrink-0 snap-start flex-col rounded-lg border border-border bg-background-secondary sm:w-80",
        "md:w-auto md:max-w-none md:min-w-0 md:shrink",
        highlighted && "border-primary/40 bg-primary-subtle",
      )}
    >
      <header className="flex h-12 items-center px-3">
        <h2 id={headingId} className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <span className={cn("size-2 rounded-full", accents[status])} aria-hidden="true" />
          {STATUS_LABELS[status]}
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-text-secondary">
            {tasks.length}
            <span className="sr-only"> tasks</span>
          </span>
        </h2>
      </header>

      <SortableContext id={status} items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        {/* Margin, not padding: the drop zone must line up with the cards for keyboard arrow navigation. */}
        <ul ref={setNodeRef} className="mx-3 mb-3 flex min-h-32 flex-1 flex-col gap-2">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
          {tasks.length === 0 && (
            <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-sm text-text-secondary">
              No tasks
            </li>
          )}
        </ul>
      </SortableContext>

      <div className="px-3 pb-3">
        <Button variant="ghost" className="w-full justify-start" onClick={() => onAddTask(status)}>
          <Plus className="size-4" aria-hidden="true" />
          Add task
          <span className="sr-only"> to {STATUS_LABELS[status]}</span>
        </Button>
      </div>
    </section>
  );
}
