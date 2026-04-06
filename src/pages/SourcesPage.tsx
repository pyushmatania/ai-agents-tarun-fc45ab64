import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { ExternalLink, Youtube, Newspaper, Wrench, BookOpen, Podcast, Users, Globe, Sparkles, GitBranch, GraduationCap, FlaskConical, Search, Zap, Diamond } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";

type Source = { title: string; desc: string; url: string; icon: string; type: string; };

const CATEGORIES = [
  { id: "all", label: "All", icon: "✨" },
  { id: "youtube", label: "YouTube", icon: "🎬" },
  { id: "github", label: "GitHub", icon: "💻" },
  { id: "course", label: "Courses", icon: "🎓" },
  { id: "paper", label: "Papers", icon: "🔬" },
  { id: "newsletter", label: "News", icon: "📨" },
  { id: "tool", label: "Tools", icon: "🔧" },
  { id: "community", label: "Community", icon: "👥" },
  { id: "podcast", label: "Podcasts", icon: "🎙️" },
  { id: "news", label: "Headlines", icon: "📰" },
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

const SourcesPage = () => {
  const { user } = useAuth();
  const { stats } = useGamification();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = SOURCES
    .filter(s => activeCategory === "all" || s.type === activeCategory)
    .filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">

          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Agni expression="teaching" size={40} animate={false} />
                <div>
                  <h2 className="text-sm font-black text-foreground">Knowledge Hub</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">{SOURCES.length} curated resources</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2 py-0.5">
                  <Zap size={10} className="text-agni-green" />
                  <span className="text-[10px] font-black text-agni-green">{stats.xp}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Hero Banner */}
          <FadeIn delay={0.05}>
            <div className="rounded-2xl p-4 mb-4 relative overflow-hidden border border-agni-blue/20"
              style={{ background: "linear-gradient(135deg, hsl(var(--agni-blue) / 0.15), hsl(var(--agni-purple) / 0.1))" }}>
              <div className="absolute top-3 right-3 opacity-10 text-4xl">📡</div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-agni-blue/10" />
              <p className="text-micro text-agni-blue mb-1">CURATED COLLECTION</p>
              <h3 className="text-base font-black text-foreground leading-tight mb-1">Top AI Agent Resources 🌐</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Channels, tools, newsletters & communities handpicked for you
              </p>
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

          {/* Category Chips */}
          <FadeIn delay={0.12}>
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
                    activeCategory === cat.id
                      ? "bg-agni-green text-white shadow-glow-green"
                      : "bg-card border border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </FadeIn>

          {/* Count */}
          <p className="text-[10px] text-muted-foreground mb-2 font-bold">
            {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* Sources List */}
          <StaggerContainer className="space-y-1.5">
            {filtered.map((source, i) => (
              <StaggerItem key={`${source.type}-${i}`}>
                <motion.a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2.5 bg-card rounded-xl p-2.5 border border-border/40 hover:border-agni-green/20 transition-all shadow-card group block"
                >
                  <div className={`w-9 h-9 rounded-xl ${typeColorMap[source.type] || "bg-muted"} flex items-center justify-center text-base shrink-0 shadow-md`}>
                    {source.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-extrabold text-foreground truncate">{source.title}</h4>
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate font-semibold">{source.desc}</p>
                  </div>
                  <ExternalLink size={12} className="text-muted-foreground shrink-0 group-hover:text-agni-green transition-colors" />
                </motion.a>
              </StaggerItem>
            ))}
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
