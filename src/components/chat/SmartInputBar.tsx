import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, X, Sparkles, Brain, Zap, ChevronRight,
  GraduationCap, Flame, Mic, Search, Image, Paperclip,
  StopCircle, ChevronDown, Pencil, Lightbulb, Palette,
} from "lucide-react";
import { getPersona } from "@/lib/neuralOS";
import { getTeachingLabel, getTeachingSelection, setTeachingSelection, TEACHING_CATEGORIES, getAllOptions, getActiveExplainStyles, TEACHING_VIBES, BRAIN_LEVELS_SKILL, BRAIN_LEVELS_ACADEMIC, getBrainTrack, QUIZ_DIFFICULTIES, type QuizDifficulty } from "@/lib/teachingConfig";
import { InterestPill } from "@/components/InterestPill";
import { SFX } from "@/lib/sounds";

// ── Types ──
interface PowerUp {
  id: string;
  label: string;
  prompt: string;
  emoji: string;
  color: string;
}

interface SmartInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (text?: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  isLearnTab: boolean;
  suggestions?: string[];
  onSuggestionClick?: (s: string) => void;
  placeholder?: string;
  accentColor?: string;
  // Lesson-specific
  lessonTitle?: string;
  exchangeCount?: number;
  onQuizReady?: () => void;
  onModeChange?: (mode: string) => void;
  activeMode?: string;
}

// Interest-based prompt resolver
function resolveInterestPrompt(prompt: string): string {
  if (prompt !== "__INTEREST_DECK_FUN__" && prompt !== "__INTEREST_DECK_STORY__") return prompt;
  const p = getPersona();
  const all = [
    ...(p.shows || []), ...(p.sports || []), ...(p.gaming || []),
    ...(p.music || []), ...(p.hobbies || []), ...(p.books || []),
  ];
  if (all.length === 0) {
    return prompt === "__INTEREST_DECK_FUN__"
      ? "Give me a fun, real-world example of this!"
      : "Tell me a short story to explain this concept.";
  }
  const picks = [...all].sort(() => Math.random() - 0.5).slice(0, 3);
  const list = picks.map(i => `"${i}"`).join(", ");
  return prompt === "__INTEREST_DECK_FUN__"
    ? `Pick the BEST from: ${list} — give a fun, vivid example using it!`
    : `Pick the BEST from: ${list} — tell a dramatic story explaining this concept!`;
}

// ── Modes list from teaching categories ──
const MODES = TEACHING_CATEGORIES.flatMap(cat =>
  getAllOptions(cat.id).map((opt: any) => ({ key: opt.id, label: opt.label, emoji: opt.emoji }))
).slice(0, 12);

type Panel = "none" | "tools" | "modes" | "powerups" | "interests";

