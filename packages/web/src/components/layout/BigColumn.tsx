import { cn } from "~/lib/utils";

export type BigColumnProps = React.ComponentProps<"div">;

export function BigColumn({ className, children, ...restProps }: BigColumnProps) {
  return (
    <div {...restProps} className={cn("flex flex-col grow max-w-5xl w-full mx-auto px-2 sm:px-4 lg:px-8", className)}>
      {children}
    </div>
  );
}
