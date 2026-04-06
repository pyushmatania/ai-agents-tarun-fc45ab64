import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronRight, Rocket, Zap, Trophy, Target, Star, Flame } from "lucide-react";
import heroRoadmap from "@/assets/hero-roadmap.png";

const PHASES = [
  {
    id: "30",
    title: "Days 1–30",
    subtitle: "Foundations & First Agent",
    emoji: "🧬",
    color: "from-violet-500 to-purple-600",
    bgGlow: "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    milestones: [
      {
        title: "The Agent Mental Model",
        desc: "Understand Perceive→Reason→Act→Learn loop, ReAct pattern, OODA loop, and how agents differ from chatbots.",
        lessonIds: ["f1"],
        xp: 50,
        checkpoint: false,
      },
      {
        title: "LLMs as the Brain",
        desc: "GPT-4o, Claude, Gemini, Llama, Mistral — context windows, embeddings, vector DBs, RAG, structured outputs.",
        lessonIds: ["f2"],
        xp: 50,
        checkpoint: false,
      },
      {
        title: "Tools & Function Calling",
        desc: "How tools give agents the power to ACT. Function calling mechanics and tool selection.",
        lessonIds: ["f3"],
        xp: 60,
        checkpoint: false,
      },
      {
        title: "Memory & RAG Systems",
        desc: "Short-term, long-term (Pinecone, ChromaDB), episodic memory, and Retrieval Augmented Generation.",
        lessonIds: ["f4"],
        xp: 60,
        checkpoint: false,
      },
      {
        title: "Planning & Reasoning",
        desc: "Chain-of-Thought, Tree-of-Thought, task decomposition — what separates smart agents from dumb ones.",
        lessonIds: ["f5"],
        xp: 70,
        checkpoint: false,
      },
      {
        title: "🏁 Checkpoint: Build Research Agent",
        desc: "Build a Python agent that searches the web, summarizes articles, and writes briefings. Your first real agent!",
        lessonIds: ["f6"],
        xp: 100,
        checkpoint: true,
      },
    ],
  },
  {
    id: "60",
    title: "Days 31–60",
    subtitle: "Frameworks & Multi-Agent Systems",
    emoji: "⚔️",
    color: "from-orange-500 to-amber-600",
    bgGlow: "shadow-[0_0_30px_rgba(249,115,22,0.15)]",
    milestones: [
      {
        title: "LangGraph Deep Dive",
        desc: "Directed graph workflows, checkpointing, time-travel debugging, LangSmith observability.",
        lessonIds: ["w1"],
        xp: 70,
        checkpoint: false,
      },
      {
        title: "CrewAI Role-Based Teams",
        desc: "Role+Backstory+Goal pattern, Crews and Flows architecture, prototype in 20 lines.",
        lessonIds: ["w2"],
        xp: 60,
        checkpoint: false,
      },
      {
        title: "AutoGen, OpenAI SDK & Google ADK",
        desc: "Conversational debate, handoffs, A2A protocol for cross-framework interop.",
        lessonIds: ["w3"],
        xp: 70,
        checkpoint: false,
      },
      {
        title: "MCP Protocol Mastery",
        desc: "The USB-C of AI — 12,000+ MCP servers, building and chaining MCP servers.",
        lessonIds: ["w4"],
        xp: 80,
        checkpoint: false,
      },
      {
        title: "MetaGPT & More Frameworks",
        desc: "MetaGPT SOPs, OpenAgents with MCP+A2A, n8n no-code agents.",
        lessonIds: ["w5"],
        xp: 60,
        checkpoint: false,
      },
      {
        title: "🏁 Checkpoint: Framework Battle",
        desc: "Build the same agent in CrewAI, LangGraph, and AutoGen. Compare LOC, speed, quality, cost.",
        lessonIds: ["w6"],
        xp: 120,
        checkpoint: true,
      },
      {
        title: "Agent Communication Patterns",
        desc: "Shared State, Message Passing, Event-Driven pub/sub, Hierarchical delegation.",
        lessonIds: ["m1"],
        xp: 70,
        checkpoint: false,
      },
      {
        title: "Design an AI Organization",
        desc: "CEO, CMO, CTO, CFO, Sales, HR, Legal, Ops agents — all collaborating autonomously.",
        lessonIds: ["m2"],
        xp: 80,
        checkpoint: false,
      },
      {
        title: "Orchestration Patterns",
        desc: "Sequential, Parallel, Hierarchical, Consensus voting, Competitive patterns.",
        lessonIds: ["m3"],
        xp: 80,
        checkpoint: false,
      },
      {
        title: "Cost Management & Safety",
        desc: "Token budgeting, tiered models, circuit breakers, guardrails for multi-agent systems.",
        lessonIds: ["m4"],
        xp: 70,
        checkpoint: false,
      },
      {
        title: "🏁 Checkpoint: Build AI Startup Team",
        desc: "6-agent startup team using CrewAI that produces a complete business package autonomously.",
        lessonIds: ["m5"],
        xp: 150,
        checkpoint: true,
      },
    ],
  },
  {
    id: "90",
    title: "Days 61–90",
    subtitle: "Real World & Mastery",
    emoji: "🚀",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    milestones: [
      {
        title: "Enterprise AI Agents (2026)",
        desc: "Salesforce Agentforce (18.5K deals), Microsoft Copilot (15M seats), Gartner predictions.",
        lessonIds: ["r1"],
        xp: 70,
        checkpoint: false,
      },
      {
        title: "Semiconductor AI Agents",
        desc: "AI agents for HCL-Foxconn OSAT: yield optimization, supply chain, equipment maintenance, quality.",
        lessonIds: ["r2"],
        xp: 90,
        checkpoint: false,
      },
      {
        title: "Solo AI Company Stack",
        desc: "Build a one-person company with 10 AI agents: content, sales, competitor intel, bookkeeping.",
        lessonIds: ["r3"],
        xp: 80,
        checkpoint: false,
      },
      {
        title: "Crazy Mode: The Future",
        desc: "Agent swarms, self-improving agents, digital twins, Manus ($2B), agent economies.",
        lessonIds: ["r4"],
        xp: 100,
        checkpoint: false,
      },
      {
        title: "🏆 Final Boss: Autonomous Company",
        desc: "10+ agent company producing market research, business plan, landing page, social posts, financial model, and investor emails — all in parallel.",
        lessonIds: ["r5"],
        xp: 200,
        checkpoint: true,
      },
    ],
  },
];

