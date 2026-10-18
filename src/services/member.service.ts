import { api } from "@/lib/api";
import type { Member } from "@/types";

export function getMembers(projectId: string) {
  return api.get<Member[]>(`/projects/${projectId}/members`);
}

export function addMember(projectId: string, email: string) {
  return api.post<Member>(`/projects/${projectId}/members`, { email });
}

export function removeMember(projectId: string, userId: string) {
  return api.delete<{ userId: string }>(`/projects/${projectId}/members/${userId}`);
}
