import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2, X, Check, Brain, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InterestPill } from "./InterestPill";
import { getSuggestionImage } from "@/lib/suggestionImages";

interface AIResult {
  name: string;
  category: string;
  subCategory: string;
  description: string;
  author?: string;
  year?: string;
  imageSearchQuery: string;
  confidence: number;
}

interface AISearchResponse {
  results: AIResult[];
  clarifyingQuestion?: string | null;
  suggestions?: string[];
}

interface SmartInterestSearchProps {
  query: string;
  currentCategory: string;
  onSelect: (item: { name: string; category: string; subCategory: string; imageUrl?: string; metadata?: Record<string, string> }) => void;
  onClose: () => void;
  open: boolean;
}

const CATEGORY_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  shows: { emoji: "🎬", label: "Shows & Movies", color: "#FF4B91" },
  sports: { emoji: "⚽", label: "Sports", color: "#FF9600" },
  music: { emoji: "🎵", label: "Music", color: "#CE82FF" },
  gaming: { emoji: "🎮", label: "Gaming", color: "#1CB0F6" },
  books: { emoji: "📚", label: "Books & Authors", color: "#58CC02" },
  hobbies: { emoji: "🎨", label: "Hobbies", color: "#FFC800" },
  news: { emoji: "📰", label: "News Sources", color: "#FF4B4B" },
  curious: { emoji: "🔮", label: "Curiosity", color: "#CE82FF" },
};

const SmartInterestSearch = ({ query, currentCategory, onSelect, onClose, open }: SmartInterestSearchProps) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-interest-search", {
        body: { query: query.trim(), currentCategory },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setResults(data as AISearchResponse);
    } catch (e) {
      console.error("AI search error:", e);
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Auto-search on open
  if (open && !searched && !loading) {
    doSearch();
  }

  const handleSelect = (r: AIResult) => {
    onSelect({
      name: r.name,
      category: r.category,
      subCategory: r.subCategory,
      imageUrl: undefined, // Will use getSuggestionImage fallback
      metadata: {
        description: r.description,
        ...(r.author ? { author: r.author } : {}),
        ...(r.year ? { year: r.year } : {}),
      },
    });
    onClose();
  };

  const handleAddAsIs = () => {
    onSelect({
      name: query.trim(),
      category: currentCategory,
      subCategory: "",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="bg-card border-t sm:border border-border w-full max-w-md sm:rounded-3xl rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agni-purple to-agni-pink flex items-center justify-center shadow-lg">
              <Brain size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-foreground">AI Search: "{query}"</h3>
              <p className="text-[10px] text-muted-foreground">Finding the exact match across all categories</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center">
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 size={28} className="text-agni-purple" />
                </motion.div>
                <p className="text-xs font-bold text-muted-foreground mt-3">AGNI is searching...</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Checking books, shows, music & more</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-destructive" />
                  <span className="text-xs font-bold text-destructive">Search failed</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{error}</p>
              </div>
            )}

            {results && (
              <>
                {/* Clarifying question */}
                {results.clarifyingQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-agni-gold/10 border border-agni-gold/20 rounded-2xl p-3 mb-3"
                  >
                    <p className="text-[11px] font-bold text-agni-gold">🤔 {results.clarifyingQuestion}</p>
                  </motion.div>
                )}

                {/* Results */}
                {results.results.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                      {results.results.length === 1 ? "Best match" : "Pick the right one"}
                    </p>
                    {results.results.map((r, i) => {
                      const catMeta = CATEGORY_MAP[r.category] || CATEGORY_MAP.curious;
                      const isDiffCategory = r.category !== currentCategory;
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelect(r)}
                          className="w-full text-left bg-muted/30 hover:bg-muted/60 border-2 border-border/50 hover:border-agni-green/40 rounded-2xl p-3.5 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${catMeta.color}15` }}>
                              {catMeta.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-black text-foreground">{r.name}</span>
                                {r.confidence >= 0.9 && (
                                  <span className="text-[7px] font-bold bg-agni-green/20 text-agni-green px-1.5 py-0.5 rounded-full">BEST MATCH</span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{r.description}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className="text-[8px] font-black px-2 py-0.5 rounded-full"
                                  style={{ background: `${catMeta.color}20`, color: catMeta.color }}
                                >
                                  {catMeta.emoji} {catMeta.label}
                                </span>
                                {r.subCategory && (
                                  <span className="text-[8px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{r.subCategory}</span>
                                )}
                                {r.year && (
                                  <span className="text-[8px] text-muted-foreground/60">{r.year}</span>
                                )}
                              </div>
                              {isDiffCategory && (
                                <p className="text-[9px] font-bold text-agni-orange mt-1.5 flex items-center gap-1">
                                  <ArrowRight size={9} />
                                  Will be added to {catMeta.label}
                                </p>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-agni-green/15 flex items-center justify-center shrink-0">
                              <Check size={14} className="text-agni-green" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Related suggestions */}
                {results.suggestions && results.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-2">Related suggestions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {results.suggestions.map((s, i) => (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            onSelect({ name: s, category: currentCategory, subCategory: "" });
                            onClose();
                          }}
                          className="text-[10px] font-bold text-muted-foreground bg-muted/40 border border-border/30 rounded-full px-3 py-1.5 hover:bg-agni-purple/10 hover:text-agni-purple transition-colors"
                        >
                          + {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fallback: add as-is */}
            {searched && !loading && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddAsIs}
                className="w-full mt-4 p-3 rounded-2xl border-2 border-dashed border-agni-gold/30 bg-agni-gold/5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-agni-gold to-agni-orange flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">Just add "{query.trim()}" as-is</p>
                    <p className="text-[9px] text-muted-foreground">Skip AI matching, add as custom interest</p>
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartInterestSearch;
