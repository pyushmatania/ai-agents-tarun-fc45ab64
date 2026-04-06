import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import { ExternalLink, Youtube, Newspaper, Wrench, BookOpen, Podcast, Users, Globe, Sparkles, GitBranch, GraduationCap, FlaskConical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Source = {
  title: string;
  desc: string;
  url: string;
  icon: string;
  type: string;
};

const CATEGORIES = [
  { id: "all", label: "All", icon: "✨" },
  { id: "youtube", label: "YouTube", icon: "🎬" },
  { id: "github", label: "GitHub", icon: "💻" },
  { id: "course", label: "Courses", icon: "🎓" },
  { id: "paper", label: "Papers", icon: "🔬" },
  { id: "newsletter", label: "Newsletters", icon: "📨" },
  { id: "tool", label: "Tools & MCP", icon: "🔧" },
  { id: "community", label: "Community", icon: "👥" },
  { id: "podcast", label: "Podcasts", icon: "🎙️" },
  { id: "news", label: "News", icon: "📰" },
];

const SOURCES: Source[] = [
  // YouTube
  { title: "AI Jason", desc: "Deep dives into AI agents, frameworks & tutorials", url: "https://youtube.com/@AIJason", icon: "🎬", type: "youtube" },
  { title: "Matt Wolfe", desc: "Weekly AI tools roundup & agent demos", url: "https://youtube.com/@maboroshi", icon: "🎬", type: "youtube" },
  { title: "Dave Ebbelaar", desc: "Practical AI agent builds with Python", url: "https://youtube.com/@daveebbelaar", icon: "🎬", type: "youtube" },
  { title: "Cole Medin", desc: "AI automation & agent development tutorials", url: "https://youtube.com/@ColeMedin", icon: "🎬", type: "youtube" },
  { title: "Sam Witteveen", desc: "LangChain, CrewAI & multi-agent systems", url: "https://youtube.com/@samwitteveenai", icon: "🎬", type: "youtube" },
  { title: "James Briggs", desc: "LangChain & vector DB deep dives", url: "https://youtube.com/@jamesbriggs", icon: "🎬", type: "youtube" },
  { title: "Prompt Engineering", desc: "AI agent architectures & patterns", url: "https://youtube.com/@PromptEngineering", icon: "🎬", type: "youtube" },

  // Newsletters
  { title: "The Rundown AI", desc: "Daily AI news with agent focus", url: "https://therundown.ai", icon: "📨", type: "newsletter" },
  { title: "Ben's Bites", desc: "Curated AI developments & agent launches", url: "https://bensbites.com", icon: "📨", type: "newsletter" },
  { title: "Superhuman AI", desc: "Weekly AI tools & agent automation tips", url: "https://superhuman.ai", icon: "📨", type: "newsletter" },
  { title: "AI Brews", desc: "Business-focused AI agent insights", url: "https://aibrews.com", icon: "📨", type: "newsletter" },

  // Tools & MCP
  { title: "LangChain / LangGraph", desc: "Production-grade agent framework with stateful graphs", url: "https://langchain.com", icon: "🔧", type: "tool" },
  { title: "CrewAI", desc: "Role-based multi-agent orchestration", url: "https://crewai.com", icon: "🔧", type: "tool" },
  { title: "n8n", desc: "No-code AI agent workflows & automation", url: "https://n8n.io", icon: "🔧", type: "tool" },
  { title: "Anthropic MCP", desc: "Model Context Protocol — 12K+ servers", url: "https://modelcontextprotocol.io", icon: "🔧", type: "tool" },
  { title: "OpenAI Agents SDK", desc: "Official SDK for building OpenAI agents", url: "https://github.com/openai/openai-agents-python", icon: "🔧", type: "tool" },
  { title: "Google ADK", desc: "Agent Development Kit with A2A protocol", url: "https://google.github.io/adk-docs", icon: "🔧", type: "tool" },
  { title: "AutoGen (AG2)", desc: "Microsoft's multi-agent conversation framework", url: "https://microsoft.github.io/autogen", icon: "🔧", type: "tool" },
  { title: "Composio", desc: "250+ tool integrations for AI agents", url: "https://composio.dev", icon: "🔧", type: "tool" },

  // Community
  { title: "r/AI_Agents", desc: "Reddit community for agent builders", url: "https://reddit.com/r/AI_Agents", icon: "👥", type: "community" },
  { title: "LangChain Discord", desc: "Active community of agent developers", url: "https://discord.gg/langchain", icon: "👥", type: "community" },
  { title: "Hugging Face", desc: "Open-source models & agent spaces", url: "https://huggingface.co", icon: "👥", type: "community" },
  { title: "AI Agent Twitter/X", desc: "#AIAgents on X for latest updates", url: "https://x.com/search?q=%23AIAgents", icon: "👥", type: "community" },

  // Podcasts
  { title: "Latent Space", desc: "Technical podcast on AI engineering & agents", url: "https://latent.space", icon: "🎙️", type: "podcast" },
  { title: "Practical AI", desc: "Making AI practical — agent episodes", url: "https://practicalai.fm", icon: "🎙️", type: "podcast" },
  { title: "The AI Podcast (NVIDIA)", desc: "Enterprise AI & autonomous agents", url: "https://blogs.nvidia.com/ai-podcast", icon: "🎙️", type: "podcast" },

  // GitHub Repos
  { title: "LangChain", desc: "Framework for LLM-powered apps — 100K+ stars", url: "https://github.com/langchain-ai/langchain", icon: "💻", type: "github" },
  { title: "AutoGen", desc: "Microsoft's multi-agent conversation framework", url: "https://github.com/microsoft/autogen", icon: "💻", type: "github" },
  { title: "CrewAI", desc: "Role-based AI agent orchestration framework", url: "https://github.com/crewAIInc/crewAI", icon: "💻", type: "github" },
  { title: "MetaGPT", desc: "Multi-agent framework with SOP-driven workflows", url: "https://github.com/geekan/MetaGPT", icon: "💻", type: "github" },
  { title: "OpenAI Swarm", desc: "Lightweight multi-agent orchestration", url: "https://github.com/openai/swarm", icon: "💻", type: "github" },
  { title: "BabyAGI", desc: "Task-driven autonomous agent prototype", url: "https://github.com/yoheinakajima/babyagi", icon: "💻", type: "github" },
  { title: "SuperAGI", desc: "Open-source autonomous AI agent framework", url: "https://github.com/TransformerOptimus/SuperAGI", icon: "💻", type: "github" },
  { title: "Phidata", desc: "Build AI agents with memory & knowledge", url: "https://github.com/phidatahq/phidata", icon: "💻", type: "github" },
  { title: "Haystack", desc: "LLM orchestration framework by deepset", url: "https://github.com/deepset-ai/haystack", icon: "💻", type: "github" },
  { title: "Awesome AI Agents", desc: "Curated list of AI agent projects & resources", url: "https://github.com/e2b-dev/awesome-ai-agents", icon: "💻", type: "github" },

  // Online Courses
  { title: "DeepLearning.AI — AI Agents", desc: "Andrew Ng's courses on building AI agents with LangChain", url: "https://deeplearning.ai/short-courses", icon: "🎓", type: "course" },
  { title: "LangChain Academy", desc: "Free official courses on LangGraph & agents", url: "https://academy.langchain.com", icon: "🎓", type: "course" },
  { title: "Hugging Face Agents Course", desc: "Open-source course on building AI agents", url: "https://huggingface.co/learn/agents-course", icon: "🎓", type: "course" },
  { title: "CrewAI Crash Course", desc: "Build multi-agent systems step by step", url: "https://docs.crewai.com/introduction", icon: "🎓", type: "course" },
  { title: "Coursera — LLM Agents", desc: "University-backed courses on autonomous agents", url: "https://coursera.org/search?query=ai+agents", icon: "🎓", type: "course" },
  { title: "Fast.ai", desc: "Practical deep learning — agent foundations", url: "https://course.fast.ai", icon: "🎓", type: "course" },
  { title: "Microsoft AI Agents Workshop", desc: "Hands-on AutoGen multi-agent tutorials", url: "https://microsoft.github.io/autogen/docs/tutorial", icon: "🎓", type: "course" },

  // Research Papers
  { title: "ReAct: Reasoning + Acting", desc: "Foundational paper on LLM reasoning & tool use", url: "https://arxiv.org/abs/2210.03629", icon: "🔬", type: "paper" },
  { title: "Toolformer", desc: "Teaching LLMs to use tools autonomously", url: "https://arxiv.org/abs/2302.04761", icon: "🔬", type: "paper" },
  { title: "Generative Agents", desc: "Believable simulacra of human behavior (Stanford)", url: "https://arxiv.org/abs/2304.03442", icon: "🔬", type: "paper" },
  { title: "AutoGPT Survey", desc: "Comprehensive survey of autonomous AI agents", url: "https://arxiv.org/abs/2308.11432", icon: "🔬", type: "paper" },
  { title: "CAMEL", desc: "Communicative agents for mind exploration", url: "https://arxiv.org/abs/2303.17760", icon: "🔬", type: "paper" },
  { title: "Chain-of-Thought Prompting", desc: "Enabling reasoning in LLMs (Google)", url: "https://arxiv.org/abs/2201.11903", icon: "🔬", type: "paper" },
  { title: "HuggingGPT / JARVIS", desc: "LLM as controller for AI models", url: "https://arxiv.org/abs/2303.17580", icon: "🔬", type: "paper" },
  { title: "Voyager (NVIDIA)", desc: "LLM-powered lifelong learning agent in Minecraft", url: "https://arxiv.org/abs/2305.16291", icon: "🔬", type: "paper" },

  // News
  { title: "The Verge AI", desc: "Breaking AI agent news & analysis", url: "https://theverge.com/ai-artificial-intelligence", icon: "📰", type: "news" },
  { title: "TechCrunch AI", desc: "AI startup funding & agent launches", url: "https://techcrunch.com/category/artificial-intelligence", icon: "📰", type: "news" },
  { title: "Ars Technica AI", desc: "In-depth AI technical reporting", url: "https://arstechnica.com/ai", icon: "📰", type: "news" },
  { title: "VentureBeat AI", desc: "Enterprise AI & agentic AI coverage", url: "https://venturebeat.com/ai", icon: "📰", type: "news" },
];

const typeIconMap: Record<string, React.ReactNode> = {
  youtube: <Youtube size={13} />,
  github: <GitBranch size={13} />,
  course: <GraduationCap size={13} />,
  paper: <FlaskConical size={13} />,
  newsletter: <Newspaper size={13} />,
  tool: <Wrench size={13} />,
  community: <Users size={13} />,
  podcast: <Podcast size={13} />,
  news: <Globe size={13} />,
};

const SourcesPage = () => {
  const { user } = useAuth();
  const storedName = localStorage.getItem("edu_user_name") || "Learner";
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || storedName;
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" ? SOURCES : SOURCES.filter(s => s.type === activeCategory);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto px-4 pt-5">
          <Header name={displayName} progress={0} />

          {/* Hero */}
          <div className="rounded-2xl p-4 mb-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(160 40% 18%), hsl(160 35% 12%))" }}>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/40 tracking-widest mb-0.5">CURATED</p>
              <h3 className="text-base font-display font-bold text-white leading-tight mb-1">Knowledge Hub</h3>
              <p className="text-[11px] text-white/50 max-w-[240px] leading-relaxed">
                Top channels, tools, newsletters & communities for AI agents
              </p>
            </div>
            <div className="absolute top-3 right-3 text-3xl opacity-10 animate-float">📡</div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-glow-primary"
                    : "bg-card border border-border/50 text-muted-foreground hover:border-border"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-[10px] text-muted-foreground mb-2 font-medium">
            {filtered.length} source{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* Sources List */}
          <div className="space-y-1.5">
            {filtered.map((source, i) => (
              <a
                key={`${source.type}-${i}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-card rounded-xl p-2.5 border border-border/50 hover:border-primary/20 transition-all shadow-card group"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
              >
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-base shrink-0">
                  {source.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{typeIconMap[source.type]}</span>
                    <h4 className="text-[11px] font-bold text-foreground truncate">{source.title}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{source.desc}</p>
                </div>
                <ExternalLink size={12} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;
