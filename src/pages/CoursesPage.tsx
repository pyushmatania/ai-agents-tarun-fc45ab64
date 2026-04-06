import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, ChevronLeft, Bookmark, BookmarkCheck } from "lucide-react";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", color:"hsl(var(--secondary))", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50,topic:"Perceive-Reason-Act-Learn loop, ReAct pattern, LLM+Tools+Memory+Planning"},
    {id:"f2",t:"LLMs as the Brain",xp:50,topic:"GPT-4o, Claude, Gemini, Llama as reasoning engines, context windows"},
    {id:"f3",t:"Tools & Functions",xp:60,topic:"Function calling, how LLM decides when/what to call"},
    {id:"f4",t:"Memory & RAG",xp:60,topic:"Short-term, long-term (vector DBs), episodic, RAG"},
    {id:"f5",t:"Planning & Reasoning",xp:70,topic:"Chain-of-Thought, Tree-of-Thought, ReAct"},
    {id:"f6",t:"Build: Research Agent",xp:100,topic:"Python agent: search, summarize, write briefing"},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", color:"hsl(var(--primary))", lessons:[
    {id:"w1",t:"LangGraph",xp:70,topic:"Directed graphs, checkpointing, LangSmith"},
    {id:"w2",t:"CrewAI",xp:60,topic:"Role+Backstory+Goal, Crews & Flows"},
    {id:"w3",t:"AutoGen & SDKs",xp:70,topic:"AutoGen debate, OpenAI SDK, Google ADK A2A"},
    {id:"w4",t:"MCP Protocol",xp:80,topic:"USB-C of AI, 12K+ servers"},
    {id:"w5",t:"MetaGPT & More",xp:60,topic:"MetaGPT SOPs, OpenAgents MCP+A2A"},
    {id:"w6",t:"Build: FW Battle",xp:120,topic:"Same agent in 3 frameworks"},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", color:"hsl(var(--foreground))", lessons:[
    {id:"m1",t:"Communication",xp:70,topic:"Shared State, Message Passing, Pub/Sub, Hierarchical"},
    {id:"m2",t:"AI Organization",xp:80,topic:"CEO, CMO, CTO, CFO, Sales, HR as agents"},
    {id:"m3",t:"Orchestration",xp:80,topic:"Sequential, Parallel, Consensus, Competitive"},
    {id:"m4",t:"Cost & Safety",xp:70,topic:"Tiered models, circuit breakers, guardrails"},
    {id:"m5",t:"Build: AI Startup",xp:150,topic:"6-agent startup team"},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", color:"hsl(var(--primary))", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70,topic:"Agentforce, Copilot, Gartner 40%"},
    {id:"r2",t:"Semiconductor AI",xp:90,topic:"HCL-Foxconn OSAT yield, supply chain agents"},
    {id:"r3",t:"Solo Stack",xp:80,topic:"1 person + 10 agents = company"},
    {id:"r4",t:"Crazy Mode",xp:100,topic:"Swarms, self-improving, Manus $2B, digital twins"},
    {id:"r5",t:"Final Boss",xp:200,topic:"10+ agent autonomous company"},
  ]}
];

const CoursesPage = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const bookmarks: string[] = JSON.parse(localStorage.getItem("adojo_bookmarks") || "[]");

  const toggleBookmark = (lid: string) => {
    const bm = bookmarks.includes(lid) ? bookmarks.filter(x => x !== lid) : [...bookmarks, lid];
    localStorage.setItem("adojo_bookmarks", JSON.stringify(bm));
    window.location.reload();
  };

  const subjects = MODULES.map(m => m.title);
  const filtered = selectedModule ? MODULES.filter(m => m.title === selectedModule) : MODULES;
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const enrolledCount = done.length;

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
        </div>

        {/* Hero */}
        <div className="bg-primary rounded-3xl p-6 mb-6 relative overflow-hidden">
          <h2 className="text-3xl font-extrabold text-primary-foreground leading-tight mb-4">AI Agents<br/>Mastery</h2>
          <div className="flex gap-3">
            <div className="bg-card rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-foreground">📊 {MODULES.length} Modules</div>
            <div className="bg-card/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground">📚 {totalLessons} Lessons</div>
          </div>
          <div className="absolute top-2 right-6 text-5xl opacity-70">🧠</div>
          <div className="absolute top-6 right-2 text-lg">⭐</div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          <button onClick={() => setSelectedModule(null)} className={`rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold whitespace-nowrap border ${!selectedModule ? "bg-foreground text-card border-foreground" : "bg-card text-foreground border-border"}`}>All</button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSelectedModule(s === selectedModule ? null : s)} className={`rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold whitespace-nowrap border ${s === selectedModule ? "bg-foreground text-card border-foreground" : "bg-card text-foreground border-border"}`}>{s}</button>
          ))}
        </div>

        {/* Module cards */}
        <div className="space-y-4">
          {filtered.map((mod, index) => {
            const isDark = index % 2 === 0;
            const mDone = mod.lessons.filter(l => done.includes(l.id)).length;
            const mPct = Math.round(mDone / mod.lessons.length * 100);

            return (
              <div key={mod.id} className={`${isDark ? "bg-edu-dark" : "bg-edu-lavender"} rounded-3xl p-5 relative overflow-hidden`}>
                {mPct === 100 && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">✅ Complete</div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{mod.icon}</span>
                </div>
                <p className={`text-xs font-bold ${isDark ? "text-card" : "text-foreground"} opacity-70 tracking-wider mb-1`}>{mod.sub}</p>
                <h3 className={`text-lg font-extrabold ${isDark ? "text-card" : "text-foreground"} mb-1 max-w-[220px]`}>{mod.title}</h3>
                <p className={`text-xs ${isDark ? "text-card/70" : "text-foreground/60"} mb-3`}>{mDone}/{mod.lessons.length} lessons · {mod.lessons.reduce((a,l) => a + l.xp, 0)} XP</p>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${mPct}%` }} />
                </div>

                {/* Lessons */}
                <div className="space-y-2">
                  {mod.lessons.map((l, li) => {
                    const isDone = done.includes(l.id);
                    const isBM = bookmarks.includes(l.id);
                    return (
                      <div key={l.id} className="flex items-center gap-3 bg-card/90 rounded-2xl p-3 border border-border/50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {isDone ? "✓" : (li + 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isDone ? "text-muted-foreground" : "text-foreground"}`}>{l.t}</p>
                          <p className="text-xs text-muted-foreground">{l.xp} XP</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(l.id); }} className="shrink-0">
                          {isBM ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} className="text-muted-foreground" />}
                        </button>
                        <button onClick={() => navigate(`/course/${l.id}`)} className="w-8 h-8 rounded-full bg-edu-dark flex items-center justify-center shrink-0">
                          <ArrowRight size={14} className="text-card" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default CoursesPage;
