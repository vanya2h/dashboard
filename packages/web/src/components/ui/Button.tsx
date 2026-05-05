import { Button as BaseButton } from "@base-ui-components/react/button";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "destructive" | "ghost" | "on-dark";
type Size = "xs" | "sm" | "base";

type Props = ComponentProps<typeof BaseButton> & {
  variant?: Variant;
  size?: Size;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "bg-background text-foreground border border-border hover:bg-muted/40",
  destructive: "bg-red-600 text-white border border-red-600 hover:bg-red-700",
  ghost: "bg-transparent text-foreground hover:bg-muted/40",
  "on-dark": "bg-white text-neutral-900 hover:bg-white/90",
};

const SIZES: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-9 px-3.5 text-sm",
  base: "h-10 px-4 text-sm",
};

export function Button({ variant = "secondary", size = "sm", className, ...props }: Props) {
  return (
    <BaseButton
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
