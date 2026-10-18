"use client";

import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BackLink } from "@/components/layout/BackLink";
import { AddMemberForm } from "@/components/members/AddMemberForm";
import { MemberList } from "@/components/members/MemberList";
import { ProjectAccessError } from "@/components/projects/ProjectAccessError";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useAddMember, useMembers, useRemoveMember } from "@/hooks/useMembers";
import { useDeleteProject, useProject, useUpdateProject } from "@/hooks/useProjects";
import type { ProjectInput } from "@/services/project.service";
import type { Member } from "@/types";

const DETAILS_FORM_ID = "project-details-form";

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const project = useProject(projectId);
  const members = useMembers(projectId);
  const updateProject = useUpdateProject(projectId);
  const deleteProject = useDeleteProject();
  const addMember = useAddMember(projectId);
  const removeMember = useRemoveMember(projectId);

  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  if (project.isPending) {
    return <PageSpinner label="Loading project settings" />;
  }

  if (project.isError) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <BackLink href="/projects" label="Projects" />
        <ProjectAccessError error={project.error} onRetry={() => void project.refetch()} />
      </div>
    );
  }

  const isOwner = project.data.role === "OWNER";

  const handleUpdate = async (input: ProjectInput) => {
    await updateProject.mutateAsync(input);
    toast.success("Project updated");
  };

  const handleAddMember = async (email: string) => {
    const member = await addMember.mutateAsync(email);
    toast.success(`${member.user.name} was added to the project`);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    const removingSelf = memberToRemove.userId === user?.id;
    removeMember.mutate(memberToRemove.userId, {
      onSuccess: () => {
        toast.success(removingSelf ? "You left the project" : `${memberToRemove.user.name} was removed`);
        setMemberToRemove(null);
        if (removingSelf) router.replace("/projects");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleDeleteProject = () => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        toast.success(`Project "${project.data.name}" deleted`);
        router.replace("/projects");
      },
      onError: (error) => toast.error(`Could not delete project: ${error.message}`),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <BackLink href={`/projects/${projectId}`} label="Back to board" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold break-words">{project.data.name} settings</h1>
        <Badge tone={isOwner ? "primary" : "neutral"}>{isOwner ? "Owner" : "Member"}</Badge>
      </div>

      {!isOwner && (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-primary-light bg-primary-subtle p-3 text-sm text-text-secondary">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>You&apos;re a member of this project. Only owners can edit project details or manage members.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold">Project details</h2>
          {isOwner ? (
            <div className="mt-4">
              <ProjectForm
                id={DETAILS_FORM_ID}
                initialValues={{ name: project.data.name, description: project.data.description }}
                onSubmit={handleUpdate}
              />
              <div className="mt-4 flex justify-end">
                <Button type="submit" form={DETAILS_FORM_ID} loading={updateProject.isPending}>
                  Save changes
                </Button>
              </div>
            </div>
          ) : (
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-text-primary">Name</dt>
                <dd className="mt-0.5 text-text-secondary">{project.data.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-text-primary">Description</dt>
                <dd className="mt-0.5 leading-relaxed whitespace-pre-line text-text-secondary">
                  {project.data.description || "No description"}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card padding="lg">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Members</h2>
            {members.isSuccess && (
              <span className="text-sm text-text-secondary">
                {members.data.length} {members.data.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>

          {isOwner && (
            <div className="mt-4 border-b border-border pb-5">
              <AddMemberForm onAdd={handleAddMember} loading={addMember.isPending} />
            </div>
          )}

          <div className="mt-4">
            {members.isPending ? (
              <PageSpinner label="Loading members" />
            ) : members.isError ? (
              <EmptyState
                tone="error"
                headingLevel="h3"
                icon={AlertTriangle}
                title="Could not load members"
                description={members.error.message}
                action={
                  <Button variant="secondary" onClick={() => void members.refetch()}>
                    Try again
                  </Button>
                }
              />
            ) : (
              <MemberList
                members={members.data}
                currentUserId={user?.id}
                canManage={isOwner}
                onRemove={setMemberToRemove}
              />
            )}
          </div>
        </Card>

        {isOwner && (
          <Card padding="lg" className="border-error/30">
            <h2 className="text-lg font-semibold">Delete project</h2>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Permanently delete this project, its tasks and memberships. This cannot be undone.
            </p>
            <Button variant="danger" className="mt-4" onClick={() => setConfirmDeleteProject(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete project
            </Button>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        loading={removeMember.isPending}
        title={memberToRemove?.userId === user?.id ? "Leave project?" : "Remove member?"}
        description={
          memberToRemove?.userId === user?.id
            ? "You will lose access to this project and its tasks."
            : `${memberToRemove?.user.name ?? "This member"} will lose access to the project. Tasks assigned to them become unassigned.`
        }
        confirmLabel={memberToRemove?.userId === user?.id ? "Leave project" : "Remove member"}
      />

      <ConfirmDialog
        open={confirmDeleteProject}
        onClose={() => setConfirmDeleteProject(false)}
        onConfirm={handleDeleteProject}
        loading={deleteProject.isPending}
        title="Delete project?"
        description={`"${project.data.name}" and all of its tasks will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete project"
      />
    </div>
  );
}
