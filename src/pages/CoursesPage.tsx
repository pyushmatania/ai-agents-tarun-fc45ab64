import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, ChevronLeft, ExternalLink, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  category: string;
  subject: string;
  description: string | null;
  student_count: number | null;
}

const subjectEmojis: Record<string, string> = {
  Literature: "📖",
  Math: "🏛️",
  Biology: "🔬",
  Chemistry: "⚗️",
};

const courseIcons: Record<string, string> = {
  Math: "🌀",
  Biology: "🧬",
  Literature: "📖",
  Chemistry: "⚗️",
};

const dayOfWeek = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
};

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [coursesRes, progressRes] = await Promise.all([
        supabase.from("courses").select("*"),
        user
          ? supabase.from("user_progress").select("course_id").eq("user_id", user.id)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!coursesRes.error && coursesRes.data) setCourses(coursesRes.data);
      if (!progressRes.error && progressRes.data) {
        setEnrolledCourseIds(new Set(progressRes.data.map((r) => r.course_id).filter(Boolean) as string[]));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (course: Course) => {
    if (!user) return;
    setEnrollingId(course.id);

    try {
      const { error } = await supabase.from("user_progress").insert({
        user_id: user.id,
        course_id: course.id,
        lessons_completed: 0,
        hours_spent: 0,
        progress_percent: 0,
        day_of_week: dayOfWeek(),
      });

      if (error) throw error;

      setEnrolledCourseIds((prev) => new Set([...prev, course.id]));
      toast.success(`Enrolled in "${course.title}"!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to enroll");
    } finally {
      setEnrollingId(null);
    }
  };

  const subjects = [...new Set(courses.map((c) => c.subject))];
  const filtered = selectedSubject
    ? courses.filter((c) => c.subject === selectedSubject)
    : courses;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
        </div>

        <div className="bg-primary rounded-3xl p-6 mb-6 relative overflow-hidden">
          <h2 className="text-3xl font-extrabold text-primary-foreground leading-tight mb-4">
            My<br />courses
          </h2>
          <div className="flex gap-3">
            <div className="bg-card rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              📊 {subjects.length} Subjects
            </div>
            <div className="bg-card/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground">
              📚 {enrolledCourseIds.size} Enrolled
            </div>
          </div>
          <div className="absolute top-2 right-6 text-5xl opacity-70">🎓</div>
          <div className="absolute top-6 right-2 text-lg">⭐</div>
        </div>

        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold whitespace-nowrap border ${
              !selectedSubject ? "bg-foreground text-card border-foreground" : "bg-card text-foreground border-border"
            }`}
          >
            All
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s === selectedSubject ? null : s)}
              className={`rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold whitespace-nowrap border ${
                s === selectedSubject ? "bg-foreground text-card border-foreground" : "bg-card text-foreground border-border"
              }`}
            >
              <span>{subjectEmojis[s] || "📘"}</span>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((course, index) => {
              const isDark = index % 2 === 0;
              const isEnrolled = enrolledCourseIds.has(course.id);
              const isEnrolling = enrollingId === course.id;

              return (
                <div
                  key={course.id}
                  className={`${isDark ? "bg-edu-dark" : "bg-edu-lavender"} rounded-3xl p-5 relative overflow-hidden`}
                >
                  {/* Enrolled badge */}
                  {isEnrolled && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Enrolled
                    </div>
                  )}
                  {!isEnrolled && (
                    <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/20 flex items-center justify-center">
                      <ExternalLink size={14} className={isDark ? "text-card" : "text-foreground"} />
                    </button>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{courseIcons[course.subject] || "📘"}</span>
                  </div>
                  <p className={`text-xs font-bold ${isDark ? "text-card" : "text-foreground"} opacity-70 tracking-wider mb-1`}>
                    {course.category}
                  </p>
                  <h3 className={`text-lg font-extrabold ${isDark ? "text-card" : "text-foreground"} mb-1 max-w-[220px]`}>
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className={`text-xs ${isDark ? "text-card/70" : "text-foreground/60"} mb-3 line-clamp-2`}>
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs"
                          >
                            👤
                          </div>
                        ))}
                      </div>
                      <span className={`text-sm font-bold ${isDark ? "text-card" : "text-foreground"}`}>
                        +{course.student_count || 0}
                      </span>
                    </div>
                    <button
                      onClick={() => !isEnrolled && handleEnroll(course)}
                      disabled={isEnrolled || isEnrolling}
                      className={`h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isEnrolled
                          ? "bg-green-500/20 w-10 cursor-default"
                          : "bg-card px-4 gap-2 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isEnrolling ? (
                        <Loader2 size={18} className="animate-spin text-foreground" />
                      ) : isEnrolled ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <>
                          <span className="text-sm font-bold text-foreground">Enroll</span>
                          <ArrowRight size={16} className="text-foreground" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default CoursesPage;
