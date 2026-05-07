import { redirect } from "react-router";
import { highestPhase, parseTopicSessionState, PHASE_ROUTES } from "../../src/lib/phase";
import { db } from "../../src/server/db";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/topic.index";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const record = await db.topicSession.findUnique({
    where: { userId_taskId: { userId: session.user.id, taskId: params.taskId } },
  });

  if (!record) return redirect("choice");

  const state = parseTopicSessionState(record.phaseData);
  const top = highestPhase(state);
  if (!top) return redirect("choice");
  return redirect(PHASE_ROUTES[top]);
}
