import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Lock, ChevronDown, Rocket, Zap, Trophy, Target, Star, Flame, Diamond } from "lucide-react";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";

const PHASES = [
  {
    id: "30", title: "Days 1–30", subtitle: "Foundations & First Agent", emoji: "🧬",
    color: "from-violet-500 to-purple-600", borderColor: "border-violet-500/30",
    milestones: [
      { title: "The Agent Mental Model", desc: "Perceive→Reason→Act→Learn loop, ReAct pattern, OODA loop.", lessonIds: ["f1"], xp: 50, checkpoint: false },
      { title: "LLMs as the Brain", desc: "GPT-4o, Claude, Gemini — context windows, embeddings, RAG.", lessonIds: ["f2"], xp: 50, checkpoint: false },
      { title: "Tools & Function Calling", desc: "How tools give agents the power to ACT.", lessonIds: ["f3"], xp: 60, checkpoint: false },
      { title: "Memory & RAG Systems", desc: "Short-term, long-term, episodic memory, RAG.", lessonIds: ["f4"], xp: 60, checkpoint: false },
      { title: "Planning & Reasoning", desc: "Chain-of-Thought, Tree-of-Thought, task decomposition.", lessonIds: ["f5"], xp: 70, checkpoint: false },
      { title: "🏁 Build Research Agent", desc: "Your first real agent — search, summarize, brief!", lessonIds: ["f6"], xp: 100, checkpoint: true },
    ],
  },
  {
    id: "60", title: "Days 31–60", subtitle: "Frameworks & Multi-Agent", emoji: "⚔️",
    color: "from-orange-500 to-amber-600", borderColor: "border-orange-500/30",
    milestones: [
      { title: "LangGraph Deep Dive", desc: "Directed graphs, checkpointing, time-travel debugging.", lessonIds: ["w1"], xp: 70, checkpoint: false },
      { title: "CrewAI Teams", desc: "Role+Backstory+Goal, Crews and Flows architecture.", lessonIds: ["w2"], xp: 60, checkpoint: false },
      { title: "AutoGen & ADK", desc: "Conversational debate, handoffs, A2A protocol.", lessonIds: ["w3"], xp: 70, checkpoint: false },
      { title: "MCP Protocol", desc: "The USB-C of AI — 12,000+ MCP servers.", lessonIds: ["w4"], xp: 80, checkpoint: false },
      { title: "MetaGPT & More", desc: "MetaGPT SOPs, OpenAgents, n8n no-code.", lessonIds: ["w5"], xp: 60, checkpoint: false },
      { title: "🏁 Framework Battle", desc: "Same agent in CrewAI, LangGraph, AutoGen.", lessonIds: ["w6"], xp: 120, checkpoint: true },
      { title: "Communication Patterns", desc: "Shared State, Message Passing, Event-Driven.", lessonIds: ["m1"], xp: 70, checkpoint: false },
      { title: "AI Organization Design", desc: "CEO, CTO, Sales agents collaborating.", lessonIds: ["m2"], xp: 80, checkpoint: false },
      { title: "Orchestration Patterns", desc: "Sequential, Parallel, Hierarchical, Consensus.", lessonIds: ["m3"], xp: 80, checkpoint: false },
      { title: "Cost & Safety", desc: "Token budgets, tiered models, guardrails.", lessonIds: ["m4"], xp: 70, checkpoint: false },
      { title: "🏁 AI Startup Team", desc: "6-agent startup producing a business package.", lessonIds: ["m5"], xp: 150, checkpoint: true },
    ],
  },
  {
    id: "90", title: "Days 61–90", subtitle: "Real World & Mastery", emoji: "🚀",
    color: "from-emerald-500 to-teal-600", borderColor: "border-emerald-500/30",
    milestones: [
      { title: "Enterprise AI (2026)", desc: "Salesforce Agentforce, Microsoft Copilot, Gartner.", lessonIds: ["r1"], xp: 70, checkpoint: false },
      { title: "Semiconductor Agents", desc: "AI for yield, supply chain, quality in OSAT.", lessonIds: ["r2"], xp: 90, checkpoint: false },
      { title: "Solo AI Company", desc: "One person + 10 AI agents = autonomous startup.", lessonIds: ["r3"], xp: 80, checkpoint: false },
      { title: "Crazy Future Mode", desc: "Agent swarms, self-improving agents, Manus ($2B).", lessonIds: ["r4"], xp: 100, checkpoint: false },
      { title: "🏆 Final Boss", desc: "10+ agent company — market research to investor emails.", lessonIds: ["r5"], xp: 200, checkpoint: true },
    ],
  },
];

