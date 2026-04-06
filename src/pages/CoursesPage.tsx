import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { ArrowRight, ChevronLeft, Bookmark, BookmarkCheck, CheckCircle2, Users, Clock, Award, Filter } from "lucide-react";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", color: "from-violet-600 to-purple-800", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50,topic:"Perceive-Reason-Act-Learn loop, ReAct pattern"},
    {id:"f2",t:"LLMs as the Brain",xp:50,topic:"GPT-4o, Claude, Gemini as reasoning engines"},
    {id:"f3",t:"Tools & Functions",xp:60,topic:"Function calling, how LLM decides when/what to call"},
    {id:"f4",t:"Memory & RAG",xp:60,topic:"Short-term, long-term (vector DBs), RAG"},
    {id:"f5",t:"Planning & Reasoning",xp:70,topic:"Chain-of-Thought, Tree-of-Thought, ReAct"},
    {id:"f6",t:"Build: Research Agent",xp:100,topic:"Python agent: search, summarize, write briefing"},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", color: "from-orange-500 to-amber-700", lessons:[
    {id:"w1",t:"LangGraph",xp:70,topic:"Directed graphs, checkpointing, LangSmith"},
    {id:"w2",t:"CrewAI",xp:60,topic:"Role+Backstory+Goal, Crews & Flows"},
    {id:"w3",t:"AutoGen & SDKs",xp:70,topic:"AutoGen debate, OpenAI SDK, Google ADK"},
    {id:"w4",t:"MCP Protocol",xp:80,topic:"USB-C of AI, 12K+ servers"},
    {id:"w5",t:"MetaGPT & More",xp:60,topic:"MetaGPT SOPs, OpenAgents MCP+A2A"},
    {id:"w6",t:"Build: FW Battle",xp:120,topic:"Same agent in 3 frameworks"},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", color: "from-slate-600 to-slate-800", lessons:[
    {id:"m1",t:"Communication",xp:70,topic:"Shared State, Message Passing, Pub/Sub"},
    {id:"m2",t:"AI Organization",xp:80,topic:"CEO, CMO, CTO, CFO as agents"},
    {id:"m3",t:"Orchestration",xp:80,topic:"Sequential, Parallel, Consensus"},
    {id:"m4",t:"Cost & Safety",xp:70,topic:"Tiered models, circuit breakers, guardrails"},
    {id:"m5",t:"Build: AI Startup",xp:150,topic:"6-agent startup team"},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", color: "from-purple-700 to-indigo-900", lessons:[
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
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const bookmarks: string[] = JSON.parse(localStorage.getItem("adojo_bookmarks") || "[]");

  const toggleBookmark = (lid: string) => {
    const bm = bookmarks.includes(lid) ? bookmarks.filter(x => x !== lid) : [...bookmarks, lid];
    localStorage.setItem("adojo_bookmarks", JSON.stringify(bm));
    window.location.reload();
  };

  const subjects = MODULES.map(m => m.title);
  let filtered = selectedModule ? MODULES.filter(m => m.title === selectedModule) : MODULES;
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const totalXP = MODULES.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.xp, 0), 0);

  // Get all bookmarked lessons
  const bookmarkedLessons = MODULES.flatMap(m => m.lessons.filter(l => bookmarks.includes(l.id)).map(l => ({ ...l, moduleTitle: m.title, moduleIcon: m.icon })));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative">
        <FloatingShapes />
        <div className="max-w-md mx-auto px-4 pt-5 relative z-10">
          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center gap-3 mb-4">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/")} className="w-9 h-9 rounded-xl glass flex items-center justify-center border border-border/50">
                <ChevronLeft size={16} className="text-foreground" />
              </motion.button>
              <div className="flex-1">
                <h2 className="text-base font-display font-bold text-foreground">Courses</h2>
                <p className="text-[9px] text-muted-foreground">{done.length}/{totalLessons} completed</p>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBookmarked(!showBookmarked)}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 border transition-all ${showBookmarked ? "bg-secondary/15 border-secondary/30" : "bg-card border-border/50"}`}
                >
                  <Bookmark size={10} className={showBookmarked ? "text-secondary" : "text-muted-foreground"} />
                  <span className={`text-[10px] font-bold ${showBookmarked ? "text-secondary" : "text-muted-foreground"}`}>{bookmarks.length}</span>
                </motion.button>
                <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-2 py-1">
                  <Award size={10} className="text-primary" />
                  <span className="text-[10px] font-bold text-primary">{totalXP} XP</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Hero */}
          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-4 mb-4 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(24 90% 48%), hsl(24 80% 38%))" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/50 tracking-widest mb-0.5">AI AGENTS</p>
                  <h3 className="text-lg font-display font-bold text-white leading-tight">Mastery Path</h3>
                  <p className="text-[10px] text-white/50 mt-1">From zero to autonomous AI builder</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
                    <Users size={9} className="text-white/70" />
                    <span className="text-[9px] font-semibold text-white/80">2.4K learners</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                    <Clock size={9} className="text-white/60" />
                    <span className="text-[9px] font-semibold text-white/70">~8 hrs</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(done.length / totalLessons * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
                <span className="text-[10px] text-white/60 font-semibold">{Math.round(done.length / totalLessons * 100)}%</span>
              </div>
              <div className="absolute -bottom-4 -right-4 text-5xl opacity-10">🎓</div>
            </div>
          </FadeIn>

          {/* Bookmarked Section */}
          <AnimatePresence>
            {showBookmarked && bookmarkedLessons.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-card rounded-xl p-3 border border-secondary/20 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark size={12} className="text-secondary" />
                    <h4 className="text-xs font-bold text-foreground">Bookmarked</h4>
                  </div>
                  <div className="space-y-1.5">
                    {bookmarkedLessons.map((l) => (
                      <button key={l.id} onClick={() => navigate(`/course/${l.id}`)}
                        className="w-full flex items-center gap-2 bg-background/50 rounded-lg p-2 border border-border/30 text-left hover:border-secondary/30 transition-all">
                        <span className="text-base">{l.moduleIcon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground truncate">{l.t}</p>
                          <p className="text-[8px] text-muted-foreground">{l.moduleTitle}</p>
                        </div>
                        <span className="text-[8px] text-primary font-bold">{l.xp}XP</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter chips */}
          <FadeIn delay={0.15}>
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedModule(null)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap border transition-all ${!selectedModule ? "bg-primary/15 border-primary/30 text-primary" : "bg-card border-border/50 text-muted-foreground"}`}>
                All
              </motion.button>
              {subjects.map(s => (
                <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setSelectedModule(s === selectedModule ? null : s)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap border transition-all ${s === selectedModule ? "bg-primary/15 border-primary/30 text-primary" : "bg-card border-border/50 text-muted-foreground"}`}>
                  {s}
                </motion.button>
              ))}
            </div>
          </FadeIn>

          {/* Module cards */}
          <StaggerContainer className="space-y-3">
            {filtered.map((mod) => {
              const mDone = mod.lessons.filter(l => done.includes(l.id)).length;
              const mPct = Math.round(mDone / mod.lessons.length * 100);
              const isExpanded = expandedModule === mod.id;

              return (
                <StaggerItem key={mod.id}>
                  <div className="rounded-2xl overflow-hidden border border-white/5 shadow-card">
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                      className={`w-full p-3.5 relative overflow-hidden text-left bg-gradient-to-r ${mod.color}`}
                    >
                      {mPct === 100 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={10} /> Done
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{mod.icon}</span>
                        <div>
                          <p className="text-[9px] font-bold text-white/40 tracking-widest">{mod.sub}</p>
                          <h3 className="text-sm font-display font-bold text-white">{mod.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/50 font-medium">{mDone}/{mod.lessons.length} lessons</span>
                        <span className="text-[10px] text-white/50 font-medium">{mod.lessons.reduce((a,l) => a + l.xp, 0)} XP</span>
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white/40 rounded-full transition-all" style={{ width: `${mPct}%` }} />
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ArrowRight size={12} className="text-white/50" />
                        </motion.div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-card p-2 space-y-1.5">
                            {mod.lessons.map((l, li) => {
                              const isDone = done.includes(l.id);
                              const isBM = bookmarks.includes(l.id);
                              return (
                                <motion.div
                                  key={l.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: li * 0.05 }}
                                  className="flex items-center gap-2 bg-background/50 rounded-xl p-2.5 border border-border/30"
                                >
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${isDone ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                                    {isDone ? "✓" : (li + 1)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[11px] font-semibold truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.t}</p>
                                    <p className="text-[9px] text-muted-foreground truncate">{l.topic}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[8px] text-primary font-bold">{l.xp}XP</span>
                                    <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); toggleBookmark(l.id); }} className="p-0.5">
                                      {isBM ? <BookmarkCheck size={12} className="text-primary" /> : <Bookmark size={12} className="text-muted-foreground/40" />}
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(`/course/${l.id}`)} className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                                      <ArrowRight size={10} className="text-primary" />
                                    </motion.button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default CoursesPage;
