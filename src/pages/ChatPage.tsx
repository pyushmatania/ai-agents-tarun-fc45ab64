import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Brain, Sparkles, Trash2,
  GraduationCap
} from "lucide-react";
import { useChat, type ChatTab } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { getPersona } from "@/lib/neuralOS";
import { getTeachingLabel, getUniverseVibe } from "@/lib/teachingConfig";
import ContentRenderer from "@/components/chat/ContentRenderer";
import SmartInputBar from "@/components/chat/SmartInputBar";
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
  const [activeMode, setActiveMode] = useState(() => {
    const saved = localStorage.getItem("teaching_mode");
    if (saved) return saved;
    // Fall back to saved identity from onboarding/settings
    const identity = localStorage.getItem("teaching_identity");
    return identity || "engineer";
  });

  const chat = useChat(activeTab);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Build teaching context LIVE on each send (not memoized — selections change without re-render)
  const buildTeachingContext = () => {
    const identity = getTeachingLabel("identity");
    const mission = getTeachingLabel("mission");
    const vibe = getTeachingLabel("vibe");
    const brain = getTeachingLabel("brain");
    const universeVibe = getUniverseVibe();

    // When a specific universe vibe is selected, DON'T send generic interests
    // to prevent the AI from picking random interests instead of the selected one
    const allInterests = [
      ...(persona.shows || []),
      ...(persona.music || []),
      ...(persona.sports || []),
    ].slice(0, 5).join(", ") || undefined;

    return {
      identity: identity ? `${identity.label}${identity.desc ? ` — ${identity.desc}` : ""}` : persona.currentRole || undefined,
      mission: mission ? `${mission.label}${mission.desc ? ` — ${mission.desc}` : ""}` : persona.goal || undefined,
      vibe: vibe ? `${vibe.label}${vibe.desc ? ` — ${vibe.desc}` : ""}` : persona.vibe || undefined,
      level: brain ? `${brain.label}${brain.desc ? ` — ${brain.desc}` : ""}` : persona.experience || undefined,
      universeVibe: universeVibe || undefined,
      interests: universeVibe ? undefined : allInterests,
    };
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chat.messages]);

  const handleSend = (text?: string, hiddenPrompt?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const ctx = buildTeachingContext();
    const opts = hiddenPrompt ? { hiddenPrompt, hideUserMessage: true } : undefined;
    chat.sendMessage(msg, ctx, opts);
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    chat.sendMessage(suggestion, buildTeachingContext());
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    localStorage.setItem("teaching_mode", mode);
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
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors">
            <ArrowLeft size={18} className="text-foreground" />
          </button>

          {/* Tab switcher */}
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
            onClick={() => { chat.clearHistory(); toast.success("Chat cleared"); }}
            className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors"
          >
            <Trash2 size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {chat.isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: tabConfig.color }} />
            <p className="text-[11px] font-bold text-muted-foreground">Loading history...</p>
          </div>
        ) : chat.messages.length === 0 ? (
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

      {/* Smart Input Bar */}
      <div className="sticky bottom-0">
        <SmartInputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={chat.stopStreaming}
          isLoading={chat.isLoading}
          isLearnTab={activeTab === "curriculum"}
          suggestions={!chat.isLoading ? lastSuggestions : []}
          onSuggestionClick={handleSuggestionClick}
          placeholder={tabConfig.placeholder}
          accentColor={tabConfig.color}
          activeMode={activeMode}
          onModeChange={handleModeChange}
          exchangeCount={chat.messages.filter(m => m.role === "user").length}
        />
      </div>
    </div>
  );
}
