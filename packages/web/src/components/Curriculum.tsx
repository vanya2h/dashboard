import { Trans, useLingui } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { parseResponse } from "hono/client";
import { Link, useNavigate } from "react-router";
import type { CurriculumDef, Phase, Task } from "../data/types";
import type { ActiveSession } from "../hooks/useProgress";
import { useProgress } from "../hooks/useProgress";
import { apiClient } from "../lib/apiClient";
import { PHASE_ORDER } from "../lib/phase";
import { BigColumn } from "./layout/BigColumn";
import { PageBody } from "./layout/PageBody";
import { PageContent } from "./layout/PageContent";
import { Badge } from "./ui/badge";
import { Card } from "./Card";
import { PhaseCard } from "./PhaseCard";
import { ProgramCover } from "./ProgramCover";
import { Ring } from "./Ring";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type CurriculumProps = React.ComponentProps<"main"> & {
  curriculum: CurriculumDef;
};

export function Curriculum({ curriculum, className, ...restProps }: CurriculumProps) {
  const { completedTaskIds, activeSessions } = useProgress();

  const totalTasks = curriculum.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = curriculum.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter((task) => completedTaskIds[task.id]).length,
    0,
  );
  const remainingMinutes = curriculum.phases.reduce(
    (acc, phase) =>
      acc + phase.tasks.filter((task) => !completedTaskIds[task.id]).reduce((s, task) => s + (task.estMinutes ?? 0), 0),
    0,
  );
  const completionPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const nextUp = findNextUp(curriculum, completedTaskIds, activeSessions);

  return (
    <PageBody className={cn("relative", className)} {...restProps}>
      {curriculum.cover && (
        <div className="absolute inset-0">
          <ProgramCover shape="wave" preset={curriculum.cover} />
        </div>
      )}
      <PageContent className="relative">
        <BigColumn>
          <Card.List className="my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] border-b border-border">
              <Card.Raw className="min-w-0 max-lg:border-b lg:border-r border-border">
                <NextUpPane curriculum={curriculum} nextUp={nextUp} />
              </Card.Raw>
              <Card.Raw className="min-w-0">
                <ProgressRingPane percent={completionPercent} remainingMinutes={remainingMinutes} />
              </Card.Raw>
            </div>

            <Card.Entry>
              <Card.Heading>
                <Trans>All Sections</Trans>
              </Card.Heading>
            </Card.Entry>

            {curriculum.phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                curriculumId={curriculum.id}
                index={index}
                completedTaskIds={completedTaskIds}
              />
            ))}
          </Card.List>
        </BigColumn>
      </PageContent>
    </PageBody>
  );
}

type NextUp = {
  task: Task;
  phase: Phase;
  session: ActiveSession | null;
};

function findNextUp(
  curriculum: CurriculumDef,
  completedTaskIds: Record<string, string>,
  activeSessions: Record<string, ActiveSession>,
): NextUp | null {
  for (const phase of curriculum.phases) {
    for (const task of phase.tasks) {
      const session = activeSessions[task.id];
      if (session && !completedTaskIds[task.id]) {
        return { task, phase, session };
      }
    }
  }
  for (const phase of curriculum.phases) {
    for (const task of phase.tasks) {
      if (!completedTaskIds[task.id]) {
        return { task, phase, session: null };
      }
    }
  }
  return null;
}

