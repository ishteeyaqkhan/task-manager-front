import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-background hover:bg-primary-hover active:bg-primary-dark disabled:hover:bg-primary",
  secondary:
    "border border-border bg-background text-text-primary hover:bg-background-secondary disabled:hover:bg-background",
  danger:
    "bg-error text-background hover:bg-[color-mix(in_oklab,var(--color-error)_88%,black)] " +
    "active:bg-[color-mix(in_oklab,var(--color-error)_78%,black)] focus-visible:ring-error disabled:hover:bg-error",
  ghost: "text-text-secondary hover:bg-background-secondary hover:text-text-primary disabled:hover:bg-transparent",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-3 text-sm md:h-9",
  md: "h-10 px-4 text-sm",
  icon: "size-10",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Spinner size="sm" label="" />}
      {children}
    </button>
  );
}