const TOTAL_XP = PHASES.flatMap(p => p.milestones).reduce((s, m) => s + m.xp, 0);
const TOTAL_MILESTONES = PHASES.flatMap(p => p.milestones).length;

const RoadmapPage = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || localStorage.getItem("edu_user_name") || "Learner";
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");

  const [expandedPhase, setExpandedPhase] = useState<string | null>("30");

  const completedMilestones = PHASES.flatMap(p => p.milestones).filter(m => m.lessonIds.every(id => done.includes(id))).length;
  const overallProgress = Math.round((completedMilestones / TOTAL_MILESTONES) * 100);

  // Determine current phase
  const currentPhaseIdx = PHASES.findIndex(p => p.milestones.some(m => !m.lessonIds.every(id => done.includes(id))));
  const currentDay = Math.min(completedMilestones * 4 + 1, 90); // rough estimate

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">
          <Header name={userName} progress={overallProgress} />

          {/* Page Title */}
          <FadeIn>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-display font-bold text-foreground">Learning Roadmap</h2>
              <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-2.5 py-1">
                <Target size={10} className="text-primary" />
                <span className="text-[10px] font-bold text-primary">90 Days</span>
              </div>
            </div>
          </FadeIn>

          {/* Hero Illustration */}
          <FadeIn delay={0.05}>
            <div className="rounded-2xl mb-4 relative overflow-hidden">
              <img
                src={heroRoadmap}
                alt="90-day learning roadmap journey"
                className="w-full h-48 object-cover rounded-2xl"
                loading="lazy"
                width={800}
                height={512}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent rounded-2xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-foreground font-bold text-sm">Your Journey</p>
                  <span className="text-muted-foreground text-[10px]">Day ~{currentDay} of 90</span>
                </div>

                {/* Timeline bar */}
                <div className="relative mb-2">
                  <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 via-orange-400 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    {["Day 1", "Day 30", "Day 60", "Day 90"].map((label, i) => (
                      <span key={i} className="text-[7px] text-muted-foreground font-medium">{label}</span>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: CheckCircle2, value: completedMilestones, label: "Done", color: "text-emerald-500" },
                    { icon: Zap, value: xp, label: "XP Earned", color: "text-amber-500" },
                    { icon: Target, value: TOTAL_MILESTONES - completedMilestones, label: "Remaining", color: "text-violet-500" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="text-center"
                    >
                      <s.icon size={12} className={`${s.color} mx-auto mb-0.5`} />
                      <p className="text-foreground font-bold text-sm leading-none">{s.value}</p>
                      <p className="text-muted-foreground text-[7px] font-medium">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
          </FadeIn>

          {/* Phases */}
          <StaggerContainer className="space-y-3">
            {PHASES.map((phase, phaseIdx) => {
              const isExpanded = expandedPhase === phase.id;
              const phaseCompleted = phase.milestones.filter(m => m.lessonIds.every(id => done.includes(id))).length;
              const phasePct = Math.round((phaseCompleted / phase.milestones.length) * 100);
              const isLocked = phaseIdx > 0 && PHASES[phaseIdx - 1].milestones.some(m => !m.lessonIds.every(id => done.includes(id))) && phaseCompleted === 0;

              return (
                <StaggerItem key={phase.id}>
                  <div className={`rounded-xl border overflow-hidden transition-all ${
                    isExpanded ? "border-primary/30 shadow-card" : "border-border/40"
                  } ${phase.bgGlow}`}>
                    {/* Phase Header */}
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                      className="w-full p-3.5 flex items-center gap-3 text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-lg shrink-0 shadow-md`}>
                        {phase.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-foreground">{phase.title}</h3>
                          {isLocked && <Lock size={10} className="text-muted-foreground" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{phase.subtitle}</p>
                        {/* Mini progress */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${phase.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${phasePct}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground">{phaseCompleted}/{phase.milestones.length}</span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={14} className="text-muted-foreground" />
                      </motion.div>
                    </motion.button>

                    {/* Milestones */}
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
                              const isComplete = milestone.lessonIds.every(id => done.includes(id));
                              const isNext = !isComplete && (mIdx === 0 || phase.milestones[mIdx - 1].lessonIds.every(id => done.includes(id)));

                              return (
                                <motion.div
                                  key={mIdx}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: mIdx * 0.04 }}
                                  className={`relative flex gap-2.5 p-2.5 rounded-lg transition-all ${
                                    milestone.checkpoint
                                      ? isComplete
                                        ? "bg-primary/5 border border-primary/20"
                                        : "bg-muted/20 border border-dashed border-primary/20"
                                      : isNext
                                        ? "bg-primary/5 border border-primary/15"
                                        : ""
                                  }`}
                                >
                                  {/* Timeline line */}
                                  {mIdx < phase.milestones.length - 1 && (
                                    <div className="absolute left-[18px] top-9 bottom-0 w-px bg-border/30" style={{ height: "calc(100% - 20px)" }} />
                                  )}

                                  {/* Status icon */}
                                  <div className="shrink-0 z-10">
                                    {isComplete ? (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                      >
                                        <CheckCircle2 size={16} className="text-primary" />
                                      </motion.div>
                                    ) : isNext ? (
                                      <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <Flame size={16} className="text-primary" />
                                      </motion.div>
                                    ) : (
                                      <Circle size={16} className="text-muted-foreground/30" />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className={`text-[11px] font-bold ${isComplete ? "text-foreground" : isNext ? "text-foreground" : "text-muted-foreground"}`}>
                                        {milestone.title}
                                      </p>
                                      {milestone.checkpoint && (
                                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                                          Checkpoint
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-[9px] leading-relaxed mt-0.5 ${isComplete ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                                      {milestone.desc}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[8px] font-bold text-primary flex items-center gap-0.5">
                                        <Zap size={8} /> {milestone.xp} XP
                                      </span>
                                      {isComplete && (
                                        <span className="text-[8px] text-emerald-500 font-bold">✓ Completed</span>
                                      )}
                                      {isNext && (
                                        <span className="text-[8px] text-primary font-bold animate-pulse">← You are here</span>
                                      )}
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
          <FadeIn delay={0.5}>
            <div className="mt-4 bg-card rounded-xl p-3 border border-border/50 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-primary" />
                  <div>
                    <p className="text-[11px] font-bold text-foreground">Total Curriculum XP</p>
                    <p className="text-[9px] text-muted-foreground">{TOTAL_MILESTONES} milestones across 3 phases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{TOTAL_XP} XP</p>
                  <p className="text-[8px] text-muted-foreground">{xp}/{TOTAL_XP} earned</p>
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
