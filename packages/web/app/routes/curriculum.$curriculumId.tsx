import { Breadcrumbs } from "@cloudflare/kumo/components/breadcrumbs";
import { useParams } from "react-router";
import { CurriculumView } from "../../src/components/CurriculumView";
import { CURRICULUMS } from "../../src/data/curriculum";
import { useAllCurriculums } from "../../src/hooks/useAllCurriculums";
import type { BreadcrumbHandle } from "../../src/lib/breadcrumbs";
import { db } from "../../src/server/db";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/curriculum.$curriculumId";

export function meta({ data }: Route.MetaArgs): Route.MetaDescriptors {
  const name = data?.curriculumName;
  return [
    { title: name ? `${name} — Learning Tracker` : "Curriculum — Learning Tracker" },
    {
      name: "description",
      content: name
        ? `Explore topics and track your progress in ${name}.`
        : "Explore curriculum topics and track your learning progress.",
    },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await requireSession(request);

  const staticCurriculum = CURRICULUMS.find((c) => c.id === params.curriculumId);
  if (staticCurriculum) return { curriculumName: staticCurriculum.name };

  const custom = await db.customCurriculum.findFirst({
    where: { id: params.curriculumId, userId: session.user.id },
    select: { name: true },
  });
  return { curriculumName: custom?.name ?? null };
}

export const handle: BreadcrumbHandle = {
  breadcrumb: () => <CurriculumBreadcrumb />,
};

export default function CurriculumPage() {
  return <CurriculumView />;
}

function CurriculumBreadcrumb() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const all = useAllCurriculums();
  const name = all.find((c) => c.id === curriculumId)?.name ?? "";
  return <Breadcrumbs.Current>{name}</Breadcrumbs.Current>;
}
