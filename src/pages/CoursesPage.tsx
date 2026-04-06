import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { CheckCircle2, Lock, Star, Crown, Diamond, Heart, Flame } from "lucide-react";
import { motion } from "framer-motion";
import Agni from "@/components/Agni";
import type { AgniExpression } from "@/components/Agni";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", color: "bg-agni-green", shadowColor: "shadow-glow-green", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50},
    {id:"f2",t:"LLMs as the Brain",xp:50},
    {id:"f3",t:"Tools & Functions",xp:60},
    {id:"f4",t:"Memory & RAG",xp:60},
    {id:"f5",t:"Planning & Reasoning",xp:70},
    {id:"f6",t:"Build: Research Agent",xp:100,checkpoint:true},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", color: "bg-agni-orange", shadowColor: "shadow-glow-gold", lessons:[
    {id:"w1",t:"LangGraph",xp:70},
    {id:"w2",t:"CrewAI",xp:60},
    {id:"w3",t:"AutoGen & SDKs",xp:70},
    {id:"w4",t:"MCP Protocol",xp:80},
    {id:"w5",t:"MetaGPT & More",xp:60},
    {id:"w6",t:"Build: FW Battle",xp:120,checkpoint:true},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", color: "bg-agni-blue", shadowColor: "shadow-glow-green", lessons:[
    {id:"m1",t:"Communication",xp:70},
    {id:"m2",t:"AI Organization",xp:80},
    {id:"m3",t:"Orchestration",xp:80},
    {id:"m4",t:"Cost & Safety",xp:70},
    {id:"m5",t:"Build: AI Startup",xp:150,checkpoint:true},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", color: "bg-agni-purple", shadowColor: "shadow-glow-purple", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70},
    {id:"r2",t:"Semiconductor AI",xp:90},
    {id:"r3",t:"Solo Stack",xp:80},
    {id:"r4",t:"Crazy Mode",xp:100},
    {id:"r5",t:"Final Boss",xp:200,checkpoint:true},
  ]}
];

// S-curve winding positions
const getNodePosition = (index: number, total: number): string => {
  const positions = ["ml-6", "ml-auto mr-6", "mx-auto", "ml-auto mr-10", "ml-10", "mx-auto"];
  return positions[index % positions.length];
};

