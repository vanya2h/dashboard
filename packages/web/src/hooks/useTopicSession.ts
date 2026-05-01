import { apiClient } from "../lib/apiClient";
import type { PersistedPhase } from "../lib/phase";

export function useTopicSession(taskId: string) {
  function saveSession(phaseData: PersistedPhase) {
    return apiClient.api["topic-sessions"][":taskId"].$put({
      param: { taskId },
      json: { phaseData },
    });
  }

  function deleteSession() {
    return apiClient.api["topic-sessions"][":taskId"].$delete({
      param: { taskId },
    });
  }

  return { saveSession, deleteSession };
}
