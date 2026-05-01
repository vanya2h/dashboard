import { Button } from "@cloudflare/kumo/components/button";
import { useNavigate, useParams, useRouteLoaderData } from "react-router";
import type { loader as layoutLoader } from "./topic-layout";

export default function CompletePage() {
  const layoutData = useRouteLoaderData<typeof layoutLoader>("routes/topic-layout");
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const navigate = useNavigate();

  const taskTitle = layoutData?.task.title ?? "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="text-4xl mb-4">✓</div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Topic Complete</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm">
        You passed the final test for{" "}
        <span className="font-medium text-neutral-700 dark:text-neutral-300">{taskTitle}</span>. It&apos;s been marked
        as done.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => void navigate(`/curriculum/${curriculumId}`)}>
          Back to curriculum
        </Button>
        <Button variant="primary" onClick={() => void navigate("../choice", { relative: "path" })}>
          Start over
        </Button>
      </div>
    </div>
  );
}
