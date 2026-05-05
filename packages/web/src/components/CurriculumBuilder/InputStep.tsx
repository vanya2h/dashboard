import { Trans, useLingui } from "@lingui/react/macro";
import type { Complexity } from "../../data/types";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const COMPLEXITY_OPTIONS: { value: Complexity; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "2–3 key phases · Reading & essentials" },
  { value: "medium", label: "Medium", description: "3–6 phases · Balanced reading & practice" },
  { value: "deep", label: "Deep", description: "5–9 phases · Full depth with open-ended builds" },
];

function ComplexityPicker({ complexity, onChange }: { complexity: Complexity; onChange: (v: Complexity) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        <Trans>Depth</Trans>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {COMPLEXITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col gap-1 p-3 border text-left transition-colors cursor-pointer",
              complexity === opt.value ? "border-foreground bg-muted" : "border-border hover:bg-muted/50",
            )}
          >
            <span className="text-sm font-medium text-foreground">{opt.label}</span>
            <span className="text-xs text-muted-foreground">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function InputModePicker({ onPick }: { onPick: (mode: "url" | "pdf") => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border w-full">
      <button
        onClick={() => onPick("url")}
        className="flex flex-col items-start gap-2 p-5 text-left bg-background hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
      >
        <span className="font-semibold text-foreground">
          <Trans>Paste a URL</Trans>
        </span>
        <span className="text-xs text-muted-foreground">
          <Trans>Use a link to the job posting on its company or job-board page</Trans>
        </span>
      </button>
      <button
        onClick={() => onPick("pdf")}
        className="flex flex-col items-start gap-2 p-5 text-left bg-background hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
      >
        <span className="font-semibold text-foreground">
          <Trans>Upload a PDF</Trans>
        </span>
        <span className="text-xs text-muted-foreground">
          <Trans>Pick a saved PDF of the job description from your computer</Trans>
        </span>
      </button>
    </div>
  );
}

export function UrlInput({
  url,
  setUrl,
  complexity,
  onComplexityChange,
  onGenerate,
  onBack,
}: {
  url: string;
  setUrl: (v: string) => void;
  complexity: Complexity;
  onComplexityChange: (v: Complexity) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const { t } = useLingui();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 w-full">
        <div className="flex-1 grow">
          <Input
            placeholder={t`Paste job posting URL...`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && url.trim()) onGenerate();
            }}
          />
          <p className="text-xs text-muted-foreground mt-4">
            <Trans>
              * Some sites block direct access. If this fails, save as PDF and use the upload option instead.
            </Trans>
          </p>
        </div>
      </div>
      <ComplexityPicker complexity={complexity} onChange={onComplexityChange} />
      <div className="flex items-center justify-between">
        <BackLink onClick={onBack} />
        <Button onClick={onGenerate} disabled={!url.trim()} className="shrink-0 ml-4">
          <Trans>Generate</Trans>
        </Button>
      </div>
    </div>
  );
}

export function PdfInput({
  file,
  setFile,
  complexity,
  onComplexityChange,
  onGenerate,
  onBack,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  complexity: Complexity;
  onComplexityChange: (v: Complexity) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const { t } = useLingui();
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center justify-center w-full px-4 py-8 border border-dashed border-border hover:bg-muted/30 cursor-pointer transition-colors">
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <span className="text-sm text-muted-foreground text-center">
          {file ? file.name : t`Click to choose a PDF file`}
        </span>
      </label>
      <ComplexityPicker complexity={complexity} onChange={onComplexityChange} />
      <div className="flex justify-end">
        <Button onClick={onGenerate} disabled={!file}>
          <Trans>Generate</Trans>
        </Button>
      </div>
      <BackLink onClick={onBack} />
    </div>
  );
}

export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" onClick={onClick}>
      <Trans>← Choose another method</Trans>
    </Button>
  );
}
