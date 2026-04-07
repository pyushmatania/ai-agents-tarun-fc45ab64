import { useState, useCallback } from "react";
import { getTeachingSelection, setTeachingSelection, TEACHING_CATEGORIES, MISSION_MODES, TEACHING_VIBES, BRAIN_LEVELS } from "@/lib/teachingConfig";

// Legacy map for backward compatibility
export const TEACHING_MODE_MAP: Record<string, { label: string; emoji: string; color: string }> = {};
MISSION_MODES.forEach(m => { TEACHING_MODE_MAP[m.id] = { label: m.label, emoji: m.emoji, color: m.color }; });
TEACHING_VIBES.forEach(v => { TEACHING_MODE_MAP[v.id] = { label: v.label, emoji: v.emoji, color: v.color }; });
BRAIN_LEVELS.forEach(b => { TEACHING_MODE_MAP[b.id] = { label: b.label, emoji: b.emoji, color: b.color }; });

export function useTeachingMode() {
  const [mode, setModeState] = useState(() => localStorage.getItem("teaching_mode") || "engineer");

  const setMode = useCallback((id: string) => {
    setModeState(id);
    localStorage.setItem("teaching_mode", id);
  }, []);

  const info = TEACHING_MODE_MAP[mode] || { label: mode, emoji: "✨", color: "from-agni-purple to-purple-400" };

  return { mode, setMode, info };
}

export function useTeachingCategories() {
  const [mission, setMissionState] = useState(() => getTeachingSelection("mission"));
  const [vibe, setVibeState] = useState(() => getTeachingSelection("vibe"));
  const [brain, setBrainState] = useState(() => getTeachingSelection("brain"));

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
