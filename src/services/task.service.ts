import { api } from "@/lib/api";
import type { Priority, Task, TaskStatus } from "@/types";

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  /** YYYY-MM-DD, or null to clear. */
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface MoveTaskInput {
  status: TaskStatus;
  position: number;
}

export function getTasks(projectId: string, filters: TaskFilters = {}) {
  return api.get<Task[]>(`/projects/${projectId}/tasks`, { ...filters });
}

export function createTask(projectId: string, input: TaskInput) {
  return api.post<Task>(`/projects/${projectId}/tasks`, input);
}

export function updateTask(taskId: string, input: Partial<TaskInput>) {
  return api.patch<Task>(`/tasks/${taskId}`, input);
}

export function moveTask(taskId: string, input: MoveTaskInput) {
  return api.patch<Task>(`/tasks/${taskId}/move`, input);
}

export function deleteTask(taskId: string) {
  return api.delete<{ id: string }>(`/tasks/${taskId}`);
}
