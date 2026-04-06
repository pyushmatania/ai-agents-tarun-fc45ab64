import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Loader2, TrendingUp, Trophy, Target, Flame, Zap, Calendar, BookOpen, Star, Award, ChevronRight, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ProgressWithCourse {
  id: string;
  course_id: string | null;
  lessons_completed: number | null;
  hours_spent: number | null;
  progress_percent: number | null;
  day_of_week: string | null;
  course_title?: string;
  course_subject?: string;
}

const ACHIEVEMENTS = [
  { title: "First Step", desc: "Complete 1 lesson", emoji: "🌱", check: (d: number, x: number, b: number) => d >= 1 },
  { title: "Curious Mind", desc: "Bookmark 3 lessons", emoji: "🔖", check: (_d: number, _x: number, b: number) => b >= 3 },
  { title: "Getting Serious", desc: "Complete 5 lessons", emoji: "🔥", check: (d: number) => d >= 5 },
  { title: "XP Collector", desc: "Earn 200 XP", emoji: "💰", check: (_d: number, x: number) => x >= 200 },
  { title: "Halfway Hero", desc: "Complete 11 lessons", emoji: "⚡", check: (d: number) => d >= 11 },
  { title: "Bookworm", desc: "Bookmark 5 lessons", emoji: "📚", check: (_d: number, _x: number, b: number) => b >= 5 },
  { title: "XP Hunter", desc: "Earn 500 XP", emoji: "💎", check: (_d: number, x: number) => x >= 500 },
  { title: "Week Warrior", desc: "7-day streak", emoji: "🗓️", check: (d: number) => d >= 7 },
  { title: "Agent Master", desc: "Complete all 22", emoji: "🏆", check: (d: number) => d >= 22 },
];

const MODULE_PROGRESS = [
  { title: "Foundations", icon: "🧬", total: 6, color: "from-violet-500 to-purple-600", ids: ["f1","f2","f3","f4","f5","f6"] },
  { title: "Frameworks", icon: "⚔️", total: 6, color: "from-orange-500 to-amber-600", ids: ["w1","w2","w3","w4","w5","w6"] },
  { title: "Multi-Agent", icon: "🏢", total: 5, color: "from-slate-500 to-slate-600", ids: ["m1","m2","m3","m4","m5"] },
  { title: "Real World", icon: "🚀", total: 5, color: "from-purple-600 to-indigo-700", ids: ["r1","r2","r3","r4","r5"] },
];

const ProgressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<ProgressWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; value: number }[]>([]);

  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const bookmarks: string[] = JSON.parse(localStorage.getItem("adojo_bookmarks") || "[]");
  const streak = Math.min(done.length, 7);
  const level = Math.floor(xp / 100) + 1;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchData = async () => {
      const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
      const { data: courses } = await supabase.from("courses").select("id, title, subject");
      if (progress && courses) {
        const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
        setProgressData(progress.map((p) => ({ ...p, course_title: p.course_id ? courseMap[p.course_id]?.title : undefined, course_subject: p.course_id ? courseMap[p.course_id]?.subject : undefined })));
        setTotalLessons(progress.reduce((s, r) => s + (r.lessons_completed || 0), 0));
        setTotalHours(progress.reduce((s, r) => s + Number(r.hours_spent || 0), 0));
        setOverallProgress(progress.length > 0 ? Math.round(progress.reduce((s, r) => s + (r.progress_percent || 0), 0) / progress.length) : 0);
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setWeeklyData(dayOrder.map((day) => ({ day, value: progress.filter((r) => r.day_of_week === day).reduce((s, r) => s + (r.lessons_completed || 0), 0) })));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || localStorage.getItem("edu_user_name") || "Learner";
  const localProgress = Math.round((done.length / 22) * 100);
  const displayProgress = overallProgress || localProgress;
  const maxChartVal = Math.max(...weeklyData.map((d) => d.value), 1);

  // Streak calendar - last 14 days
  const streakDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { label: d.toLocaleDateString("en", { weekday: "narrow" }), date: d.getDate(), month: d.toLocaleDateString("en", { month: "short" }), active: i >= 14 - streak };
  });

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(done.length, xp, bookmarks.length)).length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">
          <Header name={userName} progress={displayProgress} />

          {/* Page Title */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-display font-bold text-foreground">Your Stats</h2>
              <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-2.5 py-1">
                <Star size={10} className="text-primary" />
                <span className="text-[10px] font-bold text-primary">Level {level}</span>
              </div>
            </div>
          </FadeIn>

          {/* Hero Stats Banner */}
          <FadeIn delay={0.05}>
            <div className="rounded-2xl p-4 mb-4 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(258 55% 45%), hsl(228 40% 25%))" }}>
              <div className="grid grid-cols-4 gap-3 text-center relative z-10">
                {[
                  { value: done.length, label: "Lessons", icon: BookOpen },
                  { value: xp, label: "XP", icon: Zap },
                  { value: `${streak}d`, label: "Streak", icon: Flame },
                  { value: `${displayProgress}%`, label: "Done", icon: Target },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-1">
                      <s.icon size={14} className="text-white/80" />
                    </div>
                    <p className="text-lg font-bold text-white leading-none">{s.value}</p>
                    <p className="text-[8px] text-white/50 font-semibold mt-0.5">{s.label}</p>
                  </motion.div>
                ))}
              </div>
              {/* Circular progress ring */}
              <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" opacity="0.3" />
                  <motion.circle
                    cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8"
                    strokeDasharray={`${displayProgress * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDasharray: "0 251" }}
                    animate={{ strokeDasharray: `${displayProgress * 2.51} 251` }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  />
                </svg>
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />
            </div>
          </FadeIn>

          {/* Streak Calendar */}
          <FadeIn delay={0.15}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={13} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Streak Calendar</h4>
                <div className="ml-auto flex items-center gap-1">
                  <Flame size={10} className="text-primary" />
                  <span className="text-[9px] font-bold text-primary">{streak} day streak</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {streakDays.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.03, type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[7px] text-muted-foreground font-medium mb-0.5">{d.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                      d.active
                        ? "bg-primary text-primary-foreground shadow-glow-primary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}>
                      {d.date}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-border/30">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-[8px] text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted/40" />
                  <span className="text-[8px] text-muted-foreground">Missed</span>
                </div>
                <span className="text-[8px] text-muted-foreground ml-auto">{streakDays[0].month} {streakDays[0].date} – {streakDays[13].month} {streakDays[13].date}</span>
              </div>
            </div>
          </FadeIn>

          {/* Module Progress Rings */}
          <FadeIn delay={0.25}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-secondary" />
                <h4 className="text-xs font-bold text-foreground">Module Progress</h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {MODULE_PROGRESS.map((mod, i) => {
                  const completed = mod.ids.filter(id => done.includes(id)).length;
                  const pct = Math.round((completed / mod.total) * 100);
                  const circumference = 2 * Math.PI * 18;
                  return (
                    <motion.div
                      key={mod.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative w-12 h-12 mb-1">
                        <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" opacity="0.3" />
                          <motion.circle
                            cx="22" cy="22" r="18" fill="none"
                            stroke={pct === 100 ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
                            strokeWidth="3" strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${(pct / 100) * circumference} ${circumference}` }}
                            transition={{ duration: 0.8, delay: 0.35 + i * 0.1 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-base">
                          {mod.icon}
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-foreground text-center">{mod.title}</p>
                      <p className="text-[8px] text-muted-foreground">{completed}/{mod.total}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Weekly Activity Chart */}
          <FadeIn delay={0.35}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-muted-foreground" />
                  <h4 className="text-xs font-bold text-foreground">Weekly Activity</h4>
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">This week</span>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-1.5 h-24 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const val = weeklyData.find(d => d.day === day)?.value || 0;
                  const heightPct = maxChartVal > 0 ? Math.max((val / maxChartVal) * 100, 4) : 4;
                  const isToday = new Date().toLocaleDateString("en", { weekday: "short" }) === day;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className={`w-full rounded-t-md relative ${val > 0 ? "bg-gradient-to-t from-primary to-primary/60" : "bg-muted/30"}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.06 }}
                        style={{ minHeight: 4 }}
                      >
                        {val > 0 && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary">{val}</span>
                        )}
                      </motion.div>
                      <span className={`text-[8px] font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.charAt(0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Achievements Grid */}
          <FadeIn delay={0.4}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Achievements</h4>
                <div className="ml-auto flex items-center gap-1 bg-primary/10 rounded-md px-2 py-0.5">
                  <Award size={9} className="text-primary" />
                  <span className="text-[9px] font-bold text-primary">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                </div>
              </div>
              {/* Progress bar for achievements */}
              <div className="w-full h-1.5 bg-muted/50 rounded-full mb-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ACHIEVEMENTS.map((a, i) => {
                  const unlocked = a.check(done.length, xp, bookmarks.length);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.7, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: unlocked ? 1.05 : 1 }}
                      className={`relative rounded-xl p-2.5 text-center border transition-all ${
                        unlocked
                          ? "bg-gradient-to-b from-primary/5 to-secondary/5 border-primary/20 shadow-glow-primary"
                          : "bg-muted/20 border-border/30"
                      }`}
                    >
                      {!unlocked && (
                        <div className="absolute top-1.5 right-1.5">
                          <Lock size={8} className="text-muted-foreground/40" />
                        </div>
                      )}
                      <motion.span
                        className={`text-xl block ${!unlocked ? "grayscale opacity-40" : ""}`}
                        animate={unlocked ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.06 }}
                      >
                        {a.emoji}
                      </motion.span>
                      <p className={`text-[9px] font-bold mt-1 ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</p>
                      <p className="text-[7px] text-muted-foreground leading-tight">{a.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* XP Level Progress */}
          <FadeIn delay={0.5}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={13} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Level Progress</h4>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-lg font-bold text-white">{level}</span>
                </motion.div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-foreground">Level {level}</span>
                    <span className="text-[10px] text-muted-foreground">Level {level + 1}</span>
                  </div>
                  <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(xp % 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{xp % 100}/100 XP to next level</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Enrolled Courses */}
          <FadeIn delay={0.55}>
            <div className="mb-4">
              <h3 className="text-xs font-bold text-foreground mb-2">Enrolled courses</h3>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-muted-foreground" size={18} />
                </div>
              ) : progressData.filter((p) => p.course_id).length > 0 ? (
                <div className="space-y-2">
                  {progressData.filter((p) => p.course_id).map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/course/${p.course_id}`)}
                      className="w-full bg-card rounded-xl p-3 border border-border/50 flex items-center gap-2.5 hover:border-primary/20 transition-all text-left shadow-card"
                    >
                      <div className="w-8 h-8 rounded-lg bg-edu-lavender flex items-center justify-center text-sm">📘</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-[11px] truncate">{p.course_title || "Course"}</p>
                        <p className="text-[10px] text-muted-foreground">{p.lessons_completed || 0} lessons • {Number(p.hours_spent || 0)}h</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-primary">{p.progress_percent || 0}%</p>
                        <div className="w-12 h-1 bg-muted rounded-full mt-0.5 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress_percent || 0}%` }} />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-4 border border-border/50 text-center shadow-card">
                  <p className="text-[11px] text-muted-foreground">No cloud courses enrolled yet</p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/courses")}
                    className="mt-2 text-[10px] font-semibold text-primary flex items-center gap-1 mx-auto"
                  >
                    Browse courses <ChevronRight size={10} />
                  </motion.button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Leaderboard */}
          <FadeIn delay={0.6}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={13} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Leaderboard</h4>
              </div>
              <div className="space-y-2">
                {[
                  { name: userName, xp, rank: 1, you: true },
                  { name: "Priya S.", xp: Math.max(xp - 50, 120), rank: 2 },
                  { name: "Rahul M.", xp: Math.max(xp - 100, 80), rank: 3 },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.06 }}
                    className={`flex items-center gap-2.5 p-2 rounded-lg ${p.you ? "bg-primary/5 border border-primary/20" : ""}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                      p.rank === 1 ? "bg-amber-500/20 text-amber-600" : p.rank === 2 ? "bg-slate-400/20 text-slate-500" : "bg-orange-400/20 text-orange-500"
                    }`}>
                      {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-foreground">{p.name} {p.you ? <span className="text-[8px] text-primary">(You)</span> : ""}</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary">{p.xp} XP</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default ProgressPage;
