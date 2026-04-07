import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check, Diamond, User, Heart, Flame } from "lucide-react";
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

const getSCurveX = (index: number): number => {
  const pattern = [30, 80, 130, 80];
  return pattern[index % pattern.length];
};

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
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full opacity-[0.15]"
            style={{ background: "radial-gradient(ellipse, #CE82FF, transparent 70%)" }}
          />
          {/* S-curve path */}
          <svg className="absolute top-[360px] left-1/2 -translate-x-1/2 w-[300px] h-[800px] opacity-[0.08]" viewBox="0 0 300 800">
            <path d="M150 0 Q20 100 150 200 Q280 300 150 400 Q20 500 150 600 Q280 700 150 800" fill="none" stroke="currentColor" strokeWidth="40" className="text-foreground" />
          </svg>
          {/* Floating orbs */}
          {[
            { x: "10%", y: "8%", size: 70, color: "hsla(270,100%,75%,0.18)" },
            { x: "82%", y: "20%", size: 55, color: "hsla(33,100%,50%,0.15)" },
            { x: "5%", y: "50%", size: 65, color: "hsla(100,95%,40%,0.15)" },
            { x: "88%", y: "65%", size: 50, color: "hsla(323,100%,76%,0.15)" },
            { x: "20%", y: "80%", size: 60, color: "hsla(199,92%,54%,0.12)" },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size, background: orb.color }}
              animate={{ y: [0, -15, 0, 10, 0], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i, ease: "easeInOut" }}
            />
          ))}
          {/* Hexagons */}
          <svg className="absolute top-[120px] right-[8%] w-14 h-14 opacity-[0.06]" viewBox="0 0 100 100">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#CE82FF" strokeWidth="2" />
          </svg>
          <svg className="absolute top-[500px] left-[5%] w-10 h-10 opacity-[0.05]" viewBox="0 0 100 100">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#FF9600" strokeWidth="2" />
          </svg>
          {/* Diagonal accents */}
          <div className="absolute top-[250px] -left-10 w-[200px] h-[2px] rotate-[30deg] opacity-[0.12]"
            style={{ background: "linear-gradient(90deg, transparent, #CE82FF, transparent)" }}
          />
          <div className="absolute top-[600px] -right-10 w-[180px] h-[2px] -rotate-[25deg] opacity-[0.12]"
            style={{ background: "linear-gradient(90deg, transparent, #58CC02, transparent)" }}
          />
        </div>

        <div className="max-w-md mx-auto relative z-10">
          {/* Top bar — matches Learn page style */}
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
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")} className="w-7 h-7 rounded-xl bg-card flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors">
                  <User size={12} className="text-muted-foreground" />
                </motion.button>
                <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-1">
                  <Heart size={12} className="text-agni-pink fill-agni-pink" />
                  <span className="text-[10px] font-black text-agni-pink">5</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Hero banner — Duolingo style */}
          <FadeIn delay={0.05}>
            <div className="mx-4 bg-agni-purple rounded-3xl p-4 shadow-lg mb-4 relative overflow-hidden"
              style={{ boxShadow: "0 4px 0 0 #A855F7" }}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute -right-2 bottom-0 w-14 h-14 rounded-full bg-white/5" />
              <div className="absolute left-[30%] -bottom-6 w-24 h-24 rounded-full bg-white/[0.03]" />

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

          {/* Quick Spark Fact card */}
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
                <div>
                  <h4 className="text-[9px] font-black text-agni-gold tracking-wider">SPARK FACT</h4>
                </div>
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
                  className="text-[11px] text-foreground/80 leading-relaxed font-semibold relative z-10"
                >
                  {SPARK_FACTS[sparkIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Categories on a winding S-curve path — like Learn page */}
          <div className="px-4 relative">
            {/* SVG connector lines */}
            <svg className="absolute top-0 left-4 right-4 h-full pointer-events-none" style={{ width: "calc(100% - 32px)" }}>
              {CURIOSITY.map((_, i) => {
                if (i === 0) return null;
                const x1 = getSCurveX(i - 1) + 28;
                const y1 = (i - 1) * 160 + 45;
                const x2 = getSCurveX(i) + 28;
                const y2 = i * 160 + 45;
                const midY = (y1 + y2) / 2;
                return (
                  <path
                    key={i}
                    d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                    fill="none"
                    stroke={CURIOSITY[i].color}
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    opacity={0.25}
                  />
                );
              })}
            </svg>

            <div className="relative" style={{ paddingBottom: 20 }}>
              {CURIOSITY.map((cat, i) => {
                const xOffset = getSCurveX(i);
                const isActive = activeId === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.5, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                    className="relative"
                    style={{ height: isActive ? "auto" : 160, minHeight: 160, paddingLeft: xOffset }}
                  >
                    {/* Node button */}
                    <motion.button
                      whileTap={{ scale: 0.9, y: 3 }}
                      onClick={() => fetchCuriosity(cat)}
                      className="relative flex flex-col items-center"
                      style={{ width: 100 }}
                    >
                      {/* Glow */}
                      <motion.div
                        className="absolute -inset-3 rounded-full"
                        style={{ background: `radial-gradient(circle, ${cat.color}30, transparent 70%)` }}
                        animate={isActive ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      {/* Circle */}
                      <motion.div
                        className="w-[60px] h-[60px] rounded-full flex items-center justify-center relative z-10 border-[3px]"
                        style={{
                          background: isActive
                            ? cat.color
                            : `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)`,
                          borderColor: isActive ? cat.color : `${cat.color}50`,
                          boxShadow: isActive
                            ? `0 6px 0 0 ${cat.color}80, 0 8px 20px ${cat.color}40`
                            : `0 4px 0 0 ${cat.color}40`,
                        }}
                        animate={isActive && !loading ? { y: [0, -3, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {isActive && loading ? (
                          <Loader2 size={22} className="animate-spin text-white" />
                        ) : (
                          <span className="text-2xl">{cat.emoji}</span>
                        )}
                      </motion.div>

                      {/* Label */}
                      <span className="text-[10px] font-black mt-1.5" style={{ color: isActive ? cat.color : "hsl(var(--foreground))" }}>
                        {cat.label}
                      </span>
                      <span className="text-[8px] font-semibold text-muted-foreground text-center leading-tight mt-0.5 max-w-[90px]">
                        {cat.desc}
                      </span>
                    </motion.button>

                    {/* Results panel */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden w-full mt-3"
                          style={{ paddingLeft: 0, marginLeft: -xOffset }}
                        >
                          {/* Error */}
                          {error && (
                            <div className="bg-agni-red/10 border-2 border-agni-red/20 rounded-2xl p-3 mb-2">
                              <p className="text-[11px] text-agni-red font-semibold">{error}</p>
                              <button onClick={() => fetchCuriosity(cat)} className="mt-1.5 text-[10px] font-extrabold text-agni-green flex items-center gap-1">
                                <RefreshCw size={10} /> Try again
                              </button>
                            </div>
                          )}

                          {/* Loading skeletons */}
                          {loading && (
                            <div className="space-y-2">
                              {[1, 2, 3].map(j => (
                                <div key={j} className="h-16 rounded-2xl bg-muted/20 animate-pulse" style={{ animationDelay: `${j * 200}ms` }} />
                              ))}
                            </div>
                          )}

                          {/* Results */}
                          {!loading && results.length > 0 && (
                            <div className="space-y-2">
                              {/* Category banner */}
                              <div
                                className="rounded-2xl p-3 relative overflow-hidden"
                                style={{ background: cat.color, boxShadow: `0 4px 0 0 ${cat.color}80` }}
                              >
                                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                                <div className="flex items-center gap-2 relative z-10">
                                  <span className="text-xl">{cat.emoji}</span>
                                  <div>
                                    <h4 className="text-white font-black text-xs">{cat.label}</h4>
                                    <p className="text-white/60 text-[9px] font-bold">{results.length} discoveries</p>
                                  </div>
                                </div>
                              </div>

                              {results.map((r: any, ri: number) => (
                                <motion.a
                                  key={ri}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ri * 0.06 }}
                                  href={r.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 border-border/30 hover:border-border transition-all group"
                                  style={{ borderLeftColor: `${cat.color}40`, borderLeftWidth: 3 }}
                                >
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-md"
                                    style={{ background: `${cat.color}20`, border: `2px solid ${cat.color}25` }}>
                                    {typeIcons[r.type] || "📄"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-extrabold text-foreground block truncate">{r.title}</span>
                                    <p className="text-[9px] text-muted-foreground truncate font-semibold">{r.desc || ""}</p>
                                  </div>
                                  <ArrowRight size={10} className="text-muted-foreground shrink-0" />
                                </motion.a>
                              ))}

                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => fetchCuriosity(cat)}
                                className="flex items-center gap-1 text-[10px] font-extrabold rounded-2xl px-3 py-2.5 w-full justify-center border-2"
                                style={{
                                  color: cat.color,
                                  background: `${cat.color}10`,
                                  borderColor: `${cat.color}25`,
                                }}
                              >
                                <RefreshCw size={10} /> Discover more
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default CuriosityPage;
