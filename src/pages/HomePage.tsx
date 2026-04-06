import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, MoreHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const HomePage = () => {
  const { user } = useAuth();
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; lessons: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data && data.length > 0) {
        const lessons = data.reduce((sum, r) => sum + (r.lessons_completed || 0), 0);
        const hours = data.reduce((sum, r) => sum + Number(r.hours_spent || 0), 0);
        const avgProgress = Math.round(data.reduce((sum, r) => sum + (r.progress_percent || 0), 0) / data.length);

        setTotalLessons(lessons);
        setTotalHours(hours);
        setOverallProgress(avgProgress);

        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const byDay = dayOrder.map((day) => ({
          day,
          lessons: data
            .filter((r) => r.day_of_week === day)
            .reduce((sum, r) => sum + (r.lessons_completed || 0), 0),
        }));
        setWeeklyData(byDay.filter((d) => d.lessons > 0));
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const maxLessons = Math.max(...weeklyData.map((d) => d.lessons), 1);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header name={displayName} progress={overallProgress} />

        {/* Featured Card */}
        <div className="bg-secondary rounded-3xl p-6 mb-5 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-secondary-foreground leading-tight mb-2">
              A series of<br />Olympiads
            </h3>
            <p className="text-sm text-secondary-foreground/80 mb-6 max-w-[200px]">
              A series of <span className="text-edu-orange">Olympiads</span> for erudite people from all over the world
            </p>
            <button className="w-12 h-12 rounded-full bg-edu-dark flex items-center justify-center">
              <ArrowRight size={20} className="text-card" />
            </button>
          </div>
          <div className="absolute top-4 right-4 text-6xl opacity-80">🏆</div>
          <div className="absolute bottom-6 right-8 text-sm text-secondary-foreground/50 font-mono">
            y = ?
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-edu-lavender flex items-center justify-center">
              📚
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lessons</p>
              <p className="text-2xl font-extrabold text-foreground">
                {loading ? <Loader2 size={20} className="animate-spin" /> : totalLessons}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-edu-orange/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              ⏱️
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="text-2xl font-extrabold text-foreground">
                {loading ? <Loader2 size={20} className="animate-spin" /> : totalHours}
              </p>
            </div>
          </div>
        </div>

        {/* Sign in prompt if not authenticated */}
        {!user && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 text-center">
            <p className="text-sm text-foreground mb-2">Sign in to save your progress across devices</p>
            <a href="/auth" className="text-primary font-bold text-sm underline">Sign in →</a>
          </div>
        )}

        {/* Progress Performance */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-foreground">Progress performance</h4>
            <button>
              <MoreHorizontal size={18} className="text-muted-foreground" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : weeklyData.length > 0 ? (
            <div className="space-y-2.5">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-8">{d.day}</span>
                  <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(d.lessons / maxLessons) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-primary-foreground">{d.lessons}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No progress data yet. Start a course to track your learning!
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default HomePage;
