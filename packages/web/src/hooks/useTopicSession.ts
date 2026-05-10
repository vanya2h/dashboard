import { parseResponse } from "hono/client";
import { useMemo } from "react";
import { apiClient } from "../lib/apiClient";
import type { PersistedPhase } from "../lib/phase";

export function useTopicSession(taskId: string) {
  return useMemo(
    () => ({
      saveSession: (phase: PersistedPhase) =>
        parseResponse(
          apiClient.api["topic-sessions"][":taskId"].$put({
            param: { taskId },
            json: { phase },
          }),
        ),
      deleteSession: () => parseResponse(apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId } })),
    }),
    [taskId],
  );
}
