import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { StageNav, type StageNavStage } from "../StageNav";
import type { BuilderStep } from "./useCurriculumBuilder";

export type BuilderSidebarProps = Omit<React.ComponentProps<typeof StageNav>, "stages"> & {
  step: BuilderStep;
};

export function BuilderSidebar({ step, ...restProps }: BuilderSidebarProps) {
  const currentIndex = stageIndex(step);
  const items: { key: string; label: ReactNode }[] = [
    { key: "input", label: <Trans>Job posting</Trans> },
    { key: "outline", label: <Trans>Outline</Trans> },
    { key: "phases", label: <Trans>Phases</Trans> },
    { key: "save", label: <Trans>Save</Trans> },
  ];

  const stages: StageNavStage[] = items.map((item, i) => ({
    key: item.key,
    label: item.label,
    state: i === currentIndex ? "active" : i < currentIndex ? "done" : "upcoming",
  }));

  return <StageNav aria-label="Program creation steps" stages={stages} {...restProps} />;
}

function stageIndex(step: BuilderStep): number {
  switch (step) {
    case "idle":
    case "extracting":
      return 0;
    case "generating-outline":
    case "outline-review":
      return 1;
    case "phase-view":
      return 2;
    case "saving":
      return 3;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}
