import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Timer, Brain, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";
import { getActiveModelLabel, getAIConfig } from "@/lib/aiConfig";
import { useGamification } from "@/hooks/useGamification";
import { getPersona } from "@/lib/neuralOS";
import { getTeachingLabel, getUniverseVibe, getQuizDifficultyPrompt } from "@/lib/teachingConfig";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";
import QuizCard from "@/components/lesson/QuizCard";
import type { QuizQuestion } from "@/components/lesson/QuizCard";
import LessonComplete from "@/components/lesson/LessonComplete";
import Agni from "@/components/Agni";
import { SFX } from "@/lib/sounds";
import ContentRenderer from "@/components/chat/ContentRenderer";
import SmartInputBar from "@/components/chat/SmartInputBar";

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

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseSuggestions(text: string): { clean: string; suggestions: string[] } {
  const match = text.match(/\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s);
  if (!match) return { clean: text, suggestions: [] };
  const clean = text.replace(/\[SUGGESTIONS\].*?\[\/SUGGESTIONS\]/s, "").trim();
  const suggestions = match[1].split("|").map(s => s.trim()).filter(Boolean).slice(0, 3);
  return { clean, suggestions };
}

type Phase = "chat" | "generating" | "quiz" | "complete";

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loseHeart, completeLesson } = useGamification();
  const [phase, setPhase] = useState<Phase>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState(getCurrentScopedStorage().get<string>("teaching_mode", "engineer"));
  const [exchangeCount, setExchangeCount] = useState(0);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showQuizConfirm, setShowQuizConfirm] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const lesson = id ? ALL_LESSONS[id] : null;
  const done: string[] = getCurrentScopedStorage().get<string[]>("done", []);
  const isDone = id ? done.includes(id) : false;
  const persona = useMemo(() => getPersona(), []);

  const progress = phase === "chat" ? 33 : phase === "generating" ? 50 : phase === "quiz" ? 66 + (quizIndex / Math.max(quizzes.length, 1)) * 34 : 100;

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Scroll on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-start teaching
  useEffect(() => {
    if (!lesson) return;
    const personaBits: string[] = [];
    if (persona.name) personaBits.push(`My name is ${persona.name}.`);
    if (persona.currentRole) personaBits.push(`I work as a ${persona.currentRole}.`);
    if (persona.shows?.length) personaBits.push(`I love watching ${persona.shows.join(", ")}.`);
    if (persona.sports?.length) personaBits.push(`I follow ${persona.sports.join(", ")}.`);
    if (persona.music?.length) personaBits.push(`I listen to ${persona.music.join(", ")}.`);
    const personaCtx = personaBits.length ? `\n\nAbout me: ${personaBits.join(" ")}` : "";

    sendToAI([{ role: "user", content: `Start teaching me about "${lesson.t}". Topic: ${lesson.topic}. Begin with an engaging introduction.${personaCtx}` }], true);
  }, []);

  const sendToAI = useCallback(async (chatMessages: Message[], isInitial = false) => {
    setIsLoading(true);
    setAiSuggestions([]);

    const aiConfig = getAIConfig();
    const identityLabel = getTeachingLabel("identity");
    const missionLabel = getTeachingLabel("mission");
    const vibeLabel = getTeachingLabel("vibe");
    const brainLabel = getTeachingLabel("brain");

    const body: any = {
      messages: chatMessages,
      teachingMode: activeMode,
      teachingContext: {
        identity: identityLabel ? `${identityLabel.label} — ${identityLabel.desc || ""}` : undefined,
        mission: missionLabel ? `${missionLabel.label} — ${missionLabel.desc || ""}` : undefined,
        vibe: vibeLabel ? `${vibeLabel.label} — ${vibeLabel.desc || ""}` : undefined,
        level: brainLabel ? `${brainLabel.label} — ${brainLabel.desc || ""}` : undefined,
        universeVibe: getUniverseVibe() || undefined,
      },
      lessonTitle: lesson?.t,
      lessonTopic: lesson?.topic,
      stream: true,
      model: aiConfig.builtinModel || "google/gemini-3-flash-preview",
    };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (resp.headers.get("content-type")?.includes("text/event-stream")) {
        let assistantText = "";
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantText += content;
                const { clean } = parseSuggestions(assistantText);
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: clean };
                  return updated;
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        const { clean: finalClean, suggestions } = parseSuggestions(assistantText);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: finalClean };
          return updated;
        });
        if (suggestions.length > 0) setAiSuggestions(suggestions);

        if (assistantText.includes("QUIZ_READY")) {
          const cleanText = finalClean.replace(/QUIZ_READY/g, "").trim();
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: cleanText };
            return updated;
          });
          setTimeout(() => setShowQuizConfirm(true), 2000);
        }
      } else {
        const data = await resp.json();
        const text = data.text || "I couldn't generate a response. Let's try again!";
        const { clean, suggestions } = parseSuggestions(text);
        setMessages(prev => [...prev, { role: "assistant", content: clean.replace(/QUIZ_READY/g, "").trim() }]);
        if (suggestions.length > 0) setAiSuggestions(suggestions);
        if (text.includes("QUIZ_READY")) setTimeout(() => setShowQuizConfirm(true), 2000);
      }

      if (!isInitial) setExchangeCount(c => c + 1);
      SFX.tap();
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("AI chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${error.message || "Something went wrong."}` }]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [activeMode, lesson]);

  const handleSend = (text?: string, hiddenPrompt?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const actualPrompt = hiddenPrompt || msg;
    // If hidden prompt exists, don't show user message — just send to AI
    if (hiddenPrompt) {
      setInput("");
      const updatedForAI = [...messages, { role: "user" as const, content: actualPrompt }];
      sendToAI(updatedForAI);
    } else {
      const userMsg: Message = { role: "user", content: msg };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      sendToAI([...messages, userMsg]);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    getCurrentScopedStorage().set("teaching_mode", mode);
    setMessages(prev => [...prev, { role: "assistant", content: `🔄 **Mode switched!** I'll adjust my teaching style.` }]);
  };

  // Quiz generation
  const generateQuizzes = async () => {
    setPhase("generating");
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ conversation: messages, lessonTitle: lesson?.t, lessonTopic: lesson?.topic, teachingMode: activeMode, difficultyPrompt: getQuizDifficultyPrompt(quizDifficulty) }),
      });
      if (!resp.ok) throw new Error("Quiz generation failed");
      const data = await resp.json();
      if (data.quizzes?.length > 0) {
        setQuizzes(data.quizzes);
        SFX.tap();
        setPhase("quiz");
      } else throw new Error("No questions");
    } catch {
      setQuizzes([{
        type: "mcq",
        question: `What is the main focus of "${lesson?.t}"?`,
        options: ["Basic programming", lesson?.topic.split(",")[0]?.trim() || "AI concepts", "Web development", "Data entry"],
        correctIndex: 1,
        explanation: `This lesson focuses on ${lesson?.topic.split(",")[0]?.trim()}.`,
      }]);
      setPhase("quiz");
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setShowQuizConfirm(false);
          setCountdown(null);
          generateQuizzes();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) setCorrectCount(c => c + 1);
    else loseHeart();
    setTimeout(() => {
      if (quizIndex < quizzes.length - 1) setQuizIndex(quizIndex + 1);
      else handleLessonComplete();
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
        <button onClick={() => navigate("/courses")} className="text-primary font-black text-sm">Back to courses</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Minimal header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => { clearInterval(timerRef.current); navigate("/courses"); }}
            className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center">
            <X size={18} className="text-foreground" />
          </button>

          <div className="text-center flex-1 px-3">
            <p className="font-black text-sm text-foreground truncate">{lesson.t}</p>
            <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
              <span className="font-bold">{lesson.xp} XP</span>
              <span className="flex items-center gap-0.5"><Timer size={9} /> {Math.floor(timer / 60)}m {timer % 60}s</span>
              <span className="flex items-center gap-0.5 text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                <Brain size={8} /> {getActiveModelLabel()}
              </span>
            </div>
          </div>

          {!isDone ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQuizConfirm(true)}
              className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              <CheckCircle2 size={12} /> Done
            </motion.button>
          ) : (
            <span className="text-primary text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> ✓</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted/20 mx-4 rounded-full overflow-hidden mb-1">
          <motion.div
            className={`h-full rounded-full ${phase === "chat" ? "bg-primary" : phase === "quiz" ? "bg-yellow-500" : "bg-green-500"}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {phase === "chat" && (
          <>
            <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {messages.map((msg, i) => {
                  const { clean } = parseSuggestions(msg.content);
                  return (
                    <ContentRenderer
                      key={i}
                      content={clean}
                      isUser={msg.role === "user"}
                      showActions={msg.role === "assistant" && !!clean}
                    />
                  );
                })}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex items-end gap-1.5">
                    <div className="w-7 h-7 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-[12px]">🤖</span>
                    </div>
                    <div className="bg-card border border-border/30 rounded-2xl rounded-bl-sm px-4 py-3">
                      <motion.div className="flex gap-1.5" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-agni-blue" />
                        <div className="w-2 h-2 rounded-full bg-agni-purple" />
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {phase === "generating" && (
          <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
            <Agni expression="thinking" size={100} speech="Generating your quiz... 🧠" />
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {phase === "quiz" && quizzes.length > 0 && (
          <div className="h-full overflow-y-auto px-4 py-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-4">
                <span className="text-xs font-bold text-muted-foreground">Question {quizIndex + 1} / {quizzes.length}</span>
              </div>
              <QuizCard key={quizIndex} quiz={quizzes[quizIndex]} onAnswer={handleQuizAnswer} />
            </div>
          </div>
        )}

        {phase === "complete" && (
          <LessonComplete
            lessonTitle={lesson.t}
            xpEarned={lesson.xp}
            correctCount={correctCount}
            totalQuizzes={quizzes.length}
            timeSpent={timer}
            onContinue={() => navigate("/courses")}
          />
        )}
      </div>

      {/* Smart Input Bar — only in chat phase */}
      {phase === "chat" && (
        <div className="sticky bottom-0">
          <SmartInputBar
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onStop={handleStop}
            isLoading={isLoading}
            isLearnTab={true}
            suggestions={!isLoading ? aiSuggestions : []}
            onSuggestionClick={(s) => handleSend(s)}
            placeholder="Ask AGNI anything..."
            accentColor="#58CC02"
            lessonTitle={lesson.t}
            exchangeCount={exchangeCount}
            onQuizReady={(difficulty) => { setQuizDifficulty(difficulty || "medium"); setShowQuizConfirm(true); }}
            onModeChange={handleModeChange}
            activeMode={activeMode}
          />
        </div>
      )}

      {/* Quiz Confirmation Dialog */}
      <AnimatePresence>
        {showQuizConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full border border-border shadow-2xl text-center"
            >
              {countdown !== null ? (
                <div className="flex flex-col items-center gap-4">
                  <Agni expression="happy" size={80} speech="Here we go! 🔥" />
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                      <motion.circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={283} initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 283 }}
                        transition={{ duration: 2.4, ease: "linear" }} />
                    </svg>
                    <motion.span key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-black text-primary">{countdown}</motion.span>
                  </div>
                </div>
              ) : (
                <>
                  <Agni expression="excited" size={80} speech="Ready for the quiz? 🧠" />
                  <h3 className="text-lg font-black text-foreground mt-3">Time for the Quiz!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Test what you've learned about <strong>{lesson.t}</strong></p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setShowQuizConfirm(false)}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm text-muted-foreground bg-muted border border-border">
                      Keep Learning
                    </button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={startCountdown}
                      className="flex-1 py-3 rounded-2xl font-black text-sm text-primary-foreground bg-primary shadow-[0_3px_0_0_hsl(var(--primary)/0.7)]">
                      ⚡ Let's Go!
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetailPage;
