import type { ReactNode } from "react";

export const controlBase =
  "w-full rounded-md border bg-background text-sm text-text-primary placeholder:text-text-secondary/70 " +
  "transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-background-secondary disabled:opacity-70";

export function controlState(hasError: boolean): string {
  return hasError
    ? "border-error focus:border-error focus:ring-error/20"
    : "border-border focus:border-primary focus:ring-primary/20";
}

/** ids used to link a control to its hint and error text. */
export function fieldIds(id: string, hint?: string, error?: string) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return { hintId, errorId, describedBy };
}

interface FieldProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label above, control, then hint and inline error text. */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const { hintId, errorId } = fieldIds(id, hint, error);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
          {required && (
            <span className="ml-0.5 text-error" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
