import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

interface ComparisonCardProps {
  title?: string;
  left: { label: string; points: string[] };
  right: { label: string; points: string[] };
}

export default function ComparisonCard({ title, left, right }: ComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border border-border/30 overflow-hidden"
    >
      <div className="px-5 pt-4 pb-3 flex items-center gap-2">
        <ArrowLeftRight size={16} className="text-agni-blue" />
        <span className="text-[11px] font-black text-agni-blue uppercase tracking-wider">{title || "Comparison"}</span>
      </div>
      <div className="px-4 pb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-agni-green/5 border border-agni-green/15 p-3.5">
          <h5 className="text-[11px] font-black text-agni-green mb-2">{left.label}</h5>
          <ul className="space-y-1.5">
            {left.points.map((p, i) => (
              <li key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                <span className="text-agni-green mt-0.5">✦</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-agni-purple/5 border border-agni-purple/15 p-3.5">
          <h5 className="text-[11px] font-black text-agni-purple mb-2">{right.label}</h5>
          <ul className="space-y-1.5">
            {right.points.map((p, i) => (
              <li key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                <span className="text-agni-purple mt-0.5">✦</span> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
