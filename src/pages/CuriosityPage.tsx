import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import { ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const CURIOSITY = [
  { id: "industry", label: "🏭 Your Industry", desc: "AI agents in semiconductor, manufacturing & HCL's world", query: "AI agents semiconductor manufacturing India 2026 latest", color: "from-primary to-edu-orange-light" },
  { id: "general", label: "🌍 General", desc: "What people are building with AI agents right now", query: "amazing AI agent projects people built 2026 showcase", color: "from-secondary to-accent" },
  { id: "crazy", label: "🤯 Crazy Future", desc: "Mind-bending futuristic agent applications", query: "most crazy futuristic AI agent applications autonomous 2026", color: "from-edu-dark to-foreground" },
  { id: "daily", label: "💼 Daily Work", desc: "How agents make employees' daily work easier", query: "AI agents automate daily office work productivity examples 2026", color: "from-edu-lavender to-secondary" },
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
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1024,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Search the web for: ${cat.query}\n\nThen compile findings into a JSON array of exactly 5 items. Each: "title" (string), "url" (string starting with https), "desc" (one sentence), "type" (tool/repo/article/video/news).\n\nRespond with ONLY the JSON array.` }]
        })
      });
      const data = await resp.json();
      let txt = "";
      for (const b of (data.content || [])) { if (b.type === "text" && b.text) txt += b.text; }
      const cleaned = txt.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) { setResults(parsed); setLoading(false); return; }
      }
      if (txt.trim()) { setResults([{ title: "Results found", url: "#", desc: txt.slice(0, 250), type: "article" }]); }
      else { setError("No results found. Try again!"); }
    } catch (e: any) {
      setError(e.message || "Failed to fetch. Try again!");
    }
    setLoading(false);
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header name={displayName} progress={0} />

        {/* Hero */}
        <div className="rounded-4xl p-6 mb-5 relative overflow-hidden shadow-elevated"
          style={{ background: "hsl(var(--edu-dark))" }}>
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white leading-tight mb-2">Curiosity<br/>Spark</h3>
            <p className="text-sm text-white/60 max-w-[240px] font-semibold">
              Discover what's happening in AI agents — get inspired!
            </p>
          </div>
          <div className="absolute top-4 right-4 text-6xl opacity-15 animate-float">🔮</div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {CURIOSITY.map(cat => {
            const isActive = activeId === cat.id;
            return (
              <div key={cat.id}>
                <button onClick={() => fetchCuriosity(cat)}
                  className={`w-full bg-card rounded-3xl p-4 border text-left transition-all shadow-card ${
                    isActive ? "border-primary shadow-card-hover" : "border-border hover:border-primary/30"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-foreground">{cat.label}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{cat.desc}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isActive && loading ? "bg-primary/10" : isActive ? "bg-primary shadow-card" : "bg-muted"
                    }`}>
                      {isActive && loading ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : (
                        <ArrowRight size={16} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                      )}
                    </div>
                  </div>
                </button>

                {isActive && loading && (
                  <div className="mt-2 ml-4 space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 rounded-2xl bg-muted animate-pulse" />
                    ))}
                  </div>
                )}

                {isActive && error && (
                  <div className="mt-2 ml-4 bg-destructive/5 border border-destructive/20 rounded-2xl p-3">
                    <p className="text-sm text-destructive font-semibold">{error}</p>
                    <button onClick={() => fetchCuriosity(cat)}
                      className="mt-2 text-xs font-bold text-primary flex items-center gap-1">
                      <RefreshCw size={12} /> Try again
                    </button>
                  </div>
                )}

                {isActive && !loading && results.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2">
                    {results.map((r: any, i: number) => (
                      <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer"
                        className="block bg-card rounded-2xl p-3 border border-border hover:shadow-card-hover transition-all shadow-card">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{typeIcons[r.type] || "📄"}</span>
                          <span className="text-sm font-bold text-foreground">{r.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6 font-semibold">{r.desc || ""}</p>
                      </a>
                    ))}
                    <button onClick={() => fetchCuriosity(cat)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5 mt-1">
                      <RefreshCw size={12} /> Refresh
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
