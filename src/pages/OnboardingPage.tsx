import { useState, useCallback, useMemo } from "react";
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
import { TrendingUp, Crown } from "lucide-react";
import { MISSION_MODES, BRAIN_LEVELS, setTeachingSelection } from "@/lib/teachingConfig";

/* ── EXPANDED ROLES ── */
const ROLES = [
  { id: "student", label: "Student", emoji: "🎓", desc: "Learning AI from scratch", goal: "Learn AI from zero", exp: "beginner", icon: GraduationCap },
  { id: "developer", label: "Developer", emoji: "💻", desc: "Building real agents", goal: "Build production AI agents", exp: "engineer", icon: Code },
  { id: "founder", label: "Founder / CEO", emoji: "🚀", desc: "Scaling with AI", goal: "Build a startup with AI", exp: "some experience", icon: Rocket },
  { id: "manager", label: "PM / Manager", emoji: "📊", desc: "Leading AI teams", goal: "Lead AI product teams", exp: "some experience", icon: Briefcase },
  { id: "researcher", label: "Researcher", emoji: "🔬", desc: "Deep exploration", goal: "Research AI deeply", exp: "engineer", icon: Brain },
  { id: "designer", label: "Designer", emoji: "🎨", desc: "AI meets creativity", goal: "Use AI in design workflows", exp: "some experience", icon: Palette },
  { id: "marketer", label: "Marketer", emoji: "📢", desc: "Growth with AI", goal: "Use AI for marketing", exp: "beginner", icon: Target },
  { id: "freelancer", label: "Freelancer", emoji: "🌍", desc: "AI superpowers", goal: "Freelance with AI tools", exp: "some experience", icon: Globe },
  { id: "data", label: "Data / ML", emoji: "📈", desc: "Models & pipelines", goal: "Build ML pipelines", exp: "engineer", icon: Wrench },
  { id: "content", label: "Content Creator", emoji: "🎬", desc: "AI-powered content", goal: "Create content with AI", exp: "some experience", icon: Film },
  { id: "teacher", label: "Teacher / Educator", emoji: "📚", desc: "Teach smarter with AI", goal: "Enhance teaching with AI", exp: "beginner", icon: BookOpen },
  { id: "consultant", label: "Consultant", emoji: "💼", desc: "AI advisory & strategy", goal: "Consult on AI strategy", exp: "some experience", icon: Briefcase },
  { id: "productdesigner", label: "Product Designer", emoji: "🖌️", desc: "Design AI products", goal: "Design AI-first products", exp: "some experience", icon: Palette },
  { id: "dataanalyst", label: "Data Analyst", emoji: "📊", desc: "Insights from data", goal: "Analyze data with AI", exp: "some experience", icon: Target },
  { id: "office", label: "Office / Operations", emoji: "🏢", desc: "Automate workflows", goal: "Automate office tasks with AI", exp: "beginner", icon: Globe },
  { id: "sales", label: "Sales / BizDev", emoji: "🤝", desc: "Close deals with AI", goal: "Use AI in sales pipeline", exp: "beginner", icon: Trophy },
  { id: "writer", label: "Writer / Journalist", emoji: "✍️", desc: "AI-assisted writing", goal: "Write better with AI", exp: "beginner", icon: Newspaper },
  { id: "hobbyist", label: "Hobbyist / Tinkerer", emoji: "🛠️", desc: "Build for fun", goal: "Experiment with AI for fun", exp: "beginner", icon: Wrench },
  { id: "curious", label: "Just Curious", emoji: "✨", desc: "Here for fun!", goal: "Explore for fun", exp: "beginner", icon: Star },
];

