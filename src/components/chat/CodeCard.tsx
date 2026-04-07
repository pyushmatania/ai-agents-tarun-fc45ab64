import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Code2 } from "lucide-react";

interface CodeCardProps {
  language?: string;
  code: string;
  title?: string;
}

export default function CodeCard({ language, code, title }: CodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-[#0D1117] border border-border/20 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-agni-blue" />
          <span className="text-[11px] font-black text-agni-blue uppercase tracking-wider">
            {title || language || "Code"}
          </span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check size={12} className="text-agni-green" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-none">
        <code className="text-[12px] leading-relaxed font-mono text-foreground/90">{code}</code>
      </pre>
    </motion.div>
  );
}
