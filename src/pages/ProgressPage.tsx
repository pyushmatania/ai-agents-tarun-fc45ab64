import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { ChevronDown, Loader2, TrendingUp, Trophy, Target, Award, Flame, Zap } from "lucide-react";
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
  { title: "First Step", desc: "Complete your first lesson", emoji: "🌱", threshold: 1 },
  { title: "Getting Serious", desc: "Complete 5 lessons", emoji: "🔥", threshold: 5 },
  { title: "Halfway There", desc: "Complete 11 lessons", emoji: "⚡", threshold: 11 },
  { title: "Agent Master", desc: "Complete all 22 lessons", emoji: "🏆", threshold: 22 },
  { title: "XP Hunter", desc: "Earn 500 XP", emoji: "💎", threshold: -500 },
  { title: "Bookworm", desc: "Bookmark 5 lessons", emoji: "📚", threshold: -5 },
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

  // Local stats
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const bookmarks: string[] = JSON.parse(localStorage.getItem("adojo_bookmarks") || "[]");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
      const { data: courses } = await supabase.from("courses").select("id, title, subject");
      if (progress && courses) {
        const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
        const enriched = progress.map((p) => ({
          ...p,
          course_title: p.course_id ? courseMap[p.course_id]?.title : undefined,
          course_subject: p.course_id ? courseMap[p.course_id]?.subject : undefined,
        }));
        setProgressData(enriched);
        setTotalLessons(progress.reduce((s, r) => s + (r.lessons_completed || 0), 0));
        setTotalHours(progress.reduce((s, r) => s + Number(r.hours_spent || 0), 0));
        setOverallProgress(progress.length > 0 ? Math.round(progress.reduce((s, r) => s + (r.progress_percent || 0), 0) / progress.length) : 0);
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setWeeklyData(dayOrder.map((day) => ({
          day,
          value: progress.filter((r) => r.day_of_week === day).reduce((s, r) => s + (r.lessons_completed || 0), 0),
        })).filter((d) => d.value > 0));
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || localStorage.getItem("edu_user_name") || "Learner";
  const maxValue = Math.max(...weeklyData.map((d) => d.value), 1);
  const localProgress = Math.round((done.length / 22) * 100);

  const subjectEmojis: Record<string, string> = { Math: "🌀", Biology: "🧬", Literature: "📖", Chemistry: "⚗️" };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto px-4 pt-5">
          <Header name={userName} progress={localProgress || overallProgress} />

          <FadeIn>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-display font-bold text-foreground">Progress</h2>
            </div>
          </FadeIn>

          {/* Local Stats Cards */}
          <FadeIn delay={0.1}>
            <StaggerContainer className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: Target, value: done.length, label: "Lessons", color: "text-secondary", bg: "bg-secondary/10" },
                { icon: Zap, value: xp, label: "XP", color: "text-primary", bg: "bg-primary/10" },
                { icon: Flame, value: `${Math.min(done.length, 7)}d`, label: "Streak", color: "text-primary", bg: "bg-primary/10" },
              ].map((stat, i) => (
                <StaggerItem key={i}>
                  <motion.div whileHover={{ y: -2 }} className="bg-card rounded-xl p-3 border border-border/50 text-center shadow-card">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1.5`}>
                      <stat.icon size={14} className={stat.color} />
                    </div>
                    <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>

          {/* Achievements */}
          <FadeIn delay={0.2}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground">Achievements</h4>
                <span className="ml-auto text-[9px] text-muted-foreground">
                  {ACHIEVEMENTS.filter(a => a.threshold > 0 ? done.length >= a.threshold : a.threshold === -500 ? xp >= 500 : bookmarks.length >= 5).length}/{ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ACHIEVEMENTS.map((a, i) => {
                  const unlocked = a.threshold > 0 ? done.length >= a.threshold : a.threshold === -500 ? xp >= 500 : bookmarks.length >= 5;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className={`rounded-xl p-2 text-center border transition-all ${
                        unlocked ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/30 opacity-50"
                      }`}
                    >
                      <span className="text-lg block">{a.emoji}</span>
                      <p className="text-[9px] font-bold text-foreground mt-0.5">{a.title}</p>
                      <p className="text-[7px] text-muted-foreground">{a.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Cloud Stats */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-card mb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  <span className="text-[11px] font-bold text-foreground">Overview</span>
                </div>
                <div className="flex bg-muted/50 rounded-lg p-0.5">
                  <button className="bg-card rounded-md px-2.5 py-1 text-[10px] font-bold text-foreground shadow-sm">Weekly</button>
                  <button className="rounded-md px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">Month</button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-muted-foreground" size={20} />
                </div>
              ) : (
                <>
                  <div className="flex gap-6 mb-3">
                    <div>
                      <p className="text-xl font-bold text-foreground">{totalLessons || done.length}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">lessons</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{totalHours || Math.round(xp / 60)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">hours</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary">{overallProgress || localProgress}%</p>
                      <p className="text-[10px] text-muted-foreground font-medium">avg</p>
                    </div>
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
                              animate={{ width: `${Math.max((d.value / maxValue) * 100, 18)}%` }}
                              transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                              style={{ background: `linear-gradient(90deg, hsl(var(--primary) / ${0.6 + i * 0.08}), hsl(var(--edu-orange-light)))` }}
                            >
                              <span className="text-[9px] font-bold text-white">{d.value}</span>
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center py-3">
                      Complete lessons to see progress charts!
                    </p>
                  )}
                </>
              )}
            </div>
          </FadeIn>

          {/* Enrolled Courses */}
          <FadeIn delay={0.4}>
            <div className="mb-3">
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
                      transition={{ delay: 0.5 + i * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/course/${p.course_id}`)}
                      className="w-full bg-card rounded-xl p-3 border border-border/50 flex items-center gap-2.5 hover:border-primary/20 transition-all text-left shadow-card"
                    >
                      <div className="w-8 h-8 rounded-lg bg-edu-lavender flex items-center justify-center text-sm">
                        {subjectEmojis[p.course_subject || ""] || "📘"}
                      </div>
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
                  <p className="text-[11px] text-muted-foreground">No courses enrolled yet</p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Leaderboard teaser */}
          <FadeIn delay={0.5}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">🏆</div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-foreground">Leaderboard</h4>
                  <p className="text-[9px] text-muted-foreground">Top 10 students</p>
                </div>
                <div className="flex -space-x-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-muted border border-card flex items-center justify-center text-[8px]">👤</div>
                  ))}
                </div>
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
