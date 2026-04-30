import { Button } from "@cloudflare/kumo/components/button";
import { InputArea } from "@cloudflare/kumo/components/input";
import { LayerCard } from "@cloudflare/kumo/components/layer-card";
import { useRef, useState } from "react";
import { useClaude } from "../../lib/claude";
import { TASK_SOLUTION_SYSTEM } from "./prompts";
import type { SessionPhase } from "./types";
import { Markdown, PartProgress, Spinner } from "./ui";

export function HandsOnSection({
  phase,
  onAnswerChange,
  onSubmit,
  onMoveToWriteUp,
}: {
  phase: Extract<SessionPhase, { name: "hands-on" }>;
  onAnswerChange: (idx: number, text: string) => void;
  onSubmit: () => void;
  onMoveToWriteUp: () => void;
}) {
  const { streamAI } = useClaude();
  const [solutions, setSolutions] = useState<Record<number, { text: string; streaming: boolean }>>({});
  const solutionAbortRef = useRef<AbortController | null>(null);

  const { material, partIdx, answers, feedback, feedbackStreaming } = phase;
  const { plan, parts } = material;
  const part = parts[partIdx]!;
  const allAnswered = part.handsOn.every((_, i) => (answers[i] ?? "").trim().length > 0);

  async function handleSolution(idx: number, task: string, hint?: string) {
    solutionAbortRef.current?.abort();
    const ctrl = new AbortController();
    solutionAbortRef.current = ctrl;
    setSolutions((prev) => ({ ...prev, [idx]: { text: "", streaming: true } }));
    const msg = hint ? `Task: ${task}\nHint: ${hint}` : `Task: ${task}`;
    try {
      await streamAI(
        TASK_SOLUTION_SYSTEM,
        msg,
        (acc) => {
          if (!ctrl.signal.aborted) setSolutions((prev) => ({ ...prev, [idx]: { text: acc, streaming: true } }));
        },
        800,
        ctrl.signal,
      );
      if (!ctrl.signal.aborted) setSolutions((prev) => ({ ...prev, [idx]: { ...prev[idx]!, streaming: false } }));
    } catch {
      if (!ctrl.signal.aborted)
        setSolutions((prev) => {
          const { [idx]: _, ...rest } = prev;
          return rest;
        });
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <PartProgress partIdx={partIdx} total={plan.partPlans.length} />

      {!feedback && !feedbackStreaming && (
        <div className="flex flex-col gap-6">
          {part.handsOn.map((t, i) => (
            <div key={i} className="flex flex-col gap-3">
              <LayerCard className="p-4">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                  Task {i + 1}
                </p>
                <Markdown>{t.task}</Markdown>
                {t.hint && <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-600 italic">Hint: {t.hint}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    disabled={solutions[i]?.streaming}
                    onClick={() => void handleSolution(i, t.task, t.hint)}
                  >
                    See solution
                  </Button>
                  {solutions[i]?.streaming && <Spinner />}
                </div>
              </LayerCard>
              {solutions[i] && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                    Solution
                  </p>
                  <Markdown isAnimating={solutions[i].streaming}>{solutions[i].text}</Markdown>
                </div>
              )}
              <InputArea
                value={answers[i] ?? ""}
                onChange={(e) => onAnswerChange(i, e.target.value)}
                placeholder="Your answer, code, or reasoning…"
                rows={4}
                aria-label="Text input"
                className="w-full"
              />
            </div>
          ))}
          <div>
            <Button variant="primary" disabled={!allAnswered} onClick={onSubmit}>
              Submit for feedback →
            </Button>
          </div>
        </div>
      )}

      {(feedback || feedbackStreaming) && (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            {part.handsOn.map((t, i) => (
              <div key={i} className="flex flex-col gap-2">
                <LayerCard className="p-3">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                    Task {i + 1}
                  </p>
                  <Markdown>{t.task}</Markdown>
                </LayerCard>
                {answers[i] && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap px-1">
                    {answers[i]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <LayerCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Feedback
              </p>
              {feedbackStreaming && <Spinner />}
            </div>
            <Markdown isAnimating={feedbackStreaming}>{feedback}</Markdown>
          </LayerCard>
          {!feedbackStreaming && (
            <div className="mt-6">
              <Button variant="primary" onClick={onMoveToWriteUp}>
                Move to reflection →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
