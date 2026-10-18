"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignLeft } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { DueDateBadge, PriorityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  /** Rendered inside the DragOverlay while dragging. */
  overlay?: boolean;
}

export function TaskCard({ task, overlay = false }: TaskCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-3 text-left",
        overlay ? "cursor-grabbing border-primary/40 shadow-lg" : "shadow-sm",
      )}
    >
      <p className="line-clamp-3 text-sm leading-relaxed font-medium break-words text-text-primary">{task.title}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && <DueDateBadge dueDate={task.dueDate} completed={task.status === "DONE"} />}
        {task.description && (
          <span className="inline-flex text-text-secondary" title="Has description">
            <AlignLeft className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Has description</span>
          </span>
        )}
        {task.assignee && (
          <Avatar
            name={task.assignee.name}
            label={`Assigned to ${task.assignee.name}`}
            size="sm"
            className="ml-auto"
          />
        )}
      </div>
    </div>
  );
}

interface SortableTaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

/**
 * Draggable card. Mouse/touch drag via the sensors; keyboard: Space picks up / drops,
 * arrow keys move, Escape cancels. Click or Enter opens the edit dialog.
 */
export function SortableTaskCard({ task, onOpen }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    listeners?.onKeyDown?.(event);
    if (event.key === "Enter" && !isDragging && !event.defaultPrevented) {
      event.preventDefault();
      onOpen(task);
    }
  };

  return (
    <li>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        {...attributes}
        {...listeners}
        onKeyDown={onKeyDown}
        onClick={() => onOpen(task)}
        className={cn(
          "cursor-grab touch-manipulation rounded-lg transition-colors outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary",
          "[&>div]:hover:border-primary/40",
          isDragging && "opacity-40",
        )}
      >
        <TaskCard task={task} />
      </div>
    </li>
  );
}
