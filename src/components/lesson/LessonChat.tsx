import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
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

const QUICK_CHIPS: Record<string, { label: string; prompt: string }[]> = {
  class5: [
    { label: "Explain simpler", prompt: "Explain that in even simpler terms, like I'm 5 years old." },
    { label: "Fun example", prompt: "Give me a fun, real-world example of this!" },
    { label: "Quiz me", prompt: "Quiz me on what we just learned!" },
    { label: "Tell a story", prompt: "Tell me a short story to explain this concept." },
  ],
  engineer: [
    { label: "Explain simpler", prompt: "Break this down more simply." },
    { label: "Give me code", prompt: "Show me a code example for this concept." },
    { label: "Real example", prompt: "Give me a real-world production example." },
    { label: "Quiz me", prompt: "Quiz me on this topic." },
  ],
  founder: [
    { label: "Business case", prompt: "What's the business case / ROI for this?" },
    { label: "What can I build?", prompt: "What products or startups could I build with this?" },
    { label: "Deep dive", prompt: "Go deeper into the strategic implications." },
    { label: "Quiz me", prompt: "Quiz me on this topic." },
  ],
  hacker: [
    { label: "Give me code", prompt: "Just show me the code, skip the theory." },
    { label: "Quick start", prompt: "How do I get started with this RIGHT NOW?" },
    { label: "Deep dive", prompt: "Go deeper, show me advanced patterns." },
    { label: "Quiz me", prompt: "Quiz me on this." },
  ],
  crazy: [
    { label: "Mind blow me", prompt: "Give me the most mind-blowing implication of this!" },
    { label: "Sci-fi scenario", prompt: "Paint a wild sci-fi scenario with this tech." },
    { label: "Deep dive", prompt: "Go even deeper into the rabbit hole." },
    { label: "Quiz me", prompt: "Quiz me on this!" },
  ],
  semiconductor: [
    { label: "Connect to HCL", prompt: "How does this connect to semiconductor manufacturing / HCL?" },
    { label: "Fab example", prompt: "Give me a specific fab/manufacturing example." },
    { label: "Deep dive", prompt: "Go deeper into the technical details." },
    { label: "Quiz me", prompt: "Quiz me on this." },
  ],
};

const LessonChat = ({ lessonTitle, lessonTopic, teachingMode: initialMode, onQuizReady }: LessonChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [activeMode, setActiveMode] = useState(initialMode);
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
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantText };
                  return updated;
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        if (assistantText.includes("QUIZ_READY")) {
          const cleanText = assistantText.replace(/QUIZ_READY/g, "").trim();
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
        const cleanText = text.replace(/QUIZ_READY/g, "").trim();
        setMessages(prev => [...prev, { role: "assistant", content: cleanText }]);

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
      {/* Mode selector tabs */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[9px] font-black text-muted-foreground shrink-0">Mode:</span>
          {MODES.map((m) => (
            <motion.button
              key={m.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleModeChange(m.key)}
              className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors border ${
                activeMode === m.key
                  ? "bg-agni-green/10 text-agni-green border-agni-green/50"
                  : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Agni expression={agniExpr} size={40} animate />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-agni-green">AGNI is teaching</p>
          <p className="text-[9px] text-muted-foreground font-semibold truncate">{lessonTitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {exchangeCount >= 2 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkipToQuiz}
              className="text-[8px] font-black text-white bg-agni-green px-2 py-0.5 rounded-full flex items-center gap-0.5"
            >
              <Sparkles size={8} /> QUIZ →
            </motion.button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-1 pb-2 scrollbar-thin"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed font-medium ${
                  msg.role === "user"
                    ? "bg-agni-green text-white rounded-br-md"
                    : "bg-card border border-border/40 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                    {line.startsWith("**") ? (
                      <span className="font-black">{line.replace(/\*\*/g, "")}</span>
                    ) : line.startsWith("- ") || line.startsWith("• ") ? (
                      <span className="pl-2">{line}</span>
                    ) : line.startsWith("`") ? (
                      <code className="bg-muted/30 px-1 py-0.5 rounded text-[11px] font-mono">
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
            <div className="bg-card border border-border/40 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <span className="text-sm">⏳</span>
              <span className="text-[11px] font-semibold text-muted-foreground">Loading lesson...</span>
              <motion.div
                className="flex gap-1 ml-1"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-agni-green" />
                <div className="w-1.5 h-1.5 rounded-full bg-agni-green" />
                <div className="w-1.5 h-1.5 rounded-full bg-agni-green" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick action chips */}
      <div className="shrink-0 py-1.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {chips.map((chip) => (
            <motion.button
              key={chip.label}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSend(chip.prompt)}
              disabled={isLoading}
              className="shrink-0 text-[10px] font-bold text-foreground bg-card border border-border/40 rounded-full px-3 py-1.5 hover:border-agni-green/40 transition-colors disabled:opacity-40"
            >
              {chip.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask about ${lessonTitle}...`}
          disabled={isLoading}
          className="flex-1 bg-card border border-border/40 rounded-2xl px-4 py-3 text-[12px] font-medium text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-agni-green/50 transition-colors disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-2xl bg-agni-green flex items-center justify-center shadow-btn-3d disabled:opacity-30 disabled:shadow-none"
        >
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonChat;
