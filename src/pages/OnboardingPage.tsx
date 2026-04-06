import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Shield, Wifi, Cpu, Zap, BookOpen, Users } from "lucide-react";
import MascotRobot from "@/components/MascotRobot";
import heroSplash from "@/assets/hero-splash.png";
import heroOnboarding from "@/assets/hero-onboarding.png";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  { label: "Student", emoji: "🎓", desc: "Learning AI" },
  { label: "Developer", emoji: "💻", desc: "Building agents" },
  { label: "Founder", emoji: "🚀", desc: "Scaling ideas" },
  { label: "Manager", emoji: "📊", desc: "Leading teams" },
  { label: "Researcher", emoji: "🔬", desc: "Exploring AI" },
  { label: "Other", emoji: "✨", desc: "Curious mind" },
];

const features = [
  { icon: Shield, text: "No sign-up required" },
  { icon: Wifi, text: "Works offline" },
  { icon: Cpu, text: "AI-powered learning" },
];

const testimonials = [
  { name: "Priya S.", role: "Developer", text: "Best AI agents resource I've found!", avatar: "👩‍💻" },
  { name: "Rahul M.", role: "Founder", text: "Went from zero to building agents in a week.", avatar: "🧑‍💼" },
  { name: "Ankit K.", role: "Student", text: "The mega prompt is insanely detailed.", avatar: "🎓" },
];

const OnboardingPage = () => {
  const [name, setName] = useState("");
  const tagline = "Master the future of intelligent automation";
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1200);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (!name.trim()) return;
    localStorage.setItem("edu_user_name", name.trim());
    localStorage.setItem("edu_user_role", selectedRole || "Learner");
    localStorage.setItem("edu_onboarded", "true");
    // Default to light theme on first setup
    localStorage.setItem("theme", "light");
    document.documentElement.classList.add("light");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingShapes />

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-5 flex flex-col min-h-screen items-center justify-end pb-8"
          >
            {/* Full-screen Hero Illustration */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroSplash}
                alt="AI Agents Academy - Robot teaching students"
                className="w-full h-full object-cover"
                width={1080}
                height={1920}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            {/* Mascot */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <MascotRobot size={100} mood="waving" speech="Welcome! Let's learn AI! 🤖" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-display font-bold text-foreground tracking-tight text-center mb-1"
            >
              AI Agents Academy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-center text-xs h-4 mb-6"
            >
              {displayedText}
              {showCursor && <span className="animate-pulse ml-0.5">|</span>}
            </motion.p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.12 }}
                  className="flex items-center gap-1.5 bg-card/80 border border-border/40 rounded-full px-3 py-1.5"
                >
                  <f.icon size={11} className="text-primary" />
                  <span className="text-[10px] font-semibold text-foreground/70">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats showcase */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass border border-border/30 rounded-2xl p-4 w-full mb-4"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { value: "22+", label: "Lessons", icon: BookOpen },
                  { value: "4", label: "Modules", icon: Zap },
                  { value: "∞", label: "Curiosity", icon: Sparkles },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1, type: "spring" }}>
                    <p className="text-lg font-bold text-primary">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="w-full mb-6"
            >
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="min-w-[180px] bg-card/80 border border-border/40 rounded-xl p-3 shrink-0"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{t.avatar}</span>
                      <div>
                        <p className="text-[10px] font-bold text-foreground">{t.name}</p>
                        <p className="text-[8px] text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-foreground/70 italic">"{t.text}"</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="w-full"
            >
              <Button
                onClick={() => setStep(1)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-glow-primary"
              >
                Get Started
                <ArrowRight size={15} className="ml-1.5" />
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-3">
                Free forever • No credit card required
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col min-h-screen"
          >
            {/* Mini header */}
            <div className="flex items-center gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setStep(0)}
                className="w-8 h-8 rounded-xl glass border border-border/40 flex items-center justify-center"
              >
                <ArrowRight size={14} className="text-foreground rotate-180" />
              </motion.button>
              <div>
                <h2 className="text-sm font-display font-bold text-foreground">Personalize</h2>
                <p className="text-[10px] text-muted-foreground">Step 2 of 2</p>
              </div>
              {/* Progress dots */}
              <div className="ml-auto flex gap-1.5">
                <div className="w-6 h-1 rounded-full bg-primary" />
                <div className="w-6 h-1 rounded-full bg-primary/40" />
              </div>
            </div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden mb-5 relative"
            >
              <img
                src={heroOnboarding}
                alt="Your AI learning journey begins"
                className="w-full h-40 object-cover rounded-2xl"
                loading="lazy"
                width={800}
                height={800}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles size={12} className="text-secondary" />
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Personalized</span>
                </div>
                <p className="text-[11px] text-foreground/70 leading-relaxed">
                  Tell us about yourself — we'll tailor your AI learning journey.
                </p>
              </div>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                What's your name?
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl glass border-border/40 text-foreground text-sm font-medium"
                autoFocus
              />
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-5"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                What's your role?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role, i) => (
                  <motion.button
                    key={role.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRole(role.label)}
                    className={`flex flex-col items-center gap-0.5 p-3 rounded-xl border transition-all ${
                      selectedRole === role.label
                        ? "bg-primary/10 border-primary/30 text-foreground shadow-glow-primary"
                        : "glass border-border/40 text-foreground hover:border-border"
                    }`}
                  >
                    <span className="text-xl">{role.emoji}</span>
                    <span className="text-[10px] font-bold">{role.label}</span>
                    <span className="text-[8px] text-muted-foreground">{role.desc}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* What you'll learn preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass border border-border/30 rounded-xl p-3 mb-5"
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">What you'll master</p>
              <div className="space-y-1.5">
                {[
                  "🧬 AI Agent Foundations & Architecture",
                  "⚔️ Frameworks: LangGraph, CrewAI, AutoGen",
                  "🏢 Multi-Agent Orchestration",
                  "🚀 Real-World Deployment",
                  "🤯 Bleeding Edge: Swarms & Digital Twins",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    className="flex items-center gap-2 text-[11px] text-foreground/70"
                  >
                    <span>{item.slice(0, 2)}</span>
                    <span>{item.slice(3)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="mt-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={handleStart}
                  disabled={!name.trim()}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all disabled:opacity-30 shadow-glow-primary"
                >
                  Start Learning
                  <ArrowRight size={15} className="ml-1.5" />
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-3">
                  Progress saved locally • Sign in later to sync
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
