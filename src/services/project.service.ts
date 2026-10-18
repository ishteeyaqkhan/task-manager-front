import { api } from "@/lib/api";
import type { Project } from "@/types";

export interface ProjectInput {
  name: string;
  description?: string | null;
}

export function getProjects() {
  return api.get<Project[]>("/projects");
}

export function getProject(projectId: string) {
  return api.get<Project>(`/projects/${projectId}`);
}

export function createProject(input: ProjectInput) {
  return api.post<Project>("/projects", input);
}

export function updateProject(projectId: string, input: Partial<ProjectInput>) {
  return api.patch<Project>(`/projects/${projectId}`, input);
}

export function deleteProject(projectId: string) {
  return api.delete<{ id: string }>(`/projects/${projectId}`);
}
