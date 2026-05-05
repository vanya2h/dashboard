import { Trans } from "@lingui/react/macro";
import { useNavigate, useParams, useRouteLoaderData } from "react-router";
import { Button } from "../../src/components/ui/Button";
import type { loader as layoutLoader } from "./topic-layout";

export default function CompletePage() {
  const layoutData = useRouteLoaderData<typeof layoutLoader>("routes/topic-layout");
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const navigate = useNavigate();

  const taskTitle = layoutData?.task.title ?? "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="text-4xl mb-4">✓</div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        <Trans>Topic Complete</Trans>
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        <Trans>
          You passed the final test for <span className="font-medium text-foreground">{taskTitle}</span>. It&apos;s been
          marked as done.
        </Trans>
      </p>
      <div className="flex gap-3">
        <Button onClick={() => void navigate(`/curriculum/${curriculumId}`)}>
          <Trans>Back to curriculum</Trans>
        </Button>
        <Button variant="primary" onClick={() => void navigate("../choice", { relative: "path" })}>
          <Trans>Start over</Trans>
        </Button>
      </div>
    </div>
  );
}
