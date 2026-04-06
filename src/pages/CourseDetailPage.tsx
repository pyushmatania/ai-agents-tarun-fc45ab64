import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ChevronLeft, CheckCircle2, Circle, Clock, Loader2, BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  lesson_order: number;
  duration_minutes: number | null;
}

interface Course {
  id: string;
  title: string;
  category: string;
  subject: string;
  description: string | null;
}

const subjectEmojis: Record<string, string> = {
  Math: "🌀", Biology: "🧬", Literature: "📖", Chemistry: "⚗️",
};

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetchData = async () => {
      const [courseRes, lessonsRes, completionsRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", id).single(),
        supabase.from("lessons").select("*").eq("course_id", id).order("lesson_order"),
        supabase.from("lesson_completions").select("lesson_id").eq("user_id", user.id),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (lessonsRes.data) setLessons(lessonsRes.data);
      if (completionsRes.data) {
        const lessonIds = new Set(lessonsRes.data?.map((l) => l.id) || []);
        setCompletedIds(new Set(completionsRes.data.filter((c) => lessonIds.has(c.lesson_id)).map((c) => c.lesson_id)));
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const toggleLesson = async (lessonId: string) => {
    if (!user) return;
    setTogglingId(lessonId);

    try {
      if (completedIds.has(lessonId)) {
        const { error } = await supabase
          .from("lesson_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);
        if (error) throw error;
        setCompletedIds((prev) => { const next = new Set(prev); next.delete(lessonId); return next; });
      } else {
        const { error } = await supabase
          .from("lesson_completions")
          .insert({ user_id: user.id, lesson_id: lessonId });
        if (error) throw error;
        setCompletedIds((prev) => new Set([...prev, lessonId]));
        toast.success("Lesson completed! 🎉");
      }

      // Update user_progress for this course
      const newCompleted = completedIds.has(lessonId) ? completedIds.size - 1 : completedIds.size + 1;
      const totalLessons = lessons.length;
      const pct = totalLessons > 0 ? Math.round((newCompleted / totalLessons) * 100) : 0;
      const totalMinutes = lessons
        .filter((l) => completedIds.has(l.id) !== (l.id === lessonId))
        .filter((l) => (l.id === lessonId ? !completedIds.has(l.id) : completedIds.has(l.id)))
        .reduce((s, l) => s + (l.duration_minutes || 0), 0);

      // Simpler: recalculate based on new state
      const willBeCompleted = new Set(completedIds);
      if (willBeCompleted.has(lessonId)) willBeCompleted.delete(lessonId);
      else willBeCompleted.add(lessonId);

      const hoursSpent = lessons
        .filter((l) => willBeCompleted.has(l.id))
        .reduce((s, l) => s + (l.duration_minutes || 0), 0) / 60;

      await supabase
        .from("user_progress")
        .update({
          lessons_completed: willBeCompleted.size,
          progress_percent: Math.round((willBeCompleted.size / totalLessons) * 100),
          hours_spent: Math.round(hoursSpent * 10) / 10,
        })
        .eq("user_id", user.id)
        .eq("course_id", id);
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setTogglingId(null);
    }
  };

  const completedCount = completedIds.size;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const totalDuration = lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground font-bold">Course not found</p>
        <button onClick={() => navigate("/courses")} className="text-primary font-semibold">Back to courses</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground truncate flex-1">{course.subject}</h2>
        </div>

        {/* Course Hero */}
        <div className="bg-secondary rounded-3xl p-5 mb-5 relative overflow-hidden">
          <div className="text-4xl mb-3">{subjectEmojis[course.subject] || "📘"}</div>
          <p className="text-xs font-bold text-secondary-foreground/60 tracking-wider mb-1">{course.category}</p>
          <h3 className="text-xl font-extrabold text-secondary-foreground mb-2">{course.title}</h3>
          {course.description && (
            <p className="text-sm text-secondary-foreground/70 mb-4">{course.description}</p>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-secondary-foreground/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-sm font-extrabold text-secondary-foreground">{progressPct}%</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <BookOpen size={18} className="mx-auto text-primary mb-1" />
            <p className="text-lg font-extrabold text-foreground">{lessons.length}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <CheckCircle2 size={18} className="mx-auto text-green-500 mb-1" />
            <p className="text-lg font-extrabold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <Clock size={18} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-extrabold text-foreground">{totalDuration}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
        </div>

        {/* Lessons List */}
        <h3 className="font-bold text-foreground mb-3">Lessons</h3>
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const done = completedIds.has(lesson.id);
            const toggling = togglingId === lesson.id;

            return (
              <button
                key={lesson.id}
                onClick={() => toggleLesson(lesson.id)}
                disabled={toggling}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                  done
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border hover:bg-muted/50"
                }`}
              >
                {toggling ? (
                  <Loader2 size={22} className="animate-spin text-primary shrink-0" />
                ) : done ? (
                  <CheckCircle2 size={22} className="text-primary shrink-0" />
                ) : (
                  <Circle size={22} className="text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${done ? "text-foreground" : "text-foreground"}`}>
                    {lesson.lesson_order}. {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{lesson.duration_minutes || 15} min</p>
                </div>
                {done && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Done</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CourseDetailPage;
