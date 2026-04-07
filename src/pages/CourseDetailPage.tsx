import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { ChevronLeft, CheckCircle2, Send, StickyNote, Timer, Brain as BrainIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig, getActiveModelLabel } from "@/lib/aiConfig";
import { Brain, Sparkles } from "lucide-react";
import { buildPersonalizedPrompt, generateSmartOptions, buildOpeningPrompt, hasPersona, detectComprehension, updateComprehension, buildRemediationPrompt } from "@/lib/neuralOS";
import MascotProfileModal from "@/components/MascotProfileModal";
import PracticalQuizModal from "@/components/PracticalQuizModal";
import BotIllustration from "@/components/illustrations/BotIllustration";

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

const SYS_BASE = "You are AGNI, an elite AI Agents tutor. Be passionate, use Indian examples (HCL, Tata, Flipkart, cricket, Bollywood). Keep under 250 words. End with a question to check understanding.";

type Msg = { role: "user" | "assistant"; text: string };

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stats, loseHeart, completeLesson } = useGamification();
  const [phase, setPhase] = useState<Phase>("chat");
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [smartOptions, setSmartOptions] = useState(generateSmartOptions(""));
  const chatEnd = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const teachingMode = localStorage.getItem("teaching_mode") || "engineer";
  const lesson = id ? ALL_LESSONS[id] : null;
  const done: string[] = JSON.parse(localStorage.getItem("adojo_done") || "[]");
  const isDone = id ? done.includes(id) : false;
  const personaActive = hasPersona();

  const callAI = async (apiMessages: { role: string; content: string }[]) => {
    const config = getAIConfig();
    // 🧠 NEURAL OS — inject personalized system prompt
    const personalizedSys = buildPersonalizedPrompt(SYS_BASE);
    const body: any = {
      system: personalizedSys,
      messages: apiMessages,
    };
    if (config.mode === "byok" && config.byokApiKey) {
      body.customApiKey = config.byokApiKey;
      body.provider = config.byokProvider;
      body.model = config.byokModel;
    } else {
      body.model = config.builtinModel;
    }
    const { data, error } = await supabase.functions.invoke("ai-tutor", { body });
    if (error) throw new Error(error.message);
    return data?.text || "";
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);

    // 🌱 UTSARGA — refresh smart options based on persona + lesson
    setSmartOptions(generateSmartOptions(lesson.topic));

    setMsgs([{ role: "assistant", text: "⏳ Loading lesson..." }]);
    setLoading(true);
    const mObj = MODES.find(m => m.id === mode) || MODES[1];

    // 🎬 VIDYA — personalized opening prompt
    const openingPrompt = buildOpeningPrompt(lesson.topic, mObj.prompt);

    callAI([{ role: "user", content: openingPrompt }])
    .then(text => {
      setMsgs([{ role: "assistant", text: text || `Welcome to **${lesson.t}**!\n\nThis covers: ${lesson.topic}\n\nSend me a message to start learning!` }]);
      setLoading(false);
    })
    .catch(() => {
      setMsgs([{ role: "assistant", text: `Welcome to **${lesson.t}**!\n\nThis covers: ${lesson.topic}\n\nThe AI tutor is connecting... Try sending a message below to start!\n\nWhat would you like to learn?` }]);
      setLoading(false);
    });

    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (chatEnd.current) chatEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMsg = async (custom?: string) => {
    const userMsg = custom || inp.trim();
    if (!userMsg || loading) return;
    setInp("");
    const newMsgs: Msg[] = [...msgs, { role: "user", text: userMsg }];
    setMsgs(newMsgs);
    setLoading(true);

    // 🧠 NEURAL OS — detect comprehension signal from the user's message
    const signal = detectComprehension(userMsg);
    if (signal !== "neutral") {
      updateComprehension(signal);
      // Refresh smart options so confused users see "even simpler" etc
      if (lesson) setSmartOptions(generateSmartOptions(lesson.topic));
    }

    const mObj = MODES.find(m => m.id === mode) || MODES[1];
    const apiMsgs = newMsgs.slice(-6).map(m => ({ role: m.role, content: m.text }));

    // 🆕 If confused: inject remediation directive
    if (signal === "confused") {
      apiMsgs.push({
        role: "user",
        content: `[NEURAL OS ALERT: Student is confused. Take them BACK TO BASICS. Use the simplest possible analogy. Switch to a totally different angle. Use one of their interests if available. Be kind and patient. End with: "Did that land better? Want me to break it down even more?"]`
      });
    } else {
      apiMsgs.push({ role: "user", content: `[Context: ${lesson!.topic}. Style: ${mObj.prompt}. Under 250 words. End with a comprehension check question like "does that click?" or "1-5 how clear is this?"]` });
    }

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
    <PageTransition>
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-3 border-b border-border shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => { clearInterval(timerRef.current); navigate("/courses"); }} className="flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="text-center">
            <div className="font-bold text-sm text-foreground truncate max-w-[180px]">{lesson.t}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
              <span>{lesson.xp} XP</span>
              <span className="flex items-center gap-0.5"><Timer size={10} /> {Math.floor(timer/60)}m {timer%60}s</span>
              <span className="flex items-center gap-0.5 text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                <Brain size={8} /> {getActiveModelLabel()}
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* 🧠 Tap mascot to open profile */}
            <button
              onClick={() => setShowProfile(true)}
              className="relative w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
              title="My Persona"
            >
              <BotIllustration size={28} />
              {personaActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
              )}
            </button>
            {/* 🎯 Practical Quiz */}
            <button
              onClick={() => setShowQuiz(true)}
              className="w-9 h-9 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center hover:scale-105 transition-transform"
              title="Practical Quiz"
            >
              <BrainIcon size={14} className="text-purple-500" />
            </button>
            <button onClick={() => setShowNote(!showNote)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <StickyNote size={14} className="text-foreground" />
            </button>
            {!isDone ? (
              <button onClick={markDone} className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> Done
              </button>
            ) : (
              <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Done</span>
            )}
          </div>
        </div>
      </div>

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

      {/* 🌱 UTSARGA — Smart Options (dynamic, persona-aware) */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border shrink-0">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={10} className="text-primary" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              {personaActive ? "Smart options for you" : "Quick actions"}
            </span>
            {!personaActive && (
              <button
                onClick={() => setShowProfile(true)}
                className="ml-auto text-[9px] text-primary font-bold underline"
              >
                Personalize →
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
            {smartOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => sendMsg(opt.prompt)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-1"
              >
                <span>{opt.emoji}</span>
                <span className="font-semibold text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-card border-t border-border shrink-0">
        <div className="max-w-md mx-auto flex gap-2">
          <input value={inp} onChange={e => setInp(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }}}
            placeholder={`Ask about ${lesson.t}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-border text-sm outline-none bg-muted/50 text-foreground focus:ring-2 focus:ring-ring" />
          <button onClick={() => sendMsg()} disabled={loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground shrink-0 transition-all ${loading ? "bg-muted" : "bg-primary hover:scale-105"}`}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* 🧠 Neural OS Profile Modal */}
      <MascotProfileModal
        open={showProfile}
        onClose={() => {
          setShowProfile(false);
          // Refresh smart options when persona changes
          if (lesson) setSmartOptions(generateSmartOptions(lesson.topic));
        }}
      />

      {/* 🎯 Practical Quiz Modal */}
      {lesson && (
        <PracticalQuizModal
          open={showQuiz}
          onClose={() => setShowQuiz(false)}
          lessonTopic={lesson.topic}
          lessonInfo={lesson.topic}
          lessonTitle={lesson.t}
          onComplete={(score, total) => {
            const earned = Math.round((lesson.xp || 50) * (score / total));
            const xp = parseInt(localStorage.getItem("adojo_xp") || "0") + earned;
            localStorage.setItem("adojo_xp", String(xp));
            toast.success(`+${earned} XP — ${score}/${total} correct! 🎉`);
          }}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
