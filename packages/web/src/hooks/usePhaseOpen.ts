import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";

const phaseOpenAtom = atomWithStorage<Record<string, boolean>>("phase-open", {});

export function usePhaseOpen(key: string, defaultOpen: boolean) {
  const [openMap, setOpenMap] = useAtom(phaseOpenAtom);
  const open = openMap[key] ?? defaultOpen;
  const toggle = useCallback(() => {
    setOpenMap((prev) => ({ ...prev, [key]: !(prev[key] ?? defaultOpen) }));
  }, [key, defaultOpen, setOpenMap]);
  return { open, toggle };
}
