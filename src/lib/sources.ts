/**
 * 📚 NEURAL-OS SOURCE CATALOG
 * 200+ curated sources for AI agents learning
 */

export interface Source {
  name: string;
  handle?: string;
  url: string;
  desc: string;
  tags: string[];
  category: string;
  trustScore?: number;
  emoji?: string;
  avatarUrl?: string;
}

/**
 * Get a real avatar URL for a source using unavatar.io
 * Falls back to UI Avatars for sources without handles
 */
export function getSourceAvatar(source: Source): string {
  // If explicitly set, use it
  if (source.avatarUrl) return source.avatarUrl;

  const handle = source.handle?.replace("@", "");

  switch (source.category) {
    case "x":
      if (handle) return `https://unavatar.io/twitter/${handle}`;
      break;
    case "youtube":
      // Use YouTube channel name from URL
      const ytMatch = source.url.match(/@([^/]+)/);
      if (ytMatch) return `https://unavatar.io/youtube/${ytMatch[1]}`;
      break;
    case "github":
      // Extract org/user from GitHub URL
      const ghMatch = source.url.match(/github\.com\/([^/]+)/);
      if (ghMatch) return `https://unavatar.io/github/${ghMatch[1]}`;
      break;
    case "reddit":
      return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png`;
    case "instagram":
      const igHandle = source.name.replace("@", "");
      return `https://unavatar.io/instagram/${igHandle}`;
    default:
      break;
  }

  // Try domain-based avatar for websites
  try {
    const domain = new URL(source.url).hostname;
    return `https://unavatar.io/${domain}`;
  } catch {
    // Fallback to initials
    const initials = source.name.split(" ").map(w => w[0]).join("").slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1A2C32&color=58CC02&size=64&bold=true`;
  }
}

/**
 * Simulates "has new updates" based on a deterministic hash of the source name + current date
 * In production this would come from RSS/API polling
 */
export function sourceHasUpdate(sourceName: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  const str = sourceName + today;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  // ~25% of sources show as "new" each day
  return Math.abs(hash) % 4 === 0;
}

export const SOURCE_CATEGORIES = [
  { id: "x", label: "X / Twitter", emoji: "🐦", color: "#1DA1F2" },
  { id: "youtube", label: "YouTube", emoji: "📺", color: "#FF4B4B" },
  { id: "reddit", label: "Subreddits", emoji: "🟠", color: "#FF4500" },
  { id: "newsletter", label: "Newsletters", emoji: "📬", color: "#FF9600" },
  { id: "podcast", label: "Podcasts", emoji: "🎙️", color: "#9B59B6" },
  { id: "blog", label: "Blogs & Sites", emoji: "📰", color: "#1CB0F6" },
  { id: "mcp", label: "MCP Sites", emoji: "🔌", color: "#58CC02" },
  { id: "github", label: "GitHub Repos", emoji: "💻", color: "#CE82FF" },
  { id: "course", label: "Courses", emoji: "🎓", color: "#FFC800" },
  { id: "discord", label: "Discord", emoji: "💬", color: "#5865F2" },
  { id: "instagram", label: "Instagram", emoji: "📸", color: "#E1306C" },
  { id: "conference", label: "Conferences", emoji: "🏆", color: "#FF4B91" },
  { id: "india", label: "India 🇮🇳", emoji: "🇮🇳", color: "#FF9933" },
  { id: "semiconductor", label: "Semiconductor", emoji: "🏭", color: "#607D8B" },
] as const;

export type SourceCategoryId = typeof SOURCE_CATEGORIES[number]["id"];

// ─── FEATURED: Top 5 sources to follow TODAY ───
export const FEATURED_SOURCE_NAMES = [
  "@karpathy", "The Rundown AI", "LangChain Academy", "crewAI (GitHub)", "Latent Space"
];

export const ALL_SOURCES: Source[] = [
  // ═══════════════════════════════════════════
  // 🐦 X / TWITTER — AI Leaders & Researchers
  // ═══════════════════════════════════════════
  { name: "Sam Altman", handle: "@sama", url: "https://x.com/sama", desc: "OpenAI CEO — AGI strategy, company direction", tags: ["openai", "agi", "leader"], category: "x", trustScore: 95, emoji: "🧠" },
  { name: "Andrej Karpathy", handle: "@karpathy", url: "https://x.com/karpathy", desc: "Ex-Tesla/OpenAI, builds LLMs from scratch on YouTube", tags: ["llm", "research", "education"], category: "x", trustScore: 98, emoji: "🔬" },
  { name: "Yann LeCun", handle: "@ylecun", url: "https://x.com/ylecun", desc: "Meta Chief AI Scientist, world model evangelist", tags: ["meta", "research", "world-models"], category: "x", trustScore: 95, emoji: "🧪" },
  { name: "Andrew Ng", handle: "@AndrewYNg", url: "https://x.com/AndrewYNg", desc: "DeepLearning.AI founder, most trusted AI educator", tags: ["education", "deeplearning", "courses"], category: "x", trustScore: 99, emoji: "🎓" },
  { name: "Demis Hassabis", handle: "@demishassabis", url: "https://x.com/demishassabis", desc: "Google DeepMind CEO, AlphaFold/Gemini", tags: ["deepmind", "gemini", "research"], category: "x", trustScore: 95, emoji: "🧬" },
  { name: "Gary Marcus", handle: "@GaryMarcus", url: "https://x.com/GaryMarcus", desc: "Loudest AI skeptic, great for balance", tags: ["skeptic", "critique", "debate"], category: "x", trustScore: 80, emoji: "⚖️" },
  { name: "Riley Goodside", handle: "@goodside", url: "https://x.com/goodside", desc: "Prompt engineering pioneer", tags: ["prompts", "engineering"], category: "x", trustScore: 85, emoji: "✨" },
  { name: "Jeremy Howard", handle: "@jeremyphoward", url: "https://x.com/jeremyphoward", desc: "fast.ai, Answer.AI founder", tags: ["fastai", "practical", "education"], category: "x", trustScore: 92, emoji: "🎯" },
  { name: "François Chollet", handle: "@fchollet", url: "https://x.com/fchollet", desc: "Keras creator, ARC-AGI benchmark", tags: ["keras", "arc", "benchmarks"], category: "x", trustScore: 93, emoji: "🧩" },
  { name: "David Ha", handle: "@hardmaru", url: "https://x.com/hardmaru", desc: "Sakana AI co-founder, evolutionary methods", tags: ["sakana", "evolution", "research"], category: "x", trustScore: 88, emoji: "🧬" },
  { name: "Ofir Press", handle: "@OfirPress", url: "https://x.com/OfirPress", desc: "Princeton, SWE-bench creator", tags: ["benchmark", "research"], category: "x", trustScore: 85, emoji: "📊" },
  { name: "Shunyu Yao", handle: "@ShunyuYao12", url: "https://x.com/ShunyuYao12", desc: "ReAct paper author, agents research", tags: ["react", "agents", "research"], category: "x", trustScore: 90, emoji: "⚡" },
  { name: "Percy Liang", handle: "@percyliang", url: "https://x.com/percyliang", desc: "Stanford, foundation model transparency", tags: ["stanford", "transparency"], category: "x", trustScore: 88, emoji: "🏛️" },
  { name: "Eric Jang", handle: "@ericjang11", url: "https://x.com/ericjang11", desc: "1X AI, robotics + agents", tags: ["robotics", "agents"], category: "x", trustScore: 85, emoji: "🤖" },
  { name: "Anthropic", handle: "@AnthropicAI", url: "https://x.com/AnthropicAI", desc: "Claude, safety research official", tags: ["claude", "safety", "official"], category: "x", trustScore: 95, emoji: "🛡️" },
  { name: "OpenAI", handle: "@OpenAI", url: "https://x.com/OpenAI", desc: "OpenAI official account", tags: ["gpt", "official"], category: "x", trustScore: 95, emoji: "🤖" },
  { name: "Google DeepMind", handle: "@GoogleDeepMind", url: "https://x.com/GoogleDeepMind", desc: "Google DeepMind official", tags: ["deepmind", "gemini", "official"], category: "x", trustScore: 95, emoji: "🧠" },
  { name: "Meta AI", handle: "@Meta_AI", url: "https://x.com/Meta_AI", desc: "Meta AI / FAIR official", tags: ["meta", "llama", "official"], category: "x", trustScore: 90, emoji: "🌐" },
  { name: "Mistral AI", handle: "@MistralAI", url: "https://x.com/MistralAI", desc: "Mistral AI official", tags: ["mistral", "open-source", "official"], category: "x", trustScore: 88, emoji: "🌬️" },

  // X — Agent Builders & Practitioners
  { name: "Shawn Wang (swyx)", handle: "@swyx", url: "https://x.com/swyx", desc: "Latent Space host, AI engineer community", tags: ["latent-space", "community", "engineering"], category: "x", trustScore: 90, emoji: "🎙️" },
  { name: "LangChain", handle: "@LangChainAI", url: "https://x.com/LangChainAI", desc: "LangChain official", tags: ["langchain", "framework", "official"], category: "x", trustScore: 90, emoji: "🔗" },
  { name: "CrewAI", handle: "@crewAIInc", url: "https://x.com/crewAIInc", desc: "CrewAI official — role-based agents", tags: ["crewai", "multi-agent", "official"], category: "x", trustScore: 88, emoji: "👥" },
  { name: "Mckay Wrigley", handle: "@mckaywrigley", url: "https://x.com/mckaywrigley", desc: "Takeoff, hands-on AI builder", tags: ["builder", "practical"], category: "x", trustScore: 82, emoji: "🛠️" },
  { name: "Pieter Levels", handle: "@levelsio", url: "https://x.com/levelsio", desc: "Indie hacker, AI side projects", tags: ["indie", "startup", "builder"], category: "x", trustScore: 85, emoji: "🚀" },
  { name: "Daniel Han", handle: "@danielhanchen", url: "https://x.com/danielhanchen", desc: "Unsloth, finetuning expert", tags: ["finetuning", "unsloth"], category: "x", trustScore: 85, emoji: "⚡" },
  { name: "Santiago Valdarrama", handle: "@svpino", url: "https://x.com/svpino", desc: "ML engineering, teacher", tags: ["ml", "education"], category: "x", trustScore: 82, emoji: "📚" },
  { name: "Sebastian Raschka", handle: "@rasbt", url: "https://x.com/rasbt", desc: "LLM from scratch book author", tags: ["llm", "book", "education"], category: "x", trustScore: 90, emoji: "📖" },
  { name: "Jim Fan", handle: "@DrJimFan", url: "https://x.com/DrJimFan", desc: "NVIDIA, embodied AI", tags: ["nvidia", "robotics", "embodied"], category: "x", trustScore: 88, emoji: "🤖" },
  { name: "AK (Hugging Face)", handle: "@_akhaliq", url: "https://x.com/_akhaliq", desc: "Hugging Face, daily papers curator", tags: ["papers", "huggingface", "daily"], category: "x", trustScore: 88, emoji: "📄" },
  { name: "Elvis Saravia", handle: "@omarsar0", url: "https://x.com/omarsar0", desc: "DAIR.AI newsletter, prompt engineering guide", tags: ["dair", "prompts", "newsletter"], category: "x", trustScore: 85, emoji: "📝" },
  { name: "Simon Willison", handle: "@simonw", url: "https://x.com/simonw", desc: "LLM CLI creator, practical AI blogger", tags: ["practical", "tools", "blog"], category: "x", trustScore: 90, emoji: "💻" },
  { name: "Aravind Srinivas", handle: "@AravSrinivas", url: "https://x.com/AravSrinivas", desc: "Perplexity CEO", tags: ["perplexity", "search", "ceo"], category: "x", trustScore: 85, emoji: "🔍" },
  { name: "Mustafa Suleyman", handle: "@mustafasuleymn", url: "https://x.com/mustafasuleymn", desc: "Microsoft AI CEO", tags: ["microsoft", "ceo"], category: "x", trustScore: 88, emoji: "🏢" },
  { name: "Elon Musk", handle: "@elonmusk", url: "https://x.com/elonmusk", desc: "xAI, Grok", tags: ["xai", "grok"], category: "x", trustScore: 70, emoji: "🚀" },

  // X — Founders, Investors, Strategy
  { name: "Balaji Srinivasan", handle: "@balajis", url: "https://x.com/balajis", desc: "Tech futurist", tags: ["futurist", "crypto", "strategy"], category: "x", trustScore: 82, emoji: "🔮" },
  { name: "Naval Ravikant", handle: "@naval", url: "https://x.com/naval", desc: "Wisdom + leverage", tags: ["philosophy", "startups"], category: "x", trustScore: 88, emoji: "🧘" },
  { name: "Paul Graham", handle: "@paulg", url: "https://x.com/paulg", desc: "YC cofounder, essays", tags: ["yc", "essays", "startups"], category: "x", trustScore: 92, emoji: "📝" },
  { name: "Reid Hoffman", handle: "@reidhoffman", url: "https://x.com/reidhoffman", desc: "LinkedIn/Inflection founder", tags: ["linkedin", "investor"], category: "x", trustScore: 85, emoji: "🤝" },
  { name: "Garry Tan", handle: "@garrytan", url: "https://x.com/garrytan", desc: "YC president", tags: ["yc", "investor"], category: "x", trustScore: 85, emoji: "🏗️" },
  { name: "Dharmesh Shah", handle: "@dharmesh", url: "https://x.com/dharmesh", desc: "HubSpot cofounder, Chat.com", tags: ["hubspot", "saas"], category: "x", trustScore: 82, emoji: "💬" },
  { name: "Packy McCormick", handle: "@packyM", url: "https://x.com/packyM", desc: "Not Boring newsletter", tags: ["newsletter", "business"], category: "x", trustScore: 82, emoji: "📰" },
  { name: "Lenny Rachitsky", handle: "@lennysan", url: "https://x.com/lennysan", desc: "PM/growth newsletter king", tags: ["pm", "growth", "newsletter"], category: "x", trustScore: 88, emoji: "📊" },

  // X — Indian Tech
  { name: "Nandan Nilekani", handle: "@NandanNilekani", url: "https://x.com/NandanNilekani", desc: "Infosys, Aadhaar architect", tags: ["infosys", "india", "tech-leader"], category: "x", trustScore: 90, emoji: "🇮🇳" },
  { name: "Nikhil Kamath", handle: "@Nikhil_Kamath", url: "https://x.com/Nikhil_Kamath", desc: "Zerodha cofounder, AI investor", tags: ["zerodha", "investor", "india"], category: "x", trustScore: 82, emoji: "📈" },
  { name: "Sriram Krishnan", handle: "@SriramK", url: "https://x.com/SriramK", desc: "a16z, White House AI policy", tags: ["a16z", "policy", "india"], category: "x", trustScore: 85, emoji: "🏛️" },
  { name: "Paras Chopra", handle: "@paraschopra", url: "https://x.com/paraschopra", desc: "Wingify founder, AI essays", tags: ["founder", "essays", "india"], category: "x", trustScore: 80, emoji: "✍️" },
  { name: "Varun Mayya", handle: "@varun_mayya", url: "https://x.com/varun_mayya", desc: "AI builder, YouTuber", tags: ["builder", "youtube", "india"], category: "x", trustScore: 78, emoji: "🎬" },

  // ═══════════════════════════════════════════
  // 📺 YOUTUBE
  // ═══════════════════════════════════════════
  { name: "3Blue1Brown", url: "https://youtube.com/@3blue1brown", desc: "Math intuition, transformers visualized", tags: ["math", "visualization", "transformers"], category: "youtube", trustScore: 98, emoji: "📐" },
  { name: "Andrej Karpathy", url: "https://youtube.com/@AndrejKarpathy", desc: "Build GPT from scratch, zero-to-hero series", tags: ["llm", "from-scratch", "tutorial"], category: "youtube", trustScore: 98, emoji: "🔬" },
  { name: "DeepLearning.AI", url: "https://youtube.com/@Deeplearningai", desc: "Andrew Ng's official channel", tags: ["courses", "andrew-ng"], category: "youtube", trustScore: 95, emoji: "🎓" },
  { name: "Two Minute Papers", url: "https://youtube.com/@TwoMinutePapers", desc: "Research bite-sized with excitement", tags: ["papers", "research", "quick"], category: "youtube", trustScore: 90, emoji: "📄" },
  { name: "Yannic Kilcher", url: "https://youtube.com/@YannicKilcher", desc: "Deep paper reviews", tags: ["papers", "research", "review"], category: "youtube", trustScore: 90, emoji: "🔍" },
  { name: "AI Explained", url: "https://youtube.com/@aiexplained-official", desc: "Nuanced frontier breakdowns", tags: ["frontier", "analysis"], category: "youtube", trustScore: 88, emoji: "🧠" },
  { name: "StatQuest", url: "https://youtube.com/@StatQuest", desc: "ML with zero BS", tags: ["statistics", "ml", "beginner"], category: "youtube", trustScore: 92, emoji: "📊" },
  { name: "Lex Fridman", url: "https://youtube.com/@lexfridman", desc: "Long-form AI interviews", tags: ["interviews", "deep-dive"], category: "youtube", trustScore: 88, emoji: "🎙️" },
  { name: "AI Jason", url: "https://youtube.com/@AIJason", desc: "Practical agents with LangGraph, CrewAI", tags: ["agents", "tutorials", "practical"], category: "youtube", trustScore: 85, emoji: "🤖" },
  { name: "Dave Ebbelaar", url: "https://youtube.com/@DaveEbbelaar", desc: "Python agent builds end-to-end", tags: ["python", "agents", "tutorial"], category: "youtube", trustScore: 82, emoji: "🐍" },
  { name: "Nate Herk", url: "https://youtube.com/@NateHerk", desc: "600K subs, ex-Goldman, n8n + AI", tags: ["n8n", "automation", "business"], category: "youtube", trustScore: 80, emoji: "💼" },
  { name: "Sabrina Ramonov", url: "https://youtube.com/@SabrinaRamonov", desc: "1.4M subs, Berkeley CS, $10M exit", tags: ["ai-tools", "startup"], category: "youtube", trustScore: 82, emoji: "✨" },
  { name: "Fireship", url: "https://youtube.com/@Fireship", desc: "100-second explainers, meme-friendly", tags: ["quick", "memes", "dev"], category: "youtube", trustScore: 88, emoji: "🔥" },
  { name: "Matt Wolfe", url: "https://youtube.com/@MattWolfe", desc: "Weekly AI tool roundups", tags: ["tools", "roundup", "weekly"], category: "youtube", trustScore: 82, emoji: "🛠️" },
  { name: "Wes Roth", url: "https://youtube.com/@WesRoth", desc: "Philosophical AI futures", tags: ["future", "philosophy"], category: "youtube", trustScore: 78, emoji: "🔮" },
  { name: "The AI Advantage", url: "https://youtube.com/@TheAIAdvantage", desc: "Business productivity with AI", tags: ["productivity", "business"], category: "youtube", trustScore: 80, emoji: "📈" },
  { name: "Theo (t3.gg)", url: "https://youtube.com/@t3dotgg", desc: "Practical dev + AI opinions", tags: ["dev", "opinions"], category: "youtube", trustScore: 82, emoji: "💻" },
  { name: "ThePrimeagen", url: "https://youtube.com/@ThePrimeagen", desc: "Dev culture + AI takes", tags: ["dev", "culture", "memes"], category: "youtube", trustScore: 80, emoji: "⌨️" },
  { name: "Sentdex", url: "https://youtube.com/@sentdex", desc: "1.4M subs, Python/ML classic", tags: ["python", "ml", "classic"], category: "youtube", trustScore: 85, emoji: "🐍" },
  { name: "Cole Medin", url: "https://youtube.com/@ColeMedin", desc: "n8n + agent automation", tags: ["n8n", "automation"], category: "youtube", trustScore: 78, emoji: "⚙️" },
  { name: "Tech With Tim", url: "https://youtube.com/@TechWithTim", desc: "Python + agents tutorials", tags: ["python", "tutorial"], category: "youtube", trustScore: 80, emoji: "🎓" },
  { name: "Krish Naik", url: "https://youtube.com/@krishnaik06", desc: "Practical ML/LLM tutorials", tags: ["ml", "tutorial", "india"], category: "youtube", trustScore: 82, emoji: "🇮🇳" },
  { name: "Varun Mayya (YT)", url: "https://youtube.com/@VarunMayya", desc: "Tech founder energy, AI for indie builders", tags: ["indie", "founder", "india"], category: "youtube", trustScore: 78, emoji: "🚀" },

  // ═══════════════════════════════════════════
  // 🟠 REDDIT
  // ═══════════════════════════════════════════
  { name: "r/AI_Agents", url: "https://reddit.com/r/AI_Agents", desc: "Dedicated AI agents community, practical focus", tags: ["agents", "community"], category: "reddit", trustScore: 85, emoji: "🤖" },
  { name: "r/LocalLLaMA", url: "https://reddit.com/r/LocalLLaMA", desc: "Local LLMs, very technical, gold mine", tags: ["local", "llm", "technical"], category: "reddit", trustScore: 90, emoji: "🦙" },
  { name: "r/LangChain", url: "https://reddit.com/r/LangChain", desc: "LangChain ecosystem discussions", tags: ["langchain"], category: "reddit", trustScore: 82, emoji: "🔗" },
  { name: "r/MachineLearning", url: "https://reddit.com/r/MachineLearning", desc: "Academic ML, very high signal", tags: ["ml", "academic", "research"], category: "reddit", trustScore: 92, emoji: "🧪" },
  { name: "r/OpenAI", url: "https://reddit.com/r/OpenAI", desc: "OpenAI product + API discussion", tags: ["openai", "api"], category: "reddit", trustScore: 80, emoji: "🤖" },
  { name: "r/ClaudeAI", url: "https://reddit.com/r/ClaudeAI", desc: "Claude-specific community", tags: ["claude", "anthropic"], category: "reddit", trustScore: 80, emoji: "🛡️" },
  { name: "r/singularity", url: "https://reddit.com/r/singularity", desc: "AGI futurism discussions", tags: ["agi", "future"], category: "reddit", trustScore: 70, emoji: "🔮" },
  { name: "r/ChatGPTCoding", url: "https://reddit.com/r/ChatGPTCoding", desc: "Coding with LLMs", tags: ["coding", "llm"], category: "reddit", trustScore: 78, emoji: "💻" },
  { name: "r/PromptEngineering", url: "https://reddit.com/r/PromptEngineering", desc: "Prompt craft community", tags: ["prompts"], category: "reddit", trustScore: 75, emoji: "✨" },
  { name: "r/StableDiffusion", url: "https://reddit.com/r/StableDiffusion", desc: "Image gen + creative AI", tags: ["image-gen", "creative"], category: "reddit", trustScore: 80, emoji: "🎨" },
  { name: "r/developersIndia", url: "https://reddit.com/r/developersIndia", desc: "Indian dev community", tags: ["india", "dev"], category: "reddit", trustScore: 78, emoji: "🇮🇳" },
  { name: "r/SaaS", url: "https://reddit.com/r/SaaS", desc: "SaaS founders community", tags: ["saas", "startup"], category: "reddit", trustScore: 75, emoji: "💼" },

  // ═══════════════════════════════════════════
  // 📬 NEWSLETTERS
  // ═══════════════════════════════════════════
  { name: "The Rundown AI", url: "https://therundown.ai", desc: "2M+ readers, #1 AI newsletter", tags: ["daily", "news", "popular"], category: "newsletter", trustScore: 90, emoji: "📨" },
  { name: "The Batch", url: "https://deeplearning.ai/the-batch/", desc: "Andrew Ng weekly, most authoritative", tags: ["weekly", "andrew-ng", "research"], category: "newsletter", trustScore: 95, emoji: "📊" },
  { name: "Ben's Bites", url: "https://bensbites.com", desc: "100K+ subs, AI business deep dives", tags: ["business", "daily"], category: "newsletter", trustScore: 88, emoji: "🍪" },
  { name: "Superhuman AI", url: "https://superhuman.ai", desc: "1M+ subs, daily AI news", tags: ["daily", "popular"], category: "newsletter", trustScore: 85, emoji: "⚡" },
  { name: "The Neuron", url: "https://theneurondaily.com", desc: "Complex AI made digestible", tags: ["daily", "accessible"], category: "newsletter", trustScore: 82, emoji: "🧠" },
  { name: "TLDR AI", url: "https://tldr.tech/ai", desc: "Concise daily AI newsletter", tags: ["daily", "concise"], category: "newsletter", trustScore: 85, emoji: "📋" },
  { name: "Import AI", url: "https://importai.substack.com", desc: "Jack Clark's research weekly", tags: ["research", "weekly"], category: "newsletter", trustScore: 90, emoji: "📥" },
  { name: "AlphaSignal", url: "https://alphasignal.ai", desc: "Trending repos + coding tips", tags: ["repos", "coding"], category: "newsletter", trustScore: 82, emoji: "📡" },
  { name: "Latent Space", url: "https://latent.space", desc: "AI engineering deep dives (swyx)", tags: ["engineering", "deep-dive"], category: "newsletter", trustScore: 90, emoji: "🌌" },
  { name: "The Gradient", url: "https://thegradient.pub", desc: "Long-form AI research essays", tags: ["research", "essays"], category: "newsletter", trustScore: 88, emoji: "📐" },
  { name: "DAIR.AI", url: "https://dair.ai", desc: "NLP newsletter, research highlights", tags: ["nlp", "research"], category: "newsletter", trustScore: 85, emoji: "📝" },
  { name: "Interconnects", url: "https://interconnects.ai", desc: "Nathan Lambert, RL/LLMs", tags: ["rl", "llm", "research"], category: "newsletter", trustScore: 85, emoji: "🔗" },
  { name: "One Useful Thing", url: "https://oneusefulthing.org", desc: "Ethan Mollick — practical AI use", tags: ["practical", "professor"], category: "newsletter", trustScore: 90, emoji: "💡" },
  { name: "Lenny's Newsletter", url: "https://lennysnewsletter.com", desc: "PM/growth, king of the space", tags: ["pm", "growth"], category: "newsletter", trustScore: 88, emoji: "📊" },
  { name: "Stratechery", url: "https://stratechery.com", desc: "Ben Thompson, strategic analysis", tags: ["strategy", "analysis"], category: "newsletter", trustScore: 92, emoji: "♟️" },
  { name: "Not Boring", url: "https://notboring.co", desc: "Packy McCormick — business + tech", tags: ["business", "tech"], category: "newsletter", trustScore: 82, emoji: "🎯" },
  { name: "The Pragmatic Engineer", url: "https://pragmaticengineer.com", desc: "Gergely Orosz, eng leadership", tags: ["engineering", "leadership"], category: "newsletter", trustScore: 88, emoji: "🏗️" },

  // ═══════════════════════════════════════════
  // 🎙️ PODCASTS
  // ═══════════════════════════════════════════
  { name: "Lex Fridman Podcast", url: "https://lexfridman.com/podcast", desc: "Long-form AI interviews", tags: ["interviews", "deep"], category: "podcast", trustScore: 88, emoji: "🎙️" },
  { name: "Latent Space Podcast", url: "https://latent.space", desc: "AI engineer podcast (swyx)", tags: ["engineering", "agents"], category: "podcast", trustScore: 90, emoji: "🌌" },
  { name: "Dwarkesh Podcast", url: "https://dwarkeshpatel.com", desc: "Rigorous AI conversations", tags: ["interviews", "rigorous"], category: "podcast", trustScore: 88, emoji: "🎯" },
  { name: "No Priors", url: "https://nopriors.com", desc: "Sarah Guo + Elad Gil", tags: ["vc", "strategy"], category: "podcast", trustScore: 85, emoji: "🚀" },
  { name: "All-In Podcast", url: "https://allin.com", desc: "Tech/biz weekly roundtable", tags: ["tech", "business"], category: "podcast", trustScore: 80, emoji: "💰" },
  { name: "Practical AI", url: "https://practicalai.fm", desc: "Applied AI focus", tags: ["practical", "applied"], category: "podcast", trustScore: 82, emoji: "🔧" },
  { name: "Hard Fork", url: "https://nytimes.com/column/hard-fork", desc: "NYT tech podcast (Kevin Roose + Casey Newton)", tags: ["news", "tech"], category: "podcast", trustScore: 85, emoji: "📰" },
  { name: "Cognitive Revolution", url: "https://cognitiverevolution.ai", desc: "Deep AI founder chats", tags: ["founders", "deep"], category: "podcast", trustScore: 82, emoji: "🧠" },
  { name: "Machine Learning Street Talk", url: "https://youtube.com/@MachineLearningStreetTalk", desc: "Deep research conversations", tags: ["research", "technical"], category: "podcast", trustScore: 85, emoji: "🔬" },

  // ═══════════════════════════════════════════
  // 📰 BLOGS & SITES
  // ═══════════════════════════════════════════
  { name: "Hacker News", url: "https://news.ycombinator.com", desc: "Search 'AI agent', 'MCP' — gold mine", tags: ["community", "news", "tech"], category: "blog", trustScore: 90, emoji: "🟧" },
  { name: "Product Hunt", url: "https://producthunt.com", desc: "New agent products weekly", tags: ["products", "launch"], category: "blog", trustScore: 82, emoji: "🐱" },
  { name: "Papers With Code", url: "https://paperswithcode.com", desc: "Research + runnable code", tags: ["research", "code"], category: "blog", trustScore: 92, emoji: "📄" },
  { name: "arXiv cs.AI", url: "https://arxiv.org/list/cs.AI/recent", desc: "Latest AI papers", tags: ["papers", "research"], category: "blog", trustScore: 95, emoji: "📚" },
  { name: "HF Daily Papers", url: "https://huggingface.co/papers", desc: "Curated by AK daily", tags: ["papers", "curated"], category: "blog", trustScore: 88, emoji: "🤗" },
  { name: "Anthropic Blog", url: "https://anthropic.com/news", desc: "Claude research + announcements", tags: ["claude", "research"], category: "blog", trustScore: 92, emoji: "🛡️" },
  { name: "OpenAI Blog", url: "https://openai.com/blog", desc: "OpenAI announcements", tags: ["openai", "announcements"], category: "blog", trustScore: 92, emoji: "🤖" },
  { name: "Google Research Blog", url: "https://research.google/blog", desc: "Google AI research", tags: ["google", "research"], category: "blog", trustScore: 92, emoji: "🔍" },
  { name: "DeepMind Blog", url: "https://deepmind.google/discover/blog", desc: "DeepMind discoveries", tags: ["deepmind", "research"], category: "blog", trustScore: 92, emoji: "🧬" },
  { name: "The Verge AI", url: "https://theverge.com/ai-artificial-intelligence", desc: "AI news coverage", tags: ["news", "mainstream"], category: "blog", trustScore: 82, emoji: "📱" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence", desc: "AI startup news", tags: ["startups", "news"], category: "blog", trustScore: 82, emoji: "💼" },
  { name: "MIT Technology Review", url: "https://technologyreview.com", desc: "In-depth tech analysis", tags: ["research", "analysis"], category: "blog", trustScore: 90, emoji: "🏛️" },
  { name: "Semianalysis", url: "https://semianalysis.com", desc: "Chips + AI infra (Dylan Patel)", tags: ["chips", "infra", "analysis"], category: "blog", trustScore: 88, emoji: "🏭" },
  { name: "SimonWillison.net", url: "https://simonwillison.net", desc: "Practical AI blog", tags: ["practical", "tools"], category: "blog", trustScore: 90, emoji: "💻" },
  { name: "Swyx.io", url: "https://swyx.io", desc: "AI engineer essays", tags: ["engineering", "essays"], category: "blog", trustScore: 85, emoji: "✍️" },

  // ═══════════════════════════════════════════
  // 🔌 MCP SITES
  // ═══════════════════════════════════════════
  { name: "GitHub Official MCP", url: "https://github.com/modelcontextprotocol/servers", desc: "Anthropic's official — START HERE", tags: ["official", "mcp", "servers"], category: "mcp", trustScore: 98, emoji: "🏠" },
  { name: "mcp.so", url: "https://mcp.so", desc: "19,500+ community MCP servers", tags: ["directory", "community"], category: "mcp", trustScore: 85, emoji: "🌐" },
  { name: "PulseMCP", url: "https://pulsemcp.com/servers", desc: "11,150+ servers, daily updates", tags: ["directory", "daily"], category: "mcp", trustScore: 82, emoji: "💓" },
  { name: "Glama MCP", url: "https://glama.ai/mcp/servers", desc: "Curated with quality filters", tags: ["curated", "quality"], category: "mcp", trustScore: 85, emoji: "✨" },
  { name: "LobeHub MCP", url: "https://lobehub.com/mcp", desc: "48,000+ skills/servers", tags: ["large", "directory"], category: "mcp", trustScore: 80, emoji: "🧩" },
  { name: "MCP Market", url: "https://mcpmarket.com", desc: "Categorized marketplace", tags: ["marketplace"], category: "mcp", trustScore: 78, emoji: "🏪" },
  { name: "Smithery", url: "https://smithery.ai", desc: "Growing MCP registry", tags: ["registry"], category: "mcp", trustScore: 78, emoji: "🔨" },
  { name: "Composio MCP", url: "https://composio.dev", desc: "Tools + MCP integration", tags: ["tools", "integration"], category: "mcp", trustScore: 82, emoji: "🔧" },
  { name: "Zapier MCP", url: "https://zapier.com/mcp", desc: "Zapier's MCP offering", tags: ["zapier", "automation"], category: "mcp", trustScore: 80, emoji: "⚡" },
  { name: "MCP Docs", url: "https://modelcontextprotocol.io", desc: "Official MCP documentation", tags: ["docs", "official"], category: "mcp", trustScore: 95, emoji: "📖" },

  // ═══════════════════════════════════════════
  // 💻 GITHUB REPOS
  // ═══════════════════════════════════════════
  { name: "crewAI (GitHub)", url: "https://github.com/crewAIInc/crewAI", desc: "Role-based agent teams", tags: ["agents", "multi-agent", "framework"], category: "github", trustScore: 88, emoji: "👥" },
  { name: "LangGraph", url: "https://github.com/langchain-ai/langgraph", desc: "Stateful graph agent workflows", tags: ["agents", "graph", "framework"], category: "github", trustScore: 90, emoji: "📊" },
  { name: "AutoGen", url: "https://github.com/microsoft/autogen", desc: "Microsoft multi-agent conversation", tags: ["microsoft", "multi-agent"], category: "github", trustScore: 88, emoji: "🤖" },
  { name: "MetaGPT", url: "https://github.com/geekan/MetaGPT", desc: "SW company simulation with agents", tags: ["simulation", "multi-agent"], category: "github", trustScore: 82, emoji: "🏢" },
  { name: "AutoGPT", url: "https://github.com/Significant-Gravitas/AutoGPT", desc: "The OG agent — 170K+ stars", tags: ["autonomous", "og"], category: "github", trustScore: 80, emoji: "🌟" },
  { name: "GPT Researcher", url: "https://github.com/assafelovic/gpt-researcher", desc: "Autonomous research agent", tags: ["research", "autonomous"], category: "github", trustScore: 82, emoji: "🔬" },
  { name: "Awesome AI Agents", url: "https://github.com/e2b-dev/awesome-ai-agents", desc: "Curated list of agent projects", tags: ["awesome-list", "curated"], category: "github", trustScore: 85, emoji: "📋" },
  { name: "mem0", url: "https://github.com/mem0ai/mem0", desc: "Agent memory layer", tags: ["memory", "persistence"], category: "github", trustScore: 80, emoji: "🧠" },
  { name: "LlamaIndex", url: "https://github.com/run-llama/llama_index", desc: "Data-first agent framework", tags: ["data", "rag"], category: "github", trustScore: 88, emoji: "🦙" },
  { name: "n8n", url: "https://github.com/n8n-io/n8n", desc: "Workflow automation + AI", tags: ["automation", "workflow"], category: "github", trustScore: 88, emoji: "⚙️" },
  { name: "Stagehand", url: "https://github.com/browserbase/stagehand", desc: "Browser automation for agents", tags: ["browser", "automation"], category: "github", trustScore: 78, emoji: "🎭" },
  { name: "SWE-agent", url: "https://github.com/princeton-nlp/SWE-agent", desc: "Software engineering agents", tags: ["swe", "coding"], category: "github", trustScore: 85, emoji: "💻" },
  { name: "Cline", url: "https://github.com/cline/cline", desc: "VS Code autonomous coding agent", tags: ["vscode", "coding"], category: "github", trustScore: 82, emoji: "⌨️" },
  { name: "Claude Code", url: "https://github.com/anthropics/claude-code", desc: "Anthropic's official CLI agent", tags: ["cli", "anthropic"], category: "github", trustScore: 88, emoji: "🛡️" },
  { name: "Ollama", url: "https://github.com/ollama/ollama", desc: "Local LLM runner", tags: ["local", "llm"], category: "github", trustScore: 90, emoji: "🦙" },
  { name: "Unsloth", url: "https://github.com/unslothai/unsloth", desc: "Fast finetuning", tags: ["finetuning", "fast"], category: "github", trustScore: 85, emoji: "⚡" },
  { name: "Fabric", url: "https://github.com/danielmiessler/fabric", desc: "Prompt engineering patterns", tags: ["prompts", "patterns"], category: "github", trustScore: 82, emoji: "🧵" },
  { name: "Pydantic AI", url: "https://github.com/pydantic/pydantic-ai", desc: "Type-safe agent framework", tags: ["python", "type-safe"], category: "github", trustScore: 82, emoji: "🐍" },
  { name: "LiveKit Agents", url: "https://github.com/livekit/agents", desc: "Real-time voice agents", tags: ["voice", "realtime"], category: "github", trustScore: 80, emoji: "🎤" },

  // ═══════════════════════════════════════════
  // 🎓 COURSES
  // ═══════════════════════════════════════════
  { name: "DeepLearning.AI", url: "https://coursera.org/deeplearning-ai", desc: "Andrew Ng, free to audit", tags: ["andrew-ng", "free"], category: "course", trustScore: 95, emoji: "🎓" },
  { name: "LangChain Academy", url: "https://academy.langchain.com", desc: "Official LangGraph courses", tags: ["langraph", "official", "free"], category: "course", trustScore: 90, emoji: "🔗" },
  { name: "Fast.ai", url: "https://fast.ai", desc: "Practical deep learning, free", tags: ["practical", "free"], category: "course", trustScore: 92, emoji: "🚀" },
  { name: "HuggingFace Learn", url: "https://huggingface.co/learn", desc: "Free NLP + agents course", tags: ["nlp", "agents", "free"], category: "course", trustScore: 88, emoji: "🤗" },
  { name: "Anthropic Docs", url: "https://docs.anthropic.com", desc: "Prompt engineering guide", tags: ["prompts", "official"], category: "course", trustScore: 90, emoji: "📖" },
  { name: "OpenAI Cookbook", url: "https://cookbook.openai.com", desc: "Practical recipes", tags: ["recipes", "practical"], category: "course", trustScore: 88, emoji: "🍳" },
  { name: "Stanford CS224N", url: "https://web.stanford.edu/class/cs224n", desc: "NLP classic course", tags: ["stanford", "nlp"], category: "course", trustScore: 95, emoji: "🏛️" },
  { name: "MIT 6.S191", url: "https://introtodeeplearning.com", desc: "Intro to deep learning", tags: ["mit", "intro"], category: "course", trustScore: 92, emoji: "🎓" },
  { name: "Karpathy Zero-to-Hero", url: "https://karpathy.ai/zero-to-hero.html", desc: "Build LLMs from scratch", tags: ["llm", "from-scratch"], category: "course", trustScore: 98, emoji: "🔬" },

  // ═══════════════════════════════════════════
  // 💬 DISCORD
  // ═══════════════════════════════════════════
  { name: "LangChain Discord", url: "https://discord.gg/langchain", desc: "Official LangChain community", tags: ["langchain", "community"], category: "discord", trustScore: 85, emoji: "🔗" },
  { name: "CrewAI Discord", url: "https://discord.gg/crewai", desc: "Official CrewAI community", tags: ["crewai", "community"], category: "discord", trustScore: 82, emoji: "👥" },
  { name: "Anthropic Discord", url: "https://discord.gg/anthropic", desc: "Claude + MCP + agents", tags: ["claude", "mcp"], category: "discord", trustScore: 88, emoji: "🛡️" },
  { name: "Hugging Face Discord", url: "https://huggingface.co/join/discord", desc: "HF community hub", tags: ["huggingface"], category: "discord", trustScore: 85, emoji: "🤗" },
  { name: "MLOps Community", url: "https://mlops.community", desc: "Production ML community", tags: ["mlops", "production"], category: "discord", trustScore: 82, emoji: "⚙️" },
  { name: "Latent Space Discord", url: "https://latent.space", desc: "swyx's AI engineer community", tags: ["engineering"], category: "discord", trustScore: 85, emoji: "🌌" },
  { name: "Eleuther AI", url: "https://eleuther.ai", desc: "Research-focused open AI", tags: ["research", "open-source"], category: "discord", trustScore: 85, emoji: "🔬" },

  // ═══════════════════════════════════════════
  // 📸 INSTAGRAM
  // ═══════════════════════════════════════════
  { name: "@openai", url: "https://instagram.com/openai", desc: "OpenAI visual updates", tags: ["openai"], category: "instagram", emoji: "🤖" },
  { name: "@deepmind", url: "https://instagram.com/deepmind", desc: "DeepMind research visuals", tags: ["deepmind"], category: "instagram", emoji: "🧠" },
  { name: "@huggingface", url: "https://instagram.com/huggingface", desc: "HF community content", tags: ["huggingface"], category: "instagram", emoji: "🤗" },
  { name: "@levelsio", url: "https://instagram.com/levelsio", desc: "Pieter Levels — indie hacker", tags: ["indie"], category: "instagram", emoji: "🚀" },
  { name: "@garrytan", url: "https://instagram.com/garrytan", desc: "YC president", tags: ["yc"], category: "instagram", emoji: "🏗️" },

  // ═══════════════════════════════════════════
  // 🏆 CONFERENCES
  // ═══════════════════════════════════════════
  { name: "NeurIPS", url: "https://neurips.cc", desc: "#1 ML research conference", tags: ["research", "ml"], category: "conference", trustScore: 98, emoji: "🏆" },
  { name: "ICML", url: "https://icml.cc", desc: "#2 ML research conference", tags: ["research", "ml"], category: "conference", trustScore: 95, emoji: "🥈" },
  { name: "ICLR", url: "https://iclr.cc", desc: "Deep learning conference", tags: ["deep-learning"], category: "conference", trustScore: 95, emoji: "🧠" },
  { name: "AI Engineer Summit", url: "https://ai.engineer", desc: "swyx's practitioner conference", tags: ["engineering", "practical"], category: "conference", trustScore: 85, emoji: "🛠️" },
  { name: "NVIDIA GTC", url: "https://nvidia.com/gtc", desc: "NVIDIA annual flagship", tags: ["nvidia", "gpu"], category: "conference", trustScore: 90, emoji: "🖥️" },

  // ═══════════════════════════════════════════
  // 🇮🇳 INDIAN-SPECIFIC
  // ═══════════════════════════════════════════
  { name: "The Ken", url: "https://the-ken.com", desc: "Premium Indian business journalism", tags: ["india", "business", "premium"], category: "india", trustScore: 85, emoji: "📰" },
  { name: "Inc42", url: "https://inc42.com", desc: "Indian startup ecosystem", tags: ["india", "startups"], category: "india", trustScore: 80, emoji: "🚀" },
  { name: "YourStory", url: "https://yourstory.com", desc: "Indian entrepreneurship", tags: ["india", "founders"], category: "india", trustScore: 78, emoji: "📝" },
  { name: "Analytics India Magazine", url: "https://analyticsindiamag.com", desc: "Indian AI/ML news", tags: ["india", "ai", "news"], category: "india", trustScore: 80, emoji: "📊" },

  // ═══════════════════════════════════════════
  // 🏭 SEMICONDUCTOR
  // ═══════════════════════════════════════════
  { name: "EETimes", url: "https://eetimes.com", desc: "Semiconductor industry news", tags: ["semiconductor", "news"], category: "semiconductor", trustScore: 88, emoji: "📰" },
  { name: "Semiconductor Engineering", url: "https://semiengineering.com", desc: "Deep technical semiconductor", tags: ["semiconductor", "technical"], category: "semiconductor", trustScore: 90, emoji: "🔧" },
  { name: "SemiWiki", url: "https://semiwiki.com", desc: "Semiconductor community", tags: ["semiconductor", "community"], category: "semiconductor", trustScore: 82, emoji: "📖" },
  { name: "Tom's Hardware", url: "https://tomshardware.com", desc: "Hardware news + reviews", tags: ["hardware", "reviews"], category: "semiconductor", trustScore: 82, emoji: "🖥️" },
  { name: "SEMI.org", url: "https://semi.org", desc: "Industry association", tags: ["semiconductor", "industry"], category: "semiconductor", trustScore: 88, emoji: "🏛️" },
  { name: "SIA", url: "https://semiconductors.org", desc: "Semiconductor Industry Association", tags: ["semiconductor", "policy"], category: "semiconductor", trustScore: 88, emoji: "🏢" },
  { name: "IEEE Solid-State Circuits", url: "https://sscs.ieee.org", desc: "IEEE SSC society", tags: ["ieee", "circuits"], category: "semiconductor", trustScore: 92, emoji: "⚡" },
];

// ─── CURIOSITY SPARKS SOURCE SEEDS ───
export const CURIOSITY_SOURCE_SEEDS: Record<string, string[]> = {
  industry: [
    "EETimes", "Semiconductor Engineering", "SemiWiki", "Tom's Hardware", "SEMI.org", "SIA", "IEEE SSC",
    "Semianalysis", "NVIDIA GTC", "Analytics India Magazine",
  ],
  general: [
    "Product Hunt", "Hacker News", "r/SaaS", "r/AI_Agents", "The Rundown AI", "Ben's Bites",
    "Superhuman AI", "TLDR AI", "AlphaSignal", "Latent Space", "AI Jason", "Dave Ebbelaar",
  ],
  crazy: [
    "arXiv cs.AI", "HF Daily Papers", "Two Minute Papers", "Yannic Kilcher", "Import AI",
    "DeepMind Blog", "Anthropic Blog", "Google Research Blog", "r/singularity", "Wes Roth", "AI Explained",
  ],
  daily: [
    "One Useful Thing", "Lenny's Newsletter", "The AI Advantage", "Matt Wolfe",
    "Zapier MCP", "The Pragmatic Engineer", "r/ChatGPTCoding",
  ],
};
