import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { CheckCircle2, Lock, Star, Crown, Gift } from "lucide-react";
import FloatingShapes from "@/components/illustrations/FloatingShapes";
import { motion, AnimatePresence } from "framer-motion";
import MascotRobot from "@/components/MascotRobot";

const MODULES = [
  { id:"found", title:"Foundations", sub:"START HERE", icon:"🧬", color: "bg-violet-500", darkColor: "bg-violet-600", lightColor: "bg-violet-400", lessons:[
    {id:"f1",t:"What is an AI Agent?",xp:50},
    {id:"f2",t:"LLMs as the Brain",xp:50},
    {id:"f3",t:"Tools & Functions",xp:60},
    {id:"f4",t:"Memory & RAG",xp:60},
    {id:"f5",t:"Planning & Reasoning",xp:70},
    {id:"f6",t:"Build: Research Agent",xp:100,checkpoint:true},
  ]},
  { id:"frame", title:"Frameworks", sub:"PICK YOUR WEAPON", icon:"⚔️", color: "bg-orange-500", darkColor: "bg-orange-600", lightColor: "bg-orange-400", lessons:[
    {id:"w1",t:"LangGraph",xp:70},
    {id:"w2",t:"CrewAI",xp:60},
    {id:"w3",t:"AutoGen & SDKs",xp:70},
    {id:"w4",t:"MCP Protocol",xp:80},
    {id:"w5",t:"MetaGPT & More",xp:60},
    {id:"w6",t:"Build: FW Battle",xp:120,checkpoint:true},
  ]},
  { id:"multi", title:"Multi-Agent", sub:"BUILD YOUR AI ORG", icon:"🏢", color: "bg-sky-500", darkColor: "bg-sky-600", lightColor: "bg-sky-400", lessons:[
    {id:"m1",t:"Communication",xp:70},
    {id:"m2",t:"AI Organization",xp:80},
    {id:"m3",t:"Orchestration",xp:80},
    {id:"m4",t:"Cost & Safety",xp:70},
    {id:"m5",t:"Build: AI Startup",xp:150,checkpoint:true},
  ]},
  { id:"real", title:"Real World", sub:"SHIP IT", icon:"🚀", color: "bg-emerald-500", darkColor: "bg-emerald-600", lightColor: "bg-emerald-400", lessons:[
    {id:"r1",t:"Enterprise 2026",xp:70},
    {id:"r2",t:"Semiconductor AI",xp:90},
    {id:"r3",t:"Solo Stack",xp:80},
    {id:"r4",t:"Crazy Mode",xp:100},
    {id:"r5",t:"Final Boss",xp:200,checkpoint:true},
  ]}
];

