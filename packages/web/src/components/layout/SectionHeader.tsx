import { Inset } from "./Inset";

import { cn } from "~/lib/utils";

export type SectionHeaderProps = React.ComponentProps<"div">;

export function SectionHeader({ className, children, ...restProps }: SectionHeaderProps) {
  return (
    <Inset
      {...restProps}
      className={cn("py-3 sm:py-4 border-b border-border flex items-center justify-between gap-4", className)}
    >
      {children}
    </Inset>
  );
}