const VIBES = [
  { id: "fun", label: "Fun & Memes", emoji: "😂", desc: "Make me LOL while learning", icon: Heart, gradient: "from-pink-500 to-rose-400" },
  { id: "story", label: "Story-driven", emoji: "📖", desc: "Tales & analogies", icon: BookOpen, gradient: "from-purple-500 to-violet-400" },
  { id: "serious", label: "Deep & Serious", emoji: "🧠", desc: "No fluff, pure knowledge", icon: Brain, gradient: "from-blue-500 to-cyan-400" },
  { id: "fast", label: "Fast & Practical", emoji: "⚡", desc: "Ship it now!", icon: Zap, gradient: "from-amber-500 to-yellow-400" },
  { id: "visual", label: "Visual & Diagrams", emoji: "🎨", desc: "Show me, don't tell me", icon: Palette, gradient: "from-teal-500 to-emerald-400" },
  { id: "socratic", label: "Socratic / Q&A", emoji: "🤔", desc: "Guide me with questions", icon: Lightbulb, gradient: "from-orange-500 to-amber-400" },
  { id: "gamified", label: "Gamified & Challenges", emoji: "🎮", desc: "XP, quests & leaderboards", icon: Gamepad2, gradient: "from-indigo-500 to-blue-400" },
  { id: "handson", label: "Hands-on Builder", emoji: "🔧", desc: "Learn by building projects", icon: Wrench, gradient: "from-lime-500 to-green-400" },
  { id: "eli5", label: "ELI5 / Simple", emoji: "🍼", desc: "Explain like I'm 5", icon: Star, gradient: "from-sky-400 to-blue-300" },
  { id: "academic", label: "Academic & Research", emoji: "📚", desc: "Papers, citations & depth", icon: GraduationCap, gradient: "from-slate-500 to-gray-400" },
  { id: "debate", label: "Debate & Challenge Me", emoji: "🥊", desc: "Push back on my ideas", icon: Shield, gradient: "from-red-500 to-pink-400" },
  { id: "podcast", label: "Podcast / Conversational", emoji: "🎙️", desc: "Like chatting with a friend", icon: MessageCircle, gradient: "from-violet-500 to-fuchsia-400" },
];

