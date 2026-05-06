import type { ReactNode } from "react";
import { DotLoader } from "./Spinner";

export function LoadingState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-sm text-muted-foreground text-center">
      <DotLoader />
      {children}
    </div>
  );
}
