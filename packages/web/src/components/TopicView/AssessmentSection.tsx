import { Badge } from "@cloudflare/kumo/components/badge";
import { Button } from "@cloudflare/kumo/components/button";
import { InputArea } from "@cloudflare/kumo/components/input";
import type { SessionPhase } from "./types";
import { Spinner } from "./ui";

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
              <li key={gap}>
                <Badge variant="warning">{gap}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-8 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-4 py-3 text-sm text-green-800 dark:text-green-300">
          No significant gaps detected — the material will go deep on advanced nuances.
        </div>
      )}

      <Button variant="primary" onClick={onContinue}>
        Start studying
      </Button>
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
            <InputArea
              value={phase.answers[i] ?? ""}
              onChange={(e) => onAnswerChange(i, e.target.value)}
              placeholder="Your answer…"
              rows={3}
              aria-label="Text input"
              className="w-full"
            />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Button variant="primary" disabled={!allAnswered} onClick={onSubmit}>
          Submit answers →
        </Button>
      </div>
    </div>
  );
}
