"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as memberService from "@/services/member.service";
import { projectKeys } from "./useProjects";
import { taskKeys } from "./useTasks";

export const memberKeys = {
  list: (projectId: string) => ["members", projectId] as const,
};

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: memberKeys.list(projectId),
    queryFn: () => memberService.getMembers(projectId),
  });
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => memberService.addMember(projectId, email),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) }),
        queryClient.invalidateQueries({ queryKey: projectKeys.all }),
      ]),
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => memberService.removeMember(projectId, userId),
    // Removing a member also unassigns their tasks, so task lists change too.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) }),
        queryClient.invalidateQueries({ queryKey: projectKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.project(projectId) }),
      ]),
  });
}
