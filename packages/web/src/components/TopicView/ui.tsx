export function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" aria-hidden />
  );
}

export function StudyContent({ content }: { content: string }) {
  const parts = content.split(/(```[\w]*\n[\s\S]*?```)/g);
  return (
    <div className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 space-y-3">
      {parts.map((part, i) =>
        part.startsWith("```") ? (
          <pre
            key={i}
            className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto font-mono whitespace-pre"
          >
            {part.replace(/^```[\w]*\n/, "").replace(/```$/, "")}
          </pre>
        ) : (
          <div key={i} className="whitespace-pre-wrap">
            {part}
          </div>
        ),
      )}
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
  step: "study" | "hands-on" | "write-up";
}) {
  return (
    <div className="flex items-center gap-2 text-xs mb-6">
      <span className="text-neutral-500 dark:text-neutral-400">
        Part {partIdx + 1} of {total}
      </span>
      <span className="text-neutral-300 dark:text-neutral-700">·</span>
      {(["study", "hands-on", "write-up"] as const).map((s, i) => (
        <span key={s} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-300 dark:text-neutral-700">→</span>}
          <span
            className={
              step === s ? "text-green-600 dark:text-green-400 font-semibold" : "text-neutral-400 dark:text-neutral-600"
            }
          >
            {s}
          </span>
        </span>
      ))}
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
