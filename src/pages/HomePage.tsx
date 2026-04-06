import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, MoreHorizontal } from "lucide-react";
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
  // Simple weekly mock based on done count
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

        {/* Featured Card */}
        <div className="bg-secondary rounded-3xl p-6 mb-5 relative overflow-hidden cursor-pointer" onClick={() => navigate("/courses")}>
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-secondary-foreground leading-tight mb-2">
              AI Agents<br />Masterclass
            </h3>
            <p className="text-sm text-secondary-foreground/80 mb-6 max-w-[220px]">
              Learn to build <span className="text-edu-orange">autonomous AI systems</span> for enterprise & startups — powered by an AI tutor
            </p>
            <button className="w-12 h-12 rounded-full bg-edu-dark flex items-center justify-center">
              <ArrowRight size={20} className="text-card" />
            </button>
          </div>
          <div className="absolute top-4 right-4 text-6xl opacity-80">🧠</div>
          <div className="absolute bottom-6 right-8 text-sm text-secondary-foreground/50 font-mono">
            {done.length}/{totalLessons}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-edu-lavender flex items-center justify-center mx-auto mb-1">📚</div>
            <p className="text-2xl font-extrabold text-foreground">{done.length}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-edu-orange/30 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1">⚡</div>
            <p className="text-2xl font-extrabold text-foreground">{xp}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-1">⏱️</div>
            <p className="text-2xl font-extrabold text-foreground">{hours}</p>
            <p className="text-xs text-muted-foreground">Hours</p>
          </div>
        </div>

        {/* Sign in prompt */}
        {!user && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 text-center">
            <p className="text-sm text-foreground mb-2">Sign in to save progress across devices</p>
            <a href="/auth" className="text-primary font-bold text-sm underline">Sign in →</a>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => navigate("/curiosity")} className="bg-edu-dark rounded-2xl p-4 text-left relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl opacity-20">🔮</div>
            <p className="text-xs font-bold text-card/60 mb-1">GET INSPIRED</p>
            <p className="text-sm font-extrabold text-card">Curiosity Spark</p>
          </button>
          <button onClick={() => navigate("/mega-prompt")} className="bg-edu-lavender rounded-2xl p-4 text-left relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl opacity-20">📋</div>
            <p className="text-xs font-bold text-foreground/60 mb-1">THE PROMPT</p>
            <p className="text-sm font-extrabold text-foreground">Mega Prompt</p>
          </button>
        </div>

        {/* Progress Performance */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-foreground">Progress performance</h4>
            <button><MoreHorizontal size={18} className="text-muted-foreground" /></button>
          </div>

          {weeklyData.length > 0 ? (
            <div className="space-y-2.5">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-8">{d.day}</span>
                  <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                    <div className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(d.lessons / maxLessons) * 100}%` }}>
                      <span className="text-xs font-bold text-primary-foreground">{d.lessons}</span>
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
