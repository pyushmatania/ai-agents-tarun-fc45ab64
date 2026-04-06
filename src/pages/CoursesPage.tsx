import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { CheckCircle2, Lock, Star, Crown, Diamond, Heart, Flame, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";
import type { AgniExpression } from "@/components/Agni";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", color: "bg-agni-green", hex: "#58CC02", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50},
    {id:"f2",t:"LLMs as the Brain",xp:50},
    {id:"f3",t:"Tools & Functions",xp:60},
    {id:"f4",t:"Memory & RAG",xp:60},
    {id:"f5",t:"Planning & Reasoning",xp:70},
    {id:"f6",t:"Build: Research Agent",xp:100,checkpoint:true},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", color: "bg-agni-orange", hex: "#FF9600", lessons:[
    {id:"w1",t:"LangGraph",xp:70},
    {id:"w2",t:"CrewAI",xp:60},
    {id:"w3",t:"AutoGen & SDKs",xp:70},
    {id:"w4",t:"MCP Protocol",xp:80},
    {id:"w5",t:"MetaGPT & More",xp:60},
    {id:"w6",t:"Build: FW Battle",xp:120,checkpoint:true},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", color: "bg-agni-blue", hex: "#1CB0F6", lessons:[
    {id:"m1",t:"Communication",xp:70},
    {id:"m2",t:"AI Organization",xp:80},
    {id:"m3",t:"Orchestration",xp:80},
    {id:"m4",t:"Cost & Safety",xp:70},
    {id:"m5",t:"Build: AI Startup",xp:150,checkpoint:true},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", color: "bg-agni-purple", hex: "#CE82FF", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70},
    {id:"r2",t:"Semiconductor AI",xp:90},
    {id:"r3",t:"Solo Stack",xp:80},
    {id:"r4",t:"Crazy Mode",xp:100},
    {id:"r5",t:"Final Boss",xp:200,checkpoint:true},
  ]}
];

// True S-curve: alternates left → center → right → center → left
const getSCurveX = (index: number): number => {
  const pattern = [0, 40, 80, 120, 80, 40]; // pixel offsets from left
  return pattern[index % pattern.length];
};

