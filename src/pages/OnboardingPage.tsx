import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ArrowLeft, Sparkles, Search, Check, X,
  Shield, Zap, Heart, Star, Rocket, Brain,
  BookOpen, Gamepad2, Music, Film, Trophy, Newspaper, Lightbulb,
  GraduationCap, Code, Briefcase, Palette, Wrench, Globe, Target,
  MessageCircle
} from "lucide-react";
import Agni from "@/components/Agni";
import { getSuggestionImage, getPillColor } from "@/lib/suggestionImages";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { InterestPill } from "@/components/InterestPill";
import SmartInterestSearch from "@/components/SmartInterestSearch";
import type { AgniExpression } from "@/components/Agni";
import { motion, AnimatePresence } from "framer-motion";
import { savePersona, SUGGESTION_CATEGORIES, NeuralOSPersona, getSubFilters, getSubFilterCount, POPULAR_PICKS } from "@/lib/neuralOS";
import { TrendingUp, Crown, MapPin } from "lucide-react";
import { MISSION_MODES, BRAIN_LEVELS, IDENTITIES, BRAIN_LEVELS_ACADEMIC, BRAIN_LEVELS_SKILL, TEACHING_VIBES, setTeachingSelection, saveCustomOption, getCustomOptions, setBrainTrack } from "@/lib/teachingConfig";
import CustomOptionInput from "@/components/CustomOptionInput";
import { MISSION_FOLLOWUPS, AGE_RANGES, GENDERS, EDUCATION_LEVELS, EXPERIENCE_LEVELS } from "@/lib/missionFollowups";
import { getUserContextLocal } from "@/hooks/useUserContext";
import { SFX } from "@/lib/sounds";

/* ── ROLES now powered by IDENTITIES from teachingConfig ── */
const ROLES = IDENTITIES.map(id => ({
  id: id.id,
  label: id.label,
  emoji: id.emoji,
  desc: id.desc,
  goal: `Master AI agents as a ${id.label}`,
  exp: "some experience",
  icon: Brain,
  color: id.color,
}));

const VIBES = TEACHING_VIBES.map(v => ({
  id: v.id,
  label: v.label,
  emoji: v.emoji,
  desc: v.desc,
  icon: Heart,
  gradient: v.color,
}));

/* ── Fun catchy step titles with pop culture ── */
const STEP_THEMES = {
  splash: { bg: "from-agni-green/25 via-agni-blue/15 to-agni-purple/20", mascot: "celebrating" as AgniExpression },
  name: { bg: "from-agni-blue/20 to-agni-purple/10", mascot: "happy" as AgniExpression },
  aboutYou: { bg: "from-agni-pink/20 to-agni-gold/10", mascot: "happy" as AgniExpression },
  identity: { bg: "from-agni-purple/25 to-agni-pink/15", mascot: "thinking" as AgniExpression },
  background: { bg: "from-agni-blue/20 to-agni-green/10", mascot: "thinking" as AgniExpression },
  mission: { bg: "from-agni-gold/25 to-agni-orange/15", mascot: "excited" as AgniExpression },
  missionFollowup: { bg: "from-agni-gold/20 to-agni-green/10", mascot: "excited" as AgniExpression },
  vibe: { bg: "from-agni-orange/25 to-agni-pink/15", mascot: "celebrating" as AgniExpression },
  brain: { bg: "from-agni-purple/25 to-agni-blue/15", mascot: "teaching" as AgniExpression },
  whyMatters: { bg: "from-agni-gold/30 to-agni-pink/15", mascot: "excited" as AgniExpression },
};

/* ── Mascot interlude configs ── */
const INTERLUDES = [
  { after: 2, speech: "Loading your profile... 🧬", expr: "thinking" as AgniExpression, msg: "AGNI is analyzing your vibe..." },
  { after: 4, speech: "Almost there, warrior! 🥷", expr: "excited" as AgniExpression, msg: "Building your learning path..." },
  { after: 8, speech: "Preparing your playground! 🎮", expr: "celebrating" as AgniExpression, msg: "Setting up Neural-OS..." },
];

/* ── AGNI HINTS ── */
const AGNI_HINTS: Record<string, { speech: string; expr: AgniExpression; hint: string }> = {
  shows: { speech: "I'll use your fave scenes as analogies! 🎬", expr: "excited", hint: "💡 \"Think of an AI agent like Byomkesh — gathering clues from multiple sources!\"" },
  sports: { speech: "Sports = perfect AI analogies! ⚽", expr: "happy", hint: "💡 \"Think of RAG like Dhoni reading the pitch — pulling the right info at the right time!\"" },
  music: { speech: "Your playlist shapes my vibe! 🎵", expr: "celebrating", hint: "💡 \"An LLM is like A.R. Rahman composing — mixing patterns into something new!\"" },
  gaming: { speech: "Game mechanics = AI concepts! 🎮", expr: "excited", hint: "💡 \"Multi-agent systems are like your Valorant team — each agent has a role!\"" },
  news: { speech: "I'll reference your sources! 📰", expr: "teaching", hint: "💡 \"I'll cite @karpathy's takes when teaching you about transformers!\"" },
  books: { speech: "Books + AI = 🔥 combos!", expr: "thinking", hint: "💡 \"Like Zero to One says — AI agents are the next 0→1 shift!\"" },
  hobbies: { speech: "Everything connects to AI! ✨", expr: "happy", hint: "💡 \"Your love for cooking? AI agents follow recipes too — we call them workflows!\"" },
  curious: { speech: "Let's explore together! 🔮", expr: "celebrating", hint: "💡 \"I'll build personalized rabbit holes into every lesson for you!\"" },
};

const CATEGORY_GRADIENTS = [
  "from-[#FF4B4B] to-[#FF86D8]",
  "from-[#1CB0F6] to-[#CE82FF]",
  "from-[#58CC02] to-[#1CB0F6]",
  "from-[#FFC800] to-[#FF9600]",
  "from-[#CE82FF] to-[#FF4B4B]",
  "from-[#FF9600] to-[#FFC800]",
  "from-[#1CB0F6] to-[#58CC02]",
  "from-[#FF86D8] to-[#CE82FF]",
];

/* ── Colorful pill colors for options ── */
const PILL_COLORS = [
  "bg-[#58CC02]/15 border-[#58CC02]/40 text-[#58CC02]",
  "bg-[#CE82FF]/15 border-[#CE82FF]/40 text-[#CE82FF]",
  "bg-[#1CB0F6]/15 border-[#1CB0F6]/40 text-[#1CB0F6]",
  "bg-[#FFC800]/15 border-[#FFC800]/40 text-[#B8960F]",
  "bg-[#FF4B4B]/15 border-[#FF4B4B]/40 text-[#FF4B4B]",
  "bg-[#FF86D8]/15 border-[#FF86D8]/40 text-[#FF86D8]",
  "bg-[#FF9600]/15 border-[#FF9600]/40 text-[#CC7A00]",
  "bg-agni-green/15 border-agni-green/40 text-agni-green",
];

