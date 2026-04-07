import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import {
  ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check,
  User, Heart, Flame, ExternalLink, Star, Bell, ChevronRight,
  BookmarkPlus, ChevronUp, ChevronDown, Clock, Globe
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { ALL_SOURCES, CURIOSITY_SOURCE_SEEDS, getSourceAvatar, SOURCE_CATEGORIES } from "@/lib/sources";
import { useFollowedSources } from "@/hooks/useFollowedSources";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const CURIOSITY = [
  { id: "industry", label: "Your Industry", emoji: "🏭", desc: "Semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", color: "#FF9600", shadow: "#CC7A00" },
  { id: "general", label: "General", emoji: "🌍", desc: "What people are building", query: "amazing AI agent projects people built 2026 showcase", color: "#CE82FF", shadow: "#9333EA" },
  { id: "crazy", label: "Crazy Future", emoji: "🤯", desc: "Bleeding edge AI", query: "most crazy futuristic AI agent applications autonomous 2026", color: "#FF4B91", shadow: "#CC2D6A" },
  { id: "daily", label: "Daily Work", emoji: "💼", desc: "Productivity agents", query: "AI agents automate daily office work productivity examples 2026", color: "#58CC02", shadow: "#3D9400" },
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
  const { followed, isFollowed } = useFollowedSources();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sparkIdx, setSparkIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedItems, setFeedItems] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("spark_feed_cache");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [feedCardIndex, setFeedCardIndex] = useState(0);
  const [showDimensions, setShowDimensions] = useState(false);

  // Get followed sources with full data
  const followedSources = useMemo(
    () => ALL_SOURCES.filter(s => isFollowed(s.name)),
    [followed, isFollowed]
  );

  const getCachedResults = (catId: string): any[] => {
    try {
      const cached = localStorage.getItem(`spark_cache_${catId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  };

  // Fetch personalized feed from followed sources
  const fetchFeed = useCallback(async () => {
    if (followed.length === 0) return;
    setFeedLoading(true);
    try {
      const sourceNames = followed.slice(0, 15).join(", ");
      const { data, error: fnError } = await supabase.functions.invoke("ai-curiosity", {
        body: {
          query: `Latest news and updates from: ${sourceNames}. Give brief Inshorts-style summaries.`,
          category: "feed",
          sourceSeeds: followed.slice(0, 15),
        },
      });
      if (fnError) throw new Error(fnError.message);
      const items = (data?.items || []).map((item: any, i: number) => ({
        ...item,
        sourceName: followed[i % followed.length],
        timestamp: getRelativeTime(i),
      }));
      if (items.length > 0) {
        setFeedItems(items);
        setFeedCardIndex(0);
        localStorage.setItem("spark_feed_cache", JSON.stringify(items));
      }
    } catch (e: any) {
      toast.error("Couldn't refresh feed");
    }
    setFeedLoading(false);
  }, [followed]);

  const fetchCuriosity = async (cat: typeof CURIOSITY[0]) => {
    setActiveId(cat.id);
    setError("");
    const cached = getCachedResults(cat.id);
    setResults(cached);
    if (cached.length > 0) setRefreshing(true);
    setLoading(true);
    const sourceSeeds = CURIOSITY_SOURCE_SEEDS[cat.id] || [];
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-curiosity", {
        body: { query: cat.query, category: cat.id, sourceSeeds },
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
      if (cached.length === 0) setError(e.message || "Failed to fetch.");
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleCopyFact = () => {
    navigator.clipboard.writeText(SPARK_FACTS[sparkIdx]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextFeedCard = () => setFeedCardIndex(i => Math.min(i + 1, feedItems.length - 1));
  const prevFeedCard = () => setFeedCardIndex(i => Math.max(i - 1, 0));

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
              <h1 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-agni-gold" /> Spark
              </h1>
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

          {/* ═══ FOLLOWED SOURCES STRIP ═══ */}
          {followedSources.length > 0 && (
            <FadeIn delay={0.03}>
              <div className="px-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={11} className="text-agni-green" />
                  <span className="text-[9px] font-black text-muted-foreground tracking-wider">YOUR SOURCES</span>
                  <span className="text-[8px] font-bold text-muted-foreground/50 ml-auto">{followed.length} following</span>
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {followedSources.slice(0, 12).map((source, i) => {
                    const catMeta = SOURCE_CATEGORIES.find(c => c.id === source.category);
                    return (
                      <motion.div
                        key={source.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex flex-col items-center gap-1 shrink-0"
                      >
                        <div className="relative">
                          <Avatar className="w-11 h-11 border-2" style={{ borderColor: `${catMeta?.color || '#58CC02'}50` }}>
                            <AvatarImage src={getSourceAvatar(source)} alt={source.name} />
                            <AvatarFallback className="text-[9px] font-black bg-card" style={{ color: catMeta?.color }}>
                              {source.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online-style dot */}
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background bg-agni-green" />
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground text-center w-12 truncate">{source.name}</span>
                      </motion.div>
                    );
                  })}
                  {/* Add more button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/sources")}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-agni-green/30 flex items-center justify-center bg-agni-green/5">
                      <BookmarkPlus size={14} className="text-agni-green/60" />
                    </div>
                    <span className="text-[8px] font-bold text-agni-green/60">Add</span>
                  </motion.button>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ═══ INSHORTS-STYLE FEED ═══ */}
          {followedSources.length > 0 && (
            <FadeIn delay={0.06}>
              <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Globe size={11} className="text-agni-blue" />
                    <span className="text-[9px] font-black text-muted-foreground tracking-wider">YOUR FEED</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={fetchFeed}
                    disabled={feedLoading}
                    className="flex items-center gap-1 text-[9px] font-bold text-agni-blue bg-agni-blue/10 px-2 py-1 rounded-full"
                  >
                    {feedLoading ? (
                      <Loader2 size={9} className="animate-spin" />
                    ) : (
                      <RefreshCw size={9} />
                    )}
                    {feedLoading ? "Loading..." : "Refresh"}
                  </motion.button>
                </div>

                {feedItems.length > 0 ? (
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={feedCardIndex}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="bg-card rounded-2xl border-2 border-border/20 overflow-hidden"
                      >
                        {/* Card header with source */}
                        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                          <Avatar className="w-6 h-6 border border-border/30">
                            <AvatarImage
                              src={getSourceAvatar(
                                ALL_SOURCES.find(s => s.name === feedItems[feedCardIndex]?.sourceName) || { name: feedItems[feedCardIndex]?.sourceName || "", url: "", desc: "", tags: [], category: "blog" }
                              )}
                              alt=""
                            />
                            <AvatarFallback className="text-[7px] bg-muted">
                              {(feedItems[feedCardIndex]?.sourceName || "?").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-foreground truncate">{feedItems[feedCardIndex]?.sourceName || "AI News"}</p>
                            <p className="text-[7px] text-muted-foreground">{feedItems[feedCardIndex]?.timestamp || "Just now"}</p>
                          </div>
                          <span className="text-[8px] font-bold text-muted-foreground/40">{feedCardIndex + 1}/{feedItems.length}</span>
                        </div>

                        {/* Card content — Inshorts style */}
                        <div className="px-3 pb-2">
                          <h3 className="text-[13px] font-black text-foreground leading-tight mb-1.5">
                            {feedItems[feedCardIndex]?.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                            {feedItems[feedCardIndex]?.desc}
                          </p>
                        </div>

                        {/* Card footer */}
                        <div className="flex items-center justify-between px-3 pb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{typeIcons[feedItems[feedCardIndex]?.type] || "📡"}</span>
                            <span className="text-[8px] font-bold text-muted-foreground capitalize">{feedItems[feedCardIndex]?.type || "news"}</span>
                          </div>
                          {feedItems[feedCardIndex]?.url && (
                            <a href={feedItems[feedCardIndex].url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[9px] font-bold text-agni-blue bg-agni-blue/10 px-2 py-1 rounded-full"
                            >
                              Read more <ExternalLink size={8} />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Swipe controls */}
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={prevFeedCard}
                        disabled={feedCardIndex === 0}
                        className="w-8 h-8 rounded-full bg-card border border-border/30 flex items-center justify-center disabled:opacity-20"
                      >
                        <ChevronUp size={14} className="text-muted-foreground rotate-[-90deg]" />
                      </motion.button>

                      {/* Dots */}
                      <div className="flex gap-1">
                        {feedItems.map((_, i) => (
                          <div key={i} className="rounded-full transition-all duration-200" style={{
                            width: i === feedCardIndex ? 12 : 4, height: 4,
                            background: i === feedCardIndex ? "hsl(var(--agni-blue))" : "hsl(var(--muted-foreground) / 0.15)",
                          }} />
                        ))}
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={nextFeedCard}
                        disabled={feedCardIndex >= feedItems.length - 1}
                        className="w-8 h-8 rounded-full bg-card border border-border/30 flex items-center justify-center disabled:opacity-20"
                      >
                        <ChevronDown size={14} className="text-muted-foreground rotate-[-90deg]" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={fetchFeed}
                    className="w-full bg-card border-2 border-dashed border-agni-blue/20 rounded-2xl p-4 text-center"
                  >
                    <Sparkles size={20} className="text-agni-blue/40 mx-auto mb-1.5" />
                    <p className="text-[11px] font-bold text-foreground">Tap to load your personalized feed</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      News from {followed.length} source{followed.length !== 1 ? "s" : ""} you follow
                    </p>
                  </motion.button>
                )}
              </div>
            </FadeIn>
          )}

          {/* ═══ NO FOLLOWED — CTA TO HUB ═══ */}
          {followedSources.length === 0 && (
            <FadeIn delay={0.05}>
              <div className="px-4 mb-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/sources")}
                  className="w-full bg-card border-2 border-agni-green/20 rounded-2xl p-5 text-center relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-agni-green/5" />
                  <BookmarkPlus size={24} className="text-agni-green/60 mx-auto mb-2" />
                  <p className="text-sm font-black text-foreground">Follow sources to unlock your feed</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Go to Sources Hub → follow channels, creators & newsletters → get Inshorts-style updates here
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-3 text-agni-green text-[11px] font-bold">
                    Open Sources Hub <ChevronRight size={12} />
                  </div>
                </motion.button>
              </div>
            </FadeIn>
          )}

          {/* ═══ SPARK FACT ═══ */}
          <FadeIn delay={0.08}>
            <div className="mx-4 rounded-2xl overflow-hidden mb-4 border-2 border-agni-gold/15">
              <div className="px-3 py-2.5 flex items-center gap-2 bg-agni-gold/8">
                <motion.span className="text-base" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>⚡</motion.span>
                <span className="text-[9px] font-black text-agni-gold tracking-wider">SPARK FACT</span>
                <div className="ml-auto flex gap-1">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopyFact} className="w-6 h-6 rounded-lg bg-agni-gold/10 flex items-center justify-center">
                    {copied ? <Check size={10} className="text-agni-gold" /> : <Copy size={10} className="text-agni-gold/60" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => setSparkIdx((sparkIdx + 1) % SPARK_FACTS.length)} className="w-6 h-6 rounded-lg bg-agni-gold/10 flex items-center justify-center">
                    <RefreshCw size={10} className="text-agni-gold/60" />
                  </motion.button>
                </div>
              </div>
              <div className="bg-card px-3 py-3">
                <AnimatePresence mode="wait">
                  <motion.p key={sparkIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="text-[11px] text-foreground/85 leading-relaxed font-bold"
                  >
                    {SPARK_FACTS[sparkIdx]}
                  </motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-1 mt-2">
                  {SPARK_FACTS.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-200" style={{
                      width: i === sparkIdx ? 12 : 4, height: 4,
                      background: i === sparkIdx ? "#FFC800" : "hsl(var(--muted-foreground) / 0.12)",
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ═══ EXPLORE DIMENSIONS ═══ */}
          <FadeIn delay={0.1}>
            <div className="px-4">
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles size={11} className="text-agni-purple" />
                  <span className="text-[9px] font-black text-muted-foreground tracking-wider">EXPLORE DIMENSIONS</span>
                </div>
                <motion.div animate={{ rotate: showDimensions ? 180 : 0 }}>
                  <ChevronDown size={14} className="text-muted-foreground/40" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showDimensions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    {CURIOSITY.map((cat, i) => {
                      const isActive = activeId === cat.id;
                      return (
                        <div key={cat.id}>
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => fetchCuriosity(cat)}
                            className="w-full rounded-2xl p-3.5 text-left flex items-center gap-3 relative overflow-hidden border-2 transition-colors"
                            style={{
                              borderColor: isActive ? `${cat.color}40` : 'hsl(var(--border) / 0.2)',
                              background: isActive ? `${cat.color}08` : 'hsl(var(--card))',
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                              style={{ background: `${cat.color}15` }}
                            >
                              {isActive && loading ? (
                                <Loader2 size={18} className="animate-spin" style={{ color: cat.color }} />
                              ) : cat.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-black text-foreground">{cat.label}</p>
                              <p className="text-[9px] text-muted-foreground">{cat.desc}</p>
                            </div>
                            <ChevronRight size={14} style={{ color: cat.color }} className="shrink-0 opacity-40" />
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
                                    <div className="bg-agni-red/10 border border-agni-red/20 rounded-xl p-2.5">
                                      <p className="text-[10px] text-agni-red font-semibold">{error}</p>
                                      <button onClick={() => fetchCuriosity(cat)} className="mt-1 text-[9px] font-bold text-agni-green flex items-center gap-1">
                                        <RefreshCw size={9} /> Retry
                                      </button>
                                    </div>
                                  )}

                                  {loading && !results.length && (
                                    <div className="space-y-1.5">
                                      {[1, 2, 3].map(j => (
                                        <div key={j} className="h-14 rounded-xl bg-muted/10 animate-pulse" style={{ animationDelay: `${j * 100}ms` }} />
                                      ))}
                                    </div>
                                  )}

                                  {results.map((item: any, j: number) => (
                                    <motion.a key={j} href={item.url} target="_blank" rel="noopener noreferrer"
                                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: j * 0.04 }}
                                      className="flex items-center gap-2 bg-card rounded-xl p-2.5 border border-border/15 active:scale-[0.98] transition-all"
                                    >
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                        style={{ background: `${cat.color}12` }}
                                      >{typeIcons[item.type] || "🔗"}</div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-extrabold text-foreground truncate">{item.title}</p>
                                        <p className="text-[8px] text-muted-foreground truncate">{item.desc}</p>
                                      </div>
                                      <ExternalLink size={9} style={{ color: cat.color }} className="shrink-0 opacity-40" />
                                    </motion.a>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Bottom CTA */}
          <FadeIn delay={0.15}>
            <div className="px-4 py-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/sources")}
                className="w-full bg-foreground text-background rounded-2xl py-3 text-[12px] font-black text-center"
              >
                📚 Browse Sources Hub
              </motion.button>
            </div>
          </FadeIn>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

function getRelativeTime(index: number): string {
  const times = ["2 min ago", "15 min ago", "1 hr ago", "3 hrs ago", "Today"];
  return times[index % times.length];
}

export default CuriosityPage;
