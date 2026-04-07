import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ExternalLink, Search, Zap, User, BookOpen, X, RefreshCw, Loader2, ChevronRight, ChevronLeft, Clock, Flame, Heart, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";

type Source = { title: string; desc: string; url: string; icon: string; type: string };
type NewsItem = { title: string; summary: string; source: string; category: string; timeAgo: string };

// Categories (bookshelf-style)
const CATEGORIES = [
  {
    id: "youtube",
    label: "Watch",
    shelfColor: "hsl(var(--agni-orange))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-orange) / 0.6) 0%, hsl(var(--agni-orange) / 0.9) 100%)",
  },
  {
    id: "tool",
    label: "Build",
    shelfColor: "hsl(var(--agni-green))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-green) / 0.6) 0%, hsl(var(--agni-green) / 0.9) 100%)",
  },
  {
    id: "newsletter",
    label: "Read",
    shelfColor: "hsl(var(--agni-gold))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-gold) / 0.6) 0%, hsl(var(--agni-gold) / 0.9) 100%)",
  },
  {
    id: "github",
    label: "Code",
    shelfColor: "hsl(var(--agni-purple))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-purple) / 0.6) 0%, hsl(var(--agni-purple) / 0.9) 100%)",
  },
  {
    id: "course",
    label: "Study",
    shelfColor: "hsl(var(--agni-blue))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-blue) / 0.6) 0%, hsl(var(--agni-blue) / 0.9) 100%)",
  },
  {
    id: "paper",
    label: "Research",
    shelfColor: "hsl(var(--agni-pink))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-pink) / 0.6) 0%, hsl(var(--agni-pink) / 0.9) 100%)",
  },
  {
    id: "community",
    label: "Connect",
    shelfColor: "hsl(var(--agni-gold))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-gold) / 0.6) 0%, hsl(var(--agni-gold) / 0.9) 100%)",
  },
  {
    id: "podcast",
    label: "Listen",
    shelfColor: "hsl(var(--agni-purple))",
    shelfGradient: "linear-gradient(180deg, hsl(var(--agni-purple) / 0.6) 0%, hsl(var(--agni-purple) / 0.9) 100%)",
  },
];

const ICON_BG_COLORS: Record<string, string> = {
  youtube: "#FF4B4B",
  tool: "#58CC02",
  newsletter: "#FF9600",
  github: "#CE82FF",
  course: "#1CB0F6",
  paper: "#FF4B91",
  community: "#FFC800",
  podcast: "#9B59B6",
};

