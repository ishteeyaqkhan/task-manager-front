"use client";

import { ChevronDown } from "lucide-react";
import { useId, type Ref, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlBase, controlState, Field, fieldIds } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  /** Adds a first option with an empty value, e.g. "All priorities". */
  placeholder?: string;
  containerClassName?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  className,
  containerClassName,
  required,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const { describedBy } = fieldIds(selectId, hint, error);

  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlBase, controlState(Boolean(error)), "h-10 appearance-none pr-9 pl-3", className)}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
