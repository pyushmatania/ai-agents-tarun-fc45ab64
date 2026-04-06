import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, ChevronLeft, Bookmark, BookmarkCheck } from "lucide-react";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", gradient:"from-secondary to-accent", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50,topic:"Perceive-Reason-Act-Learn loop, ReAct pattern"},
    {id:"f2",t:"LLMs as the Brain",xp:50,topic:"GPT-4o, Claude, Gemini as reasoning engines"},
    {id:"f3",t:"Tools & Functions",xp:60,topic:"Function calling, how LLM decides when/what to call"},
    {id:"f4",t:"Memory & RAG",xp:60,topic:"Short-term, long-term (vector DBs), RAG"},
    {id:"f5",t:"Planning & Reasoning",xp:70,topic:"Chain-of-Thought, Tree-of-Thought, ReAct"},
    {id:"f6",t:"Build: Research Agent",xp:100,topic:"Python agent: search, summarize, write briefing"},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", gradient:"from-primary to-edu-orange-light", lessons:[
    {id:"w1",t:"LangGraph",xp:70,topic:"Directed graphs, checkpointing, LangSmith"},
    {id:"w2",t:"CrewAI",xp:60,topic:"Role+Backstory+Goal, Crews & Flows"},
    {id:"w3",t:"AutoGen & SDKs",xp:70,topic:"AutoGen debate, OpenAI SDK, Google ADK"},
    {id:"w4",t:"MCP Protocol",xp:80,topic:"USB-C of AI, 12K+ servers"},
    {id:"w5",t:"MetaGPT & More",xp:60,topic:"MetaGPT SOPs, OpenAgents MCP+A2A"},
    {id:"w6",t:"Build: FW Battle",xp:120,topic:"Same agent in 3 frameworks"},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", gradient:"from-edu-dark to-foreground", lessons:[
    {id:"m1",t:"Communication",xp:70,topic:"Shared State, Message Passing, Pub/Sub"},
    {id:"m2",t:"AI Organization",xp:80,topic:"CEO, CMO, CTO, CFO as agents"},
    {id:"m3",t:"Orchestration",xp:80,topic:"Sequential, Parallel, Consensus"},
    {id:"m4",t:"Cost & Safety",xp:70,topic:"Tiered models, circuit breakers, guardrails"},
    {id:"m5",t:"Build: AI Startup",xp:150,topic:"6-agent startup team"},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", gradient:"from-primary to-destructive", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70,topic:"Agentforce, Copilot, Gartner 40%"},
    {id:"r2",t:"Semiconductor AI",xp:90,topic:"HCL-Foxconn OSAT yield agents"},
    {id:"r3",t:"Solo Stack",xp:80,topic:"1 person + 10 agents = company"},
    {id:"r4",t:"Crazy Mode",xp:100,topic:"Swarms, self-improving, digital twins"},
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

  const bgStyles = [
    { bg: "linear-gradient(135deg, hsl(var(--secondary)), hsl(250 50% 58%))", text: "text-white" },
    { bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(28 90% 52%))", text: "text-white" },
    { bg: "hsl(var(--edu-dark))", text: "text-white" },
    { bg: "linear-gradient(135deg, hsl(var(--edu-lavender)), hsl(250 50% 85%))", text: "text-foreground" },
  ];

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border shadow-card">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
        </div>

        {/* Hero */}
        <div className="rounded-4xl p-6 mb-6 relative overflow-hidden shadow-elevated"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(28 85% 52%))" }}>
          <h2 className="text-3xl font-black text-white leading-tight mb-1">My<br/>courses</h2>
          <div className="flex gap-3 mt-4">
            <div className="bg-card rounded-full px-4 py-2 flex items-center gap-2 text-sm font-bold text-foreground shadow-card">📊 {MODULES.length} Modules</div>
            <div className="bg-white/20 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-bold text-white">📚 {totalLessons} Lessons</div>
          </div>
          <div className="absolute top-2 right-4 text-5xl opacity-30 animate-float">🎓</div>
          <div className="absolute top-8 right-2 text-lg opacity-40">⭐</div>
          <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/5" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => setSelectedModule(null)}
            className={`rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap border shadow-card transition-all ${!selectedModule ? "bg-foreground text-card border-foreground scale-105" : "bg-card text-foreground border-border"}`}>
            All
          </button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSelectedModule(s === selectedModule ? null : s)}
              className={`rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap border shadow-card transition-all ${s === selectedModule ? "bg-foreground text-card border-foreground scale-105" : "bg-card text-foreground border-border"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Module cards */}
        <div className="space-y-5">
          {filtered.map((mod, index) => {
            const style = bgStyles[index % bgStyles.length];
            const mDone = mod.lessons.filter(l => done.includes(l.id)).length;
            const mPct = Math.round(mDone / mod.lessons.length * 100);

            return (
              <div key={mod.id} className="rounded-4xl p-5 relative overflow-hidden shadow-elevated"
                style={{ background: style.bg }}>
                {mPct === 100 && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-card">✅ Complete</div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{mod.icon}</span>
                </div>
                <p className={`text-[10px] font-black ${style.text} opacity-60 tracking-[0.2em] mb-1`}>{mod.sub}</p>
                <h3 className={`text-xl font-black ${style.text} mb-1 max-w-[220px]`}>{mod.title}</h3>
                <p className={`text-xs ${style.text} opacity-60 mb-3 font-semibold`}>{mDone}/{mod.lessons.length} lessons · {mod.lessons.reduce((a,l) => a + l.xp, 0)} XP</p>

                {/* Progress bar */}
                <div className="h-2 bg-white/20 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${mPct}%` }} />
                </div>

                {/* Lessons */}
                <div className="space-y-2">
                  {mod.lessons.map((l, li) => {
                    const isDone = done.includes(l.id);
                    const isBM = bookmarks.includes(l.id);
                    return (
                      <div key={l.id} className="flex items-center gap-3 bg-card/95 rounded-2xl p-3 shadow-card backdrop-blur-sm">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${isDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {isDone ? "✓" : (li + 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.t}</p>
                          <p className="text-[11px] text-muted-foreground font-semibold">{l.xp} XP</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(l.id); }} className="shrink-0">
                          {isBM ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} className="text-muted-foreground" />}
                        </button>
                        <button onClick={() => navigate(`/course/${l.id}`)} className="w-8 h-8 rounded-full bg-edu-dark flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
                          <ArrowRight size={14} className="text-white" />
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
