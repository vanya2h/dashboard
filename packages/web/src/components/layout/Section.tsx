import { cn } from "~/lib/utils";

export type SectionProps = React.ComponentProps<"section">;

export function Section({ className, children, ...restProps }: SectionProps) {
  return (
    <section {...restProps} className={cn("border-b border-border last:border-b-0", className)}>
      {children}
    </section>
  );
}
