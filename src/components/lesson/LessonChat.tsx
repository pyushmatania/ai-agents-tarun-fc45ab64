import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Zap, X, Brain, Flame, ChevronRight } from "lucide-react";
import Agni from "@/components/Agni";
import type { AgniExpression } from "@/components/Agni";
import { SFX } from "@/lib/sounds";
import { getAIConfig } from "@/lib/aiConfig";
import { getPersona } from "@/lib/neuralOS";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export type { Message as ChatMessage };

interface LessonChatProps {
  lessonTitle: string;
  lessonTopic: string;
  teachingMode: string;
  onQuizReady: (conversation: Message[]) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const MODES = [
  { key: "class5", label: "Simple", emoji: "🚀" },
  { key: "engineer", label: "Engineer", emoji: "🔧" },
  { key: "founder", label: "Founder", emoji: "💼" },
  { key: "hacker", label: "Hacker", emoji: "⚡" },
  { key: "crazy", label: "Crazy", emoji: "🤯" },
  { key: "semiconductor", label: "Semi", emoji: "🏭" },
];

interface PowerUp {
  id: string;
  label: string;
  prompt: string;
  emoji: string;
  color: string;
  shadowColor: string;
  soundColor: string;
}

const POWERUPS: Record<string, PowerUp[]> = {
  class5: [
    { id: "s1", label: "Simpler!", emoji: "🧸", prompt: "Explain that in even simpler terms, like I'm 5 years old.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "s2", label: "Fun Example", emoji: "🎮", prompt: "Give me a fun, real-world example of this!", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
    { id: "s3", label: "Story Time", emoji: "📖", prompt: "Tell me a short story to explain this concept.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  engineer: [
    { id: "e1", label: "Show Code", emoji: "💻", prompt: "Show me a code example for this concept.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
    { id: "e2", label: "Real Example", emoji: "🏗️", prompt: "Give me a real-world production example.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "e3", label: "Deep Dive", emoji: "🔬", prompt: "Go deeper into the technical details.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  founder: [
    { id: "f1", label: "Business Case", emoji: "💰", prompt: "What's the business case / ROI for this?", color: "bg-[hsl(46,100%,49%)]", shadowColor: "shadow-[0_4px_0_0_hsl(44,100%,38%)]", soundColor: "gold" },
    { id: "f2", label: "Build What?", emoji: "🚀", prompt: "What products or startups could I build with this?", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "f3", label: "Strategy", emoji: "♟️", prompt: "Go deeper into the strategic implications.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  hacker: [
    { id: "h1", label: "Just Code", emoji: "⌨️", prompt: "Just show me the code, skip the theory.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "h2", label: "Quick Start", emoji: "🏃", prompt: "How do I get started with this RIGHT NOW?", color: "bg-[hsl(33,100%,50%)]", shadowColor: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", soundColor: "orange" },
    { id: "h3", label: "Advanced", emoji: "🧠", prompt: "Go deeper, show me advanced patterns.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  crazy: [
    { id: "c1", label: "Mind Blow", emoji: "🤯", prompt: "Give me the most mind-blowing implication of this!", color: "bg-[hsl(323,100%,76%)]", shadowColor: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", soundColor: "pink" },
    { id: "c2", label: "Sci-Fi Mode", emoji: "🌌", prompt: "Paint a wild sci-fi scenario with this tech.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
    { id: "c3", label: "Rabbit Hole", emoji: "🕳️", prompt: "Go even deeper into the rabbit hole.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
  ],
  semiconductor: [
    { id: "sc1", label: "HCL Link", emoji: "🏭", prompt: "How does this connect to semiconductor manufacturing / HCL?", color: "bg-[hsl(33,100%,50%)]", shadowColor: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", soundColor: "orange" },
    { id: "sc2", label: "Fab Example", emoji: "⚙️", prompt: "Give me a specific fab/manufacturing example.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
    { id: "sc3", label: "Technical", emoji: "🔬", prompt: "Go deeper into the technical details.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
};

// Neural OS powered suggestions based on persona
function getNeuralSuggestions(): PowerUp[] {
  const p = getPersona();
  const extras: PowerUp[] = [];
  if (p.shows && p.shows.length > 0) {
    extras.push({ id: "nos-shows", label: `${p.shows[0]} analogy`, emoji: "🎬", prompt: `Explain this using an analogy from "${p.shows[0]}" (the show/movie I love).`, color: "bg-[hsl(323,100%,76%)]", shadowColor: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", soundColor: "pink" });
  }
  if (p.sports && p.sports.length > 0) {
    extras.push({ id: "nos-sports", label: `${p.sports[0]} style`, emoji: "⚽", prompt: `Explain this using a sports analogy involving "${p.sports[0]}".`, color: "bg-[hsl(46,100%,49%)]", shadowColor: "shadow-[0_4px_0_0_hsl(44,100%,38%)]", soundColor: "gold" });
  }
  if (p.gaming && p.gaming.length > 0) {
    extras.push({ id: "nos-gaming", label: `${p.gaming[0]} metaphor`, emoji: "🎮", prompt: `Explain this like a game mechanic from "${p.gaming[0]}".`, color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" });
  }
  if (p.currentRole) {
    extras.push({ id: "nos-role", label: "My Job", emoji: "💼", prompt: `How would this apply to my work as a ${p.currentRole}? Give me a practical example I can use tomorrow.`, color: "bg-[hsl(33,100%,50%)]", shadowColor: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", soundColor: "orange" });
  }
  return extras;
}

function parseSuggestions(text: string): { clean: string; suggestions: string[] } {
  const match = text.match(/\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s);
  if (!match) return { clean: text, suggestions: [] };
  const clean = text.replace(/\[SUGGESTIONS\].*?\[\/SUGGESTIONS\]/s, "").trim();
  const suggestions = match[1].split("|").map(s => s.trim()).filter(Boolean).slice(0, 3);
  return { clean, suggestions };
}

const LessonChat = ({ lessonTitle, lessonTopic, teachingMode: initialMode, onQuizReady }: LessonChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [activeMode, setActiveMode] = useState(initialMode);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agniExpr: AgniExpression = isLoading ? "thinking" : messages.length === 0 ? "teaching" : "happy";
  const basePowerups = POWERUPS[activeMode] || POWERUPS.engineer;
  const neuralPowerups = getNeuralSuggestions();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    sendToAI([{ role: "user", content: `Start teaching me about "${lessonTitle}". Topic: ${lessonTopic}. Begin with an engaging introduction.` }], true);
  }, []);

  const sendToAI = useCallback(async (chatMessages: Message[], isInitial = false) => {
    setIsLoading(true);
    setIsStreaming(true);
    setAiSuggestions([]);

    const aiConfig = getAIConfig();
    const body: any = {
      messages: chatMessages,
      teachingMode: activeMode,
      lessonTitle,
      lessonTopic,
      stream: true,
    };

    if (aiConfig.mode === "byok" && aiConfig.byokApiKey) {
      body.customApiKey = aiConfig.byokApiKey;
      body.provider = aiConfig.byokProvider;
      body.model = aiConfig.byokModel;
      body.stream = false;
    } else {
      body.model = aiConfig.builtinModel || "google/gemini-3-flash-preview";
    }

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (body.stream && resp.headers.get("content-type")?.includes("text/event-stream")) {
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
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
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
            setTimeout(() => onQuizReady(updated), 2000);
            return updated;
          });
        }
      } else {
        const data = await resp.json();
        const text = data.text || "I couldn't generate a response. Let's try again!";
        const { clean, suggestions } = parseSuggestions(text);
        const cleanText = clean.replace(/QUIZ_READY/g, "").trim();
        setMessages(prev => [...prev, { role: "assistant", content: cleanText }]);
        if (suggestions.length > 0) setAiSuggestions(suggestions);
        if (text.includes("QUIZ_READY")) {
          const allMsgs = [...messages, { role: "assistant" as const, content: cleanText }];
          setTimeout(() => onQuizReady(allMsgs), 2000);
        }
      }

      if (!isInitial) setExchangeCount(c => c + 1);
      SFX.tap();
    } catch (error: any) {
      console.error("AI chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${error.message || "Something went wrong. Try again!"}` }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [activeMode, lessonTitle, lessonTopic, onQuizReady]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Message = { role: "user", content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    sendToAI(updatedMessages);
  };

  const handlePowerUpPress = (pu: PowerUp) => {
    SFX.powerup(pu.soundColor);
    setPressedBtn(pu.id);
    setTimeout(() => { setPressedBtn(null); handleSend(pu.prompt); }, 150);
  };

  const handleModeChange = (mode: string) => {
    SFX.tap();
    setActiveMode(mode);
    localStorage.setItem("teaching_mode", mode);
  };

  const handleSkipToQuiz = () => { SFX.tap(); onQuizReady(messages); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="shrink-0 mb-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {MODES.map((m) => (
            <motion.button key={m.key} whileTap={{ scale: 0.92 }} onClick={() => handleModeChange(m.key)}
              className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-all border ${
                activeMode === m.key ? "bg-[hsl(var(--agni-green)/0.15)] text-agni-green border-[hsl(var(--agni-green)/0.5)]" : "bg-card text-muted-foreground border-border/30"
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat header with Neural OS badge */}
      <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-xl bg-card border border-border/30">
        <div className="relative">
          <Agni expression={agniExpr} size={36} animate />
          <motion.div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-agni-green rounded-full border-2 border-card"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-black text-agni-green">AGNI is teaching</p>
            {getPersona().completedAt && (
              <span className="text-[7px] font-black text-agni-purple bg-agni-purple/10 px-1.5 py-0.5 rounded-full">Neural OS</span>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground font-semibold truncate">{lessonTitle}</p>
        </div>
        {exchangeCount >= 2 && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.9 }}
            onClick={handleSkipToQuiz}
            className="text-[9px] font-black text-white bg-agni-green px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_3px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[2px] transition-all"
          >
            <Zap size={10} /> QUIZ
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 px-1 pb-2 scrollbar-none">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className={`flex items-end gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-card border-2 border-agni-green/30 flex items-center justify-center mb-0.5">
                  <span className="text-[12px]">🤖</span>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-[1.6] font-semibold ${
                msg.role === "user"
                  ? "bg-agni-green text-white rounded-br-sm shadow-[0_2px_0_0_hsl(100,100%,31%)]"
                  : "bg-card border border-border/30 text-foreground rounded-bl-sm"
              }`}>
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                    {line.startsWith("**") ? (
                      <span className="font-black text-agni-gold">{line.replace(/\*\*/g, "")}</span>
                    ) : line.startsWith("- ") || line.startsWith("• ") ? (
                      <span className="flex items-start gap-1.5 pl-1">
                        <span className="text-agni-green text-[10px] mt-0.5">●</span>
                        <span>{line.replace(/^[-•]\s/, "")}</span>
                      </span>
                    ) : line.startsWith("`") ? (
                      <code className="bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded text-[11px] font-mono text-agni-blue border border-agni-blue/20">
                        {line.replace(/`/g, "")}
                      </code>
                    ) : line}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-1.5">
            <div className="w-7 h-7 rounded-full bg-card border-2 border-agni-green/30 flex items-center justify-center">
              <span className="text-[12px]">🤖</span>
            </div>
            <div className="bg-card border border-border/30 rounded-2xl rounded-bl-sm px-4 py-3">
              <motion.div className="flex gap-1.5" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <div className="w-2 h-2 rounded-full bg-agni-green" />
                <div className="w-2 h-2 rounded-full bg-agni-blue" />
                <div className="w-2 h-2 rounded-full bg-agni-purple" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* === UNIFIED ACTION BAR === */}
      <div className="shrink-0 pt-1 pb-0.5">
        {/* AI Suggestions — inline chips above power-ups */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-1.5">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-0.5">
                {aiSuggestions.map((suggestion, i) => (
                  <motion.button key={`ai-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.95 }} onClick={() => handleSend(suggestion)} disabled={isLoading}
                    className="shrink-0 text-[10px] font-bold text-agni-purple bg-agni-purple/10 border border-agni-purple/25 rounded-full px-3 py-1.5 disabled:opacity-40 flex items-center gap-1 hover:bg-agni-purple/20 transition-colors"
                  >
                    <Sparkles size={8} className="shrink-0" />
                    <span className="truncate max-w-[160px]">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combined Power-Ups Row with swipe hint */}
        {(() => {
          const powerRowRef = useRef<HTMLDivElement>(null);
          const [showSwipeHint, setShowSwipeHint] = useState(true);

          const handlePowerScroll = () => {
            const el = powerRowRef.current;
            if (el && el.scrollLeft > 20) setShowSwipeHint(false);
          };

          return (
            <div className="relative">
              <div ref={powerRowRef} onScroll={handlePowerScroll} className="flex gap-1.5 overflow-x-auto scrollbar-none px-0.5 pb-0.5 pr-8">
                {basePowerups.map((pu) => (
                  <motion.button key={pu.id} whileTap={{ scale: 0.93, y: 2 }} onClick={() => handlePowerUpPress(pu)} disabled={isLoading}
                    className={`shrink-0 rounded-xl px-3 py-2 ${pu.color} ${pressedBtn === pu.id ? "shadow-[0_1px_0_0_rgba(0,0,0,0.3)] translate-y-[3px]" : pu.shadowColor} transition-all disabled:opacity-40 flex items-center gap-1 min-w-fit`}
                  >
                    <span className="text-[12px]">{pu.emoji}</span>
                    <span className="text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">{pu.label}</span>
                  </motion.button>
                ))}

                {neuralPowerups.length > 0 && (
                  <div className="shrink-0 flex items-center px-0.5">
                    <div className="w-1 h-1 rounded-full bg-agni-purple/50" />
                  </div>
                )}

                {neuralPowerups.map((pu) => (
                  <motion.button key={pu.id} whileTap={{ scale: 0.93, y: 2 }} onClick={() => handlePowerUpPress(pu)} disabled={isLoading}
                    className={`shrink-0 rounded-xl px-3 py-2 bg-agni-purple/15 border border-agni-purple/30 ${pressedBtn === pu.id ? "translate-y-[2px] border-agni-purple/50" : ""} transition-all disabled:opacity-40 flex items-center gap-1 min-w-fit`}
                  >
                    <span className="text-[12px]">{pu.emoji}</span>
                    <span className="text-[9px] font-black text-agni-purple drop-shadow-none">{pu.label}</span>
                  </motion.button>
                ))}

                {exchangeCount >= 1 && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.93, y: 2 }}
                    onClick={handleSkipToQuiz} disabled={isLoading}
                    className="shrink-0 rounded-xl px-3 py-2 bg-agni-green shadow-[0_3px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[2px] transition-all disabled:opacity-40 flex items-center gap-1"
                  >
                    <span className="text-[12px]">⚡</span>
                    <span className="text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">Quiz Me!</span>
                  </motion.button>
                )}
              </div>

              {/* Swipe arrow hint */}
              <AnimatePresence>
                {showSwipeHint && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 top-0 bottom-0.5 flex items-center pointer-events-none"
                  >
                    <div className="w-8 h-full bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end pr-0.5">
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      >
                        <ChevronRight size={14} className="text-muted-foreground/60" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-1.5">
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AGNI anything..." disabled={isLoading}
          className="flex-1 bg-card border-2 border-border/30 rounded-2xl px-4 py-2.5 text-[12px] font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-green/50 transition-all disabled:opacity-50"
        />
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleSend()} disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-agni-green flex items-center justify-center shadow-[0_4px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[3px] transition-all disabled:opacity-30 disabled:shadow-none"
        >
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonChat;
