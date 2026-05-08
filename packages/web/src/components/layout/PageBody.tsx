import { cn } from "~/lib/utils";

export type PageBodyProps = React.ComponentProps<"main">;

export function PageBody({ className, children, ...restProps }: PageBodyProps) {
  return (
    <main {...restProps} className={cn("flex flex-col grow", className)}>
      {children}
    </main>
  );
}
