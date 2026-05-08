import { cn } from "~/lib/utils";

export type ContainerProps = React.ComponentProps<"div">;

export function Container({ className, children, ...restProps }: ContainerProps) {
  return (
    <div
      {...restProps}
      className={cn("relative max-w-360 mx-auto border-x border-border min-h-screen flex flex-col", className)}
    >
      {children}
    </div>
  );
}
