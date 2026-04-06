import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Zap, MessageCircle, Brain, BookOpen } from "lucide-react";
import LessonChat from "@/components/lesson/LessonChat";
import QuizCard from "@/components/lesson/QuizCard";
import type { QuizQuestion } from "@/components/lesson/QuizCard";
import LessonComplete from "@/components/lesson/LessonComplete";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { SFX } from "@/lib/sounds";

// Quiz data per lesson
const LESSON_QUIZZES: Record<string, QuizQuestion[]> = {
  f1: [
    { type: "mcq", question: "What makes an AI agent different from a chatbot?", options: ["It uses GPT-4", "It can take autonomous actions", "It has a better UI", "It's faster"], correctIndex: 1, explanation: "Agents can autonomously decide and execute multi-step actions, while chatbots just respond to messages." },
    { type: "truefalse", question: "The ReAct pattern stands for Reason + Act.", correctAnswer: true, explanation: "ReAct combines reasoning (thinking through steps) with acting (executing tools) in a loop." },
    { type: "fillin", question: "The 5 core components of an agent are: LLM, Tools, Memory, Planning, and _____ Loop.", correctText: "Autonomy", explanation: "The Autonomy Loop is what allows agents to self-direct their execution without human intervention at each step." },
  ],
  f2: [
    { type: "mcq", question: "Which model has the largest context window?", options: ["GPT-4o (128K)", "Claude 3.5 (200K)", "Gemini 2.5 (1M+)", "Llama 3.1 (128K)"], correctIndex: 2, explanation: "Gemini 2.5 offers 1M+ tokens, the largest context window among major models." },
    { type: "truefalse", question: "Open-source models like Llama cannot be used for AI agents.", correctAnswer: false, explanation: "Llama 3.1 and other open-source models work great for agents, especially when cost and privacy matter." },
  ],
  f3: [
    { type: "mcq", question: "What do tools give an AI agent?", options: ["Better language", "Ability to act in the real world", "Faster thinking", "More memory"], correctIndex: 1, explanation: "Tools let agents interact with external systems — search, write files, call APIs, and more." },
    { type: "truefalse", question: "The LLM directly executes tool functions.", correctAnswer: false, explanation: "The LLM decides which tool to call and generates arguments, but your application code actually executes the tool." },
  ],
};

// Generate default quizzes for lessons without specific content
const getDefaultQuizzes = (title: string, topic: string): QuizQuestion[] => [
  { type: "mcq" as const, question: `What is the main focus of "${title}"?`, options: ["Basic programming", topic.split(",")[0]?.trim() || "AI concepts", "Web development", "Data entry"], correctIndex: 1, explanation: `This lesson focuses on ${topic.split(",")[0]?.trim() || "AI agent concepts"}.` },
];

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

type Phase = "chat" | "quiz" | "complete";

const PHASE_INFO = {
  chat: { icon: MessageCircle, label: "LEARN", color: "text-agni-blue" },
  quiz: { icon: Brain, label: "QUIZ", color: "text-agni-gold" },
  complete: { icon: BookOpen, label: "DONE", color: "text-agni-green" },
};

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stats, loseHeart, completeLesson } = useGamification();
  const [phase, setPhase] = useState<Phase>("chat");
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const teachingMode = localStorage.getItem("teaching_mode") || "engineer";
  const lesson = id ? ALL_LESSONS[id] : null;
  const quizzes = id && LESSON_QUIZZES[id]
    ? LESSON_QUIZZES[id]
    : id && lesson
      ? getDefaultQuizzes(lesson.t, lesson.topic)
      : [];

  const totalSteps = quizzes.length + 1; // chat phase counts as 1
  const currentStep = phase === "chat" ? 0 : phase === "quiz" ? quizIndex + 1 : totalSteps;
  const progress = phase === "complete" ? 100 : ((currentStep) / totalSteps) * 100;

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleQuizReady = () => {
    SFX.tap();
    setPhase("quiz");
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

  const PhaseIcon = PHASE_INFO[phase].icon;

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
              onClick={() => { if (phase === "chat") handleQuizReady(); else navigate("/courses"); }}
              className="text-[10px] font-black text-white bg-agni-green px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              ✅ Done
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${phase === "chat" ? "bg-agni-blue" : phase === "quiz" ? "bg-agni-gold" : "bg-agni-green"}`}
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
    </div>
  );
};

export default CourseDetailPage;
