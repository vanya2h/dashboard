import { cn } from "~/lib/utils";

export type ReadingColumnProps = React.ComponentProps<"div">;

export function ReadingColumn({ className, children, ...restProps }: ReadingColumnProps) {
  return (
    <div {...restProps} className={cn("flex flex-col grow max-w-3xl w-full mx-auto px-2 sm:px-4 lg:px-8", className)}>
      {children}
    </div>
  );
}