const SOURCES: Source[] = [
  { title: "AI Jason", desc: "Deep dives into AI agents & tutorials", url: "https://youtube.com/@AIJason", icon: "🎬", type: "youtube" },
  { title: "Matt Wolfe", desc: "Weekly AI tools roundup & demos", url: "https://youtube.com/@maboroshi", icon: "🎬", type: "youtube" },
  { title: "Dave Ebbelaar", desc: "Practical AI agent builds", url: "https://youtube.com/@daveebbelaar", icon: "🎬", type: "youtube" },
  { title: "Cole Medin", desc: "AI automation tutorials", url: "https://youtube.com/@ColeMedin", icon: "🎬", type: "youtube" },
  { title: "Sam Witteveen", desc: "LangChain & multi-agent systems", url: "https://youtube.com/@samwitteveenai", icon: "🎬", type: "youtube" },
  { title: "James Briggs", desc: "LangChain & vector DB deep dives", url: "https://youtube.com/@jamesbriggs", icon: "🎬", type: "youtube" },
  { title: "Prompt Engineering", desc: "Agent architectures & patterns", url: "https://youtube.com/@PromptEngineering", icon: "🎬", type: "youtube" },
  { title: "The Rundown AI", desc: "Daily AI news with agent focus", url: "https://therundown.ai", icon: "📨", type: "newsletter" },
  { title: "Ben's Bites", desc: "Curated AI agent launches", url: "https://bensbites.com", icon: "📨", type: "newsletter" },
  { title: "Superhuman AI", desc: "Weekly AI tools & tips", url: "https://superhuman.ai", icon: "📨", type: "newsletter" },
  { title: "AI Brews", desc: "Business-focused AI insights", url: "https://aibrews.com", icon: "📨", type: "newsletter" },
  { title: "LangChain / LangGraph", desc: "Production-grade agent framework", url: "https://langchain.com", icon: "🔧", type: "tool" },
  { title: "CrewAI", desc: "Role-based multi-agent orchestration", url: "https://crewai.com", icon: "🔧", type: "tool" },
  { title: "n8n", desc: "No-code AI agent workflows", url: "https://n8n.io", icon: "🔧", type: "tool" },
  { title: "Anthropic MCP", desc: "Model Context Protocol — 12K+ servers", url: "https://modelcontextprotocol.io", icon: "🔧", type: "tool" },
  { title: "OpenAI Agents SDK", desc: "Official SDK for building agents", url: "https://github.com/openai/openai-agents-python", icon: "🔧", type: "tool" },
  { title: "Google ADK", desc: "Agent Development Kit with A2A", url: "https://google.github.io/adk-docs", icon: "🔧", type: "tool" },
  { title: "AutoGen (AG2)", desc: "Microsoft's multi-agent framework", url: "https://microsoft.github.io/autogen", icon: "🔧", type: "tool" },
  { title: "Composio", desc: "250+ tool integrations for agents", url: "https://composio.dev", icon: "🔧", type: "tool" },
  { title: "r/AI_Agents", desc: "Reddit community for agent builders", url: "https://reddit.com/r/AI_Agents", icon: "👥", type: "community" },
  { title: "LangChain Discord", desc: "Active agent developer community", url: "https://discord.gg/langchain", icon: "👥", type: "community" },
  { title: "Hugging Face", desc: "Open-source models & spaces", url: "https://huggingface.co", icon: "👥", type: "community" },
  { title: "Latent Space", desc: "Technical AI engineering podcast", url: "https://latent.space", icon: "🎙️", type: "podcast" },
  { title: "Practical AI", desc: "Making AI practical — agents", url: "https://practicalai.fm", icon: "🎙️", type: "podcast" },
  { title: "LangChain", desc: "100K+ stars — LLM framework", url: "https://github.com/langchain-ai/langchain", icon: "💻", type: "github" },
  { title: "AutoGen", desc: "Multi-agent conversation framework", url: "https://github.com/microsoft/autogen", icon: "💻", type: "github" },
  { title: "CrewAI", desc: "Role-based AI agent orchestration", url: "https://github.com/crewAIInc/crewAI", icon: "💻", type: "github" },
  { title: "MetaGPT", desc: "SOP-driven multi-agent framework", url: "https://github.com/geekan/MetaGPT", icon: "💻", type: "github" },
  { title: "Awesome AI Agents", desc: "Curated list of agent projects", url: "https://github.com/e2b-dev/awesome-ai-agents", icon: "💻", type: "github" },
  { title: "DeepLearning.AI", desc: "Andrew Ng's AI agent courses", url: "https://deeplearning.ai/short-courses", icon: "🎓", type: "course" },
  { title: "LangChain Academy", desc: "Free official LangGraph courses", url: "https://academy.langchain.com", icon: "🎓", type: "course" },
  { title: "HF Agents Course", desc: "Open-source agents course", url: "https://huggingface.co/learn/agents-course", icon: "🎓", type: "course" },
  { title: "ReAct Paper", desc: "Foundational reasoning + acting", url: "https://arxiv.org/abs/2210.03629", icon: "🔬", type: "paper" },
  { title: "Toolformer", desc: "Teaching LLMs to use tools", url: "https://arxiv.org/abs/2302.04761", icon: "🔬", type: "paper" },
  { title: "Generative Agents", desc: "Believable agent simulacra", url: "https://arxiv.org/abs/2304.03442", icon: "🔬", type: "paper" },
  { title: "Chain-of-Thought", desc: "Enabling reasoning in LLMs", url: "https://arxiv.org/abs/2201.11903", icon: "🔬", type: "paper" },
];

const NEWS_CATEGORY_COLORS: Record<string, string> = {
  launch: "#FF4B4B", funding: "#58CC02", research: "#CE82FF",
  product: "#1CB0F6", policy: "#FF9600", "open-source": "#FFC800",
};
const NEWS_CATEGORY_EMOJIS: Record<string, string> = {
  launch: "🚀", funding: "💰", research: "🔬",
  product: "⚡", policy: "🛡️", "open-source": "🌐",
};

