import { Btn } from "./ui";

export function ErrorSection({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Something went wrong</h2>

      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm font-mono text-xs">{message}</p>
      <Btn onClick={onRetry} variant="secondary">
        Try again
      </Btn>
    </div>
  );
}
