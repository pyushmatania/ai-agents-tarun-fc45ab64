import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles, Check, ArrowLeft, TrendingUp, Brain } from "lucide-react";
import { getPersona, savePersona, SUGGESTION_CATEGORIES, NeuralOSPersona, getSubFilters, getSubFilterCount, POPULAR_PICKS } from "@/lib/neuralOS";
import { InterestPill } from "./InterestPill";
import Agni from "./Agni";
import SmartInterestSearch from "./SmartInterestSearch";

interface MascotProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const MascotProfileModal = ({ open, onClose }: MascotProfileModalProps) => {
  const [persona, setPersona] = useState<NeuralOSPersona>(getPersona());
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [smartSearchQuery, setSmartSearchQuery] = useState("");

  useEffect(() => {
    if (open) setPersona(getPersona());
  }, [open]);

  const activeCategory = SUGGESTION_CATEGORIES.find(c => c.id === activeCategoryId);
  const currentItems = activeCategory ? ((persona[activeCategory.field] as string[]) || []) : [];

  const toggleItem = (item: string) => {
    if (!activeCategory) return;
    const field = activeCategory.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
    setPersona({ ...persona, [field]: updated });
    savePersona({ [field]: updated });
  };

  const addCustomFromSearch = () => {
    if (!searchQuery.trim() || !activeCategory) return;
    // Open smart search instead of directly adding
    setSmartSearchQuery(searchQuery.trim());
    setSmartSearchOpen(true);
  };

  const handleSmartSearchSelect = (item: { name: string; category: string; subCategory: string }) => {
    const targetCat = SUGGESTION_CATEGORIES.find(c => c.id === item.category) || activeCategory;
    if (!targetCat) return;
    const field = targetCat.field as keyof NeuralOSPersona;
    const current = (persona[field] as string[]) || [];
    if (!current.includes(item.name)) {
      const updated = [...current, item.name];
      setPersona({ ...persona, [field]: updated });
      savePersona({ [field]: updated });
    }
    setSearchQuery("");
  };

  const subFilters = activeCategory ? getSubFilters(activeCategory) : [];

  const filteredSuggestions = activeCategory
    ? activeCategory.suggestions.filter(s => {
        const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.tag && s.tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchSub = !activeSubFilter || (s.tag && s.tag.toLowerCase().startsWith(activeSubFilter.toLowerCase()));
        return matchSearch && matchSub;
      })
    : [];

