import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ExternalLink, Search, Zap, User, Star, BookOpen, Wrench, Code2, Mic, Newspaper, GraduationCap, Users, FlaskConical, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

type Source = { title: string; desc: string; url: string; icon: string; type: string };

const ZONES = [
  { id: "youtube", label: "Watch", icon: "🎬", lucide: BookOpen, color: "#FF4B4B", desc: "Video tutorials", count: 7 },
  { id: "tool", label: "Build", icon: "🔧", lucide: Wrench, color: "#58CC02", desc: "Frameworks & SDKs", count: 8 },
  { id: "newsletter", label: "Read", icon: "📨", lucide: Newspaper, color: "#FF9600", desc: "Newsletters", count: 4 },
  { id: "github", label: "Code", icon: "💻", lucide: Code2, color: "#CE82FF", desc: "Open-source repos", count: 5 },
  { id: "course", label: "Study", icon: "🎓", lucide: GraduationCap, color: "#1CB0F6", desc: "Courses", count: 3 },
  { id: "paper", label: "Research", icon: "🔬", lucide: FlaskConical, color: "#FF4B91", desc: "Papers", count: 4 },
  { id: "community", label: "Connect", icon: "👥", lucide: Users, color: "#FFC800", desc: "Communities", count: 3 },
  { id: "podcast", label: "Listen", icon: "🎙️", lucide: Mic, color: "#CE82FF", desc: "Podcasts", count: 2 },
  { id: "news", label: "Headlines", icon: "📰", lucide: Newspaper, color: "#1CB0F6", desc: "AI news", count: 3 },
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
  { title: "The Verge AI", desc: "Breaking AI agent news", url: "https://theverge.com/ai-artificial-intelligence", icon: "📰", type: "news" },
  { title: "TechCrunch AI", desc: "AI startup funding & launches", url: "https://techcrunch.com/category/artificial-intelligence", icon: "📰", type: "news" },
  { title: "VentureBeat AI", desc: "Enterprise agentic AI coverage", url: "https://venturebeat.com/ai", icon: "📰", type: "news" },
];

const getSCurveX = (index: number): number => {
  const pattern = [20, 60, 100, 60, 20, 60];
  return pattern[index % pattern.length];
};

