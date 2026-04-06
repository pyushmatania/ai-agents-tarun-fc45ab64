import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ArrowRight, MoreHorizontal } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header name="Jacob" progress={76} />

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
          {/* Decorative elements */}
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
              <p className="text-2xl font-extrabold text-foreground">78</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-edu-orange/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              ⏱️
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="text-2xl font-extrabold text-foreground">43</p>
            </div>
          </div>
        </div>

        {/* Progress Performance */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-foreground">Progress performance</h4>
            <button>
              <MoreHorizontal size={18} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-1 mb-3 h-16 items-end">
            {[
              { h: "60%", color: "bg-primary" },
              { h: "80%", color: "bg-primary" },
              { h: "45%", color: "bg-secondary" },
              { h: "70%", color: "bg-secondary" },
              { h: "30%", color: "bg-muted" },
              { h: "50%", color: "bg-muted" },
            ].map((bar, i) => (
              <div
                key={i}
                className={`flex-1 ${bar.color} rounded-t-lg transition-all`}
                style={{ height: bar.h }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              June<br />
              <span className="font-semibold text-foreground">23 lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
              July<br />
              <span className="font-semibold text-foreground">43 lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted inline-block" />
              August<br />
              <span className="font-semibold text-foreground">12 lessons</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default HomePage;
