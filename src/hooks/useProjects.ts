"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as projectService from "@/services/project.service";
import type { ProjectInput } from "@/services/project.service";
import type { Project } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (projectId: string) => [...projectKeys.all, "detail", projectId] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectKeys.list(), queryFn: projectService.getProjects });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getProject(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectService.createProject(input),
    onSuccess: (project) => {
      queryClient.setQueryData<Project[]>(projectKeys.list(), (current) => (current ? [...current, project] : current));
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      void queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProjectInput>) => projectService.updateProject(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: (_result, projectId) => {
      queryClient.setQueryData<Project[]>(projectKeys.list(), (current) =>
        current?.filter((project) => project.id !== projectId),
      );
      // The detail query is left in place: removing it while the project page is still
      // mounted would refetch it (404) and flash an error before the caller navigates away.
      void queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}
