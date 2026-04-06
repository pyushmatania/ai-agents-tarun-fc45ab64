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

interface LessonChatProps {
  lessonTitle: string;
  lessonTopic: string;
  teachingMode: string;
  onQuizReady: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const LessonChat = ({ lessonTitle, lessonTopic, teachingMode, onQuizReady }: LessonChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agniExpr: AgniExpression = isLoading ? "thinking" : messages.length === 0 ? "teaching" : "happy";

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Start with AGNI's intro message
  useEffect(() => {
    sendToAI([{ role: "user", content: `Start teaching me about "${lessonTitle}". Topic: ${lessonTopic}. Begin with an engaging introduction.` }], true);
  }, []);

  const sendToAI = useCallback(async (chatMessages: Message[], isInitial = false) => {
    setIsLoading(true);
    setIsStreaming(true);

    const aiConfig = getAIConfig();
    const body: any = {
      messages: chatMessages,
      teachingMode,
      lessonTitle,
      lessonTopic,
      stream: true,
    };

    if (aiConfig.mode === "byok" && aiConfig.byokApiKey) {
      body.customApiKey = aiConfig.byokApiKey;
      body.provider = aiConfig.byokProvider;
      body.model = aiConfig.byokModel;
      body.stream = false; // BYOK doesn't support streaming through our proxy
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
        // Streaming response
        let assistantText = "";
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        // Add empty assistant message
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

        // Check if QUIZ_READY
        if (assistantText.includes("QUIZ_READY")) {
          // Clean the marker from displayed text
          const cleanText = assistantText.replace(/QUIZ_READY/g, "").trim();
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: cleanText };
            return updated;
          });
          setTimeout(() => onQuizReady(), 2000);
        }
      } else {
        // Non-streaming response
        const data = await resp.json();
        const text = data.text || "I couldn't generate a response. Let's try again!";
        const cleanText = text.replace(/QUIZ_READY/g, "").trim();
        setMessages(prev => [...prev, { role: "assistant", content: cleanText }]);

        if (text.includes("QUIZ_READY")) {
          setTimeout(() => onQuizReady(), 2000);
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
  }, [teachingMode, lessonTitle, lessonTopic, onQuizReady]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    sendToAI(updatedMessages);
  };

  const handleSkipToQuiz = () => {
    SFX.tap();
    onQuizReady();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Chat header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Agni expression={agniExpr} size={40} animate />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-agni-green">AGNI is teaching</p>
          <p className="text-[9px] text-muted-foreground font-semibold truncate">{lessonTitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
            {teachingMode.toUpperCase()}
          </span>
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
            <div className="bg-card border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
              <motion.div
                className="flex gap-1"
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

      {/* Input */}
      <div className="flex items-center gap-2 pt-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AGNI anything..."
          disabled={isLoading}
          className="flex-1 bg-card border border-border/40 rounded-2xl px-4 py-3 text-[12px] font-medium text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-agni-green/50 transition-colors disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSend}
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
