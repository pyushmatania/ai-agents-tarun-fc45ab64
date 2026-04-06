import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Bot } from "lucide-react";

const LazyParticles = lazy(() => import("@/components/FloatingParticles"));

const roles = [
  { label: "Student", emoji: "🎓" },
  { label: "Developer", emoji: "💻" },
  { label: "Founder", emoji: "🚀" },
  { label: "Manager", emoji: "📊" },
  { label: "Researcher", emoji: "🔬" },
  { label: "Other", emoji: "✨" },
];

const OnboardingPage = () => {
  const [name, setName] = useState("");
  const tagline = "Master the future of intelligent automation";
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
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
      <Suspense fallback={null}>
        <LazyParticles />
      </Suspense>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-12 pb-6 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary mx-auto mb-3 flex items-center justify-center shadow-glow-primary">
            <Bot size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
            AI Agents
          </h1>
          <p className="text-muted-foreground mt-1 text-xs h-4">
            {displayedText}
            {showCursor && <span className="animate-pulse ml-0.5">|</span>}
          </p>
        </div>

        {/* Banner */}
        <div className="glass rounded-xl p-3 mb-4 flex items-start gap-2 border border-border/40">
          <Sparkles size={14} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/70 leading-relaxed">
            No account needed! Tell us your name and role — we'll personalize your learning.
          </p>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            What's your name?
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl glass border-border/40 text-foreground text-sm font-medium"
            autoFocus
          />
        </div>

        {/* Role */}
        <div className="mb-5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
            What's your role?
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {roles.map((role, i) => (
              <button
                key={role.label}
                onClick={() => setSelectedRole(role.label)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all animate-fade-in opacity-0 ${
                  selectedRole === role.label
                    ? "bg-primary/10 border-primary/30 text-foreground shadow-glow-primary"
                    : "glass border-border/40 text-foreground hover:border-border"
                }`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
              >
                <span className="text-lg">{role.emoji}</span>
                <span className="text-[10px] font-semibold">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all disabled:opacity-30 shadow-glow-primary"
          >
            Start Learning
            <ArrowRight size={15} className="ml-1.5" />
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            Progress saved locally. Sign in later to sync.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
