import type { SessionPhase } from "./types";
import { Btn, Spinner, Textarea } from "./ui";

export function FinalTestSection({
  phase,
  onAnswerChange,
  onSubmit,
  onComplete,
}: {
  phase: Extract<SessionPhase, { name: "final-test" }>;
  onAnswerChange: (idx: number, text: string) => void;
  onSubmit: () => void;
  onComplete: () => void;
}) {
  const { material, answers, grading, gradingDone, passed } = phase;
  const allAnswered = material.finalTest.every((_, i) => (answers[i] ?? "").trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Final Test</h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-8">
        Answer all questions to complete this topic. Passing score: 70%.
      </p>

      <div className="flex flex-col gap-6">
        {material.finalTest.map((q, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
              {i + 1}. {q.question}
            </p>
            {q.hint && <p className="text-xs text-neutral-400 dark:text-neutral-600 italic mb-2">Hint: {q.hint}</p>}
            <Textarea
              value={answers[i] ?? ""}
              onChange={(v) => onAnswerChange(i, v)}
              placeholder="Your answer…"
              rows={3}
            />
          </div>
        ))}
      </div>

      {!grading && !gradingDone && (
        <div className="mt-8">
          <Btn onClick={onSubmit} disabled={!allAnswered}>
            Submit test
          </Btn>
        </div>
      )}

      {grading && (
        <div className="mt-8 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Result
            </p>
            {!gradingDone && <Spinner />}
          </div>
          {gradingDone && (
            <div
              className={`text-sm font-semibold mb-2 ${passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {passed ? "Passed!" : "Not quite — review and try again"}
            </div>
          )}
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{grading}</p>
          {gradingDone && (
            <div className="mt-4">
              <Btn onClick={onComplete}>{passed ? "Complete topic →" : "Try again"}</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
