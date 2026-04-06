import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, MoreHorizontal, Zap, Clock, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;

  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const totalLessons = 21;
  const overallProgress = Math.round((done.length / totalLessons) * 100);
  const hours = Math.round(xp / 60);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeklyData = days.map((day, i) => ({
    day,
    lessons: Math.min(done.length > i * 4 ? Math.floor(done.length / (i + 1)) : 0, 10),
  })).filter(d => d.lessons > 0);
  const maxLessons = Math.max(...weeklyData.map(d => d.lessons), 1);

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header name={displayName} progress={overallProgress} />

        {/* Featured Card — Lavender/Purple hero */}
        <div
          className="relative rounded-4xl p-6 mb-5 overflow-hidden cursor-pointer shadow-elevated"
          style={{ background: "linear-gradient(135deg, hsl(var(--secondary)), hsl(250 55% 60%))" }}
          onClick={() => navigate("/courses")}
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white leading-tight mb-2">
              AI Agents<br />Masterclass
            </h3>
            <p className="text-sm text-white/80 mb-6 max-w-[220px]">
              Learn to build <span className="text-edu-peach font-bold">autonomous AI systems</span> for enterprise & startups
            </p>
            <button className="w-12 h-12 rounded-full bg-edu-dark flex items-center justify-center shadow-card hover:scale-105 transition-transform">
              <ArrowRight size={20} className="text-white" />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-3 right-4 text-6xl opacity-30 animate-float">🏆</div>
          <div className="absolute bottom-3 right-6 text-sm text-white/40 font-mono font-bold">
            {done.length}/{totalLessons}
          </div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-3xl p-4 border border-border text-center shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-edu-lavender flex items-center justify-center mx-auto mb-2">
              <BookOpen size={18} className="text-secondary" />
            </div>
            <p className="text-2xl font-black text-foreground">{done.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">Lessons</p>
          </div>
          <div className="bg-card rounded-3xl p-4 border-2 border-primary/20 text-center shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-edu-peach flex items-center justify-center mx-auto mb-2">
              <Zap size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{xp}</p>
            <p className="text-xs text-muted-foreground font-semibold">XP</p>
          </div>
          <div className="bg-card rounded-3xl p-4 border border-border text-center shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-edu-mint flex items-center justify-center mx-auto mb-2">
              <Clock size={18} className="text-green-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{hours}</p>
            <p className="text-xs text-muted-foreground font-semibold">Hours</p>
          </div>
        </div>

        {/* Sign in prompt */}
        {!user && (
          <div className="bg-card border border-primary/20 rounded-3xl p-4 mb-5 text-center shadow-card">
            <p className="text-sm text-foreground mb-2 font-semibold">Sign in to save progress across devices</p>
            <a href="/auth" className="text-primary font-bold text-sm underline">Sign in →</a>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => navigate("/curiosity")}
            className="bg-edu-dark rounded-3xl p-5 text-left relative overflow-hidden shadow-elevated hover:scale-[1.02] transition-transform">
            <div className="absolute top-3 right-3 text-3xl opacity-15">🔮</div>
            <p className="text-[10px] font-black text-white/50 mb-1 tracking-widest">GET INSPIRED</p>
            <p className="text-sm font-extrabold text-white">Curiosity Spark</p>
          </button>
          <button onClick={() => navigate("/mega-prompt")}
            className="bg-edu-lavender rounded-3xl p-5 text-left relative overflow-hidden shadow-card hover:scale-[1.02] transition-transform">
            <div className="absolute top-3 right-3 text-3xl opacity-15">📋</div>
            <p className="text-[10px] font-black text-foreground/40 mb-1 tracking-widest">THE PROMPT</p>
            <p className="text-sm font-extrabold text-foreground">Mega Prompt</p>
          </button>
        </div>

        {/* Progress Performance */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-foreground">Progress performance</h4>
            <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </button>
          </div>

          {weeklyData.length > 0 ? (
            <div className="space-y-2.5">
              {weeklyData.map((d, i) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-8">{d.day}</span>
                  <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{
                        width: `${Math.max((d.lessons / maxLessons) * 100, 15)}%`,
                        background: i % 2 === 0
                          ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--edu-orange-light)))"
                          : "linear-gradient(90deg, hsl(var(--edu-orange-light)), hsl(var(--primary)))",
                      }}
                    >
                      <span className="text-xs font-black text-white">{d.lessons}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No progress yet. Start a lesson to track your learning!
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default HomePage;
