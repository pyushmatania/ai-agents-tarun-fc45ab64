import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check, Diamond, User, Heart, Flame, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

const CURIOSITY = [
  { id: "industry", label: "Your Industry", emoji: "🏭", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", color: "#FF9600" },
  { id: "general", label: "General", emoji: "🌍", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", color: "#CE82FF" },
  { id: "crazy", label: "Crazy Future", emoji: "🤯", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", color: "#FF4B91" },
  { id: "daily", label: "Daily Work", emoji: "💼", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", color: "#58CC02" },
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

  const activeCat = CURIOSITY.find(c => c.id === activeId);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.1]"
            style={{ background: "radial-gradient(ellipse, #CE82FF, transparent 70%)" }}
          />
          <div className="absolute bottom-[40%] -right-20 w-[250px] h-[250px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #FF4B91, transparent 70%)" }}
          />
        </div>

        <div className="max-w-md mx-auto relative z-10">
          {/* Top bar */}
          <FadeIn>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-orange/15 rounded-full px-2 py-1">
                  <Flame size={12} className="text-agni-orange" />
                  <span className="text-[10px] font-black text-agni-orange">{stats.streak}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-1">
                  <Diamond size={12} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{stats.gems}</span>
                </div>
              </div>
              <h1 className="text-sm font-black text-foreground">Spark</h1>
              <div className="flex items-center gap-1.5">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")} className="w-7 h-7 rounded-xl bg-card flex items-center justify-center border border-border/50">
                  <User size={12} className="text-muted-foreground" />
                </motion.button>
                <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-1">
                  <Heart size={12} className="text-agni-pink fill-agni-pink" />
                  <span className="text-[10px] font-black text-agni-pink">5</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Hero banner */}
          <FadeIn delay={0.05}>
            <div className="mx-4 bg-agni-purple rounded-3xl p-4 shadow-lg mb-4 relative overflow-hidden"
              style={{ boxShadow: "0 4px 0 0 #A855F7" }}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute -right-2 bottom-0 w-14 h-14 rounded-full bg-white/5" />
              <div className="flex items-center gap-3 relative z-10">
                <Agni expression={loading ? "thinking" : results.length > 0 ? "excited" : "happy"} size={50} animate={true} />
                <div className="flex-1">
                  <p className="text-white/50 text-[8px] font-black tracking-[0.2em]">AI-POWERED</p>
                  <h3 className="text-white font-black text-lg leading-tight">Curiosity Spark ✨</h3>
                  <p className="text-white/60 text-[9px] font-bold mt-0.5">Hey {displayName} — discover something new!</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Spark Fact card */}
          <FadeIn delay={0.1}>
            <div className="mx-4 bg-card rounded-2xl p-3.5 border-2 border-agni-gold/20 shadow-card mb-4 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-[0.03]"
                style={{ background: "linear-gradient(110deg, transparent 30%, white 50%, transparent 70%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <motion.div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "#FFC800", boxShadow: "0 3px 0 0 #E0AC00" }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Zap size={14} className="text-white" />
                </motion.div>
                <h4 className="text-[9px] font-black text-agni-gold tracking-wider">SPARK FACT</h4>
                <div className="ml-auto flex gap-1">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopyFact} className="w-7 h-7 rounded-xl bg-muted/50 flex items-center justify-center">
                    {copied ? <Check size={10} className="text-agni-green" /> : <Copy size={10} className="text-muted-foreground" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => setSparkIdx((sparkIdx + 1) % SPARK_FACTS.length)} className="w-7 h-7 rounded-xl bg-muted/50 flex items-center justify-center">
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
                  className="text-[11px] text-foreground/80 leading-relaxed font-semibold relative z-10"
                >
                  {SPARK_FACTS[sparkIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Discovery Categories — Full-width cards */}
          <div className="px-4 space-y-3">
            <p className="text-[10px] font-black text-muted-foreground tracking-wider">EXPLORE DIMENSIONS</p>
            {CURIOSITY.map((cat, i) => {
              const isActive = activeId === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  {/* Category card */}
                  <motion.button
                    whileTap={{ scale: 0.97, y: 2 }}
                    onClick={() => fetchCuriosity(cat)}
                    className="w-full bg-card rounded-2xl p-4 border-2 text-left relative overflow-hidden transition-all"
                    style={{
                      borderColor: isActive ? cat.color : "hsl(var(--border) / 0.3)",
                      boxShadow: isActive
                        ? `0 4px 0 0 ${cat.color}60`
                        : "0 3px 0 0 hsl(var(--border) / 0.15)",
                    }}
                  >
                    <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.08]"
                      style={{ background: cat.color }}
                    />
                    <div className="flex items-center gap-3 relative z-10">
                      <motion.div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          background: isActive ? cat.color : `${cat.color}18`,
                          boxShadow: isActive ? `0 3px 0 0 ${cat.color}80` : "none",
                        }}
                        animate={isActive && loading ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {isActive && loading ? (
                          <Loader2 size={20} className="animate-spin text-white" />
                        ) : (
                          cat.emoji
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black" style={{ color: isActive ? cat.color : "hsl(var(--foreground))" }}>
                          {cat.label}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-semibold">{cat.desc}</p>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground/40 shrink-0" />
                    </div>
                  </motion.button>

                  {/* Results */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-1.5">
                          {error && (
                            <div className="bg-agni-red/10 border-2 border-agni-red/20 rounded-2xl p-3">
                              <p className="text-[11px] text-agni-red font-semibold">{error}</p>
                              <button onClick={() => fetchCuriosity(cat)} className="mt-1.5 text-[10px] font-extrabold text-agni-green flex items-center gap-1">
                                <RefreshCw size={10} /> Try again
                              </button>
                            </div>
                          )}

                          {loading && (
                            <div className="space-y-2">
                              {[1, 2, 3].map(j => (
                                <div key={j} className="h-14 rounded-xl bg-muted/20 animate-pulse" style={{ animationDelay: `${j * 150}ms` }} />
                              ))}
                            </div>
                          )}

                          {!loading && results.length > 0 && (
                            <>
                              {/* Category result banner */}
                              <div className="rounded-2xl p-3 relative overflow-hidden"
                                style={{ background: cat.color, boxShadow: `0 3px 0 0 ${cat.color}80` }}
                              >
                                <div className="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/10" />
                                <div className="flex items-center gap-2 relative z-10">
                                  <span className="text-lg">{cat.emoji}</span>
                                  <div>
                                    <h4 className="text-white font-black text-[11px]">{cat.label} Discoveries</h4>
                                    <p className="text-white/60 text-[8px] font-bold">{results.length} items found</p>
                                  </div>
                                </div>
                              </div>

                              {/* Result items */}
                              {results.map((item: any, j: number) => (
                                <motion.a
                                  key={j}
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.06 }}
                                  className="flex items-center gap-2.5 bg-card rounded-xl p-2.5 border border-border/30 hover:border-border/60 transition-all active:scale-[0.98]"
                                >
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                    style={{ background: `${cat.color}15` }}
                                  >
                                    {typeIcons[item.type] || "🔗"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-extrabold text-foreground truncate">{item.title}</p>
                                    <p className="text-[8px] text-muted-foreground truncate">{item.desc}</p>
                                  </div>
                                  <ExternalLink size={10} className="text-muted-foreground/40 shrink-0" />
                                </motion.a>
                              ))}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