export default function SmartInputBar({
  value, onChange, onSend, onStop, isLoading, isLearnTab,
  suggestions = [], onSuggestionClick, placeholder, accentColor = "#58CC02",
  lessonTitle, exchangeCount = 0, onQuizReady, onModeChange, activeMode = "engineer",
}: SmartInputBarProps) {
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const persona = getPersona();

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + "px";
    }
  }, [value]);

  const togglePanel = (panel: Panel) => {
    setActivePanel(prev => prev === panel ? "none" : panel);
    SFX.tap();
  };

  const explainStyles = useMemo(() => getActiveExplainStyles(), []);
  const powerups: PowerUp[] = explainStyles.map(s => ({
    id: s.id, label: s.label, emoji: s.emoji, prompt: s.prompt, color: s.color,
  }));

  const interestCategories = useMemo(() => {
    const cats: { id: string; emoji: string; label: string; items: string[] }[] = [];
    if (persona.shows?.length) cats.push({ id: "shows", emoji: "🎬", label: "Shows", items: persona.shows });
    if (persona.sports?.length) cats.push({ id: "sports", emoji: "⚽", label: "Sports", items: persona.sports });
    if (persona.gaming?.length) cats.push({ id: "gaming", emoji: "🎮", label: "Gaming", items: persona.gaming });
    if (persona.music?.length) cats.push({ id: "music", emoji: "🎵", label: "Music", items: persona.music });
    if (persona.hobbies?.length) cats.push({ id: "hobbies", emoji: "🎯", label: "Hobbies", items: persona.hobbies });
    if (persona.books?.length) cats.push({ id: "books", emoji: "📚", label: "Books", items: persona.books });
    return cats;
  }, [persona]);

  const handlePowerUp = (pu: PowerUp) => {
    const resolved = resolveInterestPrompt(pu.prompt);
    SFX.powerup("green");
    setActivePanel("none");
    onSend(resolved);
  };

  const handleInterestSend = (catId: string, item: string) => {
    const promptMap: Record<string, string> = {
      shows: `Explain this using an analogy from "${item}" (the show/movie I love).`,
      sports: `Explain this using a sports analogy involving "${item}".`,
      gaming: `Explain this like a game mechanic from "${item}".`,
      music: `Explain this using a musical analogy with "${item}".`,
      hobbies: `Explain this through the lens of "${item}" as a hobby.`,
      books: `Explain this using concepts from "${item}".`,
    };
    SFX.powerup("pink");
    setActivePanel("none");
    onSend(promptMap[catId] || `Explain using "${item}" as an analogy.`);
  };

  const handleModeSelect = (mode: string) => {
    SFX.tap();
    setActivePanel("none");
    onModeChange?.(mode);
  };

  return (
    <div className="bg-background/95 backdrop-blur-md border-t border-border/10">
      {/* AI Suggestions — always visible when available */}
      <AnimatePresence>
        {!isLoading && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-2 overflow-hidden"
          >
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSuggestionClick?.(s)}
                  className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-2xl border bg-card/50 text-foreground/70 hover:text-foreground transition-all flex items-center gap-1"
                  style={{ borderColor: `${accentColor}20` }}
                >
                  <Sparkles size={8} style={{ color: accentColor }} />
                  <span className="truncate max-w-[160px]">{s}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable panels */}
      <AnimatePresence mode="wait">
        {activePanel !== "none" && (
          <motion.div
            key={activePanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-4"
          >
            {/* Tools panel (General chat) */}
            {activePanel === "tools" && (
              <div className="py-3 flex gap-2">
                {[
                  { icon: Image, label: "Image", color: "#CE82FF" },
                  { icon: Paperclip, label: "File", color: "#58CC02" },
                  { icon: Mic, label: "Voice", color: "#FF6B6B" },
                  { icon: Search, label: "Search", color: "#4DA6FF" },
                ].map(t => (
                  <motion.button
                    key={t.label}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-card border border-border/20"
                    onClick={() => { setActivePanel("none"); }}
                  >
                    <t.icon size={18} style={{ color: t.color }} />
                    <span className="text-[9px] font-bold text-muted-foreground">{t.label}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Modes panel (Learn chat) */}
            {activePanel === "modes" && (
              <div className="py-3">
                <p className="text-[9px] font-black text-muted-foreground mb-2 uppercase tracking-wider">Teaching Mode</p>
                <div className="flex flex-wrap gap-1.5">
                  {MODES.map(m => (
                    <motion.button
                      key={m.key}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handleModeSelect(m.key)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                        activeMode === m.key
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
                      }`}
                    >
                      <span>{m.emoji}</span> {m.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Power-ups panel */}
            {activePanel === "powerups" && (
              <div className="py-3">
                <p className="text-[9px] font-black text-muted-foreground mb-2 uppercase tracking-wider">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  {powerups.map(pu => (
                    <motion.button
                      key={pu.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handlePowerUp(pu)}
                      disabled={isLoading}
                      className={`text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r ${pu.color} text-white shadow-md disabled:opacity-40 flex items-center gap-1`}
                    >
                      <span>{pu.emoji}</span> {pu.label}
                    </motion.button>
                  ))}
                  {/* Quiz button */}
                  {isLearnTab && exchangeCount >= 1 && onQuizReady && (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={onQuizReady}
                      disabled={isLoading}
                      className="text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r from-agni-green to-emerald-500 text-white shadow-md disabled:opacity-40 flex items-center gap-1"
                    >
                      <Zap size={10} /> Quiz Me!
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* Interests panel */}
            {activePanel === "interests" && (
              <div className="py-3">
                <p className="text-[9px] font-black text-muted-foreground mb-2 uppercase tracking-wider">Teach using my interests</p>
                {interestCategories.length > 0 ? (
                  <div className="space-y-2">
                    {interestCategories.map(cat => (
                      <div key={cat.id}>
                        <p className="text-[8px] font-bold text-muted-foreground mb-1">{cat.emoji} {cat.label}</p>
                        <div className="flex flex-wrap gap-1">
                          {cat.items.map((item, i) => (
                            <motion.button
                              key={item}
                              whileTap={{ scale: 0.93 }}
                              onClick={() => handleInterestSend(cat.id, item)}
                              disabled={isLoading}
                              className="shrink-0"
                            >
                              <InterestPill name={item} categoryId={cat.id} index={i} compact />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/60 text-center py-4">
                    Set up your persona in Settings to see your interests here ✨
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row with action buttons */}
      <div className="px-4 py-3 pb-6">
        {/* Action chips row */}
        <div className="flex items-center gap-1.5 mb-2">
          {/* + button for tools (general) or modes (learn) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel(isLearnTab ? "modes" : "tools")}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              activePanel === "modes" || activePanel === "tools"
                ? "bg-primary/20 rotate-45"
                : "bg-muted/30"
            }`}
          >
            {activePanel === "modes" || activePanel === "tools"
              ? <X size={12} style={{ color: accentColor }} />
              : <Plus size={12} className="text-muted-foreground" />
            }
          </motion.button>

          {/* Power-ups button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("powerups")}
            className={`h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
              activePanel === "powerups"
                ? "bg-primary/15 text-primary"
                : "bg-muted/20 text-muted-foreground"
            }`}
          >
            <Zap size={10} /> Actions
          </motion.button>

          {/* Interests button */}
          {interestCategories.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => togglePanel("interests")}
              className={`h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
                activePanel === "interests"
                  ? "bg-agni-purple/15 text-agni-purple"
                  : "bg-muted/20 text-muted-foreground"
              }`}
            >
              <Sparkles size={10} /> My World
            </motion.button>
          )}

          {/* Lesson context badge */}
          {isLearnTab && lessonTitle && (
            <div className="ml-auto flex items-center gap-1 text-[8px] font-bold text-primary/60">
              <GraduationCap size={9} />
              <span className="truncate max-w-[80px]">{lessonTitle}</span>
            </div>
          )}
        </div>

        {/* Textarea + send */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={placeholder || "Ask anything..."}
              rows={1}
              disabled={isLoading}
              className="w-full bg-card border border-border/20 rounded-2xl pl-4 pr-12 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none resize-none overflow-hidden transition-all disabled:opacity-50"
              style={{ borderColor: value.trim() ? `${accentColor}30` : undefined }}
            />
            {isLoading ? (
              <button
                onClick={onStop}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-xl bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
              >
                <StopCircle size={16} className="text-destructive" />
              </button>
            ) : (
              <button
                onClick={() => onSend()}
                disabled={!value.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-20"
                style={{ background: value.trim() ? accentColor : "hsl(var(--muted))" }}
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
