import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Zap, MessageCircle, Brain, BookOpen, Loader2 } from "lucide-react";
import LessonChat from "@/components/lesson/LessonChat";
import type { ChatMessage } from "@/components/lesson/LessonChat";
import QuizCard from "@/components/lesson/QuizCard";
import type { QuizQuestion } from "@/components/lesson/QuizCard";
import LessonComplete from "@/components/lesson/LessonComplete";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { SFX } from "@/lib/sounds";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const ALL_LESSONS: Record<string, { t: string; xp: number; topic: string }> = {
  f1: { t: "What is an AI Agent?", xp: 50, topic: "what AI agents are, Perceive-Reason-Act-Learn loop, ReAct pattern, core components" },
  f2: { t: "LLMs as the Brain", xp: 50, topic: "how LLMs serve as agent reasoning engines, context windows, choosing the right model" },
  f3: { t: "Tools & Functions", xp: 60, topic: "how tools give agents the ability to ACT, function calling mechanics" },
  f4: { t: "Memory & RAG", xp: 60, topic: "agent memory systems: short-term, long-term, episodic, RAG" },
  f5: { t: "Planning & Reasoning", xp: 70, topic: "Chain-of-Thought, Tree-of-Thought, ReAct, task decomposition" },
  f6: { t: "Build: Research Agent", xp: 100, topic: "building a Python research agent with search + summarize + write" },
  w1: { t: "LangGraph", xp: 70, topic: "LangGraph directed graphs, checkpointing, time-travel debugging" },
  w2: { t: "CrewAI", xp: 60, topic: "CrewAI role-based teams, Role+Backstory+Goal pattern" },
  w3: { t: "AutoGen & SDKs", xp: 70, topic: "Microsoft AutoGen, OpenAI Agents SDK, Google ADK" },
  w4: { t: "MCP Protocol", xp: 80, topic: "Model Context Protocol, the USB-C of AI, 12000+ servers" },
  w5: { t: "MetaGPT & More", xp: 60, topic: "MetaGPT multi-agent software company, OpenAgents, n8n" },
  w6: { t: "Build: FW Battle", xp: 120, topic: "comparing CrewAI vs LangGraph vs AutoGen" },
  m1: { t: "Communication", xp: 70, topic: "Shared State, Message Passing, Event-Driven, Hierarchical patterns" },
  m2: { t: "AI Organization", xp: 80, topic: "designing multi-agent orgs: CEO, CMO, CTO agents" },
  m3: { t: "Orchestration", xp: 80, topic: "Sequential, Parallel, Hierarchical, Consensus patterns" },
  m4: { t: "Cost & Safety", xp: 70, topic: "managing LLM costs, circuit breakers, guardrails" },
  m5: { t: "Build: AI Startup", xp: 150, topic: "building a 6-agent startup team" },
  r1: { t: "Enterprise 2026", xp: 70, topic: "production AI agents, Salesforce Agentforce, Microsoft Copilot" },
  r2: { t: "Semiconductor AI", xp: 90, topic: "AI agents for semiconductor manufacturing" },
  r3: { t: "Solo Stack", xp: 80, topic: "one-person company with 10 AI agents" },
  r4: { t: "Crazy Mode", xp: 100, topic: "agent swarms, self-improving agents, digital twins" },
  r5: { t: "Final Boss", xp: 200, topic: "capstone: 10+ agent autonomous company" },
};

type Phase = "chat" | "generating" | "quiz" | "complete";

