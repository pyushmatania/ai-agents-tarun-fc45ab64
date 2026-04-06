import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Shield, Wifi, Cpu } from "lucide-react";
import BotIllustration from "@/components/illustrations/BotIllustration";
import FloatingShapes from "@/components/illustrations/FloatingShapes";

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

const OnboardingPage = () => {
  const [name, setName] = useState("");
  const tagline = "Master the future of intelligent automation";
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0=splash, 1=form
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
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingShapes />

      {step === 0 ? (
        /* ── Splash Screen ── */
        <div className="relative z-10 max-w-md mx-auto px-5 flex flex-col min-h-screen items-center justify-center">
          {/* Illustrated Hero */}
          <div className="relative mb-6">
            {/* Glowing ring behind bot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border border-primary/10 animate-pulse-glow" />
              <div className="absolute w-44 h-44 rounded-full border border-secondary/5" style={{ animationDelay: "1s" }} />
            </div>
            <BotIllustration size={140} className="relative z-10 drop-shadow-2xl" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight text-center mb-1">
            AI Agents Academy
          </h1>
          <p className="text-muted-foreground text-center text-xs h-4 mb-6">
            {displayedText}
            {showCursor && <span className="animate-pulse ml-0.5">|</span>}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-card/80 border border-border/40 rounded-full px-3 py-1.5 animate-fade-in opacity-0"
                style={{ animationDelay: `${i * 150 + 800}ms`, animationFillMode: "forwards" }}
              >
                <f.icon size={11} className="text-primary" />
                <span className="text-[10px] font-semibold text-foreground/70">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats showcase */}
          <div className="glass border border-border/30 rounded-2xl p-4 w-full mb-6 animate-fade-in opacity-0" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-primary">21+</p>
                <p className="text-[9px] text-muted-foreground font-medium">Lessons</p>
              </div>
              <div className="border-x border-border/30">
                <p className="text-lg font-bold text-secondary">4</p>
                <p className="text-[9px] text-muted-foreground font-medium">Modules</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">∞</p>
                <p className="text-[9px] text-muted-foreground font-medium">Curiosity</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => setStep(1)}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-glow-primary animate-fade-in opacity-0"
            style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}
          >
            Get Started
            <ArrowRight size={15} className="ml-1.5" />
          </Button>

          <p className="text-center text-[10px] text-muted-foreground mt-3 animate-fade-in opacity-0" style={{ animationDelay: "1.8s", animationFillMode: "forwards" }}>
            Free forever • No credit card required
          </p>
        </div>
      ) : (
        /* ── Form Screen ── */
        <div className="relative z-10 max-w-md mx-auto px-5 pt-8 pb-6 flex flex-col min-h-screen animate-fade-in">
          {/* Mini header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep(0)} className="w-8 h-8 rounded-xl glass border border-border/40 flex items-center justify-center">
              <ArrowRight size={14} className="text-foreground rotate-180" />
            </button>
            <div>
              <h2 className="text-sm font-display font-bold text-foreground">Personalize</h2>
              <p className="text-[10px] text-muted-foreground">Step 2 of 2</p>
            </div>
          </div>

          {/* Illustration card */}
          <div className="glass border border-border/30 rounded-2xl p-4 mb-5 flex items-center gap-4">
            <BotIllustration size={56} />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={12} className="text-secondary" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Personalized</span>
              </div>
              <p className="text-[11px] text-foreground/70 leading-relaxed">
                Tell us about yourself — we'll tailor your AI learning journey.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-5">
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
          </div>

          {/* Role */}
          <div className="mb-5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              What's your role?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role, i) => (
                <button
                  key={role.label}
                  onClick={() => setSelectedRole(role.label)}
                  className={`flex flex-col items-center gap-0.5 p-3 rounded-xl border transition-all animate-fade-in opacity-0 ${
                    selectedRole === role.label
                      ? "bg-primary/10 border-primary/30 text-foreground shadow-glow-primary"
                      : "glass border-border/40 text-foreground hover:border-border"
                  }`}
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
                >
                  <span className="text-xl">{role.emoji}</span>
                  <span className="text-[10px] font-bold">{role.label}</span>
                  <span className="text-[8px] text-muted-foreground">{role.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* What you'll learn preview */}
          <div className="glass border border-border/30 rounded-xl p-3 mb-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">What you'll master</p>
            <div className="space-y-1.5">
              {["🧬 AI Agent Foundations & Architecture", "⚔️ Frameworks: LangGraph, CrewAI, AutoGen", "🏢 Multi-Agent Orchestration", "🚀 Real-World Deployment"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-foreground/70">
                  <span>{item.slice(0, 2)}</span>
                  <span>{item.slice(3)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
