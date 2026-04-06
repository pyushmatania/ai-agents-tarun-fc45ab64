import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ChevronDown, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

const ProgressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<ProgressWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; value: number }[]>([]);

  useEffect(() => {
    if (!user) return;
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

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Learner";
  const maxValue = Math.max(...weeklyData.map((d) => d.value), 1);

  const subjectEmojis: Record<string, string> = { Math: "🌀", Biology: "🧬", Literature: "📖", Chemistry: "⚗️" };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-5">
        <Header name={userName} progress={overallProgress} />

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-foreground">Progress</h2>
          <button className="glass rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground border border-border/50">
            All subjects <ChevronDown size={11} />
          </button>
        </div>

        {/* Stats */}
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
                  <p className="text-xl font-bold text-foreground">{totalLessons}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">lessons</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{totalHours}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">hours</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{overallProgress}%</p>
                  <p className="text-[10px] text-muted-foreground font-medium">avg</p>
                </div>
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
                            width: `${Math.max((d.value / maxValue) * 100, 18)}%`,
                            background: `linear-gradient(90deg, hsl(var(--primary) / ${0.6 + i * 0.08}), hsl(var(--edu-orange-light)))`,
                          }}
                        >
                          <span className="text-[9px] font-bold text-white">{d.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground text-center py-3">
                  Enroll in courses to start tracking progress!
                </p>
              )}
            </>
          )}
        </div>

        {/* Enrolled Courses */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-foreground mb-2">Enrolled courses</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-muted-foreground" size={18} />
            </div>
          ) : progressData.filter((p) => p.course_id).length > 0 ? (
            <div className="space-y-2">
              {progressData.filter((p) => p.course_id).map((p) => (
                <button
                  key={p.id}
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
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center shadow-card">
              <p className="text-[11px] text-muted-foreground">No courses enrolled yet</p>
            </div>
          )}
        </div>

        {/* Leaderboard teaser */}
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
      </div>
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default ProgressPage;
