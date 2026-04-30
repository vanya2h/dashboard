import { Button } from "@cloudflare/kumo/components/button";
import { useNavigate } from "react-router";
import type { Task } from "../data/curriculum";
import type { ActiveSession } from "../hooks/useProgress";
import { useProgress } from "../hooks/useProgress";
import { apiClient } from "../lib/apiClient";

type Props = { task: Task; curriculumId: string };

const STEP_LABELS: Record<string, string> = {
  study: "Study",
  "hands-on": "Practice",
  "write-up": "Write-up",
};

function sessionLabel(session: ActiveSession): string {
  if (session.name === "part") {
    const step = STEP_LABELS[session.step ?? ""] ?? session.step ?? "";
    return `Part ${(session.partIdx ?? 0) + 1} · ${step}`;
  }
  if (session.name === "gaps-review") return "Assessment done";
  if (session.name === "final-test") return "Final test";
  return session.name;
}

export function TaskRow({ task, curriculumId }: Props) {
  const { completedTaskIds, activeSessions } = useProgress();
  const navigate = useNavigate();
  const checked = !!completedTaskIds[task.id];
  const activeSession = activeSessions[task.id];

  return (
    <div className="group flex items-start gap-3 py-1.5 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <label className="flex items-start gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mt-0.5 h-4 w-4 shrink-0 accent-green-600 pointer-events-none"
        />
        <span
          className={`text-sm leading-snug ${checked ? "line-through text-neutral-400 dark:text-neutral-600" : "text-neutral-800 dark:text-neutral-200"}`}
        >
          {task.title}
          {task.estMinutes && (
            <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-500">
              ~{task.estMinutes >= 60 ? `${Math.round(task.estMinutes / 60)}h` : `${task.estMinutes}m`}
            </span>
          )}
          {activeSession && (
            <span className="ml-2 text-xs text-amber-500 dark:text-amber-400 font-medium">
              {sessionLabel(activeSession)}
            </span>
          )}
        </span>
      </label>
      {!checked && (
        <div
          className={`shrink-0 flex gap-1 transition-opacity ${activeSession ? "" : "opacity-0 group-hover:opacity-100"}`}
        >
          {activeSession && (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => {
                void apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId: task.id } });
                navigate(`/topic/${curriculumId}/${task.id}`);
              }}
            >
              Start over
            </Button>
          )}
          <Button size="xs" variant="primary" onClick={() => navigate(`/topic/${curriculumId}/${task.id}`)}>
            {activeSession ? "Continue" : "Start"}
          </Button>
        </div>
      )}
    </div>
  );
}
