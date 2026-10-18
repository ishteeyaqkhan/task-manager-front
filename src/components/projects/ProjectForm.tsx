"use client";

import { useState, type FormEvent } from "react";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api";
import { compactErrors, validateText } from "@/lib/validation";
import type { ProjectInput } from "@/services/project.service";

type Fields = "name" | "description";

interface ProjectFormProps {
  /** Lets a submit button outside the form (e.g. in a modal footer) submit it via `form={id}`. */
  id: string;
  initialValues?: { name: string; description: string | null };
  onSubmit: (input: ProjectInput) => Promise<unknown>;
}

export function ProjectForm({ id, initialValues, onSubmit }: ProjectFormProps) {
  const [values, setValues] = useState<Record<Fields, string>>({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
  });
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
      name: validateText(values.name, "Name", { min: 1, max: 100 }),
      description: validateText(values.description, "Description", { max: 2000 }),
    });
    setErrors(validation);
    setFormError(null);
    if (Object.keys(validation).length > 0) return;

    try {
      await onSubmit({ name: values.name.trim(), description: values.description.trim() || null });
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
        label="Name"
        value={values.name}
        onChange={(event) => update("name", event.target.value)}
        error={errors.name}
        maxLength={100}
        placeholder="e.g. Website redesign"
        required
        data-autofocus
      />
      <Textarea
        label="Description"
        value={values.description}
        onChange={(event) => update("description", event.target.value)}
        error={errors.description}
        hint="Optional. Up to 2000 characters."
        maxLength={2000}
        rows={3}
      />
    </form>
  );
}
