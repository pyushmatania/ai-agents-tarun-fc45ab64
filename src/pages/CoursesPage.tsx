import BottomNav from "@/components/BottomNav";
import { ArrowRight, ChevronLeft, ExternalLink } from "lucide-react";

const subjects = [
  { emoji: "📖", name: "Literature" },
  { emoji: "🏛️", name: "Math" },
  { emoji: "🔬", name: "Bio" },
];

const courses = [
  {
    category: "GEOMETRY IN ACTION",
    title: "Creative approaches to plane shapes",
    students: 43,
    bg: "bg-edu-dark",
    textColor: "text-card",
    icon: "🌀",
  },
  {
    category: "THE MICROCOSM AROUND US",
    title: "Discoveries in cell biology",
    students: 12,
    bg: "bg-edu-lavender",
    textColor: "text-foreground",
    icon: "🧬",
  },
];

const CoursesPage = () => {
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
              📊 12 Subjects
            </div>
            <div className="bg-card/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground">
              📚 43 Lessons
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute top-2 right-6 text-5xl opacity-70">🎓</div>
          <div className="absolute top-6 right-2 text-lg">⭐</div>
        </div>

        {/* Subject Tags */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          {subjects.map((s) => (
            <div
              key={s.name}
              className="bg-card rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-foreground border border-border whitespace-nowrap"
            >
              <span>{s.emoji}</span>
              {s.name}
            </div>
          ))}
        </div>

        {/* Course Cards */}
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.title}
              className={`${course.bg} rounded-3xl p-5 relative overflow-hidden`}
            >
              {/* Edit button */}
              <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/20 flex items-center justify-center">
                <ExternalLink size={14} className={course.textColor} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{course.icon}</span>
              </div>
              <p className={`text-xs font-bold ${course.textColor} opacity-70 tracking-wider mb-1`}>
                {course.category}
              </p>
              <h3 className={`text-lg font-extrabold ${course.textColor} mb-4 max-w-[220px]`}>
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
                  <span className={`text-sm font-bold ${course.textColor}`}>
                    +{course.students}
                  </span>
                </div>
                <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-md">
                  <ArrowRight size={18} className="text-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CoursesPage;
