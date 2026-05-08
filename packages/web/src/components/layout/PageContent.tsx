import type { ElementType } from "react";

import { cn } from "~/lib/utils";

export type PageContentProps = React.ComponentProps<"div"> & {
  as?: ElementType;
};

export function PageContent({ as: Tag = "div", className, children, ...restProps }: PageContentProps) {
  return (
    <Tag {...restProps} className={cn("flex flex-col grow py-2 sm:py-4 lg:py-8", className)}>
      {children}
    </Tag>
  );
}
