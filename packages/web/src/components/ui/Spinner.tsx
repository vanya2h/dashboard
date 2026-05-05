import clsx from "clsx";

type Size = "xs" | "sm" | "base" | "lg";

const SIZES: Record<Size, string> = {
  xs: "w-3 h-3 border-[1.5px]",
  sm: "w-4 h-4 border-2",
  base: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export function Spinner({ size = "base", className }: { size?: Size; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full border-foreground/20 border-t-foreground animate-spin",
        SIZES[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
