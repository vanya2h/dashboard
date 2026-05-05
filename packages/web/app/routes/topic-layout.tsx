import { Breadcrumbs } from "@cloudflare/kumo/components/breadcrumbs";
import { Outlet, useLoaderData, useNavigate, useParams, useRouteLoaderData } from "react-router";
import { redirect } from "react-router";
import { TopicHeader } from "../../src/components/TopicHeader";
import { CURRICULUMS_BY_LOCALE } from "../../src/data/curriculum";
import type { CurriculumDef } from "../../src/data/types";
import { parseCurriculumDef } from "../../src/data/types";
import { useTopicSession } from "../../src/hooks/useTopicSession";
import type { BreadcrumbHandle } from "../../src/lib/breadcrumbs";
import { getLocaleFromRequest } from "../../src/lib/i18n";
import { db } from "../../src/server/db";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/topic-layout";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  const title = loaderData?.task?.title;
  return [
    { title: title ? `${title} — Learning Tracker` : "Topic — Learning Tracker" },
    {
      name: "description",
      content: title
        ? `Study ${title} with AI-generated material and hands-on practice.`
        : "Study this topic with AI-generated material and hands-on practice.",
    },
  ];
}

function findTask(curriculums: CurriculumDef[], taskId: string) {
  for (const c of curriculums) {
    for (const p of c.phases) {
      for (const t of p.tasks) {
        if (t.id === taskId) {
          return { task: t, curriculumName: c.name, phaseTitle: p.title, complexity: c.complexity };
        }
      }
    }
  }
  return null;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await requireSession(request);

  const locale = getLocaleFromRequest(request);
  const found = findTask(CURRICULUMS_BY_LOCALE[locale], params.taskId);
  if (found) return found;

  const custom = await db.customCurriculum.findMany({ where: { userId: session.user.id } });
  const customCurriculums = custom
    .map((c) => parseCurriculumDef({ ...c, description: c.description ?? undefined }))
    .filter((c) => c !== null);
  const foundCustom = findTask(customCurriculums, params.taskId);
  if (foundCustom) return foundCustom;

  return redirect(`/curriculum/${params.curriculumId}`);
}

export const handle: BreadcrumbHandle = {
  breadcrumb: () => <TopicBreadcrumb />,
};

function TopicBreadcrumb() {
  const data = useRouteLoaderData<typeof loader>("routes/topic-layout");
  const { curriculumId } = useParams<{ curriculumId: string }>();
  if (!data) return null;
  const { curriculumName, phaseTitle } = data;
  return (
    <>
      <Breadcrumbs.Link href={`/curriculum/${curriculumId}`}>{curriculumName}</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <span className="flex min-w-0 max-w-full items-center text-muted-foreground">
        <span className="truncate">{phaseTitle}</span>
      </span>
    </>
  );
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
      <TopicHeader taskTitle={task.title} curriculumName={curriculumName} onBack={goBack} onStartOver={startOver} />
      <Outlet />
    </>
  );
}
