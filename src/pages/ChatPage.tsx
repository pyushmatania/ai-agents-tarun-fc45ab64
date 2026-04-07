import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Loader2, Brain, Sparkles, Trash2,
  Image, Paperclip, Mic, BookmarkPlus, StopCircle,
  MessageSquare, GraduationCap, ChevronDown
} from "lucide-react";
import { useChat, type ChatTab, type ChatMessage } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { getPersona } from "@/lib/neuralOS";
import BottomNav from "@/components/BottomNav";
import ReactMarkdown from "react-markdown";

// Extract suggestions from AGNI's response
function parseSuggestions(content: string): { text: string; suggestions: string[] } {
  const match = content.match(/\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s);
  if (!match) return { text: content, suggestions: [] };
  const suggestions = match[1].split("|").map(s => s.trim()).filter(Boolean);
  const text = content.replace(/\[SUGGESTIONS\].*?\[\/SUGGESTIONS\]/s, "").trim();
  return { text, suggestions };
}

const TAB_CONFIG = {
  curriculum: {
    label: "Learn",
    icon: GraduationCap,
    color: "#58CC02",
    gradient: "from-agni-green/20 to-agni-green/5",
    placeholder: "Ask about AI agents, lessons...",
  },
  general: {
    label: "AGNI Chat",
    icon: Sparkles,
    color: "#CE82FF",
    gradient: "from-agni-purple/20 to-agni-pink/5",
    placeholder: "Ask me anything...",
  },
};

function ChatBubble({ message, isLast }: { message: ChatMessage; isLast: boolean }) {
  const isUser = message.role === "user";
  const { text, suggestions } = parseSuggestions(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isUser
            ? "bg-agni-green text-white rounded-br-md"
            : "bg-card border border-border/30 text-foreground rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="text-[13px] font-medium leading-relaxed">{text}</p>
        ) : text ? (
          <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_code]:text-[11px] [&_code]:bg-muted/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted/20 [&_pre]:rounded-lg [&_pre]:p-2">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin text-agni-purple" />
            <span className="text-[11px] text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const persona = getPersona();

  // Check if a specific tab was requested
  const initialTab = (location.state as any)?.tab || "general";
  const [activeTab, setActiveTab] = useState<ChatTab>(initialTab);

  const chat = useChat(activeTab);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Build teaching context
  const teachingContext = useMemo(() => ({
    identity: persona.currentRole || undefined,
    mission: persona.goal || undefined,
    vibe: persona.vibe || undefined,
    level: persona.experience || undefined,
    interests: [
      ...(persona.shows || []),
      ...(persona.music || []),
      ...(persona.sports || []),
    ].slice(0, 5).join(", ") || undefined,
  }), [persona]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    chat.sendMessage(input, teachingContext);
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    chat.sendMessage(suggestion, teachingContext);
  };

  // Get last assistant suggestions
  const lastAssistantMsg = [...chat.messages].reverse().find(m => m.role === "assistant");
  const { suggestions: lastSuggestions } = lastAssistantMsg
    ? parseSuggestions(lastAssistantMsg.content)
    : { suggestions: [] };

  const tabConfig = TAB_CONFIG[activeTab];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-agni-green" />
            <span className="text-sm font-black text-foreground">AGNI Chat</span>
          </div>
          <button
            onClick={chat.clearHistory}
            className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center"
          >
            <Trash2 size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 px-4 pb-2">
          {(Object.entries(TAB_CONFIG) as [ChatTab, typeof TAB_CONFIG.curriculum][]).map(([key, cfg]) => {
            const isActive = activeTab === key;
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black transition-all"
                style={{
                  background: isActive ? `${cfg.color}20` : "transparent",
                  color: isActive ? cfg.color : "hsl(var(--muted-foreground))",
                  border: `1.5px solid ${isActive ? `${cfg.color}40` : "transparent"}`,
                }}
              >
                <Icon size={13} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {chat.isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 size={20} className="animate-spin text-agni-purple" />
            <p className="text-[10px] font-bold text-muted-foreground">Loading chat history...</p>
          </div>
        ) : chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${tabConfig.color}15` }}
            >
              <Brain size={28} style={{ color: tabConfig.color }} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black text-foreground mb-1">
                {activeTab === "curriculum" ? "Learn with AGNI" : "Chat with AGNI"}
              </h3>
              <p className="text-[11px] text-muted-foreground max-w-[240px]">
                {activeTab === "curriculum"
                  ? "Ask about AI agents, get explanations tailored to your level"
                  : "Ask me anything — AI, code, life, creativity. I'm here for it all."}
              </p>
            </div>
            {/* Quick starters */}
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]">
              {(activeTab === "curriculum"
                ? ["What are AI agents?", "Explain RAG simply", "How do LLMs work?"]
                : ["Help me brainstorm", "Explain quantum computing", "Write a poem about code"]
              ).map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-border/30 bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chat.messages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} isLast={i === chat.messages.length - 1} />
            ))}
          </>
        )}
      </div>

      {/* Suggestions chips */}
      {lastSuggestions.length > 0 && !chat.isLoading && (
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {lastSuggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSuggestionClick(s)}
                className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
                style={{ borderColor: `${tabConfig.color}30` }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="sticky bottom-0 bg-background border-t border-border/20 px-3 py-2 pb-20">
        <div className="flex items-center gap-2">
          {/* Extras for general tab */}
          {activeTab === "general" && (
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-full bg-agni-purple/10 flex items-center justify-center">
                <Image size={14} className="text-agni-purple" />
              </button>
              <button className="w-8 h-8 rounded-full bg-agni-purple/10 flex items-center justify-center">
                <Paperclip size={14} className="text-agni-purple" />
              </button>
            </div>
          )}

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={tabConfig.placeholder}
              className="w-full bg-card border border-border/30 rounded-2xl pl-4 pr-10 py-2.5 text-[12px] font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-agni-green/40"
            />
            {chat.isLoading ? (
              <button
                onClick={chat.stopStreaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center"
              >
                <StopCircle size={14} className="text-destructive" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ background: input.trim() ? tabConfig.color : "hsl(var(--muted))" }}
              >
                <Send size={12} className="text-white" />
              </button>
            )}
          </div>

          {activeTab === "general" && (
            <button className="w-8 h-8 rounded-full bg-agni-purple/10 flex items-center justify-center">
              <Mic size={14} className="text-agni-purple" />
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
