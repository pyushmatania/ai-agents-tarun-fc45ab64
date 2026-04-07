import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Search, Sparkles, Check } from "lucide-react";
import { getPersona, savePersona, SUGGESTION_CATEGORIES, NeuralOSPersona } from "@/lib/neuralOS";
import BotIllustration from "./illustrations/BotIllustration";

interface MascotProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const MascotProfileModal = ({ open, onClose }: MascotProfileModalProps) => {
  const [persona, setPersona] = useState<NeuralOSPersona>(getPersona());
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customInput, setCustomInput] = useState("");

  const activeCategory = SUGGESTION_CATEGORIES.find(c => c.id === activeCategoryId);
  const currentItems = activeCategory ? ((persona[activeCategory.field] as string[]) || []) : [];

  const toggleItem = (item: string) => {
    if (!activeCategory) return;
    const field = activeCategory.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
    const newPersona = { ...persona, [field]: updated };
    setPersona(newPersona);
    savePersona({ [field]: updated });
  };

  const addCustom = () => {
    if (!customInput.trim() || !activeCategory) return;
    const field = activeCategory.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    if (current.includes(customInput.trim())) return;
    const updated = [...current, customInput.trim()];
    const newPersona = { ...persona, [field]: updated };
    setPersona(newPersona);
    savePersona({ [field]: updated });
    setCustomInput("");
  };

  const filteredSuggestions = activeCategory
    ? activeCategory.suggestions.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tag && s.tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-card border-t sm:border border-border w-full max-w-md sm:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2">
            <div className="w-12 h-1 bg-border rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pt-3 pb-4 border-b border-border flex items-center gap-3">
            <div className="w-12 h-12 shrink-0">
              <BotIllustration size={48} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground">My Persona</h2>
              <p className="text-xs text-muted-foreground">
                Edit anytime — I learn from this
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {!activeCategory ? (
              /* CATEGORY GRID */
              <div className="p-5 space-y-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Tap a category to add or edit items
                </p>
                {SUGGESTION_CATEGORIES.map((cat) => {
                  const items = ((persona[cat.field] as string[]) || []);
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className="w-full bg-muted/50 hover:bg-muted border border-border rounded-2xl p-4 flex items-center gap-3 transition-colors text-left"
                    >
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-card flex items-center justify-center text-2xl">
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground">{cat.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {items.length > 0 ? items.slice(0, 3).join(", ") + (items.length > 3 ? `, +${items.length - 3} more` : "") : cat.description}
                        </p>
                      </div>
                      {items.length > 0 && (
                        <span className="shrink-0 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {items.length}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* SUGGESTION GRID for active category */
              <div className="flex flex-col h-full">
                {/* Sub-header */}
                <div className="px-5 pt-4 pb-3 border-b border-border">
                  <button
                    onClick={() => { setActiveCategoryId(null); setSearchQuery(""); setCustomInput(""); }}
                    className="text-xs text-primary font-semibold mb-2"
                  >
                    ← All categories
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCategory.emoji}</span>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{activeCategory.label}</h3>
                      <p className="text-[11px] text-muted-foreground">{activeCategory.description}</p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mt-3 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search suggestions..."
                      className="w-full bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {/* Selected count */}
                  {currentItems.length > 0 && (
                    <p className="mt-2 text-[11px] text-primary font-semibold">
                      ✓ {currentItems.length} selected
                    </p>
                  )}
                </div>

                {/* Suggestions grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {filteredSuggestions.map((s) => {
                      const selected = currentItems.includes(s.name);
                      return (
                        <motion.button
                          key={s.name}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleItem(s.name)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all relative ${
                            selected
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/50 border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          {selected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check size={11} className="text-primary-foreground" strokeWidth={3} />
                            </div>
                          )}
                          <div className="text-lg mb-1">{s.emoji || "✨"}</div>
                          <div className="text-xs font-bold text-foreground leading-tight pr-4">{s.name}</div>
                          {s.tag && (
                            <div className="text-[9px] text-muted-foreground mt-0.5">{s.tag}</div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Custom items already added (not in suggestions) */}
                  {currentItems.filter(i => !activeCategory.suggestions.find(s => s.name === i)).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Your custom adds</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentItems
                          .filter(i => !activeCategory.suggestions.find(s => s.name === i))
                          .map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleItem(item)}
                              className="bg-primary/10 border border-primary text-primary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                            >
                              {item}
                              <X size={10} />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom add input — sticky at bottom */}
                <div className="border-t border-border bg-card p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
                      placeholder={`Add your own ${activeCategory.label.toLowerCase()}...`}
                      className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={addCustom}
                      disabled={!customInput.trim()}
                      className="bg-primary text-primary-foreground rounded-xl px-3 disabled:opacity-30"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!activeCategory && (
            <div className="border-t border-border p-4 bg-card">
              <button
                onClick={onClose}
                className="w-full bg-primary text-primary-foreground font-bold rounded-2xl py-3 text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                Done — Apply to my lessons
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MascotProfileModal;
