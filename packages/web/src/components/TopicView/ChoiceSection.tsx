import { LayerCard } from "@cloudflare/kumo/components/layer-card";

export function ChoiceSection({ onScratch, onAssess }: { onScratch: () => void; onAssess: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">How do you want to start?</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10 max-w-sm">
        Take a quick test to surface gaps and personalize the material, or dive straight in from the beginning.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <LayerCard
          render={<button onClick={onAssess} className="text-left" />}
          className="flex flex-col items-start gap-2 rounded-xl p-5"
        >
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">Quick assessment first</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Answer 4 questions so the AI can focus on your gaps
          </span>
        </LayerCard>
        <LayerCard
          render={<button onClick={onScratch} className="text-left" />}
          className="flex flex-col items-start gap-2 rounded-xl p-5"
        >
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">Start from scratch</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Full comprehensive material from the beginning
          </span>
        </LayerCard>
      </div>
    </div>
  );
}
