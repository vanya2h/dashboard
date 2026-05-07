import { parseResponse } from "hono/client";
import { apiClient } from "../lib/apiClient";
import type { PersistedPhase } from "../lib/phase";

export function useTopicSession(taskId: string) {
  function saveSession(phase: PersistedPhase) {
    return parseResponse(
      apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: { phase },
      }),
    );
  }

  function deleteSession() {
    return parseResponse(apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId } }));
  }

  return { saveSession, deleteSession };
}
