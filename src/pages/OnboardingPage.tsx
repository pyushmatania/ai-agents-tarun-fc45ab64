import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Agni, { AgniExpression } from "@/components/Agni";
import SplashScreen from "./SplashScreen";

const SLIDES = [
  {
    agniExpr: "happy" as AgniExpression,
    title: "Learn AI Agents",
    desc: "Bite-sized lessons on building intelligent AI systems — from basics to advanced multi-agent architectures.",
    color: "bg-agni-green",
    emoji: "🤖",
  },
  {
    agniExpr: "excited" as AgniExpression,
    title: "Practice & Earn XP",
    desc: "Complete quizzes, earn XP, maintain streaks, and level up. Learning should feel like a game!",
    color: "bg-agni-blue",
    emoji: "⚡",
  },
  {
    agniExpr: "celebrating" as AgniExpression,
    title: "Become a Master",
    desc: "Unlock achievements, climb the leaderboard, and go from Novice to AI Agent Legend.",
    color: "bg-agni-gold",
    emoji: "🏆",
  },
];

const roles = [
  { label: "Student", emoji: "🎓", desc: "Learning AI" },
  { label: "Developer", emoji: "💻", desc: "Building agents" },
  { label: "Founder", emoji: "🚀", desc: "Scaling ideas" },
  { label: "Manager", emoji: "📊", desc: "Leading teams" },
  { label: "Researcher", emoji: "🔬", desc: "Exploring AI" },
  { label: "Other", emoji: "✨", desc: "Curious mind" },
];

const OnboardingPage = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState(0); // 0,1,2 = slides, 3 = form
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  const handleStart = () => {
    if (!name.trim()) return;
    localStorage.setItem("edu_user_name", name.trim());
    localStorage.setItem("edu_user_role", selectedRole || "Learner");
    localStorage.setItem("edu_onboarded", "true");
    navigate("/");
  };

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

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
        {step < 3 ? (
          /* Slide screens */
          <motion.div
            key={`slide-${step}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-md mx-auto px-5 flex flex-col min-h-screen items-center justify-center"
          >
            {/* Skip button */}
            <button
              onClick={() => setStep(3)}
              className="absolute top-6 right-5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              SKIP
            </button>

            {/* Back */}
            {step > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStep(step - 1)}
                className="absolute top-6 left-5 w-8 h-8 rounded-xl bg-card border border-border/40 flex items-center justify-center"
              >
                <ChevronLeft size={16} className="text-foreground" />
              </motion.button>
            )}

            {/* Decorative circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className={`w-40 h-40 rounded-full ${SLIDES[step].color}/10 flex items-center justify-center mb-8`}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Agni expression={SLIDES[step].agniExpr} size={140} />
              </motion.div>
            </motion.div>

            {/* Emoji badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="text-4xl mb-4"
            >
              {SLIDES[step].emoji}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-foreground text-center mb-3"
            >
              {SLIDES[step].title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground text-center max-w-[280px] leading-relaxed font-medium"
            >
              {SLIDES[step].desc}
            </motion.p>

            {/* Dots */}
            <div className="flex gap-2 mt-10 mb-8">
              {SLIDES.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? "w-6 bg-agni-green" : "w-2 bg-muted-foreground/30"
                  }`}
                  layoutId={`dot-${i}`}
                />
              ))}
            </div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <Button
                onClick={() => setStep(step + 1)}
                className="w-full h-12 rounded-2xl bg-agni-green text-white font-black text-sm shadow-btn-3d active:shadow-btn-3d-pressed active:translate-y-0.5 transition-all"
              >
                {step === 2 ? "Get Started" : "Continue"}
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          /* Form screen */
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 max-w-md mx-auto px-5 pt-12 pb-6 flex flex-col min-h-screen"
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setStep(2)}
              className="absolute top-6 left-5 w-8 h-8 rounded-xl bg-card border border-border/40 flex items-center justify-center"
            >
              <ChevronLeft size={16} className="text-foreground" />
            </motion.button>

            {/* AGNI greeting */}
            <div className="flex justify-center mb-6">
              <Agni expression="teaching" size={100} speech="Tell me about you! 📝" />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-black text-foreground text-center mb-1"
            >
              Personalize Your Path
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-muted-foreground text-center mb-6 font-medium"
            >
              We'll tailor lessons just for you
            </motion.p>

            {/* Name input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-5"
            >
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2 block">
                What's your name?
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-card border-border/40 text-foreground text-sm font-semibold"
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
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2 block">
                What's your role?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role, i) => (
                  <motion.button
                    key={role.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedRole(role.label)}
                    className={`flex flex-col items-center gap-0.5 p-3 rounded-xl border-2 transition-all ${
                      selectedRole === role.label
                        ? "bg-agni-green/10 border-agni-green/40 shadow-md"
                        : "bg-card border-border/30 hover:border-border"
                    }`}
                  >
                    <span className="text-xl">{role.emoji}</span>
                    <span className="text-[10px] font-black text-foreground">{role.label}</span>
                    <span className="text-[8px] text-muted-foreground font-semibold">{role.desc}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* What you'll learn */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border/30 rounded-2xl p-3.5 mb-6"
            >
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">What you'll master</p>
              <div className="space-y-2">
                {[
                  "🧬 AI Agent Foundations",
                  "⚔️ LangGraph, CrewAI, AutoGen",
                  "🏢 Multi-Agent Orchestration",
                  "🚀 Real-World Deployment",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-2 text-[11px] text-foreground/80 font-medium"
                  >
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Start button */}
            <div className="mt-auto">
              <Button
                onClick={handleStart}
                disabled={!name.trim()}
                className="w-full h-12 rounded-2xl bg-agni-green text-white font-black text-sm shadow-btn-3d active:shadow-btn-3d-pressed active:translate-y-0.5 transition-all disabled:opacity-30"
              >
                Start Learning 🚀
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-3 font-medium">
                Progress saved locally • Sign in later to sync
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
