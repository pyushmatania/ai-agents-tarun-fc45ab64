import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ExternalLink, Search, Zap, User, BookOpen, Wrench, Code2, Mic, Newspaper, GraduationCap, Users, FlaskConical, X, RefreshCw, Loader2, ChevronRight, Clock, Flame, Heart, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";

type Source = { title: string; desc: string; url: string; icon: string; type: string };
type NewsItem = { title: string; summary: string; source: string; category: string; timeAgo: string };

const ZONES = [
  { id: "youtube", label: "Watch", icon: "🎬", color: "#FF4B4B", gradient: "linear-gradient(135deg, #FF4B4B 0%, #FF6B6B 50%, #E03E3E 100%)", desc: "Video tutorials", shadow: "#CC3333" },
  { id: "tool", label: "Build", icon: "🔧", color: "#58CC02", gradient: "linear-gradient(135deg, #58CC02 0%, #6EE718 50%, #45A800 100%)", desc: "Frameworks & SDKs", shadow: "#3D9400" },
  { id: "newsletter", label: "Read", icon: "📨", color: "#FF9600", gradient: "linear-gradient(135deg, #FF9600 0%, #FFB340 50%, #E08500 100%)", desc: "Newsletters", shadow: "#CC7A00" },
  { id: "github", label: "Code", icon: "💻", color: "#CE82FF", gradient: "linear-gradient(135deg, #CE82FF 0%, #DDA0FF 50%, #A855F7 100%)", desc: "Open-source repos", shadow: "#9333EA" },
  { id: "course", label: "Study", icon: "🎓", color: "#1CB0F6", gradient: "linear-gradient(135deg, #1CB0F6 0%, #4DC9FF 50%, #1899D6 100%)", desc: "Courses", shadow: "#1480B6" },
  { id: "paper", label: "Research", icon: "🔬", color: "#FF4B91", gradient: "linear-gradient(135deg, #FF4B91 0%, #FF70AB 50%, #E0357A 100%)", desc: "Papers", shadow: "#CC2D6A" },
  { id: "community", label: "Connect", icon: "👥", color: "#FFC800", gradient: "linear-gradient(135deg, #FFC800 0%, #FFD84D 50%, #E0B000 100%)", desc: "Communities", shadow: "#CC9F00" },
  { id: "podcast", label: "Listen", icon: "🎙️", color: "#CE82FF", gradient: "linear-gradient(135deg, #9B59B6 0%, #CE82FF 50%, #8E44AD 100%)", desc: "Podcasts", shadow: "#7D3C98" },
];

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
        <div className="absolute right-12 bottom-0 w-10 h-10 rounded-full bg-white/10" />
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

