import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Accessible label. Pass an empty string when a parent already announces loading. */
  label?: string;
}

const sizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
};

export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <span role={label ? "status" : undefined} className={cn("inline-flex", className)}>
      <svg className={cn("animate-spin", sizes[size])} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

/** Centered spinner for a full page or section. */
export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-1 items-center justify-center text-primary">
      <Spinner size="lg" label={label} />
    </div>
  );
}
