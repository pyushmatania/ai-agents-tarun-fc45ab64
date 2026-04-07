/**
 * Unified Teaching Configuration — 3 Categories with fun names
 * 
 * 1. 🎯 MISSION MODE — WHY you're learning (your mood/goal)
 * 2. 🎨 TEACHING VIBE — HOW AGNI teaches (style)
 * 3. 🧠 BRAIN LEVEL — Difficulty/depth
 */

// ─── MISSION MODE ───
export interface MissionOption {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
}

export const MISSION_MODES: MissionOption[] = [
  { id: "job", label: "My Job", emoji: "💼", desc: "How does this help at work?", color: "from-amber-500 to-orange-400" },
  { id: "future", label: "Future-Proof", emoji: "🔮", desc: "Stay ahead of the curve", color: "from-violet-500 to-purple-400" },
  { id: "skill", label: "Skill Up", emoji: "💪", desc: "Level up my abilities", color: "from-blue-500 to-cyan-400" },
  { id: "earn", label: "Money Moves", emoji: "💰", desc: "Help me earn more", color: "from-emerald-500 to-green-400" },
  { id: "build", label: "Build Stuff", emoji: "🚀", desc: "I want to create things", color: "from-pink-500 to-rose-400" },
  { id: "struggling", label: "Go Easier", emoji: "🧸", desc: "I'm lost, simplify please", color: "from-sky-400 to-blue-300" },
  { id: "explore", label: "Just Vibing", emoji: "✨", desc: "I'm curious, surprise me", color: "from-indigo-400 to-violet-300" },
  { id: "impress", label: "Impress Mode", emoji: "🎤", desc: "Sound smart in meetings", color: "from-rose-500 to-pink-400" },
  { id: "interview", label: "Interview Prep", emoji: "🎯", desc: "Crack that AI interview", color: "from-teal-500 to-emerald-400" },
  { id: "switch", label: "Career Switch", emoji: "🔄", desc: "Transitioning into AI", color: "from-orange-500 to-amber-400" },
];

// ─── TEACHING VIBE ───
export interface VibeOption {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
}

export const TEACHING_VIBES: VibeOption[] = [
  { id: "fun", label: "Fun & Memes", emoji: "😂", desc: "Make me LOL while learning", color: "from-pink-500 to-rose-400" },
  { id: "story", label: "Story-driven", emoji: "📖", desc: "Tales & analogies", color: "from-purple-500 to-violet-400" },
  { id: "serious", label: "Deep & Serious", emoji: "🧠", desc: "No fluff, pure knowledge", color: "from-blue-500 to-cyan-400" },
  { id: "fast", label: "Fast & Practical", emoji: "⚡", desc: "Ship it now!", color: "from-amber-500 to-yellow-400" },
  { id: "visual", label: "Visual", emoji: "🎨", desc: "Diagrams & charts", color: "from-teal-500 to-emerald-400" },
  { id: "socratic", label: "Socratic", emoji: "🤔", desc: "Guide me with questions", color: "from-orange-500 to-amber-400" },
  { id: "gamified", label: "Gamified", emoji: "🎮", desc: "XP, quests & challenges", color: "from-indigo-500 to-blue-400" },
  { id: "handson", label: "Hands-on", emoji: "🔧", desc: "Learn by building", color: "from-lime-500 to-green-400" },
  { id: "eli5", label: "ELI5", emoji: "🍼", desc: "Explain like I'm 5", color: "from-sky-400 to-blue-300" },
  { id: "academic", label: "Academic", emoji: "📚", desc: "Papers & citations", color: "from-slate-500 to-gray-400" },
  { id: "debate", label: "Debate", emoji: "🥊", desc: "Challenge my ideas", color: "from-red-500 to-pink-400" },
  { id: "podcast", label: "Podcast", emoji: "🎙️", desc: "Like chatting with a friend", color: "from-violet-500 to-fuchsia-400" },
];

// ─── BRAIN LEVEL ───
export interface BrainLevel {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
}

export const BRAIN_LEVELS: BrainLevel[] = [
  { id: "chill", label: "Chill", emoji: "🌱", desc: "Keep it simple & easy", color: "from-green-400 to-emerald-300" },
  { id: "explorer", label: "Explorer", emoji: "🌿", desc: "Balanced depth", color: "from-blue-400 to-cyan-300" },
  { id: "pro", label: "Pro", emoji: "🌳", desc: "Full technical depth", color: "from-purple-500 to-violet-400" },
  { id: "hacker", label: "Hacker", emoji: "💻", desc: "Skip theory, show code", color: "from-emerald-500 to-teal-400" },
  { id: "scientist", label: "Scientist", emoji: "🔬", desc: "Papers, math & proofs", color: "from-pink-500 to-rose-400" },
  { id: "professor", label: "Professor", emoji: "🎓", desc: "Teach me to teach others", color: "from-amber-500 to-yellow-400" },
];

// ─── CATEGORY METADATA (fun names) ───
export const TEACHING_CATEGORIES = [
  {
    id: "mission",
    label: "🎯 Mission Mode",
    funName: "Mission Mode",
    desc: "Why are you learning this?",
    storageKey: "teaching_mission",
    options: MISSION_MODES,
    defaultId: "explore",
  },
  {
    id: "vibe",
    label: "🎨 Teaching Vibe",
    funName: "Teaching Vibe",
    desc: "How should AGNI teach you?",
    storageKey: "teaching_vibe",
    options: TEACHING_VIBES,
    defaultId: "fun",
  },
  {
    id: "brain",
    label: "🧠 Brain Level",
    funName: "Brain Level",
    desc: "How deep should we go?",
    storageKey: "teaching_brain",
    options: BRAIN_LEVELS,
    defaultId: "explorer",
  },
] as const;

// ─── Helpers ───
export function getTeachingSelection(categoryId: string): string {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return "";
  return localStorage.getItem(cat.storageKey) || cat.defaultId;
}

export function setTeachingSelection(categoryId: string, value: string) {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return;
  localStorage.setItem(cat.storageKey, value);
  window.dispatchEvent(new Event("storage"));
}

export function getTeachingLabel(categoryId: string): { label: string; emoji: string } | null {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return null;
  const val = getTeachingSelection(categoryId);
  const opt = cat.options.find((o: any) => o.id === val);
  return opt ? { label: opt.label, emoji: opt.emoji } : { label: val, emoji: "✨" };
}

/** Build a context string for AI prompts based on all 3 selections */
export function getTeachingContext(): string {
  const mission = getTeachingSelection("mission");
  const vibe = getTeachingSelection("vibe");
  const brain = getTeachingSelection("brain");
  
  const missionOpt = MISSION_MODES.find(m => m.id === mission);
  const vibeOpt = TEACHING_VIBES.find(v => v.id === vibe);
  const brainOpt = BRAIN_LEVELS.find(b => b.id === brain);

  const parts: string[] = [];
  if (missionOpt) parts.push(`Mission: ${missionOpt.label} (${missionOpt.desc})`);
  if (vibeOpt) parts.push(`Teaching style: ${vibeOpt.label} (${vibeOpt.desc})`);
  if (brainOpt) parts.push(`Depth: ${brainOpt.label} (${brainOpt.desc})`);
  
  return parts.join(". ");
}