/* ─── Bookshelf Carousel Row ─── */
const ShelfRow = ({ category, sources }: { category: typeof CATEGORIES[0]; sources: Source[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const bgColor = ICON_BG_COLORS[category.id] || "#58CC02";

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  useEffect(() => {
    checkScroll();
  }, []);

  if (sources.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-2.5">
        <h2 className="text-[16px] font-black text-foreground">{category.label}</h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted-foreground">{sources.length} resources</span>
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-6 h-6 rounded-full border border-border/50 flex items-center justify-center transition-opacity ${canScrollLeft ? "opacity-100" : "opacity-30"}`}
            >
              <ChevronLeft size={12} className="text-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-6 h-6 rounded-full border border-border/50 flex items-center justify-center transition-opacity ${canScrollRight ? "opacity-100" : "opacity-30"}`}
            >
              <ChevronRight size={12} className="text-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Shelf with items */}
      <div className="relative">
        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto scrollbar-none px-5 pb-2 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sources.map((source, i) => (
            <motion.a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95, y: -4 }}
              className="snap-start shrink-0 w-[120px] group"
            >
              {/* Book card */}
              <div
                className="w-[120px] h-[160px] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-3 text-center transition-shadow"
                style={{
                  background: `linear-gradient(145deg, ${bgColor}15 0%, ${bgColor}08 100%)`,
                  border: `2px solid ${bgColor}25`,
                  boxShadow: `3px 3px 0 0 ${bgColor}15`,
                }}
              >
                {/* Decorative spine */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl"
                  style={{ background: bgColor }}
                />
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-2 shadow-sm"
                  style={{ background: `${bgColor}20` }}
                >
                  {source.icon}
                </div>
                <p className="text-[11px] font-black text-foreground leading-tight line-clamp-2">{source.title}</p>
                <p className="text-[8px] text-muted-foreground font-semibold mt-1 line-clamp-2 leading-tight">{source.desc}</p>
                {/* External link hint */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={8} className="text-muted-foreground" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Shelf bar */}
        <div
          className="mx-5 h-[10px] rounded-b-lg relative overflow-hidden"
          style={{
            background: category.shelfGradient,
            boxShadow: `0 3px 6px -2px ${bgColor}30`,
          }}
        >
          {/* Shelf bolts */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-foreground/10 border border-foreground/20" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-foreground/10 border border-foreground/20" />
        </div>
      </div>
    </div>
  );
};

/* ─── Swipeable News Card ─── */
const SwipeableNewsCard = ({ news, index, total, onNext, onPrev }: {
  news: NewsItem; index: number; total: number;
  onNext: () => void; onPrev: () => void;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const catColor = NEWS_CATEGORY_COLORS[news.category] || "#1CB0F6";
  const catEmoji = NEWS_CATEGORY_EMOJIS[news.category] || "📰";

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -60) onNext();
    else if (info.offset.x > 60) onPrev();
  };

  return (
    <motion.div
      key={`news-${index}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className="rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-3.5 relative" style={{ background: catColor }}>
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/15" />
        <div className="flex items-center gap-2 relative z-10">
          <span className="text-xl">{catEmoji}</span>
          <span className="text-[10px] font-black text-white tracking-wider uppercase">{news.category}</span>
          <span className="ml-auto text-[9px] text-white/70 font-bold flex items-center gap-1">
            <Clock size={9} /> {news.timeAgo}
          </span>
        </div>
      </div>
      <div className="bg-card p-4 border-x-2 border-b-2 rounded-b-3xl" style={{ borderColor: `${catColor}30`, boxShadow: `0 4px 0 0 ${catColor}25` }}>
        <h3 className="text-[15px] font-black text-foreground leading-tight mb-2">{news.title}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{news.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground">📰 {news.source}</span>
          <span className="text-[10px] font-black" style={{ color: catColor }}>{index + 1}<span className="text-muted-foreground/40">/{total}</span></span>
        </div>
        <motion.p className="text-center text-[8px] text-muted-foreground/30 font-bold mt-2.5"
          animate={{ x: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}
        >← swipe →</motion.p>
      </div>
    </motion.div>
  );
};

/* ─── Main Page ─── */
const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const [searchQuery, setSearchQuery] = useState("");
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => {
    try {
      const cached = localStorage.getItem("hub_news_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [newsLoading, setNewsLoading] = useState(() => {
    try { return !localStorage.getItem("hub_news_cache"); } catch { return true; }
  });
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [activeNewsIdx, setActiveNewsIdx] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      if (newsItems.length === 0) setNewsLoading(true);
      else setNewsRefreshing(true);
      try {
        const { data, error } = await supabase.functions.invoke("ai-news", { body: {} });
        if (error) throw new Error(error.message);
        const items = data?.items || [];
        if (items.length > 0) {
          setNewsItems(items);
          setActiveNewsIdx(0);
          localStorage.setItem("hub_news_cache", JSON.stringify(items));
        }
      } catch (e) { console.error("Failed to fetch news:", e); }
      setNewsLoading(false);
      setNewsRefreshing(false);
    };
    fetchNews();
  }, []);

  const goNextNews = () => { if (activeNewsIdx < newsItems.length - 1) setActiveNewsIdx(p => p + 1); };
  const goPrevNews = () => { if (activeNewsIdx > 0) setActiveNewsIdx(p => p - 1); };

  const searchResults = searchQuery
    ? SOURCES.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const categoriesWithSources = CATEGORIES.map(cat => ({
    ...cat,
    sources: SOURCES.filter(s => s.type === cat.id),
  })).filter(c => c.sources.length > 0);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        <div className="max-w-md mx-auto relative z-10">
          {/* Header */}
          <FadeIn>
            <div className="px-5 pt-5 pb-1 text-center">
              <p className="text-[11px] font-bold text-muted-foreground tracking-wider">My Favourite</p>
              <h1 className="text-3xl font-black text-foreground tracking-tight">RESOURCES</h1>
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.05}>
            <div className="px-5 mb-4 mt-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" placeholder="Search resources..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-card border-2 border-border/30 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-agni-blue/50 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Search Results */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 mb-4">
                <p className="text-[10px] text-muted-foreground font-bold mb-2">{searchResults.length} results</p>
                <div className="space-y-1.5">
                  {searchResults.map((s, i) => {
                    const color = ICON_BG_COLORS[s.type] || "#58CC02";
                    return (
                      <motion.a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 border-border/30 active:scale-[0.98] transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: `${color}18` }}>{s.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-extrabold text-foreground truncate">{s.title}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{s.desc}</p>
                        </div>
                        <ExternalLink size={10} className="text-muted-foreground/30 shrink-0" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bookshelf Categories */}
          {!searchQuery && (
            <>
              {/* NEWS WIDGET */}
              <FadeIn delay={0.08}>
                <div className="px-5 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-agni-red" />
                      <span className="text-[11px] font-black text-foreground">AI Headlines</span>
                      <span className="text-[8px] font-bold text-white bg-agni-red px-1.5 py-0.5 rounded-full animate-pulse">{newsRefreshing ? "UPDATING" : "LIVE"}</span>
                    </div>
                    <button onClick={() => window.location.reload()} className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                      <RefreshCw size={9} /> Refresh
                    </button>
                  </div>
                  {newsLoading ? (
                    <div className="h-40 rounded-3xl bg-card animate-pulse border-2 border-border/20" />
                  ) : newsItems.length > 0 ? (
                    <>
                      <AnimatePresence mode="wait">
                        <SwipeableNewsCard key={activeNewsIdx} news={newsItems[activeNewsIdx]} index={activeNewsIdx} total={newsItems.length} onNext={goNextNews} onPrev={goPrevNews} />
                      </AnimatePresence>
                      <div className="flex items-center justify-center gap-1.5 mt-2.5">
                        {newsItems.map((_, i) => (
                          <button key={i} onClick={() => setActiveNewsIdx(i)} className="rounded-full transition-all duration-300" style={{
                            width: i === activeNewsIdx ? 18 : 5, height: 5,
                            background: i === activeNewsIdx ? NEWS_CATEGORY_COLORS[newsItems[i].category] || "#1CB0F6" : "hsl(var(--muted-foreground) / 0.15)",
                          }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-card rounded-3xl p-4 border-2 border-border/30 text-center">
                      <p className="text-[10px] text-muted-foreground">Could not load news. Tap refresh.</p>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Shelves */}
              {categoriesWithSources.map((cat, i) => (
                <FadeIn key={cat.id} delay={0.1 + i * 0.06}>
                  <ShelfRow category={cat} sources={cat.sources} />
                </FadeIn>
              ))}

              {/* Add Resources CTA */}
              <FadeIn delay={0.5}>
                <div className="px-5 pb-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/curiosity")}
                    className="w-full bg-foreground text-background rounded-2xl py-3.5 text-sm font-black text-center shadow-lg"
                  >
                    Discover More Resources
                  </motion.button>
                </div>
              </FadeIn>
            </>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;
