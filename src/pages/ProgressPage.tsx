import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ChevronDown, Eye } from "lucide-react";

const weeklyData = [
  { day: "Mon", value: 14, max: 50 },
  { day: "Tue", value: 39, max: 50 },
  { day: "Wed", value: 48, max: 50 },
  { day: "Thr", value: 24, max: 50 },
  { day: "Fri", value: 22, max: 50 },
];

const ProgressPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header name="Jacob" progress={76} />

        <h2 className="text-2xl font-extrabold text-foreground mb-4">Progress</h2>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5">
          <button className="bg-card rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground border border-border">
            📊 All subjects
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-3xl p-5 border border-border mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                📊
              </div>
            </div>
            <div className="flex bg-muted rounded-full p-1">
              <button className="bg-card rounded-full px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                Weekly
              </button>
              <button className="rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground">
                Month
              </button>
            </div>
          </div>
          <div className="flex gap-6 mb-5">
            <div>
              <p className="text-3xl font-extrabold text-foreground">48</p>
              <p className="text-xs text-muted-foreground">lessons</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">hours</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-3">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground w-8">{d.day}</span>
                <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(d.value / d.max) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-primary-foreground">{d.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

        {/* Rating of Students */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
              🏆
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-foreground">Rating of students</h4>
              <p className="text-xs text-muted-foreground">10 best students</p>
            </div>
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs"
                >
                  👤
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProgressPage;
