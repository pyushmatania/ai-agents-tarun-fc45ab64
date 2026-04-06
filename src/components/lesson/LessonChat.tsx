import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Zap, Shield, Flame, Star, Rocket, Brain, Wand2 } from "lucide-react";
import Agni from "@/components/Agni";
import type { AgniExpression } from "@/components/Agni";
import { SFX } from "@/lib/sounds";
import { getAIConfig } from "@/lib/aiConfig";

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

// Powerup-style icons for static chips
const POWERUP_ICONS = [Zap, Shield, Flame, Star, Rocket, Brain, Wand2, Sparkles];
const POWERUP_COLORS = [
  "from-agni-gold/20 to-agni-orange/10 border-agni-gold/40 text-agni-gold",
  "from-agni-blue/20 to-agni-purple/10 border-agni-blue/40 text-agni-blue",
  "from-agni-pink/20 to-agni-red/10 border-agni-pink/40 text-agni-pink",
  "from-agni-green/20 to-agni-green-light/10 border-agni-green/40 text-agni-green",
  "from-agni-purple/20 to-agni-blue/10 border-agni-purple/40 text-agni-purple",
  "from-agni-orange/20 to-agni-gold/10 border-agni-orange/40 text-agni-orange",
];

const QUICK_CHIPS: Record<string, { label: string; prompt: string }[]> = {
  class5: [
    { label: "Explain simpler", prompt: "Explain that in even simpler terms, like I'm 5 years old." },
    { label: "Fun example", prompt: "Give me a fun, real-world example of this!" },
    { label: "Tell a story", prompt: "Tell me a short story to explain this concept." },
  ],
  engineer: [
    { label: "Explain simpler", prompt: "Break this down more simply." },
    { label: "Give me code", prompt: "Show me a code example for this concept." },
    { label: "Real example", prompt: "Give me a real-world production example." },
  ],
  founder: [
    { label: "Business case", prompt: "What's the business case / ROI for this?" },
    { label: "What can I build?", prompt: "What products or startups could I build with this?" },
    { label: "Deep dive", prompt: "Go deeper into the strategic implications." },
  ],
  hacker: [
    { label: "Give me code", prompt: "Just show me the code, skip the theory." },
    { label: "Quick start", prompt: "How do I get started with this RIGHT NOW?" },
    { label: "Deep dive", prompt: "Go deeper, show me advanced patterns." },
  ],
  crazy: [
    { label: "Mind blow me", prompt: "Give me the most mind-blowing implication of this!" },
    { label: "Sci-fi scenario", prompt: "Paint a wild sci-fi scenario with this tech." },
    { label: "Deep dive", prompt: "Go even deeper into the rabbit hole." },
  ],
  semiconductor: [
    { label: "Connect to HCL", prompt: "How does this connect to semiconductor manufacturing / HCL?" },
    { label: "Fab example", prompt: "Give me a specific fab/manufacturing example." },
    { label: "Deep dive", prompt: "Go deeper into the technical details." },
  ],
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agniExpr: AgniExpression = isLoading ? "thinking" : messages.length === 0 ? "teaching" : "happy";
  const chips = QUICK_CHIPS[activeMode] || QUICK_CHIPS.engineer;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
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

        // Parse suggestions from final text
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

      if (!isInitial) {
        setExchangeCount(c => c + 1);
      }
      SFX.tap();
    } catch (error: any) {
      console.error("AI chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `⚠️ ${error.message || "Something went wrong. Try again!"}` },
      ]);
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

  const handleModeChange = (mode: string) => {
    SFX.tap();
    setActiveMode(mode);
    localStorage.setItem("teaching_mode", mode);
  };

  const handleSkipToQuiz = () => {
    SFX.tap();
    onQuizReady(messages);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Mode selector - scrollable pill bar */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[9px] font-black text-muted-foreground shrink-0 uppercase tracking-wider">Mode:</span>
          {MODES.map((m) => (
            <motion.button
              key={m.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleModeChange(m.key)}
              className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-all border ${
                activeMode === m.key
                  ? "bg-agni-green/15 text-agni-green border-agni-green/50 shadow-glow-green"
                  : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat header with glow */}
      <div className="flex items-center gap-2 mb-2 px-1 py-1.5 rounded-xl bg-gradient-to-r from-agni-green/5 to-transparent border border-agni-green/10">
        <div className="relative">
          <Agni expression={agniExpr} size={40} animate />
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-agni-green rounded-full border-2 border-background"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-agni-green flex items-center gap-1">
            <Sparkles size={10} className="text-agni-gold" /> AGNI is teaching
          </p>
          <p className="text-[9px] text-muted-foreground font-semibold truncate">{lessonTitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {exchangeCount >= 2 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkipToQuiz}
              className="text-[8px] font-black text-white bg-gradient-to-r from-agni-green to-agni-green-light px-2.5 py-1 rounded-full flex items-center gap-1 shadow-glow-green"
            >
              <Zap size={8} /> QUIZ →
            </motion.button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-1 pb-2 scrollbar-none"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 mr-1.5 mt-1">
                  <div className="w-6 h-6 rounded-full bg-agni-green/15 border border-agni-green/30 flex items-center justify-center">
                    <Brain size={12} className="text-agni-green" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed font-medium relative ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-agni-green to-agni-green-dark text-white rounded-br-sm shadow-glow-green"
                    : "bg-gradient-to-br from-card to-card-elevated border border-border/40 text-foreground rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-agni-green/40" />
                )}
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                    {line.startsWith("**") ? (
                      <span className="font-black">{line.replace(/\*\*/g, "")}</span>
                    ) : line.startsWith("- ") || line.startsWith("• ") ? (
                      <span className="pl-2 flex items-start gap-1">
                        <span className="text-agni-green mt-0.5">▸</span>
                        <span>{line.replace(/^[-•]\s/, "")}</span>
                      </span>
                    ) : line.startsWith("`") ? (
                      <code className="bg-muted/40 px-1.5 py-0.5 rounded text-[11px] font-mono text-agni-blue">
                        {line.replace(/`/g, "")}
                      </code>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="shrink-0 mr-1.5 mt-1">
              <div className="w-6 h-6 rounded-full bg-agni-green/15 border border-agni-green/30 flex items-center justify-center">
                <Brain size={12} className="text-agni-green" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-card to-card-elevated border border-border/40 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <div className="w-2 h-2 rounded-full bg-agni-green" />
                <div className="w-2 h-2 rounded-full bg-agni-blue" />
                <div className="w-2 h-2 rounded-full bg-agni-gold" />
              </motion.div>
              <span className="text-[11px] font-bold text-muted-foreground">AGNI thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Powerup-style action bar */}
      <div className="shrink-0 py-1.5 space-y-1.5">
        {/* AI Predictive Suggestions - appear after AI responds */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-1.5 px-1">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wand2 size={10} className="text-agni-purple" />
                </motion.div>
                <span className="text-[8px] font-black text-agni-purple uppercase tracking-widest">AI Suggests</span>
                <div className="flex-1 h-px bg-gradient-to-r from-agni-purple/30 to-transparent" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {aiSuggestions.map((suggestion, i) => {
                  const colorSet = POWERUP_COLORS[(i + 3) % POWERUP_COLORS.length];
                  return (
                    <motion.button
                      key={`ai-${i}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => handleSend(suggestion)}
                      disabled={isLoading}
                      className={`shrink-0 text-[10px] font-bold bg-gradient-to-br ${colorSet} border rounded-xl px-3 py-2 transition-all disabled:opacity-40 flex items-center gap-1.5 relative overflow-hidden`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <Sparkles size={10} className="shrink-0" />
                      <span className="relative">{suggestion}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static powerup chips - scrollable */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {chips.map((chip, i) => {
            const Icon = POWERUP_ICONS[i % POWERUP_ICONS.length];
            const colorSet = POWERUP_COLORS[i % POWERUP_COLORS.length];
            return (
              <motion.button
                key={chip.label}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.03, y: -1 }}
                onClick={() => handleSend(chip.prompt)}
                disabled={isLoading}
                className={`shrink-0 text-[10px] font-black bg-gradient-to-br ${colorSet} border rounded-xl px-3 py-2 transition-all disabled:opacity-40 flex items-center gap-1.5 relative overflow-hidden`}
              >
                <Icon size={11} className="shrink-0" />
                {chip.label}
              </motion.button>
            );
          })}
          {/* Quiz powerup - always last */}
          {exchangeCount >= 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.03, y: -1 }}
              onClick={handleSkipToQuiz}
              disabled={isLoading}
              className="shrink-0 text-[10px] font-black bg-gradient-to-br from-agni-green/25 to-agni-gold/15 border border-agni-green/50 text-agni-green rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-glow-green disabled:opacity-40"
            >
              <Zap size={11} /> Quiz me! ⚡
            </motion.button>
          )}
        </div>
      </div>

      {/* Input with glow border */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask about ${lessonTitle}...`}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-card to-card-elevated border border-border/40 rounded-2xl px-4 py-3 text-[12px] font-medium text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-green/50 focus:shadow-glow-green transition-all disabled:opacity-50"
          />
          {input.trim() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-agni-green/60 font-bold"
            >
              ENTER ↵
            </motion.div>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-agni-green to-agni-green-dark flex items-center justify-center shadow-btn-3d disabled:opacity-30 disabled:shadow-none relative overflow-hidden"
        >
          <Send size={16} className="text-white relative z-10" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonChat;
