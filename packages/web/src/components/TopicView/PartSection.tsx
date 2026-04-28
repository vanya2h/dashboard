import type { SessionPhase } from "./types";
import { Btn, Markdown, PartNav, PartProgress, Spinner, Textarea } from "./ui";

export function PartSection({
  phase,
  onUpdateText,
  onAnswerChange,
  onNextStep,
  onSubmitHandsOn,
  onSubmitWriteUp,
  onNextPart,
  onGoToPart,
}: {
  phase: Extract<SessionPhase, { name: "part" }>;
  onUpdateText: (text: string) => void;
  onAnswerChange: (idx: number, text: string) => void;
  onNextStep: () => void;
  onSubmitHandsOn: () => void;
  onSubmitWriteUp: () => void;
  onNextPart: () => void;
  onGoToPart: (idx: number) => void;
}) {
  const { material, partIdx, step, stream, userText, handsOnAnswers, feedback, feedbackStreaming } = phase;
  const { plan, parts } = material;
  const partPlan = plan.partPlans[partIdx];
  const part = parts[partIdx];
  const isLastPart = partIdx === plan.partPlans.length - 1;
  const allTasksAnswered = part?.handsOn.every((_, i) => (handsOnAnswers[i] ?? "").trim().length > 0) ?? false;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <PartNav partPlans={plan.partPlans} parts={parts} currentIdx={partIdx} onGoTo={onGoToPart} />
      <PartProgress partIdx={partIdx} total={plan.partPlans.length} step={step} />

      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-6">{partPlan?.title ?? ""}</h2>

      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400 dark:text-neutral-600">
          <Spinner />
          <p className="text-sm">Preparing study material{stream ? "…" : ""}</p>
        </div>
      )}

      {step === "study" && part && (
        <>
          <Markdown>{part.study}</Markdown>
          <div className="mt-8">
            {isLastPart ? (
              <Btn onClick={onNextStep}>Move to practice →</Btn>
            ) : (
              <Btn onClick={onNextPart}>Next part →</Btn>
            )}
          </div>
        </>
      )}

      {step === "hands-on" && part && (
        <>
          {!feedback && !feedbackStreaming && (
            <div className="flex flex-col gap-6">
              {part.handsOn.map((t, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Task {i + 1}
                    </p>
                    <Markdown>{t.task}</Markdown>
                    {t.hint && (
                      <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-600 italic">Hint: {t.hint}</p>
                    )}
                  </div>
                  <Textarea
                    value={handsOnAnswers[i] ?? ""}
                    onChange={(v) => onAnswerChange(i, v)}
                    placeholder="Your answer, code, or reasoning…"
                    rows={4}
                  />
                </div>
              ))}
              <div>
                <Btn onClick={onSubmitHandsOn} disabled={!allTasksAnswered}>
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
                    {handsOnAnswers[i] && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap px-1">
                        {handsOnAnswers[i]}
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
                <Markdown isAnimating={feedbackStreaming}>{feedback ?? ""}</Markdown>
              </div>
              {!feedbackStreaming && (
                <div className="mt-6">
                  <Btn onClick={onNextStep}>Move to reflection →</Btn>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {step === "write-up" && part && (
        <>
          <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
              Reflect
            </p>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">{part.writeUpPrompt}</p>
          </div>

          {!feedback && !feedbackStreaming && (
            <>
              <Textarea
                value={userText}
                onChange={onUpdateText}
                placeholder="Write your reflection in your own words…"
                rows={5}
              />
              <div className="mt-4">
                <Btn onClick={onSubmitWriteUp} disabled={userText.trim().length < 20}>
                  Submit reflection
                </Btn>
              </div>
            </>
          )}

          {(feedback || feedbackStreaming) && (
            <div className="mt-4">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-1">Your reflection:</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-wrap">{userText}</p>

              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    Tutor feedback
                  </p>
                  {feedbackStreaming && <Spinner />}
                </div>
                <Markdown isAnimating={feedbackStreaming}>{feedback ?? ""}</Markdown>
              </div>

              {!feedbackStreaming && (
                <div className="mt-6">
                  <Btn onClick={onNextPart}>{isLastPart ? "Go to final test →" : "Next part →"}</Btn>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