function NextUpPane({ curriculum, nextUp }: { curriculum: CurriculumDef; nextUp: NextUp | null }) {
  const navigate = useNavigate();

  if (!nextUp) {
    return (
      <>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/40">
          <Trans>All done</Trans>
        </div>
        <div className="grow" />
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          <Trans>You finished every topic</Trans>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <Trans>Revisit any section below to review what you learned.</Trans>
        </p>
      </>
    );
  }

  const { task, phase, session } = nextUp;
  const taskPercent = session ? phaseProgressPercent(session) : 0;
  const taskUrl = `/topic/${curriculum.id}/${task.id}`;

  async function startOver() {
    await parseResponse(apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId: task.id } }));
    navigate(taskUrl);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {session && (
          <div className="mb-4">
            <SessionBadge session={session} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg md:text-2xl font-semibold tracking-[-0.03em] text-foreground leading-tight">
          {task.title}
        </h2>
        <p className="text-xs md:text-sm max-w-2xl leading-relaxed text-muted-foreground">
          {task.notes ?? phase.subtitle}
        </p>
      </div>
      <div className="grow" />
      <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
            <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${taskPercent}%` }} />
          </div>
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-foreground/50">
            <span className="text-foreground">{taskPercent}%</span>
            <span>·</span>
            <span className="truncate">{phase.title}</span>
            {task.estMinutes && (
              <>
                <span>·</span>
                <span>~{formatDuration(task.estMinutes)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-2 w-full sm:flex-row sm:items-center sm:gap-2 sm:w-auto sm:shrink-0">
          {session && (
            <Button size="lg" type="button" onClick={startOver} variant="ghost">
              <Trans>Start over</Trans>
            </Button>
          )}
          <Button size="lg" render={<Link to={taskUrl} />}>
            {session ? <Trans>Continue</Trans> : <Trans>Start</Trans>}
            <ArrowRightIcon weight="bold" data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </>
  );
}

function SessionBadge({ session }: { session: ActiveSession }) {
  const { partLabel, label } = useSessionLabel(session);
  return (
    <div className="flex items-center gap-1.5">
      {partLabel && <Badge variant="secondary">{partLabel}</Badge>}
      <Badge>{label}</Badge>
    </div>
  );
}

function useSessionLabel(session: ActiveSession): { partLabel: string | null; label: string } {
  const { t } = useLingui();
  const part = (session.partIdx ?? 0) + 1;
  const partLabel = t`Part ${part}`;
  switch (session.name) {
    case "assessing":
      return { partLabel: null, label: t`Assessing` };
    case "gaps-review":
      return { partLabel: null, label: t`Reviewing gaps` };
    case "study":
      return { partLabel, label: t`Study` };
    case "hands-on":
      return { partLabel, label: t`Practice` };
    case "feedback":
      return { partLabel, label: t`Feedback` };
    case "write-up":
      return { partLabel, label: t`Write-up` };
    default: {
      const _exhaustive: never = session.name;
      return _exhaustive;
    }
  }
}

function phaseProgressPercent(session: ActiveSession) {
  const idx = PHASE_ORDER.indexOf(session.name);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / PHASE_ORDER.length) * 100);
}

function ProgressRingPane({ percent, remainingMinutes }: { percent: number; remainingMinutes: number }) {
  return (
    <>
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="text-foreground font-medium">
            <Trans>Program Completed</Trans>
          </span>
          <span className="font-mono text-sm tabular-nums text-foreground">{percent}%</span>
        </div>
        <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
          <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
        {remainingMinutes > 0 && (
          <div className="mt-2 font-mono text-[11px] tracking-[0.04em] text-foreground/50">
            ~{formatHours(remainingMinutes)} <Trans>remaining</Trans>
          </div>
        )}
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center text-center">
        <Ring percent={percent} size={148} stroke={8}>
          <span className="text-3xl font-semibold tracking-[-0.03em] text-foreground">{percent}%</span>
        </Ring>
        <div className="text-foreground mt-4">
          <Trans>Program Completed</Trans>
        </div>
        {remainingMinutes > 0 && (
          <div className="text-sm text-foreground/40">
            ~{formatHours(remainingMinutes)} <Trans>remaining</Trans>
          </div>
        )}
      </div>
    </>
  );
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const hours = minutes / 60;
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  }
  return `${minutes}m`;
}

function formatHours(minutes: number) {
  if (minutes <= 0) return "0h";
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}
