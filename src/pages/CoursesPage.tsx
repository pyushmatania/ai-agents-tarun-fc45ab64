import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { ArrowRight, ChevronLeft, Bookmark, BookmarkCheck, CheckCircle2 } from "lucide-react";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50,topic:"Perceive-Reason-Act-Learn loop, ReAct pattern"},
    {id:"f2",t:"LLMs as the Brain",xp:50,topic:"GPT-4o, Claude, Gemini as reasoning engines"},
    {id:"f3",t:"Tools & Functions",xp:60,topic:"Function calling, how LLM decides when/what to call"},
    {id:"f4",t:"Memory & RAG",xp:60,topic:"Short-term, long-term (vector DBs), RAG"},
    {id:"f5",t:"Planning & Reasoning",xp:70,topic:"Chain-of-Thought, Tree-of-Thought, ReAct"},
    {id:"f6",t:"Build: Research Agent",xp:100,topic:"Python agent: search, summarize, write briefing"},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", lessons:[
    {id:"w1",t:"LangGraph",xp:70,topic:"Directed graphs, checkpointing, LangSmith"},
    {id:"w2",t:"CrewAI",xp:60,topic:"Role+Backstory+Goal, Crews & Flows"},
    {id:"w3",t:"AutoGen & SDKs",xp:70,topic:"AutoGen debate, OpenAI SDK, Google ADK"},
    {id:"w4",t:"MCP Protocol",xp:80,topic:"USB-C of AI, 12K+ servers"},
    {id:"w5",t:"MetaGPT & More",xp:60,topic:"MetaGPT SOPs, OpenAgents MCP+A2A"},
    {id:"w6",t:"Build: FW Battle",xp:120,topic:"Same agent in 3 frameworks"},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", lessons:[
    {id:"m1",t:"Communication",xp:70,topic:"Shared State, Message Passing, Pub/Sub"},
    {id:"m2",t:"AI Organization",xp:80,topic:"CEO, CMO, CTO, CFO as agents"},
    {id:"m3",t:"Orchestration",xp:80,topic:"Sequential, Parallel, Consensus"},
    {id:"m4",t:"Cost & Safety",xp:70,topic:"Tiered models, circuit breakers, guardrails"},
    {id:"m5",t:"Build: AI Startup",xp:150,topic:"6-agent startup team"},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70,topic:"Agentforce, Copilot, Gartner 40%"},
    {id:"r2",t:"Semiconductor AI",xp:90,topic:"HCL-Foxconn OSAT yield agents"},
    {id:"r3",t:"Solo Stack",xp:80,topic:"1 person + 10 agents = company"},
    {id:"r4",t:"Crazy Mode",xp:100,topic:"Swarms, self-improving, digital twins"},
    {id:"r5",t:"Final Boss",xp:200,topic:"10+ agent autonomous company"},
  ]}
];

const gradients = [
  "linear-gradient(135deg, hsl(258 60% 45%), hsl(258 50% 35%))",
  "linear-gradient(135deg, hsl(24 90% 50%), hsl(24 80% 40%))",
  "linear-gradient(135deg, hsl(228 20% 18%), hsl(228 20% 12%))",
  "linear-gradient(135deg, hsl(258 40% 25%), hsl(258 35% 18%))",
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

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-5">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl glass flex items-center justify-center border border-border/50">
            <ChevronLeft size={16} className="text-foreground" />
          </button>
          <h2 className="text-base font-display font-bold text-foreground">Courses</h2>
        </div>

        {/* Compact hero */}
        <div className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(24 90% 48%), hsl(24 80% 38%))" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/50 tracking-widest mb-0.5">AI AGENTS</p>
              <h3 className="text-lg font-display font-bold text-white leading-tight">Mastery Path</h3>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/15 rounded-lg px-2 py-1 text-[10px] font-semibold text-white">{MODULES.length} Modules</div>
              <div className="bg-white/10 rounded-lg px-2 py-1 text-[10px] font-semibold text-white/80">{totalLessons} Lessons</div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 text-4xl opacity-15">🎓</div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => setSelectedModule(null)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap border transition-all ${!selectedModule ? "bg-primary/15 border-primary/30 text-primary" : "bg-card border-border/50 text-muted-foreground"}`}>
            All
          </button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSelectedModule(s === selectedModule ? null : s)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap border transition-all ${s === selectedModule ? "bg-primary/15 border-primary/30 text-primary" : "bg-card border-border/50 text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Module cards */}
        <div className="space-y-3">
          {filtered.map((mod, index) => {
            const mDone = mod.lessons.filter(l => done.includes(l.id)).length;
            const mPct = Math.round(mDone / mod.lessons.length * 100);

            return (
              <div key={mod.id} className="rounded-2xl p-3.5 relative overflow-hidden border border-white/5"
                style={{ background: gradients[index % gradients.length] }}>
                {mPct === 100 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={10} /> Done
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{mod.icon}</span>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 tracking-widest">{mod.sub}</p>
                    <h3 className="text-sm font-display font-bold text-white">{mod.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[10px] text-white/50 font-medium">{mDone}/{mod.lessons.length} lessons</span>
                  <span className="text-[10px] text-white/50 font-medium">{mod.lessons.reduce((a,l) => a + l.xp, 0)} XP</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 rounded-full transition-all" style={{ width: `${mPct}%` }} />
                  </div>
                </div>

                {/* Lessons list */}
                <div className="space-y-1.5">
                  {mod.lessons.map((l, li) => {
                    const isDone = done.includes(l.id);
                    const isBM = bookmarks.includes(l.id);
                    return (
                      <div key={l.id} className="flex items-center gap-2 bg-card/90 rounded-xl p-2 backdrop-blur-sm border border-border/30">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${isDone ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          {isDone ? "✓" : (li + 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-semibold truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.t}</p>
                          <p className="text-[9px] text-muted-foreground">{l.xp} XP</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(l.id); }} className="shrink-0 p-0.5">
                          {isBM ? <BookmarkCheck size={12} className="text-primary" /> : <Bookmark size={12} className="text-muted-foreground/50" />}
                        </button>
                        <button onClick={() => navigate(`/course/${l.id}`)} className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors">
                          <ArrowRight size={10} className="text-foreground" />
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
