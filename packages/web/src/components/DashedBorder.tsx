import type React from "react";

import { cn } from "~/lib/utils";

export type DashedBorderProps = React.ComponentProps<"svg"> & {
  borderRadius?: number;
};

export function DashedBorder({ className, borderRadius = 12, ...restProps }: DashedBorderProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      {...restProps}
      className={cn("absolute inset-0", className)}
    >
      <rect
        width="100%"
        height="100%"
        fill="none"
        rx={borderRadius}
        ry={borderRadius}
        strokeWidth="2"
        strokeDasharray="5, 10"
        strokeDashoffset="0"
        strokeLinecap="square"
        className="stroke-border"
      />
    </svg>
  );
}