// Duolingo-style winding path positions (alternating left-center-right)
const getNodePosition = (index: number): string => {
  const positions = ["ml-4", "ml-auto mr-4", "mx-auto", "ml-auto mr-12", "ml-12", "mx-auto"];
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

  // Find first incomplete lesson globally
  const allLessons = MODULES.flatMap(m => m.lessons);
  const firstIncomplete = allLessons.find(l => !done.includes(l.id));

  // Mascot mood
  const mascotMood = modDone === mod.lessons.length ? "celebrating" : modDone > 0 ? "happy" : "waving";
  const mascotSpeech = modDone === mod.lessons.length ? "Module complete! 🎉" : modDone === 0 ? "Let's start!" : `${modDone}/${mod.lessons.length} done!`;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative">
        <FloatingShapes />
        <div className="max-w-md mx-auto relative z-10">
          
          {/* Module selector - Duolingo style header */}
          <FadeIn>
            <div className={`${mod.color} px-4 pt-6 pb-4 rounded-b-3xl shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star size={12} className="text-yellow-300" />
                    <span className="text-white text-xs font-bold">{xp} XP</span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-2 py-1 flex items-center gap-1">
                    <Crown size={12} className="text-yellow-300" />
                    <span className="text-white text-xs font-bold">Lv {Math.floor(xp / 100) + 1}</span>
                  </div>
                </div>
                <span className="text-white/60 text-[10px] font-semibold">{done.length}/{totalLessons} TOTAL</span>
              </div>

              {/* Section title */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
                <span className="text-2xl">{mod.icon}</span>
                <div className="flex-1">
                  <p className="text-white/60 text-[9px] font-bold tracking-widest">{mod.sub}</p>
                  <h3 className="text-white font-bold text-base">{mod.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">{modDone}/{mod.lessons.length}</p>
                  <p className="text-white/50 text-[9px]">lessons</p>
                </div>
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
                        i === activeModule ? "bg-white/25 shadow-sm" : "bg-white/8 hover:bg-white/12"
                      }`}
                    >
                      <span className="text-lg block">{m.icon}</span>
                      <div className="w-full px-2 mt-1">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${mPct}%` }} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Mascot */}
          <FadeIn delay={0.2}>
            <div className="flex justify-center -mt-2 mb-2">
              <MascotRobot size={80} mood={mascotMood} speech={mascotSpeech} />
            </div>
          </FadeIn>

          {/* Duolingo-style winding lesson path */}
          <div className="px-4 relative">
            {/* Winding path SVG connector */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            <div className="space-y-3 py-4">
              {mod.lessons.map((lesson, i) => {
                const isDone = done.includes(lesson.id);
                const isNext = !isDone && (i === 0 || done.includes(mod.lessons[i - 1].id));
                const isLocked = !isDone && !isNext;
                const isCheckpoint = (lesson as any).checkpoint;
                const position = getNodePosition(i);

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
                    className={`flex flex-col items-center w-fit ${position}`}
                  >
                    {/* Connector dot */}
                    {i > 0 && (
                      <div className="w-0.5 h-3 bg-border/30 -mt-3 mb-1" />
                    )}

                    {/* Node */}
                    <motion.button
                      whileHover={!isLocked ? { scale: 1.1 } : {}}
                      whileTap={!isLocked ? { scale: 0.9 } : {}}
                      onClick={() => !isLocked && navigate(`/course/${lesson.id}`)}
                      disabled={isLocked}
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isCheckpoint
                          ? isDone
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_4px_20px_rgba(251,191,36,0.4)]"
                            : isNext
                              ? "bg-gradient-to-br from-yellow-400/80 to-amber-500/80 shadow-[0_4px_20px_rgba(251,191,36,0.3)]"
                              : "bg-muted/40"
                          : isDone
                            ? `${mod.color} shadow-[0_4px_15px_rgba(0,0,0,0.2)]`
                            : isNext
                              ? `${mod.color} opacity-90 shadow-[0_4px_15px_rgba(0,0,0,0.15)]`
                              : "bg-muted/50"
                      }`}
                    >
                      {/* 3D border effect */}
                      <div className={`absolute inset-0 rounded-full border-4 ${
                        isDone ? `${mod.darkColor} border-b-4` : isNext ? "border-white/20" : "border-muted-foreground/10"
                      }`} style={{ borderBottomWidth: 6 }} />

                      {/* Icon */}
                      {isDone ? (
                        <CheckCircle2 size={24} className="text-white relative z-10" />
                      ) : isCheckpoint ? (
                        <Gift size={24} className={`${isLocked ? "text-muted-foreground/40" : "text-white"} relative z-10`} />
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

                      {/* Pulse ring for next lesson */}
                      {isNext && (
                        <motion.div
                          className={`absolute inset-0 rounded-full ${mod.color} opacity-30`}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {/* Stars for completed */}
                      {isDone && (
                        <div className="absolute -bottom-1 flex gap-0.5">
                          {[0,1,2].map(s => (
                            <motion.div
                              key={s}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 + s * 0.1 }}
                            >
                              <Star size={8} className="text-yellow-300 fill-yellow-300" />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.button>

                    {/* Label */}
                    <p className={`text-[10px] font-bold mt-1.5 text-center max-w-[100px] leading-tight ${
                      isDone ? "text-foreground" : isNext ? "text-foreground" : "text-muted-foreground/50"
                    }`}>
                      {lesson.t}
                    </p>
                    <span className={`text-[8px] font-semibold ${isDone ? "text-primary" : "text-muted-foreground/40"}`}>
                      {lesson.xp} XP
                    </span>

                    {/* Treasure chest between some lessons */}
                    {i === 2 && !isLocked && (
                      <motion.div
                        className="mt-2 w-10 h-10 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-md"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-lg">🎁</span>
                      </motion.div>
                    )}

                    {/* Mascot character appearance */}
                    {i === Math.floor(mod.lessons.length / 2) && (
                      <motion.div
                        className="mt-3"
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <MascotRobot size={50} mood="thinking" speech="Keep going! 💪" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Module complete celebration */}
            {modDone === mod.lessons.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <MascotRobot size={100} mood="celebrating" />
                <p className="text-foreground font-bold text-sm mt-2">Module Complete! 🏆</p>
                <p className="text-muted-foreground text-[10px]">You've mastered {mod.title}</p>
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
