import { useLoaderData } from "react-router";
import { TopicView } from "../../src/components/TopicView";
import type { PersistedPhase } from "../../src/components/TopicView/types";
import { db } from "../../src/server/db";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/topic.$curriculumId.$taskId";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const record = await db.topicSession.findUnique({
    where: { userId_taskId: { userId: session.user.id, taskId: params.taskId } },
  });
  return { phaseData: (record?.phaseData ?? null) as PersistedPhase | null };
}

export default function TopicPage() {
  const { phaseData } = useLoaderData<typeof loader>();
  return <TopicView initialPhaseData={phaseData} />;
}