const PILL_SELECTED_COLORS = [
  "bg-[#58CC02]/30 border-[#58CC02] text-[#58CC02] shadow-[0_0_12px_hsl(100_95%_40%/0.3)]",
  "bg-[#CE82FF]/30 border-[#CE82FF] text-[#CE82FF] shadow-[0_0_12px_hsl(270_100%_75%/0.3)]",
  "bg-[#1CB0F6]/30 border-[#1CB0F6] text-[#1CB0F6] shadow-[0_0_12px_hsl(199_92%_54%/0.3)]",
  "bg-[#FFC800]/30 border-[#FFC800] text-[#B8960F] shadow-[0_0_12px_hsl(46_100%_49%/0.3)]",
  "bg-[#FF4B4B]/30 border-[#FF4B4B] text-[#FF4B4B] shadow-[0_0_12px_hsl(0_100%_65%/0.3)]",
  "bg-[#FF86D8]/30 border-[#FF86D8] text-[#FF86D8] shadow-[0_0_12px_hsl(323_100%_76%/0.3)]",
  "bg-[#FF9600]/30 border-[#FF9600] text-[#CC7A00] shadow-[0_0_12px_hsl(33_100%_50%/0.3)]",
  "bg-agni-green/30 border-agni-green text-agni-green shadow-glow-green",
];

/* ── Organic blob card styles (like reference image) ── */
const BLOB_STYLES = [
  { bg: "bg-[#7C5CBF]", text: "text-white", radius: "rounded-[24px]" },
  { bg: "bg-[#F0805E]", text: "text-white", radius: "rounded-[28px_28px_8px_28px]" },
  { bg: "bg-[#F5EDE3]", text: "text-gray-800", radius: "rounded-[20px_28px_28px_8px]" },
  { bg: "bg-[#1A1A2E]", text: "text-white", radius: "rounded-[28px]" },
  { bg: "bg-[#F5EDE3]", text: "text-gray-800", radius: "rounded-[8px_28px_28px_28px]" },
  { bg: "bg-[#D4A853]", text: "text-white", radius: "rounded-[28px_8px_28px_28px]" },
  { bg: "bg-[#C5E8F0]", text: "text-gray-800", radius: "rounded-[28px_28px_28px_8px]" },
  { bg: "bg-white", text: "text-gray-800", radius: "rounded-[24px]" },
  { bg: "bg-[#1A1A2E]", text: "text-white", radius: "rounded-[28px_8px_28px_28px]" },
  { bg: "bg-[#F0805E]", text: "text-white", radius: "rounded-[8px_28px_28px_28px]" },
  { bg: "bg-[#7C5CBF]", text: "text-white", radius: "rounded-[28px_28px_8px_28px]" },
  { bg: "bg-[#C5E8F0]", text: "text-gray-800", radius: "rounded-[24px]" },
  { bg: "bg-[#D4A853]", text: "text-white", radius: "rounded-[28px]" },
  { bg: "bg-[#F5EDE3]", text: "text-gray-800", radius: "rounded-[28px_8px_28px_28px]" },
  { bg: "bg-[#1A1A2E]", text: "text-white", radius: "rounded-[8px_28px_28px_28px]" },
  { bg: "bg-[#F0805E]", text: "text-white", radius: "rounded-[28px_28px_28px_8px]" },
  { bg: "bg-white", text: "text-gray-800", radius: "rounded-[28px_8px_28px_28px]" },
  { bg: "bg-[#7C5CBF]", text: "text-white", radius: "rounded-[24px]" },
  { bg: "bg-[#C5E8F0]", text: "text-gray-800", radius: "rounded-[28px_28px_8px_28px]" },
  { bg: "bg-[#D4A853]", text: "text-white", radius: "rounded-[8px_28px_28px_28px]" },
  { bg: "bg-[#F5EDE3]", text: "text-gray-800", radius: "rounded-[28px]" },
  { bg: "bg-[#1A1A2E]", text: "text-white", radius: "rounded-[28px_28px_28px_8px]" },
];