const CoursesPage = () => {
  const navigate = useNavigate();
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const [activeModule, setActiveModule] = useState(0);

  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const mod = MODULES[activeModule];
  const modDone = mod.lessons.filter(l => done.includes(l.id)).length;

  const agniExpression: AgniExpression = modDone === mod.lessons.length ? "celebrating" : modDone > 0 ? "happy" : "default";
  const agniSpeech = modDone === mod.lessons.length ? "Module done! 🎉" : modDone === 0 ? "Let's begin!" : `${modDone}/${mod.lessons.length} done!`;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative">
        <div className="max-w-md mx-auto relative z-10">
          
          {/* Header with stats */}
          <FadeIn>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-agni-orange/15 rounded-full px-2 py-1">
                  <Flame size={12} className="text-agni-orange" />
                  <span className="text-[10px] font-black text-agni-orange">{Math.min(done.length, 7)}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-1">
                  <Diamond size={12} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{xp * 2}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-1">
                  <Heart size={12} className="text-agni-pink fill-agni-pink" />
                  <span className="text-[10px] font-black text-agni-pink">5</span>
                </div>
                <span className="text-muted-foreground text-[10px] font-bold">{done.length}/{totalLessons}</span>
              </div>
            </div>
          </FadeIn>

          {/* Module banner */}
          <FadeIn>
            <div className={`mx-4 ${mod.color} rounded-3xl p-4 shadow-lg mb-2`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{mod.icon}</span>
                <div className="flex-1">
                  <p className="text-white/50 text-micro font-black tracking-widest">{mod.sub}</p>
                  <h3 className="text-white font-black text-lg">{mod.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-lg">{modDone}/{mod.lessons.length}</p>
                  <p className="text-white/40 text-micro">LESSONS</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-white/15 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(modDone / mod.lessons.length) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>

              {/* Module tabs */}
              <div className="flex gap-1.5 mt-3">
                {MODULES.map((m, i) => {
                  const mDone = m.lessons.filter(l => done.includes(l.id)).length;
                  const mPct = Math.round(mDone / m.lessons.length * 100);
                  return (
                    <motion.button
                      key={m.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveModule(i)}
                      className={`flex-1 rounded-xl py-2 text-center transition-all ${
                        i === activeModule ? "bg-white/25" : "bg-white/8 hover:bg-white/12"
                      }`}
                    >
                      <span className="text-lg block">{m.icon}</span>
                      <div className="w-full px-2 mt-1">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${mPct}%` }} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* AGNI */}
          <FadeIn delay={0.2}>
            <div className="flex justify-center my-2">
              <Agni expression={agniExpression} size={80} speech={agniSpeech} />
            </div>
          </FadeIn>

          {/* Winding lesson path */}
          <div className="px-4 relative">
            <div className="space-y-2 py-2">
              {mod.lessons.map((lesson, i) => {
                const isDone = done.includes(lesson.id);
                const isNext = !isDone && (i === 0 || done.includes(mod.lessons[i - 1].id));
                const isLocked = !isDone && !isNext;
                const isCheckpoint = (lesson as any).checkpoint;
                const position = getNodePosition(i, mod.lessons.length);

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
                    className={`flex flex-col items-center w-fit ${position}`}
                  >
                    {/* Connector */}
                    {i > 0 && (
                      <div className={`w-0.5 h-4 -mt-2 mb-1 ${isDone || isNext ? "bg-agni-green/30" : "bg-border/20"}`} />
                    )}

                    {/* Node button */}
                    <motion.button
                      whileHover={!isLocked ? { scale: 1.1 } : {}}
                      whileTap={!isLocked ? { scale: 0.9, y: 3 } : {}}
                      onClick={() => !isLocked && navigate(`/course/${lesson.id}`)}
                      disabled={isLocked}
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isCheckpoint
                          ? isDone
                            ? "bg-agni-gold shadow-glow-gold"
                            : isNext
                              ? "bg-agni-gold/80 shadow-glow-gold"
                              : "bg-muted/40"
                          : isDone
                            ? `${mod.color} shadow-lg`
                            : isNext
                              ? `${mod.color} opacity-90 shadow-lg`
                              : "bg-muted/40"
                      }`}
                      style={{
                        boxShadow: isDone || isNext
                          ? `0 4px 0 0 ${isDone ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)'}`
                          : 'none'
                      }}
                    >
                      {/* Icon */}
                      {isDone ? (
                        <CheckCircle2 size={24} className="text-white relative z-10" />
                      ) : isCheckpoint ? (
                        <Crown size={24} className={`${isLocked ? "text-muted-foreground/40" : "text-white"} relative z-10`} />
                      ) : isNext ? (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="relative z-10"
                        >
                          <Star size={24} className="text-white" />
                        </motion.div>
                      ) : (
                        <Lock size={20} className="text-muted-foreground/40 relative z-10" />
                      )}

                      {/* Pulse ring */}
                      {isNext && (
                        <motion.div
                          className={`absolute inset-0 rounded-full ${mod.color} opacity-30`}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {/* Stars for completed */}
                      {isDone && (
                        <div className="absolute -bottom-1 flex gap-0.5">
                          {[0,1,2].map(s => (
                            <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + s * 0.1 }}>
                              <Star size={8} className="text-agni-gold fill-agni-gold" />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.button>

                    {/* Label */}
                    <p className={`text-[10px] font-extrabold mt-1.5 text-center max-w-[100px] leading-tight ${
                      isDone ? "text-foreground" : isNext ? "text-foreground" : "text-muted-foreground/40"
                    }`}>
                      {lesson.t}
                    </p>
                    <span className={`text-[8px] font-black ${isDone ? "text-agni-green" : "text-muted-foreground/30"}`}>
                      {lesson.xp} XP
                    </span>

                    {/* Treasure chest */}
                    {i === 2 && !isLocked && (
                      <motion.div
                        className="mt-2 w-10 h-10 rounded-xl bg-gradient-to-b from-agni-gold to-agni-gold-dark flex items-center justify-center shadow-md"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-lg">🎁</span>
                      </motion.div>
                    )}

                    {/* AGNI mid-path */}
                    {i === Math.floor(mod.lessons.length / 2) && (
                      <motion.div
                        className="mt-3"
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Agni expression="thinking" size={50} speech="Keep going! 💪" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Module complete */}
            {modDone === mod.lessons.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <Agni expression="celebrating" size={100} />
                <p className="text-foreground font-black text-sm mt-2">Module Complete! 🏆</p>
                <p className="text-muted-foreground text-[10px] font-semibold">You've mastered {mod.title}</p>
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