  const noExactMatch = searchQuery.trim() && activeCategory &&
    !activeCategory.suggestions.some(s => s.name.toLowerCase() === searchQuery.trim().toLowerCase()) &&
    !currentItems.includes(searchQuery.trim());

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
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 border-b border-border flex items-center gap-3">
            <div className="w-11 h-11 shrink-0">
              <Agni expression="happy" size={44} animate={false} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-black text-foreground">My Persona</h2>
              <p className="text-[10px] text-muted-foreground">Edit anytime — AGNI learns from this</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {!activeCategory ? (
              <div className="p-4 space-y-2">
                <p className="text-[10px] text-muted-foreground font-semibold mb-1">Tap a category to add or edit items</p>
                {SUGGESTION_CATEGORIES.map((cat) => {
                  const items = ((persona[cat.field] as string[]) || []);
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setActiveCategoryId(cat.id); setActiveSubFilter(null); setSearchQuery(""); }}
                      className="w-full bg-muted/40 hover:bg-muted/70 border border-border/60 rounded-2xl p-3.5 flex items-center gap-3 transition-colors text-left"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-card flex items-center justify-center text-xl shadow-sm">
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-foreground">{cat.label}</p>
                        {items.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {items.slice(0, 3).map((item, idx) => (
                              <InterestPill key={item} name={item} categoryId={cat.id} index={idx} compact />
                            ))}
                            {items.length > 3 && <span className="text-[8px] font-bold text-muted-foreground/60 self-center">+{items.length - 3}</span>}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground truncate">{cat.description}</p>
                        )}
                      </div>
                      {items.length > 0 && (
                        <span className="shrink-0 text-[9px] font-black bg-agni-green/15 text-agni-green px-2 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Sub-header */}
                <div className="px-4 pt-3 pb-2 border-b border-border bg-card/50">
                  <button onClick={() => { setActiveCategoryId(null); setActiveSubFilter(null); setSearchQuery(""); }} className="text-[11px] text-agni-green font-bold mb-2 flex items-center gap-1">
                    <ArrowLeft size={12} /> All categories
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{activeCategory.emoji}</span>
                    <div>
                      <h3 className="text-sm font-black text-foreground">{activeCategory.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{activeCategory.description}</p>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && noExactMatch) addCustomFromSearch(); }}
                      placeholder={`Search or add custom ${activeCategory.label.toLowerCase()}...`}
                      className="w-full bg-muted/60 border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-agni-green/50 transition-colors"
                    />
                  </div>

                  {noExactMatch && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-[10px] text-agni-green font-bold">
                      ✨ Add "<span className="text-foreground">{searchQuery.trim()}</span>" — press Enter
                    </motion.p>
                  )}

                  {/* Sub-filter chips */}
                  {subFilters.length > 0 && !searchQuery && (
                    <div className="flex gap-1 overflow-x-auto scrollbar-none mt-2">
                      <button
                        onClick={() => setActiveSubFilter(null)}
                        className={`shrink-0 text-[8px] font-extrabold px-2 py-1 rounded-full transition-all flex items-center gap-0.5 ${
                          !activeSubFilter ? "bg-agni-green text-white" : "bg-card border border-border/30 text-muted-foreground"
                        }`}
                      >
                        All
                        <span className={`text-[7px] font-black rounded-full px-1 min-w-[14px] text-center ${!activeSubFilter ? "bg-white/25 text-white" : "bg-muted/50"}`}>
                          {activeCategory.suggestions.length}
                        </span>
                      </button>
                      {subFilters.map(tag => {
                        const count = getSubFilterCount(activeCategory, tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => setActiveSubFilter(activeSubFilter === tag ? null : tag)}
                            className={`shrink-0 text-[8px] font-extrabold px-2 py-1 rounded-full transition-all flex items-center gap-0.5 ${
                              activeSubFilter === tag ? "bg-agni-blue text-white" : "bg-card border border-border/30 text-muted-foreground"
                            }`}
                          >
                            {tag}
                            <span className={`text-[7px] font-black rounded-full px-1 min-w-[14px] text-center ${activeSubFilter === tag ? "bg-white/25 text-white" : "bg-muted/50"}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Select All for sub-filter */}
                  {activeSubFilter && !searchQuery && (
                    <button
                      onClick={() => {
                        const subItems = activeCategory.suggestions
                          .filter(s => s.tag && s.tag.toLowerCase().startsWith(activeSubFilter.toLowerCase()))
                          .map(s => s.name);
                        const allSelected = subItems.every(item => currentItems.includes(item));
                        const field = activeCategory.field as keyof NeuralOSPersona;
                        const updated = allSelected
                          ? currentItems.filter(x => !subItems.includes(x))
                          : [...new Set([...currentItems, ...subItems])];
                        setPersona({ ...persona, [field]: updated });
                        savePersona({ [field]: updated });
                      }}
                      className="text-[8px] font-extrabold text-agni-blue flex items-center gap-0.5 mt-1.5"
                    >
                      {(() => {
                        const subItems = activeCategory.suggestions
                          .filter(s => s.tag && s.tag.toLowerCase().startsWith(activeSubFilter.toLowerCase()))
                          .map(s => s.name);
                        const allSelected = subItems.every(item => currentItems.includes(item));
                        return allSelected ? <><X size={8} /> Deselect all {activeSubFilter}</> : <><Check size={8} /> Select all {activeSubFilter}</>;
                      })()}
                    </button>
                  )}
                </div>

                {/* Selected items */}
                {currentItems.length > 0 && (
                  <div className="px-4 py-2 border-b border-border/50 bg-agni-green/5">
                    <p className="text-[9px] font-black text-agni-green uppercase tracking-wider mb-1.5">
                      ✓ {currentItems.length} selected
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto">
                      {currentItems.map((item, idx) => (
                        <InterestPill
                          key={item}
                          name={item}
                          categoryId={activeCategory.id}
                          index={idx}
                          compact
                          removable
                          onClick={() => toggleItem(item)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Picks */}
                {!searchQuery && !activeSubFilter && POPULAR_PICKS[activeCategory.id]?.length > 0 && (
                  <div className="px-4 pt-2 pb-1">
                    <div className="flex items-center gap-1 mb-1.5">
                      <TrendingUp size={10} className="text-agni-orange" />
                      <span className="text-[8px] font-black text-agni-orange uppercase tracking-wider">Popular Picks</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_PICKS[activeCategory.id].filter(name => activeCategory.suggestions.some(s => s.name === name)).map((name, idx) => {
                        const suggestion = activeCategory.suggestions.find(s => s.name === name);
                        return (
                          <div key={name} className="relative">
                            <InterestPill
                              name={name}
                              emoji={suggestion?.emoji}
                              categoryId={activeCategory.id}
                              index={idx}
                              selected={currentItems.includes(name)}
                              onClick={() => toggleItem(name)}
                            />
                            <span className="absolute -top-1 -right-1 text-[6px]">🔥</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggestions — InterestPill grid */}
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSuggestions.map((s, idx) => (
                      <InterestPill
                        key={s.name}
                        name={s.name}
                        emoji={s.emoji}
                        categoryId={activeCategory.id}
                        index={idx}
                        selected={currentItems.includes(s.name)}
                        onClick={() => toggleItem(s.name)}
                      />
                    ))}
                  </div>

                  {filteredSuggestions.length === 0 && searchQuery && (
                    <div className="text-center py-8">
                      <p className="text-2xl mb-2">🔍</p>
                      <p className="text-xs text-muted-foreground">No matches found</p>
                      <p className="text-[10px] text-agni-green font-bold mt-1">Press Enter to add "{searchQuery.trim()}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!activeCategory && (
            <div className="border-t border-border p-3 bg-card">
              <button
                onClick={onClose}
                className="w-full bg-agni-green text-white font-black rounded-2xl py-3 text-sm flex items-center justify-center gap-2 shadow-btn-3d active:shadow-btn-3d-pressed active:translate-y-0.5 transition-all"
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
