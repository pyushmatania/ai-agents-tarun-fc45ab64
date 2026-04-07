import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { ExternalLink, Search, Zap, User, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

type Source = { title: string; desc: string; url: string; icon: string; type: string };

const CATEGORIES = [
  { id: "all", label: "All", icon: "✨", color: "#58CC02", shape: "circle" },
  { id: "youtube", label: "YouTube", icon: "🎬", color: "#FF4B4B", shape: "hexagon" },
  { id: "github", label: "GitHub", icon: "💻", color: "#CE82FF", shape: "diamond" },
  { id: "course", label: "Courses", icon: "🎓", color: "#1CB0F6", shape: "triangle" },
  { id: "paper", label: "Papers", icon: "🔬", color: "#CE82FF", shape: "pentagon" },
  { id: "newsletter", label: "News", icon: "📨", color: "#FF9600", shape: "star" },
  { id: "tool", label: "Tools", icon: "🔧", color: "#58CC02", shape: "square" },
  { id: "community", label: "Community", icon: "👥", color: "#FF4B91", shape: "circle" },
  { id: "podcast", label: "Podcasts", icon: "🎙️", color: "#FFC800", shape: "hexagon" },
  { id: "news", label: "Headlines", icon: "📰", color: "#1CB0F6", shape: "diamond" },
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

const typeColorMap: Record<string, string> = {
  youtube: "bg-agni-red", github: "bg-muted", course: "bg-agni-blue", paper: "bg-agni-purple",
  newsletter: "bg-agni-orange", tool: "bg-agni-green", community: "bg-agni-pink", podcast: "bg-agni-gold", news: "bg-agni-blue",
};

const typeHexMap: Record<string, string> = {
  youtube: "#FF4B4B", github: "#CE82FF", course: "#1CB0F6", paper: "#CE82FF",
  newsletter: "#FF9600", tool: "#58CC02", community: "#FF4B91", podcast: "#FFC800", news: "#1CB0F6",
};

/* Floating decoration */
const FloatingShape = ({ delay, x, y, size, color, shape }: { delay: number; x: string; y: string; size: number; color: string; shape: string }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -12, 0, 8, 0],
      x: [0, 6, -4, 2, 0],
      opacity: [0.12, 0.25, 0.12],
      rotate: [0, shape === "diamond" ? 45 : 15, 0],
      scale: [1, 1.1, 0.95, 1],
    }}
    transition={{ duration: 7 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    {shape === "hexagon" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill={color} />
      </svg>
    ) : shape === "diamond" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 95,50 50,95 5,50" fill={color} />
      </svg>
    ) : shape === "triangle" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,10 90,85 10,85" fill={color} />
      </svg>
    ) : shape === "star" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" fill={color} />
      </svg>
    ) : (
      <div className="w-full h-full rounded-full" style={{ background: color }} />
    )}
  </motion.div>
);

