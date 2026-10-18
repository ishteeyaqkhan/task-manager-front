import { AlertCircle } from "lucide-react";

/** Form-level error banner (e.g. "Invalid email or password"). Renders nothing without a message. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-error/20 bg-error/10 p-3 text-sm text-error">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
