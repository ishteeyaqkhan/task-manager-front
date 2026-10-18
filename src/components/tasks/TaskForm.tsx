"use client";

import { useState, type FormEvent } from "react";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api";
import { toDateInputValue } from "@/lib/format";
import { compactErrors, validateText } from "@/lib/validation";
import type { TaskInput } from "@/services/task.service";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  type Member,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/types";

type Fields = "title" | "description" | "status" | "priority" | "dueDate" | "assigneeId";

interface TaskFormProps {
  /** Lets a submit button in the modal footer submit the form via `form={id}`. */
  id: string;
  /** Existing task when editing. */
  task?: Task;
  /** Initial status when creating from a column's "Add task" button. */
  defaultStatus?: TaskStatus;
  /** Project members, offered as assignees. */
  members: Member[];
  /** True when members failed to load; the assignee can't be changed. */
  membersUnavailable?: boolean;
  onSubmit: (input: TaskInput) => Promise<unknown>;
}

const statusOptions = TASK_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));
const priorityOptions = PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));

export function TaskForm({
  id,
  task,
  defaultStatus = "TODO",
  members,
  membersUnavailable = false,
  onSubmit,
}: TaskFormProps) {
  const [values, setValues] = useState<Record<Fields, string>>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? defaultStatus,
    priority: task?.priority ?? "MEDIUM",
    dueDate: toDateInputValue(task?.dueDate ?? null),
    assigneeId: task?.assigneeId ?? "",
  });

  const assigneeOptions = members.map((member) => ({ value: member.userId, label: member.user.name }));
  // Keep a current assignee selectable even if the member list hasn't caught up yet.
  if (task?.assignee && !assigneeOptions.some((option) => option.value === task.assignee?.id)) {
    assigneeOptions.push({ value: task.assignee.id, label: task.assignee.name });
  }
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const update = (field: Fields, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = compactErrors({
      title: validateText(values.title, "Title", { min: 1, max: 200 }),
      description: validateText(values.description, "Description", { max: 2000 }),
    });
    setErrors(validation);
    setFormError(null);
    if (Object.keys(validation).length > 0) return;

    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || null,
        status: values.status as TaskStatus,
        priority: values.priority as Priority,
        dueDate: values.dueDate || null,
        assigneeId: values.assigneeId || null,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      } else {
        setFormError(error instanceof Error ? error.message : "Something went wrong");
      }
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className="grid gap-4">
      <FormError message={formError} />
      <Input
        label="Title"
        value={values.title}
        onChange={(event) => update("title", event.target.value)}
        error={errors.title}
        maxLength={200}
        placeholder="What needs to be done?"
        required
        data-autofocus
      />
      <Textarea
        label="Description"
        value={values.description}
        onChange={(event) => update("description", event.target.value)}
        error={errors.description}
        maxLength={2000}
        rows={4}
        placeholder="Add more detail (optional)"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          value={values.status}
          onChange={(event) => update("status", event.target.value)}
          options={statusOptions}
          error={errors.status}
        />
        <Select
          label="Priority"
          value={values.priority}
          onChange={(event) => update("priority", event.target.value)}
          options={priorityOptions}
          error={errors.priority}
        />
        <Input
          label="Due date"
          type="date"
          value={values.dueDate}
          onChange={(event) => update("dueDate", event.target.value)}
          error={errors.dueDate}
        />
        <Select
          label="Assignee"
          value={values.assigneeId}
          onChange={(event) => update("assigneeId", event.target.value)}
          options={assigneeOptions}
          placeholder="Unassigned"
          disabled={membersUnavailable}
          hint={membersUnavailable ? "Could not load project members." : undefined}
          error={errors.assigneeId}
        />
      </div>
    </form>
  );
}
