"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Input, type InputProps } from "./Input";

/** Password field with a show/hide toggle. */
export function PasswordInput({ id, ...props }: Omit<InputProps, "type" | "endAdornment">) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      id={inputId}
      type={visible ? "text" : "password"}
      // Keep browsers from offering to autocorrect or capitalise a revealed password.
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={inputId}
          aria-pressed={visible}
          className="flex size-10 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      }
    />
  );
}
