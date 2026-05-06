import { cn } from "~/lib/utils";

export type NavButtonProps = React.ComponentProps<"button"> & {
  align?: "left" | "right";
};

export function NavButton({ align = "left", className, children, ...restProps }: NavButtonProps) {
  return (
    <button
      type="button"
      {...restProps}
      className={cn(
        "flex flex-col gap-1 p-4 rounded-xl border border-border bg-background-layer hover:bg-background-active hover:border-border-hover transition-colors cursor-pointer overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed",
        align === "right" ? "items-end text-right" : "text-left",
        className,
      )}
    >
      {children}
    </button>
  );
}
