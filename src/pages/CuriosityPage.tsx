import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import {
  ArrowRight, RefreshCw, Loader2, Sparkles, Zap, Copy, Check,
  User, Heart, Flame, ExternalLink, Star, Bell, ChevronRight,
  BookmarkPlus, ChevronUp, ChevronDown, Clock, Globe, Play,
  Youtube, Instagram, Newspaper, TrendingUp, Eye, Brain,
  BookOpen, MessageSquare, Lightbulb, ThumbsUp, ThumbsDown,
  Share2, Bookmark, Filter, X, Search, History, MessageCircleMore
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { ALL_SOURCES, CURIOSITY_SOURCE_SEEDS, getSourceAvatar, SOURCE_CATEGORIES } from "@/lib/sources";
import { useFollowedSources } from "@/hooks/useFollowedSources";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const CURIOSITY = [
  { id: "industry", label: "Your Industry", emoji: "🏭", desc: "Semiconductor & manufacturing", query: "AI agents semiconductor manufacturing India 2026 latest", color: "#FF9600", shadow: "#CC7A00", bgGradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" },
  { id: "general", label: "General", emoji: "🌍", desc: "What people are building", query: "amazing AI agent projects people built 2026 showcase", color: "#CE82FF", shadow: "#9333EA", bgGradient: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)" },
  { id: "crazy", label: "Crazy Future", emoji: "🤯", desc: "Bleeding edge AI", query: "most crazy futuristic AI agent applications autonomous 2026", color: "#FF4B91", shadow: "#CC2D6A", bgGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" },
  { id: "daily", label: "Daily Work", emoji: "💼", desc: "Productivity agents", query: "AI agents automate daily office work productivity examples 2026", color: "#58CC02", shadow: "#3D9400", bgGradient: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
];

const SPARK_FACTS = [
  "TSMC uses AI agents for wafer yield optimization — catching defects that save millions per batch.",
  "A solo dev in Bangalore built a content agency with 0 employees and 8 AI agents — $15K/month revenue.",
  "Manus AI was acquired by Meta for $2 billion in Dec 2025.",
  "Your Monday morning? An agent already triaged your inbox and prepped your meeting briefs.",
];

const typeIcons: Record<string, string> = { tool: "🔧", repo: "📦", article: "📰", video: "🎬", news: "📡" };

const FEED_FILTERS = [
  { id: "all", label: "All", icon: Globe },
  { id: "youtube", label: "Videos", icon: Youtube },
  { id: "article", label: "Articles", icon: Newspaper },
  { id: "news", label: "News", icon: TrendingUp },
] as const;

function getRelativeTime(i: number): string {
  const times = ["2m ago", "15m ago", "1h ago", "3h ago", "5h ago", "8h ago", "12h ago", "1d ago", "2d ago"];
  return times[i % times.length];
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function getContentMeta(url: string): { type: "youtube" | "instagram" | "article" | "tweet"; icon: any; label: string; thumbnail?: string; color: string } {
  if (!url) return { type: "article", icon: Newspaper, label: "Article", color: "#1CB0F6" };
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return { type: "youtube", icon: Youtube, label: "YouTube", thumbnail: match ? getYouTubeThumbnail(match[1]) : undefined, color: "#FF0000" };
  }
  if (url.includes("instagram.com")) return { type: "instagram", icon: Instagram, label: "Reel", color: "#E1306C" };
  if (url.includes("twitter.com") || url.includes("x.com")) return { type: "tweet", icon: Globe, label: "Post", color: "#1DA1F2" };
  return { type: "article", icon: Newspaper, label: "Article", color: "#1CB0F6" };
}

const TABS = [
  { id: "feed", label: "Feed", icon: TrendingUp },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "explore", label: "Explore", icon: Sparkles },
] as const;

/** Share a feed item via native share or clipboard */
async function shareItem(item: { title: string; desc?: string; url?: string }) {
  const text = `${item.title}${item.desc ? `\n${item.desc}` : ""}${item.url ? `\n${item.url}` : ""}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: item.title, text: item.desc || "", url: item.url || "" });
      return;
    } catch {}
  }
  await navigator.clipboard.writeText(text);
  toast.success("Link copied to clipboard! 📋");
}


function AILearnModal({ item, onClose }: { item: any; onClose: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"summary" | "quiz">("summary");

  useEffect(() => {
    (async () => {
      try {
        const meta = getContentMeta(item.url);
        const { data, error: fnError } = await supabase.functions.invoke("ai-learn", {
          body: {
            title: item.title,
            description: item.desc,
            url: item.url,
            contentType: meta.type,
          },
        });
        if (fnError) throw new Error(fnError.message);
        setResult(data?.result || {});
      } catch (e: any) {
        setError(e.message || "Failed to analyze content");
      }
      setLoading(false);
    })();
  }, [item]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-background rounded-t-3xl border-t border-border/30 h-[95vh] flex flex-col z-[60]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-border/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-agni-purple/15 flex items-center justify-center">
                <Brain size={16} className="text-agni-purple" />
              </div>
              <div>
                <span className="text-[9px] font-black text-agni-purple uppercase tracking-wider">AI Study Notes</span>
                <p className="text-[8px] text-muted-foreground">Powered by AGNI × NotebookLM</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => shareItem(item)} className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center">
              <Share2 size={14} className="text-muted-foreground" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center">
              <X size={14} className="text-muted-foreground" />
            </motion.button>
          </div>
          <p className="text-[11px] font-extrabold text-foreground line-clamp-2">{item.title}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2">
          {(["summary", "quiz"] as const).map(tab => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(tab)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                activeSection === tab ? "bg-agni-purple text-white" : "bg-card text-muted-foreground"
              }`}
            >
              {tab === "summary" ? "📝 Summary" : "🧠 Quiz"}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-none">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Brain size={32} className="text-agni-purple" />
              </motion.div>
              <p className="text-[11px] font-bold text-muted-foreground">AGNI is analyzing this content...</p>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-agni-purple/40" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-agni-red/10 border border-agni-red/20 rounded-xl p-3 mt-2">
              <p className="text-[10px] text-agni-red font-bold">{error}</p>
            </div>
          )}

          {result && activeSection === "summary" && (
            <div className="space-y-3 mt-1">
              {/* TL;DR */}
              {result.summary && (
                <div className="bg-agni-green/5 border border-agni-green/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lightbulb size={11} className="text-agni-green" />
                    <span className="text-[8px] font-black text-agni-green uppercase tracking-wider">TL;DR</span>
                  </div>
                  <p className="text-[11px] text-foreground font-medium leading-relaxed">{result.summary}</p>
                </div>
              )}

              {/* Key Points */}
              {result.keyPoints?.length > 0 && (
                <div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-1">Key Points</span>
                  <div className="space-y-1.5 mt-1.5">
                    {result.keyPoints.map((point: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 bg-card rounded-xl p-2.5 border border-border/15"
                      >
                        <div className="w-5 h-5 rounded-full bg-agni-blue/15 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-black text-agni-blue">{i + 1}</span>
                        </div>
                        <p className="text-[10px] text-foreground font-medium leading-relaxed">{point}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concepts */}
              {result.concepts?.length > 0 && (
                <div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-1">Key Concepts</span>
                  <div className="space-y-1.5 mt-1.5">
                    {result.concepts.map((c: any, i: number) => (
                      <div key={i} className="bg-agni-purple/5 border border-agni-purple/15 rounded-xl p-2.5">
                        <span className="text-[10px] font-black text-agni-purple">{c.term}</span>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {result.actionItems?.length > 0 && (
                <div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-1">Action Items</span>
                  <div className="space-y-1 mt-1.5">
                    {result.actionItems.map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-foreground font-medium">
                        <div className="w-4 h-4 rounded border border-agni-green/30 flex items-center justify-center shrink-0">
                          <Check size={8} className="text-agni-green/40" />
                        </div>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Topics */}
              {result.relatedTopics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.relatedTopics.map((t: string, i: number) => (
                    <span key={i} className="text-[8px] font-bold bg-card border border-border/20 rounded-full px-2.5 py-1 text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Take to Chat CTA */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Build a summary string from the AI result
                  const summaryParts: string[] = [];
                  summaryParts.push(`Topic: ${item.title}`);
                  if (result.summary) summaryParts.push(`Summary: ${result.summary}`);
                  if (result.keyPoints?.length) summaryParts.push(`Key Points:\n${result.keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}`);
                  if (result.concepts?.length) summaryParts.push(`Key Concepts:\n${result.concepts.map((c: any) => `• ${c.term}: ${c.explanation}`).join("\n")}`);
                  if (result.actionItems?.length) summaryParts.push(`Action Items:\n${result.actionItems.map((a: string) => `• ${a}`).join("\n")}`);
                  const fullSummary = summaryParts.join("\n\n");
                  onClose();
                  navigate("/chat", { state: { tab: "curriculum", prefill: `I just read this summary, help me dive deeper:\n\n${fullSummary}`, autoSend: true } });
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-agni-green to-agni-blue text-white text-[12px] font-black flex items-center justify-center gap-2 mt-2 shadow-lg"
              >
                <MessageCircleMore size={16} />
                Let's take this to Chat 🚀
              </motion.button>
            </div>
          )}

          {result && activeSection === "quiz" && result.quiz?.length > 0 && (
            <QuizSection quiz={result.quiz} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Mini quiz from AI Learn */
function QuizSection({ quiz }: { quiz: any[] }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const q = quiz[currentQ];
  if (!q) return null;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const nextQ = () => {
    setSelected(null);
    setCurrentQ(c => c + 1);
  };

  if (currentQ >= quiz.length) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 gap-3">
        <div className="text-4xl">🎉</div>
        <p className="text-lg font-black text-foreground">{score}/{quiz.length} correct!</p>
        <p className="text-[11px] text-muted-foreground">{score === quiz.length ? "Perfect! You nailed it!" : "Keep learning and try again!"}</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setCurrentQ(0); setSelected(null); setScore(0); }}
          className="text-[10px] font-bold text-agni-blue bg-agni-blue/10 px-4 py-2 rounded-full mt-2"
        >
          Retry Quiz
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-muted-foreground">Question {currentQ + 1}/{quiz.length}</span>
        <span className="text-[9px] font-bold text-agni-green">{score} correct</span>
      </div>
      <p className="text-[12px] font-extrabold text-foreground leading-snug">{q.question}</p>
      <div className="space-y-2">
        {q.options?.map((opt: string, i: number) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correct;
          const showResult = selected !== null;
          return (
            <motion.button
              key={i}
              whileTap={!showResult ? { scale: 0.97 } : undefined}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all text-[11px] font-bold ${
                showResult
                  ? isCorrect
                    ? "border-agni-green bg-agni-green/10 text-agni-green"
                    : isSelected
                      ? "border-agni-red bg-agni-red/10 text-agni-red"
                      : "border-border/20 bg-card text-muted-foreground"
                  : "border-border/20 bg-card text-foreground active:border-agni-blue/50"
              }`}
            >
              <span className="mr-2 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {showResult && isCorrect && <Check size={12} className="inline ml-2" />}
              {showResult && isSelected && !isCorrect && <X size={12} className="inline ml-2" />}
            </motion.button>
          );
        })}
      </div>
      {selected !== null && currentQ < quiz.length - 1 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.95 }} onClick={nextQ}
          className="w-full py-2.5 rounded-xl bg-agni-blue text-white text-[11px] font-black"
        >
          Next Question →
        </motion.button>
      )}
      {selected !== null && currentQ === quiz.length - 1 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.95 }} onClick={nextQ}
          className="w-full py-2.5 rounded-xl bg-agni-green text-white text-[11px] font-black"
        >
          See Results 🎉
        </motion.button>
      )}
    </div>
  );
}

const DATE_FILTERS = [
  { id: "all", label: "All Time" },
  { id: "24h", label: "Last 24h" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
] as const;

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "popular", label: "Most Popular" },
  { id: "recommended", label: "Recommended" },
] as const;

const CuriosityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const { followed, isFollowed } = useFollowedSources();
  const storedName = getCurrentScopedStorage().get<string>("user_name", "") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;

  const [activeTab, setActiveTab] = useState<"feed" | "saved" | "explore">("feed");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sparkIdx, setSparkIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [feedFilter, setFeedFilter] = useState("all");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(() => getCurrentScopedStorage().get<string | null>("spark_last_fetch", null));
  const [savedItems, setSavedItems] = useState<Set<number>>(() => {
    const arr = getCurrentScopedStorage().get<number[]>("spark_saved", []);
    return new Set(arr);
  });
  const [likedItems, setLikedItems] = useState<Set<number>>(() => {
    const arr = getCurrentScopedStorage().get<number[]>("spark_liked", []);
    return new Set(arr);
  });
  const [learnItem, setLearnItem] = useState<any>(null);
  const [feedItems, setFeedItems] = useState<any[]>(() => {
    return getCurrentScopedStorage().get<any[]>("spark_feed_cache", []);
  });
  const [viewedItems, setViewedItems] = useState<number[]>(() => {
    return getCurrentScopedStorage().get<number[]>("spark_viewed", []);
  });
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreFilter, setExploreFilter] = useState("all");

  const feedEndRef = useRef<HTMLDivElement>(null);

  const followedSources = useMemo(
    () => ALL_SOURCES.filter(s => isFollowed(s.name)),
    [followed, isFollowed]
  );

  // Filter feed items by type, source, date
  const filteredFeedItems = useMemo(() => {
    let items = feedItems;
    
    // Source filter
    if (activeSource) {
      items = items.filter(item => item.sourceName === activeSource);
    }
    
    // Type filter
    if (feedFilter !== "all") {
      items = items.filter(item => {
        const meta = getContentMeta(item.url);
        if (feedFilter === "youtube") return meta.type === "youtube" || meta.type === "instagram";
        if (feedFilter === "article") return meta.type === "article";
        if (feedFilter === "news") return item.type === "news";
        return true;
      });
    }
    
    // Sort
    if (sortBy === "popular") {
      items = [...items].sort((a, b) => {
        const aViews = parseInt(a.engagement) || 0;
        const bViews = parseInt(b.engagement) || 0;
        return bViews - aViews;
      });
    }
    
    return items;
  }, [feedItems, feedFilter, activeSource, dateFilter, sortBy]);

  const toggleSave = (idx: number) => {
    setSavedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      getCurrentScopedStorage().set("spark_saved", [...next]);
      return next;
    });
    toast.success(savedItems.has(idx) ? "Removed from saved" : "Saved for later! 🔖");
  };

  const toggleLike = (idx: number) => {
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      getCurrentScopedStorage().set("spark_liked", [...next]);
      return next;
    });
  };

  const markViewed = (idx: number) => {
    setViewedItems(prev => {
      if (prev.includes(idx)) {
        // Move to front
        const next = [idx, ...prev.filter(i => i !== idx)].slice(0, 20);
        getCurrentScopedStorage().set("spark_viewed", next);
        return next;
      }
      const next = [idx, ...prev].slice(0, 20);
      getCurrentScopedStorage().set("spark_viewed", next);
      return next;
    });
  };

  const recentlyViewedItems = useMemo(() =>
    viewedItems.map(i => feedItems[i]).filter(Boolean).slice(0, 8),
    [viewedItems, feedItems]
  );

  const getCachedResults = (catId: string): any[] => {
    return getCurrentScopedStorage().get<any[]>(`spark_cache_${catId}`, []);
  };

  const fetchFeed = useCallback(async (append = false) => {
    if (followed.length === 0) return;
    if (append) setFeedLoadingMore(true);
    else setFeedLoading(true);
    try {
      const sourceNames = followed.slice(0, 15).join(", ");
      const { data, error: fnError } = await supabase.functions.invoke("ai-curiosity", {
        body: {
          query: `Latest news, YouTube videos, Instagram posts, and updates from: ${sourceNames}. Give brief Inshorts-style summaries with real URLs. Include YouTube video links and article URLs where possible. Include engagement metrics like view count estimates.`,
          category: "feed",
          sourceSeeds: followed.slice(0, 15),
        },
      });
      if (fnError) throw new Error(fnError.message);
      const items = (data?.items || []).map((item: any, i: number) => ({
        ...item,
        sourceName: followed[i % followed.length],
        timestamp: getRelativeTime(i),
        engagement: Math.floor(Math.random() * 50 + 5) + "K views",
        readTime: item.type === "video" ? `${Math.floor(Math.random() * 15 + 3)}min` : `${Math.floor(Math.random() * 6 + 2)}min read`,
      }));
      if (items.length > 0) {
        const newItems = append ? [...feedItems, ...items] : items;
        setFeedItems(newItems);
        getCurrentScopedStorage().set("spark_feed_cache", newItems);
        const now = new Date().toISOString();
        setLastFetchTime(now);
        getCurrentScopedStorage().set("spark_last_fetch", now);
      }
    } catch (e: any) {
      toast.error("Couldn't refresh feed");
    }
    setFeedLoading(false);
    setFeedLoadingMore(false);
  }, [followed, feedItems]);

  // Auto-refresh explore data every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeId) {
        const cat = CURIOSITY.find(c => c.id === activeId);
        if (cat) fetchCuriosity(cat);
      }
      if (followed.length > 0 && feedItems.length > 0) {
        fetchFeed(false);
      }
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeId, followed, feedItems.length]);

  // Infinite scroll
  useEffect(() => {
    if (!feedEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && feedItems.length > 0 && !feedLoadingMore && !feedLoading) {
          fetchFeed(true);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(feedEndRef.current);
    return () => observer.disconnect();
  }, [feedItems.length, feedLoadingMore, feedLoading, fetchFeed]);

  const fetchCuriosity = async (cat: typeof CURIOSITY[0]) => {
    setActiveId(cat.id);
    setError("");
    const cached = getCachedResults(cat.id);
    setResults(cached);
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
        getCurrentScopedStorage().set(`spark_cache_${cat.id}`, items);
      } else if (cached.length === 0) {
        setError("No results found. Try again!");
      }
    } catch (e: any) {
      if (cached.length === 0) setError(e.message || "Failed to fetch.");
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
      <div className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
        <div className="max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto relative z-10">
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

          {/* ═══ TABS ═══ */}
          <FadeIn delay={0.02}>
            <div className="px-4 mb-3">
              <div className="flex gap-1 bg-card/60 backdrop-blur border border-border/30 rounded-2xl p-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black transition-all relative ${
                        isActive ? "text-white" : "text-muted-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="spark-tab-bg"
                          className="absolute inset-0 bg-gradient-to-r from-agni-green to-agni-blue rounded-xl"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon size={13} />
                        {tab.label}
                        {tab.id === "feed" && followed.length > 0 && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-agni-green/15 text-agni-green"}`}>
                            {followed.length}
                          </span>
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {activeTab === "feed" && (
              <motion.div key="feed-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                {/* Followed sources strip — tap to filter */}
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
                          const isActive = activeSource === source.name;
                          return (
                            <motion.button
                              key={source.name}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.03 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setActiveSource(isActive ? null : source.name)}
                              className="flex flex-col items-center gap-1 shrink-0"
                            >
                              <div className="relative">
                                <Avatar className={`w-11 h-11 border-2 transition-all ${isActive ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
                                  style={{ 
                                    borderColor: isActive ? catMeta?.color || '#58CC02' : `${catMeta?.color || '#58CC02'}50`,
                                    ...(isActive ? { ringColor: catMeta?.color } : {}),
                                  }}>
                                  <AvatarImage src={getSourceAvatar(source)} alt={source.name} />
                                  <AvatarFallback className="text-[9px] font-black bg-card" style={{ color: catMeta?.color }}>
                                    {source.name.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${isActive ? "bg-agni-gold" : "bg-agni-green"}`} />
                              </div>
                              <span className={`text-[8px] font-bold text-center w-12 truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{source.name}</span>
                            </motion.button>
                          );
                        })}
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

                {/* Active source banner */}
                <AnimatePresence>
                  {activeSource && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 mb-3 overflow-hidden"
                    >
                      <div className="bg-agni-blue/10 border border-agni-blue/20 rounded-2xl px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter size={11} className="text-agni-blue" />
                          <span className="text-[10px] font-black text-agni-blue">
                            Showing: {activeSource}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground">
                            ({filteredFeedItems.length} items)
                          </span>
                        </div>
                        <button onClick={() => setActiveSource(null)} className="w-5 h-5 rounded-full bg-agni-blue/10 flex items-center justify-center">
                          <X size={10} className="text-agni-blue" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FEED HEADER + FILTERS + REFRESH */}
                {followedSources.length > 0 && (
                  <div className="px-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Globe size={12} className="text-agni-blue" />
                        <span className="text-[10px] font-black text-muted-foreground tracking-wider">YOUR FEED</span>
                        {lastFetchTime && (
                          <span className="text-[8px] font-bold text-muted-foreground/40 ml-1">
                            • {(() => {
                              const diff = Date.now() - new Date(lastFetchTime).getTime();
                              const mins = Math.floor(diff / 60000);
                              if (mins < 1) return "just now";
                              if (mins < 60) return `${mins}m ago`;
                              const hrs = Math.floor(mins / 60);
                              if (hrs < 24) return `${hrs}h ago`;
                              return `${Math.floor(hrs / 24)}d ago`;
                            })()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowFilters(!showFilters)}
                          className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1.5 rounded-full transition-all ${
                            showFilters ? "bg-agni-gold/15 text-agni-gold" : "bg-muted/20 text-muted-foreground"
                          }`}
                        >
                          <Filter size={9} />
                          Filters
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => fetchFeed(false)}
                          disabled={feedLoading}
                          className="flex items-center gap-1 text-[9px] font-bold text-agni-blue bg-agni-blue/10 px-2.5 py-1.5 rounded-full"
                        >
                          {feedLoading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                          {feedLoading ? "Loading..." : "Refresh"}
                        </motion.button>
                      </div>
                    </div>

                    {/* Advanced filters */}
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-2"
                        >
                          <div className="bg-card/50 border border-border/20 rounded-2xl p-3 space-y-2.5">
                            {/* Sort */}
                            <div>
                              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Sort by</span>
                              <div className="flex gap-1.5 mt-1">
                                {SORT_OPTIONS.map(s => (
                                  <button key={s.id} onClick={() => setSortBy(s.id)}
                                    className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-all ${
                                      sortBy === s.id ? "bg-agni-blue/15 text-agni-blue border border-agni-blue/30" : "bg-muted/20 text-muted-foreground border border-transparent"
                                    }`}
                                  >{s.label}</button>
                                ))}
                              </div>
                            </div>
                            {/* Date */}
                            <div>
                              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">Time period</span>
                              <div className="flex gap-1.5 mt-1">
                                {DATE_FILTERS.map(d => (
                                  <button key={d.id} onClick={() => setDateFilter(d.id)}
                                    className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-all ${
                                      dateFilter === d.id ? "bg-agni-orange/15 text-agni-orange border border-agni-orange/30" : "bg-muted/20 text-muted-foreground border border-transparent"
                                    }`}
                                  >{d.label}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Content type filters */}
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                      {FEED_FILTERS.map((f) => {
                        const Icon = f.icon;
                        const isActive = feedFilter === f.id;
                        const baseItems = activeSource ? feedItems.filter(item => item.sourceName === activeSource) : feedItems;
                        const count = f.id === "all" ? baseItems.length : baseItems.filter(item => {
                          const meta = getContentMeta(item.url);
                          if (f.id === "youtube") return meta.type === "youtube" || meta.type === "instagram";
                          if (f.id === "article") return meta.type === "article";
                          return item.type === "news";
                        }).length;
                        return (
                          <motion.button
                            key={f.id}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setFeedFilter(f.id)}
                            className={`shrink-0 flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-1.5 rounded-full transition-all ${
                              isActive ? "bg-agni-green text-white" : "bg-card border border-border/30 text-muted-foreground"
                            }`}
                          >
                            <Icon size={10} />
                            {f.label}
                            {count > 0 && (
                              <span className={`text-[7px] font-black px-1 rounded-full ${isActive ? "bg-white/20" : "bg-muted/50"}`}>
                                {count}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty state */}
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
                          Go to Sources Hub → follow channels, creators & newsletters → get updates here
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-3 text-agni-green text-[11px] font-bold">
                          Open Sources Hub <ChevronRight size={12} />
                        </div>
                      </motion.button>
                    </div>
                  </FadeIn>
                )}

                {/* Load first time CTA */}
                {followedSources.length > 0 && feedItems.length === 0 && !feedLoading && (
                  <div className="px-4 mb-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => fetchFeed(false)}
                      className="w-full bg-card border-2 border-dashed border-agni-blue/20 rounded-2xl p-5 text-center"
                    >
                      <Sparkles size={20} className="text-agni-blue/40 mx-auto mb-2" />
                      <p className="text-[12px] font-bold text-foreground">Tap to load your personalized feed</p>
                      <p className="text-[9px] text-muted-foreground mt-1">
                        News & videos from {followed.length} source{followed.length !== 1 ? "s" : ""} you follow
                      </p>
                    </motion.button>
                  </div>
                )}

                {/* Initial loading skeleton */}
                {feedLoading && feedItems.length === 0 && (
                  <div className="px-4 space-y-3">
                    <div className="rounded-2xl bg-card border border-border/20 overflow-hidden animate-pulse">
                      <div className="w-full h-40 bg-muted/20" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted/20 rounded w-3/4" />
                        <div className="h-3 bg-muted/15 rounded w-full" />
                      </div>
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 rounded-2xl bg-card border border-border/20 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                )}

                {/* ═══ INFINITE SCROLL FEED ═══ */}
                {filteredFeedItems.length > 0 && (
                  <div className="px-4 space-y-3">
                    {filteredFeedItems.map((item, i) => {
                      const meta = getContentMeta(item.url);
                      const source = ALL_SOURCES.find(s => s.name === item.sourceName) || { name: item.sourceName || "AI News", url: "", desc: "", tags: [], category: "blog" };
                      const catMeta = SOURCE_CATEGORIES.find(c => c.id === source.category);
                      const isHero = i === 0;
                      const isSaved = savedItems.has(i);
                      const isLiked = likedItems.has(i);

                      if (isHero) {
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="rounded-2xl bg-card border-2 border-border/20 overflow-hidden"
                          >
                            {/* Thumbnail */}
                            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={() => markViewed(i)} className="block">
                              {meta.thumbnail ? (
                                <div className="relative w-full h-44 bg-muted/10">
                                  <img src={meta.thumbnail} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  {(meta.type === "youtube" || meta.type === "instagram") && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                        <Play size={20} className="text-black ml-0.5" fill="black" />
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                                    <Avatar className="w-5 h-5 border border-white/20">
                                      <AvatarImage src={getSourceAvatar(source)} alt="" />
                                      <AvatarFallback className="text-[6px] bg-muted">{source.name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[8px] font-bold text-white">{item.sourceName}</span>
                                  </div>
                                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1" style={{ background: `${meta.color}CC` }}>
                                    <meta.icon size={9} className="text-white" />
                                    <span className="text-[8px] font-bold text-white">{meta.label}</span>
                                  </div>
                                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                                      <Eye size={8} className="text-white/70" />
                                      <span className="text-[7px] font-bold text-white/70">{item.engagement}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                                      <Clock size={8} className="text-white/70" />
                                      <span className="text-[7px] font-bold text-white/70">{item.readTime}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative w-full h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${meta.color}20, ${catMeta?.color || '#58CC02'}15)` }}>
                                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${meta.color}20` }}>
                                    <meta.icon size={24} style={{ color: meta.color }} />
                                  </div>
                                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                                    <Avatar className="w-5 h-5 border border-white/20">
                                      <AvatarImage src={getSourceAvatar(source)} alt="" />
                                      <AvatarFallback className="text-[6px] bg-muted">{source.name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[8px] font-bold text-white">{item.sourceName}</span>
                                  </div>
                                </div>
                              )}
                            </a>
                            <div className="p-3">
                              <h3 className="text-[13px] font-black text-foreground leading-tight mb-1">{item.title}</h3>
                              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
                              {/* Action bar */}
                              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/10">
                                <div className="flex items-center gap-2">
                                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleLike(i)}
                                    className={`flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-1 ${isLiked ? "bg-agni-pink/15 text-agni-pink" : "text-muted-foreground"}`}>
                                    <ThumbsUp size={10} className={isLiked ? "fill-agni-pink" : ""} /> {isLiked ? "Liked" : "Like"}
                                  </motion.button>
                                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleSave(i)}
                                    className={`flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-1 ${isSaved ? "bg-agni-gold/15 text-agni-gold" : "text-muted-foreground"}`}>
                                    <Bookmark size={10} className={isSaved ? "fill-agni-gold" : ""} /> {isSaved ? "Saved" : "Save"}
                                  </motion.button>
                                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => shareItem(item)}
                                    className="flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-1 text-muted-foreground">
                                    <Share2 size={10} /> Share
                                  </motion.button>
                                </div>
                                {/* 🧠 AI Learn Button */}
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setLearnItem(item)}
                                  className="flex items-center gap-1.5 bg-gradient-to-r from-agni-purple/20 to-agni-pink/15 text-agni-purple text-[10px] font-black px-3.5 py-2 rounded-xl border border-agni-purple/25 shadow-sm"
                                >
                                  <Brain size={13} />
                                  AI Notes ✨
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      // ═══ COMPACT CARDS ═══
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.3) }}
                          className="bg-card rounded-2xl border border-border/20 overflow-hidden relative"
                        >
                          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={() => markViewed(i)}
                            className="flex gap-3 p-3"
                          >
                            {/* Left: Thumbnail or icon */}
                            <div className="shrink-0 relative">
                              {meta.thumbnail ? (
                                <div className="w-20 h-16 rounded-xl overflow-hidden relative bg-muted/10">
                                  <img src={meta.thumbnail} alt="" className="w-full h-full object-cover" />
                                  {(meta.type === "youtube" || meta.type === "instagram") && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                      <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                                        <Play size={11} className="text-black ml-0.5" fill="black" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                                  style={{ background: `${meta.color}15` }}
                                >
                                  <meta.icon size={18} style={{ color: meta.color }} />
                                </div>
                              )}
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Avatar className="w-4 h-4 border border-border/20">
                                    <AvatarImage src={getSourceAvatar(source)} alt="" />
                                    <AvatarFallback className="text-[5px] bg-muted">{source.name.slice(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-[8px] font-bold text-muted-foreground truncate">{item.sourceName}</span>
                                  <span className="text-[7px] text-muted-foreground/40">•</span>
                                  <span className="text-[7px] text-muted-foreground/40">{item.timestamp}</span>
                                </div>
                                <h4 className="text-[11px] font-extrabold text-foreground leading-tight line-clamp-2">{item.title}</h4>
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-1 rounded-full px-1.5 py-0.5" style={{ background: `${meta.color}15` }}>
                                    <meta.icon size={8} style={{ color: meta.color }} />
                                    <span className="text-[7px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                                  </div>
                                  <span className="text-[7px] text-muted-foreground/40">{item.readTime}</span>
                                </div>
                              </div>
                            </div>
                          </a>

                          {/* Action bar for compact cards */}
                          <div className="flex items-center justify-between px-3 pb-2 pt-0">
                            <div className="flex items-center gap-1.5">
                              <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleLike(i)}
                                className={`p-1.5 rounded-full ${isLiked ? "text-agni-pink" : "text-muted-foreground/40"}`}>
                                <ThumbsUp size={11} className={isLiked ? "fill-agni-pink" : ""} />
                              </motion.button>
                              <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleSave(i)}
                                className={`p-1.5 rounded-full ${isSaved ? "text-agni-gold" : "text-muted-foreground/40"}`}>
                                <Bookmark size={11} className={isSaved ? "fill-agni-gold" : ""} />
                              </motion.button>
                              <motion.button whileTap={{ scale: 0.8 }} onClick={() => shareItem(item)}
                                className="p-1.5 rounded-full text-muted-foreground/40">
                                <Share2 size={11} />
                              </motion.button>
                            </div>
                            {/* 🧠 AI Learn Button */}
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setLearnItem(item)}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-agni-purple/20 to-agni-pink/15 text-agni-purple text-[10px] font-black px-3.5 py-2 rounded-xl border border-agni-purple/25 shadow-sm"
                            >
                              <Brain size={13} /> AI Notes ✨
                            </motion.button>
                          </div>

                          {/* Accent stripe */}
                          <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: meta.color }} />
                        </motion.div>
                      );
                    })}

                    {/* Load more */}
                    <div ref={feedEndRef} className="py-4 flex items-center justify-center">
                      {feedLoadingMore ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-agni-blue" />
                          <span className="text-[10px] font-bold text-muted-foreground">Loading more...</span>
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fetchFeed(true)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-agni-blue bg-agni-blue/10 px-4 py-2 rounded-full"
                        >
                          <RefreshCw size={10} /> Load more
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ RECENTLY VIEWED ═══ */}
                {recentlyViewedItems.length > 0 && (
                  <FadeIn delay={0.06}>
                    <div className="px-4 mb-3 mt-2">
                      <div className="flex items-center gap-1.5 mb-2">
                        <History size={11} className="text-agni-purple" />
                        <span className="text-[9px] font-black text-muted-foreground tracking-wider">RECENTLY VIEWED</span>
                        <span className="text-[8px] font-bold text-muted-foreground/50 ml-auto">{recentlyViewedItems.length} items</span>
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
                        {recentlyViewedItems.map((item, j) => {
                          const meta = getContentMeta(item.url);
                          return (
                            <motion.a
                              key={j}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: j * 0.04 }}
                              className="shrink-0 w-36 bg-card rounded-xl border border-border/20 overflow-hidden group"
                            >
                              {meta.thumbnail ? (
                                <div className="w-full h-20 bg-muted/10 relative">
                                  <img src={meta.thumbnail} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                  {(meta.type === "youtube" || meta.type === "instagram") && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                                        <Play size={10} className="text-black ml-0.5" fill="black" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-16 flex items-center justify-center" style={{ background: `${meta.color}10` }}>
                                  <meta.icon size={18} style={{ color: meta.color }} />
                                </div>
                              )}
                              <div className="p-2">
                                <p className="text-[9px] font-extrabold text-foreground line-clamp-2 leading-tight">{item.title}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                                  <span className="text-[7px] font-bold text-muted-foreground">{meta.label}</span>
                                </div>
                              </div>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  </FadeIn>
                )}

                {/* Spark fact */}
                <FadeIn delay={0.08}>
                  <div className="mx-4 rounded-2xl overflow-hidden mb-4 border-2 border-agni-gold/15 mt-2">
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
              </motion.div>
            )}

            {/* ═══ SAVED TAB ═══ */}
            {activeTab === "saved" && (
              <motion.div key="saved-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="px-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Bookmark size={12} className="text-agni-gold" />
                    <span className="text-[10px] font-black text-muted-foreground tracking-wider">SAVED ITEMS</span>
                    <span className="text-[8px] font-bold text-muted-foreground/50 ml-auto">{savedItems.size} saved</span>
                  </div>

                  {savedItems.size === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark size={32} className="text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm font-black text-foreground/60">No saved items yet</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Tap the bookmark icon on any feed item to save it here</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
                      {feedItems.filter((_, i) => savedItems.has(i)).map((item, j) => {
                        const originalIdx = feedItems.indexOf(item);
                        const meta = getContentMeta(item.url);
                        const source = ALL_SOURCES.find(s => s.name === item.sourceName) || { name: item.sourceName || "AI News", url: "", desc: "", tags: [], category: "blog" };
                        const catMeta = SOURCE_CATEGORIES.find(c => c.id === source.category);
                        return (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: j * 0.05 }}
                            className="bg-card rounded-2xl border border-agni-gold/20 overflow-hidden relative"
                          >
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 p-3">
                              <div className="shrink-0">
                                {meta.thumbnail ? (
                                  <div className="w-20 h-16 rounded-xl overflow-hidden relative bg-muted/10">
                                    <img src={meta.thumbnail} alt="" className="w-full h-full object-cover" />
                                    {(meta.type === "youtube" || meta.type === "instagram") && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                                          <Play size={11} className="text-black ml-0.5" fill="black" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}15` }}>
                                    <meta.icon size={18} style={{ color: meta.color }} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Avatar className="w-4 h-4 border border-border/20">
                                    <AvatarImage src={getSourceAvatar(source)} alt="" />
                                    <AvatarFallback className="text-[5px] bg-muted">{source.name.slice(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-[8px] font-bold text-muted-foreground truncate">{item.sourceName}</span>
                                </div>
                                <h4 className="text-[11px] font-extrabold text-foreground leading-tight line-clamp-2">{item.title}</h4>
                              </div>
                            </a>
                            <div className="flex items-center justify-between px-3 pb-2 pt-0">
                              <div className="flex items-center gap-1.5">
                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleSave(originalIdx)}
                                  className="p-1.5 rounded-full text-agni-gold">
                                  <Bookmark size={11} className="fill-agni-gold" />
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => shareItem(item)}
                                  className="p-1.5 rounded-full text-muted-foreground/40">
                                  <Share2 size={11} />
                                </motion.button>
                              </div>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLearnItem(item)}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-agni-purple/20 to-agni-pink/15 text-agni-purple text-[10px] font-black px-3.5 py-2 rounded-xl border border-agni-purple/25 shadow-sm">
                                <Brain size={13} /> AI Notes ✨
                              </motion.button>
                            </div>
                            <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-agni-gold" />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ EXPLORE TAB — Redesigned like job cards ═══ */}
            {activeTab === "explore" && (
              <motion.div key="explore-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <div className="px-4">
                  {/* Search bar */}
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <input
                      type="text"
                      placeholder="Search topics or categories..."
                      value={exploreSearch}
                      onChange={(e) => setExploreSearch(e.target.value)}
                      className="w-full bg-card border border-border/30 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-agni-green/40"
                    />
                  </div>

                  {/* Filter chips */}
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-4">
                    {[
                      { id: "all", label: "Discover", color: "#58CC02" },
                      { id: "saved", label: "Saved", color: "#FFC800" },
                      { id: "new", label: "New", color: "#1CB0F6" },
                    ].map(chip => {
                      const isChipActive = exploreFilter === chip.id;
                      return (
                        <motion.button
                          key={chip.id}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setExploreFilter(chip.id)}
                          className="shrink-0 px-4 py-2 rounded-full text-[10px] font-black transition-all"
                          style={{
                            background: isChipActive ? chip.color : 'hsl(var(--card))',
                            color: isChipActive ? '#fff' : 'hsl(var(--muted-foreground))',
                            border: `1.5px solid ${isChipActive ? chip.color : 'hsl(var(--border) / 0.3)'}`,
                          }}
                        >
                          {chip.label}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Auto-refresh message */}
                  <div className="flex items-center gap-1.5 mb-3 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-agni-green animate-pulse" />
                    <span className="text-[8px] font-bold text-muted-foreground/60">Auto-refreshes every 15 mins with fresh AI insights</span>
                  </div>

                  {/* Category Cards — Netflix-ranked colorful cards */}
                  <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
                    {CURIOSITY
                      .filter(cat => !exploreSearch || cat.label.toLowerCase().includes(exploreSearch.toLowerCase()) || cat.desc.toLowerCase().includes(exploreSearch.toLowerCase()))
                      .map((cat, i) => {
                      const isActive = activeId === cat.id;
                      const rank = i + 1;
                      const tags = cat.desc.split(/[,&]/).map(t => t.trim()).filter(Boolean);
                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-2xl overflow-hidden"
                          style={{ border: isActive ? `2px solid ${cat.color}80` : '2px solid transparent' }}
                        >
                          {/* Card header with colored background */}
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => fetchCuriosity(cat)}
                            className="w-full text-left p-4 relative overflow-hidden"
                            style={{ background: cat.bgGradient }}
                          >
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-15 -translate-y-1/2 translate-x-1/2 bg-white" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4 bg-white" />

                            <div className="flex items-start justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                {/* Netflix-style rank number */}
                                <div className="relative">
                                  <span className="text-[42px] font-black text-white/20 leading-none" style={{ fontFamily: 'Georgia, serif', WebkitTextStroke: '1.5px rgba(255,255,255,0.3)' }}>
                                    {rank}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[14px] font-black text-white">{cat.label}</p>
                                  <p className="text-[10px] text-white/70 mt-0.5">{cat.desc}</p>
                                </div>
                              </div>
                              <motion.div
                                whileTap={{ scale: 0.85 }}
                                className="flex items-center gap-1 rounded-full px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/20 text-[9px] font-black text-white"
                              >
                                View <ExternalLink size={9} />
                              </motion.div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mt-3 relative z-10">
                              {tags.map((tag, ti) => (
                                <span
                                  key={ti}
                                  className="text-[8px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-sm"
                                >
                                  {tag}
                                </span>
                              ))}
                              {isActive && loading && (
                                <span className="text-[8px] font-bold px-2.5 py-1 rounded-full bg-white/25 text-white flex items-center gap-1">
                                  <Loader2 size={8} className="animate-spin" /> Loading...
                                </span>
                              )}
                            </div>
                          </motion.button>

                          {/* Bottom bar — dark card style */}
                          <div className="px-4 py-2.5 flex items-center justify-between bg-card border-t border-border/10">
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted-foreground">
                              <Clock size={9} className="opacity-50" />
                              Updated recently
                            </div>
                            <div className="flex items-center gap-1.5">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => setLearnItem({ title: cat.label, desc: cat.desc, url: "" })}
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ background: `${cat.color}15` }}
                              >
                                <Brain size={10} style={{ color: cat.color }} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => shareItem({ title: cat.label, desc: cat.desc })}
                                className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/20"
                              >
                                <Share2 size={10} className="text-muted-foreground/50" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Expanded results */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3 pt-1 space-y-2 bg-card border-t border-border/10">
                                  {error && (
                                    <div className="bg-agni-red/10 border border-agni-red/20 rounded-xl p-2.5">
                                      <p className="text-[10px] text-agni-red font-semibold">{error}</p>
                                      <button onClick={() => fetchCuriosity(cat)} className="mt-1 text-[9px] font-bold text-agni-green flex items-center gap-1">
                                        <RefreshCw size={9} /> Retry
                                      </button>
                                    </div>
                                  )}

                                  {loading && !results.length && (
                                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                                      <Loader2 size={24} className="animate-spin" style={{ color: cat.color }} />
                                      <p className="text-[10px] font-bold text-muted-foreground">Loading insights...</p>
                                      <div className="space-y-1.5 w-full mt-1">
                                        {[1, 2, 3].map(j => (
                                          <div key={j} className="h-14 rounded-xl bg-muted/10 animate-pulse" style={{ animationDelay: `${j * 100}ms` }} />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {results.map((item: any, j: number) => (
                                    <motion.div key={j}
                                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: j * 0.04 }}
                                      className="flex items-center gap-2 rounded-xl p-2.5 border"
                                      style={{ background: `${cat.color}05`, borderColor: `${cat.color}15` }}
                                    >
                                      {/* Result rank */}
                                      <span className="text-[18px] font-black shrink-0 w-6 text-center" style={{ color: `${cat.color}40` }}>{j + 1}</span>
                                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                          style={{ background: `${cat.color}15` }}
                                        >{typeIcons[item.type] || "🔗"}</div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[10px] font-extrabold text-foreground truncate">{item.title}</p>
                                          <p className="text-[8px] text-muted-foreground truncate">{item.desc}</p>
                                        </div>
                                      </a>
                                      <motion.button
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setLearnItem(item)}
                                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ background: `${cat.color}15` }}
                                      >
                                        <Brain size={11} style={{ color: cat.color }} />
                                      </motion.button>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/sources")}
                    className="w-full bg-foreground text-background rounded-2xl py-3 text-[12px] font-black text-center mt-4"
                  >
                    📚 Browse Sources Hub
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Learn Modal */}
        <AnimatePresence>
          {learnItem && <AILearnModal item={learnItem} onClose={() => setLearnItem(null)} />}
        </AnimatePresence>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default CuriosityPage;
