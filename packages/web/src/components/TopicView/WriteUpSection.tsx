import { Button } from "@cloudflare/kumo/components/button";
import { InputArea } from "@cloudflare/kumo/components/input";
import { LayerCard } from "@cloudflare/kumo/components/layer-card";
import type { SessionPhase } from "./types";
import { Markdown, PartProgress, Spinner } from "./ui";

export function WriteUpSection({
  phase,
  onUpdateText,
  onSubmit,
  onComplete,
}: {
  phase: Extract<SessionPhase, { name: "write-up" }>;
  onUpdateText: (text: string) => void;
  onSubmit: () => void;
  onComplete: () => void;
}) {
  const { material, partIdx, text, feedback, feedbackStreaming } = phase;
  const { plan, parts } = material;
  const part = parts[partIdx]!;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <PartProgress partIdx={partIdx} total={plan.partPlans.length} />

      <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
        <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Reflect</p>
        <p className="text-sm text-neutral-800 dark:text-neutral-200">{part.writeUpPrompt}</p>
      </div>

      {!feedback && !feedbackStreaming && (
        <>
          <InputArea
            value={text}
            onChange={(e) => onUpdateText(e.target.value)}
            placeholder="Write your reflection in your own words…"
            rows={5}
            aria-label="Text input"
            className="w-full"
          />
          <div className="mt-4">
            <Button variant="primary" onClick={onSubmit} disabled={text.trim().length < 20}>
              Submit reflection
            </Button>
          </div>
        </>
      )}

      {(feedback || feedbackStreaming) && (
        <div className="mt-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-1">Your reflection:</div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-wrap">{text}</p>

          <LayerCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Tutor feedback
              </p>
              {feedbackStreaming && <Spinner />}
            </div>
            <Markdown isAnimating={feedbackStreaming}>{feedback}</Markdown>
          </LayerCard>

          {!feedbackStreaming && (
            <div className="mt-6">
              <Button variant="primary" onClick={onComplete}>
                Complete →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
