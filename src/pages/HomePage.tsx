import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition, { StaggerContainer, StaggerItem, FadeIn, ScaleIn } from "@/components/PageTransition";
import { ArrowRight, Zap, Clock, BookOpen, TrendingUp, Target, Trophy, ChevronRight, Flame, Star, Lightbulb, Calendar, Rocket, Brain, Code2, Shield, Cpu, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import NetworkIllustration from "@/components/illustrations/NetworkIllustration";
import { motion } from "framer-motion";
import { useState } from "react";

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
  { id: "class5", label: "Class 5", emoji: "🎒", desc: "Like I'm 10", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { id: "engineer", label: "Engineer", emoji: "⚙️", desc: "Full depth", color: "bg-primary/10 text-primary border-primary/20" },
  { id: "hacker", label: "Hacker", emoji: "💻", desc: "Ship fast", color: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  { id: "founder", label: "Founder", emoji: "🚀", desc: "Strategic", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { id: "crazy", label: "Crazy", emoji: "🤯", desc: "Sci-fi mode", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  { id: "semiconductor", label: "Chip", emoji: "🏭", desc: "HCL context", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
];

const QUICK_WIN_PROJECTS = [
  { title: "Email Triage Agent", difficulty: "Easy", emoji: "📧" },
  { title: "Research Agent", difficulty: "Easy", emoji: "🔍" },
  { title: "Code Review Agent", difficulty: "Medium", emoji: "🔎" },
  { title: "Content Pipeline", difficulty: "Hard", emoji: "📝" },
  { title: "AI Startup (10 agents)", difficulty: "Expert", emoji: "🏢" },
];

const INDUSTRY_STATS = [
  { label: "Enterprise apps with agents by 2026", value: "40%", source: "Gartner" },
  { label: "Businesses deploying agents", value: "75%", source: "Deloitte" },
  { label: "Market size by 2030", value: "$52B", source: "Industry" },
  { label: "Agent repos with 1K+ stars", value: "535%↑", source: "GitHub" },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const storedRole = localStorage.getItem("edu_user_role") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;
  const [activeMode, setActiveMode] = useState("engineer");

  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const totalLessons = 22;
  const overallProgress = Math.round((done.length / totalLessons) * 100);
  const hours = Math.round(xp / 60);
  const streak = Math.min(done.length, 7);

  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeklyData = days.map((day, i) => ({
    day,
    lessons: Math.min(done.length > i * 4 ? Math.floor(done.length / (i + 1)) : 0, 10),
  })).filter(d => d.lessons > 0);
  const maxLessons = Math.max(...weeklyData.map(d => d.lessons), 1);

  // Streak calendar (last 7 days)
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

          {/* Greeting Banner */}
          <FadeIn delay={0.1}>
            <div className="glass border border-border/30 rounded-2xl p-4 mb-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-primary/60 tracking-widest mb-0.5">{greeting.toUpperCase()}</p>
                  <h2 className="text-base font-display font-bold text-foreground leading-snug mb-1">
                    Welcome back, {displayName}! 👋
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md">{storedRole}</span>
                    <span className="text-[10px] bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-md">Level {Math.floor(xp / 100) + 1}</span>
                  </div>
                </div>
                <NetworkIllustration size={64} className="opacity-40 -mr-1 -mt-1" />
              </div>
            </div>
          </FadeIn>

          {/* Hero Card */}
          <FadeIn delay={0.15}>
            <motion.div
              className="relative rounded-2xl p-4 mb-4 overflow-hidden cursor-pointer group"
              style={{ background: "linear-gradient(135deg, hsl(258 60% 50%), hsl(258 55% 40%))" }}
              onClick={() => navigate("/courses")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/50 tracking-widest mb-1">MASTERCLASS</p>
                <h3 className="text-lg font-display font-bold text-white leading-snug mb-1">AI Agents</h3>
                <p className="text-[11px] text-white/60 mb-3 max-w-[200px] leading-relaxed">
                  Build <span className="text-primary font-semibold">autonomous AI systems</span> for enterprise & startups
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white/80">{done.length}/{totalLessons} lessons</div>
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <ArrowRight size={13} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute top-3 right-3 text-4xl opacity-20 animate-float">🧠</div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/10" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  className="h-full bg-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </FadeIn>

          {/* Stats Row */}
          <StaggerContainer className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: BookOpen, value: done.length, label: "Lessons", color: "text-secondary", bg: "bg-secondary/10" },
              { icon: Zap, value: xp, label: "XP", color: "text-primary", bg: "bg-primary/10" },
              { icon: Clock, value: hours, label: "Hours", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Flame, value: `${streak}d`, label: "Streak", color: "text-primary", bg: "bg-primary/10" },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-card rounded-xl p-2.5 border border-border/50 text-center shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1`}>
                    <stat.icon size={13} className={stat.color} />
                  </div>
                  <p className="text-base font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Streak Calendar */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Flame size={13} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Streak Calendar</h4>
                <div className="ml-auto text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{streak} day streak 🔥</div>
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                      d.active
                        ? "bg-primary text-primary-foreground shadow-glow-primary"
                        : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {d.date}
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
                <Brain size={13} className="text-secondary" />
                <h4 className="text-xs font-bold text-foreground">Learning Mode</h4>
                <span className="text-[8px] text-muted-foreground ml-auto">From Mega Prompt</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {TEACHING_MODES.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveMode(mode.id);
                      localStorage.setItem("teaching_mode", mode.id);
                    }}
                    className={`rounded-xl p-2 border text-center transition-all ${
                      activeMode === mode.id
                        ? `${mode.color} shadow-sm`
                        : "bg-card border-border/50 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span className="text-lg block">{mode.emoji}</span>
                    <span className="text-[9px] font-bold block">{mode.label}</span>
                    <span className="text-[7px] block opacity-70">{mode.desc}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Daily Tip */}
          <FadeIn delay={0.4}>
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-3.5 mb-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg"
                >
                  {todayTip.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb size={10} className="text-primary" />
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Tip of the day</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{todayTip.tip}</p>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-primary/5" />
            </div>
          </FadeIn>

          {/* Sign in prompt */}
          {!user && (
            <FadeIn delay={0.45}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/auth")}
                className="w-full glass border border-primary/20 rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap size={13} className="text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">Sign in to sync progress</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            </FadeIn>
          )}

          {/* Quick Actions */}
          <StaggerContainer className="grid grid-cols-3 gap-2 mb-4">
            {[
              { nav: "/curiosity", emoji: "🔮", icon: SparklesIcon, label: "Spark", sub: "AI Insights", color: "text-secondary", bg: "bg-secondary/10", border: "hover:border-secondary/30" },
              { nav: "/sources", emoji: "🌐", icon: CompassIcon, label: "Hub", sub: "Resources", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30" },
              { nav: "/mega-prompt", emoji: "📋", icon: FileTextIcon, label: "Prompt", sub: "Reference", color: "text-primary", bg: "bg-primary/10", border: "hover:border-primary/30" },
            ].map((a, i) => (
              <StaggerItem key={i}>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(a.nav)}
                  className={`bg-card rounded-xl p-3 text-left relative overflow-hidden border border-border/50 shadow-card ${a.border} transition-all group w-full`}
                >
                  <div className="absolute top-2 right-2 text-xl opacity-10 group-hover:opacity-20 transition-opacity">{a.emoji}</div>
                  <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center mb-2`}>
                    <a.icon size={13} className={a.color} />
                  </div>
                  <p className="text-[11px] font-bold text-foreground">{a.label}</p>
                  <p className="text-[9px] text-muted-foreground">{a.sub}</p>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Quick-Win Projects */}
          <FadeIn delay={0.5}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Rocket size={13} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Quick-Win Projects</h4>
                <span className="text-[8px] text-muted-foreground ml-auto">From curriculum</span>
              </div>
              <div className="space-y-1.5">
                {QUICK_WIN_PROJECTS.map((proj, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    className="flex items-center gap-2.5 bg-background/50 rounded-lg p-2 border border-border/30"
                  >
                    <span className="text-base">{proj.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{proj.title}</p>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                      proj.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-600" :
                      proj.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600" :
                      proj.difficulty === "Hard" ? "bg-orange-500/10 text-orange-600" :
                      "bg-red-500/10 text-red-600"
                    }`}>{proj.difficulty}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Industry Intelligence */}
          <FadeIn delay={0.55}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-secondary" />
                <h4 className="text-xs font-bold text-foreground">Industry Intelligence</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRY_STATS.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 + i * 0.1 }}
                    className="bg-background/50 rounded-lg p-2.5 border border-border/30"
                  >
                    <p className="text-lg font-bold text-primary leading-none">{stat.value}</p>
                    <p className="text-[9px] text-foreground/70 mt-1 leading-snug">{stat.label}</p>
                    <p className="text-[7px] text-muted-foreground mt-0.5">— {stat.source}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Today's Goals */}
          <FadeIn delay={0.6}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={13} className="text-muted-foreground" />
                <h4 className="text-xs font-bold text-foreground">Today's Goals</h4>
                <div className="ml-auto text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { task: "Complete 1 lesson", done: done.length > 0, xp: 50 },
                  { task: "Try a Teaching Mode", done: activeMode !== "engineer", xp: 20 },
                  { task: "Explore Curiosity Spark", done: false, xp: 20 },
                  { task: "Read a resource from Hub", done: false, xp: 10 },
                ].map((goal, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.06 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 ${goal.done ? "bg-primary text-white" : "bg-muted border border-border/50"}`}>
                      {goal.done ? "✓" : ""}
                    </div>
                    <span className={`text-[11px] flex-1 ${goal.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>{goal.task}</span>
                    <span className="text-[9px] text-primary font-semibold">+{goal.xp} XP</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Weekly Progress Chart */}
          <FadeIn delay={0.65}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  <h4 className="text-xs font-bold text-foreground">Weekly Progress</h4>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">This week</span>
              </div>
              {weeklyData.length > 0 ? (
                <div className="space-y-1.5">
                  {weeklyData.map((d, i) => (
                    <div key={d.day} className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground w-7">{d.day}</span>
                      <div className="flex-1 bg-muted/50 rounded-md h-5 relative overflow-hidden">
                        <motion.div
                          className="h-full rounded-md flex items-center justify-end pr-2"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max((d.lessons / maxLessons) * 100, 20)}%` }}
                          transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
                          style={{ background: `linear-gradient(90deg, hsl(var(--primary) / ${0.6 + i * 0.1}), hsl(var(--edu-orange-light)))` }}
                        >
                          <span className="text-[9px] font-bold text-white">{d.lessons}</span>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[11px] text-muted-foreground">Complete lessons to see your weekly stats</p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Achievement Banner */}
          <FadeIn delay={0.7}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0"
              >
                <Trophy size={18} className="text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">
                  {done.length === 0 ? "Start your journey!" : done.length < 5 ? "Getting started! 🌱" : done.length < 15 ? "On fire! 🔥" : "Almost there! 🏆"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {done.length === 0 ? "Complete your first lesson to earn XP" : `${totalLessons - done.length} lessons to mastery`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary">{overallProgress}%</p>
                <div className="w-12 h-1 bg-muted/50 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Your Rank */}
          <FadeIn delay={0.75}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Star size={13} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Your Rank</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base">🧑‍💻</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{xp} XP • {done.length} lessons</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">#{Math.max(1, 100 - done.length * 5)}</p>
                  <p className="text-[8px] text-muted-foreground font-medium">RANK</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Continue Learning */}
          <FadeIn delay={0.8}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/courses")}
              className="w-full bg-gradient-to-r from-primary to-edu-orange-light rounded-2xl p-3.5 flex items-center justify-between shadow-glow-primary group mb-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <BookOpen size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Continue Learning</p>
                  <p className="text-[10px] text-white/60">{totalLessons - done.length} lessons remaining</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </FadeIn>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

const SparklesIcon = ({ size, className }: { size: number; className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
);
const FileTextIcon = ({ size, className }: { size: number; className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);
const CompassIcon = ({ size, className }: { size: number; className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
);

export default HomePage;
