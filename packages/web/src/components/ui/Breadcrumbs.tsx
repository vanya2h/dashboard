import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { cn } from "../../lib/cn";

function Root({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex min-w-0 grow items-center gap-1 overflow-hidden whitespace-nowrap text-sm", className)}
    >
      {children}
    </nav>
  );
}

function Link({ to, children }: { to: string; children: ReactNode }) {
  return (
    <RouterLink
      to={to}
      className="flex min-w-0 max-w-full items-center text-muted-foreground hover:text-foreground transition-colors no-underline"
    >
      <span className="truncate">{children}</span>
    </RouterLink>
  );
}

function Current({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 max-w-full items-center font-medium text-foreground" aria-current="page">
      <span className="truncate">{children}</span>
    </div>
  );
}

function Separator() {
  return (
    <span className="flex shrink-0 items-center text-muted-foreground/50" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M10.75 8.75L14.25 12L10.75 15.25"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}

export const Breadcrumbs = { Root, Link, Current, Separator };
