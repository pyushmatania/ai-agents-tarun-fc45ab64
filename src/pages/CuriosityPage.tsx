import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import Header from "@/components/Header";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import { motion, AnimatePresence } from "framer-motion";
import heroCuriosity from "@/assets/hero-curiosity.png";

const CURIOSITY = [
  { id: "industry", label: "🏭 Your Industry", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", gradient: "from-orange-500/10 to-amber-500/5" },
  { id: "general", label: "🌍 General", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", gradient: "from-violet-500/10 to-purple-500/5" },
  { id: "crazy", label: "🤯 Crazy Future", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", gradient: "from-pink-500/10 to-rose-500/5" },
  { id: "daily", label: "💼 Daily Work", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", gradient: "from-emerald-500/10 to-teal-500/5" },
];

const SPARK_FACTS = [
  "TSMC uses AI agents for wafer yield optimization — catching defects that save millions per batch.",
  "A solo dev in Bangalore built a content agency with 0 employees and 8 AI agents — $15K/month revenue.",
  "Manus AI was acquired by Meta for $2 billion in Dec 2025.",
  "Your Monday morning? An agent already triaged your inbox and prepped your meeting briefs.",
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
  const [sparkIdx, setSparkIdx] = useState(0);
  const [copied, setCopied] = useState(false);

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

  const handleCopyFact = () => {
    navigator.clipboard.writeText(SPARK_FACTS[sparkIdx]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative">
        <FloatingShapes />
        <div className="max-w-md mx-auto px-4 pt-5 relative z-10">
          <Header name={displayName} progress={0} />

          {/* Hero Illustration */}
          <FadeIn delay={0.1}>
            <div className="rounded-2xl mb-4 relative overflow-hidden">
              <img
                src={heroCuriosity}
                alt="Curiosity Spark - discover AI knowledge"
                className="w-full h-44 object-cover rounded-2xl"
                width={800}
                height={512}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent rounded-2xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={10} className="text-secondary" />
                  <p className="text-[9px] font-bold text-secondary tracking-widest">AI-POWERED</p>
                </div>
                <h3 className="text-base font-display font-bold text-foreground leading-tight mb-0.5">Curiosity Spark</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tap a category and let AI curate the freshest insights for you.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Quick Spark Fact */}
          <FadeIn delay={0.15}>
            <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-primary" />
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Quick Spark</h4>
                <div className="ml-auto flex gap-1">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyFact} className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center">
                    {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-muted-foreground" />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSparkIdx((sparkIdx + 1) % SPARK_FACTS.length)}
                    className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center"
                  >
                    <RefreshCw size={10} className="text-muted-foreground" />
                  </motion.button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={sparkIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[11px] text-foreground/80 leading-relaxed"
                >
                  {SPARK_FACTS[sparkIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* How it works */}
          <FadeIn delay={0.2}>
            <div className="flex items-center gap-3 mb-4 px-1">
              {["Pick a topic", "AI generates", "Get inspired"].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-1">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{i + 1}</div>
                  <span className="text-[9px] text-muted-foreground font-medium">{s}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Categories */}
          <StaggerContainer className="space-y-2">
            {CURIOSITY.map(cat => {
              const isActive = activeId === cat.id;
              return (
                <StaggerItem key={cat.id}>
                  <div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fetchCuriosity(cat)}
                      className={`w-full rounded-xl p-3.5 border text-left transition-all shadow-card bg-gradient-to-r ${cat.gradient} ${
                        isActive ? "border-primary/30 shadow-glow-primary" : "border-border/40 hover:border-border"
                      }`}
                    >
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
                    </motion.button>

                    <AnimatePresence>
                      {isActive && loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 ml-3 space-y-1.5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                          ))}
                        </motion.div>
                      )}

                      {isActive && error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 ml-3 bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
                          <p className="text-[11px] text-destructive">{error}</p>
                          <button onClick={() => fetchCuriosity(cat)} className="mt-1.5 text-[10px] font-semibold text-primary flex items-center gap-1">
                            <RefreshCw size={10} /> Try again
                          </button>
                        </motion.div>
                      )}

                      {isActive && !loading && results.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1.5 overflow-hidden"
                        >
                          {results.map((r: any, i: number) => (
                            <motion.a
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              href={r.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-card rounded-xl p-3 border border-border/40 hover:border-primary/20 transition-all shadow-card"
                            >
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
                            </motion.a>
                          ))}
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => fetchCuriosity(cat)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 mt-1 w-full justify-center"
                          >
                            <RefreshCw size={10} /> Generate new results
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default CuriosityPage;
