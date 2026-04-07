import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check, Diamond, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

const CURIOSITY = [
  { id: "industry", label: "🏭 Your Industry", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", color: "bg-agni-orange" },
  { id: "general", label: "🌍 General", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", color: "bg-agni-purple" },
  { id: "crazy", label: "🤯 Crazy Future", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", color: "bg-agni-pink" },
  { id: "daily", label: "💼 Daily Work", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", color: "bg-agni-green" },
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
  const navigate = useNavigate();
  const { stats } = useGamification();
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
        <div className="max-w-md mx-auto px-4 pt-5 relative z-10">

          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Agni expression={loading ? "thinking" : results.length > 0 ? "excited" : "happy"} size={50} animate={true} />
                <div>
                  <h2 className="text-sm font-black text-foreground">Curiosity Spark</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">Hey {displayName} — discover something new!</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")} className="w-7 h-7 rounded-xl bg-card flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors" title="Profile">
                  <User size={12} className="text-muted-foreground" />
                </motion.button>
                <div className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2 py-0.5">
                  <Zap size={10} className="text-agni-green" />
                  <span className="text-[10px] font-black text-agni-green">{stats.xp}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-0.5">
                  <Diamond size={10} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{stats.gems}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Hero Banner */}
          <FadeIn delay={0.05}>
            <div className="rounded-2xl p-4 mb-4 relative overflow-hidden bg-gradient-to-br from-agni-purple/20 via-agni-pink/10 to-background border border-agni-purple/20">
              <div className="absolute top-2 right-3 opacity-20">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <Sparkles size={40} />
                </motion.div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={12} className="text-agni-purple" />
                <p className="text-micro text-agni-purple">AI-POWERED DISCOVERY</p>
              </div>
              <h3 className="text-base font-black text-foreground leading-tight mb-1">What's happening in AI? 🔮</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Tap a category below and let AI curate fresh insights just for you.
              </p>
            </div>
          </FadeIn>

          {/* Quick Spark Fact */}
          <FadeIn delay={0.1}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <h4 className="text-micro text-agni-gold">QUICK SPARK</h4>
                <div className="ml-auto flex gap-1">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopyFact} className="w-7 h-7 rounded-xl bg-muted/50 flex items-center justify-center">
                    {copied ? <Check size={10} className="text-agni-green" /> : <Copy size={10} className="text-muted-foreground" />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85, rotate: 180 }}
                    onClick={() => setSparkIdx((sparkIdx + 1) % SPARK_FACTS.length)}
                    className="w-7 h-7 rounded-xl bg-muted/50 flex items-center justify-center"
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
                  className="text-[11px] text-foreground/80 leading-relaxed font-semibold"
                >
                  {SPARK_FACTS[sparkIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Categories */}
          <StaggerContainer className="space-y-2.5">
            {CURIOSITY.map(cat => {
              const isActive = activeId === cat.id;
              return (
                <StaggerItem key={cat.id}>
                  <div>
                    <motion.button
                      whileTap={{ scale: 0.97, y: 2 }}
                      onClick={() => fetchCuriosity(cat)}
                      className={`w-full rounded-2xl p-4 border-2 text-left transition-all shadow-card ${
                        isActive ? "border-agni-green/40 bg-agni-green/5" : "border-border/30 bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shadow-md`}>
                            <span className="text-lg">{cat.label.split(" ")[0]}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-foreground">{cat.label.split(" ").slice(1).join(" ")}</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{cat.desc}</p>
                          </div>
                        </div>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isActive && loading ? "bg-agni-green/10" : isActive ? "bg-agni-green shadow-glow-green" : "bg-muted/50"
                        }`}>
                          {isActive && loading ? (
                            <Loader2 size={14} className="animate-spin text-agni-green" />
                          ) : (
                            <Zap size={14} className={isActive ? "text-white" : "text-muted-foreground"} />
                          )}
                        </div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isActive && loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 space-y-2 px-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 rounded-xl bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                          ))}
                        </motion.div>
                      )}
                      {isActive && error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 bg-agni-red/5 border border-agni-red/20 rounded-xl p-3">
                          <p className="text-[11px] text-agni-red font-semibold">{error}</p>
                          <button onClick={() => fetchCuriosity(cat)} className="mt-1.5 text-[10px] font-extrabold text-agni-green flex items-center gap-1">
                            <RefreshCw size={10} /> Try again
                          </button>
                        </motion.div>
                      )}
                      {isActive && !loading && results.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-2 overflow-hidden"
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
                              className="block bg-card rounded-xl p-3 border border-border/40 hover:border-agni-green/20 transition-all shadow-card"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-agni-green/10 flex items-center justify-center text-sm shrink-0">
                                  {typeIcons[r.type] || "📄"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11px] font-extrabold text-foreground block truncate">{r.title}</span>
                                  <p className="text-[9px] text-muted-foreground truncate font-semibold">{r.desc || ""}</p>
                                </div>
                                <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                              </div>
                            </motion.a>
                          ))}
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => fetchCuriosity(cat)}
                            className="flex items-center gap-1 text-[10px] font-extrabold text-agni-green bg-agni-green/10 border border-agni-green/20 rounded-xl px-3 py-2.5 mt-1 w-full justify-center"
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
