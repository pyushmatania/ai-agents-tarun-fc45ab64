import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, X, Sparkles, Brain, Zap,
  GraduationCap, StopCircle, Palette, Target,
  Image, Paperclip, Mic, Search,
} from "lucide-react";
import { getPersona } from "@/lib/neuralOS";
import { getTeachingLabel, getTeachingSelection, setTeachingSelection, MISSION_MODES, TEACHING_VIBES, BRAIN_LEVELS_SKILL, BRAIN_LEVELS_ACADEMIC, getBrainTrack, QUIZ_DIFFICULTIES, getActiveExplainStyles, type QuizDifficulty } from "@/lib/teachingConfig";
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
  onSend: (text?: string, hiddenPrompt?: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  isLearnTab: boolean;
  suggestions?: string[];
  onSuggestionClick?: (s: string) => void;
  placeholder?: string;
  accentColor?: string;
  lessonTitle?: string;
  exchangeCount?: number;
  onQuizReady?: (difficulty?: string) => void;
  onModeChange?: (mode: string) => void;
  activeMode?: string;
  hasMessages?: boolean;
  onRecookLast?: () => void;
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

type Panel = "none" | "motive" | "powerups" | "interests" | "vibe" | "brain" | "quiz" | "attachments";

export default function SmartInputBar({
  value, onChange, onSend, onStop, isLoading, isLearnTab,
  suggestions = [], onSuggestionClick, placeholder, accentColor = "#58CC02",
  lessonTitle, exchangeCount = 0, onQuizReady, onModeChange, activeMode = "engineer",
  hasMessages = false, onRecookLast,
}: SmartInputBarProps) {
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const persona = getPersona();

  // Track current selections for chips
  const [currentMotive, setCurrentMotive] = useState(() => getTeachingSelection("mission"));
  const [currentVibe, setCurrentVibe] = useState(() => getTeachingSelection("vibe"));
  const [currentBrain, setCurrentBrain] = useState(() => getTeachingSelection("brain"));
  const [selectedInterest, setSelectedInterest] = useState(() => localStorage.getItem("teaching_universe_vibe") || "");

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
    // Show clean label, hide actual prompt
    onSend(`${pu.emoji} ${pu.label}`, resolved);
  };

  // Interest select — just set as universe vibe, don't send
  const handleInterestSelect = (catId: string, item: string) => {
    SFX.select();
    setActivePanel("none");
    setTeachingSelection("vibe", currentVibe);
    localStorage.setItem("teaching_universe_vibe", item);
    window.dispatchEvent(new Event("storage"));
    setSelectedInterest(item);
  };

  // Get labels for active selections — show chip only when explicitly set
  const motiveInfo = currentMotive ? MISSION_MODES.find(m => m.id === currentMotive) : null;
  const vibeInfo = currentVibe ? TEACHING_VIBES.find(v => v.id === currentVibe) : null;
  const brainLevels = getBrainTrack() === "academic" ? BRAIN_LEVELS_ACADEMIC : BRAIN_LEVELS_SKILL;
  const allBrainLevelsForChat = [...BRAIN_LEVELS_SKILL, ...BRAIN_LEVELS_ACADEMIC.filter(a => !BRAIN_LEVELS_SKILL.some(s => s.id === a.id))];
  const brainInfo = currentBrain ? allBrainLevelsForChat.find(b => b.id === currentBrain) : null;

  const hasActiveSelections = motiveInfo || vibeInfo || brainInfo || selectedInterest;

  const clearSelection = (type: "motive" | "vibe" | "brain" | "interest") => {
    SFX.tap();
    if (type === "motive") {
      setTeachingSelection("mission", "");
      setCurrentMotive("");
    } else if (type === "vibe") {
      setTeachingSelection("vibe", "");
      setCurrentVibe("");
    } else if (type === "brain") {
      setTeachingSelection("brain", "");
      setCurrentBrain("");
    } else if (type === "interest") {
      localStorage.removeItem("teaching_universe_vibe");
      window.dispatchEvent(new Event("storage"));
      setSelectedInterest("");
    }
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
            {/* Attachments panel (Image, File, Voice, Search) */}
            {activePanel === "attachments" && (
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


            {/* Motive panel (replaces Teaching Mode) */}
            {activePanel === "motive" && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">🎯 Motive — Why are you learning?</p>
                  <button onClick={() => setActivePanel("none")} className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center"><X size={10} className="text-muted-foreground" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-none">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { SFX.tap(); setTeachingSelection("mission", ""); setCurrentMotive(""); setActivePanel("none"); }}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                      !currentMotive ? "bg-red-500/15 text-red-400 border-red-500/40" : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
                    }`}
                  >
                    <span>🚫</span> None
                  </motion.button>
                  {MISSION_MODES.map(m => (
                    <motion.button
                      key={m.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        SFX.select();
                        setTeachingSelection("mission", m.id);
                        setCurrentMotive(m.id);
                        setActivePanel("none");
                        maybeRecook();
                      }}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                        currentMotive === m.id
                          ? "bg-agni-orange/15 text-agni-orange border-agni-orange/40"
                          : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
                      }`}
                    >
                      <span>{m.emoji}</span> {m.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Power-ups panel (one-time actions) */}
            {activePanel === "powerups" && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">⚡ Quick Actions — one-time use</p>
                  <button onClick={() => setActivePanel("none")} className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center"><X size={10} className="text-muted-foreground" /></button>
                </div>
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
                  {/* Quiz button — opens difficulty picker */}
                  {isLearnTab && exchangeCount >= 1 && onQuizReady && (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => togglePanel("quiz")}
                      disabled={isLoading}
                      className="text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r from-agni-green to-emerald-500 text-white shadow-md disabled:opacity-40 flex items-center gap-1"
                    >
                      <Zap size={10} /> Quiz Me!
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* Quiz difficulty picker */}
            {activePanel === "quiz" && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Pick Quiz Difficulty</p>
                  <button onClick={() => setActivePanel("none")} className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center"><X size={10} className="text-muted-foreground" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUIZ_DIFFICULTIES.map(q => (
                    <motion.button
                      key={q.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => { SFX.powerup("green"); setActivePanel("none"); onQuizReady?.(q.id); }}
                      disabled={isLoading}
                      className={`text-[10px] font-black px-3 py-2 rounded-xl bg-gradient-to-r ${q.color} text-white shadow-md disabled:opacity-40 flex items-center gap-1`}
                    >
                      <span>{q.emoji}</span> {q.label}
                    </motion.button>
                  ))}
                </div>
                <p className="text-[8px] text-muted-foreground/50 mt-1.5">From ☀️ warm up to ☠️ impossible — choose your challenge</p>
              </div>
            )}

            {/* Vibe panel */}
            {activePanel === "vibe" && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">🎨 Teaching Vibe — How should I teach?</p>
                  <button onClick={() => setActivePanel("none")} className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center"><X size={10} className="text-muted-foreground" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { SFX.tap(); setTeachingSelection("vibe", ""); setCurrentVibe(""); setActivePanel("none"); }}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                      !currentVibe ? "bg-red-500/15 text-red-400 border-red-500/40" : "bg-card text-muted-foreground border-border/30"
                    }`}
                  >
                    <span>🚫</span> None
                  </motion.button>
                  {TEACHING_VIBES.map(v => (
                    <motion.button
                      key={v.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        SFX.select();
                        setTeachingSelection("vibe", v.id);
                        setCurrentVibe(v.id);
                        setActivePanel("none");
                        maybeRecook();
                      }}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                        currentVibe === v.id
                          ? "bg-agni-blue/15 text-agni-blue border-agni-blue/40"
                          : "bg-card text-muted-foreground border-border/30"
                      }`}
                    >
                      <span>{v.emoji}</span> {v.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Brain level panel */}
            {activePanel === "brain" && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">🧠 Brain Level — How deep?</p>
                  <button onClick={() => setActivePanel("none")} className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center"><X size={10} className="text-muted-foreground" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-none">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { SFX.tap(); setTeachingSelection("brain", ""); setCurrentBrain(""); setActivePanel("none"); }}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                      !currentBrain ? "bg-red-500/15 text-red-400 border-red-500/40" : "bg-card text-muted-foreground border-border/30"
                    }`}
                  >
                    <span>🚫</span> None
                  </motion.button>
                  {allBrainLevelsForChat.map(b => (
                    <motion.button
                      key={b.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        SFX.select();
                        setTeachingSelection("brain", b.id);
                        setCurrentBrain(b.id);
                        setActivePanel("none");
                        maybeRecook();
                      }}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                        currentBrain === b.id
                          ? "bg-agni-purple/15 text-agni-purple border-agni-purple/40"
                          : "bg-card text-muted-foreground border-border/30"
                      }`}
                    >
                      <span>{b.emoji}</span> {b.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Interests panel (My World) */}
            {activePanel === "interests" && (
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">🌍 My World — Teach using my interests</p>
                  <button onClick={() => setActivePanel("none")} className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center"><X size={10} className="text-muted-foreground" /></button>
                </div>
                {interestCategories.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => { SFX.tap(); localStorage.removeItem("teaching_universe_vibe"); window.dispatchEvent(new Event("storage")); setSelectedInterest(""); setActivePanel("none"); }}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                          !selectedInterest ? "bg-red-500/15 text-red-400 border-red-500/40" : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
                        }`}
                      >
                        <span>🚫</span> None
                      </motion.button>
                    </div>
                    {interestCategories.map(cat => (
                      <div key={cat.id}>
                        <p className="text-[8px] font-bold text-muted-foreground mb-1">{cat.emoji} {cat.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.items.map((item) => (
                            <motion.button
                              key={item}
                              whileTap={{ scale: 0.93 }}
                              onClick={() => handleInterestSelect(cat.id, item)}
                              disabled={isLoading}
                              className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border ${
                                selectedInterest === item
                                  ? "bg-agni-pink/15 text-agni-pink border-agni-pink/40"
                                  : "bg-card text-muted-foreground border-border/30 hover:border-border/60"
                              }`}
                            >
                              <span>{cat.emoji}</span> {item}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/60 text-center py-4">
                    Set up your interests in Settings to see them here ✨
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active selection chips with ✕ — subtle bar above input */}
      <AnimatePresence>
        {hasActiveSelections && activePanel === "none" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-1.5 overflow-hidden"
          >
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {motiveInfo && (
                <motion.div layout className="shrink-0 flex items-center gap-1 bg-agni-orange/8 border border-agni-orange/15 rounded-full px-2 py-0.5">
                  <span className="text-[8px]">{motiveInfo.emoji}</span>
                  <span className="text-[8px] font-bold text-agni-orange/70">{motiveInfo.label}</span>
                  <button onClick={() => clearSelection("motive")} className="ml-0.5 opacity-50 hover:opacity-100">
                    <X size={7} className="text-agni-orange" />
                  </button>
                </motion.div>
              )}
              {vibeInfo && (
                <motion.div layout className="shrink-0 flex items-center gap-1 bg-agni-blue/8 border border-agni-blue/15 rounded-full px-2 py-0.5">
                  <span className="text-[8px]">{vibeInfo.emoji}</span>
                  <span className="text-[8px] font-bold text-agni-blue/70">{vibeInfo.label}</span>
                  <button onClick={() => clearSelection("vibe")} className="ml-0.5 opacity-50 hover:opacity-100">
                    <X size={7} className="text-agni-blue" />
                  </button>
                </motion.div>
              )}
              {brainInfo && (
                <motion.div layout className="shrink-0 flex items-center gap-1 bg-agni-purple/8 border border-agni-purple/15 rounded-full px-2 py-0.5">
                  <span className="text-[8px]">{brainInfo.emoji}</span>
                  <span className="text-[8px] font-bold text-agni-purple/70">{brainInfo.label}</span>
                  <button onClick={() => clearSelection("brain")} className="ml-0.5 opacity-50 hover:opacity-100">
                    <X size={7} className="text-agni-purple" />
                  </button>
                </motion.div>
              )}
              {selectedInterest && (
                <motion.div layout className="shrink-0 flex items-center gap-1 bg-agni-pink/8 border border-agni-pink/15 rounded-full px-2 py-0.5">
                  <span className="text-[8px]">🌍</span>
                  <span className="text-[8px] font-bold text-agni-pink/70">{selectedInterest}</span>
                  <button onClick={() => clearSelection("interest")} className="ml-0.5 opacity-50 hover:opacity-100">
                    <X size={7} className="text-agni-pink" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row with action buttons */}
      <div className="px-4 py-3 pb-6">
        {/* Action chips row — scrollable */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto scrollbar-none">
          {/* Motive button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("motive")}
            className={`shrink-0 h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
              activePanel === "motive"
                ? "bg-agni-orange/15 text-agni-orange"
                : "bg-muted/20 text-muted-foreground"
            }`}
          >
            <Target size={10} /> Motive
          </motion.button>

          {/* Actions button (one-time powerups) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("powerups")}
            className={`shrink-0 h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
              activePanel === "powerups"
                ? "bg-primary/15 text-primary"
                : "bg-muted/20 text-muted-foreground"
            }`}
          >
            <Zap size={10} /> Actions
          </motion.button>

          {/* Vibe button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("vibe")}
            className={`shrink-0 h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
              activePanel === "vibe"
                ? "bg-agni-blue/15 text-agni-blue"
                : "bg-muted/20 text-muted-foreground"
            }`}
          >
            <Palette size={10} /> Vibe
          </motion.button>

          {/* Brain button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("brain")}
            className={`shrink-0 h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
              activePanel === "brain"
                ? "bg-agni-purple/15 text-agni-purple"
                : "bg-muted/20 text-muted-foreground"
            }`}
          >
            <Brain size={10} /> Brain
          </motion.button>

          {/* My World button */}
          {interestCategories.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => togglePanel("interests")}
              className={`shrink-0 h-7 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-black transition-all ${
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
            <div className="ml-auto shrink-0 flex items-center gap-1 text-[8px] font-bold text-primary/60">
              <GraduationCap size={9} />
              <span className="truncate max-w-[80px]">{lessonTitle}</span>
            </div>
          )}
        </div>

        {/* Textarea + send */}
        <div className="flex items-end gap-2">
          {/* + attachment button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => togglePanel("attachments")}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activePanel === "attachments"
                ? "bg-primary/20 rotate-45"
                : "bg-muted/30"
            }`}
          >
            {activePanel === "attachments"
              ? <X size={14} style={{ color: accentColor }} />
              : <Plus size={14} className="text-muted-foreground" />
            }
          </motion.button>
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
