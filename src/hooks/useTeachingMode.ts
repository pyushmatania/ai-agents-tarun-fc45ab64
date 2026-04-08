import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getScopedStorage } from "@/lib/scopedStorage";
import { getTeachingSelection, setTeachingSelection, MISSION_MODES, TEACHING_VIBES, BRAIN_LEVELS } from "@/lib/teachingConfig";

// Legacy map for backward compatibility
export const TEACHING_MODE_MAP: Record<string, { label: string; emoji: string; color: string }> = {};
MISSION_MODES.forEach(m => { TEACHING_MODE_MAP[m.id] = { label: m.label, emoji: m.emoji, color: m.color }; });
TEACHING_VIBES.forEach(v => { TEACHING_MODE_MAP[v.id] = { label: v.label, emoji: v.emoji, color: v.color }; });
BRAIN_LEVELS.forEach(b => { TEACHING_MODE_MAP[b.id] = { label: b.label, emoji: b.emoji, color: b.color }; });

export function useTeachingMode() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [mode, setModeState] = useState(() =>
    getScopedStorage(userId).get<string>("teaching_mode", "engineer")
  );

  // Rebuild when user changes
  useEffect(() => {
    setModeState(getScopedStorage(userId).get<string>("teaching_mode", "engineer"));
  }, [userId]);

  const setMode = useCallback((id: string) => {
    setModeState(id);
    getScopedStorage(userId).set("teaching_mode", id);
  }, [userId]);

  const info = TEACHING_MODE_MAP[mode] || { label: mode, emoji: "✨", color: "from-agni-purple to-purple-400" };

  return { mode, setMode, info };
}

export function useTeachingCategories() {
  const [mission, setMissionState] = useState(() => getTeachingSelection("mission"));
  const [vibe, setVibeState] = useState(() => getTeachingSelection("vibe"));
  const [brain, setBrainState] = useState(() => getTeachingSelection("brain"));

  // Refresh state on storage or auth-changed events
  useEffect(() => {
    const refresh = () => {
      setMissionState(getTeachingSelection("mission"));
      setVibeState(getTeachingSelection("vibe"));
      setBrainState(getTeachingSelection("brain"));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("auth-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("auth-changed", refresh);
    };
  }, []);

  const setMission = useCallback((id: string) => {
    setMissionState(id);
    setTeachingSelection("mission", id);
  }, []);

  const setVibe = useCallback((id: string) => {
    setVibeState(id);
    setTeachingSelection("vibe", id);
  }, []);

  const setBrain = useCallback((id: string) => {
    setBrainState(id);
    setTeachingSelection("brain", id);
  }, []);

  return {
    mission, setMission,
    vibe, setVibe,
    brain, setBrain,
    missionInfo: MISSION_MODES.find(m => m.id === mission),
    vibeInfo: TEACHING_VIBES.find(v => v.id === vibe),
    brainInfo: BRAIN_LEVELS.find(b => b.id === brain),
  };
}
