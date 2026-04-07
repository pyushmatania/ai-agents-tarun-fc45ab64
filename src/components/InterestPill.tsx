import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getSuggestionImage, getPillColor } from "@/lib/suggestionImages";

interface InterestPillProps {
  name: string;
  emoji?: string;
  categoryId: string;
  index: number;
  selected?: boolean;
  removable?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

/**
 * 🎨 Shared colorful pill component for interests/selections.
 * Used across onboarding, settings, homepage persona widget, and confirm screens.
 */
export function InterestPill({
  name,
  emoji,
  categoryId,
  index,
  selected = false,
  removable = false,
  compact = false,
  onClick,
}: InterestPillProps) {
  const pillColor = getPillColor(categoryId, index);
  const imageUrl = getSuggestionImage(name, categoryId);

  if (compact) {
    // Mini version for homepage widget, confirm summary, etc.
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="flex items-center gap-1 rounded-full px-1 py-0.5 pr-2 transition-all"
        style={{
          background: `${pillColor}20`,
          border: `1.5px solid ${pillColor}40`,
        }}
      >
        <Avatar className="w-5 h-5">
          <AvatarImage src={imageUrl} alt={name} loading="lazy" />
          <AvatarFallback className="text-[8px]" style={{ background: `${pillColor}30`, color: pillColor }}>
            {emoji || name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <span className="text-[9px] font-bold" style={{ color: pillColor }}>{name}</span>
        {removable && (
          <X size={8} style={{ color: pillColor }} className="ml-0.5 opacity-60 hover:opacity-100" />
        )}
      </motion.button>
    );
  }

  // Full-size version matching onboarding pills
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative flex items-center gap-1.5 rounded-full transition-all duration-200"
      style={{
        background: selected ? pillColor : `${pillColor}18`,
        border: `2px solid ${selected ? pillColor : `${pillColor}35`}`,
        paddingLeft: 4,
        paddingRight: selected ? 10 : 12,
        paddingTop: 4,
        paddingBottom: 4,
        boxShadow: selected ? `0 4px 12px ${pillColor}40` : "none",
      }}
    >
      <Avatar className="w-7 h-7 shrink-0 border-2" style={{ borderColor: selected ? "rgba(255,255,255,0.3)" : `${pillColor}30` }}>
        <AvatarImage src={imageUrl} alt={name} loading="lazy" />
        <AvatarFallback
          className="text-xs"
          style={{
            background: selected ? "rgba(255,255,255,0.2)" : `${pillColor}25`,
            color: selected ? "#fff" : pillColor,
            fontSize: "14px",
          }}
        >
          {emoji || "✨"}
        </AvatarFallback>
      </Avatar>

      <span
        className="text-[11px] font-extrabold whitespace-nowrap pr-1"
        style={{ color: selected ? "#fff" : "hsl(var(--foreground))" }}
      >
        {name}
      </span>

      {selected && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-1 -right-1 rounded-full bg-white flex items-center justify-center shadow-md"
          style={{ width: 18, height: 18 }}
        >
          <Check size={10} style={{ color: pillColor }} strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}
