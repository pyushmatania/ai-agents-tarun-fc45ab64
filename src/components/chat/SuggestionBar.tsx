import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Sparkles } from "lucide-react";

interface SuggestionBarProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  color?: string;
  disabled?: boolean;
}

export default function SuggestionBar({ suggestions, onSelect, color = "#58CC02", disabled }: SuggestionBarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      <button onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 mb-1.5 text-[9px] font-black text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <Sparkles size={10} style={{ color }} />
        <span>AI Suggestions</span>
        <ChevronUp size={10} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => !disabled && onSelect(s)}
                  disabled={disabled}
                  className="shrink-0 text-[11px] font-bold px-4 py-2 rounded-2xl border bg-card/50 text-foreground/80 hover:text-foreground transition-all disabled:opacity-40"
                  style={{ borderColor: `${color}25` }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
