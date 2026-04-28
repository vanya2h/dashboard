import { code } from "@streamdown/code";
import { Streamdown } from "streamdown";
import type { PartPlan, StudyPart } from "./types";

export function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" aria-hidden />
  );
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

export function PartNav({
  partPlans,
  parts,
  currentIdx,
  onGoTo,
}: {
  partPlans: PartPlan[];
  parts: (StudyPart | null)[];
  currentIdx: number;
  onGoTo: (idx: number) => void;
}) {
  return (
    <div className="flex items-start gap-1 flex-wrap mb-5">
      {partPlans.map((plan, i) => {
        const isCurrent = i === currentIdx;
        const isGenerated = !!parts[i];
        const canGoBack = isGenerated && !isCurrent && i < currentIdx;

        return (
          <button
            key={i}
            onClick={() => canGoBack && onGoTo(i)}
            disabled={!canGoBack}
            title={plan.description}
            className={[
              "text-xs px-2 py-1 rounded-md border transition-colors",
              isCurrent
                ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-semibold"
                : canGoBack
                  ? "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                  : "border-neutral-100 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700 cursor-default",
            ].join(" ")}
          >
            {i + 1}. {plan.title}
          </button>
        );
      })}
    </div>
  );
}

export function PartProgress({
  partIdx,
  total,
  step,
}: {
  partIdx: number;
  total: number;
  step: "generating" | "study" | "hands-on" | "write-up";
}) {
  return (
    <div className="flex items-center gap-2 text-xs mb-4">
      <span className="text-neutral-500 dark:text-neutral-400">
        Part {partIdx + 1} of {total}
      </span>
      {step !== "generating" && (
        <>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          {(["study", "hands-on", "write-up"] as const).map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              {i > 0 && <span className="text-neutral-300 dark:text-neutral-700">→</span>}
              <span
                className={
                  step === s
                    ? "text-green-600 dark:text-green-400 font-semibold"
                    : "text-neutral-400 dark:text-neutral-600"
                }
              >
                {s}
              </span>
            </span>
          ))}
        </>
      )}
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
    />
  );
}

export function Btn({
  onClick,
  disabled,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-green-600 text-white hover:bg-green-700"
      : "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
