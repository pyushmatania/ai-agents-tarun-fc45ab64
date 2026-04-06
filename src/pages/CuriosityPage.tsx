import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import { ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const CURIOSITY = [
  { id: "industry", label: "🏭 Your Industry", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest" },
  { id: "general", label: "🌍 General", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase" },
  { id: "crazy", label: "🤯 Crazy Future", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026" },
  { id: "daily", label: "💼 Daily Work", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026" },
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
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-5">
        <Header name={displayName} progress={0} />

        {/* Hero */}
        <div className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(228 20% 14%), hsl(228 20% 10%))" }}>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-white/40 tracking-widest mb-0.5">DISCOVER</p>
            <h3 className="text-base font-display font-bold text-white leading-tight mb-1">Curiosity Spark</h3>
            <p className="text-[11px] text-white/50 max-w-[220px] leading-relaxed">
              Explore what's happening in AI agents — get inspired!
            </p>
          </div>
          <div className="absolute top-3 right-3 text-3xl opacity-10 animate-float">🔮</div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {CURIOSITY.map(cat => {
            const isActive = activeId === cat.id;
            return (
              <div key={cat.id}>
                <button onClick={() => fetchCuriosity(cat)}
                  className={`w-full bg-card rounded-xl p-3 border text-left transition-all shadow-card ${
                    isActive ? "border-primary/30 shadow-glow-primary" : "border-border/50 hover:border-border"
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
                        <ArrowRight size={13} className={isActive ? "text-white" : "text-muted-foreground"} />
                      )}
                    </div>
                  </div>
                </button>

                {isActive && loading && (
                  <div className="mt-1.5 ml-3 space-y-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 rounded-lg bg-muted/30 animate-pulse" />
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
                  <div className="mt-1.5 ml-3 space-y-1.5">
                    {results.map((r: any, i: number) => (
                      <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer"
                        className="block bg-card rounded-lg p-2.5 border border-border/50 hover:border-primary/20 transition-all shadow-card">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{typeIcons[r.type] || "📄"}</span>
                          <span className="text-[11px] font-semibold text-foreground">{r.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 ml-5">{r.desc || ""}</p>
                      </a>
                    ))}
                    <button onClick={() => fetchCuriosity(cat)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/5 border border-primary/20 rounded-md px-2.5 py-1 mt-1">
                      <RefreshCw size={10} /> Refresh
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
