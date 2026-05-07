import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { type Complexity, COMPLEXITY_LEVELS } from "../../data/types";
import { Card } from "../Card";
import { MethodPicker } from "./methods/MethodPicker";
import { BuilderActionBar } from "./BuilderActionBar";
import type { InputMode } from "./useCurriculumBuilder";

import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";

const inputSchema = z
  .object({
    inputMode: z.enum(["url", "pdf"]).nullable(),
    url: z.string(),
    file: z.instanceof(File).nullable(),
    complexity: z.enum(COMPLEXITY_LEVELS),
  })
  .superRefine((data, ctx) => {
    if (data.inputMode === null) {
      ctx.addIssue({ code: "custom", path: ["inputMode"], message: "Choose URL or PDF" });
      return;
    }
    if (data.inputMode === "url" && !isValidHttpUrl(data.url)) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Enter a full URL starting with http:// or https://",
      });
    }
    if (data.inputMode === "pdf" && !data.file) {
      ctx.addIssue({ code: "custom", path: ["file"], message: "Please upload a PDF" });
    }
  });

type InputFormValues = z.infer<typeof inputSchema>;

function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

type InputStepProps = {
  method: InputMode;
  setMethod: (m: InputMode) => void;
  url: string;
  setUrl: (v: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  complexity: Complexity;
  setComplexity: (v: Complexity) => void;
  onGenerate: () => void;
};

export function InputStep({
  method,
  setMethod,
  url,
  setUrl,
  file,
  setFile,
  complexity,
  setComplexity,
  onGenerate,
}: InputStepProps) {
  const form = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange",
    defaultValues: { inputMode: method, url, file, complexity },
  });

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isValid, errors, touchedFields },
  } = form;

  const watchedMode = useWatch({ control, name: "inputMode" });
  const watchedUrl = useWatch({ control, name: "url" });
  const watchedFile = useWatch({ control, name: "file" });
  const watchedComplexity = useWatch({ control, name: "complexity" });

  useEffect(() => {
    setValue("inputMode", method, { shouldValidate: true });
  }, [method, setValue]);

  function handleUrlChange(v: string) {
    setValue("url", v, { shouldValidate: true, shouldTouch: true });
    setUrl(v);
    if (v.trim()) {
      if (watchedFile) {
        setValue("file", null);
        setFile(null);
      }
      if (watchedMode !== "url") {
        setValue("inputMode", "url", { shouldValidate: true });
        setMethod("url");
      }
    } else if (watchedMode === "url") {
      setValue("inputMode", null, { shouldValidate: true });
      setMethod(null);
    }
  }

  function handleFileChange(f: File | null) {
    setValue("file", f, { shouldValidate: true, shouldTouch: true });
    setFile(f);
    if (f) {
      if (watchedUrl) {
        setValue("url", "");
        setUrl("");
      }
      if (watchedMode !== "pdf") {
        setValue("inputMode", "pdf", { shouldValidate: true });
        setMethod("pdf");
      }
    } else if (watchedMode === "pdf") {
      setValue("inputMode", null, { shouldValidate: true });
      setMethod(null);
    }
  }

  function handleComplexityChange(v: Complexity) {
    setValue("complexity", v, { shouldValidate: true });
    setComplexity(v);
  }

  const urlError = touchedFields.url ? errors.url?.message : undefined;

  return (
    <form onSubmit={handleSubmit(() => onGenerate())} className="flex w-full flex-col gap-4 mt-[8vh]">
      <MethodPicker
        url={watchedUrl}
        onUrlChange={handleUrlChange}
        urlError={urlError}
        file={watchedFile}
        onFileChange={handleFileChange}
        activeMethod={watchedMode}
      />

      <DepthRow depth={watchedComplexity} setDepth={handleComplexityChange} enabled={isValid} />

      <BuilderActionBar>
        <Button className="ml-auto" type="submit" disabled={!isValid}>
          <Trans>Generate program →</Trans>
        </Button>
      </BuilderActionBar>
    </form>
  );
}

function DepthRow({
  depth,
  setDepth,
  enabled,
}: {
  depth: Complexity;
  setDepth: (d: Complexity) => void;
  enabled: boolean;
}) {
  const { t } = useLingui();

  const opts: { value: Complexity; label: string; description: string }[] = [
    { value: "easy", label: t`Easy`, description: t`2-3 key phases · easy reading & practice` },
    { value: "medium", label: t`Medium`, description: t`3-6 phases · balanced reading & practice` },
    { value: "deep", label: t`Deep`, description: t`5-9 phases · full depth with open-ended builds` },
  ];

  return (
    <div className={cn("transition-opacity duration-300", enabled ? "opacity-100" : "pointer-events-none opacity-45")}>
      <RadioGroup
        value={depth}
        onValueChange={(v) => setDepth(v as Complexity)}
        disabled={!enabled}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {opts.map((o) => {
          const active = depth === o.value;
          return (
            <label key={o.value} className={cn(enabled ? "cursor-pointer" : "cursor-not-allowed")}>
              <Card hoverable active={active} className="px-4 py-3.5">
                <div className="mb-1 flex items-center gap-2">
                  <RadioGroupItem value={o.value} />
                  <span className="font-semibold text-foreground">{o.label}</span>
                </div>
                <p className="pl-6 text-[12px] leading-normal text-muted-foreground">{o.description}</p>
              </Card>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