const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getZoneSources = (zoneId: string) =>
    SOURCES.filter(s => s.type === zoneId);

  const searchResults = searchQuery
    ? SOURCES.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full opacity-[0.12]"
            style={{ background: "radial-gradient(ellipse, #1CB0F6, transparent 70%)" }}
          />
          {/* S-curve path */}
          <svg className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[280px] h-[1200px] opacity-[0.08]" viewBox="0 0 280 1200">
            <path d="M140 0 Q20 100 140 200 Q260 300 140 400 Q20 500 140 600 Q260 700 140 800 Q20 900 140 1000 Q260 1100 140 1200" fill="none" stroke="currentColor" strokeWidth="40" className="text-foreground" />
          </svg>
          {/* Floating orbs */}
          {[
            { x: "8%", y: "15%", size: 70, color: "hsla(0,100%,65%,0.15)" },
            { x: "85%", y: "25%", size: 55, color: "hsla(100,95%,40%,0.18)" },
            { x: "5%", y: "45%", size: 60, color: "hsla(270,100%,75%,0.15)" },
            { x: "88%", y: "55%", size: 50, color: "hsla(46,100%,49%,0.12)" },
            { x: "15%", y: "75%", size: 65, color: "hsla(199,92%,54%,0.15)" },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size, background: orb.color }}
              animate={{ y: [0, -12, 0, 8, 0], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="max-w-md mx-auto relative z-10">
          {/* Top bar */}
          <FadeIn>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2 py-1">
                  <Zap size={12} className="text-agni-green" />
                  <span className="text-[10px] font-black text-agni-green">{stats.xp}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-1">
                  <Star size={12} className="text-agni-gold fill-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{SOURCES.length}</span>
                </div>
              </div>
              <h1 className="text-sm font-black text-foreground">Hub</h1>
              <div className="flex items-center gap-1.5">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")} className="w-7 h-7 rounded-xl bg-card flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors">
                  <User size={12} className="text-muted-foreground" />
                </motion.button>
              </div>
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.05}>
            <div className="px-4 mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-card border border-border/40 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-agni-green/50 transition-colors"
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 mb-4">
                <p className="text-[10px] text-muted-foreground font-bold mb-2">{searchResults.length} results</p>
                <div className="space-y-1.5">
                  {searchResults.map((s, i) => {
                    const zone = ZONES.find(z => z.id === s.type);
                    return (
                      <motion.a
                        key={i}
                        href={s.url} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-2.5 bg-card rounded-xl p-2.5 border border-border/40 hover:border-agni-green/20 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${zone?.color || "#58CC02"}18` }}>
                          {s.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-extrabold text-foreground truncate">{s.title}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{s.desc}</p>
                        </div>
                        <ExternalLink size={10} className="text-muted-foreground shrink-0" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Winding path of zone nodes */}
          {!searchQuery && (
            <div className="px-4 relative">
              {/* SVG connector lines */}
              <svg className="absolute top-0 left-4 right-4 h-full pointer-events-none" style={{ width: "calc(100% - 32px)" }}>
                {ZONES.map((_, i) => {
                  if (i === 0) return null;
                  const x1 = getSCurveX(i - 1) + 28;
                  const y1 = (i - 1) * 130 + 45;
                  const x2 = getSCurveX(i) + 28;
                  const y2 = i * 130 + 45;
                  const midY = (y1 + y2) / 2;
                  return (
                    <path
                      key={i}
                      d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                      fill="none"
                      stroke={ZONES[i].color}
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      opacity={0.25}
                    />
                  );
                })}
              </svg>

              {/* Zone nodes on path */}
              <div className="relative" style={{ paddingBottom: 20 }}>
                {ZONES.map((zone, i) => {
                  const xOffset = getSCurveX(i);
                  const isExpanded = expandedZone === zone.id;
                  const sources = getZoneSources(zone.id);
                  const LucideIcon = zone.lucide;

                  return (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, scale: 0.5, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 200 }}
                      className="relative"
                      style={{ height: isExpanded ? "auto" : 130, minHeight: 130, paddingLeft: xOffset }}
                    >
                      {/* The node button */}
                      <motion.button
                        whileTap={{ scale: 0.9, y: 3 }}
                        onClick={() => setExpandedZone(prev => prev === zone.id ? null : zone.id)}
                        className="relative flex flex-col items-center"
                        style={{ width: 90 }}
                      >
                        {/* Glow ring */}
                        <motion.div
                          className="absolute -inset-2 rounded-full opacity-0"
                          style={{ background: `radial-gradient(circle, ${zone.color}30, transparent 70%)` }}
                          animate={isExpanded ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Circle node */}
                        <motion.div
                          className="w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg relative z-10 border-[3px]"
                          style={{
                            background: isExpanded
                              ? zone.color
                              : `linear-gradient(135deg, ${zone.color}25, ${zone.color}10)`,
                            borderColor: isExpanded ? zone.color : `${zone.color}50`,
                            boxShadow: isExpanded
                              ? `0 6px 0 0 ${zone.color}80, 0 8px 20px ${zone.color}40`
                              : `0 4px 0 0 ${zone.color}40`,
                          }}
                          animate={isExpanded ? { y: [0, -3, 0] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <span className="text-2xl">{zone.icon}</span>
                        </motion.div>

                        {/* Label */}
                        <span className="text-[9px] font-black mt-1.5" style={{ color: isExpanded ? zone.color : "hsl(var(--foreground))" }}>
                          {zone.label}
                        </span>
                        <span className="text-[7px] font-bold text-muted-foreground">{zone.count} resources</span>

                        {/* Count badge */}
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white z-20"
                          style={{ background: zone.color, boxShadow: `0 2px 0 0 ${zone.color}80` }}
                        >
                          {zone.count}
                        </div>
                      </motion.button>

                      {/* Expanded resources panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden w-full mt-2"
                            style={{ paddingLeft: 0, marginLeft: -xOffset }}
                          >
                            {/* Category banner */}
                            <div
                              className="rounded-2xl p-3 mb-2 relative overflow-hidden"
                              style={{ background: zone.color, boxShadow: `0 4px 0 0 ${zone.color}80` }}
                            >
                              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                              <div className="absolute -right-2 bottom-0 w-10 h-10 rounded-full bg-white/5" />
                              <div className="flex items-center gap-2 relative z-10">
                                <span className="text-2xl">{zone.icon}</span>
                                <div>
                                  <h4 className="text-white font-black text-sm">{zone.label}</h4>
                                  <p className="text-white/60 text-[9px] font-bold">{zone.desc}</p>
                                </div>
                              </div>
                            </div>

                            {/* Resources list */}
                            <div className="space-y-1.5">
                              {sources.map((s, si) => (
                                <motion.a
                                  key={si}
                                  href={s.url} target="_blank" rel="noopener noreferrer"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: si * 0.05 }}
                                  className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 border-border/30 hover:border-border transition-all group"
                                  style={{ borderLeftColor: `${zone.color}40`, borderLeftWidth: 3 }}
                                >
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                                    style={{ background: `${zone.color}20`, border: `2px solid ${zone.color}25` }}>
                                    <LucideIcon size={14} style={{ color: zone.color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-extrabold text-foreground truncate">{s.title}</p>
                                    <p className="text-[9px] text-muted-foreground truncate font-semibold">{s.desc}</p>
                                  </div>
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                                    style={{ background: `${zone.color}15` }}>
                                    <ExternalLink size={10} style={{ color: zone.color }} />
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;
