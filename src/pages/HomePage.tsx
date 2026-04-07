import BottomNav from "@/components/BottomNav";
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from "@/components/PageTransition";
import { ArrowRight, Zap, Clock, BookOpen, Flame, Lightbulb, Rocket, Brain, Heart, Diamond, User, Info, Trophy, Target, Shield, Crown, Map, Sparkles } from "lucide-react";
import MascotProfileModal from "@/components/MascotProfileModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import DailyQuests from "@/components/DailyQuests";
import { useGamification } from "@/hooks/useGamification";
import { useState, useEffect, useMemo } from "react";
import { SFX } from "@/lib/sounds";
import { toast } from "sonner";
import { getPersona } from "@/lib/neuralOS";
import { supabase } from "@/integrations/supabase/client";

const DAILY_TIPS = [
  { tip: "AI agents use a Perceive→Reason→Act loop — just like humans!", emoji: "🧠" },
  { tip: "MCP is the USB-C of AI — one protocol, 12K+ tool servers.", emoji: "🔌" },
  { tip: "CrewAI lets you assign roles like CEO, CTO to AI agents.", emoji: "🏢" },
  { tip: "RAG = Retrieval Augmented Generation. It gives agents memory!", emoji: "💾" },
  { tip: "LangGraph uses directed graphs for complex agent workflows.", emoji: "📊" },
  { tip: "Multi-agent systems can debate to reach better conclusions.", emoji: "🤝" },
  { tip: "1 person + 10 AI agents = a fully autonomous startup.", emoji: "🚀" },
];

const TEACHING_MODE_CATEGORIES = [
  {
    category: "Style",
    emoji: "🎨",
    modes: [
      { id: "simpler", label: "Simpler!", emoji: "🧸", desc: "Like I'm 10", color: "from-agni-green to-agni-green-light" },
      { id: "fun", label: "Fun Example", emoji: "🎮", desc: "Gamified learning", color: "from-agni-blue to-blue-400" },
      { id: "story", label: "Story Time", emoji: "📖", desc: "Narrative style", color: "from-agni-purple to-purple-400" },
      { id: "silicon", label: "Silicon Valley", emoji: "🎬", desc: "Real-world cases", color: "from-violet-700 to-violet-500" },
    ],
  },
  {
    category: "Depth",
    emoji: "🧠",
    modes: [
      { id: "class5", label: "Class 5", emoji: "🎒", desc: "Super simple", color: "from-agni-green to-emerald-400" },
      { id: "engineer", label: "Engineer", emoji: "⚙️", desc: "Full depth", color: "from-agni-blue to-cyan-400" },
      { id: "hacker", label: "Hacker", emoji: "💻", desc: "Ship fast", color: "from-agni-purple to-fuchsia-400" },
      { id: "researcher", label: "Researcher", emoji: "🔬", desc: "Papers & math", color: "from-agni-pink to-pink-400" },
    ],
  },
  {
    category: "Persona",
    emoji: "🚀",
    modes: [
      { id: "founder", label: "Founder", emoji: "🚀", desc: "Strategic view", color: "from-agni-gold to-yellow-400" },
      { id: "crazy", label: "Crazy", emoji: "🤯", desc: "Sci-fi mode", color: "from-agni-pink to-rose-400" },
      { id: "chip", label: "Chip Expert", emoji: "🏭", desc: "HCL context", color: "from-agni-orange to-orange-400" },
      { id: "artist", label: "Creative", emoji: "🎭", desc: "Visual thinker", color: "from-teal-500 to-teal-300" },
    ],
  },
];

// Flat list for lookups
const TEACHING_MODES = TEACHING_MODE_CATEGORIES.flatMap(c => c.modes);

