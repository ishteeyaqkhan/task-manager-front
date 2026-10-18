"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { controlBase, controlState, Field, fieldIds } from "./Field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  /** Element shown inside the right edge of the input (e.g. a show-password button). */
  endAdornment?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  hint,
  error,
  id,
  className,
  containerClassName,
  endAdornment,
  required,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { describedBy } = fieldIds(inputId, hint, error);

  const input = (
    <input
      id={inputId}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(controlBase, controlState(Boolean(error)), "h-10 px-3", endAdornment ? "pr-11" : undefined, className)}
      {...props}
    />
  );

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      {endAdornment ? (
        <div className="relative">
          {input}
          <div className="absolute inset-y-0 right-0 flex items-center">{endAdornment}</div>
        </div>
      ) : (
        input
      )}
    </Field>
  );
}
