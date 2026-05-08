import { CaretDownIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { Inset } from "./layout/Inset";

import { cn } from "~/lib/utils";

export type StageNavStageState = "active" | "done" | "upcoming";

export type StageNavStage = {
  key: string;
  label: ReactNode;
  state: StageNavStageState;
  href?: string;
};

export type StageNavProps = React.ComponentProps<"nav"> & {
  stages: StageNavStage[];
};

export function StageNav({ stages, className, ...restProps }: StageNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeIndex = stages.findIndex((s) => s.state === "active");
  const activeStage = activeIndex >= 0 ? stages[activeIndex] : null;

  return (
    <nav
      {...restProps}
      className={cn(
        "w-full self-start bg-background border-b border-border",
        "lg:w-64 lg:shrink-0 lg:py-8 lg:z-auto lg:border-b-0",
        "lg:sticky top-10",
        className,
      )}
    >
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          className="block w-full text-left transition-colors hover:bg-card-hover"
        >
          <Inset className="flex items-center justify-between py-3">
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-xs tabular-nums text-foreground/40 shrink-0">
                {Math.max(0, activeIndex) + 1}/{stages.length}
              </span>
              <span className="font-mono text-xs text-foreground/40 shrink-0">·</span>
              <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                {activeStage?.label}
              </span>
            </span>
            <CaretDownIcon
              size={14}
              weight="bold"
              className={cn("shrink-0 ml-3 transition-transform text-foreground/40", mobileOpen && "rotate-180")}
            />
          </Inset>
        </button>
        <div
          aria-hidden={!mobileOpen}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <Inset className="border-t border-border py-3">
              <ol className="flex flex-col">{stages.map(renderStageRow)}</ol>
            </Inset>
          </div>
        </div>
      </div>

      <ol className="hidden lg:flex flex-col">{stages.map(renderStageRow)}</ol>
    </nav>
  );
}

function renderStageRow(stage: StageNavStage, index: number) {
  return <StageRow key={stage.key} index={index} label={stage.label} state={stage.state} href={stage.href} />;
}

type StageRowProps = {
  index: number;
  label: ReactNode;
  state: StageNavStageState;
  href?: string;
};

function StageRow({ index, label, state, href }: StageRowProps) {
  const isActive = state === "active";
  const isDone = state === "done";
  const isUpcoming = state === "upcoming";

  const tick = (
    <span
      aria-hidden
      className={cn(
        "shrink-0 transition-all",
        isActive ? "w-6 h-0.5 bg-foreground" : isDone ? "w-3 h-px bg-foreground/40" : "w-3 h-px bg-foreground/20",
      )}
    />
  );
  const number = (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.14em]",
        isActive ? "text-foreground" : "text-foreground/30",
      )}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
  const text = (
    <span
      className={cn(
        "tracking-tight",
        isActive ? "font-semibold text-foreground" : isDone ? "text-foreground/60" : "text-foreground/30",
      )}
    >
      {label}
    </span>
  );
  const inner = (
    <>
      {tick}
      <span className="flex items-baseline gap-2.5">
        {number}
        {text}
      </span>
    </>
  );

  if (href === undefined) {
    return (
      <li>
        <div aria-current={isActive ? "step" : undefined} className="flex items-center gap-4 h-12 pr-4">
          {inner}
        </div>
      </li>
    );
  }

  const interactiveClassName = cn(
    "flex items-center gap-4 h-12 pr-4 transition-colors",
    isUpcoming ? "cursor-not-allowed select-none" : "cursor-pointer hover:text-foreground",
  );

  if (isUpcoming) {
    return (
      <li>
        <button type="button" disabled className={interactiveClassName}>
          {inner}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link to={href} className={interactiveClassName} aria-current={isActive ? "step" : undefined}>
        {inner}
      </Link>
    </li>
  );
}
