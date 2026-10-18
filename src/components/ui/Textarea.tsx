"use client";

import { useId, type Ref, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlBase, controlState, Field, fieldIds } from "./Field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  containerClassName,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const { describedBy } = fieldIds(textareaId, hint, error);

  return (
    <Field id={textareaId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlBase, controlState(Boolean(error)), "min-h-24 resize-y px-3 py-2 leading-relaxed", className)}
        {...props}
      />
    </Field>
  );
}
