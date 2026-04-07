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
  { id: "industry", label: "🏭 Your Industry", desc: "AI agents in semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", color: "#FF9600", gradient: "from-agni-orange/20 to-agni-gold/10" },
  { id: "general", label: "🌍 General", desc: "What people are building with AI agents", query: "amazing AI agent projects people built 2026 showcase", color: "#CE82FF", gradient: "from-agni-purple/20 to-agni-blue/10" },
  { id: "crazy", label: "🤯 Crazy Future", desc: "Mind-bending futuristic agent apps", query: "most crazy futuristic AI agent applications autonomous 2026", color: "#FF4B91", gradient: "from-agni-pink/20 to-agni-purple/10" },
  { id: "daily", label: "💼 Daily Work", desc: "Agents for daily productivity", query: "AI agents automate daily office work productivity examples 2026", color: "#58CC02", gradient: "from-agni-green/20 to-agni-blue/10" },
];

const SPARK_FACTS = [
  "TSMC uses AI agents for wafer yield optimization — catching defects that save millions per batch.",
  "A solo dev in Bangalore built a content agency with 0 employees and 8 AI agents — $15K/month revenue.",
  "Manus AI was acquired by Meta for $2 billion in Dec 2025.",
  "Your Monday morning? An agent already triaged your inbox and prepped your meeting briefs.",
];

const typeIcons: Record<string, string> = { tool: "🔧", repo: "📦", article: "📰", video: "🎬", news: "📡" };