const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const [activeZone, setActiveZone] = useState<string | null>(null);
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
  const [activeNewsIdx, setActiveNewsIdx] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      if (newsItems.length === 0) setNewsLoading(true);
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
    };
    fetchNews();
  }, []);

  const goNextNews = () => { if (activeNewsIdx < newsItems.length - 1) setActiveNewsIdx(p => p + 1); };
  const goPrevNews = () => { if (activeNewsIdx > 0) setActiveNewsIdx(p => p - 1); };
  const getZoneSources = (zoneId: string) => SOURCES.filter(s => s.type === zoneId);
  const searchResults = searchQuery
    ? SOURCES.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredSources = activeZone ? getZoneSources(activeZone) : [];
  const activeZoneData = ZONES.find(z => z.id === activeZone);

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
                <div className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2 py-1">
                  <Zap size={12} className="text-agni-green" />
                  <span className="text-[10px] font-black text-agni-green">{stats.xp}</span>
                </div>
              </div>
              <h1 className="text-sm font-black text-foreground">Hub</h1>
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

          {/* Search */}
          <FadeIn delay={0.05}>
            <div className="px-4 mb-3">
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

          {/* NEWS WIDGET */}
          {!searchQuery && (
            <FadeIn delay={0.08}>
              <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-agni-red" />
                    <span className="text-[11px] font-black text-foreground">AI Headlines</span>
                    <span className="text-[8px] font-bold text-white bg-agni-red px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>
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
          )}

          {/* Search Results */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mb-4">
                <p className="text-[10px] text-muted-foreground font-bold mb-2">{searchResults.length} results</p>
                <div className="space-y-1.5">
                  {searchResults.map((s, i) => {
                    const zone = ZONES.find(z => z.id === s.type);
                    return (
                      <motion.a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 border-border/30 active:scale-[0.98] transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: `${zone?.color || "#58CC02"}18` }}>{s.icon}</div>
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

          {/* ZONE GRID — colorful filled cards */}
          {!searchQuery && (
            <>
              <FadeIn delay={0.12}>
                <div className="px-4">
                  <p className="text-[10px] font-black text-muted-foreground tracking-wider mb-3">EXPLORE ZONES</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ZONES.map((zone, i) => {
                      const sources = getZoneSources(zone.id);
                      const isActive = activeZone === zone.id;
                      return (
                        <motion.button
                          key={zone.id}
                          initial={{ opacity: 0, scale: 0.85, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.12 + i * 0.06, type: "spring", stiffness: 200 }}
                          whileTap={{ scale: 0.92, y: 4 }}
                          onClick={() => setActiveZone(prev => prev === zone.id ? null : zone.id)}
                          className="rounded-3xl p-4 text-left relative overflow-hidden transition-all"
                          style={{
                            background: zone.gradient,
                            boxShadow: isActive
                              ? `0 6px 0 0 ${zone.shadow}, 0 0 20px ${zone.color}40, inset 0 1px 0 0 rgba(255,255,255,0.2)`
                              : `0 5px 0 0 ${zone.shadow}, inset 0 1px 0 0 rgba(255,255,255,0.15)`,
                            transform: isActive ? "translateY(-2px)" : undefined,
                          }}
                        >
                          {/* Decorative shapes */}
                          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                          <div className="absolute right-6 bottom-2 w-10 h-10 rounded-full bg-black/5" />
                          <div className="absolute left-1 bottom-0 w-6 h-6 rounded-full bg-white/5" />

                          <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-3"
                              style={{ boxShadow: "0 3px 0 0 rgba(0,0,0,0.1)" }}
                            >
                              {zone.icon}
                            </div>
                            <p className="text-[14px] font-black text-white leading-tight">{zone.label}</p>
                            <div className="mt-1.5">
                              <span className="text-[9px] font-black text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                                {sources.length} resources
                              </span>
                            </div>
                          </div>

                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-white/10"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>

              {/* Active zone resources */}
              <AnimatePresence mode="wait">
                {activeZone && activeZoneData && (
                  <motion.div
                    key={activeZone}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-4 mt-4"
                  >
                    <div className="rounded-3xl p-3.5 mb-3 relative overflow-hidden"
                      style={{ background: activeZoneData.gradient, boxShadow: `0 4px 0 0 ${activeZoneData.shadow}` }}
                    >
                      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/15" />
                      <div className="flex items-center gap-2.5 relative z-10">
                        <span className="text-2xl">{activeZoneData.icon}</span>
                        <div>
                          <h3 className="text-white font-black text-sm">{activeZoneData.label}</h3>
                          <p className="text-white/70 text-[9px] font-bold">{filteredSources.length} resources</p>
                        </div>
                        <button onClick={() => setActiveZone(null)} className="ml-auto w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredSources.map((s, i) => (
                        <motion.a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
                          className="flex items-center gap-3 bg-card rounded-2xl p-3 border-2 active:scale-[0.98] transition-all"
                          style={{ borderColor: `${activeZoneData.color}25`, boxShadow: `0 2px 0 0 ${activeZoneData.color}15` }}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ background: `${activeZoneData.color}20` }}
                          >{s.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-extrabold text-foreground truncate">{s.title}</p>
                            <p className="text-[9px] text-muted-foreground truncate">{s.desc}</p>
                          </div>
                          <ChevronRight size={12} style={{ color: activeZoneData.color }} />
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;
