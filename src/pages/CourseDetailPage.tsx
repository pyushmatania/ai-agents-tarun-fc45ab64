import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Zap } from "lucide-react";
import LessonCard from "@/components/lesson/LessonCard";
import QuizCard from "@/components/lesson/QuizCard";
import type { QuizQuestion } from "@/components/lesson/QuizCard";
import LessonComplete from "@/components/lesson/LessonComplete";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { SFX } from "@/lib/sounds";
// Lesson content data — each lesson has concept cards + quizzes
const LESSON_CONTENT: Record<string, {
  cards: { title: string; content: string; type: "concept" | "diagram" | "example" | "code"; icon: string }[];
  quizzes: QuizQuestion[];
}> = {
  f1: {
    cards: [
      { title: "What is an AI Agent?", type: "concept", icon: "🤖", content: "An AI Agent is software that can perceive its environment, reason about it, take actions, and learn from outcomes.\n\nUnlike a chatbot that just responds, an agent has AUTONOMY — it decides what to do next.\n\n• Perceive → Read data, observe world\n• Reason → Think with an LLM brain\n• Act → Use tools to change things\n• Learn → Improve from feedback" },
      { title: "The Agent Loop", type: "diagram", icon: "🔄", content: "Every agent runs this core loop:\n\n**1. OBSERVE** — Take in information\n**2. THINK** — LLM reasons about what to do\n**3. ACT** — Call tools, APIs, write files\n**4. REFLECT** — Check if goal is met\n\nThis is called the ReAct pattern (Reason + Act). The loop continues until the task is complete or the agent decides to stop." },
      { title: "Agent vs Chatbot", type: "example", icon: "⚡", content: "**Chatbot:** You ask → It replies → Done\n\n**Agent:** You give a goal → It plans steps → Executes each step → Uses tools → Checks progress → Adjusts → Delivers result\n\n• Chatbot = Single turn\n• Agent = Multi-step autonomous\n\nThink of it like: a chatbot is a calculator, an agent is a personal assistant who can actually DO things." },
      { title: "5 Core Components", type: "concept", icon: "🧬", content: "Every AI agent needs:\n\n**1. LLM Brain** — GPT-4, Claude, Gemini\n**2. Tools** — APIs, search, code execution\n**3. Memory** — Short-term + long-term storage\n**4. Planning** — Task decomposition\n**5. Autonomy Loop** — Self-directed execution\n\nRemove any one of these and you have a chatbot, not an agent." },
    ],
    quizzes: [
      { type: "mcq", question: "What makes an AI agent different from a chatbot?", options: ["It uses GPT-4", "It can take autonomous actions", "It has a better UI", "It's faster"], correctIndex: 1, explanation: "Agents can autonomously decide and execute multi-step actions, while chatbots just respond to messages." },
      { type: "truefalse", question: "The ReAct pattern stands for Reason + Act.", correctAnswer: true, explanation: "ReAct combines reasoning (thinking through steps) with acting (executing tools) in a loop." },
      { type: "fillin", question: "The 5 core components of an agent are: LLM, Tools, Memory, Planning, and _____ Loop.", correctText: "Autonomy", explanation: "The Autonomy Loop is what allows agents to self-direct their execution without human intervention at each step." },
    ],
  },
  f2: {
    cards: [
      { title: "LLMs: The Agent Brain", type: "concept", icon: "🧠", content: "Large Language Models are the reasoning engine of every AI agent.\n\nThey don't just generate text — they:\n• Understand complex instructions\n• Plan multi-step workflows\n• Decide which tools to call\n• Parse and synthesize information\n\nThe LLM IS the brain. Everything else is the body." },
      { title: "Choosing Your Model", type: "diagram", icon: "🎯", content: "**Top Models for Agents:**\n\n• GPT-4o — Best all-rounder, great tool use\n• Claude 3.5 — Best reasoning, longest context\n• Gemini 2.5 — Multimodal, huge context\n• Llama 3.1 — Best open-source option\n• Mistral — Fast, efficient, great for cost\n\nChoose based on: accuracy needs, speed, cost, and context window size." },
      { title: "Context = Working Memory", type: "example", icon: "💾", content: "An LLM's context window is like working memory:\n\n• GPT-4o: 128K tokens (~300 pages)\n• Claude: 200K tokens (~500 pages)\n• Gemini: 1M+ tokens (~2500 pages)\n\nMore context = agent can handle more complex tasks without forgetting earlier information." },
    ],
    quizzes: [
      { type: "mcq", question: "Which model has the largest context window?", options: ["GPT-4o (128K)", "Claude 3.5 (200K)", "Gemini 2.5 (1M+)", "Llama 3.1 (128K)"], correctIndex: 2, explanation: "Gemini 2.5 offers 1M+ tokens, the largest context window among major models." },
      { type: "truefalse", question: "Open-source models like Llama cannot be used for AI agents.", correctAnswer: false, explanation: "Llama 3.1 and other open-source models work great for agents, especially when cost and privacy matter." },
    ],
  },
  f3: {
    cards: [
      { title: "Tools: Hands of the Agent", type: "concept", icon: "🛠️", content: "Tools give agents the ability to ACT in the real world.\n\nWithout tools, an agent can only think and talk. With tools, it can:\n• Search the web\n• Read/write files\n• Call APIs\n• Execute code\n• Send emails\n• Query databases" },
      { title: "Function Calling", type: "code", icon: "⚙️", content: "The LLM doesn't run tools directly. Instead:\n\n**1.** LLM sees available tools + descriptions\n**2.** LLM decides which tool to call\n**3.** LLM generates the arguments (JSON)\n**4.** Your code executes the tool\n**5.** Result goes back to the LLM\n\nThe LLM is the decision-maker, your code is the executor." },
    ],
    quizzes: [
      { type: "mcq", question: "What do tools give an AI agent?", options: ["Better language", "Ability to act in the real world", "Faster thinking", "More memory"], correctIndex: 1, explanation: "Tools let agents interact with external systems — search, write files, call APIs, and more." },
      { type: "truefalse", question: "The LLM directly executes tool functions.", correctAnswer: false, explanation: "The LLM decides which tool to call and generates arguments, but your application code actually executes the tool." },
    ],
  },
};