/* ── AGNI HINTS — shown on each category screen ── */
const AGNI_HINTS: Record<string, { speech: string; expr: AgniExpression; hint: string }> = {
  shows: { speech: "I'll use your fave scenes as analogies! 🎬", expr: "excited", hint: "💡 Neural OS × AGNI: \"Think of an AI agent like Byomkesh — gathering clues from multiple sources!\"" },
  sports: { speech: "Sports = perfect AI analogies! ⚽", expr: "happy", hint: "💡 AGNI will say: \"Think of RAG like Dhoni reading the pitch — pulling the right info at the right time!\"" },
  music: { speech: "Your playlist shapes my vibe! 🎵", expr: "celebrating", hint: "💡 Neural OS: \"An LLM is like A.R. Rahman composing — mixing patterns into something new!\"" },
  gaming: { speech: "Game mechanics = AI concepts! 🎮", expr: "excited", hint: "💡 AGNI: \"Multi-agent systems are like your Valorant team — each agent has a role!\"" },
  news: { speech: "I'll reference your sources! 📰", expr: "teaching", hint: "💡 Neural OS: \"I'll cite @karpathy's takes when teaching you about transformers!\"" },
  books: { speech: "Books + AI = 🔥 combos!", expr: "thinking", hint: "💡 AGNI: \"Like Zero to One says — AI agents are the next 0→1 shift!\"" },
  hobbies: { speech: "Everything connects to AI! ✨", expr: "happy", hint: "💡 Neural OS: \"Your love for cooking? AI agents follow recipes too — we call them workflows!\"" },
  curious: { speech: "Let's explore together! 🔮", expr: "celebrating", hint: "💡 AGNI: \"I'll build personalized rabbit holes into every lesson for you!\"" },
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

const TOTAL_STEPS = 7 + SUGGESTION_CATEGORIES.length + 1; // splash, name, role, mission, vibe, brain, why-matters, categories..., confirm

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

// getSubFilters is now imported from neuralOS

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [selectedBrain, setSelectedBrain] = useState<string | null>(null);
  const [persona, setPersona] = useState<Partial<NeuralOSPersona>>({});
  const [search, setSearch] = useState("");
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [smartSearchQuery, setSmartSearchQuery] = useState("");

  // Steps: 0=splash, 1=name, 2=role, 3=mission, 4=vibe, 5=brain, 6=why-matters, 7+=categories, last=confirm
  const categoryIndex = step >= 7 ? step - 7 : -1;
  const activeCategory = categoryIndex >= 0 && categoryIndex < SUGGESTION_CATEGORIES.length
    ? SUGGESTION_CATEGORIES[categoryIndex] : null;
  const isConfirmStep = step === 7 + SUGGESTION_CATEGORIES.length;

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

  const goNext = () => { setDir(1); setStep(s => s + 1); setSearch(""); setActiveSubFilter(null); };
  const goBack = () => { setDir(-1); setStep(s => Math.max(0, s - 1)); setSearch(""); setActiveSubFilter(null); };

  const toggleItem = (item: string) => {
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

  // Search filters suggestions AND allows adding custom via Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim() && activeCategory) {
      // Open smart AI search instead of directly adding
      setSmartSearchQuery(search.trim());
      setSmartSearchOpen(true);
    }
  };

  const handleSmartSearchSelect = (item: { name: string; category: string; subCategory: string }) => {
    // Find the right category to add to
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

  // Show "add as custom" option when search doesn't match any suggestion
  const showAddCustom = search.trim().length > 1 && activeCategory &&
    !activeCategory.suggestions.some(s => s.name.toLowerCase() === search.toLowerCase().trim());

  const finish = () => {
    const role = ROLES.find(r => r.id === selectedRole);
    const roleLabel = selectedRole === "custom" ? customRole.trim() : role?.label;
    const depthMap: Record<string, string> = { chill: "basic", explorer: "normal", pro: "deep", hacker: "deep", scientist: "deep", professor: "deep" };
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
    // Save teaching selections
    if (selectedMission) setTeachingSelection("mission", selectedMission);
    if (selectedVibe) setTeachingSelection("vibe", selectedVibe);
    if (selectedBrain) setTeachingSelection("brain", selectedBrain);
    localStorage.setItem("edu_user_name", name.trim());
    localStorage.setItem("edu_user_role", selectedRole || "curious");
    localStorage.setItem("edu_onboarded", "true");
    navigate("/");
  };

  const catHint = activeCategory ? AGNI_HINTS[activeCategory.id] : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Progress bar */}
      {step > 0 && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-3 flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center shrink-0">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-agni-green to-agni-blue"
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
            <div className="absolute inset-0 bg-gradient-to-b from-agni-green/20 via-transparent to-agni-purple/10 pointer-events-none" />
            {/* Floating decorative orbs */}
            <motion.div className="absolute top-20 left-8 w-20 h-20 rounded-full bg-agni-blue/10 blur-2xl" animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
            <motion.div className="absolute bottom-32 right-6 w-16 h-16 rounded-full bg-agni-purple/15 blur-xl" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.div className="absolute top-40 right-12 w-12 h-12 rounded-full bg-agni-gold/10 blur-xl" animate={{ x: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity }} />

            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }} className="relative z-10 mb-4">
              <Agni expression="celebrating" size={180} animate />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-5xl font-black text-foreground text-center mb-2 relative z-10">
              Neural<span className="text-agni-green">-OS</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-base text-muted-foreground text-center font-semibold mb-3 relative z-10">
              Master AI Agents. Level Up. 🚀
            </motion.p>

            {/* Neural OS teaser */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
              className="bg-card/60 backdrop-blur border border-agni-purple/20 rounded-2xl px-4 py-3 mb-6 relative z-10 max-w-[280px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-agni-purple" />
                <span className="text-[10px] font-black text-agni-purple uppercase tracking-wider">Neural OS × AGNI</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                I'll learn YOUR interests and teach AI using analogies from <span className="text-agni-gold font-bold">your favorite shows, sports & music</span> 🎯
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex gap-3 mb-8 relative z-10">
              {[
                { icon: Shield, label: "Free", color: "bg-agni-green/15 text-agni-green" },
                { icon: Zap, label: "AI-Powered", color: "bg-agni-blue/15 text-agni-blue" },
                { icon: Rocket, label: "Gamified", color: "bg-agni-purple/15 text-agni-purple" },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 + i * 0.1 }}
                  className={`${f.color} rounded-full px-4 py-2 flex items-center gap-1.5`}>
                  <f.icon size={14} />
                  <span className="text-xs font-extrabold">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="w-full relative z-10">
              <Button onClick={goNext} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-lg shadow-btn-3d btn-3d hover:bg-agni-green-dark">
                GET STARTED <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-xs text-muted-foreground mt-4 relative z-10">
              Already learning? <button onClick={() => navigate("/")} className="text-agni-green font-bold underline">Sign in</button>
            </motion.p>
          </motion.div>
        )}

        {/* ═══════ STEP 1: NAME ═══════ */}
        {step === 1 && (
          <motion.div key="name" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-blue/15 to-transparent pointer-events-none" />
            <motion.div className="absolute top-24 right-4 w-14 h-14 rounded-full bg-agni-pink/10 blur-xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <Agni expression="happy" size={120} speech="Hey! What's your name? 👋" animate />

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full mt-8">
                <h2 className="text-2xl font-black text-foreground text-center mb-2">What should I call you?</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">I'm <span className="text-agni-green font-bold">AGNI</span>, your AI teaching buddy!</p>
                <Input type="text" placeholder="Enter your name..." value={name} onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-card border-2 border-border text-lg font-bold text-center focus:border-agni-green" autoFocus
                />
              </motion.div>

              {/* Chat preview bubble */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mt-6 bg-card/50 border border-border/50 rounded-2xl p-3 w-full max-w-[280px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageCircle size={12} className="text-agni-green" />
                  <span className="text-[9px] font-black text-agni-green uppercase tracking-wider">Preview</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  "Hey <span className="text-agni-gold font-bold">{name || "..."}</span>! Think of an AI agent like {name ? "your personal Iron Man's JARVIS" : "..."} — it observes, thinks, then acts! 🤖"
                </p>
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!name.trim()} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 2: ROLE (expanded) ═══════ */}
        {step === 2 && (
          <motion.div key="role" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-purple/15 via-agni-pink/5 to-transparent pointer-events-none" />

            <div className="flex-1 relative z-10 overflow-y-auto scrollbar-none">
              <div className="flex justify-center mb-3">
                <Agni expression="thinking" size={80} speech="What brings you here? 🤔" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1">I am a...</h2>
              <p className="text-xs text-muted-foreground text-center mb-5">Pick what fits best</p>

              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map((role, i) => {
                  const Icon = role.icon;
                  return (
                    <motion.button key={role.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
                      whileTap={{ scale: 0.95 }} onClick={() => setSelectedRole(role.id)}
                      className={`relative p-3 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                        selectedRole === role.id ? "border-agni-green bg-agni-green/10 shadow-glow-green" : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      {selectedRole === role.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-agni-green flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{role.emoji}</span>
                        <Icon size={14} className="text-muted-foreground" />
                      </div>
                      <span className="text-xs font-extrabold text-foreground block">{role.label}</span>
                      <span className="text-[9px] text-muted-foreground">{role.desc}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom role */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className={`mt-2.5 p-3 rounded-2xl border-2 transition-all ${
                  selectedRole === "custom" ? "border-agni-green bg-agni-green/10 shadow-glow-green" : "border-dashed border-agni-purple/30 bg-agni-purple/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">✏️</span>
                  <span className="text-xs font-extrabold text-foreground">Something else?</span>
                </div>
                <input
                  type="text"
                  placeholder="Type your role..."
                  value={customRole}
                  onChange={(e) => { setCustomRole(e.target.value); if (e.target.value.trim()) setSelectedRole("custom"); }}
                  onFocus={() => { if (customRole.trim()) setSelectedRole("custom"); }}
                  className="w-full bg-card border border-border/40 rounded-xl px-3 py-2 text-xs font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-green/50"
                />
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!selectedRole || (selectedRole === "custom" && !customRole.trim())} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none mt-3">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 3: MISSION MODE ═══════ */}
        {step === 3 && (
          <motion.div key="mission" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-gold/15 to-transparent pointer-events-none" />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-3 shrink-0">
                <Agni expression="thinking" size={80} speech="What's your mission? 🎯" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1 shrink-0">🎯 Mission Mode</h2>
              <p className="text-xs text-muted-foreground text-center mb-4 shrink-0">Why are you learning this? Pick your goal!</p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-2.5">
                  {MISSION_MODES.map((m, i) => (
                    <motion.button key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                      whileTap={{ scale: 0.97 }} onClick={() => setSelectedMission(m.id)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                        selectedMission === m.id ? "border-agni-green bg-agni-green/10 shadow-glow-green" : "border-border bg-card"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg shrink-0`}>
                        <span className="text-xl">{m.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-extrabold text-foreground block">{m.label}</span>
                        <span className="text-[11px] text-muted-foreground">{m.desc}</span>
                      </div>
                      {selectedMission === m.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-agni-green flex items-center justify-center shrink-0">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={goNext} disabled={!selectedMission} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none shrink-0">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 4: VIBE ═══════ */}
        {step === 4 && (
          <motion.div key="vibe" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-orange/15 to-transparent pointer-events-none" />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-3 shrink-0">
                <Agni expression="excited" size={80} speech="How should I teach you? 🎨" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1 shrink-0">🎨 Teaching Vibe</h2>
              <p className="text-xs text-muted-foreground text-center mb-4 shrink-0">Pick your learning style!</p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-2.5">
                  {VIBES.map((vibe, i) => {
                    const Icon = vibe.icon;
                    return (
                      <motion.button key={vibe.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                        whileTap={{ scale: 0.97 }} onClick={() => setSelectedVibe(vibe.id)}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                          selectedVibe === vibe.id ? "border-agni-green bg-agni-green/10 shadow-glow-green" : "border-border bg-card"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${vibe.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                          <span className="text-xl">{vibe.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-extrabold text-foreground block">{vibe.label}</span>
                          <span className="text-[11px] text-muted-foreground">{vibe.desc}</span>
                        </div>
                        {selectedVibe === vibe.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-agni-green flex items-center justify-center shrink-0">
                            <Check size={14} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}

                  {/* Custom style input */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="w-full p-3.5 rounded-2xl border-2 border-dashed border-agni-purple/30 bg-agni-purple/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-agni-purple to-agni-pink flex items-center justify-center shadow-lg shrink-0">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          placeholder="Type your own style..."
                          className="w-full bg-transparent text-sm font-extrabold text-foreground outline-none placeholder:text-muted-foreground/50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                              setSelectedVibe((e.target as HTMLInputElement).value.trim());
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value.trim()) setSelectedVibe(e.target.value.trim());
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground">Press Enter to set</span>
                      </div>
                      {selectedVibe && !VIBES.find(v => v.id === selectedVibe) && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-agni-purple flex items-center justify-center shrink-0">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="bg-agni-purple/5 border border-agni-purple/20 rounded-2xl px-4 py-2.5 mb-3 shrink-0"
              >
                <p className="text-[10px] text-agni-purple font-bold">💡 Neural OS adapts: Pick "Fun & Memes" → memes & jokes. "Socratic" → guided questions. "ELI5" → super simple. Or write your own!</p>
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!selectedVibe} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none shrink-0">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 5: BRAIN LEVEL ═══════ */}
        {step === 5 && (
          <motion.div key="brain" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-purple/15 to-transparent pointer-events-none" />

            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              <div className="flex justify-center mb-3 shrink-0">
                <Agni expression="teaching" size={80} speech="How deep should we go? 🧠" animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1 shrink-0">🧠 Brain Level</h2>
              <p className="text-xs text-muted-foreground text-center mb-4 shrink-0">How deep do you want to dive?</p>

              <div className="flex-1 overflow-y-auto scrollbar-none -mx-1 px-1 mb-3">
                <div className="space-y-2.5">
                  {BRAIN_LEVELS.map((b, i) => (
                    <motion.button key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                      whileTap={{ scale: 0.97 }} onClick={() => setSelectedBrain(b.id)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                        selectedBrain === b.id ? "border-agni-green bg-agni-green/10 shadow-glow-green" : "border-border bg-card"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-lg shrink-0`}>
                        <span className="text-xl">{b.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-extrabold text-foreground block">{b.label}</span>
                        <span className="text-[11px] text-muted-foreground">{b.desc}</span>
                      </div>
                      {selectedBrain === b.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-agni-green flex items-center justify-center shrink-0">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-agni-green/5 border border-agni-green/20 rounded-2xl px-4 py-2.5 mb-3 shrink-0"
              >
                <p className="text-[10px] text-agni-green font-bold">💡 "Chill" = bite-sized & easy. "Hacker" = skip theory, just code. "Scientist" = papers & math. Pick your level!</p>
              </motion.div>
            </div>

            <Button onClick={goNext} disabled={!selectedBrain} className="w-full h-14 rounded-2xl bg-agni-green text-white font-extrabold text-base shadow-btn-3d btn-3d disabled:opacity-30 disabled:shadow-none shrink-0">
              CONTINUE <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════ STEP 6: WHY THIS MATTERS — ATTENTION HOOK ═══════ */}
        {step === 6 && (
          <motion.div key="whymatters" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-6 flex flex-col min-h-screen pt-16 pb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-agni-gold/20 via-agni-orange/10 to-agni-pink/10 pointer-events-none" />
            <motion.div className="absolute top-32 left-6 w-24 h-24 rounded-full bg-agni-green/10 blur-3xl" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 5, repeat: Infinity }} />
            <motion.div className="absolute bottom-40 right-4 w-20 h-20 rounded-full bg-agni-blue/10 blur-2xl" animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }} />

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
                Answer the next few questions so <span className="text-agni-green font-bold">AGNI</span> can personalize <span className="font-bold text-foreground">every lesson, quiz & analogy</span> just for you.
              </motion.p>

              {/* Power examples */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="w-full space-y-2.5 mb-6"
              >
                {[
                  { emoji: "🎬", text: "Love Naruto? I'll explain multi-agent systems as shadow clones!", color: "border-agni-pink/30 bg-agni-pink/5" },
                  { emoji: "🏏", text: "Cricket fan? RAG = Dhoni reading the pitch before pulling data!", color: "border-agni-blue/30 bg-agni-blue/5" },
                  { emoji: "🎵", text: "Into A.R. Rahman? LLMs compose patterns — just like him!", color: "border-agni-purple/30 bg-agni-purple/5" },
                  { emoji: "🎮", text: "Gamer? Agents have roles — just like your Valorant squad!", color: "border-agni-green/30 bg-agni-green/5" },
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
            {/* Colorful gradient accent */}
            <div className={`absolute inset-0 bg-gradient-to-b ${CATEGORY_GRADIENTS[categoryIndex % CATEGORY_GRADIENTS.length]} opacity-[0.07] pointer-events-none`} />
            <motion.div className="absolute top-24 right-4 w-20 h-20 rounded-full bg-agni-gold/8 blur-2xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 4, repeat: Infinity }} />

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

              {/* Neural OS capability hint */}
              {catHint && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-agni-purple/5 border border-agni-purple/15 rounded-xl px-3 py-2 mb-2 shrink-0"
                >
                  <p className="text-[9px] text-agni-purple/80 font-semibold leading-relaxed">{catHint.hint}</p>
                </motion.div>
              )}

              {/* Selected items panel (always visible when items selected) */}
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

              {/* Search bar — also acts as custom input */}
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
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute right-2 flex items-center gap-1 bg-agni-purple/10 border border-agni-purple/20 rounded-lg px-2 py-1 pointer-events-none"
                    >
                      <Sparkles size={10} className="text-agni-purple" />
                      <span className="text-[8px] font-bold text-agni-purple whitespace-nowrap">+ Custom</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Add custom — prominent card when typing something new */}
              {showAddCustom && (
                <motion.button
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => { toggleItem(search.trim()); setSearch(""); }}
                  className="mb-2 shrink-0 w-full text-left overflow-hidden rounded-2xl border-2 border-dashed border-agni-gold/40 bg-gradient-to-r from-agni-gold/10 via-agni-orange/5 to-agni-pink/10 hover:border-agni-gold/60 transition-all"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-agni-gold to-agni-orange flex items-center justify-center shadow-lg shrink-0">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-foreground">
                        Add "<span className="text-agni-gold">{search.trim()}</span>" as custom
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Not in the list? No problem — tap to add it!
                      </p>
                    </div>
                    <div className="shrink-0 bg-agni-gold/20 rounded-lg px-2 py-1 flex items-center gap-1">
                      <span className="text-[9px] font-bold text-agni-gold">↵ Enter</span>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Sub-filter chips with count badges */}
              {subFilters.length > 0 && !search && (
                <div className="shrink-0 mb-2">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 mb-1.5">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveSubFilter(null)}
                      className={`shrink-0 text-[9px] font-extrabold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                        !activeSubFilter
                          ? "bg-agni-green text-white shadow-md"
                          : "bg-card border border-border/40 text-muted-foreground"
                      }`}
                    >
                      All
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`text-[7px] font-black rounded-full px-1.5 py-0.5 min-w-[16px] text-center ${
                          !activeSubFilter ? "bg-white/25 text-white" : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {activeCategory?.suggestions.length}
                      </motion.span>
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
                            activeSubFilter === tag
                              ? "bg-agni-blue text-white shadow-md"
                              : "bg-card border border-border/40 text-muted-foreground"
                          }`}
                        >
                          {tag}
                          <motion.span
                            key={count}
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className={`text-[7px] font-black rounded-full px-1.5 py-0.5 min-w-[16px] text-center ${
                              activeSubFilter === tag ? "bg-white/25 text-white" : "bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {count}
                          </motion.span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {/* Select All for active sub-filter */}
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
                        const updated = allSelected
                          ? current.filter(x => !subItems.includes(x))
                          : [...new Set([...current, ...subItems])];
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
                        return allSelected ? (
                          <><X size={10} /> Deselect all {activeSubFilter}</>
                        ) : (
                          <><Check size={10} /> Select all {activeSubFilter}</>
                        );
                      })()}
                    </motion.button>
                  )}
                </div>
              )}

              {/* 🔥 Popular Picks Section */}
              {!search && !activeSubFilter && POPULAR_PICKS[activeCategory.id] && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 shrink-0"
                >
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <TrendingUp size={11} className="text-agni-orange" />
                    <span className="text-[9px] font-black text-agni-orange uppercase tracking-wider">Popular Picks</span>
                    <Crown size={9} className="text-agni-gold" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(POPULAR_PICKS[activeCategory.id] || []).map((itemName, i) => {
                      const suggestion = activeCategory.suggestions.find(s => s.name === itemName);
                      return (
                        <motion.div
                          key={itemName}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 + i * 0.04 }}
                          className="relative"
                        >
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

              {/* Suggestions — Colorful Pills */}
              <div className="flex-1 overflow-y-auto -mx-1 px-1 mb-2 scrollbar-none">
                <div className="flex flex-wrap gap-2">
                  {filtered.map((s, i) => (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.25), type: "spring", stiffness: 300, damping: 20 }}
                    >
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
            <motion.div className="absolute top-28 left-6 w-16 h-16 rounded-full bg-agni-gold/10 blur-xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} />

            <div className="flex-1 relative z-10 overflow-y-auto scrollbar-none">
              <div className="flex justify-center mb-4">
                <Agni expression="celebrating" size={100} speech={`Looking great, ${name}! 🎉`} animate />
              </div>

              <h2 className="text-2xl font-black text-foreground text-center mb-1">You're all set! 🚀</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">Here's your Neural OS profile • {totalSelected} interests</p>

              {/* Profile summary */}
              <div className="space-y-3 mb-6">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Profile</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-agni-green/20 flex items-center justify-center text-lg">
                      {ROLES.find(r => r.id === selectedRole)?.emoji || "✨"}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{ROLES.find(r => r.id === selectedRole)?.label} • {VIBES.find(v => v.id === selectedVibe)?.label}</p>
                    </div>
                  </div>
                </div>

                {/* Neural OS preview */}
                <div className="bg-agni-purple/5 border border-agni-purple/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-agni-purple" />
                    <span className="text-[9px] font-extrabold text-agni-purple uppercase tracking-wider">Neural OS Activated</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    AGNI will now use your interests to create <span className="text-agni-gold font-bold">personalized analogies</span> in every lesson, quiz, and conversation! 🧠✨
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
                <Sparkles size={20} className="mr-2" /> ACTIVATE AGNI
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">You can change these anytime in Settings</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
