import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatDueDate, getDueState, type DueState } from "@/lib/format";
import { PRIORITY_LABELS, STATUS_LABELS, type Priority, type TaskStatus } from "@/types";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error";

// Success/warning text is darkened from the token so small text meets contrast on the tint.
const tones: Record<BadgeTone, string> = {
  neutral: "border-border bg-background-secondary text-text-secondary",
  primary: "border-primary-light bg-primary-light text-primary-dark",
  success:
    "border-success/20 bg-success/10 text-[color-mix(in_oklab,var(--color-success)_75%,black)]",
  warning:
    "border-warning/20 bg-warning/10 text-[color-mix(in_oklab,var(--color-warning)_70%,black)]",
  error: "border-error/20 bg-error/10 text-error",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  title?: string;
}

export function Badge({ tone = "neutral", icon, className, children, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const statusTones: Record<TaskStatus, BadgeTone> = {
  TODO: "neutral",
  IN_PROGRESS: "primary",
  DONE: "success",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={statusTones[status]}>{STATUS_LABELS[status]}</Badge>;
}

const priorityTones: Record<Priority, BadgeTone> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "error",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={priorityTones[priority]}>
      <span className="sr-only">Priority: </span>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

const dueTones: Record<DueState, BadgeTone> = {
  overdue: "error",
  soon: "warning",
  normal: "neutral",
};

const dueLabels: Record<DueState, string> = {
  overdue: "Overdue",
  soon: "Due soon",
  normal: "Due",
};

interface DueDateBadgeProps {
  dueDate: string;
  /** Completed tasks are never shown as overdue or due soon. */
  completed?: boolean;
}

export function DueDateBadge({ dueDate, completed = false }: DueDateBadgeProps) {
  const state: DueState = completed ? "normal" : getDueState(dueDate);
  const label = formatDueDate(dueDate);
  return (
    <Badge
      tone={dueTones[state]}
      icon={<CalendarDays className="size-3.5" aria-hidden="true" />}
      title={`${dueLabels[state]}: ${label}`}
    >
      <span className="sr-only">{dueLabels[state]}: </span>
      {label}
    </Badge>
  );
}
