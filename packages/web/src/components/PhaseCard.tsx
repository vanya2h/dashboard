import { LayerCard } from "@cloudflare/kumo/components/layer-card";
import { useState } from "react";
import type { Phase, Task } from "../data/curriculum";
import { useProgress } from "../hooks/useProgress";
import { TaskRow } from "./TaskRow";

type Props = { phase: Phase; curriculumId: string };

function phaseProgress(tasks: Task[], completedTaskIds: Record<string, string>) {
  const total = tasks.reduce((s, t) => s + (t.estMinutes ?? 60), 0);
  if (total === 0) return 0;
  const done = tasks.filter((t) => completedTaskIds[t.id]).reduce((s, t) => s + (t.estMinutes ?? 60), 0);
  return Math.round((done / total) * 100);
}

export function PhaseCard({ phase, curriculumId }: Props) {
  const [open, setOpen] = useState(true);
  const { completedTaskIds } = useProgress();

  const pct = phaseProgress(phase.tasks, completedTaskIds);

  return (
    <LayerCard className="overflow-hidden">
      <LayerCard.Secondary>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer"
          aria-expanded={open}
        >
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{phase.title}</span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{phase.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="w-24">
              <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-right text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{pct}%</div>
            </div>
            <span className="text-neutral-400 text-xs">{open ? "▲" : "▼"}</span>
          </div>
        </button>
      </LayerCard.Secondary>

      {open && (
        <LayerCard.Primary>
          <div className="px-4 pb-3">
            {phase.tasks.map((task) => (
              <TaskRow key={task.id} task={task} curriculumId={curriculumId} />
            ))}
          </div>
        </LayerCard.Primary>
      )}
    </LayerCard>
  );
}
