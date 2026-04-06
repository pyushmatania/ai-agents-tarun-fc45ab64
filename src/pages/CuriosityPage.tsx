import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FloatingShapes from "@/components/illustrations/FloatingShapes";

const CURIOSITY = [
  { id: "industry", label: "🏭 Your Industry", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", gradient: "from-orange-500/10 to-amber-500/5" },
  { id: "general", label: "🌍 General", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", gradient: "from-violet-500/10 to-purple-500/5" },
  { id: "crazy", label: "🤯 Crazy Future", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", gradient: "from-pink-500/10 to-rose-500/5" },
  { id: "daily", label: "💼 Daily Work", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", gradient: "from-emerald-500/10 to-teal-500/5" },
];

const typeIcons: Record<string, string> = { tool: "🔧", repo: "📦", article: "📰", video: "🎬", news: "📡" };

const CuriosityPage = () => {
  const { user } = useAuth();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCuriosity = async (cat: typeof CURIOSITY[0]) => {
    setActiveId(cat.id);
    setResults([]);
    setError("");
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-curiosity", {
        body: { query: cat.query, category: cat.id },
      });
      if (fnError) throw new Error(fnError.message);
      const items = data?.items || [];
      if (items.length > 0) setResults(items);
      else setError("No results found. Try again!");
    } catch (e: any) {
      setError(e.message || "Failed to fetch. Try again!");
    }
    setLoading(false);
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24 relative">
      <FloatingShapes />
      <div className="max-w-md mx-auto px-4 pt-5 relative z-10">
        <Header name={displayName} progress={0} />

        {/* Hero */}
        <div className="rounded-2xl p-4 mb-4 relative overflow-hidden border border-border/30"
          style={{ background: "linear-gradient(135deg, hsl(258 40% 18%), hsl(228 20% 10%))" }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center text-2xl shrink-0">
              🔮
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={10} className="text-secondary" />
                <p className="text-[9px] font-bold text-secondary/70 tracking-widest">AI-POWERED</p>
              </div>
              <h3 className="text-base font-display font-bold text-white leading-tight mb-1">Curiosity Spark</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Tap a category and let AI curate the freshest insights for you.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-secondary/5" />
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-primary/5" />
        </div>

        {/* How it works */}
        <div className="flex items-center gap-3 mb-4 px-1">
          {["Pick a topic", "AI generates", "Get inspired"].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{i + 1}</div>
              <span className="text-[9px] text-muted-foreground font-medium">{s}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {CURIOSITY.map(cat => {
            const isActive = activeId === cat.id;
            return (
              <div key={cat.id}>
                <button onClick={() => fetchCuriosity(cat)}
                  className={`w-full rounded-xl p-3.5 border text-left transition-all shadow-card bg-gradient-to-r ${cat.gradient} ${
                    isActive ? "border-primary/30 shadow-glow-primary" : "border-border/40 hover:border-border"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{cat.label}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{cat.desc}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive && loading ? "bg-primary/10" : isActive ? "bg-primary" : "bg-muted/50"
                    }`}>
                      {isActive && loading ? (
                        <Loader2 size={13} className="animate-spin text-primary" />
                      ) : (
                        <Zap size={13} className={isActive ? "text-white" : "text-muted-foreground"} />
                      )}
                    </div>
                  </div>
                </button>

                {isActive && loading && (
                  <div className="mt-1.5 ml-3 space-y-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                )}

                {isActive && error && (
                  <div className="mt-1.5 ml-3 bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
                    <p className="text-[11px] text-destructive">{error}</p>
                    <button onClick={() => fetchCuriosity(cat)} className="mt-1.5 text-[10px] font-semibold text-primary flex items-center gap-1">
                      <RefreshCw size={10} /> Try again
                    </button>
                  </div>
                )}

                {isActive && !loading && results.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {results.map((r: any, i: number) => (
                      <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer"
                        className="block bg-card rounded-xl p-3 border border-border/40 hover:border-primary/20 transition-all shadow-card">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm shrink-0">
                            {typeIcons[r.type] || "📄"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-semibold text-foreground block truncate">{r.title}</span>
                            <p className="text-[9px] text-muted-foreground truncate">{r.desc || ""}</p>
                          </div>
                          <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                        </div>
                      </a>
                    ))}
                    <button onClick={() => fetchCuriosity(cat)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 mt-1 w-full justify-center">
                      <RefreshCw size={10} /> Generate new results
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default CuriosityPage;
