import { Button } from "@cloudflare/kumo/components/button";
import { Outlet, useLoaderData, useNavigate, useParams } from "react-router";
import { redirect } from "react-router";
import { CURRICULUMS } from "../../src/data/curriculum";
import { useTopicSession } from "../../src/hooks/useTopicSession";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/topic-layout";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireSession(request);
  for (const c of CURRICULUMS) {
    for (const p of c.phases) {
      for (const t of p.tasks) {
        if (t.id === params.taskId) {
          return { task: t, curriculumName: c.name };
        }
      }
    }
  }
  return redirect(`/curriculum/${params.curriculumId}`);
}

export default function TopicLayout() {
  const { task, curriculumName } = useLoaderData<typeof loader>();
  const { curriculumId, taskId } = useParams<{ curriculumId: string; taskId: string }>();
  const navigate = useNavigate();
  const { deleteSession } = useTopicSession(taskId!);

  function goBack() {
    void navigate(`/curriculum/${curriculumId}`);
  }

  function startOver() {
    void deleteSession();
    void navigate("choice", { relative: "path" });
  }

  return (
    <>
      <header className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <Button size="sm" onClick={goBack}>
          ← Back
        </Button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">{task.title}</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{curriculumName}</p>
        </div>
        <div className="ml-auto shrink-0">
          <Button size="sm" onClick={startOver}>
            Start over
          </Button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
