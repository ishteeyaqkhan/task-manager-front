"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useCreateProject } from "@/hooks/useProjects";
import type { ProjectInput } from "@/services/project.service";
import type { Project } from "@/types";
import { ProjectForm } from "./ProjectForm";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after the project is created and the modal has closed. */
  onCreated?: (project: Project) => void;
}

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const createProject = useCreateProject();
  const toast = useToast();
  const formId = useId();

  const handleCreate = async (input: ProjectInput) => {
    const project = await createProject.mutateAsync(input);
    onClose();
    toast.success(`Project "${project.name}" created`);
    onCreated?.(project);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New project"
      description="You'll be the owner of this project."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createProject.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createProject.isPending}>
            Create project
          </Button>
        </>
      }
    >
      <ProjectForm id={formId} onSubmit={handleCreate} />
    </Modal>
  );
}
