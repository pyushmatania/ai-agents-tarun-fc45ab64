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
  f1:{t:"What is an AI Agent?",xp:50,topic:"what AI agents are — Perceive-Reason-Act-Learn loop, how they differ from chatbots, ReAct pattern, core components: LLM + Tools + Memory + Planning + Autonomy Loop"},
  f2:{t:"LLMs as the Brain",xp:50,topic:"how LLMs (GPT-4o, Claude, Gemini, Llama, Mistral) serve as agent reasoning engines, context windows as working memory, how to choose the right model"},
  f3:{t:"Tools & Functions",xp:60,topic:"how tools give agents the ability to ACT in the real world, function calling mechanics, how the LLM decides when to call a tool and what arguments to pass"},
  f4:{t:"Memory & RAG",xp:60,topic:"agent memory systems: short-term (conversation), long-term (vector databases like Pinecone, ChromaDB), episodic memory, and RAG (Retrieval Augmented Generation)"},
  f5:{t:"Planning & Reasoning",xp:70,topic:"how agents plan: Chain-of-Thought, Tree-of-Thought, ReAct pattern, task decomposition, and why planning separates smart agents from dumb ones"},
  f6:{t:"Build: Research Agent",xp:100,topic:"step-by-step building a Python research agent that searches the web, summarizes articles, and writes briefings using an LLM API + search tool + file writer"},
  w1:{t:"LangGraph",xp:70,topic:"LangGraph directed graph workflows, checkpointing, time-travel debugging, LangSmith observability, 47M+ PyPI downloads"},
  w2:{t:"CrewAI",xp:60,topic:"CrewAI role-based agent teams: Role+Backstory+Goal pattern, Crews and Flows architecture, prototyping in 20 lines of code"},
  w3:{t:"AutoGen & SDKs",xp:70,topic:"Microsoft AutoGen conversational debate, OpenAI Agents SDK with handoffs, Google ADK with A2A protocol for cross-framework agent interoperability"},
  w4:{t:"MCP Protocol",xp:80,topic:"Model Context Protocol by Anthropic — the USB-C of AI, how MCP servers connect LLMs to tools, 12000+ servers, building and using MCP servers"},
  w5:{t:"MetaGPT & More",xp:60,topic:"MetaGPT multi-agent software company with SOPs, OpenAgents with native MCP + A2A, n8n no-code agents"},
  w6:{t:"Build: FW Battle",xp:120,topic:"building the same research agent in CrewAI, LangGraph, and AutoGen, then comparing lines of code, speed, quality, cost, developer experience"},
  m1:{t:"Communication",xp:70,topic:"how agents communicate: Shared State, Message Passing, Event-Driven pub/sub, Hierarchical delegation patterns"},
  m2:{t:"AI Organization",xp:80,topic:"designing a multi-agent org: CEO for strategy, CMO for marketing, CTO for engineering, CFO for finance, Sales, HR, Legal, Ops agents"},
  m3:{t:"Orchestration",xp:80,topic:"Sequential, Parallel, Hierarchical, Consensus (voting), Competitive orchestration patterns and when to use each"},
  m4:{t:"Cost & Safety",xp:70,topic:"managing LLM costs in multi-agent systems (4 agents x 5 rounds = 20+ calls), tiered models, circuit breakers, guardrails, budget caps"},
  m5:{t:"Build: AI Startup",xp:150,topic:"building a 6-agent startup team using CrewAI that takes a market question and produces a complete business package"},
  r1:{t:"Enterprise 2026",xp:70,topic:"production AI agents: Salesforce Agentforce (18.5K deals), Microsoft Copilot (15M seats), Gartner prediction 40% enterprise apps embed agents by 2026"},
  r2:{t:"Semiconductor AI",xp:90,topic:"AI agents for HCL-Foxconn OSAT plant: yield optimization, supply chain risk, equipment maintenance prediction, quality documentation, patent monitoring"},
  r3:{t:"Solo Stack",xp:80,topic:"building a one-person company with 10 AI agents: content pipeline, sales outreach, competitor intelligence, bookkeeping, social media"},
  r4:{t:"Crazy Mode",xp:100,topic:"agent swarms, self-improving agents, digital twins, Manus ($2B Meta acquisition), agent-to-agent economies, agentic SOC, intent-based computing"},
  r5:{t:"Final Boss",xp:200,topic:"capstone: 10+ agent autonomous company producing market research, business plan, landing page, social posts, financial model, investor emails in parallel"},
};