const PHASE_INFO: Record<string, { icon: typeof MessageCircle; label: string; color: string }> = {
  chat: { icon: MessageCircle, label: "LEARN", color: "text-agni-blue" },
  generating: { icon: Brain, label: "GENERATING QUIZ", color: "text-agni-gold" },
  quiz: { icon: Brain, label: "QUIZ", color: "text-agni-gold" },
  complete: { icon: BookOpen, label: "DONE", color: "text-agni-green" },
};

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stats, loseHeart, completeLesson } = useGamification();
  const [phase, setPhase] = useState<Phase>("chat");
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [quizError, setQuizError] = useState("");
  const [showQuizConfirm, setShowQuizConfirm] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const chatMessagesRef = useRef<ChatMessage[]>([]);

  const teachingMode = localStorage.getItem("teaching_mode") || "engineer";
  const lesson = id ? ALL_LESSONS[id] : null;

  const totalSteps = Math.max(quizzes.length, 1) + 1;
  const currentStep = phase === "chat" || phase === "generating" ? 0 : phase === "quiz" ? quizIndex + 1 : totalSteps;
  const progress = phase === "complete" ? 100 : ((currentStep) / totalSteps) * 100;

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const generateQuizzes = async (conversation: ChatMessage[]) => {
    setPhase("generating");
    setQuizError("");
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          conversation,
          lessonTitle: lesson?.t,
          lessonTopic: lesson?.topic,
          teachingMode,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const data = await resp.json();
      if (data.quizzes && data.quizzes.length > 0) {
        setQuizzes(data.quizzes);
        SFX.tap();
        setPhase("quiz");
      } else {
        throw new Error("No quiz questions generated");
      }
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      setQuizError(error.message);
      // Fallback: go to quiz with a simple generated question
      setQuizzes([{
        type: "mcq",
        question: `What is the main focus of "${lesson?.t}"?`,
        options: ["Basic programming", lesson?.topic.split(",")[0]?.trim() || "AI concepts", "Web development", "Data entry"],
        correctIndex: 1,
        explanation: `This lesson focuses on ${lesson?.topic.split(",")[0]?.trim() || "AI concepts"}.`,
      }]);
      setPhase("quiz");
    }
  };

  const handleQuizReady = (conversation: ChatMessage[]) => {
    SFX.tap();
    chatMessagesRef.current = conversation;
    generateQuizzes(conversation.length > 0 ? conversation : [{ role: "user", content: `Teach me about ${lesson?.t}: ${lesson?.topic}` }]);
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount(c => c + 1);
    } else {
      loseHeart();
    }
    setTimeout(() => {
      if (quizIndex < quizzes.length - 1) {
        setQuizIndex(quizIndex + 1);
      } else {
        handleLessonComplete();
      }
    }, 300);
  };

  const handleLessonComplete = () => {
    clearInterval(timerRef.current);
    SFX.xp();
    if (id && lesson) {
      const isPerfect = quizzes.length > 0 && correctCount === quizzes.length;
      completeLesson(id, lesson.xp, isPerfect);
    }
    setPhase("complete");
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Agni expression="sad" size={120} speech="Lesson not found 😢" />
        <button onClick={() => navigate("/courses")} className="text-agni-green font-black text-sm">Back to courses</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-2 relative z-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/courses")}
              className="text-xs font-bold text-muted-foreground flex items-center gap-1"
            >
              <X size={14} /> Back
            </motion.button>

            <div className="flex-1 text-center">
              <p className="text-sm font-black text-foreground truncate">{lesson.t}</p>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-[9px] font-black text-agni-green">{lesson.xp} XP</span>
                <span className="text-[9px] text-muted-foreground">⏱ {Math.floor(timer / 60)}m {timer % 60}s</span>
                <span className="text-[8px] font-bold text-agni-gold bg-agni-gold/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  ⚡ Gemini Flash
                </span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { if (phase === "chat") setShowQuizConfirm(true); else navigate("/courses"); }}
              className="text-[10px] font-black text-white bg-agni-green px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              ✅ Done
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                phase === "chat" || phase === "generating" ? "bg-agni-blue" : phase === "quiz" ? "bg-agni-gold" : "bg-agni-green"
              }`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden px-4 py-2 relative z-10">
        <div className="max-w-md mx-auto h-full">
          <AnimatePresence mode="wait">
            {phase === "complete" ? (
              <LessonComplete
                key="complete"
                lessonTitle={lesson.t}
                xpEarned={lesson.xp}
                correctCount={correctCount}
                totalQuizzes={quizzes.length}
                timeSpent={timer}
                onContinue={() => navigate("/courses")}
              />
            ) : phase === "generating" ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4"
              >
                <Agni expression="thinking" size={100} speech="Cooking up your quiz! 🧪" />
                <div className="flex items-center gap-2 text-agni-gold">
                  <Loader2 size={18} className="animate-spin" />
                  <p className="text-sm font-black">Generating quiz from your lesson...</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium text-center max-w-[250px]">
                  AGNI is creating personalized questions based on what you just learned
                </p>
              </motion.div>
            ) : phase === "quiz" ? (
              <QuizCard
                key={`quiz-${quizIndex}`}
                quiz={quizzes[quizIndex]}
                onAnswer={handleQuizAnswer}
              />
            ) : (
              <LessonChat
                key="chat"
                lessonTitle={lesson.t}
                lessonTopic={lesson.topic}
                teachingMode={teachingMode}
                onQuizReady={handleQuizReady}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hearts lost warning */}
      <AnimatePresence>
        {stats.hearts === 0 && phase !== "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 left-0 right-0 bg-agni-pink/95 p-5 z-30"
          >
            <div className="max-w-md mx-auto text-center">
              <Agni expression="sad" size={90} speech="Out of hearts! 💔" />
              <p className="text-white font-black text-sm mt-2">No hearts left!</p>
              <p className="text-white/70 text-xs font-medium mt-1">You can still finish the lesson.</p>
              <button
                onClick={() => navigate("/courses")}
                className="mt-3 bg-white text-agni-pink font-black text-sm px-6 py-2.5 rounded-full"
              >
                Back to Courses
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz confirmation dialog */}
      <AnimatePresence>
        {showQuizConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-card border border-border/40 rounded-2xl p-6 max-w-xs w-full text-center shadow-elevated"
            >
              {countdown === null ? (
                <>
                  <Agni expression="teaching" size={80} speech="Ready for the quiz? 🧠" />
                  <p className="text-foreground font-black text-sm mt-3">Start the Quiz?</p>
                  <p className="text-muted-foreground text-xs font-medium mt-1">
                    AGNI will generate questions based on what you just learned.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowQuizConfirm(false)}
                      className="flex-1 text-[11px] font-black text-muted-foreground bg-muted/30 border border-border/40 rounded-xl py-2.5 transition-colors"
                    >
                      Keep Learning
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCountdown(3);
                        let c = 3;
                        const iv = setInterval(() => {
                          c -= 1;
                          if (c <= 0) {
                            clearInterval(iv);
                            setShowQuizConfirm(false);
                            setCountdown(null);
                            handleQuizReady(chatMessagesRef.current);
                          } else {
                            setCountdown(c);
                          }
                        }, 800);
                      }}
                      className="flex-1 text-[11px] font-black text-white bg-agni-green rounded-xl py-2.5 shadow-[0_3px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[2px] transition-all"
                    >
                      ⚡ Let's Go!
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="py-4">
                  <Agni expression="happy" size={70} speech="Here we go! 🔥" />
                  <div className="relative w-24 h-24 mx-auto mt-4">
                    {/* Background ring */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="6" />
                      <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="hsl(var(--agni-green))"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={264}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 264 }}
                        transition={{ duration: 2.4, ease: "linear" }}
                      />
                    </svg>
                    {/* Number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={countdown}
                          initial={{ scale: 1.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="text-3xl font-black text-agni-green"
                        >
                          {countdown}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[10px] font-bold mt-3 uppercase tracking-widest">
                    Generating quiz...
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetailPage;