const CoursesPage = () => {
  const navigate = useNavigate();
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const [activeModule, setActiveModule] = useState(0);

  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const mod = MODULES[activeModule];
  const modDone = mod.lessons.filter(l => done.includes(l.id)).length;
  const modPct = Math.round((modDone / mod.lessons.length) * 100);

  const agniExpr: AgniExpression = modDone === mod.lessons.length ? "celebrating" : modDone > 0 ? "happy" : "default";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        {/* Background decorative path line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[300px] h-[800px] opacity-[0.06]" viewBox="0 0 300 800">
            <path d="M150 0 Q50 100 150 200 Q250 300 150 400 Q50 500 150 600 Q250 700 150 800" fill="none" stroke="currentColor" strokeWidth="40" className="text-foreground" />
          </svg>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          
          {/* Top stats bar */}
          <FadeIn>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-orange/15 rounded-full px-2 py-1">
                  <Flame size={12} className="text-agni-orange" />
                  <span className="text-[10px] font-black text-agni-orange">{Math.min(done.length, 7)}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-1">
                  <Diamond size={12} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{xp * 2}</span>
                </div>
              </div>
              <h1 className="text-sm font-black text-foreground">Learn</h1>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-1">
                  <Heart size={12} className="text-agni-pink fill-agni-pink" />
                  <span className="text-[10px] font-black text-agni-pink">5</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Module selector tabs */}
          <FadeIn>
            <div className="px-4 mb-3">
              <div className="flex gap-1.5 bg-card rounded-2xl p-1.5 border border-border/30">
                {MODULES.map((m, i) => {
                  const mDone = m.lessons.filter(l => done.includes(l.id)).length;
                  const isActive = i === activeModule;
                  return (
                    <motion.button
                      key={m.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setActiveModule(i)}
                      className={`flex-1 rounded-xl py-2 text-center transition-all relative ${
                        isActive ? `${m.color} shadow-lg` : "hover:bg-muted/30"
                      }`}
                    >
                      <span className="text-base block">{m.icon}</span>
                      <span className={`text-[7px] font-black block mt-0.5 ${isActive ? "text-white" : "text-muted-foreground"}`}>
                        {mDone}/{m.lessons.length}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Module banner */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-4 ${mod.color} rounded-3xl p-4 shadow-lg mb-4 relative overflow-hidden`}
            >
              {/* Decorative circles */}
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute -right-2 bottom-0 w-14 h-14 rounded-full bg-white/5" />

              <div className="flex items-center gap-3 relative z-10">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {mod.icon}
                </motion.span>
                <div className="flex-1">
                  <p className="text-white/50 text-[8px] font-black tracking-[0.2em]">{mod.sub}</p>
                  <h3 className="text-white font-black text-lg leading-tight">{mod.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-xl">{modPct}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2.5 bg-white/15 rounded-full overflow-hidden relative z-10">
                <motion.div
                  className="h-full bg-white/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${modPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Winding S-curve path */}
          <div className="px-4 relative">
            {/* SVG connector path */}
            <svg className="absolute top-0 left-4 right-4 h-full pointer-events-none" style={{ width: "calc(100% - 32px)" }}>
              {mod.lessons.map((_, i) => {
                if (i === 0) return null;
                const x1 = getSCurveX(i - 1) + 32;
                const y1 = (i - 1) * 110 + 40;
                const x2 = getSCurveX(i) + 32;
                const y2 = i * 110 + 40;
                const midY = (y1 + y2) / 2;
                const isDone = done.includes(mod.lessons[i].id) || done.includes(mod.lessons[i - 1].id);
                return (
                  <path
                    key={i}
                    d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                    fill="none"
                    stroke={isDone ? mod.hex : "hsl(var(--muted))"}
                    strokeWidth="3"
                    strokeDasharray={isDone ? "none" : "6 6"}
                    opacity={isDone ? 0.5 : 0.15}
                  />
                );
              })}
            </svg>

            <div className="relative" style={{ paddingBottom: 20 }}>
              {mod.lessons.map((lesson, i) => {
                const isDone = done.includes(lesson.id);
                const prevDone = i === 0 || done.includes(mod.lessons[i - 1].id);
                const isNext = !isDone && prevDone;
                const isLocked = !isDone && !isNext;
                const isCheckpoint = (lesson as any).checkpoint;
                const xOffset = getSCurveX(i);
                const showTreasure = i === 2 && (isDone || isNext);
                const showAgniPeek = i === Math.floor(mod.lessons.length / 2);

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, scale: 0.5, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 180 }}
                    className="relative"
                    style={{ height: 110, paddingLeft: xOffset }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Node */}
                      <motion.button
                        whileHover={!isLocked ? { scale: 1.12 } : {}}
                        whileTap={!isLocked ? { scale: 0.88, y: 4 } : {}}
                        onClick={() => !isLocked && navigate(`/course/${lesson.id}`)}
                        disabled={isLocked}
                        className="relative flex-shrink-0"
                      >
                        {/* Outer ring */}
                        <div className={`w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all ${
                          isCheckpoint
                            ? isDone ? "bg-agni-gold" : isNext ? "bg-agni-gold/80" : "bg-muted/30"
                            : isDone ? mod.color : isNext ? mod.color : "bg-muted/30"
                        }`}
                          style={{
                            boxShadow: (isDone || isNext)
                              ? `0 6px 0 0 rgba(0,0,0,0.25), 0 0 20px ${mod.hex}30`
                              : '0 3px 0 0 rgba(0,0,0,0.15)'
                          }}
                        >
                          {/* Inner circle */}
                          <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center ${
                            isDone || isNext ? "bg-white/15" : "bg-muted/20"
                          }`}>
                            {isDone ? (
                              <CheckCircle2 size={26} className="text-white" />
                            ) : isCheckpoint ? (
                              <Crown size={26} className={isLocked ? "text-muted-foreground/30" : "text-white"} />
                            ) : isNext ? (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Star size={26} className="text-white" />
                              </motion.div>
                            ) : (
                              <Lock size={22} className="text-muted-foreground/30" />
                            )}
                          </div>
                        </div>

                        {/* Pulse ring for active */}
                        {isNext && (
                          <motion.div
                            className={`absolute inset-[-4px] rounded-full border-2`}
                            style={{ borderColor: mod.hex }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}

                        {/* Completion stars */}
                        {isDone && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {[0,1,2].map(s => (
                              <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + s * 0.1, type: "spring" }}>
                                <Star size={8} className="text-agni-gold fill-agni-gold" />
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.button>

                      {/* Label card */}
                      <div className="pt-2 flex-1 min-w-0">
                        <p className={`text-[11px] font-black leading-tight ${
                          isLocked ? "text-muted-foreground/30" : "text-foreground"
                        }`}>
                          {lesson.t}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-black ${isDone ? "text-agni-green" : "text-muted-foreground/40"}`}>
                            +{lesson.xp} XP
                          </span>
                          {isCheckpoint && (
                            <span className="text-[8px] font-black text-agni-gold bg-agni-gold/15 px-1.5 py-0.5 rounded-full">
                              BOSS
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[8px] font-black text-agni-green bg-agni-green/15 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 size={8} /> DONE
                            </span>
                          )}
                          {isNext && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/course/${lesson.id}`)}
                              className={`text-[8px] font-black text-white ${mod.color} px-2 py-0.5 rounded-full flex items-center gap-0.5`}
                            >
                              START <ChevronRight size={8} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Treasure chest between nodes */}
                    {showTreasure && (
                      <motion.div
                        className="absolute -right-2 top-1/2 -translate-y-1/2"
                        animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-agni-gold to-amber-600 flex items-center justify-center shadow-lg">
                          <span className="text-lg">🎁</span>
                        </div>
                      </motion.div>
                    )}

                    {/* AGNI peeking mid-path */}
                    {showAgniPeek && (
                      <motion.div
                        className="absolute -right-3 -bottom-2"
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <Agni expression="thinking" size={45} speech="Keep going! 💪" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Module complete celebration */}
            {modDone === mod.lessons.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
                className="text-center py-6"
              >
                <Agni expression="celebrating" size={100} speech="You're amazing! 🎉" />
                <p className="text-foreground font-black text-sm mt-3">Module Complete! 🏆</p>
                <p className="text-muted-foreground text-[10px] font-semibold">You've mastered {mod.title}</p>
                {activeModule < MODULES.length - 1 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveModule(activeModule + 1)}
                    className="mt-3 bg-agni-green text-white font-black text-xs px-6 py-2.5 rounded-full shadow-btn-3d"
                  >
                    Next Module →
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default CoursesPage;
