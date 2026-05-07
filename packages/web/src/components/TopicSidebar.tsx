import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { StageNav, type StageNavStage } from "./StageNav";

import { cn } from "~/lib/utils";

export type TopicSidebarItem = { path: string; label: ReactNode };

export type TopicSidebarProps = Omit<React.ComponentProps<typeof StageNav>, "stages"> & {
  items: TopicSidebarItem[];
  reachedIndex: number;
};

export function TopicSidebar({ items, reachedIndex, className, ...restProps }: TopicSidebarProps) {
  const { pathname } = useLocation();
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const activeIndex = items.findIndex((s) => s.path === lastSegment);

  const stages: StageNavStage[] = items.map((item, i) => ({
    key: item.path,
    label: item.label,
    href: item.path,
    state: i === activeIndex ? "active" : i > reachedIndex ? "upcoming" : "done",
  }));

  return (
    <StageNav
      aria-label="Topic stages"
      stages={stages}
      className={cn("self-start sticky top-15.25", className)}
      {...restProps}
    />
  );
}
