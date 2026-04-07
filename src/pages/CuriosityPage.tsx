import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check, User, Heart, Flame, ExternalLink, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

const CURIOSITY = [
  { id: "industry", label: "Your Industry", emoji: "🏭", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", gradient: "linear-gradient(135deg, #FF9600 0%, #FFB340 50%, #E08500 100%)", color: "#FF9600", shadow: "#CC7A00" },
  { id: "general", label: "General", emoji: "🌍", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", gradient: "linear-gradient(135deg, #CE82FF 0%, #DDA0FF 50%, #A855F7 100%)", color: "#CE82FF", shadow: "#9333EA" },
  { id: "crazy", label: "Crazy Future", emoji: "🤯", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", gradient: "linear-gradient(135deg, #FF4B91 0%, #FF70AB 50%, #E0357A 100%)", color: "#FF4B91", shadow: "#CC2D6A" },
  { id: "daily", label: "Daily Work", emoji: "💼", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", gradient: "linear-gradient(135deg, #58CC02 0%, #6EE718 50%, #45A800 100%)", color: "#58CC02", shadow: "#3D9400" },
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
  const [refreshing, setRefreshing] = useState(false);
  // Load cached results for a category
  const getCachedResults = (catId: string): any[] => {
    try {
      const cached = localStorage.getItem(`spark_cache_${catId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  };

  const fetchCuriosity = async (cat: typeof CURIOSITY[0]) => {
    setActiveId(cat.id);
    setError("");
    const cached = getCachedResults(cat.id);
    setResults(cached);
    if (cached.length > 0) setRefreshing(true);
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-curiosity", {
        body: { query: cat.query, category: cat.id },
      });
      if (fnError) throw new Error(fnError.message);
      const items = data?.items || [];
      if (items.length > 0) {
        setResults(items);
        localStorage.setItem(`spark_cache_${cat.id}`, JSON.stringify(items));
      } else if (cached.length === 0) {
        setError("No results found. Try again!");
      }
    } catch (e: any) {
      if (cached.length === 0) setError(e.message || "Failed to fetch. Try again!");
    }
    setLoading(false);
    setRefreshing(false);
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
                  <Zap size={12} className="text-agni-gold" />
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

          {/* Spark Fact — bold colored card */}
          <FadeIn delay={0.05}>
            <div className="mx-4 rounded-3xl overflow-hidden mb-4"
              style={{ boxShadow: "0 5px 0 0 #CC9F00" }}
            >
              <div className="p-3 relative" style={{ background: "linear-gradient(135deg, #FFC800, #FF9600)" }}>
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/15" />
                <div className="flex items-center gap-2 relative z-10">
                  <motion.span className="text-xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >⚡</motion.span>
                  <div>
                    <p className="text-[10px] font-black text-white tracking-wider">SPARK FACT</p>
                    <p className="text-[8px] font-bold text-white/60">Tap refresh for more</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopyFact}
                      className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center"
                    >
                      {copied ? <Check size={11} className="text-white" /> : <Copy size={11} className="text-white/80" />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => setSparkIdx((sparkIdx + 1) % SPARK_FACTS.length)}
                      className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center"
                    >
                      <RefreshCw size={11} className="text-white/80" />
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="bg-card p-4 border-x-2 border-b-2 rounded-b-3xl" style={{ borderColor: "#FFC80030" }}>
                <AnimatePresence mode="wait">
                  <motion.p key={sparkIdx}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="text-[12px] text-foreground/85 leading-relaxed font-bold"
                  >
                    {SPARK_FACTS[sparkIdx]}
                  </motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-1 mt-2.5">
                  {SPARK_FACTS.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-200" style={{
                      width: i === sparkIdx ? 14 : 4, height: 4,
                      background: i === sparkIdx ? "#FFC800" : "hsl(var(--muted-foreground) / 0.15)",
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Discovery Dimensions — vivid gradient cards */}
          <div className="px-4 space-y-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={13} className="text-agni-purple" />
              <p className="text-[10px] font-black text-muted-foreground tracking-wider">EXPLORE DIMENSIONS</p>
            </div>

            {CURIOSITY.map((cat, i) => {
              const isActive = activeId === cat.id;
              return (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.07, type: "spring", stiffness: 200 }}
                >
                  <motion.button
                    whileTap={{ scale: 0.96, y: 4 }}
                    onClick={() => fetchCuriosity(cat)}
                    className="w-full rounded-3xl p-5 text-left relative overflow-hidden"
                    style={{
                      background: cat.gradient,
                      boxShadow: isActive
                        ? `0 6px 0 0 ${cat.shadow}, 0 0 25px ${cat.color}35`
                        : `0 5px 0 0 ${cat.shadow}`,
                    }}
                  >
                    {/* Decorative shapes */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute right-10 bottom-0 w-14 h-14 rounded-full bg-black/5" />
                    <div className="absolute left-[30%] -bottom-4 w-10 h-10 rounded-full bg-white/5" />

                    <div className="flex items-center gap-3.5 relative z-10">
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shrink-0"
                        style={{ boxShadow: "0 3px 0 0 rgba(0,0,0,0.1)" }}
                        animate={isActive && loading ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        {isActive && loading ? (
                          <Loader2 size={24} className="animate-spin text-white" />
                        ) : cat.emoji}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-black text-white">{cat.label}</p>
                        <p className="text-[10px] font-bold text-white/70">{cat.desc}</p>
                      </div>
                      <motion.div
                        className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"
                        animate={isActive && !loading ? { x: [0, 3, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight size={16} className="text-white" />
                      </motion.div>
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
                        <div className="pt-2.5 space-y-2">
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
                                <div key={j} className="h-16 rounded-2xl bg-muted/15 animate-pulse" style={{ animationDelay: `${j * 150}ms` }} />
                              ))}
                            </div>
                          )}

                          {results.length > 0 && (
                            <>
                              <div className="rounded-2xl p-3 relative overflow-hidden"
                                style={{ background: cat.gradient, boxShadow: `0 3px 0 0 ${cat.shadow}` }}
                              >
                                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                                <div className="flex items-center gap-2 relative z-10">
                                  <span className="text-lg">{cat.emoji}</span>
                                  <div>
                                    <h4 className="text-white font-black text-[11px]">{cat.label} Discoveries</h4>
                                    <p className="text-white/60 text-[8px] font-bold">{results.length} items found by AI</p>
                                  </div>
                                  {refreshing ? (
                                    <span className="ml-auto text-[8px] font-bold text-white/80 bg-white/20 px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                                      <Loader2 size={8} className="animate-spin" /> Updating
                                    </span>
                                  ) : (
                                    <Star size={14} className="ml-auto text-white/30" />
                                  )}
                                </div>
                              </div>

                              {results.map((item: any, j: number) => (
                                <motion.a key={j} href={item.url} target="_blank" rel="noopener noreferrer"
                                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.06, type: "spring", stiffness: 200 }}
                                  className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 active:scale-[0.98] transition-all"
                                  style={{ borderColor: `${cat.color}25`, boxShadow: `0 2px 0 0 ${cat.color}12` }}
                                >
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                                    style={{ background: `${cat.color}20` }}
                                  >{typeIcons[item.type] || "🔗"}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-extrabold text-foreground truncate">{item.title}</p>
                                    <p className="text-[8px] text-muted-foreground truncate">{item.desc}</p>
                                  </div>
                                  <ExternalLink size={10} style={{ color: cat.color }} />
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
