import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

interface TimelineStep {
  label: string;
  description?: string;
  emoji?: string;
}

interface TimelineCardProps {
  title?: string;
  steps: TimelineStep[];
}

export default function TimelineCard({ title, steps }: TimelineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border border-border/30 overflow-hidden"
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <GitBranch size={16} className="text-agni-orange" />
        <span className="text-[11px] font-black text-agni-orange uppercase tracking-wider">{title || "Process"}</span>
      </div>
      <div className="px-5 pb-5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-3 relative"
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-agni-orange/15 flex items-center justify-center shrink-0 z-10">
                <span className="text-[12px]">{step.emoji || `${i + 1}`}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-agni-orange/15 my-1" />
              )}
            </div>
            <div className="pb-4">
              <h5 className="text-[13px] font-black text-foreground">{step.label}</h5>
              {step.description && (
                <p className="text-[11px] text-foreground/60 mt-0.5 leading-relaxed">{step.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
