import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type { SessionPhase } from "./types";
import { Markdown, PartProgress, Spinner } from "./ui";

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
  const prevPlan = partIdx > 0 ? plan.partPlans[partIdx - 1] : null;
  const nextPlan = !isLastPart ? plan.partPlans[partIdx + 1] : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <PartProgress partIdx={partIdx} total={plan.partPlans.length} />

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
          <div className="mt-8 grid grid-cols-2 gap-3">
            {prevPlan && parts[partIdx - 1] ? (
              <button
                type="button"
                onClick={() => onGoToPart(partIdx - 1)}
                className="flex flex-col gap-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  <ArrowLeftIcon className="inline" /> previous
                </span>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {prevPlan.title}
                </span>
              </button>
            ) : (
              <div />
            )}

            {isLastPart ? (
              <button
                type="button"
                onClick={onMoveToHandsOn}
                className="flex flex-col items-end gap-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-right hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <span className="text-xs text-neutral-500 dark:text-neutral-400">next</span>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">Practice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNextPart}
                className="flex flex-col items-end gap-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-right hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  next <ArrowRightIcon className="inline" />
                </span>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {nextPlan?.title}
                </span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
