import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { StageNav, type StageNavStage } from "./StageNav";

export type TopicSidebarItem = { path: string; label: ReactNode };

export type TopicSidebarProps = {
  items: TopicSidebarItem[];
  reachedIndex: number;
  className?: string;
};

export function TopicSidebar({ items, reachedIndex, className }: TopicSidebarProps) {
  const { pathname } = useLocation();
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const activeIndex = items.findIndex((s) => s.path === lastSegment);

  const stages: StageNavStage[] = items.map((item, i) => ({
    key: item.path,
    label: item.label,
    href: item.path,
    state: i === activeIndex ? "active" : i > reachedIndex ? "upcoming" : "done",
  }));

  return <StageNav aria-label="Topic stages" stages={stages} className={className} />;
}
