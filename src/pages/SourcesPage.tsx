import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ExternalLink, Search, Zap, User, ChevronDown, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

type Source = { title: string; desc: string; url: string; icon: string; type: string };

const ZONES = [
  { id: "youtube", label: "Watch", icon: "🎬", emoji2: "📺", color: "#FF4B4B", desc: "Video tutorials & deep dives", count: 7 },
  { id: "tool", label: "Build", icon: "🔧", emoji2: "⚡", color: "#58CC02", desc: "Frameworks, SDKs & platforms", count: 8 },
  { id: "newsletter", label: "Read", icon: "📨", emoji2: "✉️", color: "#FF9600", desc: "Newsletters & daily updates", count: 4 },
  { id: "github", label: "Code", icon: "💻", emoji2: "🐙", color: "#CE82FF", desc: "Open-source repos & stars", count: 5 },
  { id: "course", label: "Study", icon: "🎓", emoji2: "📚", color: "#1CB0F6", desc: "Courses & certifications", count: 3 },
  { id: "paper", label: "Research", icon: "🔬", emoji2: "📄", color: "#FF4B91", desc: "Foundational papers", count: 4 },
  { id: "community", label: "Connect", icon: "👥", emoji2: "💬", color: "#FFC800", desc: "Communities & forums", count: 3 },
  { id: "podcast", label: "Listen", icon: "🎙️", emoji2: "🎧", color: "#CE82FF", desc: "AI engineering podcasts", count: 2 },
  { id: "news", label: "Headlines", icon: "📰", emoji2: "🗞️", color: "#1CB0F6", desc: "Breaking AI news", count: 3 },
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

/* Floating decoration */
const FloatingShape = ({ delay, x, y, size, color, shape }: { delay: number; x: string; y: string; size: number; color: string; shape: string }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -10, 0, 6, 0],
      opacity: [0.08, 0.18, 0.08],
      rotate: shape === "diamond" ? [45, 90, 45] : [0, 12, 0],
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    {shape === "hex" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill={color} /></svg>
    ) : shape === "diamond" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 95,50 50,95 5,50" fill={color} /></svg>
    ) : shape === "tri" ? (
      <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,10 90,85 10,85" fill={color} /></svg>
    ) : (
      <div className="w-full h-full rounded-full" style={{ background: color }} />
    )}
  </motion.div>
);

const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleZone = (id: string) => {
    setExpandedZone(prev => prev === id ? null : id);
  };

  const getZoneSources = (zoneId: string) =>
    SOURCES.filter(s => s.type === zoneId)
      .filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const searchResults = searchQuery
    ? SOURCES.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* ===== BG ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 0.8px, transparent 0.8px)",
            backgroundSize: "36px 36px",
          }} />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.1]"
            style={{ background: "radial-gradient(ellipse, hsl(var(--agni-blue)), transparent 60%)" }}
          />
          <FloatingShape delay={0} x="6%" y="10%" size={55} color="hsla(199,92%,54%,0.15)" shape="hex" />
          <FloatingShape delay={2} x="85%" y="20%" size={40} color="hsla(100,95%,40%,0.12)" shape="diamond" />
          <FloatingShape delay={1} x="8%" y="50%" size={45} color="hsla(270,100%,75%,0.1)" shape="tri" />
          <FloatingShape delay={3} x="82%" y="60%" size={50} color="hsla(46,100%,49%,0.1)" shape="circle" />
          <FloatingShape delay={4} x="15%" y="80%" size={35} color="hsla(330,80%,60%,0.08)" shape="hex" />
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

          {/* Search */}
          <FadeIn delay={0.05}>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search all resources..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setExpandedZone(null); }}
                className="w-full h-10 pl-9 pr-4 bg-card border border-border/40 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-agni-green/50 transition-colors"
              />
            </div>
          </FadeIn>

          {/* Search Results */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                <p className="text-[10px] text-muted-foreground font-bold mb-2">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</p>
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

          {/* Zone Grid — 2 column visual tiles */}
          {!searchQuery && (
            <div className="grid grid-cols-2 gap-2.5">
              {ZONES.map((zone, i) => {
                const isExpanded = expandedZone === zone.id;
                const sources = getZoneSources(zone.id);

                return (
                  <motion.div
                    key={zone.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 + i * 0.04, type: "spring", stiffness: 300 }}
                    className={`${isExpanded ? "col-span-2" : ""}`}
                  >
                    <motion.button
                      layout="position"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleZone(zone.id)}
                      className="w-full rounded-2xl p-3.5 text-left relative overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: isExpanded ? `${zone.color}50` : "hsl(var(--border) / 0.3)",
                        background: isExpanded
                          ? `linear-gradient(145deg, ${zone.color}18, transparent 70%)`
                          : `linear-gradient(145deg, ${zone.color}08, transparent 50%)`,
                      }}
                    >
                      {/* BG decoration */}
                      <div className="absolute -right-3 -bottom-3 text-4xl opacity-[0.06] select-none pointer-events-none">
                        {zone.emoji2}
                      </div>
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-[0.08]"
                        style={{ background: zone.color }}
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                      />

                      <div className="flex items-start justify-between relative z-10">
                        <div>
                          <motion.div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-2 shadow-md"
                            style={{
                              background: `linear-gradient(135deg, ${zone.color}30, ${zone.color}15)`,
                              border: `2px solid ${zone.color}25`,
                            }}
                            animate={isExpanded ? { rotate: [0, 5, -5, 0] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {zone.icon}
                          </motion.div>
                          <h4 className="text-xs font-black text-foreground">{zone.label}</h4>
                          <p className="text-[9px] text-muted-foreground font-semibold mt-0.5 leading-tight">{zone.desc}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ color: zone.color, background: `${zone.color}15` }}>
                            {zone.count}
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={12} className="text-muted-foreground" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Expanded resources */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 space-y-1.5">
                            {sources.map((s, si) => (
                              <motion.a
                                key={si}
                                href={s.url} target="_blank" rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: si * 0.05 }}
                                className="flex items-center gap-2.5 bg-card rounded-xl p-2.5 border border-border/30 hover:border-border transition-all group"
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                  style={{ background: `${zone.color}12` }}>
                                  {s.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-extrabold text-foreground truncate">{s.title}</p>
                                  <p className="text-[8px] text-muted-foreground truncate font-semibold">{s.desc}</p>
                                </div>
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                                  style={{ background: `${zone.color}15` }}>
                                  <ExternalLink size={9} style={{ color: zone.color }} />
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
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;