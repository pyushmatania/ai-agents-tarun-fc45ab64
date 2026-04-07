import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ExampleCardProps {
  title?: string;
  content: string;
  type?: "real-world" | "analogy" | "scenario";
}

export default function ExampleCard({ title, content, type = "real-world" }: ExampleCardProps) {
  const configs = {
    "real-world": { icon: "🏗️", color: "agni-orange", label: "Real-World Example" },
    "analogy": { icon: "🎯", color: "agni-purple", label: "Analogy" },
    "scenario": { icon: "🎬", color: "agni-blue", label: "Scenario" },
  };
  const cfg = configs[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border/30 overflow-hidden"
      style={{ background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)` }}
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-2.5">
        <span className="text-lg">{cfg.icon}</span>
        <div>
          <span className={`text-[9px] font-black uppercase tracking-wider text-${cfg.color}`}>{cfg.label}</span>
          {title && <h4 className="text-sm font-black text-foreground">{title}</h4>}
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed [&_p]:mb-2 [&_strong]:text-agni-orange">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
