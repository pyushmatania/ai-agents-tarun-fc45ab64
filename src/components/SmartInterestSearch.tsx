import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2, X, Check, Brain, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSuggestionImage } from "@/lib/suggestionImages";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [liveQuery, setLiveQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSearchedQuery = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLiveQuery(query);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setResults(null);
      setError(null);
      setLoading(false);
      lastSearchedQuery.current = "";
    }
  }, [open]);

  const doSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed === lastSearchedQuery.current) return;
    
    lastSearchedQuery.current = trimmed;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-interest-search", {
        body: { query: trimmed, currentCategory },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setResults(data as AISearchResponse);
    } catch (e) {
      console.error("AI search error:", e);
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  // Auto-search on open with initial query
  useEffect(() => {
    if (open && query.trim()) {
      doSearch(query);
    }
  }, [open]);

  // Manual search: only triggered by pressing send/enter
  const handleManualSearch = useCallback(() => {
    const trimmed = liveQuery.trim();
    if (trimmed) {
      // Force re-search even if same query
      lastSearchedQuery.current = "";
      doSearch(trimmed);
    } else if (results) {
      // Blank query + press send → keep showing last results (iterate)
      // Do nothing, results stay visible
    }
  }, [liveQuery, doSearch, results]);

  const handleSelect = (r: AIResult) => {
    onSelect({
      name: r.name,
      category: r.category,
      subCategory: r.subCategory,
      imageUrl: undefined,
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
      name: liveQuery.trim(),
      category: currentCategory,
      subCategory: "",
    });
    onClose();
  };

  if (!open) return null;

  const catMeta = CATEGORY_MAP[currentCategory] || CATEGORY_MAP.curious;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-border bg-card">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
            <X size={16} className="text-foreground" />
          </button>
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              ref={inputRef}
              type="text"
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
              placeholder={`Search ${catMeta.label}...`}
              autoFocus
              className="w-full pl-9 pr-10 py-2.5 bg-muted/30 border border-border/30 rounded-xl text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-agni-purple/40 transition-colors"
            />
            {loading && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-agni-purple animate-spin" />
            )}
          </div>
        </div>

        {/* Category badge */}
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full" style={{ background: `${catMeta.color}20`, color: catMeta.color }}>
            {catMeta.emoji} {catMeta.label}
          </span>
          {liveQuery.trim() && (
            <span className="text-[9px] text-muted-foreground">
              {loading ? "Searching with AI..." : results ? `${results.results.length} result${results.results.length !== 1 ? "s" : ""}` : "Type to search"}
            </span>
          )}
        </div>

        {/* Content — full scrollable area */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-none">
          {/* Loading state */}
          {loading && !results && (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={32} className="text-agni-purple" />
              </motion.div>
              <p className="text-xs font-bold text-muted-foreground mt-4">AGNI is searching...</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Finding matches with smart prediction</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !results && !error && !liveQuery.trim() && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agni-purple/20 to-agni-pink/20 flex items-center justify-center mb-4">
                <Brain size={28} className="text-agni-purple" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">Smart AI Search</p>
              <p className="text-[11px] text-muted-foreground max-w-[240px]">
                Start typing and AI will find matches instantly — even with typos or partial names
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-3 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-destructive" />
                <span className="text-xs font-bold text-destructive">Search failed</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{error}</p>
              <button
                onClick={() => { lastSearchedQuery.current = ""; doSearch(liveQuery); }}
                className="mt-2 text-[10px] font-bold text-agni-purple underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Results */}
          {results && (
            <>
              {results.clarifyingQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-agni-gold/10 border border-agni-gold/20 rounded-2xl p-3 mb-3 mt-2"
                >
                  <p className="text-[11px] font-bold text-agni-gold">🤔 {results.clarifyingQuestion}</p>
                </motion.div>
              )}

              {results.results.length > 0 && (
                <div className="space-y-2.5 mt-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                    {results.results.length === 1 ? "Best match" : "Pick the right one"}
                  </p>
                  {results.results.map((r, i) => {
                    const rCatMeta = CATEGORY_MAP[r.category] || CATEGORY_MAP.curious;
                    const isDiffCategory = r.category !== currentCategory;
                    return (
                      <motion.button
                        key={`${r.name}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(r)}
                        className="w-full text-left bg-muted/30 hover:bg-muted/60 border-2 border-border/50 hover:border-agni-green/40 rounded-2xl p-3.5 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12 rounded-xl shrink-0 border-2" style={{ borderColor: `${rCatMeta.color}30` }}>
                            <AvatarImage src={getSuggestionImage(r.name, r.category)} alt={r.name} className="object-cover rounded-xl" />
                            <AvatarFallback className="rounded-xl text-2xl" style={{ background: `${rCatMeta.color}15` }}>
                              {rCatMeta.emoji}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-black text-foreground">{r.name}</span>
                              {r.confidence >= 0.9 && (
                                <span className="text-[7px] font-bold bg-agni-green/20 text-agni-green px-1.5 py-0.5 rounded-full">BEST MATCH</span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{r.description}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span
                                className="text-[8px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: `${rCatMeta.color}20`, color: rCatMeta.color }}
                              >
                                {rCatMeta.emoji} {rCatMeta.label}
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
                                Will be added to {rCatMeta.label}
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
                <div className="mt-5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-2">Related suggestions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {results.suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
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
          {!loading && liveQuery.trim() && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddAsIs}
              className="w-full mt-5 p-3.5 rounded-2xl border-2 border-dashed border-agni-gold/30 bg-agni-gold/5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-agni-gold to-agni-orange flex items-center justify-center shadow-lg shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">Just add "{liveQuery.trim()}" as-is</p>
                  <p className="text-[9px] text-muted-foreground">Skip AI matching, add as custom interest</p>
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartInterestSearch;
