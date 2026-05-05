import { Input as BaseInput } from "@base-ui-components/react/input";
import clsx from "clsx";
import type { ComponentProps } from "react";

const FIELD_CLASSES =
  "w-full bg-background border border-border px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:ring-inset disabled:opacity-50 disabled:cursor-not-allowed";

export function Input({ className, ...props }: ComponentProps<typeof BaseInput>) {
  return <BaseInput className={clsx(FIELD_CLASSES, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={clsx(FIELD_CLASSES, "resize-none", className)} {...props} />;
}
