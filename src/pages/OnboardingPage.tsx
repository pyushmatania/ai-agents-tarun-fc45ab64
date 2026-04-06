import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

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
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name.trim()) return;
    localStorage.setItem("edu_user_name", name.trim());
    localStorage.setItem("edu_user_role", selectedRole || "Learner");
    localStorage.setItem("edu_onboarded", "true");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto px-6 pt-12 pb-8 flex-1 flex flex-col">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-primary mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
            📚
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">EduLearn</h1>
          <p className="text-muted-foreground mt-1">Your learning journey starts here</p>
        </div>

        {/* Sparkle banner */}
        <div className="bg-secondary/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Sparkles size={20} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            No account needed! Just tell us your name and what you do — we'll personalize your learning experience.
          </p>
        </div>

        {/* Name input */}
        <div className="mb-6">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
            What's your name?
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl bg-card border-border text-foreground text-lg font-semibold"
            autoFocus
          />
        </div>

        {/* Role selection */}
        <div className="mb-8">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
            What's your role?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.label}
                onClick={() => setSelectedRole(role.label)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                  selectedRole === role.label
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-card border-border text-foreground hover:bg-muted/50"
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
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all disabled:opacity-40"
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
