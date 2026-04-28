import { Spinner } from "./ui";

export function LoadingSection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
      <Spinner />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Preparing your personalized study session…</p>
    </div>
  );
}
