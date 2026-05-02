import { parseResponse } from "hono/client";
import { useRevalidator } from "react-router";
import { useRootData } from "../../app/hooks/useRootData";
import { apiClient } from "../lib/apiClient";
import type { PersistedPhase } from "../lib/phase";

export type ActivityEntry = {
  date: string;
  taskIds: string[];
  minutes: number;
};

export type ActiveSession = {
  name: PersistedPhase["name"];
  partIdx?: number;
};

export type Progress = {
  completedTaskIds: Record<string, string>;
  activity: Record<string, ActivityEntry>;
  startedAt: string;
  activeSessions: Record<string, ActiveSession>;
};

const EMPTY: Progress = {
  completedTaskIds: {},
  activity: {},
  startedAt: new Date().toISOString(),
  activeSessions: {},
};

export function useProgress() {
  const data = useRootData();
  const { revalidate } = useRevalidator();

  const progress = (data?.progress ?? EMPTY) as Progress;

  async function toggleTask(taskId: string) {
    await parseResponse(apiClient.api.progress.tasks[":taskId"].toggle.$post({ param: { taskId } }));
    revalidate();
  }

  return { ...progress, toggleTask };
}
