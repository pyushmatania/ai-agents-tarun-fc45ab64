import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check, Diamond, User, Heart, Flame, ExternalLink, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

const CURIOSITY = [
  { id: "industry", label: "Your Industry", emoji: "🏭", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", color: "#FF9600", bgGrad: "linear-gradient(135deg, #FF9600, #FF6B00)" },
  { id: "general", label: "General", emoji: "🌍", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", color: "#CE82FF", bgGrad: "linear-gradient(135deg, #CE82FF, #A855F7)" },
  { id: "crazy", label: "Crazy Future", emoji: "🤯", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", color: "#FF4B91", bgGrad: "linear-gradient(135deg, #FF4B91, #FF1A6D)" },
  { id: "daily", label: "Daily Work", emoji: "💼", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", color: "#58CC02", bgGrad: "linear-gradient(135deg, #58CC02, #45A800)" },
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
        {/* Colorful background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[350px] h-[350px] rounded-full opacity-[0.08]"
            style={{ background: "radial-gradient(circle, #CE82FF, transparent 70%)" }}
          />
          <div className="absolute top-[30%] -left-20 w-[300px] h-[300px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #FF9600, transparent 70%)" }}
          />
          <div className="absolute bottom-[20%] -right-10 w-[250px] h-[250px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #FF4B91, transparent 70%)" }}
          />
          <div className="absolute bottom-[5%] left-[10%] w-[200px] h-[200px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #58CC02, transparent 70%)" }}
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

          {/* Hero banner — gradient */}
          <FadeIn delay={0.05}>
            <div className="mx-4 rounded-3xl p-4 mb-4 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #CE82FF, #FF4B91)", boxShadow: "0 4px 0 0 #A855F780" }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute left-[30%] -bottom-8 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute right-[15%] top-[40%] w-8 h-8 rounded-full bg-white/5" />
              <div className="flex items-center gap-3 relative z-10">
                <Agni expression={loading ? "thinking" : results.length > 0 ? "excited" : "happy"} size={50} animate={true} />
                <div className="flex-1">
                  <p className="text-white/50 text-[7px] font-black tracking-[0.2em]">AI-POWERED</p>
                  <h3 className="text-white font-black text-lg leading-tight">Curiosity Spark ✨</h3>
                  <p className="text-white/60 text-[9px] font-bold mt-0.5">Hey {displayName} — discover something amazing!</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Spark Fact card — vibrant */}
          <FadeIn delay={0.1}>
            <div className="mx-4 bg-card rounded-3xl p-4 border-2 border-agni-gold/25 mb-4 relative overflow-hidden"
              style={{ boxShadow: "0 3px 0 0 hsl(var(--agni-gold) / 0.2)" }}
            >
              <motion.div
                className="absolute inset-0 opacity-[0.04]"
                style={{ background: "linear-gradient(110deg, transparent 30%, #FFC800 50%, transparent 70%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              />
              <div className="flex items-center gap-2 mb-2.5 relative z-10">
                <motion.div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #FFC800, #FF9600)", boxShadow: "0 3px 0 0 #E0AC00" }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Zap size={16} className="text-white" />
                </motion.div>
                <div>
                  <h4 className="text-[9px] font-black text-agni-gold tracking-wider">⚡ SPARK FACT</h4>
                  <p className="text-[7px] text-muted-foreground font-bold">Tap refresh for more</p>
                </div>
                <div className="ml-auto flex gap-1">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopyFact}
                    className="w-7 h-7 rounded-xl bg-muted/40 flex items-center justify-center border border-border/20"
                  >
                    {copied ? <Check size={10} className="text-agni-green" /> : <Copy size={10} className="text-muted-foreground" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => setSparkIdx((sparkIdx + 1) % SPARK_FACTS.length)}
                    className="w-7 h-7 rounded-xl bg-muted/40 flex items-center justify-center border border-border/20"
                  >
                    <RefreshCw size={10} className="text-muted-foreground" />
                  </motion.button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={sparkIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-[11px] text-foreground/80 leading-relaxed font-semibold relative z-10"
                >
                  {SPARK_FACTS[sparkIdx]}
                </motion.p>
              </AnimatePresence>
              {/* Dots */}
              <div className="flex items-center gap-1 mt-2.5 relative z-10">
                {SPARK_FACTS.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-200" style={{
                    width: i === sparkIdx ? 14 : 4,
                    height: 4,
                    background: i === sparkIdx ? "#FFC800" : "hsl(var(--muted-foreground) / 0.15)",
                  }} />
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Discovery Categories — colorful full-width cards */}
          <div className="px-4 space-y-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={12} className="text-agni-purple" />
              <p className="text-[10px] font-black text-muted-foreground tracking-wider">EXPLORE DIMENSIONS</p>
            </div>

            {CURIOSITY.map((cat, i) => {
              const isActive = activeId === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 200 }}
                >
                  {/* Category card — colorful with gradient when active */}
                  <motion.button
                    whileTap={{ scale: 0.97, y: 3 }}
                    onClick={() => fetchCuriosity(cat)}
                    className="w-full rounded-3xl p-4 text-left relative overflow-hidden transition-all"
                    style={{
                      background: isActive ? cat.bgGrad : "hsl(var(--card))",
                      border: isActive ? "none" : "2px solid hsl(var(--border) / 0.3)",
                      boxShadow: isActive
                        ? `0 5px 0 0 ${cat.color}80`
                        : "0 3px 0 0 hsl(var(--border) / 0.15)",
                    }}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full" style={{ background: isActive ? "rgba(255,255,255,0.12)" : `${cat.color}08` }} />
                    <div className="absolute right-8 bottom-0 w-12 h-12 rounded-full" style={{ background: isActive ? "rgba(255,255,255,0.06)" : `${cat.color}05` }} />

                    <div className="flex items-center gap-3 relative z-10">
                      <motion.div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.2)" : `${cat.color}18`,
                          boxShadow: isActive ? "0 3px 0 0 rgba(0,0,0,0.15)" : `0 2px 0 0 ${cat.color}15`,
                        }}
                        animate={isActive && loading ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        {isActive && loading ? (
                          <Loader2 size={22} className="animate-spin text-white" />
                        ) : (
                          cat.emoji
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black" style={{ color: isActive ? "#fff" : "hsl(var(--foreground))" }}>
                          {cat.label}
                        </p>
                        <p className="text-[9px] font-semibold" style={{ color: isActive ? "rgba(255,255,255,0.7)" : "hsl(var(--muted-foreground))" }}>
                          {cat.desc}
                        </p>
                      </div>
                      <motion.div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: isActive ? "rgba(255,255,255,0.2)" : `${cat.color}12` }}
                        animate={isActive && !loading ? { x: [0, 3, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight size={14} style={{ color: isActive ? "#fff" : cat.color }} />
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

                          {!loading && results.length > 0 && (
                            <>
                              {/* Category result header */}
                              <div className="rounded-2xl p-3 relative overflow-hidden"
                                style={{ background: cat.bgGrad, boxShadow: `0 3px 0 0 ${cat.color}80` }}
                              >
                                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                                <div className="flex items-center gap-2 relative z-10">
                                  <span className="text-lg">{cat.emoji}</span>
                                  <div>
                                    <h4 className="text-white font-black text-[11px]">{cat.label} Discoveries</h4>
                                    <p className="text-white/60 text-[8px] font-bold">{results.length} items found by AI</p>
                                  </div>
                                  <Star size={14} className="ml-auto text-white/30" />
                                </div>
                              </div>

                              {/* Result items */}
                              {results.map((item: any, j: number) => (
                                <motion.a
                                  key={j}
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  initial={{ opacity: 0, x: -15 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.06, type: "spring", stiffness: 200 }}
                                  className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 border-border/30 active:scale-[0.98] transition-all"
                                  style={{ boxShadow: `0 2px 0 0 ${cat.color}12` }}
                                >
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                                    style={{ background: `${cat.color}15` }}
                                  >
                                    {typeIcons[item.type] || "🔗"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-extrabold text-foreground truncate">{item.title}</p>
                                    <p className="text-[8px] text-muted-foreground truncate">{item.desc}</p>
                                  </div>
                                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}10` }}>
                                    <ExternalLink size={10} style={{ color: cat.color }} />
                                  </div>
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
