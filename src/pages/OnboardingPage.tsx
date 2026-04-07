import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Sparkles, Search, Check, Plus, Shield, Wifi, Cpu } from "lucide-react";
import BotIllustration from "@/components/illustrations/BotIllustration";
import heroSplash from "@/assets/hero-splash.png";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import { motion, AnimatePresence } from "framer-motion";
import { savePersona, SUGGESTION_CATEGORIES, NeuralOSPersona } from "@/lib/neuralOS";

const ROLES = [
  { id: "student", label: "Student", emoji: "🎓", desc: "Learning AI", goal: "Learn AI from zero", exp: "beginner" },
  { id: "developer", label: "Developer", emoji: "💻", desc: "Building agents", goal: "Build production AI agents", exp: "engineer" },
  { id: "founder", label: "Founder", emoji: "🚀", desc: "Scaling ideas", goal: "Build a startup with AI", exp: "some experience" },
  { id: "manager", label: "PM/Manager", emoji: "📊", desc: "Leading teams", goal: "Lead AI product teams", exp: "some experience" },
  { id: "researcher", label: "Researcher", emoji: "🔬", desc: "Exploring AI", goal: "Research AI deeply", exp: "engineer" },
  { id: "curious", label: "Curious", emoji: "✨", desc: "Just exploring", goal: "Explore for fun", exp: "beginner" },
];

const VIBES = [
  { id: "fun", label: "Fun & memes", emoji: "😂", desc: "Make me laugh while learning" },
  { id: "story", label: "Story-driven", emoji: "📖", desc: "Tell me tales and analogies" },
  { id: "serious", label: "Serious & deep", emoji: "🧠", desc: "No fluff, give me the depth" },
  { id: "fast", label: "Fast & practical", emoji: "⚡", desc: "Just the essentials, ship it" },
];

