import { useRef, useState } from "react";
import { useClaude } from "../../lib/claude";
import { TASK_SOLUTION_SYSTEM } from "./prompts";
import type { SessionPhase } from "./types";
import { Btn, Markdown, PartNav, PartProgress, Spinner, Textarea } from "./ui";

export function HandsOnSection({
  phase,
  onAnswerChange,
  onSubmit,
  onMoveToWriteUp,
  onGoToPart,
}: {
  phase: Extract<SessionPhase, { name: "hands-on" }>;
  onAnswerChange: (idx: number, text: string) => void;
  onSubmit: () => void;
  onMoveToWriteUp: () => void;
  onGoToPart: (idx: number) => void;
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
      <PartNav partPlans={plan.partPlans} parts={parts} currentIdx={partIdx} onGoTo={onGoToPart} />
      <PartProgress partIdx={partIdx} total={plan.partPlans.length} step="hands-on" />

      {!feedback && !feedbackStreaming && (
        <div className="flex flex-col gap-6">
          {part.handsOn.map((t, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                  Task {i + 1}
                </p>
                <Markdown>{t.task}</Markdown>
                {t.hint && <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-600 italic">Hint: {t.hint}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => void handleSolution(i, t.task, t.hint)}
                    disabled={solutions[i]?.streaming}
                    className="text-xs px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    See solution
                  </button>
                  {solutions[i]?.streaming && <Spinner />}
                </div>
              </div>
              {solutions[i] && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                    Solution
                  </p>
                  <Markdown isAnimating={solutions[i].streaming}>{solutions[i].text}</Markdown>
                </div>
              )}
              <Textarea
                value={answers[i] ?? ""}
                onChange={(v) => onAnswerChange(i, v)}
                placeholder="Your answer, code, or reasoning…"
                rows={4}
              />
            </div>
          ))}
          <div>
            <Btn onClick={onSubmit} disabled={!allAnswered}>
              Submit for feedback →
            </Btn>
          </div>
        </div>
      )}

      {(feedback || feedbackStreaming) && (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            {part.handsOn.map((t, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                    Task {i + 1}
                  </p>
                  <Markdown>{t.task}</Markdown>
                </div>
                {answers[i] && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap px-1">
                    {answers[i]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Feedback
              </p>
              {feedbackStreaming && <Spinner />}
            </div>
            <Markdown isAnimating={feedbackStreaming}>{feedback}</Markdown>
          </div>
          {!feedbackStreaming && (
            <div className="mt-6">
              <Btn onClick={onMoveToWriteUp}>Move to reflection →</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