// Generate default content for lessons without specific content
const getDefaultContent = (id: string, title: string, topic: string) => ({
  cards: [
    { title, type: "concept" as const, icon: "📚", content: `This lesson covers:\n\n${topic}\n\nSwipe through the cards to learn key concepts, then test your knowledge with quizzes!` },
    { title: "Key Concepts", type: "diagram" as const, icon: "🎯", content: `**What you'll learn:**\n\n${topic.split(",").map(t => `• ${t.trim()}`).join("\n")}` },
  ],
  quizzes: [
    { type: "mcq" as QuizQuestion["type"], question: `What is the main focus of "${title}"?`, options: ["Basic programming", topic.split(",")[0]?.trim() || "AI concepts", "Web development", "Data entry"], correctIndex: 1, explanation: `This lesson focuses on ${topic.split(",")[0]?.trim() || "AI agent concepts"}.` },
  ],
});

const ALL_LESSONS: Record<string, { t: string; xp: number; topic: string }> = {
  f1:{t:"What is an AI Agent?",xp:50,topic:"what AI agents are, Perceive-Reason-Act-Learn loop, ReAct pattern, core components"},
  f2:{t:"LLMs as the Brain",xp:50,topic:"how LLMs serve as agent reasoning engines, context windows, choosing the right model"},
  f3:{t:"Tools & Functions",xp:60,topic:"how tools give agents the ability to ACT, function calling mechanics"},
  f4:{t:"Memory & RAG",xp:60,topic:"agent memory systems: short-term, long-term, episodic, RAG"},
  f5:{t:"Planning & Reasoning",xp:70,topic:"Chain-of-Thought, Tree-of-Thought, ReAct, task decomposition"},
  f6:{t:"Build: Research Agent",xp:100,topic:"building a Python research agent with search + summarize + write"},
  w1:{t:"LangGraph",xp:70,topic:"LangGraph directed graphs, checkpointing, time-travel debugging"},
  w2:{t:"CrewAI",xp:60,topic:"CrewAI role-based teams, Role+Backstory+Goal pattern"},
  w3:{t:"AutoGen & SDKs",xp:70,topic:"Microsoft AutoGen, OpenAI Agents SDK, Google ADK"},
  w4:{t:"MCP Protocol",xp:80,topic:"Model Context Protocol, the USB-C of AI, 12000+ servers"},
  w5:{t:"MetaGPT & More",xp:60,topic:"MetaGPT multi-agent software company, OpenAgents, n8n"},
  w6:{t:"Build: FW Battle",xp:120,topic:"comparing CrewAI vs LangGraph vs AutoGen"},
  m1:{t:"Communication",xp:70,topic:"Shared State, Message Passing, Event-Driven, Hierarchical patterns"},
  m2:{t:"AI Organization",xp:80,topic:"designing multi-agent orgs: CEO, CMO, CTO agents"},
  m3:{t:"Orchestration",xp:80,topic:"Sequential, Parallel, Hierarchical, Consensus patterns"},
  m4:{t:"Cost & Safety",xp:70,topic:"managing LLM costs, circuit breakers, guardrails"},
  m5:{t:"Build: AI Startup",xp:150,topic:"building a 6-agent startup team"},
  r1:{t:"Enterprise 2026",xp:70,topic:"production AI agents, Salesforce Agentforce, Microsoft Copilot"},
  r2:{t:"Semiconductor AI",xp:90,topic:"AI agents for semiconductor manufacturing"},
  r3:{t:"Solo Stack",xp:80,topic:"one-person company with 10 AI agents"},
  r4:{t:"Crazy Mode",xp:100,topic:"agent swarms, self-improving agents, digital twins"},
  r5:{t:"Final Boss",xp:200,topic:"capstone: 10+ agent autonomous company"},
};

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stats, loseHeart, completeLesson } = useGamification();
  const [currentStep, setCurrentStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"learning" | "complete">("learning");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const lesson = id ? ALL_LESSONS[id] : null;
  const content = id && LESSON_CONTENT[id]
    ? LESSON_CONTENT[id]
    : id && lesson
      ? getDefaultContent(id, lesson.t, lesson.topic)
      : null;

  const totalSteps = content ? content.cards.length + content.quizzes.length : 0;
  const isQuizStep = content ? currentStep >= content.cards.length : false;
  const quizIndex = content ? currentStep - content.cards.length : 0;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleCardNext = () => {
    SFX.tap();
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleLessonComplete();
    }
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount(c => c + 1);
    } else {
      loseHeart();
    }
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleLessonComplete();
      }
    }, 300);
  };

  const handleLessonComplete = () => {
    clearInterval(timerRef.current);
    SFX.xp();
    if (id && lesson) {
      const totalQ = content?.quizzes.length || 0;
      const isPerfect = totalQ > 0 && correctCount === totalQ;
      completeLesson(id, lesson.xp, isPerfect);
    }
    setPhase("complete");
  };

  if (!lesson || !content) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Agni expression="sad" size={100} speech="Lesson not found 😢" />
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
            {/* Close button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/courses")}
              className="w-8 h-8 rounded-xl bg-card border border-border/40 flex items-center justify-center"
            >
              <X size={16} className="text-muted-foreground" />
            </motion.button>

            {/* Progress bar */}
            <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-agni-green rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-1">
              <Heart size={14} className="text-agni-pink fill-agni-pink" />
              <span className="text-xs font-black text-agni-pink">{stats.hearts}</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-muted-foreground">
              {isQuizStep ? "QUIZ" : "LESSON"} {currentStep + 1}/{totalSteps}
            </span>
            <span className="text-[9px] font-black text-agni-green flex items-center gap-1">
              <Zap size={10} /> {lesson.xp} XP
            </span>
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
                totalQuizzes={content.quizzes.length}
                timeSpent={timer}
                onContinue={() => navigate("/courses")}
              />
            ) : isQuizStep ? (
              <QuizCard
                key={`quiz-${quizIndex}`}
                quiz={content.quizzes[quizIndex]}
                onAnswer={handleQuizAnswer}
              />
            ) : (
              <div key={`card-${currentStep}`} className="h-full flex flex-col">
                <LessonCard {...content.cards[currentStep]} />
                {/* Next button for concept cards */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.95, y: 2 }}
                  onClick={handleCardNext}
                  className="mt-3 w-full py-3.5 bg-agni-green text-white font-black text-sm rounded-2xl shadow-btn-3d active:shadow-btn-3d-pressed active:translate-y-0.5"
                >
                  {currentStep < content.cards.length - 1 ? "Continue" : "Start Quiz 🧠"}
                </motion.button>
              </div>
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
              <Agni expression="sad" size={70} speech="Out of hearts! 💔" />
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
