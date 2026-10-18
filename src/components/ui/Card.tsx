import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "md" | "lg";
  shadow?: boolean;
}

const paddings = {
  none: "",
  md: "p-4",
  lg: "p-6",
};

export function Card({ padding = "md", shadow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-background", shadow && "shadow-sm", paddings[padding], className)}
      {...props}
    />
  );
}