const TOTAL_XP = PHASES.flatMap(p => p.milestones).reduce((s, m) => s + m.xp, 0);
const TOTAL_MILESTONES = PHASES.flatMap(p => p.milestones).length;

const RoadmapPage = () => {
  const { user } = useAuth();
  const { stats, league } = useGamification();
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || getCurrentScopedStorage().get<string>("user_name", "") || "Learner";

  const [expandedPhase, setExpandedPhase] = useState<string | null>("30");

  const completedMilestones = PHASES.flatMap(p => p.milestones).filter(m => m.lessonIds.every(id => stats.done.includes(id))).length;
  const overallProgress = Math.round((completedMilestones / TOTAL_MILESTONES) * 100);
  const currentDay = Math.min(completedMilestones * 4 + 1, 90);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">

          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Agni expression={completedMilestones >= TOTAL_MILESTONES ? "celebrating" : "teaching"} size={50} animate={true} />
                <div>
                  <h2 className="text-sm font-black text-foreground">90-Day Roadmap</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">Day ~{currentDay} • {league.emoji} {league.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-orange/15 rounded-full px-2 py-0.5">
                  <Flame size={10} className="text-agni-orange" />
                  <span className="text-[10px] font-black text-agni-orange">{stats.streak}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2 py-0.5">
                  <Zap size={10} className="text-agni-green" />
                  <span className="text-[10px] font-black text-agni-green">{stats.xp}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Journey Progress Banner */}
          <FadeIn delay={0.05}>
            <div className="rounded-2xl p-4 mb-4 relative overflow-hidden border border-agni-purple/20"
              style={{ background: "linear-gradient(135deg, hsl(var(--agni-purple) / 0.15), hsl(var(--agni-green) / 0.1))" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-micro text-agni-purple mb-0.5">YOUR JOURNEY</p>
                  <p className="text-lg font-black text-foreground">{overallProgress}% Complete</p>
                </div>
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agni-purple/20 to-agni-green/20 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-2xl">🗺️</span>
                </motion.div>
              </div>

              {/* Timeline bar */}
              <div className="w-full h-2.5 bg-muted/30 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 via-orange-400 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between">
                {["Day 1", "Day 30", "Day 60", "Day 90"].map((label, i) => (
                  <span key={i} className="text-[8px] text-muted-foreground font-bold">{label}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { icon: CheckCircle2, value: completedMilestones, label: "Done", color: "text-agni-green" },
                  { icon: Zap, value: stats.xp, label: "XP Earned", color: "text-agni-gold" },
                  { icon: Target, value: TOTAL_MILESTONES - completedMilestones, label: "Remaining", color: "text-agni-purple" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="text-center bg-background/30 rounded-xl py-2"
                  >
                    <s.icon size={14} className={`${s.color} mx-auto mb-0.5`} />
                    <p className="text-sm font-black text-foreground leading-none">{s.value}</p>
                    <p className="text-[7px] text-muted-foreground font-bold">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Phases */}
          <StaggerContainer className="space-y-3">
            {PHASES.map((phase, phaseIdx) => {
              const isExpanded = expandedPhase === phase.id;
              const phaseCompleted = phase.milestones.filter(m => m.lessonIds.every(id => stats.done.includes(id))).length;
              const phasePct = Math.round((phaseCompleted / phase.milestones.length) * 100);
              const isLocked = phaseIdx > 0 && PHASES[phaseIdx - 1].milestones.some(m => !m.lessonIds.every(id => stats.done.includes(id))) && phaseCompleted === 0;

              return (
                <StaggerItem key={phase.id}>
                  <div className={`rounded-2xl border overflow-hidden transition-all ${
                    isExpanded ? `${phase.borderColor} shadow-card` : "border-border/40"
                  }`}>
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                      className="w-full p-3.5 flex items-center gap-3 text-left"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-lg shrink-0 shadow-md`}>
                        {phase.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-extrabold text-foreground">{phase.title}</h3>
                          {isLocked && <Lock size={10} className="text-muted-foreground" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold">{phase.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${phase.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${phasePct}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-muted-foreground">{phaseCompleted}/{phase.milestones.length}</span>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} className="text-muted-foreground" />
                      </motion.div>
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
                          <div className="px-3.5 pb-3.5 space-y-1">
                            {phase.milestones.map((milestone, mIdx) => {
                              const isComplete = milestone.lessonIds.every(id => stats.done.includes(id));
                              const isNext = !isComplete && (mIdx === 0 || phase.milestones[mIdx - 1].lessonIds.every(id => stats.done.includes(id)));

                              return (
                                <motion.div
                                  key={mIdx}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: mIdx * 0.04 }}
                                  className={`relative flex gap-2.5 p-2.5 rounded-xl transition-all ${
                                    milestone.checkpoint
                                      ? isComplete ? "bg-agni-green/10 border border-agni-green/20" : "bg-muted/20 border border-dashed border-agni-gold/20"
                                      : isNext ? "bg-agni-green/5 border border-agni-green/15" : ""
                                  }`}
                                >
                                  {mIdx < phase.milestones.length - 1 && (
                                    <div className="absolute left-[18px] top-9 bottom-0 w-px bg-border/30" style={{ height: "calc(100% - 20px)" }} />
                                  )}

                                  <div className="shrink-0 z-10">
                                    {isComplete ? (
                                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                        <CheckCircle2 size={16} className="text-agni-green" />
                                      </motion.div>
                                    ) : isNext ? (
                                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                        <Flame size={16} className="text-agni-orange" />
                                      </motion.div>
                                    ) : (
                                      <Circle size={16} className="text-muted-foreground/30" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className={`text-[11px] font-extrabold ${isComplete ? "text-foreground" : isNext ? "text-foreground" : "text-muted-foreground"}`}>
                                        {milestone.title}
                                      </p>
                                      {milestone.checkpoint && (
                                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-agni-gold/15 text-agni-gold uppercase tracking-wider">
                                          {milestone.title.includes("Final") ? "BOSS" : "CHECK"}
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-[9px] leading-relaxed mt-0.5 font-semibold ${isComplete ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                                      {milestone.desc}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[8px] font-black text-agni-green flex items-center gap-0.5">
                                        <Zap size={8} /> {milestone.xp} XP
                                      </span>
                                      {isComplete && <span className="text-[8px] text-agni-green font-black">✓ Done</span>}
                                      {isNext && <span className="text-[8px] text-agni-orange font-black animate-pulse">← You are here</span>}
                                    </div>
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

          {/* Total XP Summary */}
          <FadeIn delay={0.4}>
            <div className="mt-4 bg-card rounded-2xl p-3.5 border border-border/40 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-agni-gold" />
                  <div>
                    <p className="text-[11px] font-extrabold text-foreground">Total Curriculum</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">{TOTAL_MILESTONES} milestones • 3 phases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-agni-gold">{TOTAL_XP} XP</p>
                  <p className="text-[8px] text-muted-foreground font-bold">{stats.xp}/{TOTAL_XP} earned</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default RoadmapPage;