const MOTIVATIONAL_QUOTES = [
  { quote: "The best way to predict the future is to build it.", author: "Alan Kay" },
  { quote: "AI is the new electricity.", author: "Andrew Ng" },
  { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { quote: "The only limit is your imagination.", author: "AGNI" },
  { quote: "Every expert was once a beginner.", author: "Helen Hayes" },
  { quote: "Code is poetry, AI is magic.", author: "Neural-OS" },
  { quote: "Ship fast, learn faster.", author: "Unknown" },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, dailyQuests, streakDays, league, achievements, unlockedAchievements } = useGamification();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;
  const [activeMode, setActiveMode] = useState(localStorage.getItem("teaching_mode") || "engineer");
  const [agniExpression, setAgniExpression] = useState<"default" | "happy" | "excited">("default");
  const [showProfile, setShowProfile] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ display_name: string; xp: number; weekly_xp: number; user_id: string }[]>([]);
  const [lbTab, setLbTab] = useState<"weekly" | "alltime">("weekly");
  const [prevRank, setPrevRank] = useState<number | null>(null);

  // Fetch leaderboard + realtime subscription
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("leaderboard")
        .select("display_name, xp, weekly_xp, user_id")
        .order("weekly_xp", { ascending: false })
        .limit(10);
      if (data) setLeaderboard(data as any);
    };
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
  const persona = useMemo(() => getPersona(), []);

  const totalLessons = 22;
  const overallProgress = Math.round((stats.done.length / totalLessons) * 100);
  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];
  const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const dailyProgress = (Math.min(stats.dailyXp, stats.dailyGoal) / stats.dailyGoal) * 100;
  const personaItemCount = useMemo(() => {
    let c = 0;
    if (persona.shows?.length) c += persona.shows.length;
    if (persona.sports?.length) c += persona.sports.length;
    if (persona.music?.length) c += persona.music.length;
    if (persona.gaming?.length) c += persona.gaming.length;
    if (persona.hobbies?.length) c += persona.hobbies.length;
    if (persona.curious?.length) c += persona.curious.length;
    if (persona.news?.length) c += persona.news.length;
    if (persona.books?.length) c += persona.books.length;
    return c;
  }, [persona]);

  const storedRole = localStorage.getItem("edu_user_role");
  const roleLabel = storedRole ? TEACHING_MODES.find(m => m.id === storedRole)?.label || storedRole : null;

  // Personalized features shown under the greeting
  const personalFeatures = [
    { label: `${stats.streak}d streak`, color: "bg-agni-green/15 text-agni-green", icon: Flame },
    { label: league.name, color: "bg-agni-purple/15 text-agni-purple", icon: null, emoji: league.emoji },
    ...(roleLabel ? [{ label: roleLabel, color: "bg-agni-blue/15 text-agni-blue", icon: User, emoji: undefined }] : []),
    { label: `L${stats.level}`, color: "bg-agni-gold/15 text-agni-gold", icon: Zap, emoji: undefined },
  ];

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
            <motion.div className="relative rounded-3xl mb-4 overflow-visible bg-gradient-card-accent border border-border/40 shadow-card">
              {/* Info button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center"
              >
                <Info size={12} className="text-muted-foreground" />
              </motion.button>

              {/* Info tooltip */}
              {showInfoTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-10 right-3 z-30 bg-card border border-border rounded-xl px-3 py-2 shadow-lg max-w-[200px]"
                >
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-bold text-agni-green">Double-tap AGNI</span> to open your Neural OS profile & personalize how AI teaches you!
                  </p>
                </motion.div>
              )}

              <div className="flex items-start px-4 py-4">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-micro text-agni-green mb-1">{greeting.toUpperCase()}</p>
                  <h2 className="text-xl font-black text-foreground leading-snug mb-2">Hey, {displayName}! 👋</h2>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {personalFeatures.map((feat, i) => (
                      <span key={i} className={`text-[10px] ${feat.color} font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                        {feat.icon && <feat.icon size={10} />}
                        {feat.emoji && <span className="text-[10px]">{feat.emoji}</span>}
                        {feat.label}
                      </span>
                    ))}
                  </div>
                  {/* Neural OS personalization hint */}
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    🧠 <span className="text-agni-purple font-bold">Neural OS</span> active — lessons personalized for you
                  </p>
                </div>
                <div className="relative shrink-0">
                  <svg viewBox="0 0 130 130" className="w-[110px] h-[110px] -rotate-90">
                    <circle cx="65" cy="65" r="58" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" opacity="0.3" />
                    <motion.circle
                      cx="65" cy="65" r="58" fill="none" stroke="hsl(var(--agni-green))" strokeWidth="4" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 365" }}
                      animate={{ strokeDasharray: `${dailyProgress * 3.65} 365` }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center" onDoubleClick={() => setShowProfile(true)}>
                    <Agni expression={agniExpression} size={80} interactive />
                  </div>
                </div>
              </div>
              {/* AGNI speech below the bot */}
              <div className="px-4 -mt-1 mb-2">
                <div className="bg-agni-green/10 border border-agni-green/20 rounded-xl px-3 py-1.5 inline-block">
                  <p className="text-[11px] font-bold text-agni-green">{agniSpeech}</p>
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

          {/* Teaching Modes — Collapsible Minimal Chips */}
          <FadeIn delay={0.35}>
            <Collapsible open={modesOpen} onOpenChange={setModesOpen} className="mb-4">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between mb-2.5 group">
                  <h4 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">Learning Mode</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground/60">
                      {TEACHING_MODES.find(m => m.id === activeMode)?.emoji} {TEACHING_MODES.find(m => m.id === activeMode)?.label}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground/50 transition-transform duration-200 ${modesOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                {TEACHING_MODE_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="mb-2">
                    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 px-0.5">
                      {cat.emoji} {cat.category}
                    </p>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                      {cat.modes.map((mode) => {
                        const isSelected = activeMode === mode.id;
                        return (
                          <motion.button
                            key={mode.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setActiveMode(mode.id);
                              localStorage.setItem("teaching_mode", mode.id);
                              window.dispatchEvent(new Event("storage"));
                              SFX.tap();
                              toast(`${mode.emoji} ${mode.label}`, { description: mode.desc, duration: 1500 });
                            }}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-all ${
                              isSelected
                                ? "bg-agni-green/15 text-agni-green border border-agni-green/30"
                                : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
                            }`}
                          >
                            <span className="text-xs">{mode.emoji}</span>
                            <span>{mode.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </FadeIn>

          {/* Daily Tip */}
          <FadeIn delay={0.4}>
            <div className="bg-card border border-agni-green/20 rounded-2xl p-3.5 mb-4 relative overflow-visible">
              <div className="absolute top-0 right-0 w-20 h-20 bg-agni-green/5 rounded-full -mr-6 -mt-6" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-[65px] h-[65px] flex items-center justify-center overflow-visible">
                  <Agni expression="teaching" size={60} animate={false} />
                </div>
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
              { nav: "/roadmap", emoji: "🗺️", label: "Path", sub: "Roadmap", color: "bg-agni-orange" },
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

          {/* League & Achievements Row */}
          <FadeIn delay={0.45}>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* League Card */}
              <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate("/settings")}
                className="bg-card rounded-2xl p-3 border border-border/40 shadow-card cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-agni-purple flex items-center justify-center">
                    <Crown size={13} className="text-white" />
                  </div>
                  <span className="text-[10px] font-extrabold text-foreground">League</span>
                </div>
                <motion.span className="text-2xl block mb-1" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  {league.emoji}
                </motion.span>
                <p className={`text-xs font-black ${league.color}`}>{league.name}</p>
                <p className="text-[8px] text-muted-foreground font-bold">{stats.xp} XP total</p>
              </motion.div>

              {/* Achievements Card */}
              <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate("/settings")}
                className="bg-card rounded-2xl p-3 border border-border/40 shadow-card cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center">
                    <Trophy size={13} className="text-white" />
                  </div>
                  <span className="text-[10px] font-extrabold text-foreground">Badges</span>
                </div>
                <div className="flex gap-1 mb-1.5">
                  {achievements.slice(0, 4).map(a => (
                    <span key={a.id} className={`text-lg ${a.unlocked ? "" : "grayscale opacity-30"}`}>{a.emoji}</span>
                  ))}
                </div>
                <p className="text-xs font-black text-agni-gold">{unlockedAchievements}/{achievements.length}</p>
                <p className="text-[8px] text-muted-foreground font-bold">Unlocked</p>
              </motion.div>
            </div>
          </FadeIn>

          {/* Neural OS Persona Widget */}
          <FadeIn delay={0.5}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowProfile(true)}
              className="w-full bg-card border border-agni-purple/20 rounded-2xl p-3.5 mb-4 shadow-card text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-agni-purple flex items-center justify-center">
                  <Brain size={13} className="text-white" />
                </div>
                <span className="text-[10px] font-extrabold text-foreground">Neural OS Persona</span>
                <span className="ml-auto text-[9px] font-black text-agni-purple bg-agni-purple/15 px-2 py-0.5 rounded-full">
                  {personaItemCount > 0 ? `${personaItemCount} items` : "Set up"}
                </span>
              </div>
              {personaItemCount > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {persona.currentRole && <span className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">💼 {persona.currentRole}</span>}
                  {persona.shows?.slice(0, 2).map(s => <span key={s} className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">🎬 {s}</span>)}
                  {persona.sports?.slice(0, 2).map(s => <span key={s} className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">⚽ {s}</span>)}
                  {personaItemCount > 4 && <span className="text-[9px] font-bold text-agni-purple/60">+{personaItemCount - 4} more</span>}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground font-semibold">Tap to set up — AGNI personalizes every lesson for you ✨</p>
              )}
            </motion.button>
          </FadeIn>

          {/* Motivational Quote */}
          <FadeIn delay={0.55}>
            <div className="bg-gradient-to-br from-agni-green/10 to-agni-blue/5 border border-agni-green/15 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-agni-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] text-foreground font-bold leading-relaxed italic">"{todayQuote.quote}"</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">— {todayQuote.author}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Leaderboard Widget */}
          <FadeIn delay={0.58}>
            <div className="bg-card rounded-2xl p-3.5 mb-4 border border-border/40 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center">
                    <Trophy size={13} className="text-white" />
                  </div>
                  <span className="text-[10px] font-extrabold text-foreground">Leaderboard</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/leaderboard")}
                  className="text-[9px] font-black text-agni-gold bg-agni-gold/15 px-2.5 py-1 rounded-full flex items-center gap-0.5">
                  View All <ArrowRight size={10} />
                </motion.button>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 mb-3">
                {([
                  { key: "weekly" as const, label: "This Week" },
                  { key: "alltime" as const, label: "All Time" },
                ] as const).map(tab => (
                  <motion.button key={tab.key} whileTap={{ scale: 0.95 }}
                    onClick={() => { setLbTab(tab.key); SFX.tap(); }}
                    className={`text-[9px] font-black px-3 py-1 rounded-full transition-all ${lbTab === tab.key ? "bg-agni-gold/20 text-agni-gold border border-agni-gold/40" : "bg-muted/30 text-muted-foreground border border-transparent"}`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
                <span className="ml-auto text-[7px] font-bold text-muted-foreground self-center">
                  {lbTab === "weekly" ? "Resets Mon" : "Forever"}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={lbTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="space-y-1.5">
                  {(() => {
                    const sorted = [...leaderboard].sort((a, b) =>
                      lbTab === "weekly" ? b.weekly_xp - a.weekly_xp : b.xp - a.xp
                    );
                    const myIdx = user ? sorted.findIndex(p => p.user_id === user.id) : -1;

                    return sorted.length > 0 ? (
                      sorted.slice(0, 5).map((player, idx) => {
                        const isYou = user && player.user_id === user.id;
                        const rankEmoji = idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "⚡";
                        const xpVal = lbTab === "weekly" ? player.weekly_xp : player.xp;
                        // Rank change indicator for current user
                        let rankChange: React.ReactNode = null;
                        if (isYou && prevRank !== null && lbTab === "weekly") {
                          const diff = prevRank - idx;
                          if (diff > 0) rankChange = <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] font-black text-agni-green">▲{diff}</motion.span>;
                          else if (diff < 0) rankChange = <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] font-black text-red-400">▼{Math.abs(diff)}</motion.span>;
                        }
                        return (
                          <motion.div key={player.user_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl ${isYou ? "bg-agni-green/10 border border-agni-green/20" : "bg-muted/20"}`}
                          >
                            <span className="text-xs font-black text-muted-foreground w-4 text-center">{idx + 1}</span>
                            <span className="text-sm">{rankEmoji}</span>
                            <span className={`text-[11px] font-extrabold flex-1 ${isYou ? "text-agni-green" : "text-foreground"}`}>
                              {player.display_name} {isYou && <span className="text-[8px] font-bold text-agni-green/70">(You)</span>}
                              {rankChange && <span className="ml-1">{rankChange}</span>}
                            </span>
                            <span className="text-[10px] font-black text-agni-gold">{xpVal.toLocaleString()} XP</span>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-[11px] text-muted-foreground font-semibold">
                          {user ? "Earn XP to appear on the leaderboard! 🚀" : "Sign in to compete! 🏆"}
                        </p>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* More Quick Links Row */}
          <FadeIn delay={0.6}>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/mega-prompt")}
                className="bg-card rounded-2xl p-3 border border-border/40 shadow-card flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-agni-green flex items-center justify-center shrink-0">
                  <span className="text-base">📋</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-extrabold text-foreground">Mega Prompt</p>
                  <p className="text-[8px] text-muted-foreground font-semibold">Reference guide</p>
                </div>
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/progress")}
                className="bg-card rounded-2xl p-3 border border-border/40 shadow-card flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-agni-blue flex items-center justify-center shrink-0">
                  <Target size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-extrabold text-foreground">Full Stats</p>
                  <p className="text-[8px] text-muted-foreground font-semibold">Detailed progress</p>
                </div>
              </motion.button>
            </div>
          </FadeIn>

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
        <MascotProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      </div>
    </PageTransition>
  );
};

export default HomePage;
