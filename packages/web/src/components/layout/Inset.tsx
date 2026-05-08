import type { ElementType } from "react";

import { cn } from "~/lib/utils";

export type InsetProps = React.ComponentProps<"div"> & {
  as?: ElementType;
};

export function Inset({ as: Tag = "div", className, children, ...restProps }: InsetProps) {
  return (
    <Tag {...restProps} className={cn("px-4 sm:px-6 lg:px-6", className)}>
      {children}
    </Tag>
  );
}
