"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import * as taskService from "@/services/task.service";
import type { MoveTaskInput, TaskFilters, TaskInput } from "@/services/task.service";
import type { Task } from "@/types";
import { projectKeys } from "./useProjects";

export const taskKeys = {
  project: (projectId: string) => ["tasks", projectId] as const,
  list: (projectId: string, filters: TaskFilters) => [...taskKeys.project(projectId), filters] as const,
};

export function useTasks(projectId: string, filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(projectId, filters),
    queryFn: () => taskService.getTasks(projectId, filters),
    // Keep the board on screen while a new search/filter result loads.
    placeholderData: keepPreviousData,
  });
}

/** Task changes also change the task counts shown on project cards. */
function useInvalidateProjectTasks(projectId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) }),
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    ]);
}

export function useCreateTask(projectId: string) {
  const invalidate = useInvalidateProjectTasks(projectId);
  return useMutation({
    mutationFn: (input: TaskInput) => taskService.createTask(projectId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(projectId: string) {
  const invalidate = useInvalidateProjectTasks(projectId);
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: Partial<TaskInput> }) =>
      taskService.updateTask(taskId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(projectId: string) {
  const invalidate = useInvalidateProjectTasks(projectId);
  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: invalidate,
  });
}

type MoveVariables = MoveTaskInput & { taskId: string };
type MoveContext = { snapshots: Array<[QueryKey, Task[] | undefined]> };

/** Drag-and-drop move with an optimistic update applied to every cached task list of the project. */
export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjectTasks(projectId);

  return useMutation<Task, Error, MoveVariables, MoveContext>({
    mutationFn: ({ taskId, status, position }) => taskService.moveTask(taskId, { status, position }),
    onMutate: async ({ taskId, status, position }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.project(projectId) });

      const snapshots = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.project(projectId) });
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.project(projectId) }, (tasks) =>
        tasks
          ?.map((task) => (task.id === taskId ? { ...task, status, position } : task))
          .sort((a, b) => a.position - b.position),
      );
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: invalidate,
  });
}
