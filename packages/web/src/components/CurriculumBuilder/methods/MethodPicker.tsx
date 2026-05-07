import type { InputMode } from "../useCurriculumBuilder";
import { PdfMethodCard } from "./PdfMethod";
import { UrlMethodCard } from "./UrlMethod";

type MethodPickerProps = {
  url: string;
  onUrlChange: (v: string) => void;
  urlError?: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  activeMethod: InputMode;
};

export function MethodPicker({ url, onUrlChange, urlError, file, onFileChange, activeMethod }: MethodPickerProps) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <UrlMethodCard
        url={url}
        onUrlChange={onUrlChange}
        error={urlError}
        active={activeMethod === "url"}
        className="sm:flex-[1.6]"
      />
      <PdfMethodCard file={file} onFileChange={onFileChange} active={activeMethod === "pdf"} className="sm:flex-1" />
    </div>
  );
}