const TOTAL_STEPS = 3 + SUGGESTION_CATEGORIES.length;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = splash, 1 = welcome+name+role+vibe, 2 = persona categories
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [dailyWork, setDailyWork] = useState("");
  const [persona, setPersona] = useState<Partial<NeuralOSPersona>>({});

  // For category sub-step
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  // Splash typewriter
  const tagline = "Master the future of intelligent automation";
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    if (step !== 0) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [step]);

  const activeCategory = SUGGESTION_CATEGORIES[categoryIndex];
  const currentItems = activeCategory ? ((persona[activeCategory.field] as string[]) || []) : [];

  const toggleItem = (item: string) => {
    if (!activeCategory) return;
    const field = activeCategory.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
    setPersona({ ...persona, [field]: updated });
  };

  const addCustom = () => {
    if (!customInput.trim() || !activeCategory) return;
    const field = activeCategory.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    if (current.includes(customInput.trim())) return;
    setPersona({ ...persona, [field]: [...current, customInput.trim()] });
    setCustomInput("");
  };

  const filtered = activeCategory
    ? activeCategory.suggestions.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.tag && s.tag.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const goToStep1 = () => setStep(1);

  const goToCategories = () => {
    if (!name.trim() || !selectedRole || !selectedVibe) return;
    localStorage.setItem("edu_user_name", name.trim());
    localStorage.setItem("edu_user_role", selectedRole);
    localStorage.setItem("theme", "light");
    document.documentElement.classList.add("light");
    setStep(2);
  };

  const nextCategory = () => {
    setSearch("");
    setCustomInput("");
    if (categoryIndex < SUGGESTION_CATEGORIES.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      finish();
    }
  };

  const prevCategory = () => {
    setSearch("");
    setCustomInput("");
    if (categoryIndex > 0) {
      setCategoryIndex(categoryIndex - 1);
    } else {
      setStep(1);
    }
  };

  const finish = () => {
    const role = ROLES.find(r => r.id === selectedRole);
    savePersona({
      ...persona,
      name: name.trim(),
      goal: role?.goal || "Master AI agents",
      experience: role?.exp || "some experience",
      vibe: selectedVibe || "fun",
      currentCompany: companyName.trim() || undefined,
      currentRole: role?.label,
      dailyWork: dailyWork.trim() || undefined,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem("edu_onboarded", "true");
    navigate("/");
  };

  const totalProgress = step === 0 ? 0 : step === 1 ? 1 / TOTAL_STEPS : (2 + categoryIndex) / TOTAL_STEPS;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-agni-green/5 blur-[100px]" />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30 z-20">
        <motion.div
          className="h-full bg-agni-green rounded-r-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ============ STEP 0: SPLASH ============ */}
        {step === 0 && (
          <motion.div
            key={`slide-${step}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-md mx-auto px-5 flex flex-col min-h-screen items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-6"
            >
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <BotIllustration size={140} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-display font-extrabold text-foreground text-center mb-2"
            >
              AgentDojo
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground text-center min-h-[20px] mb-8"
            >
              {displayedText}
              <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="w-full mb-6"
            >
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Shield, label: "Free" },
                  { icon: Wifi, label: "Offline" },
                  { icon: Cpu, label: "AI-Powered" },
                ].map((f, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-1">
                    <f.icon size={16} className="text-primary" />
                    <span className="text-[10px] font-bold text-foreground">{f.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="w-full"
            >
              <Button
                onClick={goToStep1}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-glow-primary"
              >
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ============ STEP 1: NAME + ROLE + VIBE ============ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-5 pt-4 pb-6 flex flex-col min-h-screen"
          >
            {/* Top progress */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(0)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
                <ArrowLeft size={14} />
              </button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 / TOTAL_STEPS) * 100}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">1/{TOTAL_STEPS}</span>
            </div>

            {/* Mascot greeting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="w-16 h-16 shrink-0">
                <BotIllustration size={64} />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm p-3 shadow-sm">
                <p className="text-sm font-bold text-foreground">Hey! I'm AGNI 👋</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tell me about yourself so I can teach you better.</p>
              </div>
            </motion.div>

            {/* Name input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-5"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                What should I call you?
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-card border-border text-sm font-medium"
                autoFocus
              />
            </motion.div>

            {/* Role selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                You are a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role, i) => (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center gap-0.5 p-3 rounded-2xl border-2 transition-all ${
                      selectedRole === role.id
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <span className="text-2xl">{role.emoji}</span>
                    <span className="text-[10px] font-bold">{role.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Vibe */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-5"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                How should I teach?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VIBES.map((vibe, i) => (
                  <motion.button
                    key={vibe.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 + i * 0.06 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      selectedVibe === vibe.id
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-lg">{vibe.emoji}</span>
                      <span className="text-xs font-bold">{vibe.label}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{vibe.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* 🆕 WORK CONTEXT */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mb-5"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                Where do you work? <span className="text-muted-foreground/60 normal-case">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. HCL, freelance, building my own startup..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11 rounded-xl bg-card border-border text-sm mb-3"
              />
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                What does your day-to-day look like? <span className="text-muted-foreground/60 normal-case">(optional)</span>
              </label>
              <textarea
                placeholder="e.g. lots of meetings, writing PRDs, reviewing dashboards, running standups..."
                value={dailyWork}
                onChange={(e) => setDailyWork(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-card border border-border text-sm px-3 py-2 outline-none focus:border-primary resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                💡 I'll use this to show how every concept applies to YOUR work
              </p>
            </motion.div>

            <div className="mt-auto">
              <Button
                onClick={goToCategories}
                disabled={!name.trim() || !selectedRole || !selectedVibe}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-30"
              >
                Continue
                <ArrowRight size={15} className="ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ============ STEP 2: PERSONA CATEGORIES (Twitter-style) ============ */}
        {step === 2 && activeCategory && (
          <motion.div
            key={`cat-${categoryIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-md mx-auto px-5 pt-4 pb-4 flex flex-col min-h-screen h-screen"
          >
            {/* Top progress */}
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <button onClick={prevCategory} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
                <ArrowLeft size={14} />
              </button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((2 + categoryIndex) / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">{2 + categoryIndex}/{TOTAL_STEPS}</span>
            </div>

            {/* Mascot + question */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 mb-4 shrink-0"
            >
              <div className="w-12 h-12 shrink-0">
                <BotIllustration size={48} />
              </div>
              <div className="flex-1 bg-card border border-border rounded-2xl rounded-bl-sm p-3 shadow-sm">
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span className="text-lg">{activeCategory.emoji}</span>
                  {activeCategory.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{activeCategory.description}</p>
                {currentItems.length > 0 && (
                  <p className="text-[10px] text-primary font-bold mt-1.5">
                    ✓ {currentItems.length} picked
                  </p>
                )}
              </div>
            </motion.div>

            {/* Search */}
            <div className="relative mb-3 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeCategory.label.toLowerCase()}...`}
                className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Suggestions grid — scrollable */}
            <div className="flex-1 overflow-y-auto -mx-1 px-1 mb-3">
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((s, i) => {
                  const selected = currentItems.includes(s.name);
                  return (
                    <motion.button
                      key={s.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.3) }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleItem(s.name)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                        selected
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-border"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={11} className="text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                      <div className="text-xl mb-1">{s.emoji || "✨"}</div>
                      <div className="text-xs font-bold text-foreground leading-tight pr-5">{s.name}</div>
                      {s.tag && (
                        <div className="text-[9px] text-muted-foreground mt-0.5">{s.tag}</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom adds */}
              {currentItems.filter(i => !activeCategory.suggestions.find(s => s.name === i)).length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Your custom adds</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentItems
                      .filter(i => !activeCategory.suggestions.find(s => s.name === i))
                      .map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleItem(item)}
                          className="bg-primary/10 border border-primary text-primary text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                          {item} ×
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom input */}
            <div className="flex gap-2 mb-3 shrink-0">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
                placeholder="Or add your own..."
                className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={addCustom}
                disabled={!customInput.trim()}
                className="bg-primary text-primary-foreground rounded-xl px-4 disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Bottom actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={nextCategory}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-border text-sm font-semibold"
              >
                Skip
              </Button>
              <Button
                onClick={nextCategory}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
              >
                {categoryIndex < SUGGESTION_CATEGORIES.length - 1 ? (
                  <>Next <ArrowRight size={15} className="ml-1" /></>
                ) : (
                  <><Sparkles size={15} className="mr-1" /> Activate AGNI</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
