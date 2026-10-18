import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

interface AvatarProps {
  name: string;
  /** Tooltip and screen-reader text; defaults to the name. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const sizes = {
  sm: "size-6 text-[10px]",
  md: "size-9 text-xs",
};

export function Avatar({ name, label = name, size = "md", className }: AvatarProps) {
  return (
    <span
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary-dark",
        sizes[size],
        className,
      )}
    >
      <span aria-hidden="true">{getInitials(name)}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
