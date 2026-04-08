import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Brain, Sparkles, Trash2,
  GraduationCap, X, ChevronDown
} from "lucide-react";
import { useChat, type ChatTab } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { getPersona } from "@/lib/neuralOS";
import { getTeachingLabel, getUniverseVibe } from "@/lib/teachingConfig";
import ContentRenderer from "@/components/chat/ContentRenderer";
import SmartInputBar from "@/components/chat/SmartInputBar";
import { toast } from "sonner";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";

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
  const prefill = (location.state as any)?.prefill || "";
  const autoSend = (location.state as any)?.autoSend || false;
  const [activeTab, setActiveTab] = useState<ChatTab>(initialTab);
  const [activeMode, setActiveMode] = useState(() => {
    return getCurrentScopedStorage().get<string>("teaching_mode", "");
  });

  const chat = useChat(activeTab);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(prefill);
  const hasAutoSent = useRef(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Track if user has scrolled away from the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distFromBottom > 150);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
      }
    });
  }, []);

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

  // Auto-send prefill from navigation (e.g. "Take to Chat")
  useEffect(() => {
    if (autoSend && prefill && !hasAutoSent.current && !chat.isLoadingHistory) {
      hasAutoSent.current = true;
      setTimeout(() => handleSend(prefill), 300);
    }
  }, [autoSend, prefill, chat.isLoadingHistory]);

  // Scroll to bottom on new messages (only if user is near the bottom)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 200) {
      scrollToBottom(true);
    }
  }, [chat.messages, scrollToBottom]);

  // Scroll to bottom on mount, tab switch, and after history loads
  useEffect(() => {
    if (chat.isLoadingHistory) return;
    // Use multiple frames to ensure DOM is fully rendered
    const timer = setTimeout(() => scrollToBottom(false), 100);
    return () => clearTimeout(timer);
  }, [activeTab, chat.isLoadingHistory, scrollToBottom]);

  // Build a snapshot of current settings for the blueprint stamp
  const buildSettingsSnapshot = () => {
    const ctx = buildTeachingContext();
    const parts: { key: string; emoji: string; value: string }[] = [];
    if (ctx.identity) parts.push({ key: "Identity", emoji: "🧑‍💻", value: ctx.identity.split(" — ")[0] });
    if (ctx.mission) parts.push({ key: "Mission", emoji: "🎯", value: ctx.mission.split(" — ")[0] });
    if (ctx.vibe) parts.push({ key: "Vibe", emoji: "🎭", value: ctx.vibe.split(" — ")[0] });
    if (ctx.level) parts.push({ key: "Brain", emoji: "🧠", value: ctx.level.split(" — ")[0] });
    if (ctx.universeVibe) parts.push({ key: "World", emoji: "🌍", value: ctx.universeVibe });
    return parts;
  };

  const handleSend = (text?: string, hiddenPrompt?: string) => {
    const msg = text || input.trim();
    if (!msg) {
      // Blank send = recook last question with new settings
      if (chat.messages.length > 0) {
        const snapshot = buildSettingsSnapshot();
        chat.regenerateLast(buildTeachingContext(), snapshot);
      }
      return;
    }
    const ctx = buildTeachingContext();
    const snapshot = buildSettingsSnapshot();
    const opts = hiddenPrompt ? { hiddenPrompt, hideUserMessage: true } : undefined;
    chat.sendMessage(msg, ctx, opts, snapshot);
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    const ctx = buildTeachingContext();
    const snapshot = buildSettingsSnapshot();
    chat.sendMessage(suggestion, ctx, undefined, snapshot);
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    getCurrentScopedStorage().set("teaching_mode", mode);
  };

  // Get last assistant suggestions
  const lastAssistantMsg = [...chat.messages].reverse().find(m => m.role === "assistant");
  const { suggestions: lastSuggestions } = lastAssistantMsg
    ? parseSuggestions(lastAssistantMsg.content)
    : { suggestions: [] };

  const tabConfig = TAB_CONFIG[activeTab];

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/10">
        <div className="max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors">
            <X size={18} className="text-foreground" />
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
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4 relative">
        <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
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
              const snapshot = msg.metadata?.settingsSnapshot as { key: string; emoji: string; value: string }[] | undefined;
              return (
                <div key={msg.id}>
                  <ContentRenderer
                    content={text}
                    isUser={msg.role === "user"}
                    showActions={msg.role === "assistant" && !!text}
                  />
                  {/* Settings blueprint stamp */}
                  {msg.role === "assistant" && text && snapshot && snapshot.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-2 px-1">
                      {snapshot.map((s) => (
                        <span key={s.key} className="text-[8px] font-bold text-muted-foreground/40 bg-muted/10 rounded-lg px-1.5 py-0.5">
                          {s.emoji} {s.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-28 right-4 z-40 w-10 h-10 rounded-full bg-card border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronDown size={18} className="text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Smart Input Bar */}
      <div className="sticky bottom-0 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
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
          hasMessages={chat.messages.length > 0}
          onRecookLast={() => chat.regenerateLast(buildTeachingContext())}
        />
        </div>
      </div>
    </div>
  );
}
