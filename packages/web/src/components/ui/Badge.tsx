import clsx from "clsx";
import type { ComponentProps } from "react";

type Variant = "neutral" | "success" | "warning" | "danger";

const VARIANTS: Record<Variant, string> = {
  neutral: "bg-muted text-foreground border-border",
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
};

type Props = ComponentProps<"span"> & { variant?: Variant };

export function Badge({ variant = "neutral", className, ...props }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] border",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
