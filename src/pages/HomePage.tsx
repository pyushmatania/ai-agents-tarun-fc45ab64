import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, Zap, Clock, BookOpen, TrendingUp, Target, Trophy, ChevronRight, Flame, Star, Lightbulb, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import NetworkIllustration from "@/components/illustrations/NetworkIllustration";

const DAILY_TIPS = [
  { tip: "AI agents use a Perceive→Reason→Act loop — just like humans!", emoji: "🧠" },
  { tip: "MCP is the USB-C of AI — one protocol, 12K+ tool servers.", emoji: "🔌" },
  { tip: "CrewAI lets you assign roles like CEO, CTO to AI agents.", emoji: "🏢" },
  { tip: "RAG = Retrieval Augmented Generation. It gives agents memory!", emoji: "💾" },
  { tip: "LangGraph uses directed graphs for complex agent workflows.", emoji: "📊" },
  { tip: "Multi-agent systems can debate to reach better conclusions.", emoji: "🤝" },
  { tip: "1 person + 10 AI agents = a fully autonomous startup.", emoji: "🚀" },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const storedRole = localStorage.getItem("edu_user_role") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;

  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const totalLessons = 21;
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

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24 relative">
      <FloatingShapes />
      <div className="max-w-md mx-auto px-4 pt-5 relative z-10">
        <Header name={displayName} progress={overallProgress} />

        {/* Greeting Banner */}
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

        {/* Hero Card */}
        <div
          className="relative rounded-2xl p-4 mb-4 overflow-hidden cursor-pointer group"
          style={{ background: "linear-gradient(135deg, hsl(258 60% 50%), hsl(258 55% 40%))" }}
          onClick={() => navigate("/courses")}
        >
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-white/50 tracking-widest mb-1">MASTERCLASS</p>
            <h3 className="text-lg font-display font-bold text-white leading-snug mb-1">
              AI Agents
            </h3>
            <p className="text-[11px] text-white/60 mb-3 max-w-[200px] leading-relaxed">
              Build <span className="text-primary font-semibold">autonomous AI systems</span> for enterprise & startups
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white/80">
                {done.length}/{totalLessons} lessons
              </div>
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <ArrowRight size={13} className="text-white" />
              </div>
            </div>
          </div>
          <div className="absolute top-3 right-3 text-4xl opacity-20 animate-float">🧠</div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/10" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-primary/80 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { icon: BookOpen, value: done.length, label: "Lessons", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: Zap, value: xp, label: "XP", color: "text-primary", bg: "bg-primary/10" },
            { icon: Clock, value: hours, label: "Hours", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { icon: Flame, value: `${streak}d`, label: "Streak", color: "text-primary", bg: "bg-primary/10" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-2.5 border border-border/50 text-center shadow-card hover:shadow-card-hover transition-shadow">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1`}>
                <stat.icon size={13} className={stat.color} />
              </div>
              <p className="text-base font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Daily Tip */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-3.5 mb-4 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
              {todayTip.emoji}
            </div>
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

        {/* Sign in prompt */}
        {!user && (
          <button
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
          </button>
        )}

        {/* Quick Actions — 3-col */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { nav: "/curiosity", emoji: "🔮", icon: SparklesIcon, label: "Spark", sub: "AI Insights", color: "text-secondary", bg: "bg-secondary/10", border: "hover:border-secondary/30" },
            { nav: "/sources", emoji: "🌐", icon: CompassIcon, label: "Hub", sub: "Resources", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "hover:border-emerald-400/30" },
            { nav: "/mega-prompt", emoji: "📋", icon: FileTextIcon, label: "Prompt", sub: "Reference", color: "text-primary", bg: "bg-primary/10", border: "hover:border-primary/30" },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.nav)}
              className={`bg-card rounded-xl p-3 text-left relative overflow-hidden border border-border/50 shadow-card ${a.border} transition-all group`}>
              <div className="absolute top-2 right-2 text-xl opacity-10 group-hover:opacity-20 transition-opacity">{a.emoji}</div>
              <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center mb-2`}>
                <a.icon size={13} className={a.color} />
              </div>
              <p className="text-[11px] font-bold text-foreground">{a.label}</p>
              <p className="text-[9px] text-muted-foreground">{a.sub}</p>
            </button>
          ))}
        </div>

        {/* Achievement Banner */}
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-primary" />
          </div>
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
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
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
              { task: "Explore Curiosity Spark", done: false, xp: 20 },
              { task: "Read a resource from Hub", done: false, xp: 10 },
            ].map((goal, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 ${goal.done ? "bg-primary text-white" : "bg-muted border border-border/50"}`}>
                  {goal.done ? "✓" : ""}
                </div>
                <span className={`text-[11px] flex-1 ${goal.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>{goal.task}</span>
                <span className="text-[9px] text-primary font-semibold">+{goal.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Progress Chart */}
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
                    <div
                      className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                      style={{
                        width: `${Math.max((d.lessons / maxLessons) * 100, 20)}%`,
                        background: `linear-gradient(90deg, hsl(var(--primary) / ${0.6 + i * 0.1}), hsl(var(--edu-orange-light)))`,
                      }}
                    >
                      <span className="text-[9px] font-bold text-white">{d.lessons}</span>
                    </div>
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

        {/* Leaderboard preview */}
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-primary" />
            <h4 className="text-xs font-bold text-foreground">Your Rank</h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base">
              🧑‍💻
            </div>
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

        {/* Continue Learning */}
        <button
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
        </button>
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
