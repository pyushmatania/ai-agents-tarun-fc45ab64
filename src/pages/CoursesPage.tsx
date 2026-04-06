import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { ArrowRight, ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error && data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const subjects = [...new Set(courses.map((c) => c.subject))];
  const filtered = selectedSubject
    ? courses.filter((c) => c.subject === selectedSubject)
    : courses;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
        </div>

        {/* Hero */}
        <div className="bg-primary rounded-3xl p-6 mb-6 relative overflow-hidden">
          <h2 className="text-3xl font-extrabold text-primary-foreground leading-tight mb-4">
            My<br />courses
          </h2>
          <div className="flex gap-3">
            <div className="bg-card rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              📊 {subjects.length} Subjects
            </div>
            <div className="bg-card/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground">
              📚 {courses.length} Lessons
            </div>
          </div>
          <div className="absolute top-2 right-6 text-5xl opacity-70">🎓</div>
          <div className="absolute top-6 right-2 text-lg">⭐</div>
        </div>

        {/* Subject Tags */}
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

        {/* Course Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((course, index) => {
              const isDark = index % 2 === 0;
              return (
                <div
                  key={course.id}
                  className={`${isDark ? "bg-edu-dark" : "bg-edu-lavender"} rounded-3xl p-5 relative overflow-hidden`}
                >
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/20 flex items-center justify-center">
                    <ExternalLink size={14} className={isDark ? "text-card" : "text-foreground"} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{courseIcons[course.subject] || "📘"}</span>
                  </div>
                  <p className={`text-xs font-bold ${isDark ? "text-card" : "text-foreground"} opacity-70 tracking-wider mb-1`}>
                    {course.category}
                  </p>
                  <h3 className={`text-lg font-extrabold ${isDark ? "text-card" : "text-foreground"} mb-4 max-w-[220px]`}>
                    {course.title}
                  </h3>
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
                    <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-md">
                      <ArrowRight size={18} className="text-foreground" />
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
