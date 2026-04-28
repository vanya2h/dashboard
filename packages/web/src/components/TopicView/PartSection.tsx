import type { SessionPhase } from "./types";
import { Btn, PartProgress, Spinner, StudyContent, Textarea } from "./ui";

export function PartSection({
  phase,
  onUpdateText,
  onNextStep,
  onSubmitHandsOn,
  onSubmitWriteUp,
  onNextPart,
}: {
  phase: Extract<SessionPhase, { name: "part" }>;
  onUpdateText: (text: string) => void;
  onNextStep: () => void;
  onSubmitHandsOn: () => void;
  onSubmitWriteUp: () => void;
  onNextPart: () => void;
}) {
  const { material, partIdx, step, userText, feedback, feedbackStreaming } = phase;
  const part = material.parts[partIdx];
  if (!part) return null;

  const isLastPart = partIdx === material.parts.length - 1;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <PartProgress partIdx={partIdx} total={material.parts.length} step={step} />

      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-6">{part.title}</h2>

      {step === "study" && (
        <>
          <StudyContent content={part.study} />
          <div className="mt-8">
            <Btn onClick={onNextStep}>Got it — move to practice →</Btn>
          </div>
        </>
      )}

      {step === "hands-on" && (
        <>
          <div className="mb-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
              Exercise
            </p>
            <StudyContent content={part.handsOn} />
          </div>

          {!feedback && !feedbackStreaming && (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Your approach / solution:</p>
              <Textarea
                value={userText}
                onChange={onUpdateText}
                placeholder="Work through the exercise here. Notes, code, your reasoning…"
                rows={6}
              />
              <div className="mt-4">
                <Btn onClick={onSubmitHandsOn} disabled={userText.trim().length === 0}>
                  Submit for feedback →
                </Btn>
              </div>
            </>
          )}

          {(feedback || feedbackStreaming) && (
            <div className="mt-2">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-1">Your solution:</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-wrap">{userText}</p>
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    Feedback
                  </p>
                  {feedbackStreaming && <Spinner />}
                </div>
                <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{feedback}</p>
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

      {step === "write-up" && (
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
                <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{feedback}</p>
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
