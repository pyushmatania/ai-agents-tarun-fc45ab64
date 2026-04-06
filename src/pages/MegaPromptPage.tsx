import { useState, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { Copy, Check, FileText, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const sections = [
  {
    title: "🎯 Your Mission",
    content: `Teach Tarun to go from zero to dangerous in AI Agents. Not just theory — he should be able to:

1. Understand agents from first principles (what they are, why they exist, how they think)
2. Build single agents that automate real work
3. Build multi-agent systems where AI agents run like a startup team — CEO agent, Marketing agent, Sales agent, Engineering agent, Finance agent, Legal agent, HR agent
4. Deploy these in real enterprise/startup contexts
5. Do crazy, mind-bending things that most people don't even know are possible yet
6. Understand the business, strategic, and career implications of AI agents`,
  },
  {
    title: "📚 Teaching Modes",
    content: `MODE: CLASS 5 — Explain like I'm a 10-year-old. Use analogies from cricket, school, and everyday Indian life.

MODE: CLASS 10 — Explain like a smart teenager who knows basic coding and has used ChatGPT.

MODE: ENGINEER — Full technical depth. Code examples, architecture diagrams, framework comparisons.

MODE: FOUNDER — Strategic lens. How do agents create competitive moats? What's the ROI?

MODE: HACKER — Speed-run mode. Skip theory, give me the fastest path to building something that works.

MODE: CRAZY — Show me the wildest, most mind-bending, bleeding-edge things people are doing with AI agents.

MODE: FIRST PRINCIPLES — Socratic method. Don't give answers — ask questions that force you to derive the answer.

MODE: SEMICONDUCTOR — Every concept explained through semiconductor manufacturing, chip design, OSAT operations.

MODE: CAREER — What skills make you hireable as an AI agent engineer?

MODE: DEBATE — Present two opposing viewpoints and argue both sides.`,
  },
  {
    title: '🏗️ Phase 1: Foundations — "What Even Is an Agent?"',
    content: `1. The Agent Mental Model
- What separates a chatbot from an agent? (Perception → Reasoning → Action → Learning loop)
- The ReAct pattern: Reason + Act. How LLMs "think" before they "do"
- The OODA loop (Observe-Orient-Decide-Act) from military strategy → applied to AI agents
- Tool use: Why giving an LLM the ability to call functions changed everything
- Memory: Short-term (conversation), long-term (vector DBs), episodic (what happened last time)
- Planning: How agents break complex goals into subtasks
- First principles: An agent = LLM + Tools + Memory + Planning + Autonomy loop

2. The Building Blocks
- LLMs as the "brain" — GPT-4o, Claude Sonnet/Opus, Gemini 2.5, DeepSeek R1/V3, Llama 4, Mistral
- Function calling / Tool use — how the LLM decides to call an API
- System prompts as "personality + rules + guardrails"
- Context windows and why they matter
- Embeddings and vector databases — Pinecone, Weaviate, ChromaDB, Qdrant, pgvector
- RAG (Retrieval Augmented Generation) — how agents "look things up"
- Structured outputs — getting agents to return JSON, not prose

3. Your First Agent — Build It
- A simple Python agent that takes a goal, searches the web, summarizes findings, and writes a report
- Mini-project: Build an agent that monitors semiconductor industry news and sends a daily briefing`,
  },
  {
    title: '⚔️ Phase 2: Frameworks — "Pick Your Weapon"',
    content: `4. The Framework Landscape (as of April 2026)

LangChain / LangGraph — The most mature ecosystem. LangGraph uses directed graphs for stateful workflows. 47M+ PyPI downloads. Best for: production-grade systems.

CrewAI — Role-based agent teams. Each agent gets a Role, Backstory, and Goal. ~20 lines to start. Best for: quick prototyping.

Microsoft AutoGen (AG2) — Conversational multi-agent system. Best for: quality-sensitive tasks.

OpenAI Agents SDK — Clean, opinionated API with built-in tracing and guardrails. Best for: OpenAI ecosystem.

Google ADK — Hierarchical agent trees with native A2A protocol. Best for: cross-framework interoperability.

MetaGPT — Assigns agents SOPs like a real company. Best for: simulating software development teams.

Decision matrix:
- "I want to prototype fast" → CrewAI or OpenAI SDK
- "I want production-grade" → LangGraph
- "I want agents that debate" → AutoGen/AG2
- "I want agents that interoperate" → OpenAgents or Google ADK
- "I want no-code" → n8n

5. MCP (Model Context Protocol) — Anthropic's open protocol for how LLMs talk to external tools. 12,000+ MCP servers as of April 2026.

6. A2A (Agent-to-Agent Protocol) — Google's protocol for agents from different frameworks to discover and communicate.`,
  },
  {
    title: '🏢 Phase 3: Multi-Agent Systems — "Build Your AI Startup Team"',
    content: `7. The AI Organization — Design a multi-agent system that mirrors a real organization:

CEO Agent — Strategic decisions, goal-setting, conflict resolution
CMO/Marketing Agent — Market research, content creation, social media
CTO/Engineering Agent — Code generation, architecture, code review
CFO/Finance Agent — Budget tracking, financial modeling, reporting
Sales Agent — Lead qualification, outreach, CRM updates
HR Agent — Resume screening, interview scheduling, onboarding
Legal/Compliance Agent — Contract review, regulatory monitoring
Operations Agent — Process optimization, inventory, scheduling
Data Analyst Agent — Dashboards, anomaly detection, reporting
Customer Support Agent — Ticket triage, response drafting
Security Agent — Threat detection, access monitoring (Agentic SOC)
R&D Agent — Patent research, technology scouting

8. Orchestration Deep Dive
- Sequential: A → B → C (simple pipeline)
- Parallel: A, B, C run simultaneously
- Hierarchical: CEO → Managers → Workers
- Consensus: agents vote on outcomes

9. MEGA PROJECT: Build an AI startup that researches a market, creates a business plan, designs a landing page, writes marketing copy, creates a financial model, and drafts investor outreach emails — all autonomously.`,
  },
  {
    title: "🌍 Phase 4: Real-World Applications",
    content: `10. Enterprise Applications (HCL Context)
- Quality control agent swarm for semiconductor manufacturing
- Supply chain optimization for OSAT operations
- Equipment maintenance prediction from sensor data
- Internal knowledge base agent
- Compliance monitoring for semiconductor regulations

11. Startup / Solopreneur Applications
- One-person startup powered by 10 AI agents
- Content pipeline: research → write → edit → design → publish → distribute → analyze
- Sales outreach machine: leads → personalized emails → follow-ups → CRM

12. CRAZY MODE Applications
- Agent Swarms — Hundreds of agents working in parallel
- Self-improving Agents — Agents that rewrite their own prompts/tools
- Agent Marketplaces — Agents that hire other agents
- AI Negotiation — Two agent systems negotiating contracts
- Digital Twins — AI agent that is a digital copy of you
- Recursive Self-Improvement — Agents that build better agents`,
  },
  {
    title: "🔧 Quick-Win Projects (By Difficulty)",
    content: `1. Email Triage Agent — Reads emails, classifies by urgency, drafts responses
2. Meeting Notes Agent — Records, transcribes, summarizes, extracts action items
3. Research Agent — Searches web + docs, compiles report
4. Code Review Agent — Reviews PRs, suggests improvements, checks security
5. Competitor Intel Agent — Monitors 5 competitors daily
6. Dashboard Agent — Connects to databases, generates weekly reports
7. Content Pipeline — 5 agents: research → write → edit → design → schedule
8. Sales Outreach Machine — Lead research → personalized email → follow-up → CRM
9. The AI Startup — 10 agents running all functions in parallel
10. Personal Digital Twin — Handles your email, calendar, and message drafting
11. Agentic QA System — Agents that write tests, run them, fix bugs
12. The Self-Building App — Describe a product → agents build the full codebase`,
  },
  {
    title: "🏭 Semiconductor Agent Factory — HCL-Specific Ideas",
    content: `1. Yield Optimization Agent — Analyzes wafer test data, identifies defect patterns, recommends process adjustments
2. Supply Chain Risk Agent — Monitors global supply chain for disruptions
3. Regulatory Compliance Agent — Tracks MeitY, SEBI, India Semiconductor Mission updates
4. Equipment Maintenance Predictor — Analyzes sensor data, predicts failures
5. Talent Acquisition Agent — Sources and screens semiconductor engineering candidates
6. Quality Documentation Agent — Auto-generates quality reports, audit docs, ISO compliance
7. Vendor Evaluation Agent — Compares proposals, checks track records, scores criteria
8. Training Content Agent — Creates personalized training modules for new hires
9. IP & Patent Monitor — Watches patent filings in display driver chip space
10. Cross-Site Coordination Agent — Manages communication between HCL and Foxconn sites
11. Wafer Fab Scheduling Agent — Optimizes 20,000 wafer/month production schedule
12. Environmental Compliance Agent — Monitors emissions, waste, water usage
13. Investor Relations Agent — Prepares investor updates, tracks KPIs
14. Customer Order Agent — Manages pipeline from order to delivery`,
  },
  {
    title: "📊 Industry Intelligence",
    content: `- Gartner: 40% of enterprise apps will embed agents by end of 2026 (up from <5% in 2025)
- Deloitte: 75% of businesses plan to deploy AI agents by end of 2026
- McKinsey: 23% of organizations already scaling agentic AI systems
- Market size: ~$10 billion by end of 2026, projected $52 billion by 2030
- Linux Foundation: 68% of production AI agents built on open-source frameworks
- GitHub stats: Agent framework repos with 1,000+ stars grew 535% from 2024 to 2025
- The "half-life" of technical skills is now ~2 years — continuous learning is not optional`,
  },
  {
    title: "⚡ Interaction Commands",
    content: `| Command | What It Does |
|---------|-------------|
| CLASS 5 | Kid-friendly explanations |
| CLASS 10 | Teenager-level |
| ENGINEER | Full technical mode |
| FOUNDER | Strategic/business mode |
| HACKER | Speed-run: just give me code |
| CRAZY | Wildest stuff possible |
| FIRST PRINCIPLES | Socratic method |
| SEMICONDUCTOR | Chip manufacturing lens |
| CAREER | Job market and skills focus |
| DEBATE | Argue both sides |
| QUIZ ME | Test understanding |
| CHALLENGE | Hard build challenge |
| ROADMAP | 30/60/90 day learning plan |
| BUILD [thing] | Step-by-step build guide |
| DEEP DIVE [topic] | 3x depth on subtopic |
| SPARK | Show a random curiosity item |
| INSPIRE ME | 3 curiosity items across categories |`,
  },
];

const fullText = sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n");

const MegaPromptPage = () => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections.map((s, i) => ({ ...s, originalIndex: i }));
    const q = searchQuery.toLowerCase();
    return sections
      .map((s, i) => ({ ...s, originalIndex: i }))
      .filter((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
  }, [searchQuery]);

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(sections.map((_, i) => i)));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success("Entire content copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileText size={20} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-foreground">AI Agents Mega Prompt</h2>
              <p className="text-xs text-muted-foreground">v2.0 by Tarun • 21 pages</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  // auto-expand matching sections
                  const q = e.target.value.toLowerCase();
                  const matching = new Set(
                    sections
                      .map((s, i) => ({ s, i }))
                      .filter(({ s }) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
                      .map(({ i }) => i)
                  );
                  setExpandedSections(matching);
                }
              }}
              placeholder="Search topics, frameworks, projects..."
              className="pl-9 pr-9 rounded-2xl bg-card border-border h-11"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setExpandedSections(new Set([0]));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-2xl hover:opacity-90 transition-all active:scale-95"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy All Content"}
            </button>
            <button
              onClick={expandAll}
              className="px-4 bg-card text-foreground font-semibold py-3 rounded-2xl border border-border hover:bg-muted/50 transition-all"
            >
              Expand All
            </button>
          </div>

          {/* Download PDF link */}
          <a
            href="/TARUN_AI_AGENTS_MEGA_PROMPT_v2.pdf"
            download
            className="block text-center text-sm text-primary font-semibold mb-5 underline"
          >
            📄 Download original PDF
          </a>

          {/* Results count */}
          {searchQuery.trim() && (
            <p className="text-xs text-muted-foreground mb-3">
              {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} found
            </p>
          )}

          {/* Sections */}
          <div className="space-y-3">
            {filteredSections.map((section) => {
              const isOpen = expandedSections.has(section.originalIndex);
              return (
                <div
                  key={section.originalIndex}
                  className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in"
                >
                  <button
                    onClick={() => toggleSection(section.originalIndex)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-bold text-foreground text-sm">
                      {searchQuery ? highlightText(section.title) : section.title}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-muted-foreground shrink-0" />
                    )}
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4">
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
                          {searchQuery ? highlightText(section.content) : section.content}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No results found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default MegaPromptPage;