const MODES = [
  {id:"class5",label:"🏏 Simple",prompt:"Explain like I'm 10. Cricket analogies, everyday Indian examples. No jargon."},
  {id:"engineer",label:"🔧 Engineer",prompt:"Full technical depth with Python code and architecture."},
  {id:"founder",label:"💼 Founder",prompt:"Business lens. ROI, moats. Connect to HCL semiconductor."},
  {id:"hacker",label:"⚡ Hacker",prompt:"Speed-run. Copy-paste code. Ship in 2 hours."},
  {id:"crazy",label:"🤯 Crazy",prompt:"Wildest bleeding-edge stuff. Science fiction."},
  {id:"first",label:"🧠 Socratic",prompt:"Ask ME questions. First principles. Don't give answers directly."},
  {id:"semi",label:"🏭 Semi",prompt:"Through semiconductor manufacturing / HCL-Foxconn OSAT lens."},
];

const SYS_BASE = "You are AGNI, an elite AI Agents tutor. Be passionate, use Indian examples (HCL, Tata, Flipkart, cricket, Bollywood). Keep under 250 words. End with a question to check understanding.";

type Msg = { role: "user" | "assistant"; text: string };

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("engineer");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [smartOptions, setSmartOptions] = useState(generateSmartOptions(""));
  const chatEnd = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

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
    if (!lesson) return;
    setNote(JSON.parse(localStorage.getItem("adojo_notes") || "{}")[id!] || "");
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

    try {
      const text = await callAI(apiMsgs);
      setMsgs([...newMsgs, { role: "assistant", text: text || "Could you try asking again?" }]);
    } catch (err: any) {
      setMsgs([...newMsgs, { role: "assistant", text: `Connection issue: ${err.message}\n\nPlease try again.` }]);
    }
    setLoading(false);
  };

  const markDone = () => {
    if (!id || isDone) return;
    const newDone = [...done, id];
    localStorage.setItem("adojo_done", JSON.stringify(newDone));
    const xp = parseInt(localStorage.getItem("adojo_xp") || "0") + (lesson?.xp || 0);
    localStorage.setItem("adojo_xp", String(xp));
    clearInterval(timerRef.current);
    toast.success(`+${lesson?.xp} XP earned! 🎉`);
    navigate("/courses");
  };

  const saveNote = () => {
    const notes = JSON.parse(localStorage.getItem("adojo_notes") || "{}");
    notes[id!] = note;
    localStorage.setItem("adojo_notes", JSON.stringify(notes));
    toast.success("Note saved!");
  };

  if (!lesson) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <p className="text-foreground font-bold">Lesson not found</p>
      <button onClick={() => navigate("/courses")} className="text-primary font-semibold">Back to courses</button>
    </div>
  );

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

      {/* Notes */}
      {showNote && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 border-b border-border shrink-0">
          <div className="max-w-md mx-auto">
            <textarea value={note} onChange={e => setNote(e.target.value)} onBlur={saveNote} placeholder="Your notes for this lesson..." rows={3}
              className="w-full border border-yellow-200 dark:border-yellow-800 rounded-xl p-2.5 text-sm outline-none resize-none bg-transparent text-foreground" />
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="bg-muted/50 px-4 py-2 border-b border-border shrink-0 overflow-x-auto">
        <div className="max-w-md mx-auto flex gap-1.5 items-center">
          <span className="text-xs text-muted-foreground shrink-0">Mode:</span>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                mode === m.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground"
              }`}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="max-w-md mx-auto space-y-3">
          {msgs.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                  : "bg-card text-foreground rounded-2xl rounded-bl-sm border border-border shadow-sm"
              }`}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-5 py-3 flex gap-1.5 items-center shadow-sm">
                {[0, 1, 2].map(i => (<span key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />))}
              </div>
            </div>
          )}
          <div ref={chatEnd} />
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
    </PageTransition>
  );
};

export default CourseDetailPage;
