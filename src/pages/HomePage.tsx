import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition, { StaggerContainer, StaggerItem, FadeIn, ScaleIn } from "@/components/PageTransition";
import { ArrowRight, Zap, Clock, BookOpen, Flame, Star, Lightbulb, Rocket, Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import { motion } from "framer-motion";
import MascotRobot from "@/components/MascotRobot";
import { useState, useEffect } from "react";

const DAILY_TIPS = [
  { tip: "AI agents use a Perceive→Reason→Act loop — just like humans!", emoji: "🧠" },
  { tip: "MCP is the USB-C of AI — one protocol, 12K+ tool servers.", emoji: "🔌" },
  { tip: "CrewAI lets you assign roles like CEO, CTO to AI agents.", emoji: "🏢" },
  { tip: "RAG = Retrieval Augmented Generation. It gives agents memory!", emoji: "💾" },
  { tip: "LangGraph uses directed graphs for complex agent workflows.", emoji: "📊" },
  { tip: "Multi-agent systems can debate to reach better conclusions.", emoji: "🤝" },
  { tip: "1 person + 10 AI agents = a fully autonomous startup.", emoji: "🚀" },
];

const TEACHING_MODES = [
  { id: "class5", label: "Class 5", emoji: "🎒", desc: "Like I'm 10", color: "bg-emerald-500" },
  { id: "engineer", label: "Engineer", emoji: "⚙️", desc: "Full depth", color: "bg-primary" },
  { id: "hacker", label: "Hacker", emoji: "💻", desc: "Ship fast", color: "bg-violet-500" },
  { id: "founder", label: "Founder", emoji: "🚀", desc: "Strategic", color: "bg-amber-500" },
  { id: "crazy", label: "Crazy", emoji: "🤯", desc: "Sci-fi mode", color: "bg-pink-500" },
  { id: "semiconductor", label: "Chip", emoji: "🏭", desc: "HCL context", color: "bg-sky-500" },
];

const QUICK_WIN_PROJECTS = [
  { title: "Email Triage Agent", difficulty: "Easy", emoji: "📧", color: "bg-emerald-500" },
  { title: "Research Agent", difficulty: "Easy", emoji: "🔍", color: "bg-emerald-500" },
  { title: "Code Review Agent", difficulty: "Medium", emoji: "🔎", color: "bg-amber-500" },
  { title: "Content Pipeline", difficulty: "Hard", emoji: "📝", color: "bg-orange-500" },
  { title: "AI Startup (10 agents)", difficulty: "Expert", emoji: "🏢", color: "bg-red-500" },
];

function SparklesIcon(props: any) { return <Star {...props} />; }
function CompassIcon(props: any) { return <Rocket {...props} />; }
function FileTextIcon(props: any) { return <BookOpen {...props} />; }

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;
  const [activeMode, setActiveMode] = useState("engineer");
  const [mascotMood, setMascotMood] = useState<"waving" | "happy" | "excited">("waving");

  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const totalLessons = 22;
  const overallProgress = Math.round((done.length / totalLessons) * 100);
  const streak = Math.min(done.length, 7);
  const level = Math.floor(xp / 100) + 1;

  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  // Change mascot mood after delay
  useEffect(() => {
    const timer = setTimeout(() => setMascotMood("happy"), 3000);
    return () => clearTimeout(timer);
  }, []);

  const mascotSpeech = done.length === 0 ? "Ready to learn AI? 🤖" : done.length < 5 ? "Great start! Keep going!" : done.length < 15 ? "You're crushing it! 🔥" : "Almost a master! 🏆";

  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("en", { weekday: "narrow" }),
      date: d.getDate(),
      active: i >= 7 - streak,
    };
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative">
        <FloatingShapes />
        <div className="max-w-md mx-auto px-4 pt-5 relative z-10">
          <Header name={displayName} progress={overallProgress} />

          {/* Mascot Hero Section */}
          <FadeIn delay={0.1}>
            <motion.div
              className="relative rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background border border-primary/10"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center px-4 py-3">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-primary/60 tracking-widest mb-0.5">{greeting.toUpperCase()}</p>
                  <h2 className="text-lg font-display font-bold text-foreground leading-snug mb-1">
                    Hey, {displayName}! 👋
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Flame size={10} /> {streak}d streak
                    </span>
                    <span className="text-[10px] bg-secondary/15 text-secondary font-bold px-2 py-0.5 rounded-lg">
                      Level {level}
                    </span>
                  </div>
                </div>
                <MascotRobot size={90} mood={mascotMood} speech={mascotSpeech} />
              </div>
            </motion.div>
          </FadeIn>

          {/* Stats Row - Duolingo style */}
          <StaggerContainer className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: BookOpen, value: done.length, label: "Lessons", color: "bg-violet-500" },
              { icon: Zap, value: xp, label: "XP", color: "bg-primary" },
              { icon: Clock, value: Math.round(xp / 60), label: "Hours", color: "bg-emerald-500" },
              { icon: Flame, value: `${streak}d`, label: "Streak", color: "bg-amber-500" },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-card rounded-2xl p-3 border border-border/50 text-center shadow-card"
                >
                  <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5 shadow-md`}>
                    <stat.icon size={14} className="text-white" />
                  </div>
                  <p className="text-base font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground font-semibold mt-0.5">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Continue Learning CTA */}
          <FadeIn delay={0.2}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/courses")}
              className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 mb-4 shadow-lg shadow-primary/20 flex items-center gap-3 group"
            >
              <div className="bg-white/20 rounded-xl p-2">
                <ArrowRight size={18} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-sm">Continue Learning</p>
                <p className="text-white/60 text-[10px]">{done.length}/{totalLessons} lessons • {overallProgress}% complete</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <div className="relative w-8 h-8">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="3" opacity="0.2" />
                    <motion.circle
                      cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 88" }}
                      animate={{ strokeDasharray: `${overallProgress * 0.88} 88` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">{overallProgress}%</span>
                </div>
              </div>
            </motion.button>
          </FadeIn>

          {/* Streak Calendar */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-2xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Flame size={12} className="text-white" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Streak Calendar</h4>
                <div className="ml-auto text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{streak} day streak 🔥</div>
              </div>
              <div className="flex justify-between gap-1">
                {streakDays.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-[8px] text-muted-foreground font-semibold">{d.label}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                      d.active
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {d.active ? "🔥" : d.date}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Teaching Modes */}
          <FadeIn delay={0.35}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                  <Brain size={12} className="text-white" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Learning Mode</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEACHING_MODES.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setActiveMode(mode.id);
                      localStorage.setItem("teaching_mode", mode.id);
                    }}
                    className={`rounded-2xl p-2.5 text-center transition-all border-2 ${
                      activeMode === mode.id
                        ? `border-primary/50 bg-primary/10 shadow-md`
                        : "border-border/30 bg-card hover:border-border"
                    }`}
                  >
                    <span className="text-xl block">{mode.emoji}</span>
                    <span className="text-[10px] font-bold block text-foreground mt-0.5">{mode.label}</span>
                    <span className="text-[7px] block text-muted-foreground">{mode.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Daily Tip with Mascot */}
          <FadeIn delay={0.4}>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/15 rounded-2xl p-3.5 mb-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <MascotRobot size={50} mood="thinking" animate={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb size={10} className="text-primary" />
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Tip of the day</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{todayTip.tip}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <StaggerContainer className="grid grid-cols-3 gap-2 mb-4">
            {[
              { nav: "/curiosity", emoji: "🔮", label: "Spark", sub: "AI Insights", color: "bg-violet-500" },
              { nav: "/sources", emoji: "🌐", label: "Hub", sub: "Resources", color: "bg-emerald-500" },
              { nav: "/mega-prompt", emoji: "📋", label: "Prompt", sub: "Reference", color: "bg-sky-500" },
            ].map((a, i) => (
              <StaggerItem key={i}>
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => navigate(a.nav)}
                  className="bg-card rounded-2xl p-3 text-left relative overflow-hidden border border-border/50 shadow-card w-full group"
                >
                  <div className={`w-8 h-8 rounded-xl ${a.color} flex items-center justify-center mb-2 shadow-md`}>
                    <span className="text-sm">{a.emoji}</span>
                  </div>
                  <p className="text-[11px] font-bold text-foreground">{a.label}</p>
                  <p className="text-[9px] text-muted-foreground">{a.sub}</p>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Quick-Win Projects */}
          <FadeIn delay={0.5}>
            <div className="bg-card rounded-2xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                  <Rocket size={12} className="text-white" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Quick-Win Projects</h4>
              </div>
              <div className="space-y-1.5">
                {QUICK_WIN_PROJECTS.map((proj, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    className="flex items-center gap-2.5 bg-background/50 rounded-xl p-2.5 border border-border/30"
                  >
                    <div className={`w-8 h-8 rounded-xl ${proj.color} flex items-center justify-center shadow-sm`}>
                      <span className="text-sm">{proj.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{proj.title}</p>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-lg ${
                      proj.difficulty === "Easy" ? "bg-emerald-500/15 text-emerald-500" :
                      proj.difficulty === "Medium" ? "bg-amber-500/15 text-amber-500" :
                      proj.difficulty === "Hard" ? "bg-orange-500/15 text-orange-500" :
                      "bg-red-500/15 text-red-500"
                    }`}>{proj.difficulty}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Sign in prompt */}
          {!user && (
            <FadeIn delay={0.55}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/auth")}
                className="w-full bg-card border-2 border-dashed border-primary/30 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
              >
                <MascotRobot size={40} mood="waving" animate={false} />
                <div className="text-left">
                  <span className="text-xs font-bold text-foreground block">Sign in to sync progress</span>
                  <span className="text-[10px] text-muted-foreground">Never lose your streak! 🔥</span>
                </div>
              </motion.button>
            </FadeIn>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default HomePage;
