import { Loader } from "@cloudflare/kumo/components/loader";
import { code } from "@streamdown/code";
import { Streamdown } from "streamdown";

export function Spinner() {
  return <Loader size="sm" />;
}

export function Markdown({ children, isAnimating = false }: { children: string; isAnimating?: boolean }) {
  return (
    <div className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 [&_p]:mb-3 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:overflow-x-auto [&_code:not(pre_code)]:text-xs [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
      <Streamdown animated isAnimating={isAnimating} plugins={{ code }} shikiTheme={["github-light", "github-dark"]}>
        {children}
      </Streamdown>
    </div>
  );
}

export function PartProgress({ partIdx, total }: { partIdx: number; total: number }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        Part {partIdx + 1} of {total}
      </p>
    </div>
  );
}
