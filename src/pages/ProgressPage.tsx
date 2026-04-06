import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ChevronDown, Eye, Loader2 } from "lucide-react";
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
      // Get progress with course info
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      const { data: courses } = await supabase.from("courses").select("id, title, subject");

      if (progress && courses) {
        const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
        const enriched = progress.map((p) => ({
          ...p,
          course_title: p.course_id ? courseMap[p.course_id]?.title : undefined,
          course_subject: p.course_id ? courseMap[p.course_id]?.subject : undefined,
        }));
        setProgressData(enriched);

        const lessons = progress.reduce((s, r) => s + (r.lessons_completed || 0), 0);
        const hours = progress.reduce((s, r) => s + Number(r.hours_spent || 0), 0);
        const avg = progress.length > 0 ? Math.round(progress.reduce((s, r) => s + (r.progress_percent || 0), 0) / progress.length) : 0;

        setTotalLessons(lessons);
        setTotalHours(hours);
        setOverallProgress(avg);

        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const byDay = dayOrder.map((day) => ({
          day,
          value: progress.filter((r) => r.day_of_week === day).reduce((s, r) => s + (r.lessons_completed || 0), 0),
        })).filter((d) => d.value > 0);
        setWeeklyData(byDay);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Learner";
  const maxValue = Math.max(...weeklyData.map((d) => d.value), 1);

  const subjectEmojis: Record<string, string> = {
    Math: "🌀", Biology: "🧬", Literature: "📖", Chemistry: "⚗️",
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header name={userName} progress={overallProgress} />

        <h2 className="text-2xl font-extrabold text-foreground mb-4">Progress</h2>

        <div className="flex items-center gap-2 mb-5">
          <button className="bg-card rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground border border-border">
            📊 All subjects
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-card rounded-3xl p-5 border border-border mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">📊</div>
            <div className="flex bg-muted rounded-full p-1">
              <button className="bg-card rounded-full px-3 py-1 text-xs font-bold text-foreground shadow-sm">Weekly</button>
              <button className="rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground">Month</button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : (
            <>
              <div className="flex gap-6 mb-5">
                <div>
                  <p className="text-3xl font-extrabold text-foreground">{totalLessons}</p>
                  <p className="text-xs text-muted-foreground">lessons</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground">{totalHours}</p>
                  <p className="text-xs text-muted-foreground">hours</p>
                </div>
              </div>

              {weeklyData.length > 0 ? (
                <div className="space-y-3">
                  {weeklyData.map((d) => (
                    <div key={d.day} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground w-8">{d.day}</span>
                      <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${(d.value / maxValue) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-primary-foreground">{d.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Enroll in courses to start tracking progress!
                </p>
              )}
            </>
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <Eye size={14} className="text-muted-foreground" />
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-edu-dark" />
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="w-2 h-2 rounded-full bg-muted" />
          </div>
        </div>

        {/* Enrolled Courses Breakdown */}
        <div className="mb-5">
          <h3 className="font-bold text-foreground mb-3">Enrolled courses</h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : progressData.filter((p) => p.course_id).length > 0 ? (
            <div className="space-y-3">
              {progressData.filter((p) => p.course_id).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/course/${p.course_id}`)}
                  className="w-full bg-card rounded-2xl p-4 border border-border flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-edu-lavender flex items-center justify-center text-lg">
                    {subjectEmojis[p.course_subject || ""] || "📘"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{p.course_title || "Course"}</p>
                    <p className="text-xs text-muted-foreground">{p.lessons_completed || 0} lessons • {Number(p.hours_spent || 0)}h</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-extrabold text-primary">{p.progress_percent || 0}%</p>
                    <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress_percent || 0}%` }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">🏆</div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground">Rating of students</h4>
              <p className="text-xs text-muted-foreground">10 best students</p>
            </div>
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">👤</div>
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