/* Nebula-style floating particle */
const NebulaOrb = ({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none blur-sm"
    style={{ left: x, top: y, width: size, height: size, background: color }}
    animate={{
      y: [0, -18, 0, 12, 0],
      x: [0, 10, -8, 5, 0],
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.2, 0.9, 1.05, 1],
    }}
    transition={{ duration: 10 + delay * 2, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

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
  const activeColor = activeCat?.color || "#CE82FF";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* ===== Background — Nebula / Galaxy theme ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Starburst center */}
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-[0.06]"
            style={{ background: `radial-gradient(circle, ${activeColor}, transparent 50%)` }}
          />

          {/* Spiral path */}
          <svg className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[350px] h-[900px] opacity-[0.07]" viewBox="0 0 350 900">
            <path d="M175 0 C50 80 300 160 175 240 C50 320 300 400 175 480 C50 560 300 640 175 720 C50 800 300 880 175 900" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground" strokeDasharray="6 8" />
            {/* Cross connectors */}
            <circle cx="175" cy="240" r="4" fill="currentColor" className="text-foreground" opacity="0.3" />
            <circle cx="175" cy="480" r="4" fill="currentColor" className="text-foreground" opacity="0.3" />
            <circle cx="175" cy="720" r="4" fill="currentColor" className="text-foreground" opacity="0.3" />
          </svg>

          {/* Constellation dots */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 0.8px, transparent 0.8px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Nebula orbs */}
          <NebulaOrb delay={0} x="10%" y="5%" size={80} color="hsla(270,100%,75%,0.15)" />
          <NebulaOrb delay={1} x="80%" y="12%" size={60} color="hsla(330,80%,60%,0.12)" />
          <NebulaOrb delay={2} x="5%" y="35%" size={70} color="hsla(199,92%,54%,0.1)" />
          <NebulaOrb delay={3} x="85%" y="45%" size={50} color="hsla(100,95%,40%,0.12)" />
          <NebulaOrb delay={1.5} x="20%" y="65%" size={65} color="hsla(46,100%,49%,0.1)" />
          <NebulaOrb delay={4} x="75%" y="70%" size={55} color={`${activeColor}20`} />

          {/* Diamond accent shapes */}
          <motion.div className="absolute top-[200px] right-[8%] w-8 h-8 opacity-[0.08] rotate-45 border-2 border-current text-foreground rounded-sm"
            animate={{ rotate: [45, 90, 45], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div className="absolute top-[500px] left-[6%] w-6 h-6 opacity-[0.06] border-2 border-current text-foreground rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* Triangle accents */}
          <svg className="absolute top-[350px] right-[12%] w-10 h-10 opacity-[0.05]" viewBox="0 0 100 100">
            <polygon points="50,10 90,85 10,85" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
          </svg>
          <svg className="absolute bottom-[200px] left-[10%] w-8 h-8 opacity-[0.04]" viewBox="0 0 100 100">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
          </svg>
        </div>

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

          {/* Hero — Cosmic Discovery */}
          <FadeIn delay={0.05}>
            <div className="rounded-3xl p-4 mb-4 relative overflow-hidden border-2 border-agni-purple/20 bg-gradient-to-br from-agni-purple/15 via-agni-pink/8 to-background">
              {/* Animated sparkle ring */}
              <motion.div
                className="absolute top-3 right-4 w-12 h-12 rounded-full border border-agni-purple/20"
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={12} className="text-agni-purple/30 absolute top-0 left-1/2 -translate-x-1/2" />
                <Sparkles size={8} className="text-agni-pink/20 absolute bottom-0 left-1/2 -translate-x-1/2" />
              </motion.div>

              {/* Orbiting dots */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-agni-purple/30"
                  style={{ top: 20, right: 25 }}
                  animate={{
                    x: [0, Math.cos(i * 2.1) * 25, 0],
                    y: [0, Math.sin(i * 2.1) * 25, 0],
                  }}
                  transition={{ duration: 4, delay: i * 1.3, repeat: Infinity }}
                />
              ))}

              <div className="flex items-center gap-1.5 mb-1.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-agni-purple"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-micro text-agni-purple">AI-POWERED DISCOVERY</p>
              </div>
              <h3 className="text-lg font-black text-foreground leading-tight mb-1">What's happening in AI? 🔮</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Tap a dimension below and let AI curate fresh insights from across the cosmos
              </p>
            </div>
          </FadeIn>

          {/* Quick Spark Fact — Crystal Card */}
          <FadeIn delay={0.1}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4 relative overflow-hidden">
              {/* Subtle shimmer */}
              <motion.div
                className="absolute inset-0 opacity-[0.03]"
                style={{ background: "linear-gradient(110deg, transparent 30%, white 50%, transparent 70%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <motion.div
                  className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Zap size={14} className="text-white" />
                </motion.div>
                <h4 className="text-micro text-agni-gold">SPARK CRYSTAL</h4>
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

          {/* Categories — Dimension Portal Cards */}
          <StaggerContainer className="space-y-3">
            {CURIOSITY.map((cat, idx) => {
              const isActive = activeId === cat.id;
              return (
                <StaggerItem key={cat.id}>
                  <div className="relative">
                    {/* Connecting line between cards */}
                    {idx < CURIOSITY.length - 1 && (
                      <div className="absolute -bottom-3 left-8 w-px h-3 bg-border/30" />
                    )}
                    
                    <motion.button
                      whileTap={{ scale: 0.97, y: 2 }}
                      onClick={() => fetchCuriosity(cat)}
                      className={`w-full rounded-2xl p-4 border-2 text-left transition-all shadow-card relative overflow-hidden ${
                        isActive ? "border-transparent" : "border-border/30 bg-card hover:border-border"
                      }`}
                      style={isActive ? {
                        borderColor: `${cat.color}50`,
                        background: `linear-gradient(135deg, ${cat.color}12, transparent 60%)`,
                      } : {}}
                    >
                      {/* Background shape */}
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.06]"
                        style={{ background: cat.color }}
                      />

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md text-lg"
                            style={{ background: `${cat.color}20`, border: `2px solid ${cat.color}30` }}
                            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            {cat.label.split(" ")[0]}
                          </motion.div>
                          <div>
                            <h4 className="text-xs font-extrabold text-foreground">{cat.label.split(" ").slice(1).join(" ")}</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{cat.desc}</p>
                          </div>
                        </div>
                        <motion.div
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                          style={isActive && !loading ? {
                            background: cat.color,
                            boxShadow: `0 4px 12px ${cat.color}40`,
                          } : isActive && loading ? {
                            background: `${cat.color}15`,
                          } : {
                            background: "hsl(var(--muted) / 0.5)",
                          }}
                        >
                          {isActive && loading ? (
                            <Loader2 size={14} className="animate-spin" style={{ color: cat.color }} />
                          ) : (
                            <Zap size={14} className={isActive ? "text-white" : "text-muted-foreground"} />
                          )}
                        </motion.div>
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
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                                  style={{ background: `${cat.color}15` }}>
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
                            className="flex items-center gap-1 text-[10px] font-extrabold rounded-xl px-3 py-2.5 mt-1 w-full justify-center border"
                            style={{
                              color: cat.color,
                              background: `${cat.color}10`,
                              borderColor: `${cat.color}25`,
                            }}
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