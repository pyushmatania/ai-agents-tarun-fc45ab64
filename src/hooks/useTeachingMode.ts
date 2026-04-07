import { useState, useCallback } from "react";

export const TEACHING_MODE_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  simpler: { label: "Simpler!", emoji: "🧸", color: "from-agni-green to-agni-green-light" },
  fun: { label: "Fun Example", emoji: "🎮", color: "from-agni-blue to-blue-400" },
  story: { label: "Story Time", emoji: "📖", color: "from-agni-purple to-purple-400" },
  silicon: { label: "Silicon Valley", emoji: "🎬", color: "from-violet-700 to-violet-500" },
  visual: { label: "Visual", emoji: "🎨", color: "from-teal-500 to-teal-300" },
  eli5: { label: "ELI5", emoji: "🍼", color: "from-sky-400 to-blue-300" },
  class5: { label: "Class 5", emoji: "🎒", color: "from-agni-green to-emerald-400" },
  engineer: { label: "Engineer", emoji: "⚙️", color: "from-agni-blue to-cyan-400" },
  hacker: { label: "Hacker", emoji: "💻", color: "from-agni-purple to-fuchsia-400" },
  researcher: { label: "Researcher", emoji: "🔬", color: "from-agni-pink to-pink-400" },
  academic: { label: "Academic", emoji: "📚", color: "from-slate-500 to-gray-400" },
  founder: { label: "Founder", emoji: "🚀", color: "from-agni-gold to-yellow-400" },
  crazy: { label: "Crazy", emoji: "🤯", color: "from-agni-pink to-rose-400" },
  chip: { label: "Chip Expert", emoji: "🏭", color: "from-agni-orange to-orange-400" },
  artist: { label: "Creative", emoji: "🎭", color: "from-teal-500 to-teal-300" },
  debate: { label: "Debate", emoji: "🥊", color: "from-red-500 to-pink-400" },
  podcast: { label: "Podcast", emoji: "🎙️", color: "from-violet-500 to-fuchsia-400" },
};

export function useTeachingMode() {
  const [mode, setModeState] = useState(() => localStorage.getItem("teaching_mode") || "engineer");

  const setMode = useCallback((id: string) => {
    setModeState(id);
    localStorage.setItem("teaching_mode", id);
  }, []);

  const info = TEACHING_MODE_MAP[mode] || { label: mode, emoji: "✨", color: "from-agni-purple to-purple-400" };

  return { mode, setMode, info };
}
