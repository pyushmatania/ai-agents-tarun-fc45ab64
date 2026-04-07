import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Loader2, Brain, Sparkles, Trash2,
  StopCircle, GraduationCap
} from "lucide-react";
import { useChat, type ChatTab, type ChatMessage } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { getPersona } from "@/lib/neuralOS";

import ContentRenderer from "@/components/chat/ContentRenderer";
import SuggestionBar from "@/components/chat/SuggestionBar";
import ChatToolbar from "@/components/chat/ChatToolbar";
import { toast } from "sonner";

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
    emptyTitle: "Learn with AGNI 🔥",
    emptyDesc: "Your AI tutor for AI Agents — ask about concepts, get interactive lessons, and test yourself with quizzes.",
    starters: ["What are AI agents?", "Explain RAG simply", "How do LLMs work?", "Teach me about tool use"],
  },
  general: {
    label: "AGNI Chat",
    icon: Sparkles,
    color: "#CE82FF",
    gradient: "from-agni-purple/20 to-agni-pink/5",
    placeholder: "Ask me anything...",
    emptyTitle: "Chat with AGNI ✨",
    emptyDesc: "Your AI companion for everything — code, creative writing, brainstorming, daily life, and more.",
    starters: ["Help me brainstorm", "Explain quantum computing", "Write a poem about code", "Debug my logic"],
  },
};

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const persona = getPersona();

  const initialTab = (location.state as any)?.tab || "general";
  const [activeTab, setActiveTab] = useState<ChatTab>(initialTab);

  const chat = useChat(activeTab);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chat.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

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
      {/* Header - clean and minimal */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors">
            <ArrowLeft size={18} className="text-foreground" />
          </button>

          {/* Tab switcher — pill style */}
          <div className="flex bg-muted/15 rounded-2xl p-1">
            {(Object.entries(TAB_CONFIG) as [ChatTab, typeof TAB_CONFIG.curriculum][]).map(([key, cfg]) => {
              const isActive = activeTab === key;
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="chatTabIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: `${cfg.color}20`, border: `1.5px solid ${cfg.color}30` }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5" style={{ color: isActive ? cfg.color : "hsl(var(--muted-foreground))" }}>
                    <Icon size={13} />
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              chat.clearHistory();
              toast.success("Chat cleared");
            }}
            className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors"
          >
            <Trash2 size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages area — spacious */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {chat.isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: tabConfig.color }} />
            <p className="text-[11px] font-bold text-muted-foreground">Loading history...</p>
          </div>
        ) : chat.messages.length === 0 ? (
          // Empty state — welcoming and spacious
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: `${tabConfig.color}10`, border: `2px solid ${tabConfig.color}20` }}
            >
              <Brain size={36} style={{ color: tabConfig.color }} />
            </motion.div>

            <div className="text-center max-w-[280px]">
              <h2 className="text-lg font-black text-foreground mb-2">{tabConfig.emptyTitle}</h2>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{tabConfig.emptyDesc}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
              {tabConfig.starters.map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-[11px] font-bold px-4 py-2.5 rounded-2xl border bg-card/50 text-foreground/70 hover:text-foreground transition-all"
                  style={{ borderColor: `${tabConfig.color}20` }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {chat.messages.map((msg) => {
              const { text } = parseSuggestions(msg.content);
              return (
                <ContentRenderer
                  key={msg.id}
                  content={text}
                  isUser={msg.role === "user"}
                  showActions={msg.role === "assistant" && !!text}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* AI Suggestions — collapsible */}
      {!chat.isLoading && lastSuggestions.length > 0 && (
        <SuggestionBar
          suggestions={lastSuggestions}
          onSelect={handleSuggestionClick}
          color={tabConfig.color}
          disabled={chat.isLoading}
        />
      )}

      {/* Input area — spacious and clean */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/10 px-4 py-3 pb-6">
        <div className="flex items-end gap-2">
          {/* Toolbar for general tab */}
          {activeTab === "general" && (
            <ChatToolbar
              onImageClick={() => toast.info("Image generation coming soon!")}
              onFileClick={() => toast.info("File upload coming soon!")}
              onVoiceClick={() => toast.info("Voice input coming soon!")}
              onSearchClick={() => toast.info("Web search coming soon!")}
            />
          )}

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={tabConfig.placeholder}
              rows={1}
              className="w-full bg-card border border-border/20 rounded-2xl pl-4 pr-12 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none resize-none overflow-hidden transition-all"
              style={{ 
                borderColor: input.trim() ? `${tabConfig.color}30` : undefined,
              }}
            />
            {chat.isLoading ? (
              <button
                onClick={chat.stopStreaming}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-xl bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
              >
                <StopCircle size={16} className="text-destructive" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-20"
                style={{ background: input.trim() ? tabConfig.color : "hsl(var(--muted))" }}
              >
                <Send size={14} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
}
