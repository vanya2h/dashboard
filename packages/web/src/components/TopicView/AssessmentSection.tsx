import type { SessionPhase } from "./types";
import { Btn, Spinner, Textarea } from "./ui";

export function GapsReviewSection({
  phase,
  onContinue,
}: {
  phase: Extract<SessionPhase, { name: "gaps-review" }>;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Assessment complete</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{phase.summary}</p>

      {phase.gaps.length > 0 ? (
        <div className="mb-8">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
            Gaps to cover
          </p>
          <ul className="flex flex-wrap gap-2">
            {phase.gaps.map((gap) => (
              <li
                key={gap}
                className="rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-1 text-sm text-amber-800 dark:text-amber-300"
              >
                {gap}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-8 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-4 py-3 text-sm text-green-800 dark:text-green-300">
          No significant gaps detected — the material will go deep on advanced nuances.
        </div>
      )}

      <button
        onClick={onContinue}
        className="rounded-lg bg-green-600 hover:bg-green-700 px-5 py-2 text-sm font-medium text-white transition-colors"
      >
        Start studying
      </button>
    </div>
  );
}

export function AssessmentSection({
  phase,
  onAnswerChange,
  onSubmit,
}: {
  phase: Extract<SessionPhase, { name: "assessing" }>;
  onAnswerChange: (idx: number, text: string) => void;
  onSubmit: () => void;
}) {
  if (phase.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Preparing assessment questions…</p>
      </div>
    );
  }

  if (phase.status === "evaluating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner />
        <div className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm text-center">
          Evaluating your answers and personalizing the study session…
        </div>
        {phase.evalStream && (
          <div className="text-xs text-neutral-400 dark:text-neutral-600 max-w-sm text-center italic">
            {phase.evalStream.slice(0, 120)}
            {phase.evalStream.length > 120 ? "…" : ""}
          </div>
        )}
      </div>
    );
  }

  const allAnswered = phase.questions.every((_, i) => (phase.answers[i] ?? "").trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Quick Assessment</h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-8">
        Answer each question in 2–4 sentences. Honest answers get more useful material.
      </p>
      <div className="flex flex-col gap-6">
        {phase.questions.map((q, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">
              {i + 1}. {q}
            </p>
            <Textarea
              value={phase.answers[i] ?? ""}
              onChange={(v) => onAnswerChange(i, v)}
              placeholder="Your answer…"
              rows={3}
            />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Btn onClick={onSubmit} disabled={!allAnswered}>
          Submit answers →
        </Btn>
      </div>
    </div>
  );
}
