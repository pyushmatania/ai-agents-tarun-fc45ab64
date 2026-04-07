import BottomNav from "@/components/BottomNav";
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from "@/components/PageTransition";
import { ArrowRight, Zap, Clock, BookOpen, Flame, Lightbulb, Rocket, Brain, Heart, Diamond, User } from "lucide-react";
import MascotProfileModal from "@/components/MascotProfileModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Agni from "@/components/Agni";
import DailyQuests from "@/components/DailyQuests";
import { useGamification } from "@/hooks/useGamification";
import { useState, useEffect } from "react";
import { SFX } from "@/lib/sounds";

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
  { id: "class5", label: "Class 5", emoji: "🎒", desc: "Like I'm 10", color: "bg-agni-blue" },
  { id: "engineer", label: "Engineer", emoji: "⚙️", desc: "Full depth", color: "bg-agni-green" },
  { id: "hacker", label: "Hacker", emoji: "💻", desc: "Ship fast", color: "bg-agni-purple" },
  { id: "founder", label: "Founder", emoji: "🚀", desc: "Strategic", color: "bg-agni-gold" },
  { id: "crazy", label: "Crazy", emoji: "🤯", desc: "Sci-fi mode", color: "bg-agni-pink" },
  { id: "semiconductor", label: "Chip", emoji: "🏭", desc: "HCL context", color: "bg-agni-orange" },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, dailyQuests, streakDays, league } = useGamification();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;
  const [activeMode, setActiveMode] = useState(localStorage.getItem("teaching_mode") || "engineer");
  const [agniExpression, setAgniExpression] = useState<"default" | "happy" | "excited">("default");
  const [showProfile, setShowProfile] = useState(false);

  const totalLessons = 22;
  const overallProgress = Math.round((stats.done.length / totalLessons) * 100);
  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const dailyProgress = (Math.min(stats.dailyXp, stats.dailyGoal) / stats.dailyGoal) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setAgniExpression("happy"), 2000);
    return () => clearTimeout(timer);
  }, []);

  const agniSpeech = stats.done.length === 0 ? "Let's learn AI! 🤖" : stats.done.length < 5 ? "Great start! 🔥" : stats.done.length < 15 ? "You're crushing it!" : "Almost a master! 🏆";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative">
        <div className="max-w-md mx-auto px-4 pt-5 relative z-10">

          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div whileTap={{ scale: 0.9 }} className="flex items-center gap-1 bg-agni-orange/15 rounded-full px-2.5 py-1">
                  <Flame size={14} className="text-agni-orange" />
                  <span className="text-xs font-black text-agni-orange">{stats.streak}</span>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }} className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2.5 py-1">
                  <Diamond size={14} className="text-agni-gold" />
                  <span className="text-xs font-black text-agni-gold">{stats.gems}</span>
                </motion.div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")} className="w-8 h-8 rounded-xl bg-card flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors" title="Profile">
                  <User size={14} className="text-muted-foreground" />
                </motion.button>
                <motion.div whileTap={{ scale: 0.9 }} className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2.5 py-1">
                  <Heart size={14} className="text-agni-pink fill-agni-pink" />
                  <span className="text-xs font-black text-agni-pink">{stats.hearts}</span>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }} className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2.5 py-1">
                  <Zap size={14} className="text-agni-green" />
                  <span className="text-xs font-black text-agni-green">{stats.xp}</span>
                </motion.div>
              </div>
            </div>
          </FadeIn>

          {/* AGNI Hero Section */}
          <FadeIn delay={0.1}>
            <motion.div className="relative rounded-3xl mb-4 overflow-hidden bg-gradient-card-accent border border-border/40 shadow-card">
              <div className="flex items-center px-4 py-4">
                <div className="flex-1">
                  <p className="text-micro text-agni-green mb-1">{greeting.toUpperCase()}</p>
                  <h2 className="text-xl font-black text-foreground leading-snug mb-2">Hey, {displayName}! 👋</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-agni-green/15 text-agni-green font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Flame size={10} /> {stats.streak}d streak
                    </span>
                    <span className="text-[10px] bg-agni-purple/15 text-agni-purple font-extrabold px-2.5 py-1 rounded-full">
                      {league.emoji} {league.name}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <svg viewBox="0 0 130 130" className="w-[120px] h-[120px] -rotate-90">
                    <circle cx="65" cy="65" r="58" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" opacity="0.3" />
                    <motion.circle
                      cx="65" cy="65" r="58" fill="none" stroke="hsl(var(--agni-green))" strokeWidth="4" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 365" }}
                      animate={{ strokeDasharray: `${dailyProgress * 3.65} 365` }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center" onDoubleClick={() => setShowProfile(true)}>
                    <Agni expression={agniExpression} size={90} speech={agniSpeech} interactive />
                  </div>
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-muted-foreground">DAILY GOAL</span>
                  <span className="text-[9px] font-black text-agni-green">{Math.min(stats.dailyXp, stats.dailyGoal)}/{stats.dailyGoal} XP</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-agni-green rounded-full" initial={{ width: 0 }} animate={{ width: `${dailyProgress}%` }} transition={{ duration: 1, delay: 0.5 }} />
                </div>
              </div>
            </motion.div>
          </FadeIn>

          {/* Stats Row */}
          <StaggerContainer className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: BookOpen, value: stats.totalLessons, label: "Lessons", color: "bg-agni-blue" },
              { icon: Zap, value: stats.xp, label: "XP", color: "bg-agni-green" },
              { icon: Clock, value: `L${stats.level}`, label: "Level", color: "bg-agni-purple" },
              { icon: Flame, value: `${stats.streak}d`, label: "Streak", color: "bg-agni-orange" },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} className="bg-gradient-card rounded-2xl p-3 border border-border/40 text-center shadow-card">
                  <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5 shadow-md`}>
                    <stat.icon size={14} className="text-white" />
                  </div>
                  <p className="text-base font-black text-foreground leading-none">{stat.value}</p>
                  <p className="text-micro text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Continue Learning */}
          <FadeIn delay={0.2}>
            <motion.button
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => navigate("/courses")}
              className="w-full bg-gradient-to-r from-agni-green to-agni-green-light rounded-2xl p-4 mb-4 shadow-btn-3d flex items-center gap-3 group active:shadow-btn-3d-pressed active:translate-y-0.5 transition-all"
            >
              <div className="bg-white/20 rounded-xl p-2.5"><ArrowRight size={18} className="text-white" /></div>
              <div className="flex-1 text-left">
                <p className="text-white font-black text-sm">CONTINUE LEARNING</p>
                <p className="text-white/60 text-[10px] font-semibold">{stats.done.length}/{totalLessons} lessons • {overallProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <div className="relative w-8 h-8">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="3" opacity="0.2" />
                    <motion.circle cx="18" cy="18" r="14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 88" }}
                      animate={{ strokeDasharray: `${overallProgress * 0.88} 88` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white">{overallProgress}%</span>
                </div>
              </div>
            </motion.button>
          </FadeIn>

          {/* Daily Quests */}
          <FadeIn delay={0.25}>
            <div className="mb-4">
              <DailyQuests quests={dailyQuests} />
            </div>
          </FadeIn>

          {/* Streak Calendar */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-agni-orange flex items-center justify-center">
                  <Flame size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Streak</h4>
                <div className="ml-auto text-[10px] font-black text-agni-orange bg-agni-orange/15 px-2.5 py-0.5 rounded-full">{stats.streak} days 🔥</div>
              </div>
              <div className="flex justify-between gap-1">
                {streakDays.map((d, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35 + i * 0.05, type: "spring" }} className="flex flex-col items-center gap-1">
                    <span className="text-[8px] text-muted-foreground font-bold">{d.label}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black ${d.active ? "bg-agni-orange text-white shadow-lg" : "bg-muted/50 text-muted-foreground"}`}>
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
                <div className="w-7 h-7 rounded-xl bg-agni-purple flex items-center justify-center">
                  <Brain size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Learning Mode</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEACHING_MODES.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileTap={{ scale: 0.92, y: 2 }}
                    onClick={() => { setActiveMode(mode.id); localStorage.setItem("teaching_mode", mode.id); }}
                    className={`rounded-2xl p-2.5 text-center transition-all border-2 ${activeMode === mode.id ? "border-agni-green/50 bg-agni-green/10 shadow-md" : "border-border/30 bg-card hover:border-border"}`}
                  >
                    <span className="text-xl block">{mode.emoji}</span>
                    <span className="text-[10px] font-extrabold block text-foreground mt-0.5">{mode.label}</span>
                    <span className="text-[7px] block text-muted-foreground font-semibold">{mode.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Daily Tip */}
          <FadeIn delay={0.4}>
            <div className="bg-card border border-agni-green/20 rounded-2xl p-3.5 mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-agni-green/5 rounded-full -mr-6 -mt-6" />
              <div className="flex items-start gap-3">
                <Agni expression="teaching" size={65} animate={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb size={10} className="text-agni-gold" />
                    <span className="text-micro text-agni-gold">TIP OF THE DAY</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed font-semibold">{todayTip.tip}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <StaggerContainer className="grid grid-cols-3 gap-2 mb-4">
            {[
              { nav: "/curiosity", emoji: "🔮", label: "Spark", sub: "AI Insights", color: "bg-agni-purple" },
              { nav: "/sources", emoji: "🌐", label: "Hub", sub: "Resources", color: "bg-agni-blue" },
              { nav: "/mega-prompt", emoji: "📋", label: "Prompt", sub: "Reference", color: "bg-agni-orange" },
            ].map((a, i) => (
              <StaggerItem key={i}>
                <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.93, y: 2 }} onClick={() => navigate(a.nav)}
                  className="bg-card rounded-2xl p-3 text-left relative overflow-hidden border border-border/40 shadow-card w-full">
                  <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center mb-2 shadow-md`}>
                    <span className="text-base">{a.emoji}</span>
                  </div>
                  <p className="text-[11px] font-extrabold text-foreground">{a.label}</p>
                  <p className="text-[9px] text-muted-foreground font-semibold">{a.sub}</p>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Sign in prompt */}
          {!user && (
            <FadeIn delay={0.55}>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate("/auth")}
                className="w-full bg-card border-2 border-dashed border-agni-green/30 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                <Agni expression="default" size={55} animate={false} />
                <div className="text-left">
                  <span className="text-xs font-extrabold text-foreground block">Sign in to sync progress</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Never lose your streak! 🔥</span>
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
