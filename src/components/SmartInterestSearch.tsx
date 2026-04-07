import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const skipAutocompleteRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setResults(null);
      setError(null);
      setLoading(false);
      lastSearchedQuery.current = "";
      return;
    }

    skipAutocompleteRef.current = true;
    setLiveQuery(query);

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [query, open]);

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

  useEffect(() => {
    if (!open) return;
    if (skipAutocompleteRef.current) {
      skipAutocompleteRef.current = false;
      return;
    }

    const trimmed = liveQuery.trim();
    if (!trimmed || trimmed.length < 2) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(trimmed);
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [liveQuery, open, doSearch]);

  const handleManualSearch = useCallback(() => {
    const trimmed = liveQuery.trim();
    if (trimmed) {
      lastSearchedQuery.current = "";
      doSearch(trimmed);
    }
  }, [liveQuery, doSearch]);

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

  if (!open || typeof document === "undefined") return null;

  const catMeta = CATEGORY_MAP[currentCategory] || CATEGORY_MAP.curious;

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-background"
        style={{ height: "100dvh" }}
      >
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 pb-2 pt-3 shrink-0">
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
            <X size={16} className="text-foreground" />
          </button>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              ref={inputRef}
              type="text"
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleManualSearch();
                }
              }}
              placeholder={`Search ${catMeta.label}...`}
              autoFocus
              className="w-full rounded-xl border border-border/30 bg-muted/30 py-2.5 pl-9 pr-16 text-sm font-bold text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-agni-purple/40 focus:outline-none"
            />
            {loading ? (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-agni-purple" />
            ) : (
              <button
                onClick={handleManualSearch}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-agni-purple"
              >
                <ArrowRight size={14} className="text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-1 pt-2 shrink-0">
          <span className="rounded-full px-2.5 py-1 text-[9px] font-black" style={{ background: `${catMeta.color}20`, color: catMeta.color }}>
            {catMeta.emoji} {catMeta.label}
          </span>
          {liveQuery.trim() && (
            <span className="text-[9px] text-muted-foreground">
              {loading ? "Searching with AI..." : results ? `${results.results.length} result${results.results.length !== 1 ? "s" : ""}` : "Start typing to auto-search"}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 scrollbar-none overscroll-contain">
          {loading && !results && (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={32} className="text-agni-purple" />
              </motion.div>
              <p className="mt-4 text-xs font-bold text-muted-foreground">AGNI is searching...</p>
              <p className="mt-1 text-[10px] text-muted-foreground/60">Finding matches with smart prediction</p>
            </div>
          )}

          {!loading && !results && !error && !liveQuery.trim() && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-agni-purple/20 to-agni-pink/20">
                <Brain size={28} className="text-agni-purple" />
              </div>
              <p className="mb-1 text-sm font-bold text-foreground">Smart AI Search</p>
              <p className="max-w-[240px] text-[11px] text-muted-foreground">
                Start typing and AGNI will autocomplete with typo-fix and predictive matching
              </p>
            </div>
          )}

          {error && (
            <div className="mb-3 mt-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-destructive" />
                <span className="text-xs font-bold text-destructive">Search failed</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{error}</p>
              <button
                onClick={() => {
                  lastSearchedQuery.current = "";
                  doSearch(liveQuery);
                }}
                className="mt-2 text-[10px] font-bold text-agni-purple underline"
              >
                Retry
              </button>
            </div>
          )}

          {results && (
            <>
              {results.clarifyingQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 mt-2 rounded-2xl border border-agni-gold/20 bg-agni-gold/10 p-3"
                >
                  <p className="text-[11px] font-bold text-agni-gold">🤔 {results.clarifyingQuestion}</p>
                </motion.div>
              )}

              {results.results.length > 0 && (
                <div className="mt-2 space-y-2.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
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
                        className="w-full rounded-2xl border-2 border-border/50 bg-muted/30 p-3.5 text-left transition-all hover:border-agni-green/40 hover:bg-muted/60"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 shrink-0 rounded-xl border-2" style={{ borderColor: `${rCatMeta.color}30` }}>
                            <AvatarImage src={getSuggestionImage(r.name, r.category)} alt={r.name} className="rounded-xl object-cover" />
                            <AvatarFallback className="rounded-xl text-2xl" style={{ background: `${rCatMeta.color}15` }}>
                              {rCatMeta.emoji}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex items-center gap-2">
                              <span className="text-sm font-black text-foreground">{r.name}</span>
                              {r.confidence >= 0.9 && (
                                <span className="rounded-full bg-agni-green/20 px-1.5 py-0.5 text-[7px] font-bold text-agni-green">BEST MATCH</span>
                              )}
                            </div>
                            <p className="text-[10px] leading-relaxed text-muted-foreground">{r.description}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="rounded-full px-2 py-0.5 text-[8px] font-black" style={{ background: `${rCatMeta.color}20`, color: rCatMeta.color }}>
                                {rCatMeta.emoji} {rCatMeta.label}
                              </span>
                              {r.subCategory && (
                                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[8px] font-bold text-muted-foreground">{r.subCategory}</span>
                              )}
                              {r.year && <span className="text-[8px] text-muted-foreground/60">{r.year}</span>}
                            </div>
                            {isDiffCategory && (
                              <p className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-agni-orange">
                                <ArrowRight size={9} />
                                Will be added to {rCatMeta.label}
                              </p>
                            )}
                          </div>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-agni-green/15">
                            <Check size={14} className="text-agni-green" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {results.suggestions && results.suggestions.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Related suggestions</p>
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
                        className="rounded-full border border-border/30 bg-muted/40 px-3 py-1.5 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-agni-purple/10 hover:text-agni-purple"
                      >
                        + {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && liveQuery.trim() && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddAsIs}
              className="mt-5 w-full rounded-2xl border-2 border-dashed border-agni-gold/30 bg-agni-gold/5 p-3.5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-agni-gold to-agni-orange shadow-lg">
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

  return createPortal(content, document.body);
};

export default SmartInterestSearch;