const TOTAL_STEPS = 10 + SUGGESTION_CATEGORIES.length + 1;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [selectedBrain, setSelectedBrain] = useState<string | null>(null);
  const [customMissions, setCustomMissions] = useState(getCustomOptions("mission"));
  const [customVibes, setCustomVibes] = useState(getCustomOptions("vibe"));
  const [customBrains, setCustomBrains] = useState(getCustomOptions("brain"));
  const [persona, setPersona] = useState<Partial<NeuralOSPersona>>({});
  const [search, setSearch] = useState("");
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [smartSearchQuery, setSmartSearchQuery] = useState("");
  const [brainTrack, setBrainTrackState] = useState<"skill" | "academic">("skill");
  const [showInterlude, setShowInterlude] = useState(false);
  const [interludeData, setInterludeData] = useState<typeof INTERLUDES[0] | null>(null);
  // Personal details
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  // Mission follow-up
  const [missionFollowup, setMissionFollowup] = useState<Record<string, string>>({});

  const categoryIndex = step >= 10 ? step - 10 : -1;
  const activeCategory = categoryIndex >= 0 && categoryIndex < SUGGESTION_CATEGORIES.length
    ? SUGGESTION_CATEGORIES[categoryIndex] : null;
  const isConfirmStep = step === 10 + SUGGESTION_CATEGORIES.length;

  const currentItems = activeCategory
    ? ((persona[activeCategory.field] as string[]) || [])
    : [];

  const totalSelected = useMemo(() => {
    let count = 0;
    SUGGESTION_CATEGORIES.forEach(cat => {
      const items = (persona[cat.field] as string[]) || [];
      count += items.length;
    });
    return count;
  }, [persona]);

  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  const goNext = () => {
    SFX.whoosh();
    setDir(1);
    // Check for interlude
    const interlude = INTERLUDES.find(i => i.after === step);
    if (interlude) {
      setInterludeData(interlude);
      setShowInterlude(true);
      setTimeout(() => {
        setShowInterlude(false);
        setStep(s => s + 1);
        setSearch("");
        setActiveSubFilter(null);
      }, 1500);
    } else {
      setStep(s => s + 1);
      setSearch("");
      setActiveSubFilter(null);
    }
  };
  const goBack = () => { SFX.tap(); setDir(-1); setStep(s => Math.max(0, s - 1)); setSearch(""); setActiveSubFilter(null); };

  // Auto-skip mission followup step if no questions
  useEffect(() => {
    if (step === 6 && (!selectedMission || !MISSION_FOLLOWUPS[selectedMission])) {
      setDir(1);
      setStep(7);
    }
  }, [step, selectedMission]);

  const toggleItem = (item: string) => {
    SFX.select();
    if (!activeCategory) return;
    const field = activeCategory.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
    setPersona({ ...persona, [field]: updated });
  };

  const removeItem = (catField: string, item: string) => {
    const current = (persona[catField as keyof NeuralOSPersona] as string[]) || [];
    setPersona({ ...persona, [catField]: current.filter(x => x !== item) });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim() && activeCategory) {
      setSmartSearchQuery(search.trim());
      setSmartSearchOpen(true);
    }
  };

  const handleSmartSearchSelect = (item: { name: string; category: string; subCategory: string }) => {
    const targetCat = SUGGESTION_CATEGORIES.find(c => c.id === item.category) || activeCategory;
    if (!targetCat) return;
    const field = targetCat.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    if (!current.includes(item.name)) {
      setPersona({ ...persona, [field]: [...current, item.name] });
    }
    setSearch("");
  };

  const subFilters = activeCategory ? getSubFilters(activeCategory) : [];

  const filtered = activeCategory
    ? activeCategory.suggestions.filter(s => {
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.tag && s.tag.toLowerCase().includes(search.toLowerCase()));
        const matchSub = !activeSubFilter || (s.tag && s.tag.toLowerCase().startsWith(activeSubFilter.toLowerCase()));
        return matchSearch && matchSub;
      })
    : [];

  const showAddCustom = search.trim().length > 1 && activeCategory &&
    !activeCategory.suggestions.some(s => s.name.toLowerCase() === search.toLowerCase().trim());

  const finish = () => {
    SFX.celebration();
    const role = ROLES.find(r => r.id === selectedRole);
    const roleLabel = selectedRole === "custom" ? customRole.trim() : role?.label;
    const depthMap: Record<string, string> = { chill: "basic", sprout: "basic", explorer: "normal", builder: "normal", pro: "deep", hacker: "deep", scientist: "deep", professor: "deep", architect_brain: "deep", researcher: "deep", demon: "deep", class5: "basic", class8: "basic", class10: "normal", class12: "normal", college_fresh: "normal", college_senior: "deep", masters: "deep", uni_professor: "deep" };
    savePersona({
      ...persona,
      name: name.trim(),
      goal: role?.goal || "Master AI agents",
      experience: role?.exp || "some experience",
      vibe: selectedVibe || "fun",
      preferredDepth: (depthMap[selectedBrain || "explorer"] || "normal") as any,
      currentRole: roleLabel,
      completedAt: new Date().toISOString(),
    });
    if (selectedRole) setTeachingSelection("identity", selectedRole);
    if (selectedMission) setTeachingSelection("mission", selectedMission);
    if (selectedVibe) setTeachingSelection("vibe", selectedVibe);
    if (selectedBrain) setTeachingSelection("brain", selectedBrain);
    localStorage.setItem("edu_user_name", name.trim());
    localStorage.setItem("edu_user_role", selectedRole || "student");
    localStorage.setItem("edu_onboarded", "true");
    const userCtx = {
      age_range: ageRange,
      gender,
      education,
      location,
      work_experience: workExperience,
      job_title: jobTitle,
      mission_followup: missionFollowup,
      teaching_identity: selectedRole || "",
      teaching_mission: selectedMission || "",
      teaching_vibe: selectedVibe || "",
      teaching_brain: selectedBrain || "",
      brain_track: brainTrack,
    };
    localStorage.setItem("user_context", JSON.stringify(userCtx));
    navigate("/");
  };

  const catHint = activeCategory ? AGNI_HINTS[activeCategory.id] : null;

  /* ── Organic Blob Card (matches reference screenshot) ── */
  const ColorPill = ({ emoji, label, desc, selected, onClick, index, color }: {
    emoji: string; label: string; desc: string; selected: boolean; onClick: () => void; index: number; color?: string;
  }) => {
    const blob = BLOB_STYLES[index % BLOB_STYLES.length];
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.05 + index * 0.04, type: "spring", stiffness: 300, damping: 20 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { SFX.select(); onClick(); }}
        className={`relative px-3.5 py-3.5 ${blob.radius} text-left transition-all overflow-hidden ${blob.bg} ${
          selected ? "ring-[3px] ring-[#58CC02] shadow-[0_0_20px_rgba(88,204,2,0.3)] scale-[1.03]" : "shadow-sm hover:shadow-md"
        }`}
      >
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#58CC02] flex items-center justify-center z-10 shadow-md">
            <Check size={13} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">{emoji}</span>
          <div className="min-w-0 flex-1">
            <span className={`text-[13px] font-extrabold block leading-tight ${blob.text}`}>{label}</span>
            <span className={`text-[9px] leading-tight block mt-0.5 ${blob.text} opacity-70`}>{desc}</span>
          </div>
        </div>
      </motion.button>
    );
  };

  /* ── Colorful List Option Component ── */
  const ColorListOption = ({ emoji, label, desc, selected, onClick, index, color }: {
    emoji: string; label: string; desc: string; selected: boolean; onClick: () => void; index: number; color?: string;
  }) => {
    const colorIdx = index % PILL_COLORS.length;
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 + index * 0.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { SFX.select(); onClick(); }}
        className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
          selected ? PILL_SELECTED_COLORS[colorIdx] : `border-border/50 bg-card/80 hover:${PILL_COLORS[colorIdx]}`
        }`}
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color || "from-agni-green to-agni-blue"} flex items-center justify-center shadow-lg shrink-0`}>
          <span className="text-2xl">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-extrabold text-foreground block">{label}</span>
          <span className="text-[10px] text-muted-foreground">{desc}</span>
        </div>
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-agni-green flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Interlude overlay */}
      <AnimatePresence>
        {showInterlude && interludeData && (
          <motion.div
            key="interlude"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <Agni expression={interludeData.expr} size={140} animate speech={interludeData.speech} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-bold text-muted-foreground mt-4"
            >
              {interludeData.msg}
            </motion.p>
            <motion.div
              className="mt-4 flex gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-agni-green"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {step > 0 && !showInterlude && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-3 flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center shrink-0 active:scale-90 transition-transform">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-agni-green via-agni-blue to-agni-purple"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-extrabold text-muted-foreground w-8 text-right">{step}/{TOTAL_STEPS - 1}</span>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        {/* ═══════ STEP 0: SPLASH ═══════ */}
        {step === 0 && (
          <motion.div key="splash" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen items-center justify-center"
          >
            {/* Animated colorful background */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 30% 20%, hsl(100 95% 40% / 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, hsl(270 100% 75% / 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 60% 30%, hsl(199 92% 54% / 0.15) 0%, transparent 60%), radial-gradient(circle at 30% 70%, hsl(46 100% 49% / 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 30% 20%, hsl(100 95% 40% / 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, hsl(270 100% 75% / 0.1) 0%, transparent 50%)",
                ]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            />

            {/* Floating colorful shapes */}
            {[
              { color: "bg-agni-green/20", size: "w-16 h-16", pos: "top-20 left-8", delay: 0 },
              { color: "bg-agni-purple/15", size: "w-12 h-12", pos: "top-32 right-6", delay: 1 },
              { color: "bg-agni-gold/20", size: "w-10 h-10", pos: "bottom-40 left-12", delay: 2 },
              { color: "bg-agni-blue/15", size: "w-14 h-14", pos: "bottom-60 right-8", delay: 0.5 },
              { color: "bg-agni-pink/15", size: "w-8 h-8", pos: "top-48 left-1/3", delay: 1.5 },
            ].map((s, i) => (
              <motion.div
                key={i}
                className={`absolute ${s.pos} ${s.size} rounded-full ${s.color} blur-xl pointer-events-none`}
                animate={{ y: [0, -15, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: s.delay }}
              />
            ))}

            {/* Mascot entrance */}
            <motion.div initial={{ scale: 0, rotate: -30, y: 30 }} animate={{ scale: 1, rotate: 0, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }} className="relative z-10 mb-4">
              <Agni expression="celebrating" size={180} animate speech="Hey! Let's learn AI! 🔥" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-5xl font-black text-foreground text-center mb-2 relative z-10">
              Neural<motion.span
                className="text-agni-green"
                animate={{ textShadow: ["0 0 10px hsl(100 95% 40% / 0.2)", "0 0 30px hsl(100 95% 40% / 0.5)", "0 0 10px hsl(100 95% 40% / 0.2)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >-OS</motion.span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-base text-muted-foreground text-center font-semibold mb-3 relative z-10">
              Master AI Agents. Level Up. 🚀
            </motion.p>

            {/* Feature pills */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex gap-2 mb-6 relative z-10 flex-wrap justify-center">
              {[
                { icon: Shield, label: "Free Forever", color: "bg-agni-green/15 text-agni-green border-agni-green/30" },
                { icon: Zap, label: "AI-Powered", color: "bg-agni-blue/15 text-agni-blue border-agni-blue/30" },
                { icon: Rocket, label: "Gamified", color: "bg-agni-purple/15 text-agni-purple border-agni-purple/30" },
                { icon: Heart, label: "Personalized", color: "bg-agni-pink/15 text-agni-pink border-agni-pink/30" },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 + i * 0.1 }}
                  className={`${f.color} rounded-full px-3 py-1.5 flex items-center gap-1.5 border`}>
                  <f.icon size={12} />
                  <span className="text-[10px] font-extrabold">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Pop culture teaser */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3 }}
              className="bg-card/60 backdrop-blur border border-agni-purple/20 rounded-2xl px-4 py-3 mb-6 relative z-10 max-w-[300px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-agni-purple" />
                <span className="text-[10px] font-black text-agni-purple uppercase tracking-wider">AGNI × Neural OS</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                I'll teach AI using <span className="text-agni-gold font-bold">Naruto shadow clones</span>, <span className="text-agni-pink font-bold">Goku's power levels</span>, and <span className="text-agni-blue font-bold">your favorite shows</span>! 🎯
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="w-full relative z-10">
              <Button onClick={goNext} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-lg shadow-btn-3d btn-3d hover:bg-agni-green-dark">
                GET STARTED <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="text-xs text-muted-foreground mt-4 relative z-10">
              Already learning? <button onClick={() => navigate("/")} className="text-agni-green font-bold underline">Sign in</button>
            </motion.p>
          </motion.div>
        )}

        {/* ═══════ STEP 1: NAME ═══════ */}
        {step === 1 && (
          <motion.div key="name" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.name.bg} pointer-events-none`} />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                <Agni expression="happy" size={130} speech="Hey! What's your name? 👋" animate />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full mt-6">
                <h2 className="text-3xl font-black text-foreground text-center mb-1">What should I call you?</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">I'm <span className="text-agni-green font-bold">AGNI 🔥</span>, your AI teaching buddy!</p>
                <Input type="text" placeholder="Enter your name..." value={name} onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-card border-2 border-border text-lg font-bold text-center focus:border-agni-green" autoFocus
                />
              </motion.div>

              {/* Fun preview */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: name.trim() ? 1 : 0 }} transition={{ delay: 0.5 }}
                className="mt-6 bg-card/60 backdrop-blur border border-agni-green/20 rounded-2xl p-3 w-full max-w-[300px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={12} className="text-agni-gold" />
                  <span className="text-[9px] font-black text-agni-gold uppercase tracking-wider">How AGNI will talk to you</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  "Yo <span className="text-agni-green font-bold">{name || "..."}</span>! Think of an AI agent like Naruto's shadow clone jutsu 🥷 — multiple copies doing different tasks simultaneously!"
                </p>
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!name.trim()} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 2: ABOUT YOU (age/gender) ═══════ */}
        {step === 2 && (
          <motion.div key="aboutyou" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.aboutYou.bg} pointer-events-none`} />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                <Agni expression="happy" size={100} speech={`Nice to meet you, ${name}! 🤝`} animate />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full mt-4">
                <h2 className="text-2xl font-black text-foreground text-center mb-1">Tell me about yourself</h2>
                <p className="text-xs text-muted-foreground text-center mb-5">So I can pick the right examples & language 🎯</p>

                <div className="space-y-5">
                  {/* Age — colorful pills */}
                  <div>
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2.5">🎂 How old are you?</label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_RANGES.map((age, i) => (
                        <motion.button key={age} whileTap={{ scale: 0.92 }}
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                          onClick={() => { SFX.pop(); setAgeRange(age); }}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                            ageRange === age ? PILL_SELECTED_COLORS[i % PILL_SELECTED_COLORS.length] : PILL_COLORS[i % PILL_COLORS.length]
                          }`}
                        >
                          {age}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Gender — colorful pills */}
                  <div>
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2.5">👤 Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {GENDERS.map((g, i) => (
                        <motion.button key={g} whileTap={{ scale: 0.92 }}
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                          onClick={() => { SFX.pop(); setGender(g); }}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                            gender === g ? PILL_SELECTED_COLORS[(i + 3) % PILL_SELECTED_COLORS.length] : PILL_COLORS[(i + 3) % PILL_COLORS.length]
                          }`}
                        >
                          {g}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <Button onClick={goNext} variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-border text-sm font-bold">Skip</Button>
              <Button onClick={goNext} disabled={!ageRange && !gender} className="flex-1 h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none">
                CONTINUE <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══════ STEP 3: IDENTITY (Pick your avatar!) ═══════ */}
        {step === 3 && (
          <motion.div key="role" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#F0E6FA] via-[#F5E0F0] to-[#FADADD] pointer-events-none" />

            <div className="flex-1 relative z-10 overflow-y-auto scrollbar-none">
              <div className="flex justify-center mb-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm border border-white/50">
                  <span className="text-xs font-bold text-gray-600">Choose your character! 🎭</span>
                </div>
              </div>
              <div className="flex justify-center mb-3">
                <Agni expression="thinking" size={90} animate />
              </div>

              <h2 className="text-2xl font-black text-gray-800 text-center mb-0.5">🎭 Pick Your Avatar</h2>
              <p className="text-xs text-center mb-1">
                <span className="text-[#8B3FCF] font-bold">Like choosing a character in a game!</span>
              </p>
              <p className="text-[10px] text-gray-500 text-center mb-4">
                Your identity shapes how AGNI teaches — pick the world you live in
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map((role, i) => (
                  <ColorPill
                    key={role.id}
                    emoji={role.emoji}
                    label={role.label}
                    desc={role.desc}
                    selected={selectedRole === role.id}
                    onClick={() => setSelectedRole(role.id)}
                    index={i}
                  />
                ))}
              </div>

              {/* Custom role */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className={`mt-3 p-3 rounded-[24px] transition-all ${
                  selectedRole === "custom" ? "bg-[#58CC02] shadow-lg" : "bg-white/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">✏️</span>
                  <span className={`text-xs font-extrabold ${selectedRole === "custom" ? "text-white" : "text-gray-700"}`}>Something else?</span>
                </div>
                <input
                  type="text" placeholder="Type your role..."
                  value={customRole}
                  onChange={(e) => { setCustomRole(e.target.value); if (e.target.value.trim()) setSelectedRole("custom"); }}
                  onFocus={() => { if (customRole.trim()) setSelectedRole("custom"); }}
                  className="w-full bg-white/90 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#7C5CBF]"
                />
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!selectedRole || (selectedRole === "custom" && !customRole.trim())}
              className="w-full h-14 rounded-full bg-[#7C5CBF] hover:bg-[#6A4DAF] text-white font-extrabold text-base shadow-lg disabled:opacity-30 disabled:shadow-none mt-3">
              Continue <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 4: BACKGROUND ═══════ */}
        {step === 4 && (
          <motion.div key="lifecontext" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.background.bg} pointer-events-none`} />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-3 shrink-0">
                <Agni expression="thinking" size={80} speech="Tell me more about you! 📋" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1 shrink-0">📋 Your Background</h2>
              <p className="text-xs text-muted-foreground text-center mb-4 shrink-0">Helps AGNI tailor examples to your world</p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-4">
                  {/* Education */}
                  <div>
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">🎓 Education</label>
                    <div className="flex flex-wrap gap-2">
                      {EDUCATION_LEVELS.map((edu, i) => (
                        <motion.button key={edu} whileTap={{ scale: 0.92 }}
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 + i * 0.04 }}
                          onClick={() => { SFX.pop(); setEducation(edu); }}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                            education === edu ? PILL_SELECTED_COLORS[i % PILL_SELECTED_COLORS.length] : PILL_COLORS[i % PILL_COLORS.length]
                          }`}
                        >{edu}</motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2"><MapPin size={10} className="inline" /> Location</label>
                    <Input type="text" placeholder="e.g. Mumbai, New York, London..." value={location} onChange={(e) => setLocation(e.target.value)}
                      className="h-12 rounded-xl bg-card border-2 border-border text-sm font-bold focus:border-agni-green" />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">💼 Experience Level</label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERIENCE_LEVELS.map((exp, i) => (
                        <motion.button key={exp} whileTap={{ scale: 0.92 }}
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 + i * 0.04 }}
                          onClick={() => { SFX.pop(); setWorkExperience(exp); }}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                            workExperience === exp ? PILL_SELECTED_COLORS[(i + 2) % PILL_SELECTED_COLORS.length] : PILL_COLORS[(i + 2) % PILL_COLORS.length]
                          }`}
                        >{exp}</motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">🏷️ Current Role / Title</label>
                    <Input type="text" placeholder="e.g. Software Engineer, Student, Freelancer..." value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                      className="h-12 rounded-xl bg-card border-2 border-border text-sm font-bold focus:border-agni-green" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <Button onClick={goNext} variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-border text-sm font-bold">Skip</Button>
              <Button onClick={goNext} className="flex-1 h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d">
                CONTINUE <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══════ STEP 5: MISSION MODE (Choose your quest!) ═══════ */}
        {step === 5 && (
          <motion.div key="mission" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.mission.bg} pointer-events-none`} />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-2 shrink-0">
                <Agni expression="excited" size={80} speech="Pick your mission scroll! 📜" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-0.5 shrink-0">🎯 Choose Your Quest</h2>
              <p className="text-xs text-muted-foreground text-center mb-1 shrink-0">
                <span className="text-agni-gold font-bold">Like Naruto picking a mission from the scroll wall! 🥷</span>
              </p>
              <p className="text-[10px] text-muted-foreground/70 text-center mb-3 shrink-0">Why are you learning AI agents?</p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-2">
                  {[...MISSION_MODES, ...customMissions].map((m, i) => (
                    <ColorListOption
                      key={m.id}
                      emoji={m.emoji}
                      label={m.label}
                      desc={m.desc}
                      selected={selectedMission === m.id}
                      onClick={() => setSelectedMission(m.id)}
                      index={i}
                      color={m.color}
                    />
                  ))}

                  <CustomOptionInput
                    categoryId="mission"
                    categoryLabel="Mission"
                    onSave={(opt) => {
                      const saved = saveCustomOption("mission", opt);
                      setCustomMissions(prev => [...prev, saved]);
                      setSelectedMission(saved.id);
                    }}
                  />
                </div>
              </div>
            </div>

            <Button onClick={goNext} disabled={!selectedMission} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none shrink-0">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 6: MISSION FOLLOW-UP ═══════ */}
        {step === 6 && selectedMission && MISSION_FOLLOWUPS[selectedMission] && (
          <motion.div key="missionfollowup" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.missionFollowup.bg} pointer-events-none`} />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-3 shrink-0">
                <Agni expression="excited" size={80} speech="Let me understand you better! 🎯" animate />
              </div>

              <h2 className="text-xl font-black text-foreground text-center mb-1 shrink-0">
                {MISSION_MODES.find(m => m.id === selectedMission)?.emoji} Deep Dive
              </h2>
              <p className="text-xs text-muted-foreground text-center mb-4 shrink-0">
                Quick Q's to personalize your {MISSION_MODES.find(m => m.id === selectedMission)?.label} journey
              </p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-4">
                  {MISSION_FOLLOWUPS[selectedMission].map((q, i) => (
                    <motion.div key={q.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                      <label className="text-[11px] font-extrabold text-foreground block mb-2">{q.label}</label>
                      {q.type === "text" ? (
                        <Input
                          type="text" placeholder={q.placeholder}
                          value={missionFollowup[q.id] || ""}
                          onChange={(e) => setMissionFollowup(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="h-12 rounded-xl bg-card border-2 border-border text-sm font-bold focus:border-agni-green"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {q.options?.map((opt, oi) => (
                            <motion.button key={opt} whileTap={{ scale: 0.92 }}
                              onClick={() => { SFX.pop(); setMissionFollowup(prev => ({ ...prev, [q.id]: opt })); }}
                              className={`px-3 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                                missionFollowup[q.id] === opt ? PILL_SELECTED_COLORS[oi % PILL_SELECTED_COLORS.length] : PILL_COLORS[oi % PILL_COLORS.length]
                              }`}
                            >{opt}</motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <Button onClick={goNext} variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-border text-sm font-bold">Skip</Button>
              <Button onClick={goNext} className="flex-1 h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d">
                CONTINUE <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══════ STEP 7: TEACHING VIBE (Set your DJ!) ═══════ */}
        {step === 7 && (
          <motion.div key="vibe" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.vibe.bg} pointer-events-none`} />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-2 shrink-0">
                <Agni expression="celebrating" size={80} speech="Pick your teaching DJ! 🎧" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-0.5 shrink-0">🎨 Set Your Vibe</h2>
              <p className="text-xs text-muted-foreground text-center mb-1 shrink-0">
                <span className="text-agni-orange font-bold">Like picking a DJ for your learning playlist! 🎵</span>
              </p>
              <p className="text-[10px] text-muted-foreground/70 text-center mb-3 shrink-0">How should AGNI talk to you?</p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-2">
                  {[...VIBES.map(v => ({ ...v, color: v.gradient })), ...customVibes].map((vibe, i) => (
                    <ColorListOption
                      key={vibe.id}
                      emoji={vibe.emoji}
                      label={vibe.label}
                      desc={vibe.desc}
                      selected={selectedVibe === vibe.id}
                      onClick={() => setSelectedVibe(vibe.id)}
                      index={i}
                      color={vibe.color}
                    />
                  ))}

                  <CustomOptionInput
                    categoryId="vibe"
                    categoryLabel="Teaching Vibe"
                    onSave={(opt) => {
                      const saved = saveCustomOption("vibe", opt);
                      setCustomVibes(prev => [...prev, saved]);
                      setSelectedVibe(saved.id);
                    }}
                  />
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="bg-agni-purple/5 border border-agni-purple/20 rounded-2xl px-4 py-2.5 mb-3 shrink-0"
              >
                <p className="text-[10px] text-agni-purple font-bold">💡 "Sensei" = Mr. Miyagi energy 🥋 • "Wizard" = Dumbledore dropping knowledge 🧙 • "Game Mode" = Level up like Goku! 🎮</p>
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!selectedVibe} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none shrink-0">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 8: BRAIN LEVEL (Power Level!) ═══════ */}
        {step === 8 && (
          <motion.div key="brain" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.brain.bg} pointer-events-none`} />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-2 shrink-0">
                <Agni expression="teaching" size={80} speech="What's your power level? 💪" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-0.5 shrink-0">🧠 Power Level</h2>
              <p className="text-xs text-muted-foreground text-center mb-1 shrink-0">
                <span className="text-agni-blue font-bold">Like Dragon Ball Z — what's your current form? 🔥</span>
              </p>
              <p className="text-[10px] text-muted-foreground/70 text-center mb-3 shrink-0">How deep do you want to dive?</p>

              {/* Track toggle */}
              <div className="flex gap-1.5 bg-card/60 border border-border/30 rounded-2xl p-1 mb-3 shrink-0">
                {(["skill", "academic"] as const).map(track => (
                  <motion.button
                    key={track}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { SFX.tap(); setBrainTrackState(track); setBrainTrack(track); }}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all relative ${brainTrack === track ? "text-white" : "text-muted-foreground"}`}
                  >
                    {brainTrack === track && (
                      <motion.div layoutId="brain-track-bg" className="absolute inset-0 bg-gradient-to-r from-agni-purple to-agni-pink rounded-xl" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <span className="relative z-10">{track === "skill" ? "⚡ Skill Track" : "🎓 Academic Track"}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-2">
                  {[...(brainTrack === "skill" ? BRAIN_LEVELS_SKILL : BRAIN_LEVELS_ACADEMIC), ...customBrains].map((b, i) => (
                    <ColorListOption
                      key={b.id}
                      emoji={b.emoji}
                      label={b.label}
                      desc={b.desc}
                      selected={selectedBrain === b.id}
                      onClick={() => setSelectedBrain(b.id)}
                      index={i}
                      color={b.color}
                    />
                  ))}

                  <CustomOptionInput
                    categoryId="brain"
                    categoryLabel="Brain Level"
                    onSave={(opt) => {
                      const saved = saveCustomOption("brain", opt);
                      setCustomBrains(prev => [...prev, saved]);
                      setSelectedBrain(saved.id);
                    }}
                  />
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-agni-green/5 border border-agni-green/20 rounded-2xl px-4 py-2.5 mb-3 shrink-0"
              >
                <p className="text-[10px] text-agni-green font-bold">
                  {brainTrack === "skill"
                    ? "💡 \"Sprout\" 🌱 = Goku as a kid • \"Pro\" ⚡ = Super Saiyan • \"Demon Mode\" 👹 = Ultra Instinct, no mercy!"
                    : "💡 \"Class 5\" 👶 = Kid Goku • \"College Senior\" 🎓 = Cell Saga • \"PhD\" 🧠 = Beerus-level power!"}
                </p>
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!selectedBrain} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none shrink-0">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 9: WHY THIS MATTERS ═══════ */}
        {step === 9 && (
          <motion.div key="whymatters" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen pt-16 pb-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${STEP_THEMES.whyMatters.bg} pointer-events-none`} />
            
            {/* Floating emojis */}
            {["🔥", "⚡", "🧠", "🎯", "🚀", "✨"].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-xl pointer-events-none opacity-30"
                style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
                animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              >
                {emoji}
              </motion.span>
            ))}

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                <Agni expression="excited" size={130} animate speech="This next part is 🔥" />
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-2xl font-black text-foreground text-center mt-4 mb-2"
              >
                The more you share,<br />
                <span className="text-agni-gold">the smarter I get</span> 🧠
              </motion.h2>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground text-center mb-6 max-w-[300px]"
              >
                Tell me your interests so <span className="text-agni-green font-bold">AGNI</span> can personalize <span className="font-bold text-foreground">every lesson, quiz & analogy</span> just for you.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="w-full space-y-2.5 mb-6"
              >
                {[
                  { emoji: "🥷", text: "Love Naruto? Multi-agent = Shadow Clone Jutsu — each clone does a different task!", color: "border-agni-orange/30 bg-agni-orange/5" },
                  { emoji: "🏏", text: "Cricket fan? RAG = Dhoni reading the pitch before pulling the right data!", color: "border-agni-blue/30 bg-agni-blue/5" },
                  { emoji: "🦸", text: "Marvel fan? Agents = Avengers team — each with a unique superpower!", color: "border-agni-purple/30 bg-agni-purple/5" },
                  { emoji: "🎮", text: "Gamer? Brain levels work like DBZ — Sprout is Kid Goku, Demon Mode is Ultra Instinct!", color: "border-agni-green/30 bg-agni-green/5" },
                ].map((ex, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.12 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${ex.color}`}
                  >
                    <span className="text-2xl shrink-0">{ex.emoji}</span>
                    <p className="text-xs font-bold text-foreground leading-snug">{ex.text}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                className="flex items-center gap-2 bg-agni-green/10 border border-agni-green/20 rounded-full px-4 py-2"
              >
                <Sparkles size={14} className="text-agni-green" />
                <span className="text-[11px] font-black text-agni-green">Neural OS × AGNI: Your personal AI brain</span>
              </motion.div>
            </div>

            <Button onClick={goNext} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d mt-4">
              LET'S DO THIS 🔥 <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ CATEGORY SELECTION SCREENS ═══════ */}
        {activeCategory && !isConfirmStep && (
          <motion.div key={`cat-${categoryIndex}`} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}
            className="relative z-10 max-w-md mx-auto px-5 pt-16 pb-4 flex flex-col min-h-screen h-screen"
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${CATEGORY_GRADIENTS[categoryIndex % CATEGORY_GRADIENTS.length]} opacity-[0.07] pointer-events-none`} />

            <div className="relative z-10 flex flex-col flex-1 min-h-0">
              {/* Header with mascot */}
              <div className="flex items-center gap-3 mb-2 shrink-0">
                <Agni expression={catHint?.expr || "teaching"} size={56} animate speech={catHint?.speech} />
                <div className="flex-1">
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <span className="text-2xl">{activeCategory.emoji}</span>
                    {activeCategory.label}
                  </h2>
                  <p className="text-[10px] text-muted-foreground">{activeCategory.description}</p>
                </div>
              </div>

              {catHint && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-agni-purple/5 border border-agni-purple/15 rounded-xl px-3 py-2 mb-2 shrink-0"
                >
                  <p className="text-[9px] text-agni-purple/80 font-semibold leading-relaxed">{catHint.hint}</p>
                </motion.div>
              )}

              {/* Selected items */}
              <AnimatePresence>
                {currentItems.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2 shrink-0">
                    <div className="bg-agni-green/5 border border-agni-green/20 rounded-xl p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-extrabold text-agni-green uppercase tracking-wider">Your picks ({currentItems.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentItems.map((item) => (
                          <motion.button key={item} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} layout
                            whileTap={{ scale: 0.9 }} onClick={() => toggleItem(item)}
                            className="bg-agni-green/20 text-agni-green text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-agni-red/20 hover:text-agni-red transition-colors"
                          >
                            {item} <X size={10} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search bar */}
              <div className="relative mb-2 shrink-0 group">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-agni-green via-agni-blue to-agni-purple opacity-30 group-focus-within:opacity-80 transition-opacity duration-300 blur-[1px]" />
                <div className="relative flex items-center bg-card rounded-2xl border-2 border-transparent overflow-hidden">
                  <Search size={16} className="absolute left-3 text-muted-foreground group-focus-within:text-agni-green transition-colors" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearchKeyDown}
                    placeholder="Search or type your own..."
                    className="w-full bg-transparent pl-10 pr-20 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                  />
                  {!search.trim() && (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute right-2 flex items-center gap-1 bg-agni-purple/10 border border-agni-purple/20 rounded-lg px-2 py-1 pointer-events-none"
                    >
                      <Sparkles size={10} className="text-agni-purple" />
                      <span className="text-[8px] font-bold text-agni-purple whitespace-nowrap">+ Custom</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Add custom */}
              {showAddCustom && (
                <motion.button
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  onClick={() => { setSmartSearchQuery(search.trim()); setSmartSearchOpen(true); }}
                  className="mb-2 shrink-0 w-full text-left overflow-hidden rounded-2xl border-2 border-dashed border-agni-purple/40 bg-gradient-to-r from-agni-purple/10 via-agni-blue/5 to-agni-green/10 hover:border-agni-purple/60 transition-all"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-agni-purple to-agni-blue flex items-center justify-center shadow-lg shrink-0">
                      <Brain size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-foreground">
                        🔍 Search "<span className="text-agni-purple">{search.trim()}</span>" with AI
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">AI will find the exact match</p>
                    </div>
                    <div className="shrink-0 bg-agni-purple/20 rounded-lg px-2 py-1">
                      <span className="text-[9px] font-bold text-agni-purple">↵</span>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Sub-filters */}
              {subFilters.length > 0 && !search && (
                <div className="shrink-0 mb-2">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 mb-1.5">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveSubFilter(null)}
                      className={`shrink-0 text-[9px] font-extrabold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                        !activeSubFilter ? "bg-agni-green text-white shadow-md" : "bg-card border border-border/40 text-muted-foreground"
                      }`}
                    >
                      All
                      <span className={`text-[7px] font-black rounded-full px-1.5 py-0.5 min-w-[16px] text-center ${
                        !activeSubFilter ? "bg-white/25 text-white" : "bg-muted/50 text-muted-foreground"
                      }`}>
                        {activeCategory?.suggestions.length}
                      </span>
                    </motion.button>
                    {subFilters.map((tag, i) => {
                      const count = activeCategory ? getSubFilterCount(activeCategory, tag) : 0;
                      return (
                        <motion.button
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActiveSubFilter(activeSubFilter === tag ? null : tag)}
                          className={`shrink-0 text-[9px] font-extrabold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                            activeSubFilter === tag ? "bg-agni-blue text-white shadow-md" : "bg-card border border-border/40 text-muted-foreground"
                          }`}
                        >
                          {tag}
                          <span className={`text-[7px] font-black rounded-full px-1.5 py-0.5 min-w-[16px] text-center ${
                            activeSubFilter === tag ? "bg-white/25 text-white" : "bg-muted/50 text-muted-foreground"
                          }`}>
                            {count}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {activeSubFilter && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!activeCategory) return;
                        const field = activeCategory.field as keyof NeuralOSPersona;
                        const current = (persona[field] as string[]) || [];
                        const subItems = activeCategory.suggestions
                          .filter(s => s.tag && s.tag.toLowerCase().startsWith(activeSubFilter.toLowerCase()))
                          .map(s => s.name);
                        const allSelected = subItems.every(item => current.includes(item));
                        const updated = allSelected ? current.filter(x => !subItems.includes(x)) : [...new Set([...current, ...subItems])];
                        setPersona({ ...persona, [field]: updated });
                      }}
                      className="text-[9px] font-extrabold text-agni-blue flex items-center gap-1 px-1"
                    >
                      {(() => {
                        if (!activeCategory) return null;
                        const field = activeCategory.field as keyof NeuralOSPersona;
                        const current = (persona[field] as string[]) || [];
                        const subItems = activeCategory.suggestions
                          .filter(s => s.tag && s.tag.toLowerCase().startsWith(activeSubFilter.toLowerCase()))
                          .map(s => s.name);
                        const allSelected = subItems.every(item => current.includes(item));
                        return allSelected ? <><X size={10} /> Deselect all {activeSubFilter}</> : <><Check size={10} /> Select all {activeSubFilter}</>;
                      })()}
                    </motion.button>
                  )}
                </div>
              )}

              {/* Popular Picks */}
              {!search && !activeSubFilter && POPULAR_PICKS[activeCategory.id] && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-2 shrink-0">
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <TrendingUp size={11} className="text-agni-orange" />
                    <span className="text-[9px] font-black text-agni-orange uppercase tracking-wider">Popular Picks</span>
                    <Crown size={9} className="text-agni-gold" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(POPULAR_PICKS[activeCategory.id] || []).map((itemName, i) => {
                      const suggestion = activeCategory.suggestions.find(s => s.name === itemName);
                      return (
                        <motion.div key={itemName} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.04 }} className="relative">
                          <InterestPill
                            name={itemName}
                            emoji={suggestion?.emoji}
                            categoryId={activeCategory.id}
                            index={i}
                            selected={currentItems.includes(itemName)}
                            onClick={() => toggleItem(itemName)}
                          />
                          {!currentItems.includes(itemName) && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-agni-orange flex items-center justify-center shadow-md z-10"
                            >
                              <TrendingUp size={8} className="text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="h-px bg-border/20 mt-2" />
                </motion.div>
              )}

              {/* Suggestions */}
              <div className="flex-1 overflow-y-auto -mx-1 px-1 mb-2 scrollbar-none">
                <div className="flex flex-wrap gap-2">
                  {filtered.map((s, i) => (
                    <motion.div key={s.name} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.25), type: "spring", stiffness: 300, damping: 20 }}>
                      <InterestPill
                        name={s.name}
                        emoji={s.emoji}
                        categoryId={activeCategory.id}
                        index={i}
                        selected={currentItems.includes(s.name)}
                        onClick={() => toggleItem(s.name)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex gap-3 shrink-0">
                <Button onClick={goNext} variant="outline" className="flex-1 h-12 rounded-2xl border-2 border-border text-sm font-bold">Skip</Button>
                <Button onClick={goNext} className="flex-1 h-12 rounded-2xl bg-agni-green text-white font-extrabold text-sm shadow-btn-3d btn-3d">
                  {categoryIndex < SUGGESTION_CATEGORIES.length - 1 ? (
                    <>Next <ArrowRight size={16} className="ml-1" /></>
                  ) : (
                    <>Review <Sparkles size={16} className="ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ CONFIRM STEP ═══════ */}
        {isConfirmStep && (
          <motion.div key="confirm" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-green/20 via-agni-blue/10 to-agni-purple/5 pointer-events-none" />

            {/* Celebration particles */}
            {["🎉", "🎊", "🏆", "🔥", "⚡", "✨"].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-lg pointer-events-none"
                style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 15}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -30, -60] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 3 }}
              >
                {emoji}
              </motion.span>
            ))}

            <div className="flex-1 relative z-10 overflow-y-auto scrollbar-none">
              <div className="flex justify-center mb-4">
                <Agni expression="celebrating" size={110} speech={`You're amazing, ${name}! 🎉`} animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1">You're all set! 🚀</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">Here's your Neural OS profile • {totalSelected} interests</p>

              <div className="space-y-3 mb-6">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Profile</span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-agni-green to-agni-blue flex items-center justify-center text-2xl shadow-lg">
                      {ROLES.find(r => r.id === selectedRole)?.emoji || "✨"}
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{ROLES.find(r => r.id === selectedRole)?.label} • {VIBES.find(v => v.id === selectedVibe)?.label}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-agni-purple/5 border border-agni-purple/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-agni-purple" />
                    <span className="text-[9px] font-extrabold text-agni-purple uppercase tracking-wider">Neural OS Activated</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    AGNI will use your interests to create <span className="text-agni-gold font-bold">personalized analogies</span> in every lesson! 🧠✨
                  </p>
                </div>

                {SUGGESTION_CATEGORIES.map((cat) => {
                  const items = (persona[cat.field] as string[]) || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.id} className="bg-card border border-border rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="text-xs font-extrabold text-foreground">{cat.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{items.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((item, idx) => (
                          <InterestPill
                            key={item}
                            name={item}
                            categoryId={cat.id}
                            index={idx}
                            compact
                            removable
                            onClick={() => removeItem(cat.field as string, item)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 space-y-3 relative z-10">
              <Button onClick={finish} className="w-full h-14 rounded-2xl bg-gradient-to-r from-agni-green to-agni-blue text-white font-extrabold text-lg shadow-btn-3d btn-3d">
                <Sparkles size={20} className="mr-2" /> ACTIVATE AGNI 🔥
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">You can change these anytime in Settings</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart AI Interest Search Modal */}
      <SmartInterestSearch
        query={smartSearchQuery}
        currentCategory={activeCategory?.id || ""}
        open={smartSearchOpen}
        onClose={() => { setSmartSearchOpen(false); setSmartSearchQuery(""); }}
        onSelect={handleSmartSearchSelect}
      />
    </div>
  );
};

export default OnboardingPage;
