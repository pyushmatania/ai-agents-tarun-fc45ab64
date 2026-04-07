import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, Plus } from "lucide-react";

interface CustomOptionInputProps {
  categoryId: string;
  categoryLabel: string;
  accentColor?: string;
  onSave: (option: { label: string; desc: string; emoji?: string }) => void;
  compact?: boolean;
}

const EMOJI_PICKS = ["✨", "🎯", "🔥", "💡", "🧪", "🎓", "🛠️", "📊", "🌟", "⚡", "🧩", "🏆"];

const CustomOptionInput = ({ categoryId, categoryLabel, accentColor = "agni-purple", onSave, compact }: CustomOptionInputProps) => {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("✨");

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      desc: desc.trim() || `Custom ${categoryLabel} option`,
      emoji,
    });
    setLabel("");
    setDesc("");
    setEmoji("✨");
    setExpanded(false);
  };

  if (compact) {
    return (
      <AnimatePresence>
        {!expanded ? (
          <motion.button
            key="trigger"
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(true)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold border border-dashed border-${accentColor}/30 bg-${accentColor}/5 text-${accentColor} flex items-center gap-1 transition-all hover:border-${accentColor}/50`}
          >
            <Plus size={10} /> Custom
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-card border-2 border-dashed border-agni-purple/30 rounded-2xl p-3 mt-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-agni-purple uppercase tracking-wider">Custom {categoryLabel}</span>
              <button onClick={() => setExpanded(false)} className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center">
                <X size={10} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {EMOJI_PICKS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${emoji === e ? "bg-agni-purple/20 ring-2 ring-agni-purple/40" : "bg-muted/30 hover:bg-muted/60"}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Name (e.g., Startup Founder)" maxLength={40}
              className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-xs font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-purple/50 mb-1.5"
            />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe how this affects learning..."
              maxLength={200} rows={2}
              className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-[10px] font-medium text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-purple/50 resize-none mb-2"
            />
            <button onClick={handleSave} disabled={!label.trim()}
              className="w-full bg-agni-purple text-white font-black rounded-xl py-2 text-[11px] flex items-center justify-center gap-1.5 disabled:opacity-30 transition-all"
            >
              <Sparkles size={12} /> Save Custom {categoryLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full-size version (for onboarding)
  return (
    <AnimatePresence>
      {!expanded ? (
        <motion.button
          key="trigger"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setExpanded(true)}
          className="w-full p-3.5 rounded-2xl border-2 border-dashed border-agni-purple/30 bg-agni-purple/5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-agni-purple to-agni-pink flex items-center justify-center shadow-lg shrink-0">
              <Plus size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-extrabold text-foreground block">Create your own</span>
              <span className="text-[11px] text-muted-foreground">Add a custom {categoryLabel.toLowerCase()} with name & description</span>
            </div>
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full rounded-2xl border-2 border-agni-purple/40 bg-gradient-to-br from-agni-purple/5 to-agni-pink/5 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-agni-purple" />
                <span className="text-xs font-black text-agni-purple">Create Custom {categoryLabel}</span>
              </div>
              <button onClick={() => setExpanded(false)} className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center">
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>

            {/* Emoji picker */}
            <div className="mb-3">
              <p className="text-[9px] font-bold text-muted-foreground mb-1.5">Pick an emoji</p>
              <div className="flex gap-1.5 flex-wrap">
                {EMOJI_PICKS.map(e => (
                  <motion.button key={e} whileTap={{ scale: 0.85 }} onClick={() => setEmoji(e)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                      emoji === e ? "bg-agni-purple/20 ring-2 ring-agni-purple/50 shadow-md" : "bg-card border border-border/30 hover:bg-muted/60"
                    }`}
                  >
                    {e}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-2.5">
              <p className="text-[9px] font-bold text-muted-foreground mb-1">Name <span className="text-destructive">*</span></p>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                placeholder={`e.g., "Teach like a CEO" or "AI for Healthcare"`}
                maxLength={50}
                className="w-full bg-card border-2 border-border/30 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-purple/50"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <p className="text-[9px] font-bold text-muted-foreground mb-1">Description</p>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe how AGNI should use this in teaching. The more detail, the better the personalization!"
                maxLength={300} rows={3}
                className="w-full bg-card border-2 border-border/30 rounded-xl px-3 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-purple/50 resize-none leading-relaxed"
              />
              <p className="text-[8px] text-muted-foreground/50 mt-0.5 text-right">{desc.length}/300</p>
            </div>

            {/* Preview */}
            {label.trim() && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-agni-green/5 border border-agni-green/20 rounded-xl p-2.5 mb-3"
              >
                <p className="text-[9px] font-black text-agni-green mb-1">Preview</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{label}</p>
                    <p className="text-[9px] text-muted-foreground">{desc || `Custom ${categoryLabel.toLowerCase()} option`}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!label.trim()}
              className="w-full bg-gradient-to-r from-agni-purple to-agni-pink text-white font-extrabold rounded-xl py-3 text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:shadow-none transition-all"
            >
              <Check size={16} /> Save & Select
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomOptionInput;
