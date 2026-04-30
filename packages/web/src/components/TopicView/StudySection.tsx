import type { SessionPhase } from "./types";
import { Btn, Markdown, PartNav, PartProgress, Spinner } from "./ui";

export function StudySection({
  phase,
  onMoveToHandsOn,
  onNextPart,
  onGoToPart,
}: {
  phase: Extract<SessionPhase, { name: "study" }>;
  onMoveToHandsOn: () => void;
  onNextPart: () => void;
  onGoToPart: (idx: number) => void;
}) {
  const { material, partIdx, stream } = phase;
  const { plan, parts } = material;
  const partPlan = plan.partPlans[partIdx];
  const part = parts[partIdx];
  const isLastPart = partIdx === plan.partPlans.length - 1;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <PartNav partPlans={plan.partPlans} parts={parts} currentIdx={partIdx} onGoTo={onGoToPart} />
      <PartProgress partIdx={partIdx} total={plan.partPlans.length} step="study" />

      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-6">{partPlan?.title ?? ""}</h2>

      {!part && (
        <>
          <div className="flex items-center gap-2 mb-6 text-neutral-400 dark:text-neutral-600">
            <Spinner />
            <p className="text-sm">Preparing study material…</p>
          </div>
          {stream && <Markdown isAnimating>{stream}</Markdown>}
        </>
      )}

      {part && (
        <>
          <Markdown>{part.study}</Markdown>
          <div className="mt-8">
            {isLastPart ? (
              <Btn onClick={onMoveToHandsOn}>Move to practice →</Btn>
            ) : (
              <Btn onClick={onNextPart}>Next part →</Btn>
            )}
          </div>
        </>
      )}
    </div>
  );
}