const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = SOURCES
    .filter(s => activeCategory === "all" || s.type === activeCategory)
    .filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  const activeCat = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const activeColor = activeCat.color;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* ===== Background Decorations ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Constellation grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

          {/* Central web-like path */}
          <svg className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[320px] h-[800px] opacity-[0.08]" viewBox="0 0 320 800">
            <path d="M160 0 Q60 100 160 200 Q260 300 160 400 Q60 500 160 600 Q260 700 160 800" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" strokeDasharray="8 6" />
            <path d="M80 50 Q160 150 240 50" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground" opacity="0.5" />
            <path d="M240 250 Q160 350 80 250" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground" opacity="0.5" />
            <path d="M80 450 Q160 550 240 450" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground" opacity="0.5" />
          </svg>

          {/* Gradient glow — category colored */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full opacity-[0.12]"
            style={{ background: `radial-gradient(ellipse, ${activeColor}, transparent 70%)` }}
          />
          <div className="absolute bottom-32 right-0 w-[300px] h-[200px] rounded-full opacity-[0.08]"
            style={{ background: `radial-gradient(ellipse, ${activeColor}, transparent 70%)` }}
          />

          {/* Floating shapes */}
          <FloatingShape delay={0} x="5%" y="8%" size={60} color={`${activeColor}30`} shape="hexagon" />
          <FloatingShape delay={1.5} x="85%" y="15%" size={45} color="hsla(100,95%,40%,0.2)" shape="diamond" />
          <FloatingShape delay={3} x="8%" y="40%" size={50} color="hsla(199,92%,54%,0.15)" shape="triangle" />
          <FloatingShape delay={2} x="88%" y="50%" size={40} color="hsla(270,100%,75%,0.18)" shape="star" />
          <FloatingShape delay={4} x="15%" y="70%" size={55} color="hsla(46,100%,49%,0.15)" shape="hexagon" />
          <FloatingShape delay={1} x="80%" y="75%" size={35} color={`${activeColor}25`} shape="circle" />

          {/* Connector lines */}
          <svg className="absolute top-[60px] right-0 w-[120px] h-[120px] opacity-[0.06]" viewBox="0 0 120 120">
            <path d="M120,0 L120,40 L80,40 L80,80 L40,80 L40,120" fill="none" stroke={activeColor} strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
          <svg className="absolute bottom-[140px] left-0 w-[100px] h-[100px] opacity-[0.06]" viewBox="0 0 100 100">
            <path d="M0,0 L0,35 L35,35 L35,70 L70,70 L70,100" fill="none" stroke={activeColor} strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="max-w-md mx-auto px-4 pt-5 relative z-10">

          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Agni expression="teaching" size={45} animate={true} />
                <div>
                  <h2 className="text-sm font-black text-foreground">Knowledge Hub</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">{SOURCES.length} curated resources</p>
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
              </div>
            </div>
          </FadeIn>

          {/* Hero — Node Map Style */}
          <FadeIn delay={0.05}>
            <div className="rounded-3xl p-4 mb-4 relative overflow-hidden border-2 border-border/30"
              style={{ background: `linear-gradient(135deg, ${activeColor}15, transparent 60%)` }}>
              {/* Decorative nodes */}
              <div className="absolute top-3 right-4 flex gap-2 opacity-20">
                {["⬡", "◆", "▲", "★"].map((s, i) => (
                  <motion.span key={i} className="text-lg" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}>
                    {s}
                  </motion.span>
                ))}
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full" style={{ background: `${activeColor}10` }} />
              <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-2xl rotate-45" style={{ background: `${activeColor}08` }} />

              <div className="flex items-center gap-1.5 mb-1.5">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: activeColor }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-micro" style={{ color: activeColor }}>KNOWLEDGE CONSTELLATION</p>
              </div>
              <h3 className="text-lg font-black text-foreground leading-tight mb-1">Explore the Network 🌐</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Channels, tools, papers & communities — your AI agent knowledge map
              </p>

              {/* Mini node visualization */}
              <div className="flex items-center gap-3 mt-3">
                {CATEGORIES.slice(1, 6).map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-border/30"
                      style={{ background: `${cat.color}20` }}>
                      {cat.icon}
                    </div>
                    {i < 4 && (
                      <div className="w-px h-2 opacity-20" style={{ background: cat.color }} />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.1}>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-card border border-border/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-agni-green/50 transition-colors"
              />
            </div>
          </FadeIn>

          {/* Category Path — Scrollable nodes connected by lines */}
          <FadeIn delay={0.12}>
            <div className="relative mb-4">
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                {CATEGORIES.map((cat, i) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveCategory(cat.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      className="shrink-0 flex flex-col items-center gap-1 relative"
                    >
                      <motion.div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base border-2 transition-all shadow-md ${
                          isActive
                            ? "border-transparent shadow-lg"
                            : "border-border/30 bg-card"
                        }`}
                        style={isActive ? {
                          background: `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)`,
                          boxShadow: `0 4px 15px ${cat.color}40`,
                        } : {}}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {cat.icon}
                      </motion.div>
                      <span className={`text-[8px] font-extrabold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {cat.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="hub-cat-indicator"
                          className="absolute -bottom-0.5 w-5 h-1 rounded-full"
                          style={{ background: cat.color }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Count */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground font-bold">
              {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1" style={{ color: activeColor }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />
              <span className="text-[9px] font-extrabold">{activeCat.label}</span>
            </div>
          </div>

          {/* Sources — Card Grid with connecting elements */}
          <StaggerContainer className="space-y-2">
            {filtered.map((source, i) => {
              const color = typeHexMap[source.type] || "#58CC02";
              return (
                <StaggerItem key={`${source.type}-${i}`}>
                  <motion.a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/40 hover:border-agni-green/30 transition-all shadow-card group block relative overflow-hidden"
                  >
                    {/* Left accent line */}
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `${color}40` }} />
                    
                    <div className={`w-10 h-10 rounded-xl ${typeColorMap[source.type] || "bg-muted"} flex items-center justify-center text-lg shrink-0 shadow-md`}>
                      {source.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-extrabold text-foreground truncate">{source.title}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate font-semibold">{source.desc}</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-agni-green/10 transition-colors">
                      <ExternalLink size={11} className="text-muted-foreground group-hover:text-agni-green transition-colors" />
                    </div>
                  </motion.a>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Agni expression="thinking" size={60} />
              <p className="text-xs text-muted-foreground mt-2 font-semibold">No resources match your search</p>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;