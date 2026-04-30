import { useRevalidator } from "react-router";
import { useRootData } from "../../app/hooks/useRootData";
import { apiClient } from "../lib/apiClient";

export type ActivityEntry = {
  date: string;
  taskIds: string[];
  minutes: number;
};

export type ActiveSession = {
  name: string;
  partIdx?: number;
  step?: string;
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

  const progress: Progress = data?.progress ?? EMPTY;

  async function toggleTask(taskId: string) {
    await apiClient.api.progress.tasks[":taskId"].toggle.$post({ param: { taskId } });
    revalidate();
  }

  return { ...progress, toggleTask };
}
