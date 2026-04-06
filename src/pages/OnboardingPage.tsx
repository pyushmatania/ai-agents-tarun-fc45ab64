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
      {/* 3D Background */}
      <Suspense fallback={null}>
        <LazyParticles />
      </Suspense>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/70 to-background pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-6 pt-10 pb-8 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center shadow-xl shadow-primary/20">
            <Bot size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            AI Agents
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Master the future of intelligent automation
          </p>
        </div>

        {/* Sparkle banner */}
        <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-4 mb-5 flex items-start gap-3 border border-border/50 shadow-sm">
          <Sparkles size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            No account needed! Tell us your name and role — we'll personalize your learning.
          </p>
        </div>

        {/* Name input */}
        <div className="mb-5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
            What's your name?
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl bg-card/70 backdrop-blur-sm border-border/50 text-foreground text-lg font-semibold"
            autoFocus
          />
        </div>

        {/* Role selection */}
        <div className="mb-6">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
            What's your role?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.label}
                onClick={() => setSelectedRole(role.label)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border backdrop-blur-sm transition-all ${
                  selectedRole === role.label
                    ? "bg-primary/15 border-primary text-foreground shadow-md shadow-primary/10"
                    : "bg-card/60 border-border/50 text-foreground hover:bg-card/80"
                }`}
              >
                <span className="text-2xl">{role.emoji}</span>
                <span className="text-xs font-semibold">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-base hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-primary/25"
          >
            Start Learning
            <ArrowRight size={18} className="ml-2" />
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Your progress is saved locally. Sign in later to sync across devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
