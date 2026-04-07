import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface KeyPointsCardProps {
  title?: string;
  points: string[];
}

export default function KeyPointsCard({ title, points }: KeyPointsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-agni-green/5 border border-agni-green/20 overflow-hidden"
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <Zap size={16} className="text-agni-green" />
        <span className="text-[11px] font-black text-agni-green uppercase tracking-wider">{title || "Key Takeaways"}</span>
      </div>
      <div className="px-5 pb-5 space-y-2.5">
        {points.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-lg bg-agni-green/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-agni-green">{i + 1}</span>
            </div>
            <p className="text-[13px] font-medium text-foreground leading-relaxed">{point}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
