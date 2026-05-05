import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router";

export default function ChoicePage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        <Trans>How do you want to start?</Trans>
      </h2>
      <p className="text-sm text-muted-foreground mb-10 max-w-sm">
        <Trans>
          Take a quick test to surface gaps and personalize the material, or dive straight in from the beginning.
        </Trans>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border w-full max-w-lg border border-border">
        <button
          onClick={() => void navigate("../assess", { relative: "path" })}
          className="flex flex-col items-start gap-2 p-5 text-left bg-background hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
        >
          <span className="font-semibold text-foreground">
            <Trans>Quick assessment first</Trans>
          </span>
          <span className="text-xs text-muted-foreground">
            <Trans>Answer 4 questions so the AI can focus on your gaps</Trans>
          </span>
        </button>
        <button
          onClick={() => void navigate("../study", { relative: "path" })}
          className="flex flex-col items-start gap-2 p-5 text-left bg-background hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
        >
          <span className="font-semibold text-foreground">
            <Trans>Start from scratch</Trans>
          </span>
          <span className="text-xs text-muted-foreground">
            <Trans>Full comprehensive material from the beginning</Trans>
          </span>
        </button>
      </div>
    </div>
  );
}
