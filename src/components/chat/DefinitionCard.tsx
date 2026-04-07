import { motion } from "framer-motion";
import { BookMarked } from "lucide-react";

interface DefinitionCardProps {
  term: string;
  definition: string;
  emoji?: string;
}

export default function DefinitionCard({ term, definition, emoji }: DefinitionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-gradient-to-br from-agni-purple/10 to-agni-pink/5 border border-agni-purple/20 p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <BookMarked size={14} className="text-agni-purple" />
        <span className="text-[9px] font-black text-agni-purple uppercase tracking-wider">Definition</span>
      </div>
      <h4 className="text-base font-black text-foreground mb-2">
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {term}
      </h4>
      <p className="text-[13px] text-foreground/80 leading-relaxed">{definition}</p>
    </motion.div>
  );
}
